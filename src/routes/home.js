const express = require('express');
const path = require('path');
const fs = require('fs-extra');

const router = express.Router();

const HOME_PATH = path.join(__dirname, '..', '..', 'data', 'home.json');
const DEFAULT_HOME = {
  appName: 'Pokimons',
  tagline: 'A tiny Pokédex with favorites and an arena — built for the Web Dev project.',
  about: [
    'Search Pokémon by id, type, or ability.',
    'Register to save favorites, battle in the arena, and climb the leaderboard.',
    'This Home page content is loaded from a server JSON file.'
  ],
  developers: [
    { name: 'Your Name 1', id: 'ID1' },
    { name: 'Your Name 2', id: 'ID2' }
  ]
};

async function readHome() {
  try {
    const exists = await fs.pathExists(HOME_PATH);
    if (!exists) {
      await fs.outputJson(HOME_PATH, DEFAULT_HOME, { spaces: 2 });
      return DEFAULT_HOME;
    }
    const txt = await fs.readFile(HOME_PATH, 'utf-8');
    const data = JSON.parse(txt); // may throw if JSON is invalid
    // normalize shape to avoid undefineds
    return {
      appName: data.appName || DEFAULT_HOME.appName,
      tagline: data.tagline || DEFAULT_HOME.tagline,
      about: Array.isArray(data.about) ? data.about : DEFAULT_HOME.about,
      developers: Array.isArray(data.developers) ? data.developers : DEFAULT_HOME.developers
    };
  } catch (err) {
    console.error('Home content error:', err);
    // Overwrite a bad file with defaults so the app never blocks
    try { await fs.outputJson(HOME_PATH, DEFAULT_HOME, { spaces: 2 }); } catch {}
    return DEFAULT_HOME;
  }
}

router.get('/home/content', async (_req, res) => {
  const data = await readHome();
  res.json(data);
});

module.exports = router;