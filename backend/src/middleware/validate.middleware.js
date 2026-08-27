/**
 * src/middleware/validate.middleware.js — express-validator Result Handler
 *
 * express-validator runs validation rules on the request object,
 * but does NOT automatically reject invalid requests.
 * You must call `validationResult(req)` yourself and decide what to do.
 *
 * This middleware does that for you:
 *  - Collect all validation errors from express-validator
 *  - If there are errors → respond 422 with structured error list
 *  - If no errors → call next() and continue to the controller
 *
 * Usage in a route file:
 *
 *   const { loginValidator } = require('../validators/auth.validator');
 *   const { validate } = require('../middleware/validate.middleware');
 *
 *   router.post('/login', loginValidator, validate, authController.login);
 *
 * The error response shape:
 * {
 *   "success": false,
 *   "message": "Validation failed. Please check your input.",
 *   "errors": [
 *     { "field": "email", "message": "Must be a valid email address" },
 *     { "field": "password", "message": "Password is required" }
 *   ]
 * }
 */

const { validationResult } = require('express-validator');
const { sendError } = require('../utils/apiResponse');

/**
 * Middleware: collect express-validator errors and reject with 422 if any found.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Reformat errors into a clean { field, message } array
    const formatted = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return sendError(
      res,
      422,
      'Validation failed. Please check your input.',
      formatted
    );
  }

  next();
};

module.exports = { validate };
