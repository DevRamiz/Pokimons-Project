const { getUserById, publicUser } = require('../services/userService');

async function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Auth required' });
  }
  const user = await getUserById(req.session.userId);
  if (!user) {
    req.session.destroy(() => {});
    return res.status(401).json({ error: 'Auth required' });
  }
  req.user = publicUser(user);
  next();
}

module.exports = { requireAuth };
