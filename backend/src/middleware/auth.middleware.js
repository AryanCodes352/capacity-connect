/**
 * src/middleware/auth.middleware.js — JWT Authentication Middleware
 *
 * This middleware runs on every PROTECTED route.
 * It does NOT run on public routes like /api/auth/login.
 *
 * What it does:
 *  1. Reads the Authorization header → "Bearer <token>"
 *  2. Extracts the token
 *  3. Verifies the token with jwt.verify()
 *  4. Fetches the FULL user from the database (using the id from token)
 *  5. Checks the user is still active (not deactivated by admin)
 *  6. Attaches the user to req.user so controllers can access it
 *
 * Why fetch from DB on every request?
 *  Tokens are stateless — once issued, they cannot be "revoked" without
 *  this DB check. If an admin deactivates a user's account, the next
 *  request will fail here (user.isActive === false) even if the token
 *  is still valid. This is the correct approach for enterprise security.
 *
 * Usage:
 *   router.get('/me', protect, authController.getMe);
 *   router.get('/admin/users', protect, restrictTo('ADMIN'), userController.getAll);
 */

const prisma = require('../config/database');
const { verifyToken } = require('../utils/jwt.util');
const { sendError } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');

/**
 * Fields to select when loading the authenticated user.
 * NEVER include `password` here.
 */
const USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  avatar: true,
  jobTitle: true,
  phone: true,
  isActive: true,
  departmentId: true,
  orgRoleId: true,
  department: {
    select: { id: true, name: true, code: true },
  },
  orgRole: {
    select: { id: true, name: true },
  },
  createdAt: true,
};

/**
 * protect — Verifies JWT and attaches full user to req.user.
 * Use this on every route that requires authentication.
 */
const protect = asyncHandler(async (req, res, next) => {
  // ── 1. Extract token from header ─────────────────────────────────────────
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(
      res,
      401,
      'Access denied. No authentication token provided. Please log in.'
    );
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return sendError(res, 401, 'Access denied. Token is missing.');
  }

  // ── 2. Verify token (throws on invalid/expired) ──────────────────────────
  // The error.middleware.js will catch JsonWebTokenError / TokenExpiredError
  // and respond with a proper 401 message automatically.
  const decoded = verifyToken(token); // { id, role, iat, exp }

  // ── 3. Fetch user from database ───────────────────────────────────────────
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: USER_SELECT,
  });

  if (!user) {
    return sendError(
      res,
      401,
      'The user associated with this token no longer exists. Please log in again.'
    );
  }

  // ── 4. Check the account is still active ─────────────────────────────────
  if (!user.isActive) {
    return sendError(
      res,
      403,
      'Your account has been deactivated. Please contact your administrator.'
    );
  }

  // ── 5. Attach user to request ─────────────────────────────────────────────
  req.user = user;
  next();
});

module.exports = { protect, USER_SELECT };
