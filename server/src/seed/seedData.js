const bcrypt = require('bcryptjs');
const repository = require('../config/repository');
const { connectDB } = require('../config/db');
const { SCHOLARSHIPS_CATALOGUE } = require('./scholarshipsData');
const SEED_SCHOLARSHIPS = [
  {
    name: 'Central Sector Scheme of Scholarship for College and University Students (CSSS)',
    provider: 'Department of Higher Education, Ministry of Education, Government of India',
    scholarshipType: 'Government (Central)',
    description: 'Provides financial assistance to meritorious students from low-income families to meet part of their day-to-day expenses while pursuing higher studies in college and university.',
    eligibleCourses: ['All', 'B.Tech / B.E.', 'B.Sc', 'B.Com', 'B.A.', 'MBBS'],
    qualificationLevels: ['Undergraduate', 'Postgraduate'],
    eligibleStates: ['All'],
    minMarksPercentage: 80,
    maxAnnualIncome: 450000,
    applicableCategories: ['All'],
    eligibleGenders: ['All'],
    requiresDisability: false,
    minDisabilityPercentage: 0,
    benefits: '₹12,000 per annum for the first 3 years of undergraduate study; ₹20,000 per annum for postgraduate study.',
    amount: 12000,
    requiredDocuments: [
      'Class 12th Board Marksheet',
      'Income Certificate issued by competent revenue authority',
      'Aadhaar Card / Proof of Identity',
      'Bank Account Passbook seeded with Aadhaar',
      'College Admission Bonafide Certificate'
    ],
    openingDate: new Date('2026-07-01'),
    applicationDeadline: new Date('2026-11-30'),
    officialNotificationUrl: 'https://www.education.gov.in/sites/upload_files/mhrd/files/Scheme_College_University_Students.pdf',
    officialApplicationUrl: 'https://scholarships.gov.in',
    status: 'active',
    lastVerifiedDate: new Date(),
    verifiedByAdmin: true
  },
  {
    name: 'AICTE Pragati Scholarship Scheme for Girl Students',
    provider: 'All India Council for Technical Education (AICTE), Ministry of Education',
    scholarshipType: 'Government (Central)',
    description: 'Empowers young women by providing financial support to pursue technical education in AICTE-approved degree or diploma institutions across India.',
    eligibleCourses: ['B.Tech / B.E.', 'Diploma in Engineering', 'B.Pharm', 'B.Arch'],
    qualificationLevels: ['Undergraduate', 'Diploma'],
    eligibleStates: ['All'],
    minMarksPercentage: 60,
    maxAnnualIncome: 800000,
    applicableCategories: ['All'],
    eligibleGenders: ['Female'],
    requiresDisability: false,
    minDisabilityPercentage: 0,
    benefits: '₹50,000 per annum for every year of study towards college tuition fees, computer purchase, books and stationery.',
    amount: 50000,
    requiredDocuments: [
      'Class 10th and 12th Marksheets',
      'AICTE Approved College Admission Letter',
      'Family Income Certificate (< ₹8 Lakh/year)',
      'Bank Passbook in Student’s Name',
      'Aadhaar Card'
    ],
    openingDate: new Date('2026-08-01'),
    applicationDeadline: new Date('2026-12-15'),
    officialNotificationUrl: 'https://www.aicte-india.org/schemes/students-development-schemes/Pragati',
    officialApplicationUrl: 'https://scholarships.gov.in',
    status: 'active',
    lastVerifiedDate: new Date(),
    verifiedByAdmin: true
  },
  {
    name: 'Post-Matric Scholarship for Students Belonging to SC/ST Communities',
    provider: 'Ministry of Social Justice & Empowerment / Ministry of Tribal Affairs',
    scholarshipType: 'Government (Central)',
    description: 'Centrally sponsored scheme to reduce dropout rates and support Scheduled Caste (SC) and Scheduled Tribe (ST) students studying at post-matriculation or post-secondary stages.',
    eligibleCourses: ['All'],
    qualificationLevels: ['Higher Secondary', 'Diploma', 'Undergraduate', 'Postgraduate', 'Doctoral'],
    eligibleStates: ['All'],
    minMarksPercentage: 50,
    maxAnnualIncome: 250000,
    applicableCategories: ['SC', 'ST'],
    eligibleGenders: ['All'],
    requiresDisability: false,
    minDisabilityPercentage: 0,
    benefits: 'Complete tuition and compulsory non-refundable fees reimbursement plus monthly maintenance allowance.',
    amount: 15000,
    requiredDocuments: [
      'Caste Certificate issued by authorized revenue officer',
      'Annual Income Certificate (< ₹2.5 Lakh)',
      'Previous Examination Marksheet',
      'College Fee Receipt',
      'Aadhaar Card'
    ],
    openingDate: new Date('2026-06-15'),
    applicationDeadline: new Date('2026-12-31'),
    officialNotificationUrl: 'https://socialjustice.gov.in/schemes/post-matric-scholarship-for-sc-students',
    officialApplicationUrl: 'https://scholarships.gov.in',
    status: 'active',
    lastVerifiedDate: new Date(),
    verifiedByAdmin: true
  },
  {
    name: 'Prime Minister’s Scholarship Scheme (PMSS) for CAPFs & Assam Rifles',
    provider: 'Welfare & Rehabilitation Board (WARB), Ministry of Home Affairs',
    scholarshipType: 'Government (Central)',
    description: 'Encourages higher technical and professional education for dependent wards and widows of Central Armed Police Forces (CRPF, BSF, CISF, ITBP, SSB) & Assam Rifles.',
    eligibleCourses: ['B.Tech / B.E.', 'MBBS', 'BDS', 'BCA', 'BBA', 'B.Pharm'],
    qualificationLevels: ['Undergraduate'],
    eligibleStates: ['All'],
    minMarksPercentage: 60,
    maxAnnualIncome: 0, // No income cap for wards of CAPF martyrs/personnel
    applicableCategories: ['All'],
    eligibleGenders: ['All'],
    requiresDisability: false,
    minDisabilityPercentage: 0,
    benefits: '₹3,000 per month for female students (₹36,000/year) and ₹2,500 per month for male students (₹30,000/year).',
    amount: 36000,
    requiredDocuments: [
      'Service Certificate / PPO / Discharge Book of parent',
      'Class 12th / Diploma Marksheet (min 60%)',
      'Bonafide Certificate from College Head',
      'Bank Account Details',
      'Aadhaar Card'
    ],
    openingDate: new Date('2026-07-15'),
    applicationDeadline: new Date('2026-11-15'),
    officialNotificationUrl: 'https://warb-mha.gov.in/schemes.html',
    officialApplicationUrl: 'https://scholarships.gov.in',
    status: 'active',
    lastVerifiedDate: new Date(),
    verifiedByAdmin: true
  },
  {
    name: 'Kotak Kanya Scholarship for Professional Higher Education',
    provider: 'Kotak Education Foundation (CSR Initiative)',
    scholarshipType: 'Corporate / Private',
    description: 'Provides substantial financial aid and academic mentorship to meritorious girl students from economically disadvantaged families to pursue professional undergraduate degrees.',
    eligibleCourses: ['B.Tech / B.E.', 'MBBS', 'Integrated LLB', 'B.Arch', 'Design'],
    qualificationLevels: ['Undergraduate'],
    eligibleStates: ['All'],
    minMarksPercentage: 75,
    maxAnnualIncome: 600000,
    applicableCategories: ['All'],
    eligibleGenders: ['Female'],
    requiresDisability: false,
    minDisabilityPercentage: 0,
    benefits: 'Up to ₹1,50,000 per academic year towards academic fees, hostel fees, books and learning materials until degree completion.',
    amount: 150000,
    requiredDocuments: [
      'Class 12th Marksheet (≥ 75%)',
      'College Admission Letter / Entrance Exam Rank Card',
      'Income Certificate / ITR / Salary Slips (< ₹6 Lakh/year)',
      'Aadhaar Card of student and parent',
      'Passport size photograph'
    ],
    openingDate: new Date('2026-06-01'),
    applicationDeadline: new Date('2026-10-31'),
    officialNotificationUrl: 'https://kotakeducation.org/kotak-kanya-scholarship/',
    officialApplicationUrl: 'https://www.buddy4study.com/page/kotak-kanya-scholarship',
    status: 'active',
    lastVerifiedDate: new Date(),
    verifiedByAdmin: true
  },
  {
    name: 'Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti Yojna (EBC)',
    provider: 'Directorate of Higher Education, Government of Maharashtra',
    scholarshipType: 'Government (State)',
    description: 'Financial assistance scheme by Government of Maharashtra offering 50% tuition and examination fee concession for economically weaker section students admitted through CAP rounds.',
    eligibleCourses: ['All', 'B.Tech / B.E.', 'B.Sc', 'B.Com', 'MBBS', 'Diploma'],
    qualificationLevels: ['Diploma', 'Undergraduate', 'Postgraduate'],
    eligibleStates: ['Maharashtra'],
    minMarksPercentage: 50,
    maxAnnualIncome: 800000,
    applicableCategories: ['General', 'EWS'],
    eligibleGenders: ['All'],
    requiresDisability: false,
    minDisabilityPercentage: 0,
    benefits: '50% reimbursement of tuition fees and examination fees in government-approved private un-aided and aided colleges.',
    amount: 25000,
    requiredDocuments: [
      'Maharashtra Domicile Certificate',
      'Tahshildar-issued Income Certificate (< ₹8 Lakh)',
      'CAP Allotment Letter',
      'Previous Year Marksheet',
      'Ration Card / Family Declaration'
    ],
    openingDate: new Date('2026-08-10'),
    applicationDeadline: new Date('2027-01-31'),
    officialNotificationUrl: 'https://mahadbt.maharashtra.gov.in',
    officialApplicationUrl: 'https://mahadbt.maharashtra.gov.in',
    status: 'active',
    lastVerifiedDate: new Date(),
    verifiedByAdmin: true
  }
];

async function seedDatabase() {
  console.log('Seeding ScholarFind database...');
  await connectDB();

  // 1. Seed Admin User
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@scholarfind.com').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@1234';
  const adminName = process.env.ADMIN_NAME || 'ScholarFind Administrator';

  const existingAdmin = await repository.users.findByEmail(adminEmail);
  if (!existingAdmin) {
    const adminSalt = await bcrypt.genSalt(10);
    const hashedAdminPassword = await bcrypt.hash(adminPassword, adminSalt);
    await repository.users.create({
      name: adminName,
      email: adminEmail,
      password: hashedAdminPassword,
      role: 'admin'
    });
    console.log(`Created default Admin user: ${adminEmail}`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }

  // 2. Seed Sample Student User
  const existingStudent = await repository.users.findByEmail('student@scholarfind.com');
  let studentUser;
  if (!existingStudent) {
    const studentSalt = await bcrypt.genSalt(10);
    const hashedStudentPassword = await bcrypt.hash('Student@1234', studentSalt);
    studentUser = await repository.users.create({
      name: 'Aarav Sharma',
      email: 'student@scholarfind.com',
      password: hashedStudentPassword,
      role: 'student'
    });
    console.log('Created sample Student user: student@scholarfind.com (Password: Student@1234)');

    // Seed student profile
    await repository.profiles.upsert(studentUser._id, {
      fullName: 'Aarav Sharma',
      state: 'Maharashtra',
      course: 'B.Tech / B.E.',
      qualificationLevel: 'Undergraduate',
      currentYear: '2nd Year',
      institutionType: 'Government',
      marksPercentage: 84,
      annualIncome: 350000,
      category: 'General',
      gender: 'Male',
      hasDisability: false,
      disabilityPercentage: 0,
      isFirstGenerationLearner: false
    });
    console.log('Created matching profile for sample student (B.Tech, 84%, ₹3.5 Lakh, Maharashtra).');
  }

  // 3. Seed Scholarships
  const existingCount = await repository.scholarships.count();

  if (existingCount === 0) {
    const allScholarships = [
      ...SEED_SCHOLARSHIPS,
      ...SCHOLARSHIPS_CATALOGUE
    ];

    const uniqueScholarships = [
      ...new Map(
        allScholarships.map(s => [
          `${(s.name || '').trim().toLowerCase()}|${(s.provider || '').trim().toLowerCase()}`,
          s
        ])
      ).values()
    ];

    let insertedCount = 0;

    for (const scholarship of uniqueScholarships) {
      await repository.scholarships.create({
        ...scholarship,
        verifiedByAdmin: false
      });
      insertedCount++;
    }

    console.log(`Seeded ${insertedCount} scholarship records.`);
  } else {
    console.log(
      `Database already has ${existingCount} scholarship records.`
    );
    console.log('Existing records were not modified.');

  console.log('Database seeding process completed successfully.\n');
}

// Execute if run directly via command line
if (require.main === module) {
  seedDatabase().then(() => process.exit(0)).catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
}

module.exports = {
  seedDatabase,
  SEED_SCHOLARSHIPS
};
