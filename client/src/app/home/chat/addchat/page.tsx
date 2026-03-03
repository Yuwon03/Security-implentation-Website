'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddChat() {
    const router = useRouter();
    const [chatName, setChatName] = useState('');
    const [chatType, setChatType] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [usernames, setUsernames] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const username = localStorage.getItem('username');
        if (!username) {
          router.push('/login');
        }
        else{
            setUsernames([username]);
        }
      }, [router]);
    
    const addUsername = () => {
        if (usernames.length < 10) {
            setUsernames([...usernames, ''])
        }
    };

    const removeUsername = (index: number) => {
        if (index == 0) return;
        const updatedUsernames = [...usernames];
        updatedUsernames.splice(index, 1);
        setUsernames(updatedUsernames);
    };

    const handleChange = (index: number, value: string) => {
        if (index == 0) return;

        const updatedUsernames = [...usernames];
        updatedUsernames[index] = value;
        setUsernames(updatedUsernames);
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const filteredUsernames = usernames.filter(username => username.trim() !== '');
        if (filteredUsernames.length < 2) {
            setError('You need at least 2 people to make a chat');
            return;
        }
        
        setIsSubmitting(true);
        const chatType = usernames.length > 2 ? 'group' : 'private';
        setLoading(true);
        setError('');

        try{
            const response = await fetch('/api/auth/addchats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ chatName, chatType, usernames: filteredUsernames }),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.error || data.message || `Server error: ${response.status}`;
                setError(errorMessage);
                setIsSubmitting(false);
                setLoading(false);
                return;
            }
            setError('');
            setSuccess('Chat created successfully');

        } catch(err: any) {
            console.error('Error creating chat:', err);
            setError(err.message || 'An error occurred during chat creation');

        } finally {
            setLoading(false);
        }

        setIsSubmitting(false);
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-center mb-6">Create New Chat</h2>
            
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    {success}
                </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="chatName">
                  Chat Name
                </label>
                <input
                  id="chatName"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={chatName}
                  onChange={(e) => setChatName(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Usernames {usernames.length > 2 ? '(Group Chat)' : '(Private Chat)'}
                </label>
                
                {usernames.map((username, index) => (
                  <div key={index} className="flex mb-2">
                    <input
                      type="text"
                      className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${index === 0 ? 'bg-gray-100' : ''}`}
                      value={username}
                      onChange={(e) => handleChange(index, e.target.value)}
                      placeholder={index === 0 ? `You (${localStorage.getItem('username')})` : `Username ${index}`}
                      disabled={index === 0} 
                      required
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
                        onClick={() => removeUsername(index)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                
                {usernames.length < 10 && (
                  <button
                    type="button"
                    className="mt-2 text-blue-500 hover:text-blue-700"
                    onClick={addUsername}
                  >
                    + Add another username (max 10)
                  </button>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={() => router.push('/home/chat')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Chat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
}