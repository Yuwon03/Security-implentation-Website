'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (username) {
      router.push('/home');
    }
    const storedUsername = localStorage.getItem('username');
    setUsername(storedUsername);
    setLoading(false);
  }, [username, router]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-gray-600">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-white">
      <h1 className="text-2xl font-medium mb-8 text-gray-800">University Chat Application</h1>
      
      {!username && (
        <div>
          <Link 
            href="/login" 
            className="px-4 py-2 border border-gray-300 text-gray-800 rounded-sm hover:bg-gray-100 transition-colors"
          >
            Join Chat
          </Link>
        </div>
      )}
    </div>
  );
}