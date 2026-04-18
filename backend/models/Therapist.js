const mongoose = require('mongoose');

const TherapistSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: true 
  },
  lastName: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  phoneNumber: { 
    type: String 
  },
  specialization: { 
    type: String, 
    required: true 
  },
  qualifications: [{ 
    type: String 
  }],
  experience: { 
    type: Number 
  },
  availability: {
    type: {
      monday: [{ start: String, end: String }],
      tuesday: [{ start: String, end: String }],
      wednesday: [{ start: String, end: String }],
      thursday: [{ start: String, end: String }],
      friday: [{ start: String, end: String }],
      saturday: [{ start: String, end: String }],
      sunday: [{ start: String, end: String }]
    },
    required: false,
    default: {}
  },
  avatar: { 
    type: String 
  },
  bio: { 
    type: String 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Therapist', TherapistSchema);
