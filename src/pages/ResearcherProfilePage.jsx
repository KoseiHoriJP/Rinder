import React from 'react';
import { useParams, Link } from 'react-router-dom';

export default function ResearcherProfilePage() {
  const { id } = useParams();

  // Sample researcher data (in real app, fetch by id)
  const researchers = {
    1: {
      name: 'Chidchanok Sittitaworn',
      lab: 'E-Society Lab',
      position: 'Bachelor 2nd year',
      email: 'researcher1@example.org',
      bio: 'I am working on a research about AI ethics and digital society.',
      researchInterests: [
        'AI Ethics',
        'Digital Healthcare',
        'Technology Policy',
        'Human-AI Interaction',
      ],
      activeResearch: [
        { id: 1, title: 'AI Ethics in Healthcare', type: 'survey' },
      ],
    },
    2: {
      name: 'Kosei Hori',
      lab: 'Digital Governance System Lab',
      position: 'Bachelor 2nd year',
      email: 'researcher2@example.org',
      bio: 'I want to do research on digital governance and social media impact on society.',
      researchInterests: [
        'Digital Governance',
        'Social Media Analysis',
        'Online Communities',
      ],
      activeResearch: [
        { id: 2, title: 'Social Media Usage Patterns', type: 'survey' },
      ],
    },
    5: {
      name: 'Gilbert Sogo',
      lab: 'Intelligent Computer Entertainment Lab',
      position: 'Bachelor 2nd year',
      email: 'researcher3@example.org',
      bio: 'I am currently researches VR gaming and interactive entertainment systems.',
      researchInterests: [
        'Virtual Reality',
        'Game Design',
        'User Experience',
        'Interactive Systems',
      ],
      activeResearch: [
        { id: 1, title: 'VR Gaming Interaction Study', type: 'experiment' },
      ],
    },
  };

  const researcher = researchers[id] || researchers[1];

  return (
    <main className="content">
      <div className="profile-container researcher-profile">
        <h1 className="page-title">{researcher.name}</h1>

        {/* Basic Information */}
        <div className="profile-section">
          <h2>Information</h2>
          <div className="profile-info">
            <div className="info-row">
              <span className="info-label">Position:</span>
              <span className="info-value">{researcher.position}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Laboratory:</span>
              <span className="info-value">{researcher.lab}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{researcher.email}</span>
            </div>
          </div>
        </div>

        {/* Biography */}
        <div className="profile-section">
          <h2>About</h2>
          <p className="bio-text">{researcher.bio}</p>
        </div>

        {/* Research Interests */}
        <div className="profile-section">
          <h2>Research Interests</h2>
          <div className="interests-tags">
            {researcher.researchInterests.map((interest, index) => (
              <span key={index} className="interest-tag">
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Active Research */}
        <div className="profile-section">
          <h2>Active Research Projects</h2>
          <div className="active-research-list">
            {researcher.activeResearch.map((research) => (
              <Link
                to={`/${research.type}/${research.id}`}
                key={research.id}
                className="research-link-item"
              >
                <span className="research-title">{research.title}</span>
                <span className={`type-badge ${research.type}`}>
                  {research.type}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
