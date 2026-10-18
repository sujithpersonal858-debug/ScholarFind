import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentService } from '../services/studentService';
import { formatDate } from '../utils/formatters';
import { FileText, ExternalLink, Eye, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function MyApplications() {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchApplications = async () => {
    try {
      const res = await studentService.getTrackingList();
      if (res.success && res.tracks) {
        setTracks(res.tracks);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusChange = async (scholarshipId, newStatus) => {
    try {
      await studentService.updateTrackingStatus(scholarshipId, newStatus);
      setMessage('Application status updated.');
      setTimeout(() => setMessage(''), 3000);
      fetchApplications();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '24px' }}>
        <h2>My Applications</h2>
        <p className="text-muted text-sm" style={{ marginTop: '2px' }}>
          Track and manage your scholarship application progress in one place.
        </p>
      </div>

      <div className="alert alert-info" style={{ marginBottom: '24px' }}>
        <AlertCircle size={18} style={{ flexShrink: 0 }} />
        <div>
          <strong>Student-Managed Tracker:</strong> These statuses are maintained by you for personal tracking. ScholarFind directs you to official portals where final reviews and award disbursements take place.
        </div>
      </div>

      {message && (
        <div className="alert alert-success" style={{ marginBottom: '20px' }}>
          {message}
        </div>
      )}

      {loading ? (
        <p className="text-muted">Loading your application records...</p>
      ) : tracks.length > 0 ? (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Scholarship Scheme</th>
                <th>Closing Date</th>
                <th>My Progress Status</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tracks.map(track => {
                const s = track.scholarshipId;
                if (!s) return null;
                return (
                  <tr key={track._id}>
                    <td>
                      <strong>{s.name}</strong>
                      <div className="text-xs text-muted">{s.provider}</div>
                    </td>
                    <td>{formatDate(s.applicationDeadline)}</td>
                    <td>
                      <select
                        value={track.status}
                        onChange={(e) => handleStatusChange(s._id, e.target.value)}
                        className="form-select"
                        style={{ padding: '6px 10px', fontSize: '0.85rem', width: 'auto' }}
                      >
                        <option value="Not Applied">Not Applied</option>
                        <option value="Applied">Applied</option>
                        <option value="Awaiting Result">Awaiting Result</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="text-sm text-muted">{track.notes || 'None'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link to={`/scholarships/${s._id}`} className="btn btn-outline btn-sm">
                          <Eye size={13} />
                          <span>View</span>
                        </Link>
                        <a
                          href={s.officialApplicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-sm"
                        >
                          <span>Portal</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '54px 20px' }}>
          <FileText size={36} color="var(--text-muted)" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ marginBottom: '8px' }}>No Applications Tracked Yet</h3>
          <p className="text-sm text-muted" style={{ maxWidth: '440px', margin: '0 auto 20px' }}>
            When you find a scholarship you want to apply for, you can record your submission progress right here.
          </p>
          <Link to="/explore" className="btn btn-primary btn-sm">
            Find Scholarships To Apply
          </Link>
        </div>
      )}
    </div>
  );
}
