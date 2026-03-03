'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type DashboardItem = {
  id: number;
  username: string;
  title: string;
  content: string;
  created_at: string;
};

type Task = {
  id: number;
  groupId: number;
  groupName: string;
  participantName: string;
  taskName: string;
  deadline: string;
  status: string;
  createdAt: string;
};

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState<string>('');
  const [dashboardItems, setDashboardItems] = useState<DashboardItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username) {
      router.push('/login');
      return;
    }
    setUsername(username);
    fetchHomeData(username);
  }, [router]);

  async function fetchHomeData(username: string) {
    setLoading(true);
    try {
      const [dashRes, taskRes] = await Promise.all([
        fetch(`/api/auth/dashboard?username=${encodeURIComponent(username)}`),
        fetch(`/api/auth/gettasks?username=${encodeURIComponent(username)}`)
      ]);

      if (!dashRes.ok || !taskRes.ok) {
        throw new Error('Error fetching home data');
      }

      const dashData: DashboardItem[] = await dashRes.json();
      const taskData: Task[] = await taskRes.json();

      const recent = [...dashData]
        .sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 3);

      const upcoming = taskData
        .filter(t => t.participantName === username)
        .filter(t => t.status !== 'Finished')
        .sort((a, b) =>
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        )
        .slice(0, 3);

      setDashboardItems(recent);
      setTasks(upcoming);
    } catch (err) {
      console.error('Home data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('username');
    router.push('/');
  };

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString('ko-KR', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Top Bar */}
      <header className="flex justify-between items-center p-4 border-b">
        <span className="font-medium text-lg">Home</span>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">{username}</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-8">
        {/* Recent Dashboard */}
        <section>
          <h2 className="text-lg font-medium mb-4 border-b pb-2">Recent Dashboard News</h2>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : dashboardItems.length > 0 ? (
            <div className="space-y-4">
              {dashboardItems.map(item => (
                <div key={item.id} className="border-b pb-3">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{item.content}</p>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>{item.username}</span>
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent updates</p>
          )}
        </section>

        {/* Upcoming Tasks */}
        <section>
          <h2 className="text-lg font-medium mb-4 border-b pb-2">Upcoming Tasks</h2>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className="flex justify-between items-start border-b pb-3"
                >
                  <div>
                    <h3 className="font-medium">{task.taskName}</h3>
                    <p className="text-gray-600 text-sm">Group: {task.groupName}</p>
                  </div>
                  <div className="text-xs text-gray-600">
                    Due date: {formatDate(task.deadline)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No upcoming tasks</p>
          )}
        </section>
      </main>
    </div>
  );
}
