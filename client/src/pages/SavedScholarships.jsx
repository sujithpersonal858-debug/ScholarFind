import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentService } from '../services/studentService';
import ScholarshipCard from '../components/ScholarshipCard';
import { Bookmark, Compass } from 'lucide-react';

export default function SavedScholarships() {
  const [savedList, setSavedList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      const res = await studentService.getSavedScholarships();
      if (res.success && res.saved) {
        setSavedList(res.saved);
      }
    } catch (err) {
      console.error('Failed to load saved scholarships:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  return (
    <div className="page-container">
      <div style={{ marginBottom: '24px' }}>
        <h2>Saved Scholarships</h2>
        <p className="text-muted text-sm" style={{ marginTop: '2px' }}>
          Your bookmarked schemes saved for future reference and application.
        </p>
      </div>

      {loading ? (
        <p className="text-muted">Loading your saved scholarships...</p>
      ) : savedList.length > 0 ? (
        <div className="scholarship-grid">
          {savedList.map(item => {
            const s = item.scholarshipId;
            if (!s) return null;
            return (
              <ScholarshipCard
                key={s._id}
                scholarship={{ ...s, isSaved: true }}
                onSaveToggle={fetchSaved}
              />
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '54px 20px' }}>
          <Bookmark size={36} color="var(--text-muted)" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ marginBottom: '8px' }}>No Saved Scholarships</h3>
          <p className="text-sm text-muted" style={{ maxWidth: '440px', margin: '0 auto 20px' }}>
            Click the "Save" button on any scholarship card to keep it handy in this list.
          </p>
          <Link to="/explore" className="btn btn-primary btn-sm">
            <Compass size={14} />
            <span>Find Scholarships</span>
          </Link>
        </div>
      )}
    </div>
  );
}
