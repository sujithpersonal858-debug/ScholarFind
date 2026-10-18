const mongoose = require('mongoose');

const SavedScholarshipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scholarshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scholarship',
    required: true
  }
}, {
  timestamps: true
});

// Ensure a user can only save a scholarship once
SavedScholarshipSchema.index({ userId: 1, scholarshipId: 1 }, { unique: true });

module.exports = mongoose.model('SavedScholarship', SavedScholarshipSchema);
