const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root Route
app.get('/', (req, res) => {
  res.send('Task Manager Backend Running Successfully');
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Safe Route Loading

// Auth Routes
try {
  const authRoutes = require('./routes/authRoutes');
  app.use('/api/auth', authRoutes);
  console.log('Auth routes loaded');
} catch (err) {
  console.error('Auth route error:', err);
}

// Project Routes
try {
  const projectRoutes = require('./routes/projectRoutes');
  app.use('/api/projects', projectRoutes);
  console.log('Project routes loaded');
} catch (err) {
  console.error('Project route error:', err);
}

// Task Routes
try {
  const taskRoutes = require('./routes/taskRoutes');
  app.use('/api/tasks', taskRoutes);
  console.log('Task routes loaded');
} catch (err) {
  console.error('Task route error:', err);
}

// Activity Routes
try {
  const activityRoutes = require('./routes/activityRoutes');
  app.use('/api/activity', activityRoutes);
  console.log('Activity routes loaded');
} catch (err) {
  console.error('Activity route error:', err);
}

// Handle Undefined Routes
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);

  res.status(500).json({
    message: 'Internal Server Error',
    error: err.message,
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});