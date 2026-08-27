/**
 * src/utils/asyncHandler.js — Async error wrapper
 *
 * Express does not automatically catch errors thrown inside async route
 * handlers. Without this wrapper, an uncaught promise rejection would
 * hang the request forever (or crash the process in newer Node versions).
 *
 * Usage in any controller:
 *
 *   const { asyncHandler } = require('../utils/asyncHandler');
 *
 *   router.get('/users', asyncHandler(async (req, res) => {
 *     const users = await prisma.user.findMany();
 *     sendSuccess(res, 200, 'Users fetched', users);
 *   }));
 *
 * If the async function throws, asyncHandler catches it and passes it to
 * Express's next() so the centralized error handler in error.middleware.js
 * can format and send the error response.
 */

/**
 * Wraps an async Express route handler and forwards any error to next().
 *
 * @param {Function} fn  An async (req, res, next) handler function
 * @returns {Function}   A synchronous Express-compatible handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { asyncHandler };
