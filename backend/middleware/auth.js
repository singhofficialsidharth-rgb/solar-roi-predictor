const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const localUserStore = require('../services/localUserStore');

const JWT_SECRET = process.env.JWT_SECRET || 'solar-roi-dev-secret';
const isMongoConnected = () => mongoose.connection.readyState === 1;

const findUserById = async (id) => {
  if (isMongoConnected()) return User.findById(id).select('-password');

  const user = await localUserStore.findById(id);
  if (!user) return null;

  const { password, resetPasswordTokenHash, ...safeUser } = user;
  return safeUser;
};

const protect = async (req, res, next) => {
  let token;

  // Check if token exists in the headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (Format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Fetch the user from the DB and attach to req.user (excluding password)
      req.user = await findUserById(decoded.id);

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
