import React from 'react';
import { Search, RotateCcw, Filter } from 'lucide-react';

const STATES = [
  'All',
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Delhi',
  'Gujarat',
  'Haryana',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'West Bengal'
];

const EDUCATION_LEVELS = [
  'All',
  'Higher Secondary',
  'Diploma',
  'Undergraduate',
  'Postgraduate',
  'Doctoral'
];

const SCHOLARSHIP_CATEGORIES = [
  'All',
  'Government (Central)',
  'Government (State)',
  'Corporate / Private',
  'Institutional'
];

export default function SearchFilters({ filters, setFilters, onReset }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card-subtle" style={{ marginBottom: '28px', backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)' }}>
      {/* Search Input Bar */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            name="search"
            value={filters.search || ''}
            onChange={handleChange}
            placeholder="Search scholarships by name or provider..."
            className="form-input"
            style={{ paddingLeft: '42px', fontSize: '1rem', height: '48px' }}
          />
        </div>
      </div>

      {/* Filter Dropdowns Grid */}
      <div className="form-grid">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Your State</label>
          <select name="state" value={filters.state || 'All'} onChange={handleChange} className="form-select">
            {STATES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Your Education Level</label>
          <select name="qualificationLevel" value={filters.qualificationLevel || 'All'} onChange={handleChange} className="form-select">
            {EDUCATION_LEVELS.map(q => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Scholarship Category</label>
          <select name="type" value={filters.type || 'All'} onChange={handleChange} className="form-select">
            {SCHOLARSHIP_CATEGORIES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button type="button" onClick={onReset} className="btn btn-outline btn-sm">
          <RotateCcw size={14} />
          <span>Reset Filters</span>
        </button>
      </div>
    </div>
  );
}
