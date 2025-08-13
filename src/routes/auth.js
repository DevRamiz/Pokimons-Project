const express = require('express');
const router = express.Router();
const { validateRegister } = require('../services/validation');
const { createUser, getUserByEmail, getUserById, verifyPassword, publicUser } = require('../services/userService');

router.post('/register', async (req, res) => {
  try {
    const { firstName, email, password, confirmPassword } = req.body || {};
    const errors = validateRegister({ firstName, email, password, confirmPassword });
    if (Object.keys(errors).length) return res.status(400).json({ errors });
    const user = await createUser({ firstName, email, password });
    req.session.userId = user.id;
    res.status(201).json({ user });
  } catch (err) {
    if (String(err.message).toLowerCase().includes('already')) return res.status(409).json({ error: 'Email already registered' });
    console.error(err); res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = await getUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await verifyPassword(user, password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    req.session.userId = user.id;
    res.json({ user: publicUser(user) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Login failed' }); }
});

router.post('/logout', (req, res) => { req.session.destroy(() => res.json({ ok:true })); });

router.get('/me', async (req, res) => {
  const id = req.session?.userId;
  if (!id) return res.json({ user: null });
  const user = await getUserById(id);
  res.json({ user: publicUser(user) });
});

module.exports = router;
