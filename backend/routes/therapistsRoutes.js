const express = require('express');
const router = express.Router();
const Therapist = require('../models/Therapist');

// @desc    Get all therapists
// @route   GET /api/therapists
router.get('/', async (req, res) => {
  try {
    const therapists = await Therapist.find();
    res.json(therapists);
  } catch (err) {
    console.error('Error fetching therapists:', err);
    res.status(500).json({ error: 'Failed to fetch therapists' });
  }
});

// @desc    Add a new therapist
// @route   POST /api/therapists
router.post('/', async (req, res) => {
  try {
    console.log('Received request to add therapist:', req.body);
    
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      specialization,
      qualifications,
      experience,
      availability,
      avatar,
      bio
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !specialization) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['firstName', 'lastName', 'email', 'specialization'] 
      });
    }

    // Check if therapist with this email already exists
    console.log('Checking if email already exists:', email);
    const existingTherapist = await Therapist.findOne({ email });
    if (existingTherapist) {
      console.log('Therapist with this email already exists');
      return res.status(400).json({ error: 'A therapist with this email already exists' });
    }

    // Create therapist object with validated data
    const therapistData = {
      firstName,
      lastName,
      email,
      specialization,
      // Optional fields
      phoneNumber: phoneNumber || '',
      qualifications: Array.isArray(qualifications) ? qualifications : [],
      experience: Number(experience) || 0,
      avatar: avatar || '',
      bio: bio || ''
    };
    
    // Only add availability if it exists
    if (availability) {
      therapistData.availability = availability;
    }

    console.log('Creating therapist with data:', therapistData);
    const therapist = new Therapist(therapistData);

    const savedTherapist = await therapist.save();
    console.log('Therapist saved successfully:', savedTherapist._id);
    res.status(201).json(savedTherapist);
  } catch (err) {
    console.error('Error saving therapist:', err);
    // Send more detailed error information
    if (err.name === 'ValidationError') {
      const validationErrors = Object.keys(err.errors).reduce((errors, key) => {
        errors[key] = err.errors[key].message;
        return errors;
      }, {});
      
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to add therapist',
      message: err.message 
    });
  }
});

// @desc    Get single therapist by ID
// @route   GET /api/therapists/:id
router.get('/:id', async (req, res) => {
  try {
    const therapist = await Therapist.findById(req.params.id);
    if (!therapist) {
      return res.status(404).json({ error: 'Therapist not found' });
    }
    res.json(therapist);
  } catch (err) {
    console.error('Error fetching therapist:', err);
    res.status(500).json({ error: 'Failed to fetch therapist' });
  }
});

// @desc    Update therapist
// @route   PUT /api/therapists/:id
router.put('/:id', async (req, res) => {
  try {
    const updatedTherapist = await Therapist.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedTherapist) {
      return res.status(404).json({ error: 'Therapist not found' });
    }
    res.json(updatedTherapist);
  } catch (err) {
    console.error('Error updating therapist:', err);
    res.status(500).json({ error: 'Failed to update therapist' });
  }
});

// @desc    Delete therapist
// @route   DELETE /api/therapists/:id
router.delete('/:id', async (req, res) => {
  try {
    const deletedTherapist = await Therapist.findByIdAndDelete(req.params.id);
    if (!deletedTherapist) {
      return res.status(404).json({ error: 'Therapist not found' });
    }
    res.json({ message: 'Therapist deleted successfully' });
  } catch (err) {
    console.error('Error deleting therapist:', err);
    res.status(500).json({ error: 'Failed to delete therapist' });
  }
});

module.exports = router;
