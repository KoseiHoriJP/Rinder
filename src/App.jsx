import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import HomePage from "./pages/HomePage";
import SurveyPage from "./pages/SurveyPage";
import ExperimentPage from "./pages/ExperimentPage";
import CalendarPage from "./pages/CalendarPage";
import ProfilePage from "./pages/ProfilePage";
import SurveyDetailPage from "./pages/SurveyDetailPage";
import ExperimentDetailPage from "./pages/ExperimentDetailPage";
import ResearcherProfilePage from "./pages/ResearcherProfilePage";
import AddProjectPage from "./pages/AddProjectPage";
import AddSurveyPage from "./pages/AddSurveyPage";
import "./style.css";

export default function App() {
  const [loginFormOpen, setLoginFormOpen] = useState(false);
  const [registerFormOpen, setRegisterFormOpen] = useState(false);
  const [infoPopupOpen, setInfoPopupOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    console.log("App received user data:", userData);
    setIsLoggedIn(true);
    setCurrentUser(userData); 
    setLoginFormOpen(false);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const formData = {
      firstName: e.target.firstname.value,
      lastName: e.target.lastname.value,
      email: e.target.email.value,
      year: e.target.year.value,
      lab: e.target.lab?.value || "Not assigned",
    };
    console.log("Register submitted:", formData);
    setIsLoggedIn(true);
    setCurrentUser({
      email: formData.email,
      name: `${formData.firstName} ${formData.lastName}`,
      year: formData.year,
      lab: formData.lab,
    });
    setRegisterFormOpen(false);
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8080/logout', { credentials: 'include' });
    } catch (err) {
      console.error("Logout error:", err);
    }
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  const switchToRegister = () => {
    setLoginFormOpen(false);
    setRegisterFormOpen(true);
  };

  const switchToLogin = () => {
    setRegisterFormOpen(false);
    setLoginFormOpen(true);
  };

  return (
    <Router>
      <div className="container">
        <Header
          isLoggedIn={isLoggedIn}
          onLoginClick={() => setLoginFormOpen(true)}
          onLogoutClick={handleLogout}
          onInfoClick={() => setInfoPopupOpen(true)}
        />
        <Navbar />

        {/* Login Form */}
        {loginFormOpen && (
          <LoginForm
            onLoginSuccess={handleLoginSuccess}
            onClose={() => setLoginFormOpen(false)}
            onSwitchToRegister={switchToRegister}
          />
        )}

        {/* Register Form */}
        {registerFormOpen && (
          <RegisterForm
            onSubmit={handleRegister}
            onClose={() => setRegisterFormOpen(false)}
            onSwitchToLogin={switchToLogin}
          />
        )}

        {infoPopupOpen && (
          <div className="form-popup">
            <div className="form-container info-popup">
              <h1>What's the difference?</h1>

              <div className="info-content">
                <div className="info-section">
                  <h3>📋 Survey</h3>
                  <p>
                    Surveys are questionnaires already posted on our platform.
                    You can complete them immediately at your convenience.
                    Perfect for quick participation and sharing your opinions!
                  </p>
                </div>

                <div className="info-section">
                  <h3>🔬 Experiment</h3>
                  <p>
                    Experiments are scheduled events conducted at specific
                    locations and times. Registration is required, and you'll
                    need to attend in person. Great for hands-on research
                    participation!
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="btn cancel"
                onClick={() => setInfoPopupOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/survey" element={<SurveyPage />} />
          <Route path="/survey/:id" element={<SurveyDetailPage />} />
          <Route path="/experiment" element={<ExperimentPage />} />
          <Route path="/experiment/:id" element={<ExperimentDetailPage currentUser={currentUser} />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route
            path="/profile"
            element={<ProfilePage currentUser={currentUser} />}
          />
          <Route path="/researcher/:id" element={<ResearcherProfilePage />} />
          <Route path="/add-project" element={<AddProjectPage currentUser={currentUser} />} />

          <Route path="/add-survey" element={<AddSurveyPage currentUser={currentUser} />} />
        </Routes>
      </div>
    </Router>
  );
}
