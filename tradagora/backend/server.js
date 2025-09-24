const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images)
app.use('/uploads', express.static('uploads'));

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Tradagora API is running!',
    timestamp: new Date().toISOString()
  });
});

// Auth routes
app.use('/api/auth', require('./routes/auth'));

// Listing routes
app.use('/api/listings', require('./routes/listings'));

// Matching routes (AI)
app.use('/api/matching', require('./routes/matching'));

// User routes
app.use('/api/users', require('./routes/users'));

// Offer routes
app.use('/api/offers', require('./routes/offers'));

// Message routes
app.use('/api/messages', require('./routes/messages'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Tradagora API server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 AI Matching: http://localhost:${PORT}/api/matching`);
});

module.exports = app;