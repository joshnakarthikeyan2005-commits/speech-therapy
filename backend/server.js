require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const client = require('prom-client');
const authRoutes = require('./routes/authRoutes');
const patientsRoutes = require('./routes/patientsRoutes');
const therapistsRoutes = require('./routes/therapistsRoutes');
const sessionsRoutes = require('./routes/sessionsRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const consentRoutes = require('./routes/consentRoutes');

const app = express();
client.collectDefaultMetrics();
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests received',
  labelNames: ['method', 'route', 'status_code'],
});

// CORS - Allow all localhost origins
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if(!origin) return callback(null, true);
    
    // Allow any localhost domain
    if(origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  res.on('finish', () => {
    httpRequestsTotal.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: String(res.statusCode),
    });
  });
  next();
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/speech')
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/therapists', therapistsRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/consent', consentRoutes);

// Basic route
app.get('/', (req, res) => res.send('API is running...'));

app.get('/health', async (req, res) => {
  const mongoState = mongoose.connection.readyState;
  res.json({
    status: mongoState === 1 ? 'ok' : 'degraded',
    mongoState,
  });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// 404 Error handling
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
