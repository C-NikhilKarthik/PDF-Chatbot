"use client";
import { useState, useEffect } from "react";
import { Upload, X, Plus, FileText } from "lucide-react";

interface FileUploadProps {
  sessionId: string;
  isUploading: boolean;
  setIsUploading: (value: boolean) => void;
}

interface SessionProps {
  session_id: string;
  pdf_files: string[];
}

export default function FileUpload({
  sessionId,
  isUploading,
  setIsUploading,
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load existing files from localStorage on mount
  useEffect(() => {
    const storedSessions = localStorage.getItem("sessions");
    if (storedSessions) {
      const sessions = JSON.parse(storedSessions);
      const currentSession = sessions.find(
        (session: SessionProps) => session.session_id === sessionId
      );
      if (currentSession && currentSession.pdf_files) {
        setUploadedFiles(currentSession.pdf_files);
      }
    }
  }, [sessionId]);

  // Close modal on escape key
  useEffect(() => {
    const closeOnEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener("keydown", closeOnEscKey);
    }

    return () => {
      document.removeEventListener("keydown", closeOnEscKey);
    };
  }, [isModalOpen]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    setSelectedFiles(Array.from(files));
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadStatus("Uploading...");

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/sessions/${sessionId}/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        // const data = await response.json();
        setUploadStatus("Upload successful!");
        setUploadedFiles((prev) => [
          ...prev,
          ...selectedFiles.map((f) => f.name),
        ]);
        setSelectedFiles([]);
        setIsModalOpen(false);

        // Update session files in localStorage
        const storedSessions = localStorage.getItem("sessions");
        if (storedSessions) {
          const sessions = JSON.parse(storedSessions);
          const updatedSessions = sessions.map((session: SessionProps) => {
            if (session.session_id === sessionId) {
              return {
                ...session,
                pdf_files: [
                  ...session.pdf_files,
                  ...selectedFiles.map((f) => f.name),
                ],
              };
            }
            return session;
          });
          localStorage.setItem("sessions", JSON.stringify(updatedSessions));
        }
      } else {
        setUploadStatus("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      setUploadStatus("Upload failed");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadStatus(""), 3000);
    }
  };

  return (
    <div className="relative">
      {uploadedFiles.length === 0 ? (
        <>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-black rounded-lg transition-colors"
          >
            <Plus size={20} />
            Upload PDF
          </button>

          {/* Modal Backdrop */}
          {isModalOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
              onClick={() => setIsModalOpen(false)}
            >
              {/* Modal Content */}
              <div
                className="bg-white rounded-lg w-full max-w-md p-6 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Upload PDF Files</h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="flex flex-col items-center">
                    <Upload className="w-12 h-12 text-gray-400" />
                    <label className="mt-4 flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer transition-colors">
                      <span>Select PDFs</span>
                      <input
                        type="file"
                        className="hidden"
                        multiple
                        accept=".pdf"
                        onChange={handleFileSelect}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>

                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Selected Files:</h4>
                    <div className="max-h-[200px] overflow-y-auto">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded mb-2"
                        >
                          <span className="text-sm truncate flex-1 mr-2">
                            {file.name}
                          </span>
                          <button
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-600 flex-shrink-0"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isUploading ? "Uploading..." : "Upload Files"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex gap-2">
          {uploadedFiles.map((fileName, index) => (
            <div key={index} className="flex max-md:hidden items-center gap-2">
              <div className="p-1 rounded border border-[#0FA958]">
                <FileText size={18} className="text-[#0FA958] flex-shrink-0" />
              </div>
              <span className="text-sm text-[#0FA958] truncate">
                {fileName}
              </span>
            </div>
          ))}
          <div className="hidden max-md:flex items-center gap-2">
            <FileText size={18} className="text-[#0FA958] flex-shrink-0" />
            <span className="text-sm text-[#0FA958]">
              {uploadedFiles.length} files uploaded
            </span>
          </div>
        </div>
      )}

      {/* Upload Status Message */}
      {uploadStatus && (
        <div
          className={`mt-2 text-center text-sm ${
            uploadStatus.includes("successful")
              ? "text-green-500"
              : uploadStatus.includes("failed")
              ? "text-red-500"
              : "text-blue-500"
          }`}
        >
          {uploadStatus}
        </div>
      )}
    </div>
  );
}
