"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Plus, FileText, PanelRight } from "lucide-react";
import { useSidebar } from "@/contexts/sidebarContext";

interface Session {
  session_id: string;
  pdf_files: string[];
}

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [sessions, setSessions] = useState<Session[]>([]);
  const { isOpen, toggleSidebar } = useSidebar(); // Use the context here

  useEffect(() => {
    // In a real app, you'd want to fetch sessions from the backend
    // For now, we'll get them from localStorage
    const storedSessions = localStorage.getItem("sessions");
    if (storedSessions) {
      setSessions(JSON.parse(storedSessions));
    }
  }, []);

  const createNewSession = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/sessions`,
        {
          method: "POST",
        }
      );
      const data = await response.json();
      const newSession = { session_id: data.session_id, pdf_files: [] };

      // Update local storage and state
      const updatedSessions = [...sessions, newSession];
      localStorage.setItem("sessions", JSON.stringify(updatedSessions));
      setSessions(updatedSessions);

      // Navigate to new session
      router.push(`/${data.session_id}`);
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  return (
    <div
      className={`w-64 bg-white z-[50] border-r min-h-screen max-md:absolute max-md:left-0 transition-all duration-500 ease-in-out max-md:${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } p-4`}
    >
      <div className="flex justify-between items-center mb-6">
        <button className="max-md:flex hidden" onClick={toggleSidebar}>
          <PanelRight />
        </button>
        <h2 className="text-xl font-bold">Sessions</h2>
        <button
          onClick={createNewSession}
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-2">
        {sessions.map((session) => (
          <Link
            key={session.session_id}
            href={`/${session.session_id}`}
            className={`block p-3 rounded-lg hover:bg-gray-100 ${
              pathname === `/${session.session_id}` ? "bg-gray-100" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText size={20} className="text-gray-500" />
                <div>
                  <div className="font-medium">
                    Session {session.session_id.slice(0, 8)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {session.pdf_files.length} files
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
