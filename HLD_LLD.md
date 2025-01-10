# **High-Level Design (HLD)**

### **Overview**

The system allows users to interact with uploaded PDF content using a chatbot. It leverages **FastAPI** for API development, **LangChain** for document chunking and retrieval, **FAISS** for similarity-based search, **Google Gemini APIs** for embeddings and chat responses, and **localStorage** for storing session data on the client side.

---

## **System Components**

### 1. **Frontend/Client**

- Interacts with the backend via REST APIs.
- Uses **localStorage** to persist user session data.
- Tasks:
  - Store and retrieve `session_id` and list of uploaded PDF file names locally.
  - Send session-specific requests for PDF uploads and chat queries.
  - Display chatbot responses.

---

## **Workflow Updates**

### **Step-by-Step Process**

1. **Session Creation**:

   - Users create a session via the `/sessions` endpoint.
   - The server returns a unique `session_id`.
   - The client stores the `session_id` in **localStorage** along with an empty array for `pdf_files`:
     ```
     {
       "session": "session_id",
       "pdf_files": []
     }
     ```

2. **PDF Upload**:

   - Users upload PDFs to the `/sessions/{session_id}/upload` endpoint.
   - Upon successful upload, the client updates the `pdf_files` array in **localStorage** with the names of the uploaded files:
     ```
     {
       "session": "session_id",
       "pdf_files": ["file1.pdf", "file2.pdf"]
     }
     ```

3. **Chat Interaction**:

   - Users send chat queries using the `session_id` stored in **localStorage**.
   - The client sends the query to `/sessions/{session_id}/chat` with the session-specific data.

4. **Session Cleanup**:
   - When the session is deleted, the client removes the corresponding entry from **localStorage**.

---

# **Low-Level Design (LLD)**

### 1. **Frontend Updates**

#### **localStorage Structure**

- **Key**: `"session_data"`
- **Value**: JSON object
  ```
  {
    "session": "session_id",
    "pdf_files": ["file1.pdf", "file2.pdf"]
  }
  ```

---

### 2. **API Endpoints Updates**

#### **1.2 `/sessions/{session_id}/upload`**

- **Client-Side Functionality**:
  - After successfully uploading files, the client updates **localStorage**:
    ```
    const sessionData = JSON.parse(localStorage.getItem("session_data"));
    sessionData.pdf_files.push("new_file.pdf");
    localStorage.setItem("session_data", JSON.stringify(sessionData));
    ```

#### **1.5 `/sessions/{session_id}`** (DELETE)

- **Client-Side Functionality**:
  - After successfully deleting the session, the client removes `session_data` from **localStorage**:
    ```
    localStorage.removeItem("session_data");
    ```

---

### 3. **Error Handling**

#### **LocalStorage Validation**

- Ensure `session_data` is present in **localStorage** before performing session-related actions:
  ```
  const sessionData = localStorage.getItem("session_data");
  if (!sessionData) {
    console.error("No active session found!");
    // Redirect to session creation page or show an error
  }
  ```

#### **Frontend Error Messages**

- Inform users if there’s a mismatch between the **localStorage** session and the server data (e.g., session expired or deleted).

---

### 4. **Example Workflow Integration**

#### **Session Creation**

```
fetch("/sessions", { method: "POST" })
  .then((response) => response.json())
  .then((data) => {
    const sessionData = {
      session: data.session_id,
      pdf_files: [],
    };
    localStorage.setItem("session_data", JSON.stringify(sessionData));
  });
```

#### **PDF Upload**

```
const sessionData = JSON.parse(localStorage.getItem("session_data"));
fetch(`/sessions/${sessionData.session}/upload`, {
  method: "POST",
  body: formData, // PDF files
})
  .then((response) => response.json())
  .then((result) => {
    // Update localStorage with uploaded file names
    sessionData.pdf_files.push(...uploadedFileNames);
    localStorage.setItem("session_data", JSON.stringify(sessionData));
  });
```

#### **Chat Query**

```
const sessionData = JSON.parse(localStorage.getItem("session_data"));
fetch(`/sessions/${sessionData.session}/chat`, {
  method: "POST",
  body: JSON.stringify({ role: "user", content: userQuery }),
})
  .then((response) => response.json())
  .then((result) => {
    console.log("Assistant's Response:", result.content);
  });
```
