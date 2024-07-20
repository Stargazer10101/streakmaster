import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Calendar = ({ year, month, taskId }) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();  // Correcting month to be 0-based for Date

  const [storedDates, setStoredDates] = useState([]);

  useEffect(() => {
    // Fetch stored dates for the given taskId
    axios.get('http://localhost:3000', { params: { id: taskId } })
      .then(response => {
        console.log('Response from server:', response.data);
        setStoredDates(response.data.dates);
      })
      .catch(error => {
        console.error('Error fetching stored dates:', error);
      });
  }, [taskId]);

  const handleClick = (day) => {
    const fullDate = `${year}-${month}-${day}`;
    console.log(`Sending POST request with date: ${fullDate} and id: ${taskId}`);
    // Send date to server
    axios.post('http://localhost:3000', { date: fullDate, id: taskId })
      .then(response => {
        console.log('Date sent to server:', response.data);
        setStoredDates(response.data.dates);
      })
      .catch(error => {
        console.error('Error sending date to server:', error);
      });
  };

  const renderDays = () => {
    const days = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="empty-day" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const fullDate = `${year}-${month}-${day}`;
      const isStored = storedDates.includes(fullDate);

      const dayClassName = isStored ? 'day stored-date' : 'day';

      days.push(
        <div key={day} className={dayClassName} onClick={() => handleClick(day)}>
          {day}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="calendar">
      {renderDays()}
    </div>
  );
};

export default Calendar;
