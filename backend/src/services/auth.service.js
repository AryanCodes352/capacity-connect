/**
 * src/services/auth.service.js — Authentication Business Logic
 *
 * This service handles all auth-related operations.
 * Controllers call these functions — they never contain business logic directly.
 *
 * Separation of concerns:
 *  Controller  → Parse HTTP request, call service, send HTTP response
 *  Service     → Business logic, database queries, password handling, JWT
 *
 * Functions:
 *  - login(email, password)              → token + user
 *  - register(userData)                  → token + user  (Admin creates users)
 *  - getMe(userId)                       → user
 *  - changePassword(userId, currentPwd, newPwd) → success message
 */

const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { signToken } = require('../utils/jwt.util');
const { USER_SELECT } = require('../middleware/auth.middleware');

// ─── Constants ────────────────────────────────────────────────────────────────

const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Log in a user with email + password.
 *
 * @param {string} email
 * @param {string} password   (plain text — compared against bcrypt hash)
 * @returns {{ token: string, user: object }}
 * @throws Error with message if credentials are wrong or account is inactive
 */
async function login(email, password) {
  // 1. Find user by email (include password for comparison)
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: {
      ...USER_SELECT,
      password: true, // include password ONLY for comparison here
    },
  });

  // 2. Check user exists AND password matches
  //    We check both in one condition and use a generic message to prevent
  //    email enumeration attacks (an attacker shouldn't know if the email
  //    exists or just the password is wrong).
  if (!user || !(await bcrypt.compare(password, user.password))) {
    const err = new Error('Invalid email or password. Please try again.');
    err.statusCode = 401;
    throw err;
  }

  // 3. Check account is active
  if (!user.isActive) {
    const err = new Error(
      'Your account has been deactivated. Please contact your administrator.'
    );
    err.statusCode = 403;
    throw err;
  }

  // 4. Sign JWT — payload is minimal (id + role only)
  const token = signToken({ id: user.id, role: user.role });

  // 5. Remove password from the user object before returning
  const { password: _pwd, ...safeUser } = user;

  return { token, user: safeUser };
}

/**
 * Register (create) a new user.
 * In CAPACITY CONNECT, self-registration is NOT allowed.
 * Only admins can create user accounts via the admin panel.
 * This function is called by the admin endpoint, not a public register route.
 *
 * @param {object} userData  { email, password, firstName, lastName, role?, departmentId?, orgRoleId?, jobTitle?, phone? }
 * @returns {{ token: string, user: object }}
 * @throws Error if email already taken
 */
async function register(userData) {
  const {
    email,
    password,
    firstName,
    lastName,
    role = 'EMPLOYEE',
    departmentId,
    orgRoleId,
    jobTitle,
    phone,
  } = userData;

  // 1. Check if email is already in use
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true },
  });

  if (existing) {
    const err = new Error(
      `A user with the email ${email} already exists.`
    );
    err.statusCode = 409;
    throw err;
  }

  // 2. Hash the password
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // 3. Create the user in the database
  const newUser = await prisma.user.create({
    data: {
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role,
      departmentId: departmentId || null,
      orgRoleId: orgRoleId || null,
      jobTitle: jobTitle?.trim() || null,
      phone: phone || null,
    },
    select: USER_SELECT, // never returns password
  });

  // 4. Sign token for the new user
  const token = signToken({ id: newUser.id, role: newUser.role });

  return { token, user: newUser };
}

/**
 * Get the currently authenticated user's full profile.
 *
 * @param {string} userId
 * @returns {object} user (without password)
 */
async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: USER_SELECT,
  });

  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  return user;
}

/**
 * Change an authenticated user's password.
 *
 * @param {string} userId
 * @param {string} currentPassword  (plain text)
 * @param {string} newPassword      (plain text — will be hashed)
 * @throws Error if currentPassword is wrong
 */
async function changePassword(userId, currentPassword, newPassword) {
  // 1. Fetch user WITH password for comparison
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true },
  });

  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  // 2. Verify the current password is correct
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    const err = new Error(
      'Current password is incorrect. Please try again.'
    );
    err.statusCode = 400;
    throw err;
  }

  // 3. Ensure new password is different from current
  const isSame = await bcrypt.compare(newPassword, user.password);
  if (isSame) {
    const err = new Error(
      'New password must be different from your current password.'
    );
    err.statusCode = 400;
    throw err;
  }

  // 4. Hash new password and update
  const hashedNew = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNew },
  });
}

module.exports = { login, register, getMe, changePassword };
