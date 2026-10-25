/**
 * Synthetic Dataset Generator for ScholarFind ML Module
 *
 * Simulates reproducible student-scholarship interactions based on realistic
 * demographic and academic distributions across Indian scholarship schemes.
 *
 * ACADEMIC INTEGRITY NOTICE:
 * This dataset is created exclusively for demonstration, benchmarking, and machine
 * learning pipeline validation in an educational context. It does not represent
 * confidential or verified historical student scholarship awards.
 */

const fs = require('fs');
const path = require('path');

// Simple deterministic Mulberry32 Pseudo-Random Number Generator (seed = 42)
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(42);

// Representative scholarship definitions drawn from real ScholarFind catalogue
const SCHOLARSHIPS = [
  {
    id: 'SCH_01',
    name: 'NSP Central Sector Scheme (PM-USP)',
    minMarks: 80,
    maxIncome: 450000,
    qualifications: ['Undergraduate', 'Postgraduate'],
    courses: ['All'],
    states: ['All'],
    categories: ['All'],
    genders: ['All'],
    requiresDisability: false,
    weightMerit: 0.40,
    weightNeed: 0.30
  },
  {
    id: 'SCH_02',
    name: 'Post-Matric Scholarship for SC Students (NSP)',
    minMarks: 50,
    maxIncome: 250000,
    qualifications: ['Higher Secondary', 'Diploma', 'Undergraduate', 'Postgraduate', 'Doctoral'],
    courses: ['All'],
    states: ['All'],
    categories: ['SC'],
    genders: ['All'],
    requiresDisability: false,
    weightMerit: 0.20,
    weightNeed: 0.40
  },
  {
    id: 'SCH_03',
    name: 'Post-Matric Scholarship for ST Students (NSP)',
    minMarks: 50,
    maxIncome: 250000,
    qualifications: ['Higher Secondary', 'Diploma', 'Undergraduate', 'Postgraduate', 'Doctoral'],
    courses: ['All'],
    states: ['All'],
    categories: ['ST'],
    genders: ['All'],
    requiresDisability: false,
    weightMerit: 0.20,
    weightNeed: 0.40
  },
  {
    id: 'SCH_04',
    name: 'Post-Matric Scholarship for Minorities (MoMA)',
    minMarks: 50,
    maxIncome: 200000,
    qualifications: ['Higher Secondary', 'Diploma', 'Undergraduate', 'Postgraduate'],
    courses: ['All'],
    states: ['All'],
    categories: ['Minority'],
    genders: ['All'],
    requiresDisability: false,
    weightMerit: 0.25,
    weightNeed: 0.35
  },
  {
    id: 'SCH_05',
    name: 'AICTE Pragati Scholarship for Girls',
    minMarks: 60,
    maxIncome: 800000,
    qualifications: ['Undergraduate', 'Diploma'],
    courses: ['B.Tech / B.E.', 'Diploma in Engineering', 'B.Pharm', 'MCA'],
    states: ['All'],
    categories: ['All'],
    genders: ['Female'],
    requiresDisability: false,
    weightMerit: 0.30,
    weightNeed: 0.30
  },
  {
    id: 'SCH_06',
    name: 'AICTE Saksham Scholarship for Specially-Abled',
    minMarks: 50,
    maxIncome: 800000,
    qualifications: ['Undergraduate', 'Diploma'],
    courses: ['B.Tech / B.E.', 'Diploma in Engineering', 'MCA'],
    states: ['All'],
    categories: ['All'],
    genders: ['All'],
    requiresDisability: true,
    minDisabilityPct: 40,
    weightMerit: 0.25,
    weightNeed: 0.25
  },
  {
    id: 'SCH_07',
    name: 'Reliance Foundation Undergraduate Scholarship',
    minMarks: 60,
    maxIncome: 1500000,
    qualifications: ['Undergraduate'],
    courses: ['All'],
    states: ['All'],
    categories: ['All'],
    genders: ['All'],
    requiresDisability: false,
    weightMerit: 0.45,
    weightNeed: 0.25
  },
  {
    id: 'SCH_08',
    name: 'HDFC Bank Parivartan ECSS Scholarship',
    minMarks: 55,
    maxIncome: 600000,
    qualifications: ['Higher Secondary', 'Diploma', 'Undergraduate', 'Postgraduate'],
    courses: ['All'],
    states: ['All'],
    categories: ['All'],
    genders: ['All'],
    requiresDisability: false,
    weightMerit: 0.25,
    weightNeed: 0.45
  },
  {
    id: 'SCH_09',
    name: 'Karnataka State SSP Post-Matric Scholarship',
    minMarks: 50,
    maxIncome: 250000,
    qualifications: ['Diploma', 'Undergraduate', 'Postgraduate'],
    courses: ['All'],
    states: ['Karnataka'],
    categories: ['SC', 'ST', 'OBC', 'EWS'],
    genders: ['All'],
    requiresDisability: false,
    weightMerit: 0.20,
    weightNeed: 0.40
  },
  {
    id: 'SCH_10',
    name: 'Maharashtra MahaDBT Rajarshi Shahu Maharaj Scheme',
    minMarks: 50,
    maxIncome: 800000,
    qualifications: ['Undergraduate', 'Postgraduate'],
    courses: ['B.Tech / B.E.', 'MBBS', 'B.Sc', 'B.Com', 'B.Pharm', 'MBA'],
    states: ['Maharashtra'],
    categories: ['General', 'OBC', 'EWS'],
    genders: ['All'],
    requiresDisability: false,
    weightMerit: 0.25,
    weightNeed: 0.35
  },
  {
    id: 'SCH_11',
    name: 'Tamil Nadu First Graduate Tuition Concession',
    minMarks: 50,
    maxIncome: 0, // No income cap
    qualifications: ['Undergraduate'],
    courses: ['B.Tech / B.E.', 'MBBS', 'B.Pharm'],
    states: ['Tamil Nadu'],
    categories: ['All'],
    genders: ['All'],
    requiresDisability: false,
    requiresFirstGen: true,
    weightMerit: 0.30,
    weightNeed: 0.20
  },
  {
    id: 'SCH_12',
    name: 'Uttar Pradesh Dashmottar Scholarship Scheme',
    minMarks: 50,
    maxIncome: 200000,
    qualifications: ['Higher Secondary', 'Diploma', 'Undergraduate', 'Postgraduate'],
    courses: ['All'],
    states: ['Uttar Pradesh'],
    categories: ['General', 'OBC', 'SC', 'ST', 'Minority'],
    genders: ['All'],
    requiresDisability: false,
    weightMerit: 0.20,
    weightNeed: 0.40
  },
  {
    id: 'SCH_13',
    name: 'Tata Capital Pankh Scholarship for Professional Courses',
    minMarks: 60,
    maxIncome: 400000,
    qualifications: ['Undergraduate', 'Diploma'],
    courses: ['B.Tech / B.E.', 'MBBS', 'B.Sc Nursing', 'B.Pharm', 'Diploma in Engineering'],
    states: ['All'],
    categories: ['All'],
    genders: ['All'],
    requiresDisability: false,
    weightMerit: 0.35,
    weightNeed: 0.35
  },
  {
    id: 'SCH_14',
    name: 'Sitaram Jindal Foundation Scholarship',
    minMarks: 65,
    maxIncome: 400000,
    qualifications: ['Higher Secondary', 'Diploma', 'Undergraduate', 'Postgraduate'],
    courses: ['All'],
    states: ['All'],
    categories: ['All'],
    genders: ['All'],
    requiresDisability: false,
    weightMerit: 0.35,
    weightNeed: 0.30
  },
  {
    id: 'SCH_15',
    name: 'Adobe India Women-in-Technology Scholarship',
    minMarks: 70,
    maxIncome: 0,
    qualifications: ['Undergraduate', 'Postgraduate'],
    courses: ['B.Tech / B.E.', 'MCA', 'M.Tech'],
    states: ['All'],
    categories: ['All'],
    genders: ['Female'],
    requiresDisability: false,
    weightMerit: 0.55,
    weightNeed: 0.10
  },
  {
    id: 'SCH_16',
    name: 'Kerala State Higher Education Council Merit Scholarship',
    minMarks: 65,
    maxIncome: 500000,
    qualifications: ['Undergraduate', 'Postgraduate'],
    courses: ['B.Sc', 'B.A.', 'B.Com', 'M.Sc', 'M.A.'],
    states: ['Kerala'],
    categories: ['All'],
    genders: ['All'],
    requiresDisability: false,
    weightMerit: 0.40,
    weightNeed: 0.25
  },
  {
    id: 'SCH_17',
    name: 'ONGC Foundation Scholarship for SC/ST/OBC Students',
    minMarks: 60,
    maxIncome: 450000,
    qualifications: ['Undergraduate', 'Postgraduate'],
    courses: ['B.Tech / B.E.', 'MBBS', 'MBA', 'M.Sc'],
    states: ['All'],
    categories: ['SC', 'ST', 'OBC'],
    genders: ['All'],
    requiresDisability: false,
    weightMerit: 0.35,
    weightNeed: 0.35
  },
  {
    id: 'SCH_18',
    name: 'West Bengal Swami Vivekananda Merit-cum-Means (SVMCM)',
    minMarks: 60,
    maxIncome: 250000,
    qualifications: ['Higher Secondary', 'Diploma', 'Undergraduate', 'Postgraduate', 'Doctoral'],
    courses: ['All'],
    states: ['West Bengal'],
    categories: ['All'],
    genders: ['All'],
    requiresDisability: false,
    weightMerit: 0.30,
    weightNeed: 0.40
  },
  {
    id: 'SCH_19',
    name: 'Kotak Kanya Scholarship for Girl Students',
    minMarks: 75,
    maxIncome: 600000,
    qualifications: ['Undergraduate'],
    courses: ['B.Tech / B.E.', 'MBBS', 'B.Sc Nursing', 'B.Pharm', 'B.Des'],
    states: ['All'],
    categories: ['All'],
    genders: ['Female'],
    requiresDisability: false,
    weightMerit: 0.40,
    weightNeed: 0.30
  },
  {
    id: 'SCH_20',
    name: 'National Fellowship for OBC Students (UGC/NF-OBC)',
    minMarks: 55,
    maxIncome: 800000,
    qualifications: ['Doctoral'],
    courses: ['Ph.D.'],
    states: ['All'],
    categories: ['OBC'],
    genders: ['All'],
    requiresDisability: false,
    weightMerit: 0.45,
    weightNeed: 0.20
  }
];

const STATES = ['Karnataka', 'Maharashtra', 'Tamil Nadu', 'Uttar Pradesh', 'Kerala', 'Telangana', 'West Bengal', 'Delhi', 'Gujarat', 'Bihar', 'Rajasthan', 'Punjab'];
const COURSES = ['B.Tech / B.E.', 'B.Sc', 'B.Com', 'B.A.', 'MBBS', 'Diploma in Engineering', 'B.Pharm', 'MBA', 'MCA', 'Ph.D.'];
const QUALIFICATIONS = ['Higher Secondary', 'Diploma', 'Undergraduate', 'Postgraduate', 'Doctoral'];
const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS', 'Minority'];
const GENDERS = ['Male', 'Female'];

function getRandomElement(arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function generateStudents(numStudents = 250) {
  const students = [];
  for (let i = 1; i <= numStudents; i++) {
    const studentId = `STU_${String(i).padStart(4, '0')}`;
    const qual = getRandomElement(QUALIFICATIONS);
    let course;
    if (qual === 'Higher Secondary') course = 'General Sciences / Arts';
    else if (qual === 'Diploma') course = 'Diploma in Engineering';
    else if (qual === 'Doctoral') course = 'Ph.D.';
    else course = getRandomElement(['B.Tech / B.E.', 'B.Sc', 'B.Com', 'B.A.', 'MBBS', 'B.Pharm', 'MBA', 'MCA']);

    // Marks roughly normal around 70, clamped 45 to 98
    const u1 = rng(), u2 = rng();
    const z0 = Math.sqrt(-2.0 * Math.log(u1 || 0.0001)) * Math.cos(2.0 * Math.PI * u2);
    const marks = Math.min(98, Math.max(45, Math.round(71 + z0 * 12)));

    // Income tiers: EWS/low income, middle income, upper middle
    const incomeRoll = rng();
    let income;
    if (incomeRoll < 0.35) {
      income = Math.round(50000 + rng() * 150000); // 50k - 200k
    } else if (incomeRoll < 0.70) {
      income = Math.round(200000 + rng() * 300000); // 200k - 500k
    } else if (incomeRoll < 0.90) {
      income = Math.round(500000 + rng() * 400000); // 500k - 900k
    } else {
      income = Math.round(900000 + rng() * 800000); // 900k - 1.7M
    }

    const state = getRandomElement(STATES);
    const category = getRandomElement(CATEGORIES);
    const gender = getRandomElement(GENDERS);
    const hasDisability = rng() < 0.06;
    const disabilityPct = hasDisability ? Math.round(40 + rng() * 45) : 0;
    const isFirstGen = rng() < 0.30;

    students.push({
      studentId,
      state,
      course,
      qualificationLevel: qual,
      marksPercentage: marks,
      annualIncome: income,
      category,
      gender,
      hasDisability,
      disabilityPercentage: disabilityPct,
      isFirstGenerationLearner: isFirstGen
    });
  }
  return students;
}

function evaluateInteraction(student, scholarship) {
  // 1. Course Match
  const courseMatch = scholarship.courses.includes('All') ||
    scholarship.courses.some(c => c.toLowerCase() === student.course.toLowerCase() || student.course.toLowerCase().includes(c.toLowerCase())) ? 1 : 0;

  // 2. Qualification Match
  const qualMatch = scholarship.qualifications.includes('All') ||
    scholarship.qualifications.some(q => q.toLowerCase() === student.qualificationLevel.toLowerCase()) ? 1 : 0;

  // 3. State Match
  const stateMatch = scholarship.states.includes('All') ||
    scholarship.states.some(s => s.toLowerCase() === student.state.toLowerCase()) ? 1 : 0;

  // 4. Category Match
  const catMatch = scholarship.categories.includes('All') ||
    scholarship.categories.includes(student.category) ? 1 : 0;

  // 5. Gender Match
  const genderMatch = scholarship.genders.includes('All') ||
    scholarship.genders.includes(student.gender) ? 1 : 0;

  // 6. Disability Match
  let disMatch = 1;
  if (scholarship.requiresDisability) {
    disMatch = (student.hasDisability && student.disabilityPercentage >= (scholarship.minDisabilityPct || 40)) ? 1 : 0;
  }

  // 7. Marks margin
  const marksMargin = student.marksPercentage - scholarship.minMarks;

  // 8. Income headroom ratio
  let incomeHeadroom = 1.0;
  if (scholarship.maxIncome > 0) {
    incomeHeadroom = (scholarship.maxIncome - student.annualIncome) / scholarship.maxIncome;
  }

  // Hard criteria check (all mandatory conditions must hold)
  const hardPassed = (
    courseMatch === 1 &&
    qualMatch === 1 &&
    stateMatch === 1 &&
    catMatch === 1 &&
    genderMatch === 1 &&
    disMatch === 1 &&
    marksMargin >= 0 &&
    incomeHeadroom >= 0
  ) ? 1 : 0;

  // First generation requirement check (e.g. TN First Graduate)
  if (scholarship.requiresFirstGen && !student.isFirstGenerationLearner) {
    // Fails hard requirement
  }

  // TARGET LABEL GENERATION:
  // If hard requirements fail, candidate can NEVER be recommended (strict 0).
  let targetMatch = 0;
  let compositeScore = 0.0;

  if (hardPassed === 1 && (!scholarship.requiresFirstGen || student.isFirstGenerationLearner)) {
    // Base fit score for qualified candidate
    compositeScore = 0.35;

    // Academic merit boost (up to +0.30)
    const meritNormalized = Math.min(1.0, Math.max(0.0, marksMargin / 25.0));
    compositeScore += meritNormalized * (scholarship.weightMerit || 0.30);

    // Economic need boost (lower income = higher priority, up to +0.25)
    const needNormalized = Math.min(1.0, Math.max(0.0, incomeHeadroom));
    compositeScore += needNormalized * (scholarship.weightNeed || 0.25);

    // Affirmative action / targeted demographic synergy boost
    if (scholarship.categories.length === 1 && scholarship.categories[0] !== 'All' && scholarship.categories.includes(student.category)) {
      compositeScore += 0.12;
    }
    if (scholarship.genders.length === 1 && scholarship.genders[0] === 'Female' && student.gender === 'Female') {
      compositeScore += 0.12;
    }
    if (student.isFirstGenerationLearner) {
      compositeScore += 0.08;
    }

    // Small stochastic term simulating unobserved competitive variance (mean 0, std ~0.03)
    const noise = (rng() - 0.5) * 0.06;
    compositeScore += noise;

    // Threshold for High Fit Match vs Borderline/Low
    targetMatch = compositeScore >= 0.55 ? 1 : 0;
  }

  return {
    student_id: student.studentId,
    scholarship_id: scholarship.id,
    scholarship_name: scholarship.name,
    student_marks: student.marksPercentage,
    scholarship_min_marks: scholarship.minMarks,
    marks_margin: Number(marksMargin.toFixed(2)),
    student_income: student.annualIncome,
    scholarship_max_income: scholarship.maxIncome,
    income_headroom_ratio: Number(incomeHeadroom.toFixed(4)),
    course_match: courseMatch,
    qualification_match: qualMatch,
    state_match: stateMatch,
    category_match: catMatch,
    gender_match: genderMatch,
    disability_match: disMatch,
    is_first_generation: student.isFirstGenerationLearner ? 1 : 0,
    hard_criteria_passed: hardPassed,
    composite_fit_score: Number(compositeScore.toFixed(4)),
    target_match: targetMatch
  };
}

function generateAndSaveDataset() {
  const students = generateStudents(250);
  const rows = [];

  students.forEach(student => {
    SCHOLARSHIPS.forEach(sch => {
      // Each student evaluated against all 20 scholarships = 5,000 interactions
      // Subsample ~12 scholarships per student to yield ~3,000 interactions
      if (rng() < 0.60) {
        const row = evaluateInteraction(student, sch);
        rows.push(row);
      }
    });
  });

  console.log(`Generated ${rows.length} student-scholarship interaction records across ${students.length} synthetic students.`);

  // Write CSV
  const headers = [
    'student_id',
    'scholarship_id',
    'scholarship_name',
    'student_marks',
    'scholarship_min_marks',
    'marks_margin',
    'student_income',
    'scholarship_max_income',
    'income_headroom_ratio',
    'course_match',
    'qualification_match',
    'state_match',
    'category_match',
    'gender_match',
    'disability_match',
    'is_first_generation',
    'hard_criteria_passed',
    'composite_fit_score',
    'target_match'
  ];

  const csvContent = [
    headers.join(','),
    ...rows.map(r => [
      r.student_id,
      r.scholarship_id,
      `"${r.scholarship_name.replace(/"/g, '""')}"`,
      r.student_marks,
      r.scholarship_min_marks,
      r.marks_margin,
      r.student_income,
      r.scholarship_max_income,
      r.income_headroom_ratio,
      r.course_match,
      r.qualification_match,
      r.state_match,
      r.category_match,
      r.gender_match,
      r.disability_match,
      r.is_first_generation,
      r.hard_criteria_passed,
      r.composite_fit_score,
      r.target_match
    ].join(','))
  ].join('\n');

  const outputPath = path.join(__dirname, 'scholarship_match_dataset.csv');
  fs.writeFileSync(outputPath, csvContent, 'utf-8');
  console.log(`Dataset successfully written to: ${outputPath}`);

  // Summary statistics
  const total = rows.length;
  const matches = rows.filter(r => r.target_match === 1).length;
  const hardPassedCount = rows.filter(r => r.hard_criteria_passed === 1).length;

  console.log(`Summary Statistics:`);
  console.log(`- Total Interaction Rows: ${total}`);
  console.log(`- Hard Criteria Passed: ${hardPassedCount} (${((hardPassedCount/total)*100).toFixed(1)}%)`);
  console.log(`- High Fit Matches (target=1): ${matches} (${((matches/total)*100).toFixed(1)}%)`);
  console.log(`- Non-Matches / Ineligible (target=0): ${total - matches} (${(((total - matches)/total)*100).toFixed(1)}%)`);
}

generateAndSaveDataset();
