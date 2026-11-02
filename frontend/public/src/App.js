import React, { useState } from 'react';
import './style.css';

export default function App() {
  const [labDropdownOpen, setLabDropdownOpen] = useState(false);
  const [loginFormOpen, setLoginFormOpen] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    // Add your login logic here
    console.log('Login submitted');
    setLoginFormOpen(false);
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="logo"> Render </div>
        <nav className="nav">
          <button>EN / JP</button>
          <button onClick={() => setLoginFormOpen(true)}>Login</button>
        </nav>
      </header>
      {/* Filter Top Bar */}
      <div className="topbar">
        <div className="topbarMenu">
          <button>Home</button>
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
              <a href="#">Advanced Computer Graphics and Digital Humans Lab</a>
              <a href="#">Affective Engineering and Computer Graphics Lab</a>
              <a href="#">Digital Governance System Lab</a>
              <a href="#">E-Society Lab</a>
              <a href="#">Visual Information Engineering Lab</a>
              <a href="#">Intelligent Computer Entertainment Lab</a>
            </div>
          )}
        </div>

        <div className="topbarMenu">
          <button>Survey</button>
        </div>

        <div className="topbarMenu">
          <button>Experiment</button>
        </div>

        <div className="topbarMenu">
          <button>Calendar</button>
        </div>
      </div>
      {/* Login Popup Form */}
      {loginFormOpen && (
        <div className="form-popup" id="myForm">
          <form onSubmit={handleLogin} className="form-container">
            <h1>Login</h1>

            <label htmlFor="email">
              <b>Email</b>
            </label>
            <input
              type="text"
              placeholder="Enter Email"
              name="email"
              required
            />

            <label htmlFor="psw">
              <b>Password</b>
            </label>
            <input
              type="password"
              placeholder="Enter Password"
              name="psw"
              required
            />

            <button type="submit" className="btn">
              Login
            </button>
            <button
              type="button"
              className="btn cancel"
              onClick={() => setLoginFormOpen(false)}
            >
              Close
            </button>
          </form>
        </div>
        //add register button
      )}
      {/* Main Content - Research Cards */}
      <main className="content">
        <div className="search-bar">
          <input type="text" placeholder="Search research..." />
        </div>

        <div className="cards-grid">
          <div className="card">Research Card 1</div>
          <div className="card">Research Card 2</div>
          <div className="card">Research Card 3</div>
          <div className="card">Research Card 4</div>
        </div>
      </main>
    </div>
  );
}
