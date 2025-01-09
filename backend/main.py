from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import uuid
import os
import shutil
from datetime import datetime
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import FAISS
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="PDF Chatbot API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models for request/response
class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: datetime = None

class ChatSession(BaseModel):
    session_id: str
    messages: List[ChatMessage] = []
    pdf_files: List[str] = []

# In-memory storage for sessions
sessions: Dict[str, ChatSession] = {}

# Configuration
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Environment variables
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
print(f"GEMINI_API_KEY: {GEMINI_API_KEY}")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is not set")

# Initialize Gemini
genai.configure(api_key=GEMINI_API_KEY)
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001",
    google_api_key=GEMINI_API_KEY
)
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=GEMINI_API_KEY,
    temperature=0.2
)

# Session-specific FAISS stores
faiss_stores: Dict[str, FAISS] = {}

def get_session_dir(session_id: str) -> str:
    session_dir = os.path.join(UPLOAD_DIR, session_id)
    os.makedirs(session_dir, exist_ok=True)
    return session_dir

@app.post("/sessions")
async def create_session():
    session_id = str(uuid.uuid4())
    sessions[session_id] = ChatSession(session_id=session_id)
    return {"session_id": session_id}

@app.post("/sessions/{session_id}/upload")
async def upload_files(
    session_id: str,
    files: List[UploadFile] = File(...)
):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session_dir = get_session_dir(session_id)
    uploaded_files = []
    
    for file in files:
        if not file.filename.endswith('.pdf'):
            continue
            
        file_path = os.path.join(session_dir, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        uploaded_files.append(file_path)
        sessions[session_id].pdf_files.append(file_path)
    
    # Process PDFs and create FAISS store
    text_docs = []
    for pdf_path in uploaded_files:
        loader = PyPDFLoader(pdf_path)
        text_docs.extend(loader.load())
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    chunks = text_splitter.split_documents(text_docs)
    
    if chunks:
        faiss_stores[session_id] = FAISS.from_documents(chunks, embeddings)
    
    return {"message": f"Successfully uploaded {len(uploaded_files)} files"}

@app.post("/sessions/{session_id}/chat")
async def chat(
    session_id: str,
    message: ChatMessage
):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session_id not in faiss_stores:
        raise HTTPException(status_code=400, detail="No documents uploaded for this session")
    
    # Create QA chain
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=faiss_stores[session_id].as_retriever(search_kwargs={'k': 3})
    )
    
    # Get response
    try:
        response = qa_chain(message.content)
        
        # Add message and response to chat history
        message.timestamp = datetime.now()
        sessions[session_id].messages.append(message)
        
        bot_message = ChatMessage(
            role="assistant",
            content=response['result'],
            timestamp=datetime.now()
        )
        sessions[session_id].messages.append(bot_message)
        
        return bot_message
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sessions/{session_id}/history")
async def get_chat_history(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return sessions[session_id].messages

@app.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Clean up uploaded files
    session_dir = get_session_dir(session_id)
    if os.path.exists(session_dir):
        shutil.rmtree(session_dir)
    
    # Clean up session data
    del sessions[session_id]
    if session_id in faiss_stores:
        del faiss_stores[session_id]
    
    return {"message": "Session deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)