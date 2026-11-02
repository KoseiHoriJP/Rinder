import React, { useState, useEffect } from 'react';

export default function RegistrantsModal({ projectId, projectTitle, onClose }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8080/api/experiments/${projectId}/registrants`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setList(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, [projectId]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content registrants-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Registrants: {projectTitle}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        {loading ? <p>Loading...</p> : (
          <div className="table-container">
            {list.length === 0 ? <p>No one has registered yet.</p> : (
              <table className="registrants-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((user, idx) => (
                    <tr key={idx}>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{new Date(user.registration_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}