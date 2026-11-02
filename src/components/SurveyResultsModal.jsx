import React, { useState, useEffect } from 'react';

export default function SurveyResultsModal({ surveyId, onClose }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8080/api/surveys/${surveyId}/results`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, [surveyId]);

  if (loading) return (
    <div className="modal-overlay"><div className="modal-content">Calculating...</div></div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          {/* Added ?. to prevent crashing if results isn't ready */}
          <h2>{results?.title || "Loading Title..."}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <p className="total-stats">Total Respondents: {results?.total || 0}</p>
        <div className="results-scroll">
          {/* Added ?. to results and data */}
          {results?.data?.map((q, idx) => (
            <div key={idx} className="question-result">
              <h4>Q: {q.question}</h4>
              {q.percentages && Object.entries(q.percentages).map(([option, percent]) => (
                <div key={option} className="percent-row">
                  <div className="label-group">
                    <span>{option}</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="bar-bg">
                    <div className="bar-fill" style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}