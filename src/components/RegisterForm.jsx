import React, { useState } from 'react';

export default function RegisterForm({ onRegisterSuccess, onClose, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    username: '',
    password: '',
    passwordRepeat: '',
    user_type: 'student' // Default value
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.passwordRepeat) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          password: formData.password,
          user_type: formData.user_type
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful! Please login.");
        onSwitchToLogin(); // Send them back to login
      } else {
        setError(data.error || "Registration failed.");
      }
    } catch (err) {
      console.error("Register Error:", err);
      setError("Could not connect to server.");
    }
  };

  return (
    <div className="form-popup">
      <form onSubmit={handleSubmit} className="form-container">
        <h1>Register</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div className="name-row" style={{display: 'flex', gap: '10px'}}>
          <input type="text" placeholder="First Name" name="firstname" onChange={handleChange} required />
          <input type="text" placeholder="Last Name" name="lastname" onChange={handleChange} required />
        </div>

        <label><b>Email</b></label>
        <input type="email" placeholder="Enter Email" name="email" onChange={handleChange} required />

        <label><b>Username</b></label>
        <input type="text" placeholder="Choose Username" name="username" onChange={handleChange} required />

        <label><b>Password</b></label>
        <input type="password" placeholder="Enter Password" name="password" onChange={handleChange} required />

        <label><b>Repeat Password</b></label>
        <input type="password" placeholder="Repeat Password" name="passwordRepeat" onChange={handleChange} required />

        <label><b>I am a:</b></label>
        <select name="user_type" onChange={handleChange} value={formData.user_type}>
          <option value="student">Student</option>
          <option value="professor">Professor</option>
        </select>

        <button type="submit" className="btn">Register</button>
        <button type="button" className="btn cancel" onClick={onClose}>Close</button>
        <p className="switch-form">
          Already have an account? <span onClick={onSwitchToLogin} style={{color: 'blue', cursor: 'pointer'}}>Login here</span>
        </p>
      </form>
    </div>
  );
} 