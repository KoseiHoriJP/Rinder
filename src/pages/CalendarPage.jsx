import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch real projects from the database
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/calendar_events');
        if (response.ok) {
          const data = await response.json();
          // Ensure data is an array before setting state
          setProjects(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error fetching calendar data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // 2. Logic to check if a project is active on a specific day
  const getEventsForDate = (day) => {
    if (!day || !projects || projects.length === 0) return [];
    
    // Create a Date object for the specific calendar cell (Local Time)
    const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    cellDate.setHours(0, 0, 0, 0);

    return projects.filter((proj) => {
      if (!proj.start_date || !proj.end_date) return false;

      const start = new Date(proj.start_date);
      const end = new Date(proj.end_date);
      
      // Normalize to midnight for accurate day-to-day comparison
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      
      return cellDate >= start && cellDate <= end;
    });
  };

  const getCalendarDates = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dates = [];
    for (let i = 0; i < firstDay; i++) dates.push(null);
    for (let i = 1; i <= daysInMonth; i++) dates.push(i);
    return dates;
  };

  const changeMonth = (delta) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  if (loading) return <main className="content"><div className="loading">Loading Research Calendar...</div></main>;

  return (
    <main className="content">
      <div className="calendar-main-container">
        <h1 className="page-title">Research Events Calendar</h1>
        
        {/* Navigation & Legend Header */}
        <div className="calendar-header-actions">
          <div className="calendar-navigation">
            <button className="nav-btn" onClick={() => changeMonth(-1)}>‹ Previous</button>
            <h2 className="month-display">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button className="nav-btn" onClick={() => changeMonth(1)}>Next ›</button>
          </div>

          <div className="calendar-legend">
            <div className="legend-item">
              <span className="legend-dot experiment"></span> 
              <span>Experiment</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot survey"></span> 
              <span>Survey</span>
            </div>
          </div>
        </div>

        {/* Main Calendar Grid */}
        <div className="full-calendar">
          <div className="calendar-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="day-header">{d}</div>
            ))}

            {getCalendarDates().map((day, index) => {
              const dayEvents = getEventsForDate(day);
              return (
                <div key={index} className={`calendar-cell ${!day ? 'empty' : ''}`}>
                  {day && (
                    <>
                      <div className="day-number">{day}</div>
                      <div className="event-bars-container">
                        {dayEvents.map((proj) => {
                          // Clean up type for routing and CSS classes
                          const type = (proj.study_type || 'experiment').trim().toLowerCase();
                          return (
                            <Link
                              key={`${proj.project_id}-${day}`} // Composite key prevents render issues
                              to={`/${type}/${proj.project_id}`}
                              className={`calendar-event-label ${type}`}
                              title={proj.title}
                            >
                              <span className="event-title-text">{proj.title}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}