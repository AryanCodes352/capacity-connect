/**
 * src/utils/jwt.util.js — JWT Sign & Verify Helpers
 *
 * Centralises all JWT logic so:
 *  - The secret and expiry config are never scattered across files
 *  - Signing always produces tokens with the same shape
 *  - Verification always produces a consistent decoded payload
 *
 * Token payload shape:
 *  {
 *    id:   string  — user's cuid (used to look up the user in every request)
 *    role: string  — "ADMIN" | "TRAINER" | "EMPLOYEE"
 *    iat:  number  — issued-at (added by jwt.sign automatically)
 *    exp:  number  — expiry   (added by jwt.sign automatically)
 *  }
 *
 * We keep the payload MINIMAL on purpose.
 * Everything else (name, department, etc.) is fetched fresh from the DB
 * by auth.middleware.js on every protected request — this ensures that if
 * an admin deactivates a user, that user cannot continue using the app.
 */

const jwt = require('jsonwebtoken');

/**
 * Sign a new JWT for a user.
 *
 * @param {{ id: string, role: string }} payload
 * @returns {string} Signed JWT token string
 *
 * @example
 * const token = signToken({ id: user.id, role: user.role });
 */
function signToken(payload) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

/**
 * Verify and decode a JWT.
 * Throws JsonWebTokenError if invalid, TokenExpiredError if expired.
 *
 * @param {string} token
 * @returns {{ id: string, role: string, iat: number, exp: number }}
 *
 * @example
 * try {
 *   const decoded = verifyToken(token);
 *   console.log(decoded.id, decoded.role);
 * } catch (err) {
 *   // JsonWebTokenError or TokenExpiredError
 * }
 */
function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { signToken, verifyToken };
