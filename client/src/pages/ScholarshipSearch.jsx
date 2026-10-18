import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { scholarshipService } from '../services/scholarshipService';
import ScholarshipCard from '../components/ScholarshipCard';
import SearchFilters from '../components/SearchFilters';
import { SlidersHorizontal, ArrowUpDown, SearchX, Loader2 } from 'lucide-react';

export default function ScholarshipSearch() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialSort = searchParams.get('sort') || 'deadline';

  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [filters, setFilters] = useState({
    search: initialSearch,
    state: 'All',
    qualificationLevel: 'All',
    type: 'All'
  });
  const [sortBy, setSortBy] = useState(initialSort); // deadline | recently_added | amount | name

  const fetchScholarships = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await scholarshipService.getAll({
        search: filters.search,
        state: filters.state,
        qualificationLevel: filters.qualificationLevel,
        type: filters.type,
        status: 'active'
      });
      if (res.success && res.scholarships) {
        setScholarships(res.scholarships);
      } else {
        setErrorMessage(res.message || 'Unable to load scholarships catalog.');
      }
    } catch (err) {
      console.error('Failed to search scholarships:', err);
      setErrorMessage('Could not connect to scholarship database. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, [filters]);

  const handleReset = () => {
    setFilters({
      search: '',
      state: 'All',
      qualificationLevel: 'All',
      type: 'All'
    });
  };

  // Sort logic
  const sortedScholarships = [...scholarships].sort((a, b) => {
    if (sortBy === 'deadline') {
      return new Date(a.applicationDeadline) - new Date(b.applicationDeadline);
    }
    if (sortBy === 'recently_added') {
      return new Date(b.createdAt || b.lastVerifiedDate) - new Date(a.createdAt || a.lastVerifiedDate);
    }
    if (sortBy === 'amount') {
      return (b.amount || 0) - (a.amount || 0);
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2>Find Scholarships</h2>
        <p className="text-muted text-sm" style={{ marginTop: '4px' }}>
          Explore verified government, state, and private educational aid opportunities.
        </p>
      </div>

      {/* Filter Component */}
      <SearchFilters
        filters={filters}
        setFilters={setFilters}
        onReset={handleReset}
      />

      {/* Results Header and Sort Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <p className="text-sm font-medium text-muted">
          Showing <strong>{sortedScholarships.length}</strong> scholarship{sortedScholarships.length === 1 ? '' : 's'}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowUpDown size={15} color="var(--text-muted)" />
          <label htmlFor="sort-dropdown" className="text-sm text-muted">Sort by:</label>
          <select
            id="sort-dropdown"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.875rem' }}
          >
            <option value="deadline">Closing Soon (Deadline)</option>
            <option value="recently_added">Recently Added</option>
            <option value="amount">Highest Award Amount</option>
            <option value="name">Scheme Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Error Message State */}
      {errorMessage && (
        <div className="alert alert-error" style={{ marginBottom: '24px' }}>
          {errorMessage}
        </div>
      )}

      {/* Loading Indicator */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Loader2 size={32} color="var(--blue-600)" className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <p className="text-muted text-sm">Searching scholarship catalog...</p>
        </div>
      ) : sortedScholarships.length > 0 ? (
        <div className="scholarship-grid">
          {sortedScholarships.map(s => (
            <ScholarshipCard key={s._id} scholarship={s} onSaveToggle={fetchScholarships} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#ffffff' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <SearchX size={28} color="var(--text-muted)" />
          </div>
          <h3 style={{ marginBottom: '8px', fontSize: '1.2rem' }}>No Matching Scholarships Found</h3>
          <p className="text-muted text-sm" style={{ maxWidth: '440px', margin: '0 auto 20px' }}>
            We couldn't find any scholarships matching your specific filters. Try searching with different keywords or reset your filters.
          </p>
          <button onClick={handleReset} className="btn btn-primary btn-sm">
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}
