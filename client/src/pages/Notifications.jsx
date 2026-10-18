import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { scholarshipService } from '../services/scholarshipService';
import { formatDate } from '../utils/formatters';
import { Bell, Clock, Award, CheckCircle, Info } from 'lucide-react';

export default function Notifications() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await scholarshipService.getAll({ status: 'active' });
        if (res.success && res.scholarships) {
          setScholarships(res.scholarships);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const closingSoon = scholarships.filter(s => {
    const d = new Date(s.applicationDeadline);
    return d >= now && d <= thirtyDaysLater;
  });

  return (
    <div className="page-container" style={{ maxWidth: '820px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2>Notifications &amp; Alerts</h2>
        <p className="text-muted text-sm" style={{ marginTop: '2px' }}>
          Important updates regarding closing dates and verified scholarship releases.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* System Alert */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid var(--blue-600)' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--blue-50)', color: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bell size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', marginBottom: '4px' }}>2026 Academic Scholarship Season Active</h4>
              <p className="text-sm text-muted" style={{ margin: 0 }}>
                Central and state scholarship applications are now open on official portals. Ensure your caste and income certificates are updated.
              </p>
            </div>
          </div>
        </div>

        {/* Closing Soon Alerts */}
        {closingSoon.map(s => (
          <div key={s._id} className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', marginBottom: '4px' }}>Closing Soon: {s.name}</h4>
                  <p className="text-sm text-muted" style={{ marginBottom: '6px' }}>
                    Application submission closes on <strong>{formatDate(s.applicationDeadline)}</strong>. Complete your submission on the official portal before the deadline.
                  </p>
                  <div className="text-xs text-muted">Provided by: {s.provider}</div>
                </div>
              </div>
              <Link to={`/scholarships/${s._id}`} className="btn btn-outline btn-sm">
                View Scheme
              </Link>
            </div>
          </div>
        ))}

        {/* Profile Reminder */}
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', marginBottom: '4px' }}>Keep Your Profile Current</h4>
              <p className="text-sm text-muted" style={{ margin: 0 }}>
                Whenever your examination percentage changes or your annual family income is updated, keep your profile up-to-date to maintain accurate recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
