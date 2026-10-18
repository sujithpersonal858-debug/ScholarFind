const repository = require('../config/repository');
const { evaluateEligibility } = require('../services/eligibilityService');
const { calculateCompletion } = require('./profileController');

/**
 * Get all scholarships with optional query filters and keyword search
 */
const getAllScholarships = async (req, res) => {
  try {
    const { search, state, course, qualificationLevel, type, status } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    } else {
      // Default to active for regular users unless specified
      if (!req.user || req.user.role !== 'admin') {
        filter.status = 'active';
      }
    }

    let scholarships = await repository.scholarships.find(filter);

    // Apply in-memory search and filters for fast, accurate matching
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      scholarships = scholarships.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.provider.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (s.benefits && s.benefits.toLowerCase().includes(q))
      );
    }

    if (state && state !== 'All') {
      const targetState = state.toLowerCase();
      scholarships = scholarships.filter(s =>
        s.eligibleStates.includes('All') ||
        s.eligibleStates.some(st => st.toLowerCase() === targetState)
      );
    }

    if (course && course !== 'All') {
      const targetCourse = course.toLowerCase();
      scholarships = scholarships.filter(s =>
        s.eligibleCourses.includes('All') ||
        s.eligibleCourses.some(c => c.toLowerCase() === targetCourse || targetCourse.includes(c.toLowerCase()))
      );
    }

    if (qualificationLevel && qualificationLevel !== 'All') {
      scholarships = scholarships.filter(s =>
        s.qualificationLevels.includes('All') ||
        s.qualificationLevels.includes(qualificationLevel)
      );
    }

    if (type && type !== 'All') {
      scholarships = scholarships.filter(s => s.scholarshipType === type);
    }

    // If student is logged in, optionally include eligibility match result
    let studentProfile = null;
    let savedIds = new Set();

    if (req.user && req.user.role === 'student') {
      studentProfile = await repository.profiles.findByUserId(req.user.id);
      const savedItems = await repository.saved.find(req.user.id);
      savedIds = new Set(savedItems.map(item => item.scholarshipId?._id?.toString() || item.scholarshipId?.toString()));
    }

    const enhanced = scholarships.map(s => {
      const isSaved = savedIds.has(s._id.toString());
      if (studentProfile) {
        const evaluation = evaluateEligibility(s, studentProfile);
        return {
          ...s,
          isSaved,
          evaluation
        };
      }
      return {
        ...s,
        isSaved,
        evaluation: null
      };
    });

    return res.json({
      success: true,
      count: enhanced.length,
      scholarships: enhanced
    });
  } catch (error) {
    console.error('Get scholarships error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving scholarships.'
    });
  }
};

/**
 * Get single scholarship by ID
 */
const getScholarshipById = async (req, res) => {
  try {
    const { id } = req.params;
    const scholarship = await repository.scholarships.findById(id);

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship record not found.'
      });
    }

    let evaluation = null;
    let isSaved = false;
    let applicationTrack = null;

    if (req.user && req.user.role === 'student') {
      const profile = await repository.profiles.findByUserId(req.user.id);
      if (profile) {
        evaluation = evaluateEligibility(scholarship, profile);
      }
      isSaved = await repository.saved.isSaved(req.user.id, id);
      const tracks = await repository.tracking.find(req.user.id);
      applicationTrack = tracks.find(t => (t.scholarshipId?._id?.toString() || t.scholarshipId?.toString()) === id.toString()) || null;
    }

    return res.json({
      success: true,
      scholarship,
      isSaved,
      applicationTrack,
      evaluation
    });
  } catch (error) {
    console.error('Get scholarship by id error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving scholarship details.'
    });
  }
};

/**
 * Get personalized recommendations for authenticated student
 */
const getRecommendations = async (req, res) => {
  try {
    const profile = await repository.profiles.findByUserId(req.user.id);
    const completionPercentage = calculateCompletion(profile);

    const activeScholarships = await repository.scholarships.find({ status: 'active' });
    const savedItems = await repository.saved.find(req.user.id);
    const savedIds = new Set(savedItems.map(item => item.scholarshipId?._id?.toString() || item.scholarshipId?.toString()));

    const potentialMatches = [];
    const needsInfo = [];
    const notEligible = [];

    activeScholarships.forEach(s => {
      const isSaved = savedIds.has(s._id.toString());
      const evaluation = evaluateEligibility(s, profile);
      const item = {
        ...s,
        isSaved,
        evaluation
      };

      if (evaluation.overallStatus === 'POTENTIAL_MATCH') {
        potentialMatches.push(item);
      } else if (evaluation.overallStatus === 'NEEDS_INFO') {
        needsInfo.push(item);
      } else {
        notEligible.push(item);
      }
    });

    return res.json({
      success: true,
      profileCompletion: completionPercentage,
      summary: {
        potentialMatchesCount: potentialMatches.length,
        needsInfoCount: needsInfo.length,
        notEligibleCount: notEligible.length,
        totalActiveCount: activeScholarships.length
      },
      potentialMatches,
      needsInfo,
      notEligible,
      disclaimer: 'ScholarFind provides rule-based preliminary matching. Final eligibility, document verification, and selection are determined exclusively by the respective scholarship authorities.'
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error calculating recommendations.'
    });
  }
};

/**
 * Create scholarship (Admin only)
 */
const createScholarship = async (req, res) => {
  try {
    const {
      name,
      provider,
      scholarshipType,
      description,
      eligibleCourses,
      qualificationLevels,
      eligibleStates,
      minMarksPercentage,
      maxAnnualIncome,
      applicableCategories,
      eligibleGenders,
      requiresDisability,
      minDisabilityPercentage,
      benefits,
      amount,
      requiredDocuments,
      openingDate,
      applicationDeadline,
      officialNotificationUrl,
      officialApplicationUrl,
      status
    } = req.body;

    if (!name || !provider || !description || !applicationDeadline || !officialApplicationUrl) {
      return res.status(400).json({
        success: false,
        message: 'Name, provider, description, application deadline, and official application URL are required.'
      });
    }

    const resolvedBenefits = (benefits && benefits.trim())
      ? benefits.trim()
      : (amount ? `Financial grant of ₹${Number(amount).toLocaleString('en-IN')}` : 'Financial assistance and educational grant');

    // Helper to normalize comma-separated strings or arrays
    const toArray = (val) => {
      if (Array.isArray(val)) return val.length > 0 ? val : ['All'];
      if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
      return ['All'];
    };

    const newScholarship = await repository.scholarships.create({
      name: name.trim(),
      provider: provider.trim(),
      scholarshipType: scholarshipType || 'Government (Central)',
      description: description.trim(),
      eligibleCourses: toArray(eligibleCourses),
      qualificationLevels: toArray(qualificationLevels),
      eligibleStates: toArray(eligibleStates),
      minMarksPercentage: Number(minMarksPercentage) || 0,
      maxAnnualIncome: Number(maxAnnualIncome) || 0,
      applicableCategories: toArray(applicableCategories),
      eligibleGenders: toArray(eligibleGenders),
      requiresDisability: Boolean(requiresDisability),
      minDisabilityPercentage: Number(minDisabilityPercentage) || 0,
      benefits: resolvedBenefits,
      amount: Number(amount) || 0,
      requiredDocuments: Array.isArray(requiredDocuments)
        ? requiredDocuments
        : (typeof requiredDocuments === 'string' ? requiredDocuments.split(',').map(s => s.trim()).filter(Boolean) : []),
      openingDate: openingDate ? new Date(openingDate) : null,
      applicationDeadline: new Date(applicationDeadline),
      officialNotificationUrl: (officialNotificationUrl || '').trim(),
      officialApplicationUrl: officialApplicationUrl.trim(),
      status: status || 'active',
      lastVerifiedDate: new Date(),
      verifiedByAdmin: true
    });

    return res.status(201).json({
      success: true,
      message: 'Scholarship created successfully.',
      scholarship: newScholarship
    });
  } catch (error) {
    console.error('Create scholarship error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error creating scholarship record.'
    });
  }
};

/**
 * Update scholarship (Admin only)
 */
const updateScholarship = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Format fields if present
    if (updates.applicationDeadline) {
      updates.applicationDeadline = new Date(updates.applicationDeadline);
    }
    if (updates.openingDate) {
      updates.openingDate = new Date(updates.openingDate);
    }
    if (updates.minMarksPercentage !== undefined) {
      updates.minMarksPercentage = Number(updates.minMarksPercentage) || 0;
    }
    if (updates.maxAnnualIncome !== undefined) {
      updates.maxAnnualIncome = Number(updates.maxAnnualIncome) || 0;
    }
    if (updates.amount !== undefined) {
      updates.amount = Number(updates.amount) || 0;
    }

    const toArray = (val) => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
      return val;
    };

    if (updates.eligibleCourses !== undefined) updates.eligibleCourses = toArray(updates.eligibleCourses);
    if (updates.qualificationLevels !== undefined) updates.qualificationLevels = toArray(updates.qualificationLevels);
    if (updates.eligibleStates !== undefined) updates.eligibleStates = toArray(updates.eligibleStates);
    if (updates.applicableCategories !== undefined) updates.applicableCategories = toArray(updates.applicableCategories);
    if (updates.eligibleGenders !== undefined) updates.eligibleGenders = toArray(updates.eligibleGenders);
    if (updates.requiredDocuments !== undefined) updates.requiredDocuments = toArray(updates.requiredDocuments);

    updates.lastVerifiedDate = new Date();
    updates.verifiedByAdmin = true;

    const updated = await repository.scholarships.update(id, updates);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found.'
      });
    }

    return res.json({
      success: true,
      message: 'Scholarship updated successfully.',
      scholarship: updated
    });
  } catch (error) {
    console.error('Update scholarship error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating scholarship record.'
    });
  }
};

/**
 * Delete scholarship (Admin only)
 */
const deleteScholarship = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await repository.scholarships.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found.'
      });
    }

    return res.json({
      success: true,
      message: 'Scholarship removed successfully.'
    });
  } catch (error) {
    console.error('Delete scholarship error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting scholarship.'
    });
  }
};

module.exports = {
  getAllScholarships,
  getScholarshipById,
  getRecommendations,
  createScholarship,
  updateScholarship,
  deleteScholarship
};
