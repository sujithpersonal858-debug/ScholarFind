import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { scholarshipService } from '../services/scholarshipService';
import { adminService } from '../services/adminService';
import { formatDate, formatCurrency } from '../utils/formatters';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Users,
  ShieldCheck,
  Sliders,
  BarChart3,
  Bell,
  Settings,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
  Edit,
  ExternalLink,
  Save,
  CheckCircle2,
  Clock,
  Award,
  Filter,
  RotateCcw
} from 'lucide-react';

const DEFAULT_SCHOLARSHIP_FORM = {
  name: '',
  provider: '',
  scholarshipType: 'Government (Central)',
  description: '',
  eligibleCourses: 'All',
  qualificationLevels: 'All',
  eligibleStates: 'All',
  minMarksPercentage: '',
  maxAnnualIncome: '',
  applicableCategories: 'All',
  eligibleGenders: 'All',
  requiresDisability: false,
  minDisabilityPercentage: '',
  otherEligibility: '',
  benefits: '',
  amount: '',
  requiredDocuments: '',
  openingDate: '',
  applicationDeadline: '',
  officialNotificationUrl: '',
  officialApplicationUrl: '',
  status: 'active'
};

export default function AdminDashboard({ initialTab = 'overview' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Resolve current active tab from pathname or query params
  const resolveActiveTab = () => {
    if (location.pathname === '/admin/scholarships') return 'scholarships';
    if (location.pathname === '/admin/scholarships/new') return 'add_scholarship';
    if (location.pathname === '/admin/students') return 'students';
    if (location.pathname === '/admin/applications') return 'applications';
    if (location.pathname === '/admin/rules') return 'rules';
    if (location.pathname === '/admin/reports') return 'reports';
    return searchParams.get('tab') || initialTab;
  };

  const activeTab = resolveActiveTab();

  const handleTabClick = (tab) => {
    if (tab === 'overview') navigate('/admin');
    else if (tab === 'scholarships') navigate('/admin/scholarships');
    else if (tab === 'add_scholarship') navigate('/admin/scholarships/new');
    else if (tab === 'students') navigate('/admin/students');
    else if (tab === 'applications') navigate('/admin/applications');
    else if (tab === 'rules') navigate('/admin/rules');
    else if (tab === 'reports') navigate('/admin/reports');
    else setSearchParams({ tab });
  };

  // Data states
  const [stats, setStats] = useState(null);
  const [scholarships, setScholarships] = useState([]);
  const [students, setStudents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [rules, setRules] = useState([]);
  const [reports, setReports] = useState(null);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  // Add / Edit form state
  const [formData, setFormData] = useState(DEFAULT_SCHOLARSHIP_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Application review state
  const [reviewingApp, setReviewingApp] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [overviewRes, schRes, studentsRes, appsRes, rulesRes, reportsRes] = await Promise.all([
        adminService.getOverview(),
        scholarshipService.getAll({ status: '' }),
        adminService.getStudents(),
        adminService.getApplications(),
        adminService.getEligibilityRules(),
        adminService.getReports()
      ]);

      if (overviewRes.success) setStats(overviewRes.stats);
      if (schRes.success) setScholarships(schRes.scholarships || []);
      if (studentsRes.success) setStudents(studentsRes.students || []);
      if (appsRes.success) setApplications(appsRes.applications || []);
      if (rulesRes.success) setRules(rulesRes.rules || []);
      if (reportsRes.success) setReports(reportsRes.analytics || null);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setFeedback({ type: 'error', text: 'Failed to connect to administrative endpoints.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback({ type: '', text: '' }), 4000);
  };

  // Form input change
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditScholarship = (s) => {
    setEditingId(s._id);
    setFormData({
      name: s.name || '',
      provider: s.provider || '',
      scholarshipType: s.scholarshipType || 'Government (Central)',
      description: s.description || '',
      eligibleCourses: Array.isArray(s.eligibleCourses) ? s.eligibleCourses.join(', ') : 'All',
      qualificationLevels: Array.isArray(s.qualificationLevels) ? s.qualificationLevels.join(', ') : 'All',
      eligibleStates: Array.isArray(s.eligibleStates) ? s.eligibleStates.join(', ') : 'All',
      minMarksPercentage: s.minMarksPercentage || '',
      maxAnnualIncome: s.maxAnnualIncome || '',
      applicableCategories: Array.isArray(s.applicableCategories) ? s.applicableCategories.join(', ') : 'All',
      eligibleGenders: Array.isArray(s.eligibleGenders) ? s.eligibleGenders.join(', ') : 'All',
      requiresDisability: Boolean(s.requiresDisability),
      minDisabilityPercentage: s.minDisabilityPercentage || '',
      otherEligibility: s.otherEligibility || '',
      benefits: s.benefits || '',
      amount: s.amount || '',
      requiredDocuments: Array.isArray(s.requiredDocuments) ? s.requiredDocuments.join(', ') : '',
      openingDate: s.openingDate ? s.openingDate.split('T')[0] : '',
      applicationDeadline: s.applicationDeadline ? s.applicationDeadline.split('T')[0] : '',
      officialNotificationUrl: s.officialNotificationUrl || '',
      officialApplicationUrl: s.officialApplicationUrl || '',
      status: s.status || 'active'
    });
    handleTabClick('add_scholarship');
  };

  const handleSaveScholarship = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.provider.trim() || !formData.description.trim() || !formData.applicationDeadline || !formData.officialApplicationUrl.trim()) {
      showNotification('error', 'Scholarship Name, Provider, Description, Application Deadline, and Official URL are required.');
      return;
    }

    if (formData.minMarksPercentage && (Number(formData.minMarksPercentage) < 0 || Number(formData.minMarksPercentage) > 100)) {
      showNotification('error', 'Minimum Marks percentage must be between 0 and 100.');
      return;
    }

    if (formData.openingDate && formData.applicationDeadline && new Date(formData.openingDate) > new Date(formData.applicationDeadline)) {
      showNotification('error', 'Opening date cannot be later than application deadline.');
      return;
    }

    setSaving(true);
    const resolvedBenefits = formData.benefits.trim() || (formData.amount ? `Financial assistance of ₹${Number(formData.amount).toLocaleString('en-IN')}` : 'Financial grant and academic support');

    const payload = {
      name: formData.name.trim(),
      provider: formData.provider.trim(),
      scholarshipType: formData.scholarshipType,
      description: formData.description.trim(),
      eligibleCourses: formData.eligibleCourses.split(',').map(s => s.trim()).filter(Boolean),
      qualificationLevels: formData.qualificationLevels.split(',').map(s => s.trim()).filter(Boolean),
      eligibleStates: formData.eligibleStates.split(',').map(s => s.trim()).filter(Boolean),
      minMarksPercentage: formData.minMarksPercentage ? Number(formData.minMarksPercentage) : 0,
      maxAnnualIncome: formData.maxAnnualIncome ? Number(formData.maxAnnualIncome) : 0,
      applicableCategories: formData.applicableCategories.split(',').map(s => s.trim()).filter(Boolean),
      eligibleGenders: formData.eligibleGenders.split(',').map(s => s.trim()).filter(Boolean),
      requiresDisability: Boolean(formData.requiresDisability),
      minDisabilityPercentage: formData.minDisabilityPercentage ? Number(formData.minDisabilityPercentage) : 0,
      otherEligibility: formData.otherEligibility ? formData.otherEligibility.trim() : '',
      benefits: resolvedBenefits,
      amount: formData.amount ? Number(formData.amount) : 0,
      requiredDocuments: formData.requiredDocuments.split(',').map(s => s.trim()).filter(Boolean),
      openingDate: formData.openingDate || null,
      applicationDeadline: formData.applicationDeadline,
      officialNotificationUrl: formData.officialNotificationUrl.trim(),
      officialApplicationUrl: formData.officialApplicationUrl.trim(),
      status: formData.status
    };

    try {
      if (editingId) {
        await scholarshipService.update(editingId, payload);
        showNotification('success', `Scholarship "${formData.name}" successfully updated.`);
      } else {
        await scholarshipService.create(payload);
        showNotification('success', `New scholarship "${formData.name}" successfully published.`);
      }
      setEditingId(null);
      setFormData(DEFAULT_SCHOLARSHIP_FORM);
      handleTabClick('scholarships');
      loadData();
    } catch (err) {
      showNotification('error', err.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (s) => {
    const newStatus = s.status === 'active' ? 'expired' : 'active';
    try {
      await scholarshipService.update(s._id, { status: newStatus });
      showNotification('success', `Scholarship "${s.name}" is now marked as ${newStatus === 'active' ? 'Published' : 'Unpublished'}.`);
      loadData();
    } catch (err) {
      showNotification('error', 'Failed to toggle publication status.');
    }
  };

  const handleDeleteScholarship = async (s) => {
    if (window.confirm(`Are you sure you want to permanently delete "${s.name}"? This action cannot be undone.`)) {
      try {
        await scholarshipService.delete(s._id);
        showNotification('success', `Scholarship "${s.name}" was permanently removed.`);
        loadData();
      } catch (err) {
        showNotification('error', 'Failed to delete scholarship.');
      }
    }
  };

  const handleUpdateApplicationStatus = async (e) => {
    e.preventDefault();
    if (!reviewingApp) return;

    try {
      await adminService.updateApplication(reviewingApp._id, {
        status: reviewStatus,
        notes: reviewNotes
      });
      showNotification('success', 'Application review updated.');
      setReviewingApp(null);
      loadData();
    } catch (err) {
      showNotification('error', 'Failed to update application review.');
    }
  };

  // Filter scholarships for manage table with search, category, and status filters
  const filteredScholarships = scholarships.filter(s => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch = !q ||
      s.name.toLowerCase().includes(q) ||
      s.provider.toLowerCase().includes(q) ||
      s.scholarshipType.toLowerCase().includes(q) ||
      (s.description && s.description.toLowerCase().includes(q));

    const matchesCategory = filterCategory === 'All' || s.scholarshipType === filterCategory;
    const matchesStatus = filterStatus === 'All' || s.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="page-container">
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2>Administrator Console</h2>
          <p className="text-muted text-sm" style={{ marginTop: '2px' }}>
            System-wide scholarship management, student directory, and application oversight.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              setEditingId(null);
              setFormData(DEFAULT_SCHOLARSHIP_FORM);
              handleTabClick('add_scholarship');
            }}
            className="btn btn-primary btn-sm"
          >
            <PlusCircle size={15} />
            <span>Add Scholarship</span>
          </button>
        </div>
      </div>

      {feedback.text && (
        <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {feedback.text}
        </div>
      )}

      {/* Admin Sub-navigation Tabs */}
      <div className="tabs-nav" style={{ marginBottom: '24px' }}>
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => handleTabClick('overview')}>
          <LayoutDashboard size={16} />
          <span>Overview</span>
        </button>
        <button className={`tab-btn ${activeTab === 'scholarships' ? 'active' : ''}`} onClick={() => handleTabClick('scholarships')}>
          <FileText size={16} />
          <span>Manage Scholarships ({scholarships.length})</span>
        </button>
        <button className={`tab-btn ${activeTab === 'add_scholarship' ? 'active' : ''}`} onClick={() => handleTabClick('add_scholarship')}>
          <PlusCircle size={16} />
          <span>{editingId ? 'Edit Scholarship' : 'Add Scholarship'}</span>
        </button>
        <button className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`} onClick={() => handleTabClick('students')}>
          <Users size={16} />
          <span>Students ({students.length})</span>
        </button>
        <button className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`} onClick={() => handleTabClick('applications')}>
          <ShieldCheck size={16} />
          <span>Review Applications ({applications.length})</span>
        </button>
        <button className={`tab-btn ${activeTab === 'rules' ? 'active' : ''}`} onClick={() => handleTabClick('rules')}>
          <Sliders size={16} />
          <span>Eligibility Rules</span>
        </button>
        <button className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => handleTabClick('reports')}>
          <BarChart3 size={16} />
          <span>Reports &amp; Analytics</span>
        </button>
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div>
          {/* Summary Cards */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon-box metric-icon-blue">
                <Award size={24} />
              </div>
              <div>
                <div className="metric-data-num">{stats?.totalScholarships || scholarships.length}</div>
                <div className="metric-data-label">Total Scholarships</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box metric-icon-navy">
                <Users size={24} />
              </div>
              <div>
                <div className="metric-data-num">{stats?.totalStudents || students.length}</div>
                <div className="metric-data-label">Registered Students</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box metric-icon-green">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div className="metric-data-num">{stats?.submittedApplications || applications.length}</div>
                <div className="metric-data-label">Submitted Applications</div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon-box metric-icon-amber">
                <Clock size={24} />
              </div>
              <div>
                <div className="metric-data-num">{stats?.pendingApplications || 0}</div>
                <div className="metric-data-label">Pending Reviews</div>
              </div>
            </div>
          </div>

          {/* Recent Applications Quick View */}
          <div className="card" style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem' }}>Recent Student Applications</h3>
              <button onClick={() => setActiveTab('applications')} className="btn btn-outline btn-sm">
                View All Applications
              </button>
            </div>

            {applications.length > 0 ? (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Scholarship</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.slice(0, 5).map(app => (
                      <tr key={app._id}>
                        <td>
                          <strong>{app.userId?.name || 'Student'}</strong>
                          <div className="text-xs text-muted">{app.userId?.email}</div>
                        </td>
                        <td>
                          <strong>{app.scholarshipId?.name || 'Scholarship Scheme'}</strong>
                          <div className="text-xs text-muted">{app.scholarshipId?.provider}</div>
                        </td>
                        <td>{formatDate(app.appliedDate || app.createdAt)}</td>
                        <td>
                          <span className={`badge ${app.status === 'Completed' ? 'badge-match' : app.status === 'Applied' ? 'badge-blue' : 'badge-info'}`}>
                            {app.status}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => {
                              setReviewingApp(app);
                              setReviewStatus(app.status);
                              setReviewNotes(app.notes || '');
                              setActiveTab('applications');
                            }}
                            className="btn btn-outline btn-sm"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted">No student applications submitted yet.</p>
            )}
          </div>
        </div>
      )}

      {/* 2. MANAGE SCHOLARSHIPS TAB */}
      {activeTab === 'scholarships' && (
        <div>
          <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div className="search-bar-wrapper" style={{ flex: '1 1 280px' }}>
                <Search size={18} color="var(--text-muted)" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search scholarships by name, provider, or keyword..."
                  className="form-input"
                  style={{ border: 'none', background: 'transparent' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="form-select"
                  style={{ minWidth: '170px' }}
                >
                  <option value="All">All Categories</option>
                  <option value="Government (Central)">Government (Central)</option>
                  <option value="Government (State)">Government (State)</option>
                  <option value="Corporate / Private">Corporate / Private</option>
                  <option value="Institutional">College / Institutional</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="form-select"
                  style={{ minWidth: '150px' }}
                >
                  <option value="All">All Statuses</option>
                  <option value="active">Published (Active)</option>
                  <option value="expired">Unpublished (Expired)</option>
                  <option value="unavailable">Unavailable</option>
                </select>

                {(searchTerm || filterCategory !== 'All' || filterStatus !== 'All') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterCategory('All');
                      setFilterStatus('All');
                    }}
                    className="btn btn-outline btn-sm"
                    title="Reset all search filters"
                  >
                    <RotateCcw size={14} />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '8px' }}>
              <span>
                Showing <strong>{filteredScholarships.length}</strong> of <strong>{scholarships.length}</strong> scholarships
              </span>
              <button
                onClick={() => {
                  setEditingId(null);
                  setFormData(DEFAULT_SCHOLARSHIP_FORM);
                  handleTabClick('add_scholarship');
                }}
                className="btn btn-primary btn-sm"
              >
                <PlusCircle size={14} />
                <span>Add New Scholarship</span>
              </button>
            </div>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Scheme Name &amp; Provider</th>
                  <th>Category</th>
                  <th>Deadline</th>
                  <th>Award Amount</th>
                  <th>Income Ceiling</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredScholarships.length > 0 ? (
                  filteredScholarships.map(s => {
                    const isPast = new Date(s.applicationDeadline) < new Date();
                    return (
                      <tr key={s._id}>
                        <td>
                          <strong>{s.name}</strong>
                          <div className="text-xs text-muted">{s.provider}</div>
                        </td>
                        <td>
                          <span className="badge badge-neutral">{s.scholarshipType}</span>
                        </td>
                        <td>
                          <span style={{ color: isPast ? '#991b1b' : 'inherit' }}>
                            {formatDate(s.applicationDeadline)}
                          </span>
                          {isPast && <div className="text-xs font-semibold" style={{ color: '#991b1b' }}>Passed</div>}
                        </td>
                        <td>{s.amount ? formatCurrency(s.amount) : 'Grant support'}</td>
                        <td>{formatCurrency(s.maxAnnualIncome)}</td>
                        <td>
                          <span className={`badge ${s.status === 'active' && !isPast ? 'badge-match' : 'badge-fail'}`}>
                            {s.status === 'active' ? 'Published' : 'Unpublished'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => handleEditScholarship(s)}
                              className="btn btn-outline btn-sm"
                              title="Edit scholarship details"
                            >
                              <Edit size={13} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleToggleStatus(s)}
                              className="btn btn-outline btn-sm"
                              title={s.status === 'active' ? 'Unpublish scholarship' : 'Publish scholarship'}
                            >
                              {s.status === 'active' ? 'Unpublish' : 'Publish'}
                            </button>
                            <button
                              onClick={() => handleDeleteScholarship(s)}
                              className="btn btn-danger btn-sm"
                              title="Delete scholarship permanently"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      No scholarships match the current search and filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ADD / EDIT SCHOLARSHIP FORM TAB */}
      {activeTab === 'add_scholarship' && (
        <div className="card" style={{ maxWidth: '880px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <h3 style={{ margin: 0 }}>
              {editingId ? 'Edit Scholarship Criteria' : 'Add New Verified Scholarship Scheme'}
            </h3>
            {editingId && (
              <span className="badge badge-blue">Editing ID: {editingId.slice(-6)}</span>
            )}
          </div>

          <form onSubmit={handleSaveScholarship}>
            {/* Primary Details */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Scholarship Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g. Central Sector Scheme of Scholarship (CSSS)"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Scholarship Provider / Organization *</label>
                <input
                  type="text"
                  name="provider"
                  value={formData.provider}
                  onChange={handleFormChange}
                  placeholder="e.g. Ministry of Education / Tata Trusts"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Scholarship Category *</label>
                <select name="scholarshipType" value={formData.scholarshipType} onChange={handleFormChange} className="form-select">
                  <option value="Government (Central)">Government (Central)</option>
                  <option value="Government (State)">Government (State)</option>
                  <option value="Corporate / Private">Corporate / Private</option>
                  <option value="Institutional">College / Institutional</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Publication Status</label>
                <select name="status" value={formData.status} onChange={handleFormChange} className="form-select">
                  <option value="active">Published (Open for matching)</option>
                  <option value="expired">Unpublished (Expired / Closed)</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Comprehensive overview of the scholarship scheme, purpose, and background..."
                className="form-textarea"
                required
              />
            </div>

            {/* Financial & Timeline */}
            <h4 style={{ marginTop: '20px', marginBottom: '14px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              Financial Award &amp; Application Dates
            </h4>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Scholarship Amount (₹, if available)</label>
                <input
                  type="number"
                  min="0"
                  name="amount"
                  value={formData.amount}
                  onChange={handleFormChange}
                  placeholder="e.g. 50000"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Financial Award / Benefits Description</label>
                <input
                  type="text"
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleFormChange}
                  placeholder="e.g. ₹50,000 per annum towards tuition fees (auto-generated if left blank)"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Application Opening Date</label>
                <input
                  type="date"
                  name="openingDate"
                  value={formData.openingDate}
                  onChange={handleFormChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Application Deadline *</label>
                <input
                  type="date"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleFormChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Eligibility Details */}
            <h4 style={{ marginTop: '20px', marginBottom: '14px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              Eligibility Criteria (Comma-separated for lists or 'All')
            </h4>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Eligible States</label>
                <input
                  type="text"
                  name="eligibleStates"
                  value={formData.eligibleStates}
                  onChange={handleFormChange}
                  placeholder="All, Maharashtra, Delhi, Karnataka"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Education Level</label>
                <input
                  type="text"
                  name="qualificationLevels"
                  value={formData.qualificationLevels}
                  onChange={handleFormChange}
                  placeholder="All, Undergraduate, Postgraduate, Diploma"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Eligible Courses</label>
                <input
                  type="text"
                  name="eligibleCourses"
                  value={formData.eligibleCourses}
                  onChange={handleFormChange}
                  placeholder="All, B.Tech, MBBS, B.Sc, B.Com"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Minimum Marks (%, if required)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  name="minMarksPercentage"
                  value={formData.minMarksPercentage}
                  onChange={handleFormChange}
                  placeholder="e.g. 75 (leave 0 if none)"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Annual Family Income Limit (₹, if required)</label>
                <input
                  type="number"
                  min="0"
                  name="maxAnnualIncome"
                  value={formData.maxAnnualIncome}
                  onChange={handleFormChange}
                  placeholder="e.g. 450000 (0 for no limit)"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Social Categories</label>
                <input
                  type="text"
                  name="applicableCategories"
                  value={formData.applicableCategories}
                  onChange={handleFormChange}
                  placeholder="All, General, OBC, SC, ST"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Eligible Gender</label>
                <input
                  type="text"
                  name="eligibleGenders"
                  value={formData.eligibleGenders}
                  onChange={handleFormChange}
                  placeholder="All, Female"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Other Eligibility Conditions</label>
                <input
                  type="text"
                  name="otherEligibility"
                  value={formData.otherEligibility}
                  onChange={handleFormChange}
                  placeholder="e.g. First generation learner, single girl child, orphaned"
                  className="form-input"
                />
              </div>
            </div>

            {/* Official URLs & Documents */}
            <h4 style={{ marginTop: '20px', marginBottom: '14px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              Official Links &amp; Required Documents
            </h4>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Official Application URL *</label>
                <input
                  type="url"
                  name="officialApplicationUrl"
                  value={formData.officialApplicationUrl}
                  onChange={handleFormChange}
                  placeholder="https://scholarships.gov.in"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Official Notification URL (PDF)</label>
                <input
                  type="url"
                  name="officialNotificationUrl"
                  value={formData.officialNotificationUrl}
                  onChange={handleFormChange}
                  placeholder="https://..."
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Required Documents (Comma-separated)</label>
              <input
                type="text"
                name="requiredDocuments"
                value={formData.requiredDocuments}
                onChange={handleFormChange}
                placeholder="Aadhaar Card, Income Certificate, Previous Year Marksheet, College Bonafide"
                className="form-input"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData(DEFAULT_SCHOLARSHIP_FORM);
                  handleTabClick('scholarships');
                }}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn btn-primary">
                <Save size={16} />
                <span>{saving ? 'Saving...' : editingId ? 'Update Scholarship' : 'Publish Scholarship'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. MANAGE STUDENTS TAB */}
      {activeTab === 'students' && (
        <div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '4px' }}>Registered Student Directory</h3>
            <p className="text-sm text-muted">
              Review registered students and their self-reported educational and demographic profiles.
            </p>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name &amp; Email</th>
                  <th>Your State</th>
                  <th>Education Level</th>
                  <th>Course</th>
                  <th>Marks (%)</th>
                  <th>Income</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {students.map(st => (
                  <tr key={st._id}>
                    <td>
                      <strong>{st.name}</strong>
                      <div className="text-xs text-muted">{st.email}</div>
                    </td>
                    <td>{st.profile?.state || 'Not specified'}</td>
                    <td>{st.profile?.qualificationLevel || 'Not specified'}</td>
                    <td>{st.profile?.course || 'Not specified'}</td>
                    <td>{st.profile?.marksPercentage ? `${st.profile.marksPercentage}%` : '-'}</td>
                    <td>{st.profile?.annualIncome ? formatCurrency(st.profile.annualIncome) : '-'}</td>
                    <td>{st.profile?.category || 'General'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. REVIEW APPLICATIONS TAB */}
      {activeTab === 'applications' && (
        <div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '4px' }}>Review Student Applications</h3>
            <p className="text-sm text-muted">
              Track student submissions, update review statuses, and append administrative verification notes.
            </p>
          </div>

          {/* Modal / Inline Review Editor */}
          {reviewingApp && (
            <div className="card" style={{ marginBottom: '24px', border: '2px solid var(--blue-600)' }}>
              <h4 style={{ marginBottom: '14px' }}>Reviewing Application: {reviewingApp.scholarshipId?.name}</h4>
              <p className="text-sm text-muted" style={{ marginBottom: '16px' }}>
                Applicant: <strong>{reviewingApp.userId?.name}</strong> ({reviewingApp.userId?.email})
              </p>

              <form onSubmit={handleUpdateApplicationStatus}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Review Status</label>
                    <select
                      value={reviewStatus}
                      onChange={(e) => setReviewStatus(e.target.value)}
                      className="form-select"
                    >
                      <option value="Applied">Applied (Pending Review)</option>
                      <option value="Awaiting Result">Awaiting Result</option>
                      <option value="Completed">Completed / Verified</option>
                      <option value="Not Applied">Not Applied</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Administrative Notes</label>
                    <input
                      type="text"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Notes on documents, verification, or portal reference..."
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={() => setReviewingApp(null)} className="btn btn-outline btn-sm">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Save Review
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Scholarship Scheme</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app._id}>
                    <td>
                      <strong>{app.userId?.name}</strong>
                      <div className="text-xs text-muted">{app.userId?.email}</div>
                    </td>
                    <td>
                      <strong>{app.scholarshipId?.name}</strong>
                      <div className="text-xs text-muted">{app.scholarshipId?.provider}</div>
                    </td>
                    <td>{formatDate(app.appliedDate || app.createdAt)}</td>
                    <td>
                      <span className={`badge ${app.status === 'Completed' ? 'badge-match' : app.status === 'Applied' ? 'badge-blue' : 'badge-info'}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="text-sm text-muted">{app.notes || 'No notes'}</td>
                    <td>
                      <button
                        onClick={() => {
                          setReviewingApp(app);
                          setReviewStatus(app.status);
                          setReviewNotes(app.notes || '');
                        }}
                        className="btn btn-outline btn-sm"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. ELIGIBILITY RULES TAB */}
      {activeTab === 'rules' && (
        <div>
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '4px' }}>Configured Eligibility Rules</h3>
            <p className="text-sm text-muted">
              Summary of mandatory rule constraints across all active and archived schemes.
            </p>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Scheme</th>
                  <th>Education Levels</th>
                  <th>Min Marks</th>
                  <th>Income Ceiling</th>
                  <th>Category</th>
                  <th>State</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rules.map(r => (
                  <tr key={r._id}>
                    <td><strong>{r.name}</strong></td>
                    <td>{r.educationLevels.join(', ')}</td>
                    <td>{r.minMarks > 0 ? `≥ ${r.minMarks}%` : 'Any'}</td>
                    <td>{formatCurrency(r.maxIncome)}</td>
                    <td>{r.categories.join(', ')}</td>
                    <td>{r.states.join(', ')}</td>
                    <td>
                      <span className={`badge ${r.status === 'active' ? 'badge-match' : 'badge-fail'}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. REPORTS & ANALYTICS TAB */}
      {activeTab === 'reports' && reports && (
        <div>
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '4px' }}>Platform Reports &amp; Analytics</h3>
            <p className="text-sm text-muted">
              Live statistics derived from the scholarship catalog, registered students, and application records.
            </p>
          </div>

          <div className="form-grid" style={{ marginBottom: '24px' }}>
            {/* By Category */}
            <div className="card">
              <h4 style={{ marginBottom: '14px', fontSize: '1rem' }}>Scholarships by Category</h4>
              {Object.entries(reports.byCategory || {}).map(([cat, count]) => (
                <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span>{cat}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>

            {/* By Education Level */}
            <div className="card">
              <h4 style={{ marginBottom: '14px', fontSize: '1rem' }}>Scholarships by Education Level</h4>
              {Object.entries(reports.byLevel || {}).map(([lvl, count]) => (
                <div key={lvl} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span>{lvl}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>

            {/* By Application Status */}
            <div className="card">
              <h4 style={{ marginBottom: '14px', fontSize: '1rem' }}>Applications by Status</h4>
              {Object.entries(reports.byStatus || {}).map(([status, count]) => (
                <div key={status} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span>{status}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
