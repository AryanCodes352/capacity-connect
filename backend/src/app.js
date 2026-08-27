/**
 * src/app.js — Express application setup
 *
 * Responsibilities:
 *  1. Configure all middleware (security, CORS, JSON parsing, logging)
 *  2. Mount all API route groups
 *  3. Register the centralized error handler (must be last)
 *
 * Does NOT start the HTTP server — that is server.js's job.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { errorHandler, notFound } = require('./middleware/error.middleware');

const app = express();

// ─── Security Middleware ────────────────────────────────────────────────────

// helmet sets secure HTTP headers
app.use(helmet());

// CORS — dynamically allow incoming frontend origins (localhost, Vercel, custom domains)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all origins in development and production for easy deployment
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Rate Limiting ──────────────────────────────────────────────────────────
// General limiter: 1000 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

// Auth limiter for dev/demo testing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
});

app.use('/api/', generalLimiter);
app.use('/api/auth', authLimiter);

// ─── Request Parsing ────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));          // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse form data

// ─── Logging ────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Colored request log in development
} else {
  app.use(morgan('combined')); // Apache-style log in production
}

// ─── Static Files ───────────────────────────────────────────────────────────
// Serve uploaded files (knowledge hub PDFs, thumbnails, etc.)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CAPACITY CONNECT API is healthy',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ─────────────────────────────────────────────────────────────
// Routes will be added here phase-by-phase.
// Uncomment each line as the corresponding phase is implemented.

// Phase 3 — Authentication
app.use('/api/auth', require('./routes/auth.routes'));

// Phase 4 — User, Department, OrgRole management
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/departments', require('./routes/department.routes'));
app.use('/api/roles', require('./routes/role.routes'));

// Phase 5 — Competency management
app.use('/api/competencies', require('./routes/competency.routes'));

// Phase 6 — Assessment engine
app.use('/api/assessments', require('./routes/assessment.routes'));

// Phase 7 — Skill gap engine
app.use('/api/skill-gaps', require('./routes/skillGap.routes'));

// Phase 8 — Course / LMS module
app.use('/api/courses', require('./routes/course.routes'));
app.use('/api/enrollments', require('./routes/enrollment.routes'));

// Phase 9 — Recommendation engine + Training assignments
app.use('/api/recommendations', require('./routes/recommendation.routes'));
app.use('/api/training', require('./routes/training.routes'));

// Phase 10 — Training effectiveness (analytics)
app.use('/api/analytics', require('./routes/analytics.routes'));

// Phase 12 — Knowledge hub
app.use('/api/knowledge', require('./routes/knowledge.routes'));

// Phase 13 — Notifications
app.use('/api/notifications', require('./routes/notification.routes'));

// Phase 14 — AI Capacity Assistant
app.use('/api/ai', require('./routes/ai.routes'));

// ─── Error Handling (must be LAST) ──────────────────────────────────────────
app.use(notFound);      // 404 handler for unmatched routes
app.use(errorHandler);  // Global error handler

module.exports = app;
