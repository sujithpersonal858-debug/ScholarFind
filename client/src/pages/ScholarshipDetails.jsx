import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { scholarshipService } from '../services/scholarshipService';
import { studentService } from '../services/studentService';
import { formatDate, formatCurrency, getDeadlineInfo } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import EligibilityBreakdown from '../components/EligibilityBreakdown';
import {
  Calendar,
  Award,
  ExternalLink,
  Bookmark,
  ArrowLeft,
  FileText,
  Building,
  CheckCircle2,
  FileCheck,
  AlertCircle
} from 'lucide-react';

export default function ScholarshipDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isStudent } = useAuth();

  const [scholarship, setScholarship] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [trackingStatus, setTrackingStatus] = useState('Not Applied');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const fetchDetails = async () => {
    try {
      const res = await scholarshipService.getById(id);
      if (res.success && res.scholarship) {
        setScholarship(res.scholarship);
        setEvaluation(res.evaluation);
        setIsSaved(res.isSaved);
        if (res.applicationTrack) {
          setTrackingStatus(res.applicationTrack.status);
        }
      }
    } catch (err) {
      console.error('Failed to load scholarship details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      if (isSaved) {
        await studentService.removeSavedScholarship(id);
        setIsSaved(false);
        setActionMsg('Scholarship removed from favourites.');
      } else {
        await studentService.saveScholarship(id);
        setIsSaved(true);
        setActionMsg('Scholarship saved to your favourites.');
      }
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleTrackingChange = async (newStatus) => {
    setTrackingStatus(newStatus);
    try {
      await studentService.updateTrackingStatus(id, newStatus);
      setActionMsg(`Application status updated: ${newStatus}`);
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err) {
      console.error('Tracking update error:', err);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <p className="text-muted">Loading scholarship specifications...</p>
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <h2>Scholarship Not Found</h2>
        <p className="text-muted" style={{ margin: '14px 0 24px' }}>
          The requested scheme could not be located in our verified database.
        </p>
        <Link to="/explore" className="btn btn-primary">
          Back to Search
        </Link>
      </div>
    );
  }

  const deadline = getDeadlineInfo(scholarship.applicationDeadline);

  return (
    <div className="page-container" style={{ maxWidth: '880px' }}>
      <div style={{ marginBottom: '18px' }}>
        <Link to="/explore" className="text-sm font-medium" style={{ textDecoration: 'none', color: 'var(--blue-600)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={16} />
          <span>Back to Find Scholarships</span>
        </Link>
      </div>

      {actionMsg && (
        <div className="alert alert-success" style={{ marginBottom: '20px' }}>
          {actionMsg}
        </div>
      )}

      {/* Main Details Header Card */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <span className="badge badge-neutral">{scholarship.scholarshipType}</span>
          <span className={`badge ${deadline.isExpired ? 'badge-fail' : deadline.isUrgent ? 'badge-info' : 'badge-neutral'}`}>
            <Calendar size={13} />
            <span>{deadline.isUrgent ? 'Closing Soon' : deadline.text}</span>
          </span>
        </div>

        <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>{scholarship.name}</h1>
        <p className="font-medium" style={{ fontSize: '0.975rem', color: 'var(--text-muted)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Building size={16} />
          <span>Provided by: {scholarship.provider}</span>
        </p>

        <div className="card-benefits" style={{ fontSize: '1rem', padding: '12px 16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} />
            <span><strong>Benefits:</strong> {scholarship.benefits}</span>
          </div>
        </div>

        <p style={{ lineHeight: '1.6', marginBottom: '24px' }}>
          {scholarship.description}
        </p>

        {/* Primary CTA Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: '18px' }}>
          <a
            href={scholarship.officialApplicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            <span>Visit Official Application Portal</span>
            <ExternalLink size={15} />
          </a>

          {scholarship.officialNotificationUrl && (
            <a
              href={scholarship.officialNotificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              <FileText size={15} />
              <span>Official Notification (PDF)</span>
            </a>
          )}

          {isStudent && (
            <button
              onClick={handleSaveToggle}
              className={`btn ${isSaved ? 'btn-secondary' : 'btn-outline'}`}
            >
              <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'} />
              <span>{isSaved ? 'Saved in Favourites' : 'Save Scholarship'}</span>
            </button>
          )}
        </div>
      </div>

      {/* If Student is logged in: Application Tracking Controller */}
      {isStudent && (
        <div className="card-subtle" style={{ marginBottom: '28px', backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h4 style={{ margin: 0 }}>My Application Progress</h4>
              <p className="text-xs text-muted" style={{ marginTop: '2px' }}>
                Self-maintained tracking status for your personal organization.
              </p>
            </div>
            <select
              value={trackingStatus}
              onChange={(e) => handleTrackingChange(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '8px 14px' }}
            >
              <option value="Not Applied">Status: Not Applied</option>
              <option value="Applied">Status: Applied</option>
              <option value="Awaiting Result">Status: Awaiting Result</option>
              <option value="Completed">Status: Completed</option>
            </select>
          </div>
        </div>
      )}

      {/* Rule-Based Eligibility Matching Engine Breakdown */}
      {isStudent && evaluation && (
        <EligibilityBreakdown evaluation={evaluation} />
      )}

      {!isAuthenticated && (
        <div className="card-subtle" style={{ textAlign: 'center', padding: '24px', marginTop: '24px', backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)' }}>
          <h4 style={{ marginBottom: '6px' }}>Want to check if you qualify for this scheme?</h4>
          <p className="text-sm text-muted" style={{ marginBottom: '16px' }}>
            Sign in or create a student profile to see automatic rule matching and requirement explanations.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Create Profile</Link>
          </div>
        </div>
      )}

      {/* Complete Eligibility Criteria Specifications */}
      <div className="card" style={{ marginTop: '28px' }}>
        <h3 style={{ marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
          Eligibility Requirements
        </h3>

        <div className="form-grid">
          <div>
            <span className="text-xs text-muted font-semibold uppercase">Eligible Courses</span>
            <p className="font-medium text-sm" style={{ marginTop: '4px' }}>
              {scholarship.eligibleCourses.join(', ')}
            </p>
          </div>

          <div>
            <span className="text-xs text-muted font-semibold uppercase">Your Education Level</span>
            <p className="font-medium text-sm" style={{ marginTop: '4px' }}>
              {scholarship.qualificationLevels.join(', ')}
            </p>
          </div>

          <div>
            <span className="text-xs text-muted font-semibold uppercase">Your State</span>
            <p className="font-medium text-sm" style={{ marginTop: '4px' }}>
              {scholarship.eligibleStates.join(', ')}
            </p>
          </div>

          <div>
            <span className="text-xs text-muted font-semibold uppercase">Minimum Academic Marks</span>
            <p className="font-medium text-sm" style={{ marginTop: '4px' }}>
              {scholarship.minMarksPercentage > 0 ? `${scholarship.minMarksPercentage}% in qualifying exam` : 'No minimum marks cutoff'}
            </p>
          </div>

          <div>
            <span className="text-xs text-muted font-semibold uppercase">Family Income Limit</span>
            <p className="font-medium text-sm" style={{ marginTop: '4px' }}>
              {formatCurrency(scholarship.maxAnnualIncome)} per annum
            </p>
          </div>

          <div>
            <span className="text-xs text-muted font-semibold uppercase">Social Categories</span>
            <p className="font-medium text-sm" style={{ marginTop: '4px' }}>
              {scholarship.applicableCategories.join(', ')}
            </p>
          </div>

          <div>
            <span className="text-xs text-muted font-semibold uppercase">Gender</span>
            <p className="font-medium text-sm" style={{ marginTop: '4px' }}>
              {scholarship.eligibleGenders.join(', ')}
            </p>
          </div>

          <div>
            <span className="text-xs text-muted font-semibold uppercase">Persons with Disabilities (PwD)</span>
            <p className="font-medium text-sm" style={{ marginTop: '4px' }}>
              {scholarship.requiresDisability ? `Mandatory PwD quota (≥ ${scholarship.minDisabilityPercentage || 40}%)` : 'Not restricted to PwD'}
            </p>
          </div>
        </div>

        {scholarship.requiredDocuments && scholarship.requiredDocuments.length > 0 && (
          <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-subtle)', paddingTop: '18px' }}>
            <h4 style={{ marginBottom: '12px', fontSize: '0.95rem' }}>Required Verification Documents:</h4>
            <ul style={{ paddingLeft: '20px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {scholarship.requiredDocuments.map((doc, idx) => (
                <li key={idx} style={{ marginBottom: '6px' }}>{doc}</li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <span className="text-xs text-muted">
            Last verified with official notification: <strong>{formatDate(scholarship.lastVerifiedDate)}</strong>
          </span>
          <span className="text-xs text-muted">
            Status: <strong>Officially Verified Record</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
