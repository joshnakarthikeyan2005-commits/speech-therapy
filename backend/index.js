const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const feedbackRoutes = require('./routes/feedbackRoutes');
const authRoutes = require('./routes/authRoutes');
const patientsRoutes = require('./routes/patientsRoutes');
const therapistsRoutes = require('./routes/therapistsRoutes');
const sessionsRoutes = require('./routes/sessionsRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/speech';
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/feedback', feedbackRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/therapists', therapistsRoutes);
app.use('/api/sessions', sessionsRoutes);


app.get('/', (req, res) => {
  res.send('Speech Therapy Platform Backend');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
