/**
 * Rule-Based Scholarship Eligibility Matching Engine
 *
 * Compares a student's profile against scholarship eligibility criteria.
 * Produces clear, explainable evaluations categorized into:
 *  - POTENTIAL_MATCH (all verified mandatory criteria satisfied)
 *  - NEEDS_INFO (missing profile attributes needed to decide eligibility)
 *  - NOT_ELIGIBLE (one or more mandatory criteria explicitly not met)
 *
 * NOTE: The engine provides preliminary matching only. Final verification
 * and approval remain strictly with the official scholarship authority.
 */

const formatINR = (val) => {
  if (val === null || val === undefined) return '';
  return '₹' + Number(val).toLocaleString('en-IN');
};

/**
 * Checks a single scholarship against a student's profile.
 * @param {Object} scholarship - Scholarship model document/object
 * @param {Object} profile - StudentProfile model document/object
 * @returns {Object} detailed eligibility result
 */
function evaluateEligibility(scholarship, profile) {
  // If student profile does not exist at all
  if (!profile) {
    return {
      scholarshipId: scholarship._id,
      overallStatus: 'NEEDS_INFO',
      statusLabel: 'Profile Incomplete',
      criteriaResults: [],
      matchedCount: 0,
      failedCount: 0,
      missingCount: 1,
      missingFields: ['Full Profile'],
      summaryReason: 'Please complete your student profile to evaluate eligibility for this scheme.',
      disclaimer: 'Official scholarship providers determine final eligibility and award decisions.'
    };
  }

  const criteria = [];
  const missingFields = [];

  const hasValue = (v) => v !== undefined && v !== null && v !== '';

  // 1. Qualification Level check
  if (scholarship.qualificationLevels && scholarship.qualificationLevels.length > 0 && !scholarship.qualificationLevels.includes('All')) {
    const requiredLevels = scholarship.qualificationLevels;
    if (!hasValue(profile.qualificationLevel)) {
      criteria.push({
        criterion: 'Qualification Level',
        status: 'MISSING_INFO',
        required: requiredLevels.join(' or '),
        studentValue: 'Not specified in profile',
        explanation: `Please select your qualification level. This scholarship requires: ${requiredLevels.join(', ')}.`
      });
      missingFields.push('Qualification Level');
    } else {
      const isMatch = requiredLevels.some(l => l.toLowerCase() === profile.qualificationLevel.toLowerCase());
      if (isMatch) {
        criteria.push({
          criterion: 'Qualification Level',
          status: 'MET',
          required: requiredLevels.join(' or '),
          studentValue: profile.qualificationLevel,
          explanation: `Your qualification level (${profile.qualificationLevel}) is eligible for this scheme.`
        });
      } else {
        criteria.push({
          criterion: 'Qualification Level',
          status: 'FAILED',
          required: requiredLevels.join(' or '),
          studentValue: profile.qualificationLevel,
          explanation: `Scheme is designated for ${requiredLevels.join(', ')}, but you reported ${profile.qualificationLevel}.`
        });
      }
    }
  }

  // 2. Eligible Courses check
  if (scholarship.eligibleCourses && scholarship.eligibleCourses.length > 0 && !scholarship.eligibleCourses.includes('All')) {
    const courses = scholarship.eligibleCourses;
    if (!hasValue(profile.course)) {
      criteria.push({
        criterion: 'Course / Degree',
        status: 'MISSING_INFO',
        required: courses.join(' / '),
        studentValue: 'Not specified in profile',
        explanation: `Please specify your enrolled course. Eligible courses: ${courses.join(', ')}.`
      });
      missingFields.push('Course');
    } else {
      const studentCourseLower = profile.course.toLowerCase();
      const courseMatch = courses.some(c => c.toLowerCase() === studentCourseLower || studentCourseLower.includes(c.toLowerCase()));
      if (courseMatch) {
        criteria.push({
          criterion: 'Course / Degree',
          status: 'MET',
          required: courses.join(' / '),
          studentValue: profile.course,
          explanation: `Your course (${profile.course}) meets the scheme's eligible program requirements.`
        });
      } else {
        criteria.push({
          criterion: 'Course / Degree',
          status: 'FAILED',
          required: courses.join(' / '),
          studentValue: profile.course,
          explanation: `Eligible courses are limited to ${courses.join(', ')}. Your reported course is ${profile.course}.`
        });
      }
    }
  }

  // 3. Academic Marks / Percentage check
  if (scholarship.minMarksPercentage && scholarship.minMarksPercentage > 0) {
    const minMarks = scholarship.minMarksPercentage;
    if (!hasValue(profile.marksPercentage)) {
      criteria.push({
        criterion: 'Academic Marks',
        status: 'MISSING_INFO',
        required: `Minimum ${minMarks}%`,
        studentValue: 'Not specified in profile',
        explanation: `Previous exam marks are required to evaluate this scheme (requires ≥ ${minMarks}%).`
      });
      missingFields.push('Academic Marks');
    } else {
      const studentMarks = Number(profile.marksPercentage);
      if (studentMarks >= minMarks) {
        criteria.push({
          criterion: 'Academic Marks',
          status: 'MET',
          required: `Minimum ${minMarks}%`,
          studentValue: `${studentMarks}%`,
          explanation: `Your academic score of ${studentMarks}% meets or exceeds the required ${minMarks}%.`
        });
      } else {
        criteria.push({
          criterion: 'Academic Marks',
          status: 'FAILED',
          required: `Minimum ${minMarks}%`,
          studentValue: `${studentMarks}%`,
          explanation: `Your reported score of ${studentMarks}% is below the minimum threshold of ${minMarks}%.`
        });
      }
    }
  }

  // 4. Annual Family Income Ceiling check
  if (scholarship.maxAnnualIncome && scholarship.maxAnnualIncome > 0) {
    const maxIncome = scholarship.maxAnnualIncome;
    if (!hasValue(profile.annualIncome)) {
      criteria.push({
        criterion: 'Family Income Ceiling',
        status: 'MISSING_INFO',
        required: `Maximum ${formatINR(maxIncome)} per annum`,
        studentValue: 'Not specified in profile',
        explanation: `Annual family income is required to evaluate this income-capped scheme (requires ≤ ${formatINR(maxIncome)}).`
      });
      missingFields.push('Annual Income');
    } else {
      const studentIncome = Number(profile.annualIncome);
      if (studentIncome <= maxIncome) {
        criteria.push({
          criterion: 'Family Income Ceiling',
          status: 'MET',
          required: `Maximum ${formatINR(maxIncome)} per annum`,
          studentValue: formatINR(studentIncome),
          explanation: `Your reported annual family income (${formatINR(studentIncome)}) is within the ${formatINR(maxIncome)} limit.`
        });
      } else {
        criteria.push({
          criterion: 'Family Income Ceiling',
          status: 'FAILED',
          required: `Maximum ${formatINR(maxIncome)} per annum`,
          studentValue: formatINR(studentIncome),
          explanation: `Your reported income (${formatINR(studentIncome)}) exceeds the scheme limit of ${formatINR(maxIncome)}.`
        });
      }
    }
  }

  // 5. Eligible State / Domicile check
  if (scholarship.eligibleStates && scholarship.eligibleStates.length > 0 && !scholarship.eligibleStates.includes('All')) {
    const states = scholarship.eligibleStates;
    if (!hasValue(profile.state)) {
      criteria.push({
        criterion: 'Domicile / State',
        status: 'MISSING_INFO',
        required: states.join(', '),
        studentValue: 'Not specified in profile',
        explanation: `Domicile state is required. This scheme is open to residents of: ${states.join(', ')}.`
      });
      missingFields.push('State of Domicile');
    } else {
      const studentStateLower = profile.state.trim().toLowerCase();
      const stateMatch = states.some(s => s.trim().toLowerCase() === studentStateLower);
      if (stateMatch) {
        criteria.push({
          criterion: 'Domicile / State',
          status: 'MET',
          required: states.join(', '),
          studentValue: profile.state,
          explanation: `Your domicile state (${profile.state}) matches the scheme's eligible states.`
        });
      } else {
        criteria.push({
          criterion: 'Domicile / State',
          status: 'FAILED',
          required: states.join(', '),
          studentValue: profile.state,
          explanation: `This scheme is restricted to residents of ${states.join(', ')}. Your profile indicates ${profile.state}.`
        });
      }
    }
  }

  // 6. Social Category / Reservation check
  if (scholarship.applicableCategories && scholarship.applicableCategories.length > 0 && !scholarship.applicableCategories.includes('All')) {
    const categories = scholarship.applicableCategories;
    if (!hasValue(profile.category)) {
      criteria.push({
        criterion: 'Social Category',
        status: 'MISSING_INFO',
        required: categories.join(', '),
        studentValue: 'Not specified in profile',
        explanation: `Category information is required. Scheme applies to: ${categories.join(', ')}.`
      });
      missingFields.push('Category');
    } else {
      const categoryMatch = categories.includes(profile.category);
      if (categoryMatch) {
        criteria.push({
          criterion: 'Social Category',
          status: 'MET',
          required: categories.join(', '),
          studentValue: profile.category,
          explanation: `Your category (${profile.category}) matches the scheme's reservation requirements.`
        });
      } else {
        criteria.push({
          criterion: 'Social Category',
          status: 'FAILED',
          required: categories.join(', '),
          studentValue: profile.category,
          explanation: `Scheme is designated for ${categories.join(', ')} categories. You reported ${profile.category}.`
        });
      }
    }
  }

  // 7. Gender criteria check
  if (scholarship.eligibleGenders && scholarship.eligibleGenders.length > 0 && !scholarship.eligibleGenders.includes('All')) {
    const genders = scholarship.eligibleGenders;
    if (!hasValue(profile.gender)) {
      criteria.push({
        criterion: 'Gender Requirement',
        status: 'MISSING_INFO',
        required: genders.join(' / '),
        studentValue: 'Not specified in profile',
        explanation: `Gender details required. This scholarship is designated for: ${genders.join(', ')}.`
      });
      missingFields.push('Gender');
    } else {
      const isGenderMatch = genders.includes(profile.gender);
      if (isGenderMatch) {
        criteria.push({
          criterion: 'Gender Requirement',
          status: 'MET',
          required: genders.join(' / '),
          studentValue: profile.gender,
          explanation: `Your profile gender (${profile.gender}) meets the scheme eligibility.`
        });
      } else {
        criteria.push({
          criterion: 'Gender Requirement',
          status: 'FAILED',
          required: genders.join(' / '),
          studentValue: profile.gender,
          explanation: `This scheme is exclusively for ${genders.join(', ')} applicants. Your profile indicates ${profile.gender}.`
        });
      }
    }
  }

  // 8. Disability criteria check
  if (scholarship.requiresDisability) {
    if (!profile.hasDisability) {
      criteria.push({
        criterion: 'Persons with Disability (PwD)',
        status: 'FAILED',
        required: scholarship.minDisabilityPercentage ? `PwD with minimum ${scholarship.minDisabilityPercentage}% disability` : 'PwD status',
        studentValue: 'No disability reported',
        explanation: `This scholarship is reserved exclusively for candidates with benchmark disabilities.`
      });
    } else if (scholarship.minDisabilityPercentage > 0 && (profile.disabilityPercentage || 0) < scholarship.minDisabilityPercentage) {
      criteria.push({
        criterion: 'Disability Benchmark',
        status: 'FAILED',
        required: `Minimum ${scholarship.minDisabilityPercentage}% disability`,
        studentValue: `${profile.disabilityPercentage || 0}%`,
        explanation: `Reported disability (${profile.disabilityPercentage || 0}%) is below the minimum ${scholarship.minDisabilityPercentage}% requirement.`
      });
    } else {
      criteria.push({
        criterion: 'Persons with Disability (PwD)',
        status: 'MET',
        required: scholarship.minDisabilityPercentage ? `Minimum ${scholarship.minDisabilityPercentage}%` : 'PwD status',
        studentValue: `Verified PwD (${profile.disabilityPercentage || 40}%)`,
        explanation: `Your disability benchmark fulfills the scheme requirements.`
      });
    }
  }

  // Count outcomes
  const failedList = criteria.filter(c => c.status === 'FAILED');
  const missingList = criteria.filter(c => c.status === 'MISSING_INFO');
  const metList = criteria.filter(c => c.status === 'MET');

  let overallStatus;
  let statusLabel;
  let summaryReason;

  if (failedList.length > 0) {
    overallStatus = 'NOT_ELIGIBLE';
    statusLabel = 'Not Eligible';
    summaryReason = `Does not satisfy ${failedList.length} mandatory requirement(s): ${failedList.map(f => f.criterion).join(', ')}.`;
  } else if (missingList.length > 0) {
    overallStatus = 'NEEDS_INFO';
    statusLabel = 'Insufficient Information';
    summaryReason = `Matching requires additional details for ${missingList.length} field(s): ${missingList.map(m => m.criterion).join(', ')}.`;
  } else {
    overallStatus = 'POTENTIAL_MATCH';
    statusLabel = 'Potential Match';
    summaryReason = criteria.length > 0
      ? `All ${criteria.length} evaluated mandatory conditions match your reported profile.`
      : 'This open scholarship matches your general profile with no disqualifying restrictions.';
  }

  return {
    scholarshipId: scholarship._id,
    overallStatus,
    statusLabel,
    criteriaResults: criteria,
    matchedCount: metList.length,
    failedCount: failedList.length,
    missingCount: missingList.length,
    missingFields: Array.from(new Set(missingFields)),
    summaryReason,
    disclaimer: 'Official scholarship providers determine final eligibility and award decisions. Matching is based solely on your self-reported data.'
  };
}

/**
 * Evaluates a list of scholarships for a student profile
 */
function evaluateAllScholarships(scholarships, profile) {
  return scholarships.map(s => {
    const evaluation = evaluateEligibility(s, profile);
    return {
      scholarship: s,
      evaluation
    };
  });
}

module.exports = {
  evaluateEligibility,
  evaluateAllScholarships
};
