import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Bell, User, LogIn, ShieldCheck } from 'lucide-react';

export default function TopBar({ onToggleSidebar, onToggleMobile, collapsed = false }) {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  const handleToggle = onToggleSidebar || onToggleMobile;

  // Page title resolution
  const getPageTitle = (path) => {
    if (path === '/') return 'Student Home Dashboard';
    if (path.startsWith('/explore')) return 'Find Scholarships';
    if (path.startsWith('/dashboard')) return 'My Dashboard';
    if (path.startsWith('/profile')) return 'My Profile & Eligibility Details';
    if (path.startsWith('/applications')) return 'My Scholarship Applications';
    if (path.startsWith('/saved')) return 'Saved Scholarships';
    if (path.startsWith('/notifications')) return 'Notifications';
    if (path.startsWith('/help')) return 'Help and Support';
    if (path.startsWith('/admin')) return 'Administrator Console';
    if (path.startsWith('/login')) return 'Account Sign In';
    if (path.startsWith('/register')) return 'Create Student Account';
    return 'ScholarFind';
  };

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <button
          onClick={handleToggle}
          className="sidebar-toggle-btn"
          aria-label={collapsed ? 'Expand sidebar menu' : 'Collapse sidebar menu'}
          title={collapsed ? 'Expand sidebar menu' : 'Collapse sidebar menu'}
        >
          <Menu size={20} />
        </button>

        <h1 className="top-bar-title">{getPageTitle(location.pathname)}</h1>
      </div>

      <div className="top-bar-right">
        <Link to="/explore" className="btn btn-secondary btn-sm" style={{ display: 'none', md: 'inline-flex' }}>
          Find Scholarships
        </Link>

        <Link
          to="/notifications"
          className="sidebar-toggle-btn"
          title="Notifications"
          style={{ position: 'relative' }}
        >
          <Bell size={18} />
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '8px',
            height: '8px',
            backgroundColor: '#2563eb',
            borderRadius: '50%'
          }} />
        </Link>

        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link
              to={isAdmin ? '/admin' : '/profile'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                color: 'var(--navy-900)'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--blue-50)',
                color: 'var(--blue-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600',
                fontSize: '0.85rem',
                border: '1px solid var(--blue-100)'
              }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ lineHeight: '1.2' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{user?.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {user?.role === 'admin' ? 'Administrator' : 'Student'}
                </div>
              </div>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/login" className="btn btn-outline btn-sm">
              <LogIn size={15} />
              <span>Log In</span>
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              <span>Register</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
