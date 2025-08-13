import { me, escapeHtml } from './shared.js';

const API = ""; // same-origin
const form      = document.getElementById('searchForm');
const idInput   = document.getElementById('idInput');
const typeInput = document.getElementById('typeInput');
const abInput   = document.getElementById('abInput');
const resultsEl = document.getElementById('results');
const spinnerEl = document.getElementById('spinner');
const noticeEl  = document.getElementById('notice');

form.addEventListener('submit', onSearch);
initFromURL();

async function onSearch(e){
  e.preventDefault();
  resultsEl.innerHTML = ""; noticeEl.textContent = "";
  const id = idInput.value.trim();
  const type = typeInput.value.trim().toLowerCase();
  const ability = abInput.value.trim().toLowerCase();
  if (!id && !type && !ability) { noticeEl.textContent = "Enter at least one search field."; return; }
  saveLastCriteria({ id, type, ability });
  toggleSpinner(true);
  try {
    let pokemonList = [];
    if (id) {
      if (me) {
        const r = await fetch(API + `/pokemon/${encodeURIComponent(id)}`, { credentials:"include" });
        if (r.ok) pokemonList = [await r.json()];
      } else {
        const p = await fetchPokemonPublic(id);
        pokemonList = p ? [p] : [];
      }
    } else if (type || ability) {
      const group = type ? ['type', type] : ['ability', ability];
      pokemonList = await fetchByGroupPublic(group[0], group[1]);
    }
    if (!pokemonList.length) noticeEl.textContent = "No results."; else renderCards(pokemonList);
  } catch (err) { console.error(err); noticeEl.textContent = "Search error. Try again."; }
  finally { toggleSpinner(false); }
}

async function fetchPokemonPublic(idOrName){
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${idOrName}`);
  if (!res.ok) return null; const data = await res.json();
  return normalizePokemon(data);
}
async function fetchByGroupPublic(group, value){
  const res = await fetch(`https://pokeapi.co/api/v2/${group}/${value}`);
  if (!res.ok) return []; const data = await res.json();
  const list = data.pokemon || data.pokemon_species || data.pokemon;
  const first30 = list.slice(0,30).map(p => p.pokemon?.name || p.name);
  const detailed = await Promise.all(first30.map(fetchPokemonPublic));
  return detailed.filter(Boolean);
}
function normalizePokemon(raw){
  return {
    id:String(raw.id), name:raw.name,
    image: raw.sprites?.front_default || '',
    types:(raw.types||[]).map(t=>t.type.name),
    stats: {
      hp: raw.stats?.find(s=>s.stat.name==='hp')?.base_stat ?? 0,
      attack: raw.stats?.find(s=>s.stat.name==='attack')?.base_stat ?? 0,
      defense: raw.stats?.find(s=>s.stat.name==='defense')?.base_stat ?? 0,
      speed: raw.stats?.find(s=>s.stat.name==='speed')?.base_stat ?? 0,
      specialAttack: raw.stats?.find(s=>s.stat.name==='special-attack')?.base_stat ?? 0,
      specialDefense: raw.stats?.find(s=>s.stat.name==='special-defense')?.base_stat ?? 0
    }
  };
}

function renderCards(list){
  resultsEl.innerHTML = list.map(p => `
    <div class="card">
      <img src="${p.image || ''}" alt="${p.name}">
      <h3>${p.name}</h3>
      <div>${(p.types||[]).map(t=>`<span class="badge">${t}</span>`).join('')}</div>
      <p>#${p.id}</p>
      <button data-id="${p.id}">Add to Favorites</button>
    </div>`).join('');

  resultsEl.querySelectorAll('button').forEach(btn => {
    btn.onclick = async () => {
      if (!me) { alert("Login to save favorites."); return; }
      try {
        const r = await fetch(API + `/users/${me.id}/favorites`, {
          method:"POST", credentials:"include",
          headers:{ "Content-Type":"application/json" },
          body: JSON.stringify({ pokemonId: btn.dataset.id })
        });
        if (!r.ok) { const data = await r.json().catch(()=>({})); alert(data.error || "Failed to add"); return; }
        btn.disabled = true; alert("Added to favorites!");
      } catch { alert("Failed to add"); }
    };
  });
}

function toggleSpinner(show){ spinnerEl.style.display = show ? 'block':'none'; }
function saveLastCriteria(obj){
  const params = new URLSearchParams(obj); params.forEach((v,k)=>!v && params.delete(k));
  history.replaceState(null,'',`${location.pathname}?${params.toString()}`);
}
function initFromURL(){
  const params = new URLSearchParams(location.search);
  if (!params.size) return;
  idInput.value = params.get('id') || '';
  typeInput.value = params.get('type') || '';
  abInput.value = params.get('ability') || '';
  form.dispatchEvent(new Event('submit'));
}
