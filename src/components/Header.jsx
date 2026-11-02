import React from 'react';
import { Link } from 'react-router-dom';

export default function Header({ isLoggedIn, onLoginClick, onLogoutClick, onInfoClick }) {
  return (
    <header className="header">
      <Link to="/" className="logo">
        Rinder
      </Link>
      <nav className="nav">
        <button>EN / JP</button>
        <button onClick={onInfoClick}>Info</button>
        {isLoggedIn ? (
          <>
            <Link to="/profile">
              <button>Profile</button>
            </Link>
            <button onClick={onLogoutClick}>Logout</button>
          </>
        ) : (
          <button onClick={onLoginClick}>Login</button>
        )}
      </nav>
    </header>
  );
}
