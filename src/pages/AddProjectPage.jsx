import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddProjectPage({ currentUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    projectId: '',
    title: '',
    description: '',
    keywords: '',
    labName: '',
    status: 'active',
    maxParticipants: '',
    startDate: '',
    endDate: '',
    eligibilityCriteria: '',
    studyType: 'experiment',
    isRecruiting: true
  });

  const laboratories = [
    'Advanced Computer Graphics and Digital Humans Lab',
    'Affective Engineering and Computer Graphics Lab',
    'Digital Governance System Lab',
    'E-Society Lab',
    'Visual Information Engineering Lab',
    'Intelligent Computer Entertainment Lab',
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("You must be logged in to create a project.");
      return;
    }

    const projectData = {
      ...formData,
      owner: `${currentUser.firstname} ${currentUser.lastname}`,
      creator_id: currentUser.id 
    };

    try {
      const response = await fetch('http://localhost:8080/api/add_project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
        credentials: 'include'
      });

      if (response.ok) {
        alert("Project created successfully!");
        navigate('/profile');
      } else {
        const err = await response.json();
        alert("Error: " + err.error);
      }
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  return (
    <main className="content">
      <div className="form-container wide-form">
        <h1>Create Research Project</h1>
        <form onSubmit={handleSubmit} className="add-project-form">
          
          {/* ROW 1: ID and Title */}
          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="projectId">Project ID</label>
              <input
                type="text"
                id="projectId"
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                placeholder="e.g., PROJ-101"
                required
              />
            </div>
            <div className="form-group flex-3">
              <label htmlFor="title">Study Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter project title"
                required
              />
            </div>
          </div>

          {/* ROW 2: Lab and Owner */}
          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="labName">Laboratory</label>
              <select
                id="labName"
                name="labName"
                value={formData.labName}
                onChange={handleChange}
                required
              >
                <option value="">Select a Lab</option>
                {laboratories.map(lab => (
                  <option key={lab} value={lab}>{lab}</option>
                ))}
              </select>
            </div>
            <div className="form-group flex-1">
              <label>Project Lead (Auto-filled)</label>
              <input
                type="text"
                className="disabled-input"
                value={currentUser ? `${currentUser.firstname} ${currentUser.lastname}` : "Loading..."}
                disabled
              />
            </div>
          </div>

          {/* ROW 3: Keywords and Max Participants */}
          <div className="form-row">
            <div className="form-group flex-2">
              <label htmlFor="keywords">Keywords (Comma separated)</label>
              <input
                type="text"
                id="keywords"
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                placeholder="e.g., AI, HCI, Psychology"
              />
            </div>
            <div className="form-group flex-1">
              <label htmlFor="maxParticipants">Max Participants</label>
              <input
                type="number"
                id="maxParticipants"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                placeholder="e.g., 50"
              />
            </div>
          </div>

          {/* ROW 4: Description (Full Width) */}
          <div className="form-group">
            <label htmlFor="description">Detailed Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the goals and procedures..."
              rows="4"
              required
            />
          </div>

          {/* ROW 5: Dates and Recruitment */}
          <div className="form-row align-center">
            <div className="form-group flex-1">
              <label htmlFor="startDate">Start Date</label>
              <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} required />
            </div>
            <div className="form-group flex-1">
              <label htmlFor="endDate">End Date</label>
              <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} required />
            </div>
            <div className="form-group flex-1 checkbox-container">
               <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isRecruiting"
                  checked={formData.isRecruiting}
                  onChange={handleChange}
                />
                Recruiting
              </label>
            </div>
          </div>

          {/* ROW 6: Eligibility (Full Width) */}
          <div className="form-group">
            <label htmlFor="eligibilityCriteria">Eligibility Criteria</label>
            <textarea
              id="eligibilityCriteria"
              name="eligibilityCriteria"
              value={formData.eligibilityCriteria}
              onChange={handleChange}
              placeholder="Who can participate?"
              rows="2"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">Create Project</button>
            <button type="button" className="btn-cancel" onClick={() => navigate('/')}>Cancel</button>
          </div>
        </form>
      </div>
    </main>
  );
}