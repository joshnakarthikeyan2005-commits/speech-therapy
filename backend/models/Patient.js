const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  dateOfBirth: { type: Date, required: true },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  medicalHistory: [{ type: String }],
  consentStatus: {
    type: String,
    enum: ['pending', 'approved', 'declined'],
    default: 'pending'
  },
  avatar: String
});

module.exports = mongoose.model('Patient', PatientSchema);
