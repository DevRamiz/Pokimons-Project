require('dotenv').config();
const express = require('express');
const session = require('express-session');
const morgan  = require('morgan');
const path    = require('path');

const { ensureDataFiles } = require('./src/utils/db');
const homeRoutes = require('./src/routes/home');
const authRoutes      = require('./src/routes/auth');
const favoritesRoutes = require('./src/routes/favorites');
const pokemonRoutes   = require('./src/routes/pokemon');
const arenaRoutes     = require('./src/routes/arena');

const app = express();
ensureDataFiles();

app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

// API routes
app.use(homeRoutes);
app.use(authRoutes);
app.use(favoritesRoutes);
app.use(pokemonRoutes);
app.use(arenaRoutes);

// Page guard (per spec):
// Home (/, /index.html) is PUBLIC
// login.html and register.html are PUBLIC; if already logged in -> redirect to '/'
// All other HTML pages require login; otherwise redirect to '/?msg=login_required'
function pageGuard(req, res, next) {
  const p = req.path;
  const isHtml = p === '/' || p.endsWith('.html');
  if (!isHtml) return next();

  const isHome = (p === '/' || p === '/index.html');
  const isAuth = (p === '/login.html' || p === '/register.html');
  const loggedIn = !!(req.session && req.session.userId);

  if (isAuth && loggedIn) return res.redirect('/');
  if (!loggedIn && !isHome && !isAuth) return res.redirect('/?msg=login_required');
  return next();
}
app.use(pageGuard);

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Page routes
app.get(['/', '/index.html', '/login.html', '/register.html', '/favorites.html', '/arena.html', '/leaderboard.html'], (req, res) => {
  const file = req.path === '/' ? 'index.html' : req.path.slice(1);
  res.sendFile(path.join(__dirname, 'public', file));
});

// 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
