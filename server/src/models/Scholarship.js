const mongoose = require('mongoose');

const ScholarshipSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Scholarship name is required'],
    trim: true
  },
  provider: {
    type: String,
    required: [true, 'Sponsoring organization / provider is required'],
    trim: true
  },
  scholarshipType: {
    type: String,
    enum: ['Government (Central)', 'Government (State)', 'Corporate / Private', 'Institutional'],
    default: 'Government (Central)'
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  eligibleCourses: {
    type: [String],
    default: ['All']
  },
  qualificationLevels: {
    type: [String],
    default: ['All']
  },
  eligibleStates: {
    type: [String],
    default: ['All']
  },
  minMarksPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  maxAnnualIncome: {
    type: Number,
    min: 0,
    default: 0 // 0 means no income limit specified
  },
  applicableCategories: {
    type: [String],
    default: ['All']
  },
  eligibleGenders: {
    type: [String],
    default: ['All']
  },
  requiresDisability: {
    type: Boolean,
    default: false
  },
  minDisabilityPercentage: {
    type: Number,
    default: 0
  },
  benefits: {
    type: String,
    required: [true, 'Benefits description is required'],
    trim: true
  },
  amount: {
    type: Number,
    default: 0
  },
  requiredDocuments: {
    type: [String],
    default: []
  },
  openingDate: {
    type: Date,
    default: null
  },
  applicationDeadline: {
    type: Date,
    required: [true, 'Application deadline is required']
  },
  officialNotificationUrl: {
    type: String,
    trim: true,
    default: ''
  },
  officialApplicationUrl: {
    type: String,
    required: [true, 'Official application URL is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'unavailable'],
    default: 'active'
  },
  lastVerifiedDate: {
    type: Date,
    default: Date.now
  },
  verifiedByAdmin: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Scholarship', ScholarshipSchema);
