import { me, escapeHtml } from './shared.js';
const API = "";
const rvpForm   = document.getElementById('rvpForm');
const rvpOut    = document.getElementById('rvpOut');
const botForm   = document.getElementById('botForm');
const botOut    = document.getElementById('botOut');
const favForm   = document.getElementById('favForm');
const favSelect = document.getElementById('favSelect');
const favOut    = document.getElementById('favOut');

// Random vs Player (random Gen-1 both; optional override for your side)
rvpForm.onsubmit = async (e) => {
  e.preventDefault();
  if (!me) { rvpOut.textContent = "Login first."; return; }
  const raw = new FormData(e.target).get("myPokemonId").trim();
  const payload = raw ? await resolveId(raw) : {};
  rvpOut.textContent = "Battling...";
  try {
    const r = await fetch(API + "/arena/random-vs-player", {
      method:"POST", credentials:"include",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (!r.ok) { rvpOut.textContent = data.error || "Battle failed"; return; }
    rvpOut.innerHTML = renderBattle(data);
  } catch { rvpOut.textContent = "Battle failed"; }
};

// vs Bot
botForm.onsubmit = async (e) => {
  e.preventDefault();
  if (!me) { botOut.textContent = "Login first."; return; }
  const raw = new FormData(e.target).get("myPokemonId").trim();
  const payload = raw ? await resolveId(raw) : {};
  botOut.textContent = "Battling...";
  try {
    const r = await fetch(API + "/arena/vs-bot", {
      method:"POST", credentials:"include",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (!r.ok) { botOut.textContent = data.error || "Battle failed"; return; }
    botOut.innerHTML = renderBattle(data);
  } catch { botOut.textContent = "Battle failed"; }
};

// Favorites vs Player
favForm.onsubmit = async (e) => {
  e.preventDefault();
  if (!me) { favOut.textContent = "Login first."; return; }
  const myFavoriteId = (favSelect.value || "").trim();
  const payload = myFavoriteId ? { myFavoriteId } : {};
  favOut.textContent = "Battling...";
  try {
    const r = await fetch(API + "/arena/favorites-vs-player", {
      method:"POST", credentials:"include",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (!r.ok) { favOut.textContent = data.error || "Battle failed"; return; }
    favOut.innerHTML = renderBattle(data);
  } catch { favOut.textContent = "Battle failed"; }
};

async function loadMyFavoritesSelect(){
  if (!me) { favSelect.innerHTML = '<option value="">Login to load favorites</option>'; return; }
  try {
    const r = await fetch(API + `/users/${me.id}/favorites`, { credentials:"include" });
    const data = await r.json();
    if (!r.ok) { favSelect.innerHTML = '<option value="">(failed to load)</option>'; return; }
    const ids = data.favorites || [];
    if (!ids.length) { favSelect.innerHTML = '<option value="">You have no favorites</option>'; return; }
    const detailed = await Promise.all(ids.map(id =>
      fetch(API + `/pokemon/${id}`, { credentials:"include" })
        .then(x => x.json()).catch(() => null)
    ));
    const opts = detailed.filter(Boolean).map(p => `<option value="${p.id}">#${p.id} — ${p.name}</option>`).join('');
    favSelect.innerHTML = `<option value="">Random from my favorites</option>` + opts;
  } catch { favSelect.innerHTML = '<option value="">(failed to load)</option>'; }
}

async function resolveId(input){
  if (/^\d+$/.test(input)) return { myPokemonId: input };
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(input.toLowerCase())}`);
    if (!res.ok) return { myPokemonId: input };
    const d = await res.json();
    return { myPokemonId: String(d.id) };
  } catch { return { myPokemonId: input }; }
}

function renderBattle(data){
  const y = data.you, o = data.opponent;
  const oppLabel = data.mode === 'vs-bot'
    ? 'Bot'
    : (o && o.user && o.user.firstName ? escapeHtml(o.user.firstName) : 'Opponent');
  return `
    <div class="card-grid">
      <div class="card">
        <img src="${y.pokemon.image}" alt="${y.pokemon.name}">
        <h3>You — ${cap(y.pokemon.name)}</h3>
        <div class="kv"><b>Score</b><span>${y.score}</span></div>
      </div>
      <div class="card">
        <img src="${o.pokemon.image}" alt="${o.pokemon.name}">
        <h3>${oppLabel} — ${cap(o.pokemon.name)}</h3>
        <div class="kv"><b>Score</b><span>${o.score}</span></div>
      </div>
    </div>
    <p class="notice">${cap(data.result)}</p>`;
}

function cap(s){ return (s||"").charAt(0).toUpperCase() + (s||"").slice(1); }

loadMyFavoritesSelect();
