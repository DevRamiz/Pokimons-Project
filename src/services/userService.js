const { v4: uuid } = require('uuid');
const bcrypt = require('bcrypt');
const { read, write } = require('../utils/db');

function publicUser(u) { if (!u) return null; const { id, firstName, email, createdAt } = u; return { id, firstName, email, createdAt }; }

async function listUsers() { return await read('users'); }

async function getUserByEmail(email) {
  const users = await read('users');
  return users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
}

async function getUserById(id) {
  const users = await read('users');
  return users.find(u => u.id === id);
}

async function createUser({ firstName, email, password }) {
  const users = await read('users');
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) throw new Error('Email already registered');
  const hash = await bcrypt.hash(password, 10);
  const user = { id: uuid(), firstName, email, passwordHash: hash, createdAt: new Date().toISOString() };
  users.push(user);
  await write('users', users);
  return publicUser(user);
}

async function verifyPassword(user, password) { return bcrypt.compare(password || '', user.passwordHash || ''); }

// Favorites
async function getFavorites(userId) {
  const all = await read('favorites');
  const rec = all.find(f => f.userId === userId);
  return rec ? rec.pokemonIds : [];
}
async function setFavorites(userId, ids) {
  const all = await read('favorites');
  const idx = all.findIndex(f => f.userId === userId);
  if (idx === -1) all.push({ userId, pokemonIds: ids }); else all[idx].pokemonIds = ids;
  await write('favorites', all);
  return ids;
}
async function addFavorite(userId, pokemonId, limit=10) {
  const ids = await getFavorites(userId);
  const p = String(pokemonId);
  if (ids.includes(p)) return ids;
  if (ids.length >= limit) { const e = new Error('Favorites limit reached'); e.code='LIMIT'; throw e; }
  ids.push(p); return setFavorites(userId, ids);
}
async function removeFavorite(userId, pokemonId) {
  const ids = await getFavorites(userId);
  const filtered = ids.filter(x => x !== String(pokemonId));
  return setFavorites(userId, filtered);
}

module.exports = { publicUser, listUsers, getUserByEmail, getUserById, createUser, verifyPassword, getFavorites, addFavorite, removeFavorite };
