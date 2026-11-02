import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function SurveyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    fetch(`http://localhost:8080/api/surveys/${id}`)
      .then(res => res.json())
      .then(data => setSurvey(data))
      .catch(err => console.error("Error:", err));
  }, [id]);

  const handleAnswerChange = (qNum, value) => {
    setAnswers({ ...answers, [qNum]: value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Create the payload using the 'answers' state
  const payload = {
    answers: answers 
  };

  try {
    const response = await fetch(`http://localhost:8080/api/surveys/${id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include' 
    });

    if (response.ok) {
      alert("Survey submitted!");
      navigate('/profile');
    } else {
      const errorData = await response.json();
      alert("Error: " + errorData.error);
    }
  } catch (error) {
    console.error("Submission error:", error);
  }
};
  if (!survey) return <div className="content">Loading survey details...</div>;

  return (
    <main className="content">
      <div className="detail-container">
        <h1>{survey.title}</h1>
        <p className="lab-info">{survey.lab} | Owner: {survey.survey_owner}</p>
        
        <form onSubmit={handleSubmit} className="survey-form">
          {survey.questions.map((q) => {
            const parts = q.content.split(' -');
            const questionText = parts[0].trim();
            const options = parts.slice(1).map(opt => opt.trim());

            return (
              <div key={q.question_id} className="question-block">
                <label className="question-label">
                  {q.question_number}. {questionText}
                </label>

                {/* 1. RADIO: One Answer */}
                {q.question_type === 'one_answer' && (
                  <div className="options-group">
                    {options.map((opt, i) => (
                      <label key={i} className="option-label">
                        <input
                          type="radio"
                          name={`q-${q.question_id}`}
                          value={opt}
                          onChange={(e) => handleAnswerChange(q.question_id, e.target.value)}
                          required
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}

                {/* 2. CHECKBOX: Multiple Answers */}
                {q.question_type === 'multiple_answers' && (
                  <div className="options-group">
                    {options.map((opt, i) => (
                      <label key={i} className="option-label">
                        <input
                          type="checkbox"
                          name={`q-${q.question_id}`}
                          value={opt}
                          onChange={(e) => {
                            // Logic to handle multiple selections in state
                            const current = answers[q.question_number] || [];
                            const updated = e.target.checked 
                              ? [...current, opt] 
                              : current.filter(val => val !== opt);
                            handleAnswerChange(q.question_number, updated);
                          }}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}

                {/* 3. RATING: 1-5 Scale */}
                {q.question_type === 'rating' && (
                  <div className="rating-row">
                    {[1, 2, 3, 4, 5].map(num => (
                      <label key={num} className="rating-item">
                        <input 
                          type="radio" 
                          name={`q-${q.question_id}`} 
                          value={num} 
                          onChange={(e) => handleAnswerChange(q.question_id, e.target.value)}
                          required
                        />
                        {num}
                      </label>
                    ))}
                    <span className="rating-label">(1 Low - 5 High)</span>
                  </div>
                )}

                {/* 4. TEXT: Short Answer (The Default) */}
                {q.question_type === 'short_answer' && (
                  <textarea 
                    className="text-answer" 
                    placeholder="Enter your response..."
                    onChange={(e) => handleAnswerChange(q.question_id, e.target.value)}
                    required
                  />
                )}
              </div>
            );
          })}
          <button type="submit" className="submit-btn">Submit Survey</button>
        </form>
      </div>
    </main>
  );
}