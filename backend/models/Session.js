const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  duration: {
    type: Number,
    required: true
  },
  materials: {
    type: [String]
  },
  completed: {
    type: Boolean,
    default: false
  },
  patientResponse: {
    type: String,
    enum: ['excellent', 'good', 'needs-improvement', 'difficulty'],
    default: 'good'
  },
  notes: {
    type: String
  }
});

const sessionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Therapist',
    required: true
  },
  scheduledAt: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    default: 60
  },
  type: {
    type: String,
    enum: ['assessment', 'therapy', 'consultation', 'review'],
    default: 'therapy'
  },
  location: {
    type: String,
    enum: ['in-person', 'telehealth'],
    default: 'in-person'
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  notes: {
    type: String
  },
  goals: {
    type: [String],
    default: []
  },
  activities: {
    type: [activitySchema],
    default: []
  },
  supervisorApproval: {
    type: String,
    enum: ['pending', 'approved', 'revision-requested'],
    default: 'pending'
  },
  supervisorNotes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Session', sessionSchema);
