import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

const Calendar = ({ year, month, taskId }) => {
  const [storedDates, setStoredDates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStoredDates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await axios.get(`${API_BASE_URL}/api/dates`, { params: { id: taskId } });
      setStoredDates(response.data.dates);
    } catch (error) {
      setError('Failed to fetch stored dates. Please try again.');
      console.error('Error fetching stored dates:', error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchStoredDates();
  }, [fetchStoredDates]);

  const handleClick = useCallback(async (day) => {
    const fullDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:3000/api/dates', { date: fullDate, id: taskId });
      setStoredDates(response.data.dates);
    } catch (error) {
      setError('Failed to update date. Please try again.');
      console.error('Error sending date to server:', error);
    } finally {
      setIsLoading(false);
    }
  }, [year, month, taskId]);

  const daysInMonth = useMemo(() => new Date(year, month, 0).getDate(), [year, month]);
  const firstDayOfWeek = useMemo(() => new Date(year, month - 1, 1).getDay(), [year, month]);

  const renderDays = useMemo(() => {
    const days = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="empty-day" aria-hidden="true" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const fullDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isStored = storedDates.includes(fullDate);
      const dayClassName = isStored ? 'day stored-date' : 'day';

      days.push(
        <button
          key={day}
          className={dayClassName}
          onClick={() => handleClick(day)}
          disabled={isLoading}
          aria-label={`${isStored ? 'Remove' : 'Add'} date ${fullDate}`}
          aria-pressed={isStored}
        >
          {day}
        </button>
      );
    }

    return days;
  }, [daysInMonth, firstDayOfWeek, year, month, storedDates, handleClick, isLoading]);

  if (error) {
    return <div className="calendar-error" role="alert">{error}</div>;
  }

  return (
    <div className="calendar" role="grid" aria-label={`Calendar for ${month}/${year}`}>
      {isLoading && <div className="calendar-loading" aria-live="polite">Loading...</div>}
      {renderDays}
    </div>
  );
};

export default React.memo(Calendar);
