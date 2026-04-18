const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all sessions
// @route   GET /api/sessions
router.get('/', async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate('patientId', 'firstName lastName')
      .populate('therapistId', 'firstName lastName specialization');
    
    res.json(sessions);
  } catch (err) {
    console.error('Error fetching sessions:', err);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// @desc    Get session by ID
// @route   GET /api/sessions/:id
router.get('/:id', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('patientId', 'firstName lastName')
      .populate('therapistId', 'firstName lastName specialization');
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json(session);
  } catch (err) {
    console.error('Error fetching session:', err);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// @desc    Create new session
// @route   POST /api/sessions
router.post('/', async (req, res) => {
  try {
    console.log('Creating new session:', req.body);
    
    const { 
      patientId, 
      therapistId, 
      date, 
      time,
      duration, 
      type, 
      location,
      goals, 
      notes 
    } = req.body;

    // Create date object from date and time strings
    const dateTimeStr = `${date}T${time}`;
    const scheduledAt = new Date(dateTimeStr);

    // Filter out empty goals
    const filteredGoals = goals.filter(goal => goal.trim() !== '');

    const session = new Session({
      patientId,
      therapistId,
      scheduledAt,
      duration,
      type,
      location,
      goals: filteredGoals,
      notes,
      status: 'scheduled',
      activities: []
    });

    const savedSession = await session.save();

    // Populate patient and therapist info before sending response
    const populatedSession = await Session.findById(savedSession._id)
      .populate('patientId', 'firstName lastName')
      .populate('therapistId', 'firstName lastName specialization');
    
    res.status(201).json(populatedSession);
  } catch (err) {
    console.error('Error creating session:', err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: err.message 
      });
    }
    
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// @desc    Update session
// @route   PUT /api/sessions/:id
router.put('/:id', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // If updating date and time
    if (req.body.date && req.body.time) {
      const dateTimeStr = `${req.body.date}T${req.body.time}`;
      req.body.scheduledAt = new Date(dateTimeStr);
      
      // Remove date and time from req.body as they're not in our schema
      delete req.body.date;
      delete req.body.time;
    }
    
    // Filter out empty goals if goals are provided
    if (req.body.goals) {
      req.body.goals = req.body.goals.filter(goal => goal.trim() !== '');
    }
    
    // Update the updatedAt timestamp
    req.body.updatedAt = Date.now();
    
    const updatedSession = await Session.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('patientId', 'firstName lastName')
     .populate('therapistId', 'firstName lastName specialization');
    
    res.json(updatedSession);
  } catch (err) {
    console.error('Error updating session:', err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: err.message 
      });
    }
    
    res.status(500).json({ error: 'Failed to update session' });
  }
});

// @desc    Delete session
// @route   DELETE /api/sessions/:id
router.delete('/:id', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    await Session.findByIdAndDelete(req.params.id);
    res.json({ message: 'Session deleted successfully' });
  } catch (err) {
    console.error('Error deleting session:', err);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// @desc    Add activity to session
// @route   POST /api/sessions/:id/activities
router.post('/:id/activities', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    session.activities.push(req.body);
    session.updatedAt = Date.now();
    
    const updatedSession = await session.save();
    
    res.json(updatedSession);
  } catch (err) {
    console.error('Error adding activity:', err);
    res.status(500).json({ error: 'Failed to add activity' });
  }
});

// @desc    Update activity in session
// @route   PUT /api/sessions/:id/activities/:activityId
router.put('/:id/activities/:activityId', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const activityIndex = session.activities.findIndex(
      activity => activity._id.toString() === req.params.activityId
    );
    
    if (activityIndex === -1) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    session.activities[activityIndex] = {
      ...session.activities[activityIndex].toObject(),
      ...req.body
    };
    
    session.updatedAt = Date.now();
    const updatedSession = await session.save();
    
    res.json(updatedSession);
  } catch (err) {
    console.error('Error updating activity:', err);
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

// @desc    Delete activity from session
// @route   DELETE /api/sessions/:id/activities/:activityId
router.delete('/:id/activities/:activityId', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    session.activities = session.activities.filter(
      activity => activity._id.toString() !== req.params.activityId
    );
    
    session.updatedAt = Date.now();
    const updatedSession = await session.save();
    
    res.json(updatedSession);
  } catch (err) {
    console.error('Error deleting activity:', err);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

module.exports = router;
