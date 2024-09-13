import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const Calendar = ({ year, month, taskId }) => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDates = useCallback(async () => {
    console.log('Fetching dates for taskId:', taskId);
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/dates', { params: { taskId } });
      setSelectedDates(response.data.dates);
      console.log('Fetched dates:', response.data.dates);
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
    const fullDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    console.log('Clicking date:', fullDate, 'for taskId:', taskId);
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/dates', { date: fullDate, taskId });
      setSelectedDates(response.data.dates);
      console.log('Updated dates:', response.data.dates);
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
      days.push(<div key={`empty-${i}`} className="empty-day"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const fullDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = selectedDates.includes(fullDate);
      console.log(`Date ${fullDate} is selected:`, isSelected);
      days.push(
        <button
          key={day}
          className={`day ${isSelected ? 'selected' : ''}`}
          onClick={() => handleDateClick(day)}
          disabled={isLoading}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  if (error) return <div className="error">{error}</div>;

  return (
    <div className="calendar">
      {isLoading && <div className="loading">Loading...</div>}
      {renderCalendar()}
    </div>
  );
};

export default Calendar;
