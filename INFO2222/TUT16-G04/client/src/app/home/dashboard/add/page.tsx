'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddDashboard() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        const username = localStorage.getItem('username');
        if (!username) {
            router.push('/login');
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent)=> {
        e.preventDefault()
        const username = localStorage.getItem('username') || '';

        if (!title.trim() || !content.trim()) {
            alert('Title and content are required');
            return;
        }

        try {
            const response = await fetch(`/api/auth/addDashboard`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username, title, content
                })
            })
            
            if (response.ok) {
                router.push('/home/dashboard');
            }
        } catch (error) {
            console.error('Error adding dashboard:', error);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8">
                <div className="flex justify-between items-center mb-8 border-b pb-3">
                    <h1 className="text-3xl font-light text-gray-800">Add Dashboard</h1>
                    <button 
                        onClick={() => router.push('/home/dashboard')}
                        className="text-gray-600 hover:text-gray-900 text-sm border border-gray-300 rounded-md px-3 py-1 transition-colors"
                    >
                        Back
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                        <label htmlFor="title" className="text-lg text-gray-700">Title</label>
                        <input 
                            id="title"
                            type="text" 
                            placeholder="Enter dashboard title" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            className="w-full p-4 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                            required
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label htmlFor="content" className="text-lg text-gray-700">Content</label>
                        <textarea 
                            id="content"
                            placeholder="Enter dashboard content" 
                            value={content} 
                            onChange={(e) => setContent(e.target.value)} 
                            className="w-full p-4 border border-gray-200 rounded-md h-60 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                            required
                        />
                    </div>
                    
                    <div className="pt-4 flex justify-center">
                        <button 
                            type="submit" 
                            className="text-sm border border-gray-300 px-3 py-1 rounded-sm hover:bg-gray-100"
                        >
                            Add
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
