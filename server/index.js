const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
const xss = require('xss-clean');

const connectDB = require('./config/db');
const { generalLimiter, authLimiter } = require('./middleware/security');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// ── Core middleware ──────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false })); // allow serving /uploads images cross-origin to the frontend
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());
app.use(csurf({
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
}));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp({ whitelist: ['skillsRequired', 'skills'] }));
app.use(generalLimiter);

// ── Health check and CSRF token endpoint ──────────────────
app.get('/api/health', (req, res) => res.json({ success: true, message: 'HireAI API is running' }));
app.get('/api/csrf-token', (req, res) => res.json({ success: true, csrfToken: req.csrfToken() }));
// // CSRF token endpoint returns a valid token for frontend requests
// Note: route registration and error handlers are performed when not testing
// to avoid loading route modules (which may import ESM-only dependencies)
// during unit tests that only need the minimal app.

// ── Start ─────────────────────────────────────────────────
const PORT = Number(process.env.PORT || 5000);

const startServer = (port) => {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(` HireAI API running on http://localhost:${port}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      console.warn(`Port ${port} is busy. Trying ${nextPort}...`);
      server.close(() => startServer(nextPort));
    } else {
      console.error(err);
      process.exit(1);
    }
  });
};

// Only connect to the database and start the HTTP server when not running tests.
if (process.env.NODE_ENV !== 'test') {
  // ── Routes ────────────────────────────────────────────────
  app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
  app.use('/api', require('./routes/uploadRoutes'));
  app.use('/api/candidates', require('./routes/candidateRoutes'));
  app.use('/api/companies', require('./routes/companyRoutes'));
  app.use('/api/jobs', require('./routes/jobRoutes'));
  app.use('/api/applications', require('./routes/applicationRoutes'));
  app.use('/api/assessments', require('./routes/assessmentRoutes'));
  app.use('/api/interviews', require('./routes/interviewRoutes'));
  app.use('/api/notifications', require('./routes/notificationRoutes'));
  app.use('/api/admin', require('./routes/adminRoutes'));
  app.use('/api/ai', require('./routes/aiRoutes'));

  // ── 404 + error handler (must be last) ───────────────────
  app.use(notFound);
  app.use(errorHandler);

  connectDB().then(() => startServer(PORT));
} else {
  // In test mode we export the app without starting the listener/DB connection
  // and without loading the route modules to keep tests lightweight.
  console.log('Running in test mode: skipping DB connect, server start, and route registration');
}

module.exports = app;
