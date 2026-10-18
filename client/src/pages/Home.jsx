import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { scholarshipService } from '../services/scholarshipService';
import { studentService } from '../services/studentService';
import ScholarshipCard from '../components/ScholarshipCard';
import {
  Search,
  Compass,
  FileCheck2,
  Calendar,
  Bookmark,
  Award,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  ListTodo
} from 'lucide-react';

export default function Home() {
  const { user, isAuthenticated, isStudent } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [scholarships, setScholarships] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    availableScholarships: 0,
    savedScholarships: 0,
    submittedApplications: 0,
    upcomingDeadlines: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const schRes = await scholarshipService.getAll({ status: 'active' });
        if (schRes.success && schRes.scholarships) {
          setScholarships(schRes.scholarships);
        }

        if (isAuthenticated && isStudent) {
          const [summaryRes, recRes] = await Promise.all([
            studentService.getSummary(),
            scholarshipService.getRecommendations()
          ]);
          if (summaryRes.success && summaryRes.summary) {
            setSummaryStats(summaryRes.summary);
          }
          if (recRes.success && recRes.potentialMatches) {
            setRecommended(recRes.potentialMatches);
          }
        } else {
          // Guest view summary counts
          const now = new Date();
          const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          const activeList = schRes.scholarships || [];
          const closingSoonCount = activeList.filter(s => {
            const d = new Date(s.applicationDeadline);
            return d >= now && d <= thirtyDaysLater;
          }).length;

          setSummaryStats({
            availableScholarships: activeList.length,
            savedScholarships: 0,
            submittedApplications: 0,
            upcomingDeadlines: closingSoonCount
          });
        }
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, [isAuthenticated, isStudent]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  // Sort upcoming deadlines (closing soon)
  const upcomingDeadlinesList = [...scholarships]
    .filter(s => new Date(s.applicationDeadline) >= new Date())
    .sort((a, b) => new Date(a.applicationDeadline) - new Date(b.applicationDeadline))
    .slice(0, 3);

  // Recently added
  const recentlyAddedList = [...scholarships]
    .sort((a, b) => new Date(b.createdAt || b.lastVerifiedDate) - new Date(a.createdAt || a.lastVerifiedDate))
    .slice(0, 3);

  const studentFirstName = user?.name ? user.name.split(' ')[0] : 'Student';

  return (
    <div className="page-container">
      {/* 1. Welcome Header & Platform Intro */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--navy-900)', marginBottom: '8px' }}>
          {isAuthenticated
            ? `Welcome back, ${studentFirstName}!`
            : 'Welcome to ScholarFind!'}
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '800px', lineHeight: '1.6' }}>
          ScholarFind helps students discover scholarships that match their educational background, previous exam marks, and family income. Fill your profile once to get verified scheme recommendations with clear reasons.
        </p>
      </div>

      {/* 2. Prominent Search Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '32px', backgroundColor: '#ffffff' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scholarships by name or provider..."
              className="form-input"
              style={{ paddingLeft: '48px', height: '48px', fontSize: '1rem', border: 'none', backgroundColor: 'var(--bg-app)' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '48px', padding: '0 24px' }}>
            <Search size={16} />
            <span>Find Scholarships</span>
          </button>
        </form>
      </div>

      {/* 3. Summary Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-box metric-icon-blue">
            <Award size={24} />
          </div>
          <div>
            <div className="metric-data-num">{summaryStats.availableScholarships}</div>
            <div className="metric-data-label">Available Scholarships</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box metric-icon-green">
            <Bookmark size={24} />
          </div>
          <div>
            <div className="metric-data-num">{summaryStats.savedScholarships}</div>
            <div className="metric-data-label">Saved Scholarships</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box metric-icon-navy">
            <FileCheck2 size={24} />
          </div>
          <div>
            <div className="metric-data-num">{summaryStats.submittedApplications}</div>
            <div className="metric-data-label">Submitted Applications</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box metric-icon-amber">
            <Clock size={24} />
          </div>
          <div>
            <div className="metric-data-num">{summaryStats.upcomingDeadlines}</div>
            <div className="metric-data-label">Closing Soon</div>
          </div>
        </div>
      </div>

      {/* 4. Quick Actions Bar */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: '36px', backgroundColor: 'var(--blue-50)', borderColor: 'var(--blue-100)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--navy-900)', marginBottom: '4px' }}>Ready to discover your matches?</h3>
            <p className="text-sm text-muted" style={{ margin: 0 }}>
              Complete your profile details to evaluate all government and foundation scholarships instantly.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link to="/explore" className="btn btn-primary btn-sm">
              <Compass size={15} />
              <span>Explore Scholarships</span>
            </Link>
            <Link to="/profile" className="btn btn-outline btn-sm">
              <CheckCircle2 size={15} />
              <span>Check If You Qualify</span>
            </Link>
            <Link to="/applications" className="btn btn-outline btn-sm">
              <ListTodo size={15} />
              <span>View My Applications</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 5. Recommended Scholarships Section */}
      <div style={{ marginBottom: '44px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2>Recommended For You</h2>
            <p className="text-sm text-muted" style={{ marginTop: '2px' }}>
              Schemes matched against your academic profile and eligibility rules.
            </p>
          </div>
          <Link to="/explore" className="btn btn-outline btn-sm">
            <span>View All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <p className="text-muted">Loading recommendations...</p>
        ) : isAuthenticated && recommended.length > 0 ? (
          <div className="scholarship-grid">
            {recommended.slice(0, 3).map(s => (
              <ScholarshipCard key={s._id} scholarship={s} />
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '36px 20px' }}>
            <Sparkles size={32} color="var(--blue-600)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>
              {isAuthenticated ? 'Complete Your Profile To See Matches' : 'Sign In To Unlock Personalized Matches'}
            </h3>
            <p className="text-sm text-muted" style={{ maxWidth: '500px', margin: '0 auto 18px' }}>
              Our rule-based engine compares your education level, previous marks, and family income to find matching schemes with zero guesswork.
            </p>
            <Link to={isAuthenticated ? '/profile' : '/login'} className="btn btn-primary btn-sm">
              {isAuthenticated ? 'Update My Profile' : 'Student Login'}
            </Link>
          </div>
        )}
      </div>

      {/* 6. Upcoming Scholarship Deadlines (Closing Soon) */}
      <div style={{ marginBottom: '44px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2>Closing Soon</h2>
            <p className="text-sm text-muted" style={{ marginTop: '2px' }}>
              Don't miss these upcoming application submission deadlines.
            </p>
          </div>
          <Link to="/explore?sort=deadline" className="btn btn-outline btn-sm">
            <span>See All Deadlines</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="scholarship-grid">
          {upcomingDeadlinesList.map(s => (
            <ScholarshipCard key={s._id} scholarship={s} />
          ))}
        </div>
      </div>

      {/* 7. Recently Added Scholarships */}
      <div style={{ marginBottom: '44px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2>Recently Added Scholarships</h2>
            <p className="text-sm text-muted" style={{ marginTop: '2px' }}>
              Freshly verified schemes from state departments and educational trusts.
            </p>
          </div>
          <Link to="/explore" className="btn btn-outline btn-sm">
            <span>Browse Catalog</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="scholarship-grid">
          {recentlyAddedList.map(s => (
            <ScholarshipCard key={s._id} scholarship={s} />
          ))}
        </div>
      </div>
    </div>
  );
}
