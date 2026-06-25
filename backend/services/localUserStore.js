const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, '..', 'data');
const dataFile = path.join(dataDir, 'users.json');

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const asId = (id) => String(id || '');

const uniqueProviders = (providers = []) => {
  const normalizedProviders = providers
    .filter(Boolean)
    .map((provider) => String(provider).trim())
    .filter((provider) => ['password', 'google'].includes(provider));

  return [...new Set(normalizedProviders)];
};

const providersFor = (user, extraProviders = []) => {
  const providers = uniqueProviders([...(user.authProviders || []), ...extraProviders]);

  if (user.password) providers.push('password');
  if (user.googleId) providers.push('google');

  return uniqueProviders(providers.length ? providers : ['password']);
};

const readUsers = async () => {
  try {
    const contents = await fs.readFile(dataFile, 'utf8');
    const users = JSON.parse(contents);
    return Array.isArray(users) ? users : [];
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
};

const writeUsers = async (users) => {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(users, null, 2));
};

const findByEmail = async (email) => {
  const users = await readUsers();
  return users.find((user) => user.email === normalizeEmail(email)) || null;
};

const findByGoogleId = async (googleId) => {
  const users = await readUsers();
  return users.find((user) => user.googleId === String(googleId)) || null;
};

const findById = async (id) => {
  const users = await readUsers();
  return users.find((user) => asId(user._id) === asId(id)) || null;
};

const create = async ({
  name,
  email,
  password,
  googleId,
  avatar,
  emailVerified = false,
  authProviders,
}) => {
  const users = await readUsers();
  const normalizedEmail = normalizeEmail(email);

  if (users.some((user) => user.email === normalizedEmail)) {
    const duplicateError = new Error('User already exists');
    duplicateError.code = 'DUPLICATE_USER';
    throw duplicateError;
  }

  const user = {
    _id: crypto.randomUUID(),
    name: String(name).trim(),
    email: normalizedEmail,
    authProviders: uniqueProviders(authProviders || [password ? 'password' : 'google']),
    emailVerified: Boolean(emailVerified),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (password) user.password = await bcrypt.hash(password, 10);
  if (googleId) user.googleId = String(googleId);
  if (avatar) user.avatar = String(avatar);

  user.authProviders = providersFor(user, user.authProviders);

  users.push(user);
  await writeUsers(users);
  return user;
};

const matchPassword = (user, enteredPassword) => {
  if (!user?.password) return false;
  return bcrypt.compare(enteredPassword, user.password);
};

const updateById = async (id, updater) => {
  const users = await readUsers();
  const index = users.findIndex((user) => asId(user._id) === asId(id));

  if (index === -1) return null;

  const currentUser = users[index];
  const updates = typeof updater === 'function' ? updater(currentUser) : updater;
  const nextUser = {
    ...currentUser,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  nextUser.authProviders = providersFor(nextUser, updates.authProviders || []);
  users[index] = nextUser;
  await writeUsers(users);

  return nextUser;
};

const linkGoogleAccount = (id, { googleId, name, avatar, emailVerified }) => {
  return updateById(id, (user) => ({
    googleId: String(googleId),
    name: user.name || String(name || '').trim(),
    avatar: avatar || user.avatar,
    emailVerified: Boolean(emailVerified || user.emailVerified),
    authProviders: providersFor(user, ['google']),
  }));
};

const setPasswordReset = (id, tokenHash, expiresAt) => {
  return updateById(id, {
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpiresAt: expiresAt instanceof Date ? expiresAt.toISOString() : expiresAt,
  });
};

const findByResetTokenHash = async (tokenHash) => {
  const users = await readUsers();
  const now = Date.now();

  return users.find((user) => (
    user.resetPasswordTokenHash === tokenHash
    && user.resetPasswordExpiresAt
    && Date.parse(user.resetPasswordExpiresAt) > now
  )) || null;
};

const setPassword = async (id, password) => {
  const passwordHash = await bcrypt.hash(password, 10);

  return updateById(id, (user) => ({
    password: passwordHash,
    resetPasswordTokenHash: null,
    resetPasswordExpiresAt: null,
    failedLoginAttempts: 0,
    lockedUntil: null,
    authProviders: providersFor(user, ['password']),
  }));
};

const recordSuccessfulLogin = (id) => {
  return updateById(id, {
    failedLoginAttempts: 0,
    lockedUntil: null,
    lastLoginAt: new Date().toISOString(),
  });
};

const recordFailedLogin = (id, { maxAttempts, lockMinutes }) => {
  return updateById(id, (user) => {
    const failedLoginAttempts = Number(user.failedLoginAttempts || 0) + 1;
    const updates = { failedLoginAttempts };

    if (failedLoginAttempts >= maxAttempts) {
      updates.lockedUntil = new Date(Date.now() + lockMinutes * 60 * 1000).toISOString();
    }

    return updates;
  });
};

module.exports = {
  create,
  findById,
  findByEmail,
  findByGoogleId,
  findByResetTokenHash,
  linkGoogleAccount,
  matchPassword,
  recordFailedLogin,
  recordSuccessfulLogin,
  setPassword,
  setPasswordReset,
};
