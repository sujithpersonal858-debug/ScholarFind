import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">ScholarFind</div>
            <p className="footer-desc">
              Discover scholarships that match your eligibility. ScholarFind compares student academic and financial profiles against official scholarship criteria through a rule-based matching engine.
            </p>
          </div>

          <div>
            <div className="footer-heading">Platform</div>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/explore">Explore Scholarships</Link></li>
              <li><Link to="/login">Student Login</Link></li>
              <li><Link to="/register">Create Account</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-heading">Important Notice</div>
            <p className="text-sm text-muted" style={{ lineHeight: '1.5' }}>
              ScholarFind provides preliminary rule matching only. Official scholarship providers determine final eligibility, document verification, and awards. Always check official notifications before applying.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} ScholarFind. All rights reserved.
          </div>
          <div>
            Smart Scholarship Eligibility &amp; Recommendation System
          </div>
        </div>
      </div>
    </footer>
  );
}
