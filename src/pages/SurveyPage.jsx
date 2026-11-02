import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function SurveyPage() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('http://localhost:8080/api/surveys')
      .then(res => res.json())
      .then(data => {
        setSurveys(data);
        setLoading(false);
      })
      .catch(err => console.error("Error fetching surveys:", err));
  }, []);

  const filteredSurveys = surveys.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <main className="content">Loading surveys...</main>;

  return (
    <main className="content">
      <h1 className="page-title">Available Surveys</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search surveys..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="cards-grid">
        {filteredSurveys.map((s) => (
          <Link to={`/survey/${s.survey_id}`} key={s.survey_id} className="card-link">
            <div className="card survey-card">
              <h3>{s.title}</h3>
              <p className="researcher">by {s.survey_owner}</p>
              <p className="lab">{s.lab}</p>
              <div className="card-footer">
                <span className="due-date">Due: {s.due_date}</span>
                <span className="type-tag">Survey</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}