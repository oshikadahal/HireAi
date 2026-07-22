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
app.use(mongoSanitize());
app.use(xss());
app.use(hpp({ whitelist: ['skillsRequired', 'skills'] }));
app.use(generalLimiter);

// ── Static file serving (resumes, avatars, logos) ────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Health check ──────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ success: true, message: 'HireAI API is running' }));
app.get('/api/csrf-token', (req, res) => res.json({ success: true, csrfToken: '' }));

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
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

// ── Start ─────────────────────────────────────────────────
const PORT = Number(process.env.PORT || 5000);

const startServer = (port) => {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 HireAI API running on http://localhost:${port}`);
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

connectDB().then(() => startServer(PORT));

module.exports = app;
