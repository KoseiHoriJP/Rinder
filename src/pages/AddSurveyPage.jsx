import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddSurveyPage({ currentUser }) {
  const navigate = useNavigate();
  
  // State for form data - owner is initialized from currentUser
  const [formData, setFormData] = useState({
    title: '', 
    lab: '', 
    owner: '', // Will be set in useEffect
    openDate: '', 
    dueDate: '', 
    eligibility: ''
  });

  const [questions, setQuestions] = useState([
    { type: 'one_answer', questionText: '', options: [''] }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill owner when currentUser is available
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        owner: `${currentUser.firstname} ${currentUser.lastname}`
      }));
    }
  }, [currentUser]);

  const laboratories = [
    'Advanced Computer Graphics and Digital Humans Lab',
    'Affective Engineering and Computer Graphics Lab',
    'Digital Governance System Lab',
    'E-Society Lab',
    'Visual Information Engineering Lab',
    'Intelligent Computer Entertainment Lab',
  ];

  const addQuestion = () => {
    setQuestions([...questions, { type: 'one_answer', questionText: '', options: [''] }]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestionType = (index, type) => {
    const newQuestions = [...questions];
    newQuestions[index].type = type;
    // Options are only needed for One Answer or Multiple Answer types
    if (type === 'short_answer' || type === 'rating') {
      newQuestions[index].options = [];
    } else if (newQuestions[index].options.length === 0) {
      newQuestions[index].options = [''];
    }
    setQuestions(newQuestions);
  };

  const addOption = (qIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push('');
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex, optIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[optIndex] = value;
    setQuestions(newQuestions);
  };

  const removeOption = (qIndex, optIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.splice(optIndex, 1);
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Format questions for backend storage
    const formattedQuestions = questions.map(q => {
      let content = q.questionText;
      if (q.options && q.options.length > 0) {
        // Appends options with ' -' separator as per your old logic
        const validOptions = q.options.filter(opt => opt.trim() !== '');
        if (validOptions.length > 0) {
            content += ' -' + validOptions.join(' -');
        }
      }
      return { type: q.type, content: content };
    });

    const payload = {
      ...formData,
      creator_id: currentUser?.id,
      questions: formattedQuestions
    };

    try {
      const response = await fetch('http://localhost:8080/api/add_survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Success: Your survey has been published!");
        navigate('/survey');
      } else {
        alert("Error: " + (result.error || "Failed to publish survey"));
      }
    } catch (err) {
      alert("❌ Network Error: Could not connect to the server.");
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="content">
      <div className="add-project-container">
        <h1 className="page-title">Publish New Survey</h1>
        
        <form onSubmit={handleSubmit} className="project-form">
          <div className="form-section">
            <h2 className="section-title">General Information</h2>
            <div className="form-group">
              <label>Survey Title</label>
              <input 
                type="text" 
                placeholder="e.g., Privacy in Social Media" 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})} 
                required 
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Laboratory</label>
                <select 
                  value={formData.lab}
                  onChange={e => setFormData({...formData, lab: e.target.value})} 
                  required
                >
                  <option value="">Select a Lab</option>
                  {laboratories.map(lab => <option key={lab} value={lab}>{lab}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Lead Researcher</label>
                <input 
                  type="text" 
                  placeholder="Name" 
                  value={formData.owner}
                  onChange={e => setFormData({...formData, owner: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input 
                  type="date" 
                  onChange={e => setFormData({...formData, openDate: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input 
                  type="date" 
                  onChange={e => setFormData({...formData, dueDate: e.target.value})} 
                  required 
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">Survey Content</h2>
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="question-builder-item">
                <div className="question-header">
                  <span>Question {qIndex + 1}</span>
                  <button type="button" className="remove-q-btn" onClick={() => removeQuestion(qIndex)}>Delete Question</button>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ flex: '0 0 220px' }}>
                    <label>Response Type</label>
                    <select value={q.type} onChange={e => updateQuestionType(qIndex, e.target.value)}>
                      <option value="one_answer">One Answer (Radio)</option>
                      <option value="multiple_answers">Multiple Answers (Checkbox)</option>
                      <option value="rating">Rating Scale (1-5)</option>
                      <option value="short_answer">Short Answer (Text)</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: '1' }}>
                    <label>Question Text</label>
                    <input 
                      type="text" 
                      placeholder="Enter your question here..."
                      value={q.questionText}
                      onChange={e => {
                        const n = [...questions];
                        n[qIndex].questionText = e.target.value;
                        setQuestions(n);
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Show options only for One Answer or Multiple Answers */}
                {(q.type === 'one_answer' || q.type === 'multiple_answers') && (
                  <div className="options-container">
                    <label className="options-label">Choices</label>
                    {q.options.map((opt, optIndex) => (
                      <div key={optIndex} className="option-input-row">
                        <div className="option-bullet"></div>
                        <input 
                          type="text" 
                          placeholder={`Option ${optIndex + 1}`} 
                          value={opt}
                          onChange={e => updateOption(qIndex, optIndex, e.target.value)}
                          required
                        />
                        {q.options.length > 1 && (
                          <button type="button" onClick={() => removeOption(qIndex, optIndex)} className="btn-remove-opt">×</button>
                        )}
                      </div>
                    ))}
                    <button type="button" className="btn-add-opt" onClick={() => addOption(qIndex)}>+ Add Choice</button>
                  </div>
                )}
              </div>
            ))}
            <button type="button" className="secondary-btn" onClick={addQuestion}>+ Add New Question</button>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? "Publishing..." : "Publish Survey"}
            </button>
            <button type="button" className="btn-cancel" onClick={() => navigate('/survey')}>Cancel</button>
          </div>
        </form>
      </div>
    </main>
  );
}