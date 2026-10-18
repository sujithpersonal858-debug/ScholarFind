import React from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  Compass,
  LayoutDashboard,
  User,
  FileText,
  Bookmark,
  Bell,
  HelpCircle,
  LogOut,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  BarChart3,
  Users,
  Sliders,
  PlusCircle,
  Settings
} from 'lucide-react';

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { user, isAuthenticated, isAdmin, isStudent, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobile = () => {
    if (setMobileOpen) setMobileOpen(false);
  };

  // Determine if on admin views
  const isAdminView = isAdmin && location.pathname.startsWith('/admin');

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`sidebar-backdrop ${mobileOpen ? 'active' : ''}`}
        onClick={closeMobile}
      />

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <Link to="/" onClick={closeMobile} className="brand-text">
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--blue-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <GraduationCap size={20} color="#ffffff" />
            </div>
            {!collapsed && (
              <span>ScholarFind</span>
            )}
          </Link>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="sidebar-toggle-btn"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              style={{ color: '#cbd5e1', borderColor: 'rgba(255,255,255,0.15)' }}
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <div className="sidebar-menu">
          {isAdminView ? (
            /* Administrator Menu */
            <>
              {!collapsed && <div className="sidebar-heading">Admin Console</div>}

              <NavLink to="/admin" end onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Overview">
                <LayoutDashboard size={18} className="sidebar-link-icon" />
                {!collapsed && <span>Overview</span>}
              </NavLink>

              <NavLink to="/admin/scholarships" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Manage Scholarships">
                <FileText size={18} className="sidebar-link-icon" />
                {!collapsed && <span>Manage Scholarships</span>}
              </NavLink>

              <NavLink to="/admin/scholarships/new" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Add Scholarship">
                <PlusCircle size={18} className="sidebar-link-icon" />
                {!collapsed && <span>Add Scholarship</span>}
              </NavLink>

              <NavLink to="/admin/students" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Manage Students">
                <Users size={18} className="sidebar-link-icon" />
                {!collapsed && <span>Manage Students</span>}
              </NavLink>

              <NavLink to="/admin/applications" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Review Applications">
                <ShieldCheck size={18} className="sidebar-link-icon" />
                {!collapsed && <span>Review Applications</span>}
              </NavLink>

              <NavLink to="/admin/rules" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Eligibility Rules">
                <Sliders size={18} className="sidebar-link-icon" />
                {!collapsed && <span>Eligibility Rules</span>}
              </NavLink>

              <NavLink to="/admin/reports" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Reports and Analytics">
                <BarChart3 size={18} className="sidebar-link-icon" />
                {!collapsed && <span>Reports &amp; Analytics</span>}
              </NavLink>

              <NavLink to="/admin/notifications" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Notifications">
                <Bell size={18} className="sidebar-link-icon" />
                {!collapsed && <span>Notifications</span>}
              </NavLink>

              <NavLink to="/admin/settings" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Settings">
                <Settings size={18} className="sidebar-link-icon" />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            </>
          ) : (
            /* Student / Standard Menu */
            <>
              {!collapsed && <div className="sidebar-heading">Navigation</div>}

              <NavLink to="/" end onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Home">
                <Home size={18} className="sidebar-link-icon" />
                {!collapsed && <span>Home</span>}
              </NavLink>

              <NavLink to="/explore" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Explore Scholarships">
                <Compass size={18} className="sidebar-link-icon" />
                {!collapsed && <span>Explore Scholarships</span>}
              </NavLink>

              {isAuthenticated && isStudent && (
                <>
                  <NavLink to="/dashboard" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="My Dashboard">
                    <LayoutDashboard size={18} className="sidebar-link-icon" />
                    {!collapsed && <span>My Dashboard</span>}
                  </NavLink>

                  <NavLink to="/profile" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="My Profile">
                    <User size={18} className="sidebar-link-icon" />
                    {!collapsed && <span>My Profile</span>}
                  </NavLink>

                  <NavLink to="/applications" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="My Applications">
                    <FileText size={18} className="sidebar-link-icon" />
                    {!collapsed && <span>My Applications</span>}
                  </NavLink>

                  <NavLink to="/saved" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Saved Scholarships">
                    <Bookmark size={18} className="sidebar-link-icon" />
                    {!collapsed && <span>Saved Scholarships</span>}
                  </NavLink>
                </>
              )}

              <NavLink to="/notifications" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Notifications">
                <Bell size={18} className="sidebar-link-icon" />
                {!collapsed && <span>Notifications</span>}
              </NavLink>

              <NavLink to="/help" onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} title="Help and Support">
                <HelpCircle size={18} className="sidebar-link-icon" />
                {!collapsed && <span>Help &amp; Support</span>}
              </NavLink>

              {/* Quick switch to Admin portal if user is Admin */}
              {isAuthenticated && isAdmin && (
                <NavLink to="/admin" onClick={closeMobile} className="sidebar-link" style={{ marginTop: '12px', backgroundColor: 'rgba(37,99,235,0.2)' }} title="Switch to Admin Console">
                  <ShieldCheck size={18} className="sidebar-link-icon" color="#93c5fd" />
                  {!collapsed && <span style={{ color: '#93c5fd' }}>Admin Console</span>}
                </NavLink>
              )}
            </>
          )}
        </div>

        {/* Sidebar Footer with User Details & Logout */}
        {(collapsed || isAuthenticated) && (
          <div className="sidebar-footer">
            {collapsed && (
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="sidebar-link"
                style={{ justifyContent: 'center' }}
                title="Expand sidebar"
              >
                <ChevronRight size={18} />
              </button>
            )}

            {isAuthenticated && (
              <>
                {!collapsed && (
                  <div className="user-snippet">
                    <div className="user-avatar">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="user-meta">
                      <div className="user-meta-name" title={user?.name}>{user?.name}</div>
                      <div className="user-meta-role">
                        {user?.role === 'admin' ? 'Administrator' : 'Student'}
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  className="sidebar-link"
                  style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
                  title="Logout"
                >
                  <LogOut size={18} className="sidebar-link-icon" color="#f87171" />
                  {!collapsed && <span style={{ color: '#f87171' }}>Logout</span>}
                </button>
              </>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
