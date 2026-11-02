import React, { useState } from 'react';

export default function ExperimentRegistrationModal({ experiment, currentUser, onClose }) {
  // Pre-fill with user data from the currentUser prop
  const [formData, setFormData] = useState({
    name: `${currentUser?.firstname || ''} ${currentUser?.lastname || ''}`.trim() || currentUser?.username,
    email: currentUser?.email || '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8080/api/experiments/${experiment.project_id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      if (response.ok) {
        alert("Registration Successful!");
        onClose();
      } else {
        alert("Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Experiment Registration</h2>
        <p>Confirm your details for: <strong>{experiment.title}</strong></p>
        
        <form onSubmit={handleSubmit} className="registration-form">
          <label>Full Name</label>
          <input 
            type="text" 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />

          <label>Email</label>
          <input 
            type="email" 
            value={formData.email} 
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />

          <label>Additional Notes (Optional)</label>
          <textarea 
            placeholder="Any allergies or accessibility needs?"
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          />

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Confirm Registration</button>
          </div>
        </form>
      </div>
    </div>
  );
}