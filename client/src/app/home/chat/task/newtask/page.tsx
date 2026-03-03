'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Group {
  id: number;
  name: string;
  participants: string[];
}

interface Task {
  memberId: number;
  memberName: string;
  taskName: string;
  deadline: string;
}

export default function NewTask() {
  const router = useRouter();
  const [step, setStep] = useState(1); 
  const [username, setUsername] = useState('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<string[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (!storedUsername) {
      router.push('/login');
    } else {
      setUsername(storedUsername);
      fetchUserGroups(storedUsername);
    }
  }, [router]);

  const fetchUserGroups = async (username: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/auth/getgroups?username=${encodeURIComponent(username)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json() as Group[];
      setGroups(data);
    } catch (error: any) {
      console.error("Error fetching groups:", error);
      setError(error.message || 'Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (!selectedGroupId) return;
    
    setMembers(groups.find(group => group.id === selectedGroupId)?.participants || []);
    setTasks([])
    setStep(2);
  };

  const handleAssignTasks = async () => {
    const tasksToAssign = tasks.filter(task => task.taskName.trim() !== '');
    
    if (tasksToAssign.length === 0) {
      alert('Please add at least one task');
      return;
    }
    
  const taskNames = tasksToAssign.map(task => task.taskName.trim());
  const uniqueTaskNames = new Set(taskNames);
  
  if (uniqueTaskNames.size !== taskNames.length) {
    alert('Duplicate task names are not allowed. Please use unique task names for each member.');
    return;
  }
    
    try {
      const formattedTasks = tasksToAssign.map(task => ({
        groupId: selectedGroupId,
        participantName: task.memberName,
        taskName: task.taskName,
        deadline: task.deadline
      }));
      
      const response = await fetch(`/api/auth/addtasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tasks: formattedTasks }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to assign tasks');
      }
      
      alert('Tasks assigned successfully!');
      router.push('/home/chat/task');
    } catch (error: any) {
      console.error("Error assigning tasks:", error);
      setError(error.message || 'Failed to assign tasks');
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <div>
            <h1 className="text-xl font-medium text-gray-800">
              {step === 1 ? 'Select Group' : 'Assign Tasks'}
            </h1>
            {step === 2 && (
              <button 
                onClick={() => setStep(1)} 
                className="mt-2 text-sm text-gray-600 hover:underline"
              >
                ← Back to group selection
              </button>
            )}
          </div>
          
          <button
            onClick={() => router.push('/home/chat/task')}
            className="text-sm border border-gray-300 px-3 py-1 rounded-sm hover:bg-gray-100"
          >
            Back
          </button>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 text-sm text-red-600 bg-red-50 border-l-2 border-red-500">
            {error}
          </div>
        )}
        
        {/* 로딩 표시 */}
        {loading && (
          <div className="text-center py-8 text-gray-500">
            Loading...
          </div>
        )}
        
        {/* 단계 1: 그룹 선택 */}
        {!loading && step === 1 && (
          <div className="border border-gray-200 p-4">
            <h2 className="text-lg font-medium mb-4 text-gray-700">Choose a group to assign tasks</h2>
            
            {groups.length === 0 ? (
              <p className="text-gray-500 text-center py-4">You are not a member of any groups.</p>
            ) : (
              <div className="space-y-4 mb-6">
                {groups.map(group => (
                  <div 
                    key={group.id}
                    onClick={() => setSelectedGroupId(group.id)}
                    className={`p-3 border cursor-pointer transition-colors ${
                      selectedGroupId === group.id 
                        ? 'border-indigo-400 bg-indigo-50' 
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <p className="font-medium">{group.name}</p>
                  </div>
                ))}
              </div>
            )}
            
            <button
              onClick={handleNextStep}
              disabled={!selectedGroupId || groups.length === 0}
              className={`w-full py-2 px-3 border text-sm transition-colors ${
                selectedGroupId && groups.length > 0
                  ? 'border-gray-300 hover:bg-gray-100 text-gray-800' 
                  : 'border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          </div>
        )}
        
        {/* 단계 2: 멤버별 태스크 할당 */}
        {!loading && step === 2 && (
        <div className="border border-gray-200 p-4">
            <h2 className="text-lg font-medium mb-4 text-gray-700">
            Assign tasks to group members
            </h2>
            
            <div className="space-y-6 mb-6">
            {members.map((memberName, index) => {
                let task = tasks.find(t => t.memberName === memberName);
                
                if (!task) {
                const newTask = {
                    memberId: index + 1, 
                    memberName: memberName,
                    taskName: "",
                    deadline: ""
                };
                
                setTasks(prev => [...prev, newTask]);
                task = newTask;
                }
                
                return (
                <div key={memberName} className="pb-4 border-b border-gray-100 last:border-0">
                    <div className="flex items-center mb-3">
                    <span className={`font-medium ${memberName === username ? 'text-indigo-600' : 'text-gray-700'}`}>
                        {memberName} {memberName === username ? '(You)' : ''}
                    </span>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Task Name</label>
                        <input
                        type="text"
                        placeholder="Enter task name"
                        value={task?.taskName || ''}
                        onChange={(e) => {
                            const updatedTask = {
                            ...task,
                            taskName: e.target.value
                            };
                            
                            setTasks(prevTasks => 
                            prevTasks.map(t => t.memberName === memberName ? updatedTask : t)
                            );
                        }}
                        className="w-full p-2 text-sm border border-gray-300"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-600 mb-1">Deadline</label>
                        <input
                        type="date"
                        value={task?.deadline || ''}
                        onChange={(e) => {
                            const updatedTask = {
                            ...task,
                            deadline: e.target.value
                            };
                            
                            setTasks(prevTasks => 
                            prevTasks.map(t => t.memberName === memberName ? updatedTask : t)
                            );
                        }}
                        className="w-full p-2 text-sm border border-gray-300"
                        />
                    </div>
                    </div>
                </div>
                );
            })}
            </div>
            
            <button
            onClick={handleAssignTasks}
            className="w-full py-2 px-3 border border-gray-300 text-sm hover:bg-gray-100"
            >
            Assign Tasks
            </button>
        </div>
        )}
      </div>
    </div>
  );
}