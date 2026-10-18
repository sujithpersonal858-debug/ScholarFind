import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';

export default function EligibilityBreakdown({ evaluation }) {
  if (!evaluation) return null;

  const { overallStatus, statusLabel, summaryReason, criteriaResults, missingFields, disclaimer } = evaluation;

  return (
    <div className="card" style={{ marginTop: '24px', backgroundColor: '#ffffff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <h3 style={{ fontSize: '1.2rem', color: 'var(--navy-900)' }}>Check If You Qualify Breakdown</h3>
        {overallStatus === 'POTENTIAL_MATCH' && (
          <span className="badge badge-match">
            <CheckCircle2 size={13} />
            <span>You Qualify</span>
          </span>
        )}
        {overallStatus === 'NEEDS_INFO' && (
          <span className="badge badge-info">
            <AlertCircle size={13} />
            <span>Needs More Information</span>
          </span>
        )}
        {overallStatus === 'NOT_ELIGIBLE' && (
          <span className="badge badge-fail">
            <XCircle size={13} />
            <span>Does Not Qualify</span>
          </span>
        )}
      </div>

      <p className="text-sm text-muted" style={{ marginBottom: '18px', fontSize: '0.925rem' }}>
        {summaryReason}
      </p>

      {missingFields && missingFields.length > 0 && (
        <div className="alert alert-info" style={{ marginBottom: '18px' }}>
          <Info size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>Missing Profile Information:</strong> Please update your profile with: <strong>{missingFields.join(', ')}</strong> to confirm your eligibility.
          </div>
        </div>
      )}

      <h4 style={{ marginBottom: '14px', fontSize: '0.975rem', color: 'var(--navy-800)' }}>Criteria Comparison:</h4>
      <div>
        {criteriaResults && criteriaResults.length > 0 ? (
          criteriaResults.map((item, idx) => (
            <div
              key={idx}
              className={`criteria-item ${
                item.status === 'MET' ? 'met' : item.status === 'FAILED' ? 'failed' : 'missing'
              }`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                <span className="font-semibold text-sm" style={{ color: 'var(--navy-900)' }}>{item.criterion}</span>
                <span className="text-xs font-semibold" style={{
                  color: item.status === 'MET' ? 'var(--success-text)' : item.status === 'FAILED' ? 'var(--danger-text)' : 'var(--warning-text)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {item.status === 'MET' ? <CheckCircle2 size={13} /> : item.status === 'FAILED' ? <XCircle size={13} /> : <AlertCircle size={13} />}
                  <span>{item.status === 'MET' ? 'Condition Met' : item.status === 'FAILED' ? 'Condition Not Met' : 'Information Missing'}</span>
                </span>
              </div>
              <div className="text-sm" style={{ marginBottom: '4px' }}>
                <span className="text-muted">Required:</span> <strong>{item.required}</strong>
              </div>
              <div className="text-sm" style={{ marginBottom: '6px' }}>
                <span className="text-muted">Your Profile:</span> <strong>{item.studentValue}</strong>
              </div>
              <p className="text-xs text-muted" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '6px', marginTop: '6px' }}>
                {item.explanation}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted">No restrictive eligibility filters apply to this open scheme.</p>
        )}
      </div>

      <div style={{ marginTop: '16px', padding: '12px 14px', backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <p className="text-xs text-muted" style={{ margin: 0, lineHeight: '1.5' }}>
          <strong>Notice:</strong> {disclaimer}
        </p>
      </div>
    </div>
  );
}
