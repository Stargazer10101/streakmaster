import React, { useState } from 'react';

import axios from 'axios';

const Calendar = ({ year, month }) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const [selectedDate, setSelectedDate] = useState(null);

  const handleClick = (day) => {
    const fullDate = `${year}-${month + 1}-${day}`;
    
    // Check if the date already exists in localStorage
    const storedDate = localStorage.getItem(fullDate);
  
    if (storedDate) {
      // Date already exists, so remove it from localStorage
      localStorage.removeItem(fullDate);
      setSelectedDate(null); // Clear selected date in state
    } else {
      // Date doesn't exist, store it in localStorage
      localStorage.setItem(fullDate, fullDate);
      setSelectedDate(fullDate);
    }

    // Send date to server
    axios.post('http://localhost:3000', { date: fullDate })
      .then(response => {
        console.log('Date sent to server:', response.data);
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
      const fullDate = `${year}-${month + 1}-${day}`;
      const isStored = localStorage.getItem(fullDate) !== null;
  
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