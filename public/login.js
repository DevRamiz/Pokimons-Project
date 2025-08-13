import { me, fetchMe, escapeHtml } from './shared.js';
const API = "";
const form = document.getElementById('loginForm');
const msg  = document.getElementById('msg');

form.onsubmit = async (e) => {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(form).entries());
  msg.textContent = "Logging in...";
  try {
    const r = await fetch(API + "/login", { method:"POST", credentials:"include", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) });
    const data = await r.json().catch(()=>({}));
    if (!r.ok) { msg.textContent = data.error || "Invalid credentials"; return; }
    await fetchMe();
    location.href = "index.html";
  } catch { msg.textContent = "Login failed"; }
};
