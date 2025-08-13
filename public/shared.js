const API = "";
const userBox = document.getElementById('userBox');
const loginLink = document.getElementById('loginLink');
const registerLink = document.getElementById('registerLink');

export let me = null;

export async function fetchMe() {
  try { const r = await fetch(API + "/me", { credentials:"include" }); const { user } = await r.json(); me = user; }
  catch { me = null; }
  renderUserBox();
}

export function renderUserBox() {
  if (me) {
    if (loginLink) loginLink.style.display = 'none';
    if (registerLink) registerLink.style.display = 'none';
    userBox.innerHTML = `Hello, <b>${escapeHtml(me.firstName)}</b> <button id="logoutBtn">Logout</button>`;
    const btn = document.getElementById('logoutBtn');
    if (btn) btn.onclick = async () => {
      await fetch(API + "/logout", { method:"POST", credentials:"include" });
      me = null; renderUserBox();
    };
  } else {
    if (loginLink) loginLink.style.display = '';
    if (registerLink) registerLink.style.display = '';
    userBox.innerHTML = ``;
  }
}

export function escapeHtml(s){ return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;"); }

// Initialize on import
await fetchMe();
