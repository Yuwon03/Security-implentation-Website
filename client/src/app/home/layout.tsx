'use client'

import { usePathname } from "next/navigation";
import "../globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return path
  };

  return (
    <div className="flex flex-col min-h-screen font-[family-name:var(--font-geist-sans)] bg-gray-50">
      <main className="flex-1 p-4 space-y-6">
        {children}
      </main>
      <footer className="border-t border-gray-100 bg-white shadow-sm">
      <div className="flex justify-between items-center h-14 max-w-xl mx-auto px-8">
          <a href="/home" className={`flex flex-col items-center ${isActive('/home') ? 'text-blue-500' : 'text-gray-400'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span className="text-xs mt-1 font-light">Home</span>
          </a>
          <a href="/home/timetable" className={`flex flex-col items-center ${isActive('/home/timetable') ? 'text-blue-500' : 'text-gray-400'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span className="text-xs mt-1 font-light">Timetable</span>
          </a>
          <a href="/home/chat" className={`flex flex-col items-center ${isActive('/home/chat') ? 'text-blue-500' : 'text-gray-400'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span className="text-xs mt-1 font-light">Chat</span>
          </a>
          <a href="/home/dashboard" className={`flex flex-col items-center ${isActive('/home/dashboard') ? 'text-blue-500' : 'text-gray-400'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span className="text-xs mt-1 font-light">Dashboard</span>
          </a>
        </div>
      </footer>
    </div>
  );
}