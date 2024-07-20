import React, { useState } from "react";
import "./App.css";
import "./Calendar.css"; // Import the Calendar styles
import Calendar from "./Calendar";
import Header from "./Header";

function App() {
  const year = new Date().getFullYear();

  const month = new Date().getMonth() + 1; // July (months are zero-indexed in JavaScript)

  const [inputValue, setInputValue] = useState("");
  const [tasks, setTasks] = useState([]);

  // Function to get month name from month number
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

  const handleClick = () => {
    setTasks([...tasks, inputValue]);
    setInputValue(""); // Clear input after adding
    console.log(tasks);
  };

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  return (
    <>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="Add Quest"
      />
      <button onClick={handleClick}>Add Quest</button>
      <div className="container">
        {tasks.map((task, index) => (
          <div
            key={index}
            className="task-wrapper"
            style={{ marginBottom: "20px" }}
          >
            <h3>{task}</h3>
            <div
              className="calendar-section"
              style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
            >
              {/* Render calendars for the current and previous months in the previous year */}
              {Array.from({ length: 12 - month }, (_, j) => (
                <div
                  key={`${year - 1}-${month + 1 + j}-${index}`}
                  className="calendar-wrapper"
                >
                  <h5>
                    {getMonthName(month + 1 + j)} {year - 1}
                  </h5>
                  <Calendar
                    year={year - 1}
                    month={month + 1 + j}
                    taskId={index}
                  />
                </div>
              ))}
              {/* Render calendars for the previous months in the current year */}
              {Array.from({ length: month }, (_, i) => (
                <div
                  key={`${year}-${i + 1}-${index}`}
                  className="calendar-wrapper"
                >
                  <h5>
                    {getMonthName(i + 1)} {year}
                  </h5>
                  <Calendar year={year} month={i + 1} taskId={index+1} />
                </div>
              ))}
            </div>
            <hr />
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
