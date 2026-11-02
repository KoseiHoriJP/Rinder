import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ExperimentRegistrationModal from '../components/RegistrationModal';

/**
 * ExperimentDetailPage
 * * Displays full details of a research project and allows users 
 * to register via a pre-filled verification modal.
 */
export default function ExperimentDetailPage({ currentUser }) {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [experiment, setExperiment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/projects/${id}`);
        if (response.ok) {
          const data = await response.json();
          setExperiment(data);
        }
      } catch (error) {
        console.error("Error fetching detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleOpenModal = () => {
    if (!currentUser) {
      alert("Please login to register for experiments.");
      return;
    }
    setIsModalOpen(true);
  };

  const handleRegistrationSuccess = () => {
    setRegistered(true);
    setIsModalOpen(false);
  };

  if (loading) return <div className="content">Loading details...</div>;
  if (!experiment) return <div className="content">Experiment not found.</div>;

  return (
    <main className="content">
      <div className="detail-container">
        <div className="detail-header">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
          <h1>{experiment.title}</h1>
          
          <div className="meta-info">
            <div className="meta-item">
              <strong>Laboratory:</strong> {experiment.lab_name}
            </div>
            <div className="meta-item">
              <strong>Status:</strong> 
              <span className={`status-tag ${experiment.is_recruiting ? 'recruiting' : 'closed'}`}>
                {experiment.is_recruiting ? '● Recruiting' : '● Closed'}
              </span>
            </div>
            <div className="meta-item">
              <strong>Dates:</strong> {new Date(experiment.start_date).toLocaleDateString()} - {new Date(experiment.end_date).toLocaleDateString()}
            </div>
            <div className="meta-item">
              <strong>Type:</strong> {experiment.study_type}
            </div>
          </div>
          
          <div className="description-box">
            <h3>About the Study</h3>
            <p className="detail-description">{experiment.description}</p>
          </div>
        </div>

        <div className="requirements-section">
          <h2>Eligibility & Criteria</h2>
          <div className="criteria-content">
            {experiment.eligibility_criteria ? (
              <p>{experiment.eligibility_criteria}</p>
            ) : (
              <p>No specific criteria listed for this study.</p>
            )}
          </div>
        </div>

        <div className="participate-section">
          {registered ? (
            <div className="registered-success-card">
              <h3>✓ Registration Confirmed</h3>
              <p>You have successfully signed up for this experiment. The researcher will contact you at <strong>{currentUser?.email}</strong> with next steps.</p>
            </div>
          ) : (
            <div className="action-card">
              <h3>Interested in participating?</h3>
              <p>Click below to verify your information and secure your spot in this study.</p>
              <button 
                onClick={handleOpenModal} 
                className="participate-btn"
                disabled={!experiment.is_recruiting}
              >
                {experiment.is_recruiting ? "Register to Participate" : "Registration Closed"}
              </button>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <ExperimentRegistrationModal 
          experiment={experiment} 
          currentUser={currentUser} 
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleRegistrationSuccess}
        />
      )}
    </main>
  );
}