/**
 * src/middleware/error.middleware.js — Centralized Error Handler
 *
 * Express has a special 4-argument middleware signature (err, req, res, next).
 * When any route handler calls next(err) or throws inside asyncHandler,
 * Express skips all regular middleware and jumps directly here.
 *
 * This file handles:
 *  - Prisma known errors (record not found, unique constraint, etc.)
 *  - JWT errors (invalid token, expired token)
 *  - Multer errors (file too large, wrong type)
 *  - Generic application errors
 *  - Unknown/unexpected errors (500)
 *
 * All error responses follow the { success, message, errors? } shape
 * defined in utils/apiResponse.js.
 */

const { sendError } = require('../utils/apiResponse');

// ─── 404 Not Found Handler ────────────────────────────────────────────────────
// Placed before errorHandler in app.js.
// If no route matched the request, we reach here.
const notFound = (req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Must have exactly 4 parameters for Express to recognize it as an error handler.
const errorHandler = (err, req, res, next) => {
  // Log the full error in development for easier debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('\n❌ Error:', {
      message: err.message,
      code: err.code,
      stack: err.stack,
    });
  }

  // Default status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // ── Prisma Errors ────────────────────────────────────────────────────────
  if (err.code) {
    switch (err.code) {
      // Unique constraint violation (e.g. duplicate email)
      case 'P2002':
        statusCode = 409;
        message = `A record with this ${err.meta?.target?.join(', ')} already exists.`;
        break;

      // Record not found (e.g. findUniqueOrThrow)
      case 'P2025':
        statusCode = 404;
        message = err.meta?.cause || 'The requested record was not found.';
        break;

      // Foreign key constraint failure (e.g. referencing non-existent record)
      case 'P2003':
        statusCode = 400;
        message = `Related record not found: ${err.meta?.field_name}`;
        break;

      // Invalid data sent to Prisma
      case 'P2000':
        statusCode = 400;
        message = 'The provided data is invalid.';
        break;

      default:
        // Unknown Prisma error — treat as internal server error
        statusCode = 500;
        message = 'A database error occurred.';
        break;
    }
  }

  // ── JWT Errors ───────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please log in again.';
  }

  // ── Multer Errors ────────────────────────────────────────────────────────
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File is too large. Maximum allowed size is 10MB.';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = `Unexpected file field: ${err.field}`;
    } else {
      message = `File upload error: ${err.message}`;
    }
  }

  // ── Validation Errors (express-validator) ────────────────────────────────
  if (err.name === 'ValidationError' && err.array) {
    statusCode = 422;
    message = 'Validation failed. Please check your input.';
    errors = err.array();
  }

  // ── In production, never expose internal error details ───────────────────
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'An unexpected error occurred. Please try again later.';
    errors = null;
  }

  return sendError(res, statusCode, message, errors);
};

module.exports = { notFound, errorHandler };
