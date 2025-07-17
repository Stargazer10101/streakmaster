import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const Calendar = ({ year, month, taskId }) => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDates = useCallback(async () => {
    if (!taskId) {
      setSelectedDates([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/dates', { params: { taskId } });
      setSelectedDates(response.data.dates || []);
    } catch (error) {
      console.error('Error fetching dates:', error);
      setError('Failed to fetch dates');
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchDates();
  }, [fetchDates]);

  const handleDateClick = async (day) => {
    if (!taskId) {
      setError('No task selected');
      return;
    }
    const fullDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/dates', { date: fullDate, taskId });
      setSelectedDates(response.data.dates);
    } catch (error) {
      console.error('Error updating date:', error);
      setError('Failed to update date');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCalendar = () => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
    const days = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(
        <div 
          key={`empty-${i}`} 
          className="w-[2.5vw] h-[2.5vw] min-w-[18px] min-h-[18px] max-w-[24px] max-h-[24px] bg-transparent"
        />
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const fullDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = selectedDates.includes(fullDate);
      days.push(
        <button
          key={day}
          className={`w-[2.5vw] h-[2.5vw] min-w-[18px] min-h-[18px] max-w-[24px] max-h-[24px] 
            rounded-md text-[min(1.8vw,10px)] flex items-center justify-center transition-all duration-150
            ${isSelected 
              ? 'bg-green-500 text-white font-bold ring-2 ring-offset-1 ring-green-300 dark:ring-offset-gray-800' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 hover:scale-105'
            }
            focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400 dark:ring-offset-gray-800
            disabled:opacity-75`}
          onClick={() => handleDateClick(day)}
          disabled={isLoading}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  if (isLoading) return <div className="text-center text-blue-500 text-sm">Loading...</div>;
  if (error) return <div className="text-center text-red-500 text-sm">{error}</div>;

  return (
    <div className="grid grid-cols-7 gap-[0.5vw] min-w-[140px] max-w-[200px]">
      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
        <div 
          key={index} 
          className="text-center text-[min(2vw,12px)] font-medium text-gray-500 dark:text-gray-400"
        >
          {day}
        </div>
      ))}
      {renderCalendar()}
    </div>
  );
};

export default Calendar;
