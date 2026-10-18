import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isStudent, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="container navbar">
        <Link to="/" className="nav-brand">
          ScholarFind
        </Link>

        <nav className="nav-links">
          <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Home
          </NavLink>
          <NavLink to="/explore" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Explore Scholarships
          </NavLink>
          {isAuthenticated && isStudent && (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                My Dashboard
              </NavLink>
              <NavLink to="/profile" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                My Profile
              </NavLink>
            </>
          )}
          {isAuthenticated && isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Admin Dashboard
            </NavLink>
          )}
        </nav>

        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <span className="text-sm font-medium text-muted">
                {user.name.split(' ')[0]} ({user.role})
              </span>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
