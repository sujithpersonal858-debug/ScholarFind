import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate, getDeadlineInfo, formatCurrency } from '../utils/formatters';
import { studentService } from '../services/studentService';
import { useAuth } from '../context/AuthContext';
import { Bookmark, ExternalLink, Eye, Award, Calendar, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export default function ScholarshipCard({ scholarship, onSaveToggle }) {
  const { isStudent, isAuthenticated } = useAuth();
  const [isSaved, setIsSaved] = useState(scholarship.isSaved || false);
  const [saving, setSaving] = useState(false);

  const deadlineInfo = getDeadlineInfo(scholarship.applicationDeadline);
  const evalData = scholarship.evaluation;

  const handleSaveClick = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    if (!isStudent) return;

    setSaving(true);
    try {
      if (isSaved) {
        await studentService.removeSavedScholarship(scholarship._id);
        setIsSaved(false);
        if (onSaveToggle) onSaveToggle(scholarship._id, false);
      } else {
        await studentService.saveScholarship(scholarship._id);
        setIsSaved(true);
        if (onSaveToggle) onSaveToggle(scholarship._id, true);
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="scholarship-card">
      <div className="card-top">
        {/* Top Badges */}
        <div className="card-meta-line">
          <span className="badge badge-neutral">{scholarship.scholarshipType}</span>
          <span className={`badge ${deadlineInfo.isExpired ? 'badge-fail' : deadlineInfo.isUrgent ? 'badge-info' : 'badge-neutral'}`}>
            <Calendar size={13} />
            <span>{deadlineInfo.isUrgent ? 'Closing Soon' : deadlineInfo.text}</span>
          </span>
        </div>

        {/* Title & Provider */}
        <h3 className="scholarship-title">
          <Link to={`/scholarships/${scholarship._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            {scholarship.name}
          </Link>
        </h3>
        <p className="scholarship-provider">{scholarship.provider}</p>
{typeof scholarship.mlMatchScore === 'number' && (
  <p style={{
    margin: '8px 0',
    padding: '8px 12px',
    background: '#eef6ff',
    borderRadius: '8px',
    color: '#1d4ed8',
    fontWeight: '600',
    fontSize: '0.9rem'
  }}>
    ML Match Score: {scholarship.mlMatchScore}/100
  </p>
)}
        {/* Evaluation Match Badge if available */}
        {evalData && (
          <div style={{ marginBottom: '14px' }}>
            {evalData.overallStatus === 'POTENTIAL_MATCH' && (
              <span className="badge badge-match">
                <CheckCircle2 size={13} />
                <span>You Qualify</span>
              </span>
            )}
            {evalData.overallStatus === 'NEEDS_INFO' && (
              <span className="badge badge-info">
                <AlertCircle size={13} />
                <span>Needs More Info</span>
              </span>
            )}
            {evalData.overallStatus === 'NOT_ELIGIBLE' && (
              <span className="badge badge-fail">
                <XCircle size={13} />
                <span>Does Not Match</span>
              </span>
            )}
            <p className="text-sm text-muted" style={{ marginTop: '6px', fontSize: '0.825rem' }}>
              {evalData.summaryReason}
            </p>
          </div>
        )}

        {/* Benefits summary */}
        <div className="card-benefits">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={16} />
            <span>{scholarship.benefits}</span>
          </div>
        </div>

        {/* Simple Student-Friendly Details List */}
        <ul className="card-details-list">
          <li>
            <span>Your Education Level:</span>
            <strong>{scholarship.qualificationLevels.join(', ')}</strong>
          </li>
          <li>
            <span>Minimum Marks:</span>
            <strong>{scholarship.minMarksPercentage > 0 ? `${scholarship.minMarksPercentage}%` : 'Any percentage'}</strong>
          </li>
          <li>
            <span>Family Income Limit:</span>
            <strong>{scholarship.maxAnnualIncome > 0 ? `Up to ₹${scholarship.maxAnnualIncome.toLocaleString('en-IN')}` : 'No limit'}</strong>
          </li>
          <li>
            <span>Eligible States:</span>
            <strong>{scholarship.eligibleStates.join(', ')}</strong>
          </li>
        </ul>
      </div>

      {/* Card Actions */}
      <div className="card-actions">
        {isStudent && (
          <button
            onClick={handleSaveClick}
            disabled={saving}
            className={`btn btn-sm ${isSaved ? 'btn-secondary' : 'btn-outline'}`}
            title={isSaved ? 'Remove from saved' : 'Save scholarship'}
          >
            <Bookmark size={14} fill={isSaved ? 'currentColor' : 'none'} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        )}

        <Link to={`/scholarships/${scholarship._id}`} className="btn btn-outline btn-sm">
          <Eye size={14} />
          <span>View Details</span>
        </Link>

        <a
          href={scholarship.officialApplicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-sm"
        >
          <span>Apply Now</span>
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
}
