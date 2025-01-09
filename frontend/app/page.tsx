// app/page.tsx
export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Welcome to PDF Chat Assistant
        </h1>
        <p className="text-gray-600">
          Select a session from the sidebar or create a new one to begin
        </p>
      </div>
    </div>
  );
}
