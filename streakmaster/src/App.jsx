import React, { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";
import "./Calendar.css"; // Import the Calendar styles
import Calendar from "./Calendar";
import Header from "./Header";
import axios from 'axios';

// Set the base URL for all Axios requests
axios.defaults.baseURL = 'http://localhost:3000';

function App() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // January is 0

  const [inputValue, setInputValue] = useState("");
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to fetch tasks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const getMonthName = (monthNumber) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[monthNumber - 1];
  };

  const handleAddTask = async () => {
    if (!inputValue.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post('api/tasks', { name: inputValue });
      setTasks(prevTasks => [...prevTasks, response.data]);
      setInputValue("");
    } catch (err) {
      setError('Failed to add task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.delete(`api/tasks/${taskId}`);
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
    } catch (err) {
      setError('Failed to delete task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = useCallback((direction, event) => {
    const container = event.target.closest('.calendar-window');
    if (container) {
      const scrollAmount = container.clientWidth;
      container.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }
  }, []);

  const calendarRefs = useRef({});

  useEffect(() => {
    Object.values(calendarRefs.current).forEach(ref => {
      if (ref) {
        ref.scrollLeft = ref.scrollWidth;
      }
    });
  }, [tasks]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="app-container">
      <Header />
      <div className="task-input">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add Quest"
        />
        <button onClick={handleAddTask} disabled={isLoading}>Add Quest</button>
      </div>
      <div className="tasks-container">
        {tasks.map((task) => (
          <div key={task._id} className="task-wrapper">
            <div className="task-header">
              <h3>{task.name}</h3>
              <button onClick={() => handleDeleteTask(task._id)} disabled={isLoading}>Delete</button>
            </div>
            <div className="calendar-scroll-container">
              <button onClick={(e) => handleScroll(-1, e)} className="scroll-button left">&lt;</button>
              <div 
                className="calendar-window" 
                ref={el => calendarRefs.current[task._id] = el}
              >
                <div className="calendar-section">
                  {Array.from({ length: 12 }, (_, i) => {
                    const monthsAgo = 11 - i;
                    const date = new Date(currentYear, currentMonth - 1 - monthsAgo, 1);
                    const year = date.getFullYear();
                    const month = date.getMonth() + 1;
                    return (
                      <div key={`${year}-${month}-${task._id}`} className="calendar-wrapper">
                        <h5>{getMonthName(month)} {year}</h5>
                        <Calendar year={year} month={month} taskId={task._id} />
                      </div>
                    );
                  })}
                </div>
              </div>
              <button onClick={(e) => handleScroll(1, e)} className="scroll-button right">&gt;</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
