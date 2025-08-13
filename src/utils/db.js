const path = require('path');
const fs = require('fs-extra');
const base = path.join(__dirname, '..', '..', 'data');

function filePath(name) { return path.join(base, `${name}.json`); }

async function read(name) {
  const p = filePath(name);
  const exists = await fs.pathExists(p);
  if (!exists) return [];
  try {
    const txt = await fs.readFile(p, 'utf-8');
    return JSON.parse(txt || '[]');
  } catch {
    return [];
  }
}

async function write(name, data) {
  const p = filePath(name);
  await fs.outputFile(p, JSON.stringify(data, null, 2));
}

function ensureDataFiles() {
  fs.ensureDirSync(base);
  for (const n of ['users', 'favorites', 'battles']) {
    const p = filePath(n);
    if (!fs.existsSync(p)) fs.writeFileSync(p, '[]');
  }
}

module.exports = { read, write, ensureDataFiles };
