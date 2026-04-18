const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

// POST a new feedback
router.post('/', async (req, res) => {
  try {
    const { patientId, therapistId, sessionId, rating, comment } = req.body;
    
    // Validate essential fields
    if (!patientId || !rating) {
      return res.status(400).json({ message: 'Patient ID and rating are required' });
    }
    
    // Create feedback object with only required fields
    const feedbackData = {
      patientId,
      rating,
      comment
    };
    
    // Add optional fields if they exist
    if (therapistId) feedbackData.therapistId = therapistId;
    if (sessionId) feedbackData.sessionId = sessionId;
    
    const newFeedback = new Feedback(feedbackData);
    const savedFeedback = await newFeedback.save();
    
    console.log('Feedback saved successfully:', savedFeedback);
    res.status(201).json(savedFeedback);
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(400).json({ message: error.message });
  }
});

// GET all feedback
router.get('/', async (req, res) => {
    try {
        console.log('GET /api/feedback - Fetching all feedback');
        
        // First check if any feedback exists
        const count = await Feedback.countDocuments();
        console.log(`Found ${count} feedback documents in the database`);
        
        const feedbacks = await Feedback.find()
            .populate('patientId', 'firstName lastName')
            .populate('therapistId', 'firstName lastName')
            .sort({ createdAt: -1 });
        
        console.log('Feedback data being sent:', JSON.stringify(feedbacks, null, 2));
        res.json(feedbacks);
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ message: 'Failed to fetch feedback' });
    }
});

module.exports = router;
