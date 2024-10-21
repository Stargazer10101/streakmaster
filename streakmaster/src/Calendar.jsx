import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // Update this to match your backend URL

const Calendar = ({ year, month, taskId }) => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);


  // fetches the selected dates for a given taskId. Sets the state selectedDates to the
  // dates fetched from the backend.
  const fetchDates = useCallback(async () => {
    console.log('Fetching dates for taskId:', taskId);
    if (!taskId) {
      setSelectedDates([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/dates`, { params: { taskId } });
      setSelectedDates(response.data.dates || []);
      console.log('Fetched dates:', response.data.dates);
    } catch (error) {
      console.error('Error fetching dates:', error.response?.data || error.message);
      setError('Failed to fetch dates');
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  //explanation of the below useEffect:
  //fetchDates() function will run whenever fetchDates function changes. fetchDates function
  // changes when taskId changes.
  useEffect(() => {
    fetchDates();
  }, [fetchDates]);


  //
  const handleDateClick = async (day) => {
    console.log('Current taskId:', taskId);
    if (!taskId) {
      console.error('No taskId provided');
      setError('No task selected');
      return;
    }

    const fullDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    console.log('Clicking date:', fullDate, 'for taskId:', taskId);
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/dates`, { date: fullDate, taskId: taskId });
      setSelectedDates(response.data.dates);
      console.log('Updated dates:', response.data.dates);
    } catch (error) {
      console.error('Error updating date:', error.response?.data || error.message);
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

  if (isLoading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="calendar">
      {renderCalendar()}
    </div>
  );
};

export default Calendar;
