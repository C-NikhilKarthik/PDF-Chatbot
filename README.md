# **PDF Chatbot**

The **PDF Chatbot** is an AI-powered application that allows users to upload PDF files, interact with the content by asking context-specific questions, and receive detailed, accurate responses in real-time. This tool is perfect for streamlining document analysis and enhancing productivity.

---

## **Features**

- **Multi-Session Support**: Create and manage multiple chat sessions, each with unique session IDs.
- **PDF Upload**: Upload one or more PDF files for analysis within a session.
- **Contextual Q&A**: Ask questions based on the uploaded PDFs, and get precise, context-aware responses.
- **Persistent Sessions**: Sessions are stored in the browser's localStorage, enabling session recovery after page refresh.
- **Intuitive Interface**: Includes a home page, sidebar for session navigation, and interactive features like a file upload button and a query search bar.
- **AI-Powered**: Leverages Google Generative AI for embeddings and conversational AI.

---

## **How It Works**

1. **Frontend Workflow**:

   - **Home Page**: A clean and intuitive interface to get started.
   - **Sidebar**: Displays all active sessions. Users can switch between sessions or create a new session.
   - **Session Management**:
     - Each session has a unique ID, stored in `localStorage` along with the names of uploaded PDF files.
     - Refreshing the page retains session information for seamless continuity.
   - **File Upload**: Users can upload one or more PDF files per session using the upload button.
   - **Query Handling**: Enter a query in the search bar to get AI-generated answers based on the PDF content.

2. **Backend Workflow**:
   - **Session Creation**: A unique session ID is generated for each new session.
   - **File Upload & Processing**:
     - Extracts text from uploaded PDFs using PyPDF2.
     - Splits text into manageable chunks for efficient processing.
     - Creates vector embeddings using Google Generative AI.
     - Stores vectors in a FAISS-based similarity search index.
   - **Q&A**:
     - Retrieves relevant content from the FAISS index based on user queries.
     - Generates responses using a conversational AI model.
   - **Chat History**: Maintains a chat log for each session.

---

## **Technologies Used**

### **Frontend**:

- **React.js (Next.js)**: For building the user interface.
- **LocalStorage**: For persisting session data.
- **Tailwind CSS and Lucide-React Icons**: (Optional) For styling the interface.

### **Backend**:

- **FastAPI**: For API development.
- **PyPDF2**: For extracting text from PDF files.
- **FAISS**: For vector-based similarity search.
- **LangChain**: For text splitting and chaining AI models.
- **Google Generative AI**: For embeddings and conversational AI.
- **dotenv**: For managing environment variables.

---

## **Setup**

### **Prerequisites**

- Python 3.8+
- Node.js and npm (for the frontend)
- Google API Key for Generative AI

---

### **Backend Setup**

1. Clone the repository:

   ```bash
   git clone https://github.com/C-NikhilKarthik/PDF-Chatbot
   cd pdf-chatbot
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Set up the environment variables:

   - Create a `.env` file in the root directory.
   - Add your Google API key:
     ```env
     GEMINI_API_KEY=your_google_api_key
     ```

4. Run the backend server:

   ```bash
   uvicorn main:app --reload
   ```

5. Access the API at:
   ```
   http://127.0.0.1:8000
   ```

---

### **Frontend Setup**

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up the environment variables:

   - Create a `.env` file in the root directory.
   - Add your backend url:
     ```env
     API_BASE_URL = 'http://localhost:8000'
     ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open your browser and visit:
   ```
   http://localhost:3000
   ```

---

## **API Endpoints**

### **Session Management**

- **Create Session**:

  - Endpoint: `/sessions`
  - Method: `POST`
  - Description: Creates a new session and returns the session ID.

- **Delete Session**:
  - Endpoint: `/sessions/{session_id}`
  - Method: `DELETE`
  - Description: Deletes a session and its associated data.

### **File Management**

- **Upload Files**:
  - Endpoint: `/sessions/{session_id}/upload`
  - Method: `POST`
  - Description: Uploads one or more PDF files to the session.

### **Chat**

- **Ask Question**:

  - Endpoint: `/sessions/{session_id}/chat`
  - Method: `POST`
  - Description: Submits a query and receives an AI-generated response.

- **Get Chat History**:
  - Endpoint: `/sessions/{session_id}/history`
  - Method: `GET`
  - Description: Retrieves the chat history for a session.

---
