/**
 * src/middleware/role.middleware.js — Role-Based Access Control (RBAC)
 *
 * Must be used AFTER the `protect` middleware (which attaches req.user).
 *
 * `restrictTo(...roles)` is a factory function that returns a middleware.
 * This pattern lets you pass allowed roles at the route definition level:
 *
 *   router.get('/employees', protect, restrictTo('ADMIN'), getEmployees);
 *   router.post('/courses', protect, restrictTo('ADMIN', 'TRAINER'), createCourse);
 *
 * If the user's role is not in the allowed list → 403 Forbidden.
 * If the user's role IS allowed → next() (continue to controller).
 *
 * ─── Role Hierarchy in CAPACITY CONNECT ───────────────────────────────────
 *
 *  ADMIN   → Full access: manage users, departments, competencies, all courses,
 *             analytics, training assignments, knowledge hub
 *
 *  TRAINER → Create/manage their own courses, modules, lessons, quizzes,
 *             assessments; track learners in their courses
 *
 *  EMPLOYEE → View their profile, competencies, skill gaps, recommendations;
 *             enroll in courses; take assessments; access knowledge hub
 *
 * ─── Usage Examples ─────────────────────────────────────────────────────────
 *
 *  Admin only:
 *    protect, restrictTo('ADMIN')
 *
 *  Admin and Trainer:
 *    protect, restrictTo('ADMIN', 'TRAINER')
 *
 *  Any authenticated user:
 *    protect   ← no restrictTo needed, just protect is enough
 */

const { sendError } = require('../utils/apiResponse');

/**
 * Factory function — returns a middleware that restricts access to the given roles.
 *
 * @param {...string} roles  One or more allowed roles: 'ADMIN', 'TRAINER', 'EMPLOYEE'
 * @returns {Function}       Express middleware (req, res, next)
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user is set by the protect middleware that runs before this
    if (!req.user) {
      return sendError(
        res,
        401,
        'You must be logged in to access this resource.'
      );
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access denied. This action requires one of the following roles: ${roles.join(', ')}. Your current role is: ${req.user.role}.`
      );
    }

    next();
  };
};

module.exports = { restrictTo };
