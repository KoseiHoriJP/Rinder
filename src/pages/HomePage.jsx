import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentDate] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/calendar_events');
        if (response.ok) {
          const data = await response.json();
          setAllData(data);
        }
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCards = allData.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- UPCOMING EVENTS LOGIC ---
  const upcomingEvents = allData
    .filter(item => new Date(item.start_date) >= new Date())
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
    .slice(0, 3);

  // --- CALENDAR LOGIC: FULL RANGE + SPLIT TYPES ---
  const getEventTypesForRange = (day) => {
    if (!day) return [];
    const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    cellDate.setHours(0, 0, 0, 0);

    const activeTypes = allData.filter(item => {
      const start = new Date(item.start_date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(item.end_date);
      end.setHours(23, 59, 59, 999);
      return cellDate >= start && cellDate <= end;
    });

    return [...new Set(activeTypes.map(ev => ev.study_type))];
  };

  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  };

  if (loading) return <div className="content">Loading research opportunities...</div>;

  return (
    <main className="content">
      <div className="home-hero">
        <div className="hero-text">
          <h1>Discover & Participate</h1>
          <p className="hero-subtitle">Join cutting-edge research studies at Ritsumeikan University.</p>
          
          {/* ENHANCED UPCOMING SECTION */}
          <div className="upcoming-events-container">
            <h2 className="upcoming-heading">Upcoming Events</h2>
            <div className="upcoming-list-large">
              {upcomingEvents.length > 0 ? upcomingEvents.map((event, idx) => (
                <div key={idx} className={`upcoming-card-mini ${event.study_type}`}>
                  <div className="upcoming-info">
                    <span className="upcoming-title">{event.title}</span>
                    <span className="upcoming-date">
                      Starts: {new Date(event.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <span className="upcoming-tag">{event.study_type}</span>
                </div>
              )) : <p>No upcoming events scheduled.</p>}
            </div>
          </div>
        </div>
        
        <div className="hero-widgets">
          <div className="mini-calendar">
            <h4>{currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}</h4>
            <div className="mini-grid">
              {['S','M','T','W','T','F','S'].map(d => <div key={d} className="day-label">{d}</div>)}
              {getCalendarDays().map((day, idx) => {
                const types = getEventTypesForRange(day);
                const hasSurvey = types.includes('survey');
                const hasExperiment = types.includes('experiment');

                return (
                  <div 
                    key={idx} 
                    className={`mini-day 
                      ${!day ? 'empty' : ''} 
                      ${hasSurvey ? 'has-survey' : ''} 
                      ${hasExperiment ? 'has-experiment' : ''}
                      ${hasSurvey && hasExperiment ? 'has-both-split' : ''}
                    `}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
            <Link to="/calendar" className="view-full-calendar">View Full Calendar →</Link>
          </div>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for surveys or experiments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="cards-grid">
        {filteredCards.map((item) => (
          <Link 
            to={`/${item.study_type === 'survey' ? 'survey' : 'experiment'}/${item.project_id}`} 
            key={`${item.study_type}-${item.project_id}`} 
            className="card-link"
          >
            <div className="card">
              <div className={`card-type ${item.study_type}`}>{item.study_type}</div>
              <h3>{item.title}</h3>
              <p className="researcher">Lab: {item.lab}</p>
              <div className="card-footer">
                <span className="due-date">Ends: {new Date(item.end_date).toLocaleDateString()}</span>
                <button className="btn-join">Details</button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}