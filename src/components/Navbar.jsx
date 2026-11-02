import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [labDropdownOpen, setLabDropdownOpen] = useState(false);

  const labs = [
    'Advanced Computer Graphics and Digital Humans Lab',
    'Affective Engineering and Computer Graphics Lab',
    'Digital Governance System Lab',
    'E-Society Lab',
    'Visual Information Engineering Lab',
    'Intelligent Computer Entertainment Lab',
  ];

  return (
    <div className="topbar">
      <div className="topbarMenu">
        <Link to="/">
          <button>Home</button>
        </Link>
      </div>

      {/* Laboratory Dropdown */}
      <div
        className="topbarMenu dropdown"
        onMouseEnter={() => setLabDropdownOpen(true)}
        onMouseLeave={() => setLabDropdownOpen(false)}
      >
        <button
          className="dropdown-btn"
          onClick={() => setLabDropdownOpen(!labDropdownOpen)}
        >
          Laboratory ▼
        </button>

        {labDropdownOpen && (
          <div className="dropdown-content">
            {labs.map((lab, index) => (
              <a href="#" key={index}>
                {lab}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="topbarMenu">
        <Link to="/survey">
          <button>Survey</button>
        </Link>
      </div>

      <div className="topbarMenu">
        <Link to="/experiment">
          <button>Experiment</button>
        </Link>
      </div>

      <div className="topbarMenu">
        <Link to="/calendar">
          <button>Calendar</button>
        </Link>
      </div>

      <div className="topbarMenu">
        <Link to="/add-project">
          <button>Create Project</button>
        </Link>
      </div>

      <div className="topbarMenu">
        <Link to="/add-survey">
          <button>Create Survey</button>
        </Link>
      </div>
    </div>
  );
}
