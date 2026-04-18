const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

// @desc    Get all patients
// @route   GET /api/patients
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// @desc    Add a new patient
// @route   POST /api/patients
router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      dateOfBirth,
      emergencyContact,
      medicalHistory,
      consentStatus,
      avatar
    } = req.body;

    const patient = new Patient({
      firstName,
      lastName,
      email,
      dateOfBirth,
      emergencyContact,
      medicalHistory,
      consentStatus,
      avatar
    });

    const savedPatient = await patient.save();
    res.status(201).json(savedPatient);
  } catch (err) {
    console.error('Error saving patient:', err);
    res.status(500).json({ error: 'Failed to add patient' });
  }
});

// @desc    Get single patient by ID
// @route   GET /api/patients/:id
router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// @desc    Update patient
// @route   PUT /api/patients/:id
router.put('/:id', async (req, res) => {
  try {
    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedPatient);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

// @desc    Delete patient
// @route   DELETE /api/patients/:id
router.delete('/:id', async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: 'Patient deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});

module.exports = router;
