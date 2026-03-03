'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface DashboardItem {
  id: number;
  username: string;
  title: string;
  content: string;
  created_at: string;
}

export default function Dashboard() {
    const router = useRouter();
    const [username, setUsername] = useState<string | null>(null);
    const [dashboard, setDashboard] = useState<DashboardItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const username = localStorage.getItem('username');
        if (!username) {
            router.push('/login');
        }
        setUsername(username);
    }, [router]);

    useEffect(() => {
        const username = localStorage.getItem('username')!;
        async function fetchDashboard(){
          setLoading(true);
          try {
            const response = await fetch(`/api/auth/dashboard?username=${encodeURIComponent(username)}`)
            const data = (await response.json()) as DashboardItem[];
            setDashboard(data);
            setError(null);
          } catch (error) {
            console.error('Error fetching dashboard:', error);
            setError("Failed to fetch dashboard data");
            setDashboard([]);
          } finally {
            setLoading(false);
          }
        }

        fetchDashboard();
        
    }, []);
    
    const handleViewDashboard = (item: DashboardItem) => {
      const queryParams = new URLSearchParams({
        title: item.title,
        username: item.username,
        content: item.content,
      }).toString();
      
      router.push(`/home/dashboard/${item.id}?${queryParams}`);
    };
    
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6 border-b pb-3">
            <h1 className="text-xl font-medium text-gray-800">Dashboard</h1>
            <button
              onClick={() => router.push('/home/dashboard/add')}
              className="text-sm border border-gray-300 px-3 py-1 rounded-sm hover:bg-gray-100"
            >
              Add Dashboard
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading dashboards...
            </div>
          ) : error ? (
            <div className="mb-4 px-3 py-2 text-sm text-red-600 bg-red-50 border-l-2 border-red-500">
              {error}
            </div>
          ) : dashboard.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No dashboard items found. Create your first one!
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              {[...dashboard].reverse().map((item) => (
                <div 
                  key={item.id}
                  onClick={() => handleViewDashboard(item)}
                  className="border border-gray-200 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <h2 className="text-lg font-medium text-gray-800 truncate">
                      {item.title || 'Untitled'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      By {item.username || 'Unknown user'}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }