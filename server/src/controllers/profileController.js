const repository = require('../config/repository');

/**
 * Calculate profile completion percentage
 */
function calculateCompletion(p) {
  if (!p) return 0;
  const fields = [
    Boolean(p.fullName),
    Boolean(p.state),
    Boolean(p.course),
    Boolean(p.qualificationLevel),
    Boolean(p.currentYear),
    Boolean(p.institutionType),
    p.marksPercentage !== null && p.marksPercentage !== undefined && p.marksPercentage !== '',
    p.annualIncome !== null && p.annualIncome !== undefined && p.annualIncome !== '',
    Boolean(p.category),
    Boolean(p.gender)
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

/**
 * Get profile of currently logged-in student
 */
const getMyProfile = async (req, res) => {
  try {
    const profile = await repository.profiles.findByUserId(req.user.id);
    const completionPercentage = calculateCompletion(profile);

    return res.json({
      success: true,
      profile: profile || null,
      completionPercentage
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving profile.'
    });
  }
};

/**
 * Update or save student profile
 */
const updateProfile = async (req, res) => {
  try {
    const {
      fullName,
      state,
      course,
      qualificationLevel,
      currentYear,
      institutionType,
      marksPercentage,
      annualIncome,
      category,
      gender,
      hasDisability,
      disabilityPercentage,
      isFirstGenerationLearner
    } = req.body;

    // Validate marks if provided
    if (marksPercentage !== null && marksPercentage !== undefined && marksPercentage !== '') {
      const marks = Number(marksPercentage);
      if (isNaN(marks) || marks < 0 || marks > 100) {
        return res.status(400).json({
          success: false,
          message: 'Academic marks must be a valid percentage between 0 and 100.'
        });
      }
    }

    // Validate income if provided
    if (annualIncome !== null && annualIncome !== undefined && annualIncome !== '') {
      const income = Number(annualIncome);
      if (isNaN(income) || income < 0) {
        return res.status(400).json({
          success: false,
          message: 'Annual family income must be a valid positive number.'
        });
      }
    }

    const profileData = {
      fullName: (fullName || req.user.name).trim(),
      state: (state || '').trim(),
      course: (course || '').trim(),
      qualificationLevel: qualificationLevel || '',
      currentYear: currentYear || '',
      institutionType: institutionType || '',
      marksPercentage: marksPercentage !== '' && marksPercentage !== null && marksPercentage !== undefined ? Number(marksPercentage) : null,
      annualIncome: annualIncome !== '' && annualIncome !== null && annualIncome !== undefined ? Number(annualIncome) : null,
      category: category || '',
      gender: gender || '',
      hasDisability: Boolean(hasDisability),
      disabilityPercentage: hasDisability && disabilityPercentage ? Number(disabilityPercentage) : 0,
      isFirstGenerationLearner: Boolean(isFirstGenerationLearner)
    };

    const savedProfile = await repository.profiles.upsert(req.user.id, profileData);
    const completionPercentage = calculateCompletion(savedProfile);

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      profile: savedProfile,
      completionPercentage
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating profile.'
    });
  }
};

module.exports = {
  getMyProfile,
  updateProfile,
  calculateCompletion
};
