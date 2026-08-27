/**
 * src/utils/apiResponse.js — Consistent JSON response builder
 *
 * Every API endpoint must return responses in this exact shape:
 *
 * Success:
 * {
 *   "success": true,
 *   "message": "...",
 *   "data": { ... }
 * }
 *
 * Error:
 * {
 *   "success": false,
 *   "message": "...",
 *   "errors": [ ... ]  // optional, for validation errors
 * }
 *
 * Pagination (when returning lists):
 * {
 *   "success": true,
 *   "message": "...",
 *   "data": [ ... ],
 *   "pagination": {
 *     "page": 1,
 *     "limit": 20,
 *     "total": 100,
 *     "totalPages": 5
 *   }
 * }
 *
 * Using a consistent shape means the frontend can reliably read
 * `response.data.data` (Axios wraps HTTP response in `response.data`).
 */

/**
 * Send a success response.
 * @param {import('express').Response} res
 * @param {number} statusCode  HTTP status code (200, 201, etc.)
 * @param {string} message     Human-readable description
 * @param {*}      data        Payload to return
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

/**
 * Send a success response for paginated list data.
 */
const sendPaginated = (res, message, data, pagination) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination,
  });
};

/**
 * Send an error response.
 * @param {import('express').Response} res
 * @param {number}   statusCode   HTTP status code (400, 401, 403, 404, 500)
 * @param {string}   message      Human-readable error description
 * @param {Array}    [errors]     Array of field-level validation errors
 */
const sendError = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

module.exports = { sendSuccess, sendPaginated, sendError };
