const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const localUserStore = require('../services/localUserStore');

// Log incoming requests to this router for easier debugging
router.use((req, res, next) => {
  try {
    console.log('AUTH REQ', req.method, req.path, 'ct=', req.headers['content-type']);
  } catch (e) {
    // ignore
  }
  next();
});

const JWT_SECRET = process.env.JWT_SECRET || 'solar-roi-dev-secret';
const PASSWORD_MIN_LENGTH = 8;
const MAX_LOGIN_ATTEMPTS = Number(process.env.MAX_LOGIN_ATTEMPTS || 5);
const LOGIN_LOCK_MINUTES = Number(process.env.LOGIN_LOCK_MINUTES || 15);
const RESET_PASSWORD_MINUTES = Number(process.env.RESET_PASSWORD_MINUTES || 30);
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

let googleClient;

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

const isMongoConnected = () => mongoose.connection.readyState === 1;

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const createResetToken = () => crypto.randomBytes(32).toString('hex');

const addProvider = (providers, provider) => [...new Set([...(providers || []), provider])];

const providerList = (user) => {
  const providers = Array.isArray(user.authProviders) ? [...user.authProviders] : [];

  if (user.password && !providers.includes('password')) providers.push('password');
  if (user.googleId && !providers.includes('google')) providers.push('google');

  return [...new Set(providers.length ? providers : ['password'])];
};

const validatePassword = (password) => {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`;
  }

  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Password must include at least one letter and one number';
  }

  return null;
};

const isAccountLocked = (user) => {
  if (!user?.lockedUntil) return false;
  return new Date(user.lockedUntil).getTime() > Date.now();
};

const resetTokenShouldBeExposed = () => {
  return process.env.RESET_PASSWORD_RETURN_TOKEN === 'true' || process.env.NODE_ENV !== 'production';
};

const findUserByEmail = async (email) => {
  if (isMongoConnected()) return User.findOne({ email });
  return localUserStore.findByEmail(email);
};

const findUserByGoogleId = async (googleId) => {
  if (isMongoConnected()) return User.findOne({ googleId });
  return localUserStore.findByGoogleId(googleId);
};

const findUserByResetTokenHash = async (tokenHash) => {
  if (isMongoConnected()) {
    return User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: { $gt: new Date() },
    });
  }

  return localUserStore.findByResetTokenHash(tokenHash);
};

const createUser = async (userData) => {
  if (isMongoConnected()) return User.create(userData);
  return localUserStore.create(userData);
};

const passwordMatches = async (user, password) => {
  if (isMongoConnected()) return user.matchPassword(password);
  return localUserStore.matchPassword(user, password);
};

const recordSuccessfulLogin = async (user) => {
  if (isMongoConnected()) {
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.lastLoginAt = new Date();
    return user.save();
  }

  return localUserStore.recordSuccessfulLogin(user._id);
};

const recordFailedLogin = async (user) => {
  if (isMongoConnected()) {
    user.failedLoginAttempts = Number(user.failedLoginAttempts || 0) + 1;

    if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockedUntil = new Date(Date.now() + LOGIN_LOCK_MINUTES * 60 * 1000);
    }

    return user.save();
  }

  return localUserStore.recordFailedLogin(user._id, {
    maxAttempts: MAX_LOGIN_ATTEMPTS,
    lockMinutes: LOGIN_LOCK_MINUTES,
  });
};

const linkGoogleAccount = async (user, googleProfile) => {
  if (isMongoConnected()) {
    user.googleId = googleProfile.googleId;
    user.avatar = googleProfile.avatar || user.avatar;
    user.emailVerified = Boolean(googleProfile.emailVerified || user.emailVerified);
    user.authProviders = addProvider(providerList(user), 'google');

    if (!user.name && googleProfile.name) {
      user.name = googleProfile.name;
    }

    return user.save();
  }

  return localUserStore.linkGoogleAccount(user._id, googleProfile);
};

const setPasswordReset = async (user, tokenHash, expiresAt) => {
  if (isMongoConnected()) {
    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordExpiresAt = expiresAt;
    return user.save();
  }

  return localUserStore.setPasswordReset(user._id, tokenHash, expiresAt);
};

const setUserPassword = async (user, password) => {
  if (isMongoConnected()) {
    user.password = password;
    user.resetPasswordTokenHash = null;
    user.resetPasswordExpiresAt = null;
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.authProviders = addProvider(providerList(user), 'password');
    return user.save();
  }

  return localUserStore.setPassword(user._id, password);
};

const userResponse = (user) => ({
  _id: String(user._id),
  name: user.name,
  email: user.email,
  avatar: user.avatar || null,
  authProviders: providerList(user),
  token: generateToken(user._id),
});

const getGoogleClient = () => {
  if (!GOOGLE_CLIENT_ID) return null;

  if (!googleClient) {
    googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
  }

  return googleClient;
};

const verifyGoogleCredential = async (credential) => {
  const client = getGoogleClient();

  if (!client) {
    const error = new Error('Google sign-in is not configured');
    error.statusCode = 503;
    throw error;
  }

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  if (!payload?.sub || !payload?.email) {
    const error = new Error('Google did not return a usable profile');
    error.statusCode = 401;
    throw error;
  }

  if (!payload.email_verified) {
    const error = new Error('Google email must be verified');
    error.statusCode = 401;
    throw error;
  }

  return {
    googleId: payload.sub,
    email: normalizeEmail(payload.email),
    name: payload.name || payload.email.split('@')[0],
    avatar: payload.picture,
    emailVerified: Boolean(payload.email_verified),
  };
};

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || '');

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address' });
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return res.status(400).json({ message: passwordError });
  }

  try {
    const userExists = await findUserByEmail(email);
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists. Try signing in or use forgot password.' });
    }

    const user = await createUser({
      name,
      email,
      password,
      authProviders: ['password'],
      emailVerified: false,
    });
    const loggedInUser = await recordSuccessfulLogin(user);

    res.status(201).json(userResponse(loggedInUser));
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Could not create account. Please try again.' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || '');

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address' });
  }

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (isAccountLocked(user)) {
      return res.status(423).json({ message: `Too many attempts. Try again in ${LOGIN_LOCK_MINUTES} minutes or reset your password.` });
    }

    if (!user.password) {
      return res.status(401).json({ message: 'This account uses Google sign-in. Continue with Google or reset your password.' });
    }

    if (await passwordMatches(user, password)) {
      const loggedInUser = await recordSuccessfulLogin(user);
      return res.json(userResponse(loggedInUser));
    }

    const updatedUser = await recordFailedLogin(user);

    if (isAccountLocked(updatedUser)) {
      return res.status(423).json({ message: `Too many attempts. Account locked for ${LOGIN_LOCK_MINUTES} minutes.` });
    }

    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Could not sign in. Please try again.' });
  }
});

// @route   POST /api/auth/google
// @desc    Sign in or sign up with Google Identity Services
router.post('/google', async (req, res) => {
  const credential = String(req.body.credential || '');

  if (!credential) {
    return res.status(400).json({ message: 'Google credential is required' });
  }

  try {
    const googleProfile = await verifyGoogleCredential(credential);
    let user = await findUserByGoogleId(googleProfile.googleId);

    if (!user) {
      const existingUser = await findUserByEmail(googleProfile.email);

      user = existingUser
        ? await linkGoogleAccount(existingUser, googleProfile)
        : await createUser({
          name: googleProfile.name,
          email: googleProfile.email,
          googleId: googleProfile.googleId,
          avatar: googleProfile.avatar,
          emailVerified: true,
          authProviders: ['google'],
        });
    } else {
      user = await linkGoogleAccount(user, googleProfile);
    }

    const loggedInUser = await recordSuccessfulLogin(user);
    return res.json(userResponse(loggedInUser));
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(error.statusCode || 401).json({
      message: error.statusCode === 503
        ? 'Google sign-in is not configured on the server.'
        : 'Google sign-in failed. Please try again.',
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Create a short-lived password reset token
router.post('/forgot-password', async (req, res) => {
  const email = normalizeEmail(req.body.email);

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address' });
  }

  try {
    const user = await findUserByEmail(email);
    let resetToken = null;

    if (user) {
      resetToken = createResetToken();
      const resetTokenHash = hashToken(resetToken);
      const expiresAt = new Date(Date.now() + RESET_PASSWORD_MINUTES * 60 * 1000);

      await setPasswordReset(user, resetTokenHash, expiresAt);
      console.info(`Password reset token generated for ${email}. It expires in ${RESET_PASSWORD_MINUTES} minutes.`);
    }

    const response = {
      message: 'If an account exists for that email, password reset instructions are ready.',
    };

    if (resetToken && resetTokenShouldBeExposed()) {
      response.resetToken = resetToken;
      response.expiresInMinutes = RESET_PASSWORD_MINUTES;
      response.message = 'Use the reset code below to choose a new password.';
    }

    return res.json(response);
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Could not start password reset. Please try again.' });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using a short-lived token
router.post('/reset-password', async (req, res) => {
  const token = String(req.body.token || '').trim();
  const password = String(req.body.password || '');

  if (!token || !password) {
    return res.status(400).json({ message: 'Reset code and new password are required' });
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return res.status(400).json({ message: passwordError });
  }

  try {
    const user = await findUserByResetTokenHash(hashToken(token));

    if (!user) {
      return res.status(400).json({ message: 'Reset code is invalid or has expired' });
    }

    const updatedUser = await setUserPassword(user, password);
    const loggedInUser = await recordSuccessfulLogin(updatedUser);

    return res.json(userResponse(loggedInUser));
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Could not reset password. Please try again.' });
  }
});

module.exports = router;
