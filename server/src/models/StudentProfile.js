const mongoose = require('mongoose');

const StudentProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  state: {
    type: String,
    trim: true,
    default: ''
  },
  course: {
    type: String,
    trim: true,
    default: ''
  },
  qualificationLevel: {
    type: String,
    enum: ['', 'Higher Secondary', 'Diploma', 'Undergraduate', 'Postgraduate', 'Doctoral'],
    default: ''
  },
  currentYear: {
    type: String,
    enum: ['', '1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'],
    default: ''
  },
  institutionType: {
    type: String,
    enum: ['', 'Government', 'Government Aided', 'Private / Self-Financed', 'Central University / Institute'],
    default: ''
  },
  marksPercentage: {
    type: Number,
    min: [0, 'Marks cannot be less than 0'],
    max: [100, 'Marks cannot exceed 100'],
    default: null
  },
  annualIncome: {
    type: Number,
    min: [0, 'Income cannot be negative'],
    default: null
  },
  category: {
    type: String,
    enum: ['', 'General', 'OBC', 'SC', 'ST', 'EWS', 'Minority'],
    default: ''
  },
  gender: {
    type: String,
    enum: ['', 'Any', 'Male', 'Female', 'Transgender'],
    default: ''
  },
  hasDisability: {
    type: Boolean,
    default: false
  },
  disabilityPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  isFirstGenerationLearner: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Helper virtual to calculate profile completion percentage
StudentProfileSchema.methods.calculateCompletion = function() {
  const fields = [
    this.fullName,
    this.state,
    this.course,
    this.qualificationLevel,
    this.currentYear,
    this.institutionType,
    this.marksPercentage !== null && this.marksPercentage !== undefined,
    this.annualIncome !== null && this.annualIncome !== undefined,
    this.category,
    this.gender
  ];
  const filled = fields.filter(f => Boolean(f)).length;
  return Math.round((filled / fields.length) * 100);
};

module.exports = mongoose.model('StudentProfile', StudentProfileSchema);
