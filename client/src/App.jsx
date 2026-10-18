import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import ScholarshipSearch from './pages/ScholarshipSearch';
import ScholarshipDetails from './pages/ScholarshipDetails';
import MyApplications from './pages/MyApplications';
import SavedScholarships from './pages/SavedScholarships';
import Notifications from './pages/Notifications';
import HelpSupport from './pages/HelpSupport';
import AdminDashboard from './pages/AdminDashboard';
import Unauthorized from './pages/Unauthorized';

import { useAuth } from './context/AuthContext';

/**
 * Protected Route for Students
 */
function StudentRoute({ children }) {
  const { user, loading, isAuthenticated, isStudent } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="page-container" style={{ padding: '60px 20px' }}>Loading session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isStudent) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

/**
 * Protected Route for Administrators
 */
function AdminRoute({ children }) {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="page-container" style={{ padding: '60px 20px' }}>Verifying administrative access...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login?role=admin" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

/**
 * 404 Not Found Page
 */
function NotFound() {
  return (
    <div className="page-container" style={{ textAlign: 'center', padding: '80px 20px' }}>
      <h2>404 - Page Not Found</h2>
      <p className="text-muted" style={{ margin: '14px 0 24px' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <a href="/" className="btn btn-primary">Return to Homepage</a>
    </div>
  );
}

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Toggle left navigation: handles desktop sidebar collapse and mobile drawer toggle
  const toggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 900) {
      setMobileOpen(prev => !prev);
    } else {
      setCollapsed(prev => !prev);
    }
  };

  return (
    <div className="app-shell">
      {/* Fixed Collapsible Left Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content View with Top Bar */}
      <div className={`app-main ${collapsed ? 'collapsed' : ''}`}>
        <TopBar
          onToggleSidebar={toggleSidebar}
          onToggleMobile={() => setMobileOpen(!mobileOpen)}
          collapsed={collapsed}
        />

        <Routes>
          {/* Public & Student Navigation */}
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<ScholarshipSearch />} />
          <Route path="/scholarships/:id" element={<ScholarshipDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<Navigate to="/login?role=admin" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/help" element={<HelpSupport />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Student Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <StudentRoute>
                <StudentDashboard />
              </StudentRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <StudentRoute>
                <StudentProfile />
              </StudentRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <StudentRoute>
                <MyApplications />
              </StudentRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <StudentRoute>
                <SavedScholarships />
              </StudentRoute>
            }
          />

          {/* Administrator Protected Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard initialTab="overview" />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/scholarships"
            element={
              <AdminRoute>
                <AdminDashboard initialTab="scholarships" />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/scholarships/new"
            element={
              <AdminRoute>
                <AdminDashboard initialTab="add_scholarship" />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <AdminRoute>
                <AdminDashboard initialTab="students" />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/applications"
            element={
              <AdminRoute>
                <AdminDashboard initialTab="applications" />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/rules"
            element={
              <AdminRoute>
                <AdminDashboard initialTab="rules" />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <AdminRoute>
                <AdminDashboard initialTab="reports" />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <AdminRoute>
                <Notifications />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminRoute>
                <AdminDashboard initialTab="reports" />
              </AdminRoute>
            }
          />

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
}
