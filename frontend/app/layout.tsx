import { Sidebar } from "@/components/Sidebar";
import "./globals.css";
import { SidebarProvider } from "@/contexts/sidebarContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SidebarProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 relative bg-gray-100">
              {/* <Navbar /> */}
              {children}
            </main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
