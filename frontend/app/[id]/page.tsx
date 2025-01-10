"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ChatWindow from "../../components/ChatWindow";
import FileUpload from "../../components/FileUpload";
import Image from "next/image";
import { PanelRight, Trash2 } from "lucide-react";
import { useSidebar } from "@/contexts/sidebarContext";

export default function SessionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const { toggleSidebar } = useSidebar();

  const deleteSession = async () => {
    try {
      // Delete from backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/sessions/${params.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete session from server");
      }

      // Delete from localStorage
      const storedSessions = localStorage.getItem("sessions");
      if (storedSessions) {
        const sessions = JSON.parse(storedSessions);
        const updatedSessions = sessions.filter(
          (session: { session_id: string }) => session.session_id !== params.id
        );
        localStorage.setItem("sessions", JSON.stringify(updatedSessions));
      }

      // Navigate to home
      router.push("/");
    } catch (error) {
      console.error("Error deleting session:", error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="">
      <nav className="absolute top-0 left-0 w-full py-4 bg-white [box-shadow:0px_-8px_25px_0px_#00000038]">
        <div className="max-w-7xl mx-auto md:px-10 px-2 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <PanelRight size={20} />
            </button>
            <Image
              src={"/AIPlanetLogo.png"}
              width={0}
              height={0}
              sizes="100%"
              className="h-8 w-auto"
              alt="logo"
            />
          </div>

          <div className="flex gap-4 items-center text-sm">
            <button
              onClick={deleteSession}
              className="p-2 hover:bg-red-100 rounded-lg text-red-500 transition-colors"
              title="Delete Session"
            >
              <Trash2 size={20} />
            </button>
            <FileUpload
              sessionId={params.id}
              isUploading={isUploading}
              setIsUploading={setIsUploading}
            />
          </div>
        </div>
      </nav>
      <div className="h-screen">
        <ChatWindow sessionId={params.id} isUploading={isUploading} />
      </div>
    </div>
  );
}
