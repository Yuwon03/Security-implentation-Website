'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Task {
  id:             number;
  groupId:        number;
  groupName:      string;
  participantName:string;
  taskName:       string;
  deadline:       string;
  status:         string;
}
export default function Task() {
  const router = useRouter(); 
  const username = localStorage.getItem('username')!;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showProgressBox, setShowProgressBox] = useState(false);
  const [progressTasks, setProgressTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!username) {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    const fetchTasks = async () => {
      try{
        const response = await fetch(`/api/auth/gettasks?username=${encodeURIComponent(username)}`);
        const data = await response.json() as Task[];
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    fetchTasks();
  }, []);

  const myTasks = tasks.filter(task => task.participantName === username);
  
  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === 'Finished' ? 'In Progress' : 'Finished';

    await fetch(`/api/auth/updatetaskstatus`, {
      method: 'PATCH',
      body: JSON.stringify({
        taskId: task.id,
        status: newStatus,
        username: username
      })
    });

    setTasks(prev => prev.map(t =>
      t.id === task.id ? { ...t, status: newStatus } : t
    ));
  };

  const handleViewProgress = async (groupId: number) => {
    const list = tasks.filter(task => task.groupId === groupId);
    setProgressTasks(list);
    setShowProgressBox(true);
  };

  const handleCloseBox = () => {
    setShowProgressBox(false);
  }
  
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h1 className="text-xl font-medium text-gray-800">My Tasks</h1>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/home/chat/task/newtask")}
              className="text-sm border border-gray-300 px-3 py-1 rounded-sm hover:bg-gray-100"
            >
              Add Task
            </button>
            <button
              onClick={() => router.push("/home/chat")}
              className="text-sm border border-gray-300 px-3 py-1 rounded-sm hover:bg-gray-100"
            >
              Back
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="border border-gray-200 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Task Name</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Group</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Deadline</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Edit Status</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-600">Progress</th>
              </tr>
            </thead>
            <tbody>
              {myTasks.length === 0 && (
                <tr>
                  <td colSpan={6}
                    className="px-4 py-6 text-center text-gray-400 text-sm"
                  >
                    No tasks available
                  </td>
                </tr>
              )}
              {myTasks.map(task => (
                <tr key={task.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800">{task.taskName}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{task.groupName}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{task.deadline}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 text-xs ${
                        task.status === 'Finished'
                          ? 'text-green-800 bg-green-50 border border-green-200'
                          : 'text-orange-800 bg-orange-50 border border-orange-200'
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>

                  {/* Edit Status */}
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => handleToggleStatus(task)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {task.status === 'Finished'
                        ? 'Reopen'
                        : 'Finish'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => handleViewProgress(task.groupId)}
                      className="text-gray-600 hover:underline text-sm"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showProgressBox && (
          <div
            className="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
            onClick={handleCloseBox}
          >
            <div
              className="bg-white border border-gray-200 w-96 p-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">
                  {progressTasks[0]?.groupName} Group Progress
                </h2>
                <button
                  onClick={handleCloseBox}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {progressTasks.map(pt => (
                  <li
                    key={pt.id}
                    className="flex justify-between items-center border-b pb-2 text-sm"
                  >
                    <span className="font-medium">{pt.participantName}</span>
                    <span
                      className={`px-2 py-1 text-xs ${
                        pt.status === 'Finished'
                          ? 'text-green-800 bg-green-50 border border-green-200'
                          : 'text-orange-800 bg-orange-50 border border-orange-200'
                      }`}
                    >
                      {pt.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}