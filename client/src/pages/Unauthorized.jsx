import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="page-container" style={{ textAlign: 'center', padding: '80px 20px', maxWidth: '520px' }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: 'var(--danger-bg)',
        color: 'var(--danger-text)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px'
      }}>
        <ShieldAlert size={32} />
      </div>

      <h2 style={{ fontSize: '1.75rem', marginBottom: '10px' }}>Access Restricted</h2>
      <p className="text-muted" style={{ lineHeight: '1.6', marginBottom: '28px' }}>
        You do not have permission to view this section. This page requires authorized administrative credentials.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
        <Link to="/" className="btn btn-outline">
          <Home size={15} />
          <span>Go to Home</span>
        </Link>
        <Link to="/login?role=admin" className="btn btn-primary">
          <span>Administrator Login</span>
        </Link>
      </div>
    </div>
  );
}
