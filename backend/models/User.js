const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required() {
      return !this.googleId;
    },
  },
  googleId: { type: String, sparse: true, index: true },
  avatar: { type: String },
  emailVerified: { type: Boolean, default: false },
  authProviders: {
    type: [String],
    enum: ['password', 'google'],
    default: ['password'],
  },
  resetPasswordTokenHash: { type: String },
  resetPasswordExpiresAt: { type: Date },
  failedLoginAttempts: { type: Number, default: 0 },
  lockedUntil: { type: Date },
  lastLoginAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Hash password before saving to the database
UserSchema.pre('save', async function(next) {
  this.updatedAt = new Date();

  // Only hash if a password exists and has been modified.
  if (!this.password || !this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords during login
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
