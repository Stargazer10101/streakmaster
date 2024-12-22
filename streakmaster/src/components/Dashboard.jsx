import React, { useState, useEffect, useCallback, useRef } from "react";
import Calendar from "../Calendar";
import Header from "../Header";
import axios from 'axios';

function Dashboard() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const [inputValue, setInputValue] = useState("");
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const scrollRefs = useRef({});

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError('Failed to fetch tasks. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const getMonthName = (monthNumber) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[monthNumber - 1];
  };

  const handleAddTask = async () => {
    if (!inputValue.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/tasks', { name: inputValue });
      setTasks(prevTasks => [...prevTasks, response.data]);
      setInputValue("");
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError('Failed to add task. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError('Failed to delete task. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = useCallback((direction, taskId) => {
    const container = scrollRefs.current[taskId];
    if (container) {
      const calendarWidth = container.querySelector('.calendar-wrapper')?.offsetWidth || 200;
      const scrollAmount = calendarWidth * 3;
      container.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      Object.entries(scrollRefs.current).forEach(([taskId, container]) => {
        if (container) {
          const isOverflowing = container.scrollWidth > container.clientWidth;
          const buttons = container.parentElement.querySelectorAll('.scroll-button');
          buttons.forEach(btn => {
            btn.style.display = isOverflowing ? 'block' : 'none';
          });
        }
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [tasks]);

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen w-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-800 dark:via-gray-900 dark:to-black text-gray-500 text-xl">
      Loading...
    </div>
  );
  if (error) return (
    <div className="flex flex-col justify-center items-center h-screen w-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-800 dark:via-gray-900 dark:to-black text-red-500 text-xl">
      <p>{error}</p>
      <button
        onClick={fetchTasks}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-800 dark:via-gray-900 dark:to-black">
      <Header />
      <div className="flex-1 flex flex-col px-[2vw] sm:px-[3vw] lg:px-[4vw] py-6 overflow-y-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Add a new quest..."
              className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                dark:focus:ring-indigo-400 dark:focus:border-indigo-400
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                placeholder-gray-500 dark:placeholder-gray-400
                text-sm sm:text-base transition-all duration-150"
            />
            <button
              onClick={handleAddTask}
              disabled={isLoading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 
                text-white rounded-md hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed 
                transition-all duration-150 ease-in-out text-sm sm:text-base flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Quest
            </button>
          </div>
        </div>
        <div className="flex-1 space-y-6">
          {tasks.map((task) => (
            <div key={task._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-600 to-purple-700 dark:from-gray-800 dark:to-gray-900 text-white">
                <h3 className="text-base sm:text-lg font-semibold">{task.name}</h3>
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 rounded-md 
                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
              <div className="relative p-4">
                <button
                  onClick={() => handleScroll(-1, task._id)}
                  className="scroll-button absolute left-0 top-1/2 transform -translate-y-1/2 
                    bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 
                    z-10 hidden transition-all duration-150"
                >
                  &lt;
                </button>
                <div
                  id={`calendar-window-${task._id}`}
                  className="calendar-window overflow-x-auto scroll-smooth 
                    scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 
                    dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800"
                  ref={el => (scrollRefs.current[task._id] = el)}
                >
                  <div className="flex gap-4 p-3 min-w-max">
                    {Array.from({ length: 12 }, (_, i) => {
                      const monthsAgo = 11 - i;
                      const date = new Date(currentYear, currentMonth - 1 - monthsAgo, 1);
                      const year = date.getFullYear();
                      const month = date.getMonth() + 1;
                      return (
                        <div
                          key={`${year}-${month}-${task._id}`}
                          className="calendar-wrapper flex-shrink-0 w-[18vw] min-w-[160px] max-w-[240px]
                            bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 
                            rounded-md p-3"
                        >
                          <h5 className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300 
                            mb-3 text-center">
                            {getMonthName(month)} {year}
                          </h5>
                          <Calendar year={year} month={month} taskId={task._id} />
                        </div>
                      );
                    })}
                  </div>
                </div>
                <button
                  onClick={() => handleScroll(1, task._id)}
                  className="scroll-button absolute right-0 top-1/2 transform -translate-y-1/2 
                    bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 
                    z-10 hidden transition-all duration-150"
                >
                  &gt;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 