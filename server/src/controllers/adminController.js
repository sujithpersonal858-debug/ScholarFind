const repository = require('../config/repository');

/**
 * Get system overview metrics for administrator dashboard
 */
const getOverview = async (req, res) => {
  try {
    const stats = await repository.stats.getOverview();
    return res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving administration overview.'
    });
  }
};

/**
 * Get list of all registered students with their profile info
 */
const getStudents = async (req, res) => {
  try {
    const students = await repository.users.findAllStudents();
    return res.json({
      success: true,
      count: students.length,
      students
    });
  } catch (error) {
    console.error('Admin get students error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving student directory.'
    });
  }
};

/**
 * Update student status or notes
 */
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, isActive } = req.body;
    const updated = await repository.users.updateStatus(id, { name, email, isActive });
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.'
      });
    }
    return res.json({
      success: true,
      message: 'Student account updated successfully.',
      student: updated
    });
  } catch (error) {
    console.error('Admin update student error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating student record.'
    });
  }
};

/**
 * Get all submitted and tracked student applications
 */
const getApplications = async (req, res) => {
  try {
    const applications = await repository.tracking.findAllWithDetails();
    return res.json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    console.error('Admin get applications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving applications.'
    });
  }
};

/**
 * Update application review status and notes
 */
const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, adminFeedback } = req.body;
    const updated = await repository.tracking.updateById(id, {
      status,
      notes,
      adminFeedback: adminFeedback || '',
      reviewedAt: new Date().toISOString()
    });
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Application record not found.'
      });
    }
    return res.json({
      success: true,
      message: 'Application status and review updated successfully.',
      application: updated
    });
  } catch (error) {
    console.error('Admin update application error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating application.'
    });
  }
};

/**
 * Get eligibility rules overview across all active scholarships
 */
const getEligibilityRules = async (req, res) => {
  try {
    const scholarships = await repository.scholarships.find();
    const rulesSummary = scholarships.map(s => ({
      _id: s._id,
      name: s.name,
      provider: s.provider,
      educationLevels: s.qualificationLevels,
      courses: s.eligibleCourses,
      minMarks: s.minMarksPercentage,
      maxIncome: s.maxAnnualIncome,
      categories: s.applicableCategories,
      states: s.eligibleStates,
      genders: s.eligibleGenders,
      requiresDisability: s.requiresDisability,
      status: s.status
    }));

    return res.json({
      success: true,
      rules: rulesSummary
    });
  } catch (error) {
    console.error('Admin get rules error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving eligibility rules.'
    });
  }
};

/**
 * Get reports and analytics data
 */
const getReports = async (req, res) => {
  try {
    const [scholarships, students, applications] = await Promise.all([
      repository.scholarships.find(),
      repository.users.findAllStudents(),
      repository.tracking.findAllWithDetails()
    ]);

    // Group scholarships by Category (Type)
    const byCategory = {};
    scholarships.forEach(s => {
      const type = s.scholarshipType || 'Other';
      byCategory[type] = (byCategory[type] || 0) + 1;
    });

    // Group scholarships by Education Level
    const byLevel = {};
    scholarships.forEach(s => {
      (s.qualificationLevels || ['All']).forEach(lvl => {
        byLevel[lvl] = (byLevel[lvl] || 0) + 1;
      });
    });

    // Group applications by status
    const byStatus = {
      'Not Applied': 0,
      'Applied': 0,
      'Awaiting Result': 0,
      'Completed': 0
    };
    applications.forEach(a => {
      if (byStatus[a.status] !== undefined) {
        byStatus[a.status]++;
      } else {
        byStatus[a.status] = 1;
      }
    });

    // Top states represented by students
    const byState = {};
    students.forEach(st => {
      const stateName = st.profile?.state || 'Unspecified';
      byState[stateName] = (byState[stateName] || 0) + 1;
    });

    return res.json({
      success: true,
      analytics: {
        totalScholarships: scholarships.length,
        totalStudents: students.length,
        totalApplications: applications.length,
        byCategory,
        byLevel,
        byStatus,
        byState
      }
    });
  } catch (error) {
    console.error('Admin reports error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error generating analytics report.'
    });
  }
};

module.exports = {
  getOverview,
  getStudents,
  updateStudent,
  getApplications,
  updateApplication,
  getEligibilityRules,
  getReports
};
