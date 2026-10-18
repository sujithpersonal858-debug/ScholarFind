import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../services/studentService';
import { validateMarks, validateIncome } from '../utils/validation';
import { CheckCircle2, Save, ShieldCheck, User, ArrowLeft } from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh'
];

const EDUCATION_LEVELS = [
  'Higher Secondary',
  'Diploma',
  'Undergraduate',
  'Postgraduate',
  'Doctoral'
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];

const INSTITUTION_TYPES = [
  'Government',
  'Government Aided',
  'Private / Self-Financed',
  'Central University / Institute'
];

const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS', 'Minority'];

const GENDERS = ['Male', 'Female', 'Transgender', 'Prefer not to say'];

export default function StudentProfile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    state: '',
    course: '',
    qualificationLevel: '',
    currentYear: '',
    institutionType: '',
    marksPercentage: '',
    annualIncome: '',
    category: '',
    gender: '',
    hasDisability: false,
    disabilityPercentage: '',
    isFirstGenerationLearner: false
  });

  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await studentService.getProfile();
        if (res.success && res.profile) {
          const p = res.profile;
          setFormData({
            fullName: p.fullName || '',
            state: p.state || '',
            course: p.course || '',
            qualificationLevel: p.qualificationLevel || '',
            currentYear: p.currentYear || '',
            institutionType: p.institutionType || '',
            marksPercentage: p.marksPercentage !== null && p.marksPercentage !== undefined ? p.marksPercentage : '',
            annualIncome: p.annualIncome !== null && p.annualIncome !== undefined ? p.annualIncome : '',
            category: p.category || '',
            gender: p.gender || '',
            hasDisability: Boolean(p.hasDisability),
            disabilityPercentage: p.disabilityPercentage || '',
            isFirstGenerationLearner: Boolean(p.isFirstGenerationLearner)
          });
          setCompletion(res.completionPercentage || 0);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    const marksErr = validateMarks(formData.marksPercentage);
    if (marksErr) {
      setMessage({ type: 'error', text: marksErr });
      return;
    }

    const incomeErr = validateIncome(formData.annualIncome);
    if (incomeErr) {
      setMessage({ type: 'error', text: incomeErr });
      return;
    }

    setSaving(true);
    try {
      const res = await studentService.updateProfile(formData);
      if (res.success) {
        setMessage({ type: 'success', text: 'Profile saved! Your scholarship recommendations have been updated.' });
        setCompletion(res.completionPercentage);
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to save profile.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Server error saving profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <p className="text-muted">Loading your profile details...</p>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '820px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2>Check If You Qualify</h2>
          <p className="text-muted text-sm" style={{ marginTop: '2px' }}>
            Enter your simple educational and background details to see matching scholarships.
          </p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="btn btn-outline btn-sm">
          <ArrowLeft size={14} />
          <span>Go to Dashboard</span>
        </button>
      </div>

      {/* Profile Completeness Bar */}
      <div className="card-subtle" style={{ marginBottom: '24px', backgroundColor: '#ffffff', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="font-semibold text-sm">Profile Completeness</span>
          <span className="text-sm font-semibold" style={{ color: 'var(--blue-600)' }}>{completion}%</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${completion}%` }} />
        </div>
        <p className="text-xs text-muted" style={{ margin: 0 }}>
          {completion === 100
            ? 'Great job! Your profile is 100% complete.'
            : 'Fill in the remaining fields so the system can evaluate every scholarship accurately.'}
        </p>
      </div>

      {message.text && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <h3 style={{ marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
          Personal Details
        </h3>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="p-fullname">Full Name</label>
            <input
              id="p-fullname"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Mahesh Kumar"
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="p-state">Your State</label>
            <select
              id="p-state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">-- Select Your State --</option>
              {INDIAN_STATES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <p className="form-help">State-specific schemes require your residence state.</p>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="p-gender">Gender</label>
            <select
              id="p-gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">-- Select Gender --</option>
              {GENDERS.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="p-category">Social Category</label>
            <select
              id="p-category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">-- Select Category --</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <p className="form-help">Used strictly to evaluate category-specific grants.</p>
          </div>
        </div>

        <h3 style={{ marginTop: '24px', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
          Education &amp; Marks
        </h3>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="p-course">Current Course / Degree</label>
            <input
              id="p-course"
              type="text"
              name="course"
              value={formData.course}
              onChange={handleChange}
              placeholder="e.g. B.Tech / B.E., B.Sc, MBBS, Diploma"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="p-qual">Your Education Level</label>
            <select
              id="p-qual"
              name="qualificationLevel"
              value={formData.qualificationLevel}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">-- Select Education Level --</option>
              {EDUCATION_LEVELS.map(q => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="p-year">Current Year</label>
            <select
              id="p-year"
              name="currentYear"
              value={formData.currentYear}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">-- Select Year --</option>
              {YEARS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="p-inst">College / Institution Type</label>
            <select
              id="p-inst"
              name="institutionType"
              value={formData.institutionType}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">-- Select Type --</option>
              {INSTITUTION_TYPES.map(i => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="p-marks">Previous Exam Marks (%)</label>
            <input
              id="p-marks"
              type="number"
              step="0.01"
              min="0"
              max="100"
              name="marksPercentage"
              value={formData.marksPercentage}
              onChange={handleChange}
              placeholder="e.g. 82.5"
              className="form-input"
            />
            <p className="form-help">Enter your percentage in Class 12 or last semester exam.</p>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="p-income">Annual Family Income (₹)</label>
            <input
              id="p-income"
              type="number"
              min="0"
              name="annualIncome"
              value={formData.annualIncome}
              onChange={handleChange}
              placeholder="e.g. 350000"
              className="form-input"
            />
            <p className="form-help">Total yearly family income from all sources.</p>
          </div>
        </div>

        <h3 style={{ marginTop: '24px', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
          Special Quotas &amp; Privacy
        </h3>

        <div style={{ backgroundColor: 'var(--blue-50)', padding: '14px 16px', borderRadius: 'var(--radius-md)', marginBottom: '18px', border: '1px solid var(--blue-100)' }}>
          <p className="text-xs text-muted" style={{ lineHeight: '1.5', margin: 0, color: 'var(--blue-700)' }}>
            <strong>Privacy Guarantee:</strong> Details about disability or first-generation status are used solely to determine eligibility for quota-specific grants. They are never shared publicly.
          </p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9375rem' }}>
            <input
              type="checkbox"
              name="hasDisability"
              checked={formData.hasDisability}
              onChange={handleChange}
            />
            <span>I belong to the Persons with Disabilities (PwD) / Specially Abled category</span>
          </label>
        </div>

        {formData.hasDisability && (
          <div className="form-group" style={{ maxWidth: '320px', marginLeft: '24px', marginBottom: '20px' }}>
            <label className="form-label" htmlFor="p-disability-pct">Disability Percentage (%)</label>
            <input
              id="p-disability-pct"
              type="number"
              min="0"
              max="100"
              name="disabilityPercentage"
              value={formData.disabilityPercentage}
              onChange={handleChange}
              placeholder="e.g. 40"
              className="form-input"
            />
          </div>
        )}

        <div style={{ marginBottom: '28px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9375rem' }}>
            <input
              type="checkbox"
              name="isFirstGenerationLearner"
              checked={formData.isFirstGenerationLearner}
              onChange={handleChange}
            />
            <span>I am the first person in my family to attend college</span>
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" onClick={() => navigate('/dashboard')} className="btn btn-outline">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary">
            <Save size={15} />
            <span>{saving ? 'Saving...' : 'Save Details & Check Eligibility'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
