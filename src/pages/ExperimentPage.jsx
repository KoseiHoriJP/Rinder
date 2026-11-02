import React, { useState, useEffect } from 'react'; // Added useEffect
import { Link } from 'react-router-dom';

export default function ExperimentPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [experiments, setExperiments] = useState([]); // State for DB data
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperiments = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/projects');
        if (response.ok) {
          const data = await response.json();
          setExperiments(data);
        }
      } catch (error) {
        console.error("Error fetching experiments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExperiments();
  }, []);

  const filteredExperiments = experiments.filter((exp) =>
    exp.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="content">Loading experiments...</div>;

  return (
    <main className="content">
      <h1 className="page-title">Available Experiments</h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search experiments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="cards-grid">
        {filteredExperiments.map((exp) => (
          /* Use project_id from your DB schema */
          <Link to={`/experiment/${exp.project_id}`} key={exp.project_id} className="card-link">
            <div className="card experiment-card">
              <h3>{exp.title}</h3>
              <p className="lab">{exp.lab_name}</p>
              <div className="experiment-info">
                <p>📅 Starts: {exp.start_date}</p>
                <p>🏁 Ends: {exp.end_date}</p>
                <p>👥 Max Participants: {exp.max_participants}</p>
              </div>
              <div className="card-footer">
                <span className={`status-tag ${exp.status}`}>
                  {exp.is_recruiting ? "🟢 Recruiting" : "🔴 Closed"}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}