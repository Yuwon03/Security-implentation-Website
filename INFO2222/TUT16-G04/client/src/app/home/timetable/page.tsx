'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Timetable {
  id: number;
  username: string;
  day: string;
  time: string;
  duration: number;
  content: string;
}

export default function Timetable() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [timetable, setTimetable] = useState<Timetable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [newDay, setNewDay] = useState('Monday');
  const [newTime, setNewTime] = useState('09:00');
  const [newDuration, setNewDuration] = useState(1);
  const [newContent, setNewContent] = useState('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  const durations = [1, 2, 3];

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3700);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username) {
      router.push('/login');
    } else {
      setUsername(username);
    }
  }, [router]);

  useEffect(() => {
    if (username) {
      fetchTimetable();
    }
  }, [username]);

  async function fetchTimetable() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/auth/gettimetable?username=${username}`);
      const data = await response.json() as Timetable[];
      setTimetable(data);
    } catch (error) {
      console.error('Error fetching timetable:', error);
      setError("Failed to fetch timetable data");
      setTimetable([]);
    } finally {
      setLoading(false);
    }
  }

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/auth/addtimetable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          day: newDay,
          time: newTime,
          duration: newDuration,
          content: newContent,
        }),
      });
      
      if (response.ok) {
        // Reset form and refresh timetable
        setNewContent('');
        setNewDuration(1);
        setShowAddForm(false);
        fetchTimetable();
      } else {
        setError('Failed to add class');
      }
    } catch (error) {
      console.error('Error adding class:', error);
      setError('Failed to add class');
    }
  };

  const handleDeleteClass = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedClassId) return;
    
    setError(null);
    
    try {
      const response = await fetch(`/api/auth/deletetimetable`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedClassId,
          username,
        }),
      });
      
      if (response.ok) {
        setSelectedClassId(null);
        setShowDeleteForm(false);
        fetchTimetable();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete class');
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      setError('Failed to delete class');
    }
  };

  const formatClassInfo = (item: Timetable) => {
    return `${item.day}, ${item.time} - ${item.content} (${item.duration}hr)`;
  };

  const getTimeValue = (time: string) => {
    return parseInt(time.split(':')[0], 10);
  };

  const getClassesAtTime = (day: string, time: string) => {
    const timeValue = getTimeValue(time);
    const classes = [];
    
    if (!Array.isArray(timetable)) {
      console.error('timetable is not an array:', timetable);
      return [];
    }
    
    const startingClasses = timetable.filter((item) => 
      item.day === day && item.time === time
    );
    
    if (startingClasses.length > 0) {
      classes.push(...startingClasses);
      }
      
    for (const item of timetable) {
      if (item.day !== day || item.time === time) continue; 
      
      const itemTimeValue = getTimeValue(item.time);
      const endTimeValue = itemTimeValue + item.duration;
      
      if (timeValue > itemTimeValue && timeValue < endTimeValue) {
        classes.push(item);
      }
    }
    
    return classes;
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h1 className="text-xl font-medium text-gray-800">Timetable</h1>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setShowDeleteForm(false);
                setError(null);
              }}
              className="text-sm border border-gray-300 px-3 py-1 rounded-sm hover:bg-gray-100"
            >
              {showAddForm ? 'Cancel' : 'Add Class'}
            </button>
            
            <button
              onClick={() => {
                setShowDeleteForm(!showDeleteForm);
                setShowAddForm(false);
                setError(null);
                setSelectedClassId(null);
              }}
              className="text-sm border border-gray-300 px-3 py-1 rounded-sm hover:bg-gray-100"
            >
              {showDeleteForm ? 'Cancel' : 'Delete Class'}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 px-3 py-2 text-sm text-red-600 bg-red-50 border-l-2 border-red-500">
            <span>{error}</span>
            <button 
              onClick={() => setError(null)} 
              className="text-red-500 hover:text-red-700 ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Add Form */}
        {showAddForm && (
          <div className="border border-gray-200 p-4 mb-6">
            <h2 className="text-lg font-medium mb-4">Add New Class</h2>
            <form onSubmit={handleAddClass} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Day</label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300"
                    required
                  >
                    {days.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Start Time</label>
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full p-2 text-sm border border-gray-300"
                    required
                  >
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Duration (hours)</label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(parseInt(e.target.value, 10))}
                    className="w-full p-2 text-sm border border-gray-300"
                    required
                  >
                    {durations.map(duration => (
                      <option key={duration} value={duration}>{duration} hour{duration > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Class Description</label>
                <input
                  type="text"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Class Name"
                  className="w-full p-2 text-sm border border-gray-300"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="text-sm border border-gray-300 px-3 py-1 rounded-sm hover:bg-gray-100"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Delete Form */}
        {showDeleteForm && (
          <div className="border border-gray-200 p-4 mb-6">
            <h2 className="text-lg font-medium mb-4">Delete Class</h2>
            {timetable.length === 0 ? (
              <p className="text-gray-500 text-sm">No classes to delete.</p>
            ) : (
              <form onSubmit={handleDeleteClass} className="space-y-4">
                <div>
                  <select
                    value={selectedClassId || ''}
                    onChange={(e) => setSelectedClassId(parseInt(e.target.value, 10))}
                    className="w-full p-2 text-sm border border-gray-300"
                    required
                  >
                    <option value="">Select a class</option>
                    {timetable.map(item => (
                      <option key={item.id} value={item.id}>
                        {formatClassInfo(item)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="text-sm border border-gray-300 px-3 py-1 rounded-sm hover:bg-gray-100"
                    disabled={!selectedClassId}
                  >
                    Delete
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-10 text-center text-gray-500 text-lg">
            Loading timetable...
          </div>
        ) : timetable.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-10 text-center text-gray-500 text-lg">
            No classes found. Add your first class!
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Timetable header */}
            <div className="grid grid-cols-6 border-b">
              <div className="p-4 font-medium text-gray-500 text-base border-r bg-gray-50"></div>
              {days.map(day => (
                <div key={day} className="p-4 font-medium text-center text-gray-700 text-base border-r last:border-r-0 bg-gray-50">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Time slots */}
            {timeSlots.map(time => (
              <div key={time} className="grid grid-cols-6 border-b last:border-b-0">
                <div className="p-4 text-sm text-gray-600 border-r bg-gray-50 flex items-center justify-center font-medium">
                  {time}
                </div>
                {days.map(day => {
                  const classes = getClassesAtTime(day, time);
                  
                  return (
                    <div 
                      key={`${day}-${time}`} 
                      className={`p-2 text-base border-r last:border-r-0 min-h-[70px] ${
                        classes.length > 0 ? 'bg-blue-50' : ''
                      }`}
                    >
                      {classes.length > 0 ? (
                        <div className="h-full flex flex-col justify-center space-y-2">
                          {classes.map((item, index) => (
                            <div key={`class-${index}`} className="border-b last:border-b-0 pb-1 last:pb-0">
                              <div className="font-medium text-center">{item.content}</div>
                              <div className="text-xs text-gray-500 text-center">
                                {getTimeValue(item.time)}:00 - {getTimeValue(item.time) + item.duration}:00
                                {item.duration > 1 ? ` (${item.duration}h)` : ''}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}