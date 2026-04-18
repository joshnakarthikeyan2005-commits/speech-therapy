const express = require('express');
const router = express.Router();
const Consent = require('../models/Consent');

// Submit a new consent form
router.post('/', async (req, res) => {
  try {
    const { patientId, consentType, status, signature, ipAddress, additionalNotes } = req.body;
    
    // Validate essential fields
    if (!patientId || !consentType || !signature) {
      return res.status(400).json({ message: 'Patient ID, consent type, and signature are required' });
    }
    
    const newConsent = new Consent({
      patientId,
      consentType,
      status: status || 'pending',
      signature,
      ipAddress,
      additionalNotes
    });
    
    const savedConsent = await newConsent.save();
    console.log('Consent form saved successfully:', savedConsent);
    res.status(201).json(savedConsent);
  } catch (error) {
    console.error('Error saving consent form:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get all consent forms
router.get('/', async (req, res) => {
  try {
    const consents = await Consent.find()
      .populate('patientId', 'firstName lastName')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ dateSubmitted: -1 });
    
    res.json(consents);
  } catch (error) {
    console.error('Error fetching consent forms:', error);
    res.status(500).json({ message: 'Failed to fetch consent forms' });
  }
});

// Get consent forms for a specific patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    const consents = await Consent.find({ patientId: req.params.patientId })
      .sort({ dateSubmitted: -1 });
    
    res.json(consents);
  } catch (error) {
    console.error('Error fetching patient consent forms:', error);
    res.status(500).json({ message: 'Failed to fetch patient consent forms' });
  }
});

// Update a consent form status (approve/decline)
router.patch('/:id', async (req, res) => {
  try {
    const { status, reviewedBy } = req.body;
    
    if (!status || !['approved', 'declined', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Valid status (approved, declined, or pending) is required' });
    }
    
    const updatedConsent = await Consent.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        reviewedBy,
        dateReviewed: new Date()
      },
      { new: true }
    );
    
    if (!updatedConsent) {
      return res.status(404).json({ message: 'Consent form not found' });
    }
    
    res.json(updatedConsent);
  } catch (error) {
    console.error('Error updating consent form:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a consent form
router.delete('/:id', async (req, res) => {
  try {
    const deletedConsent = await Consent.findByIdAndDelete(req.params.id);
    
    if (!deletedConsent) {
      return res.status(404).json({ message: 'Consent form not found' });
    }
    
    res.json({ message: 'Consent form deleted successfully' });
  } catch (error) {
    console.error('Error deleting consent form:', error);
    res.status(500).json({ message: 'Failed to delete consent form' });
  }
});

module.exports = router;
