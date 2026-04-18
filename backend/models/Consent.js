const mongoose = require('mongoose');

const consentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  consentType: {
    type: String,
    required: true,
    enum: ['treatment-consent', 'data-sharing', 'recording-consent', 'research-participation']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'declined'],
    default: 'pending'
  },
  dateSubmitted: {
    type: Date,
    default: Date.now
  },
  dateReviewed: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  signature: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String
  },
  additionalNotes: {
    type: String
  }
});

module.exports = mongoose.model('Consent', consentSchema);
