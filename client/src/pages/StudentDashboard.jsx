import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { scholarshipService } from '../services/scholarshipService';
import { studentService } from '../services/studentService';
import ScholarshipCard from '../components/ScholarshipCard';
import { formatDate } from '../utils/formatters';
import {
  RotateCcw,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Bookmark,
  FileText,
  Compass,
  ArrowRight,
  ExternalLink,
  Eye
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'recommendations';

  const [activeTab, setActiveTab] = useState(initialTab); // recommendations | saved | tracking
  const [recommendations, setRecommendations] = useState(null);
  const [savedList, setSavedList] = useState([]);
  const [trackingList, setTrackingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');

  const loadDashboardData = async () => {
    try {
      const [recRes, savedRes, trackRes] = await Promise.all([
        scholarshipService.getRecommendations(),
        studentService.getSavedScholarships(),
        studentService.getTrackingList()
      ]);

      if (recRes.success) setRecommendations(recRes);
      if (savedRes.success) setSavedList(savedRes.saved || []);
      if (trackRes.success) setTrackingList(trackRes.tracks || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleTrackingStatusChange = async (scholarshipId, newStatus) => {
    try {
      const res = await studentService.updateTrackingStatus(scholarshipId, newStatus);
      if (res.success) {
        setUpdateMsg('Application status updated.');
        setTimeout(() => setUpdateMsg(''), 3000);
        const trackRes = await studentService.getTrackingList();
        if (trackRes.success) setTrackingList(trackRes.tracks || []);
      }
    } catch (err) {
      console.error('Failed to update tracking:', err);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <p className="text-muted">Loading your personalized dashboard...</p>
      </div>
    );
  }

  const profileCompletion = recommendations?.profileCompletion || 0;
  const potentialMatches = recommendations?.potentialMatches || [];
  const needsInfo = recommendations?.needsInfo || [];
  const notEligible = recommendations?.notEligible || [];

  return (
    <div className="page-container">
      {/* Top Banner / Welcome */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>Welcome back, {user?.name || 'Student'}!</h2>
          <p className="text-muted text-sm" style={{ marginTop: '2px' }}>
            Here are your matched scholarships based on your current educational profile.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleRefresh} disabled={refreshing} className="btn btn-outline btn-sm">
            <RotateCcw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Matches'}</span>
          </button>
          <Link to="/profile" className="btn btn-primary btn-sm">
            <UserCheck size={14} />
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>

      {updateMsg && (
        <div className="alert alert-success" style={{ marginBottom: '20px' }}>
          {updateMsg}
        </div>
      )}

      {/* Profile Completeness Card */}
      <div className="card-subtle" style={{ marginBottom: '32px', backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="font-semibold text-sm">Profile Completeness</span>
          <span className="text-sm font-semibold" style={{ color: 'var(--blue-600)' }}>{profileCompletion}%</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${profileCompletion}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <p className="text-xs text-muted" style={{ margin: 0 }}>
            {profileCompletion < 100
              ? 'Complete missing marks or income fields to unlock all matching schemes.'
              : 'Your profile has all required details! Matching rules are thoroughly evaluated.'}
          </p>
          {profileCompletion < 100 && (
            <Link to="/profile" className="btn btn-outline btn-sm" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
              Complete Profile
            </Link>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-nav">
        <button
          className={`tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          <CheckCircle2 size={16} />
          <span>Recommended For You ({potentialMatches.length})</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          <Bookmark size={16} />
          <span>Saved Scholarships ({savedList.length})</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'tracking' ? 'active' : ''}`}
          onClick={() => setActiveTab('tracking')}
        >
          <FileText size={16} />
          <span>My Applications ({trackingList.length})</span>
        </button>
      </div>

      {/* Tab 1: Recommendations */}
      {activeTab === 'recommendations' && (
        <div>
          {/* Potential Matches */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3>You Qualify For These Schemes ({potentialMatches.length})</h3>
              <p className="text-sm text-muted">
                Your reported background satisfies all mandatory criteria for these scholarships.
              </p>
            </div>

            {potentialMatches.length > 0 ? (
              <div className="scholarship-grid">
                {potentialMatches.map(s => (
                  <ScholarshipCard key={s._id} scholarship={s} onSaveToggle={loadDashboardData} />
                ))}
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '36px 20px' }}>
                <p className="text-muted" style={{ marginBottom: '14px' }}>
                  No matching scholarships found for your specific profile yet.
                </p>
                <Link to="/explore" className="btn btn-outline btn-sm">
                  Browse All Scholarships
                </Link>
              </div>
            )}
          </div>

          {/* Needs More Info */}
          {needsInfo.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <div style={{ marginBottom: '16px' }}>
                <h3>Needs More Profile Information ({needsInfo.length})</h3>
                <p className="text-sm text-muted">
                  These scholarships require specific profile information that you haven't entered yet.
                </p>
              </div>

              <div className="scholarship-grid">
                {needsInfo.map(s => (
                  <ScholarshipCard key={s._id} scholarship={s} onSaveToggle={loadDashboardData} />
                ))}
              </div>
            </div>
          )}

          {/* Not Eligible */}
          {notEligible.length > 0 && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h3>Does Not Match ({notEligible.length})</h3>
                <p className="text-sm text-muted">
                  Schemes where one or more mandatory conditions are not met by your reported profile.
                </p>
              </div>

              <div className="scholarship-grid">
                {notEligible.map(s => (
                  <ScholarshipCard key={s._id} scholarship={s} onSaveToggle={loadDashboardData} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Saved Scholarships */}
      {activeTab === 'saved' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h3>Your Saved Scholarships</h3>
            <p className="text-sm text-muted">
              Bookmarks you've saved for future review and application.
            </p>
          </div>

          {savedList.length > 0 ? (
            <div className="scholarship-grid">
              {savedList.map(item => {
                const s = item.scholarshipId;
                if (!s) return null;
                return (
                  <ScholarshipCard
                    key={s._id}
                    scholarship={{ ...s, isSaved: true }}
                    onSaveToggle={loadDashboardData}
                  />
                );
              })}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p className="text-muted" style={{ marginBottom: '14px' }}>
                You have not saved any scholarships to your favourites yet.
              </p>
              <Link to="/explore" className="btn btn-primary btn-sm">
                Explore Scholarships
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Application Tracking */}
      {activeTab === 'tracking' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h3>Application Tracking</h3>
            <p className="text-sm text-muted">
              Record your personal progress for scholarships you have applied for.
            </p>
          </div>

          {trackingList.length > 0 ? (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Scholarship Scheme</th>
                    <th>Closing Date</th>
                    <th>My Progress Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trackingList.map(track => {
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
                            onChange={(e) => handleTrackingStatusChange(s._id, e.target.value)}
                            className="form-select"
                            style={{ padding: '6px 10px', fontSize: '0.85rem', width: 'auto' }}
                          >
                            <option value="Not Applied">Not Applied</option>
                            <option value="Applied">Applied</option>
                            <option value="Awaiting Result">Awaiting Result</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
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
                              <span>Official Site</span>
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
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p className="text-muted" style={{ marginBottom: '14px' }}>
                No applications currently tracked.
              </p>
              <Link to="/explore" className="btn btn-primary btn-sm">
                Browse Schemes
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
