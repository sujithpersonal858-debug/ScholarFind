const mongoose = require('mongoose');

const ApplicationTrackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scholarshipId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scholarship',
    required: true
  },
  status: {
    type: String,
    enum: ['Not Applied', 'Applied', 'Awaiting Result', 'Completed'],
    default: 'Applied'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

ApplicationTrackSchema.index({ userId: 1, scholarshipId: 1 }, { unique: true });

module.exports = mongoose.model('ApplicationTrack', ApplicationTrackSchema);
