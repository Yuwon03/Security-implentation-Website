'use client'

import { useRouter } from "next/navigation";
import React from "react";

interface DashboardItem {
    params: Promise<{id: string}>
    searchParams: Promise<{title: string, username: string, content?: string}>
}

export default function DashboardPage({params, searchParams}: DashboardItem) {
    const router = useRouter();
    const {id} = React.use(params);
    const {title, username, content} = React.use(searchParams);

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <div className="flex justify-between items-center mb-8 border-b pb-3">
            <h1 className="text-3xl font-light text-gray-800">{title || 'Dashboard'}</h1>
            <button 
              onClick={() => router.push('/home/dashboard')}
              className="text-gray-600 hover:text-gray-900 text-sm border border-gray-300 rounded-md px-3 py-1 transition-colors"
            >
              Back
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{username}</span>
            </div>
            
            <div className="mt-6 border-t pt-6">
              <h2 className="text-xl font-medium mb-4 text-gray-700">Content</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-600 whitespace-pre-wrap">
                  {content || 'No content available'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}