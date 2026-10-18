import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validatePassword } from '../utils/validation';
import { ShieldCheck, GraduationCap, Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Role tab state: 'student' | 'admin'
  const queryParams = new URLSearchParams(location.search);
  const initialRole = queryParams.get('role') === 'admin' ? 'admin' : 'student';

  const [roleTab, setRoleTab] = useState(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (queryParams.get('role') === 'admin') {
      setRoleTab('admin');
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }
    const passErr = validatePassword(password);
    if (passErr) {
      setError(passErr);
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success && res.user) {
        // Enforce role consistency
        if (roleTab === 'admin' && res.user.role !== 'admin') {
          setError('Access Denied: This account does not possess administrator privileges. Please sign in via the Student portal.');
          return;
        }

        if (res.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.message || 'Authentication service is unavailable. Please verify connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPw, role) => {
    setEmail(demoEmail);
    setPassword(demoPw);
    setRoleTab(role);
    setError('');
  };

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '75vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '460px', padding: '32px 28px' }}>
        {/* Header Icon & Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: roleTab === 'admin' ? 'var(--navy-900)' : 'var(--blue-50)',
            color: roleTab === 'admin' ? '#ffffff' : 'var(--blue-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px'
          }}>
            {roleTab === 'admin' ? <ShieldCheck size={26} /> : <GraduationCap size={26} />}
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '6px' }}>
            {roleTab === 'admin' ? 'Administrator Portal' : 'Student Sign In'}
          </h2>
          <p className="text-sm text-muted">
            {roleTab === 'admin'
              ? 'Secure console for verified scholarship administrators'
              : 'Sign in to access your recommendations and applications'}
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          backgroundColor: 'var(--bg-muted)',
          borderRadius: 'var(--radius-md)',
          padding: '4px',
          marginBottom: '18px'
        }}>
          <button
            type="button"
            onClick={() => { setRoleTab('student'); setError(''); }}
            style={{
              padding: '10px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: roleTab === 'student' ? '#ffffff' : 'transparent',
              color: roleTab === 'student' ? 'var(--blue-600)' : 'var(--text-muted)',
              boxShadow: roleTab === 'student' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Student Login
          </button>
          <button
            type="button"
            onClick={() => { setRoleTab('admin'); setError(''); }}
            style={{
              padding: '10px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: roleTab === 'admin' ? '#ffffff' : 'transparent',
              color: roleTab === 'admin' ? 'var(--navy-900)' : 'var(--text-muted)',
              boxShadow: roleTab === 'admin' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Administrator Login
          </button>
        </div>

        {/* Portal Context Banner */}
        <div style={{
          padding: '10px 14px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px',
          backgroundColor: roleTab === 'admin' ? 'var(--navy-50, #f8fafc)' : 'var(--blue-50)',
          border: `1px solid ${roleTab === 'admin' ? 'var(--navy-200, #cbd5e1)' : 'var(--blue-100)'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8rem'
        }}>
          <span style={{ color: roleTab === 'admin' ? 'var(--navy-900)' : 'var(--blue-900)', fontWeight: '500' }}>
            {roleTab === 'admin' ? '🛡️ Administrator Access' : '🎓 Student Portal'}
          </span>
          <button
            type="button"
            onClick={() => {
              const nextRole = roleTab === 'admin' ? 'student' : 'admin';
              setRoleTab(nextRole);
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--blue-600)',
              fontWeight: '600',
              cursor: 'pointer',
              padding: 0,
              fontSize: '0.8rem',
              textDecoration: 'underline'
            }}
          >
            {roleTab === 'admin' ? 'Switch to Student' : 'Switch to Administrator'}
          </button>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">
              {roleTab === 'admin' ? 'Admin Email Address' : 'Student Email Address'}
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={roleTab === 'admin' ? 'admin@scholarfind.com' : 'student@scholarfind.com'}
                className="form-input"
                style={{ paddingLeft: '38px' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" htmlFor="password-input" style={{ marginBottom: 0 }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', color: 'var(--blue-600)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter account password"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn ${roleTab === 'admin' ? 'btn-navy' : 'btn-primary'}`}
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
          >
            <span>{loading ? 'Authenticating...' : roleTab === 'admin' ? 'Enter Administrator Console' : 'Sign In to ScholarFind'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Demo Fast-Fill Emails */}
        <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border-subtle)' }}>
          <p className="text-xs text-muted font-medium" style={{ marginBottom: '8px' }}>
            Prefill development account email:
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                setEmail('student@scholarfind.com');
                setRoleTab('student');
                setError('');
              }}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem', flex: 1 }}
            >
              Fill Student Email
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@scholarfind.com');
                setRoleTab('admin');
                setError('');
              }}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem', flex: 1 }}
            >
              Fill Admin Email
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          {roleTab === 'student' ? (
            <p className="text-sm text-muted">
              Don't have an account yet?{' '}
              <Link to="/register" style={{ color: 'var(--blue-600)', fontWeight: '600', textDecoration: 'none' }}>
                Register here
              </Link>
            </p>
          ) : (
            <p className="text-xs text-muted" style={{ lineHeight: '1.4' }}>
              Administrative privileges are strictly restricted to verified personnel. Credentials can be configured securely in the server environment or generated using the CLI utility.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
