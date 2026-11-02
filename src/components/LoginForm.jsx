import React, { useState } from 'react';

export default function LoginForm({ onLoginSuccess, onClose, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // IMPORTANT: include credentials to allow Flask to set the session cookie
        credentials: 'include', 
        body: JSON.stringify({
          username: email, // Your backend looks for 'username'
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful:", data);
        onLoginSuccess(data); // Pass user data back to App.jsx
        onClose();
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError('Could not connect to server. Is Flask running?');
    }
  };

  return (
    <div className="form-popup">
      <form onSubmit={handleSubmit} className="form-container">
        <h1>Login</h1>
        
        {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}

        <label htmlFor="email"><b>Email / Username</b></label>
        <input
          type="text"
          placeholder="Enter Email or Username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="psw"><b>Password</b></label>
        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="btn">Login</button>
        <button type="button" className="btn cancel" onClick={onClose}>Close</button>

        <p className="switch-form">
          Don't have an account?{' '}
          <span onClick={onSwitchToRegister} style={{cursor:'pointer', color:'blue'}}>Register here</span>
        </p>
      </form>
    </div>
  );
}