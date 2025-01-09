"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { IoMdSend } from "react-icons/io";

interface Message {
  role: string;
  content: string;
  timestamp: string;
}

interface ChatWindowProps {
  sessionId: string;
  isUploading: boolean;
}

export default function ChatWindow({
  sessionId,
  isUploading,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load chat history when session is created
    const loadChatHistory = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/sessions/${sessionId}/history`
        );
        if (response.ok) {
          const history = await response.json();
          setMessages(history);
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    };

    if (sessionId) {
      loadChatHistory();
    }
  }, [sessionId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isUploading) return;

    const userMessage = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8000/sessions/${sessionId}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userMessage),
        }
      );

      if (response.ok) {
        const botMessage = await response.json();
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col border justify-end h-full rounded-lg">
      <div className="flex-1 overflow-y-auto flex flex-col justify-end p-4 gap-6 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className="flex gap-4">
            <Image
              className="rounded-full object-cover w-10 h-fit"
              src={message?.role === "user" ? "/Userlogo.png" : "/AiLogo.png"}
              width={0}
              height={0}
              sizes="100%"
              alt="AI Planet Logo"
            />
            <div className="w-full pt-2">{message.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="animate-pulse">Thinking...</div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="relative flex-none pb-6 px-6">
        {/* <div className="absolute left-1/2 bottom-10 -translate-x-1/2 px-6 py-1 rounded-lg [box-shadow:0px_4px_30px_0px_#6666661A] border border-[#E4E8EE] w-[95%] max-w-6xl flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-grow px-4 text-[#6E7583] placeholder:text-[#6E7583] py-2 border-none outline-none"
                placeholder="Send a message..."
              />
              <button onClick={handleQuery}>
                <IoMdSend />
              </button>
              {response && <div className="mt-4 text-black">{response}</div>}
            </div> */}
        <div className="px-6 py-1 rounded-xl [box-shadow:0px_4px_30px_0px_#6666661A] bg-white border border-[#E4E8EE] flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Send a message..."
            className="flex-grow px-4 text-[#6E7583] placeholder:text-[#6E7583] py-2 border-none outline-none"
            disabled={isLoading || isUploading}
          />
          <button
            type="submit"
            className={`disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={isLoading || isUploading || !input.trim()}
          >
            <IoMdSend size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
