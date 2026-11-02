import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SurveyResultsModal from '../components/SurveyResultsModal';
import RegistrantsModal from '../components/RegistrantsModal'; 

export default function ProfilePage({ currentUser }) {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [owned, setOwned] = useState([]); 
  const [stats, setStats] = useState({ surveys: 0, experiments: 0, created: 0 });
  const [loading, setLoading] = useState(true);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeProjectTitle, setActiveProjectTitle] = useState("");

  // New state to manage the results modal
  const [activeSurveyId, setActiveSurveyId] = useState(null);

  useEffect(() => {
    if (currentUser === null) {
      navigate('/login');
      return;
    }

    if (currentUser && currentUser.id) {
      const fetchUserData = async () => {
        try {
          setLoading(true);
          const response = await fetch(`http://localhost:8080/api/user_history/${currentUser.id}`, {
            credentials: 'include'
          });
          
          if (response.ok) {
            const data = await response.json();
            setHistory(data.history || []);
            setOwned(data.owned || []);
            setStats(data.stats || { surveys: 0, experiments: 0, created: 0 });
          }
        } catch (err) {
          console.error("Profile Fetch Error:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchUserData();
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;
  if (loading) return <div className="content">Loading profile...</div>;

  return (
    <main className="content">
      <div className="profile-container">
        <h1 className="page-title">My Profile</h1>

        {/* User Information (UNCHANGED) */}
        <div className="profile-section">
          <h2>Personal Information</h2>
          <div className="profile-info">
            <div className="info-row">
              <span className="info-label">Name:</span>
              <span className="info-value">{currentUser?.firstname} {currentUser?.lastname}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{currentUser?.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Username:</span>
              <span className="info-value">@{currentUser?.username}</span>
            </div>
          </div>
        </div>

        {/* SECTION 1: Participation History (UNCHANGED) */}
        <div className="profile-section">
          <h2>Participation History</h2>
          <div className="history-list">
            {history.length > 0 ? history.map((item, index) => (
              <div key={`hist-${index}`} className="history-item">
                <div className="history-main">
                  <h3>{item.title}</h3>
                  <span className={`status-badge ${item.status}`}>{item.status}</span>
                </div>
                <div className="participation-meta">
                  <span className={`type-badge ${item.type}`}>{item.type}</span>
                  <span className="participation-date">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )) : <p>No participation history yet.</p>}
          </div>
        </div>

        <div className="profile-section">
          <h2>My Created Research</h2>
          <div className="history-list">
            {owned.length > 0 ? owned.map((item, index) => (
              <div key={`owned-${index}`} className="history-item owner-item" style={{borderLeft: '4px solid #4a90e2'}}>
                <div className="history-main">
                  <h3>{item.title}</h3>
                  <div className="action-buttons">
                    <span className="status-badge owner">Owner</span>
                    {item.type === 'survey' && (
                      <button 
                        className="view-results-btn" 
                        onClick={() => setActiveSurveyId(item.survey_id)} 
                      >
                        📊 View Percentages
                      </button>
                    )}

                    {item.type === 'experiment' && (
                      <button 
                        className="view-registrants-btn" 
                        onClick={() => {
                          setActiveProjectId(item.project_id);
                          setActiveProjectTitle(item.title);
                        }}
                      >
                        👥 View Registrants
                      </button>
                    )}
                  </div>
                </div>
                <div className="participation-meta">
                  <span className={`type-badge ${item.type}`}>{item.type}</span>
                  <span className="participation-date">
                    Created: {new Date(item.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )) : <p>You haven't published any research yet.</p>}
          </div>
        </div>
      </div>

      {activeSurveyId && (
        <SurveyResultsModal 
          surveyId={activeSurveyId} 
          onClose={() => setActiveSurveyId(null)} 
        />
      )}

      {activeProjectId && (
        <RegistrantsModal 
          projectId={activeProjectId}
          projectTitle={activeProjectTitle}
          onClose={() => setActiveProjectId(null)}
        />
      )}
    </main>
  );
}