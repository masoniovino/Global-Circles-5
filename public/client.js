// client.js — multiplayer client for Global Circles
// Connects to server via Socket.io, renders authoritative state.

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const minimap = document.getElementById("minimap");
const mctx = minimap.getContext("2d");

const WORLD = { width: 30000, height: 30000 };
const WORLD_CIRCLE = { cx: 15000, cy: 15000, radius: 14000 };
const GRID_SIZE = 250;
const PLAYER_BASE_SPEED = 220;
const BOMB_FUSE = 10;
const POISON_RADIUS = 2200;

// ── State ────────────────────────────────────────────────────────────────────
let myEntityId = null;
let myName = "", myFlag = "", myCoins = 0;
let serverEntities = {};   // id -> entity data from server
let serverCoins = [];
let serverBombs = [];
let serverPoison = [];
let gameClock = 0;
let particles = [];
let bgColorsOn = true;
let paused = false;
let inGame = false;
let selectedCountry = null;
let camera = null;
let boosts = { speedMult: 1.0, sizeMult: 1.0 };
let speedCost = 50, sizeCost = 80;

const keys = { w: false, a: false, s: false, d: false };
let mouse = { x: 0, y: 0, active: false };

// ── Socket ───────────────────────────────────────────────────────────────────
const socket = io();

// ── Lobby ────────────────────────────────────────────────────────────────────
let lobbyCountries = [];
let takenNames = new Set();

socket.on("lobbyInfo", ({ countryData, takenNames: taken }) => {
  lobbyCountries = countryData;
  takenNames = new Set(taken);
  document.getElementById("players-online").textContent =
    `${taken.length} country${taken.length !== 1 ? "ies" : ""} in use`;
  renderGrid(lobbyCountries);
});

function renderGrid(list) {
  const grid = document.getElementById("country-grid");
  grid.innerHTML = "";
  for (const { name, flag, pop } of list) {
    const card = document.createElement("div");
    card.className = "country-card" + (takenNames.has(name) ? " taken" : "");
    card.dataset.name = name;
    const popStr = pop >= 1000 ? (pop/1000).toFixed(1)+"B" : pop >= 1 ? Math.round(pop)+"M" : Math.round(pop*1000)+"K";
    card.innerHTML = `<div class="flag">${flag}</div><div class="cname">${name}</div><div class="cpop">${popStr}</div>`;
    if (!takenNames.has(name)) {
      card.addEventListener("click", () => selectCountry(name, card));
    }
    grid.appendChild(card);
  }
}

document.getElementById("country-search").addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();
  renderGrid(lobbyCountries.filter(c => c.name.toLowerCase().includes(q)));
});

function selectCountry(name, card) {
  selectedCountry = name;
  document.querySelectorAll(".country-card").forEach(c => c.classList.remove("selected"));
  card.classList.add("selected");
  const btn = document.getElementById("join-btn");
  const found = lobbyCountries.find(c => c.name === name);
  btn.textContent = found ? `Join as ${found.flag} ${name}` : "Join";
  btn.disabled = false;
}

document.getElementById("join-btn").addEventListener("click", () => {
  if (!selectedCountry) return;
  document.getElementById("lobby-error").textContent = "";
  socket.emit("joinGame", { countryName: selectedCountry });
});

socket.on("joinError", (msg) => {
  document.getElementById("lobby-error").textContent = "⚠ " + msg;
  selectedCountry = null;
  document.getElementById("join-btn").disabled = true;
  document.getElementById("join-btn").textContent = "Choose a Country";
});

socket.on("joined", ({ entityId, x, y, name, flag, pop, coins }) => {
  myEntityId = entityId;
  myName = name; myFlag = flag; myCoins = coins;
  boosts = { speedMult: 1.0, sizeMult: 1.0 };
  speedCost = 50; sizeCost = 80;

  resizeCanvas();
  camera = new Camera(canvas.width, canvas.height);
  camera.x = x; camera.y = y;

  preloadFlags();
  ensureAudioStarted();

  document.getElementById("lobby").style.display = "none";
  canvas.style.display = "block";
  document.getElementById("hud").style.display = "block";
  document.getElementById("pausemenu").style.display = "flex";
  minimap.style.display = "block";
  document.getElementById("endscreen").classList.add("hidden");

  inGame = true;
  updateShopButtons();
  requestAnimationFrame(gameLoop);
});

// ── Server state ──────────────────────────────────────────────────────────────
socket.on("state", (snap) => {
  gameClock = snap.gameClock;
  serverBombs = snap.bombs || [];
  serverPoison = snap.poisonZones || [];

  // merge entity data
  const incoming = {};
  for (const e of snap.entities) incoming[e.id] = e;

  // spawn particles for newly-dead
  for (const [id, prev] of Object.entries(serverEntities)) {
    if (prev.alive && incoming[id] && !incoming[id].alive) {
      spawnParticles(prev.x, prev.y, colorForName(prev.name));
    }
    if (prev.alive && !incoming[id]) {
      spawnParticles(prev.x, prev.y, colorForName(prev.name));
    }
  }

  serverEntities = incoming;
  serverCoins = snap.coins || [];
});

socket.on("coinCollected", ({ coins }) => {
  myCoins = coins;
  updateShopButtons();
});

socket.on("boostUpdate", ({ boosts: b, coins }) => {
  boosts = b;
  myCoins = coins;
  speedCost = Math.round(50 * Math.pow(1.6, Math.round((b.speedMult - 1.0) / 0.1)));
  sizeCost  = Math.round(80 * Math.pow(1.6, Math.round((b.sizeMult  - 1.0) / 0.1)));
  updateShopButtons();
});

socket.on("eliminated", ({ by }) => {
  inGame = false;
  const me = serverEntities[myEntityId];
  document.getElementById("end-title").textContent = `${myFlag} ${myName} was eliminated`;
  document.getElementById("end-stats").textContent =
    `Absorbed by ${by}. Coins collected: ${myCoins}`;
  document.getElementById("endscreen").classList.remove("hidden");
});

// ── Input ────────────────────────────────────────────────────────────────────
function sendInput() {
  if (!inGame) return;
  let dirX = 0, dirY = 0;
  if (keys.w || keys.a || keys.s || keys.d) {
    if (keys.w) dirY -= 1;
    if (keys.s) dirY += 1;
    if (keys.a) dirX -= 1;
    if (keys.d) dirX += 1;
  } else if (mouse.active) {
    dirX = mouse.x - camera.viewWidth / 2;
    dirY = mouse.y - camera.viewHeight / 2;
  }
  socket.emit("input", { vx: dirX, vy: dirY });
}
setInterval(sendInput, 33); // ~30hz input

canvas.addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; });
canvas.addEventListener("mouseleave", () => { mouse.active = false; });
window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (k in keys) { keys[k] = true; mouse.active = false; }
  if (k === "p") togglePause();
});
window.addEventListener("keyup", (e) => {
  const k = e.key.toLowerCase();
  if (k in keys) keys[k] = false;
});

// ── Canvas / camera ──────────────────────────────────────────────────────────
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  if (camera) camera.resize(canvas.width, canvas.height);
  minimap.width = 180; minimap.height = 180;
}
window.addEventListener("resize", resizeCanvas);

// ── Audio ────────────────────────────────────────────────────────────────────
let audioStarted = false;
function ensureAudioStarted() {
  if (audioStarted) return;
  audioStarted = true;
  SoundManager.init();
  SoundManager.ensureContext();
  SoundManager.setMusicOn(document.getElementById("music-toggle").checked);
  SoundManager.setMusicVolume(parseFloat(document.getElementById("music-volume").value));
  SoundManager.setSfxVolume(parseFloat(document.getElementById("sfx-volume").value));
  SoundManager.startMusic();
}
window.addEventListener("keydown", ensureAudioStarted, { once: true });
window.addEventListener("mousedown", ensureAudioStarted, { once: true });

// ── Pause ────────────────────────────────────────────────────────────────────
const pauseToggleBtn = document.getElementById("pause-toggle");
const pausePanel = document.getElementById("pause-panel");

function togglePause() {
  paused = !paused;
  pauseToggleBtn.textContent = paused ? "▶ Resume" : "⏸ Pause";
  SoundManager.setPaused(paused);
}
pauseToggleBtn.addEventListener("click", () => { togglePause(); pausePanel.classList.toggle("hidden"); ensureAudioStarted(); });
document.getElementById("music-toggle").addEventListener("change", (e) => SoundManager.setMusicOn(e.target.checked));
document.getElementById("music-volume").addEventListener("input", (e) => SoundManager.setMusicVolume(parseFloat(e.target.value)));
document.getElementById("sfx-volume").addEventListener("input", (e) => SoundManager.setSfxVolume(parseFloat(e.target.value)));
document.getElementById("bg-toggle").addEventListener("change", (e) => { bgColorsOn = e.target.checked; });

// ── Shop ─────────────────────────────────────────────────────────────────────
document.getElementById("buy-speed").addEventListener("click", () => { if (myCoins >= speedCost) socket.emit("buyBoost", { type: "speed" }); });
document.getElementById("buy-size").addEventListener("click",  () => { if (myCoins >= sizeCost)  socket.emit("buyBoost", { type: "size" }); });
document.getElementById("buy-pop").addEventListener("click",   () => { if (myCoins >= 120)        socket.emit("buyBoost", { type: "pop" }); });

function updateShopButtons() {
  document.getElementById("buy-speed").textContent = `${speedCost}🪙`;
  document.getElementById("buy-size").textContent  = `${sizeCost}🪙`;
  document.getElementById("buy-speed").disabled = myCoins < speedCost;
  document.getElementById("buy-size").disabled  = myCoins < sizeCost;
  document.getElementById("buy-pop").disabled   = myCoins < 120;
}

document.getElementById("restart").addEventListener("click", () => {
  document.getElementById("endscreen").classList.add("hidden");
  inGame = false;
  serverEntities = {}; serverCoins = []; serverBombs = []; serverPoison = [];
  myEntityId = null; selectedCountry = null;
  canvas.style.display = "none";
  document.getElementById("hud").style.display = "none";
  document.getElementById("pausemenu").style.display = "none";
  minimap.style.display = "none";
  document.getElementById("join-btn").disabled = true;
  document.getElementById("join-btn").textContent = "Choose a Country";
  document.getElementById("country-search").value = "";
  socket.emit("requestLobbyInfo");
  document.getElementById("lobby").style.display = "flex";
});

socket.on("lobbyRefresh", ({ takenNames: taken }) => {
  takenNames = new Set(taken);
  renderGrid(lobbyCountries.filter(c => {
    const q = document.getElementById("country-search").value.toLowerCase();
    return !q || c.name.toLowerCase().includes(q);
  }));
  document.getElementById("players-online").textContent =
    `${taken.length} country${taken.length !== 1 ? "ies" : ""} in use`;
});

// ── Particles ────────────────────────────────────────────────────────────────
function spawnParticles(x, y, color, count = 14) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 60 + Math.random() * 120;
    particles.push({ x, y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, life: 0.6, maxLife: 0.6, color });
  }
}
function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]; p.x += p.vx*dt; p.y += p.vy*dt; p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }
}
function drawParticles() {
  for (const p of particles) {
    const s = camera.worldToScreen(p.x, p.y);
    ctx.beginPath(); ctx.arc(s.x, s.y, 3*camera.zoom, 0, Math.PI*2);
    ctx.fillStyle = p.color; ctx.globalAlpha = Math.max(0, p.life/p.maxLife);
    ctx.fill(); ctx.globalAlpha = 1;
  }
}

// ── Drawing ──────────────────────────────────────────────────────────────────
function drawGrid() {
  ctx.strokeStyle = "#dde6ee"; ctx.lineWidth = 1;
  const vww = camera.viewWidth / camera.zoom, vwh = camera.viewHeight / camera.zoom;
  const sx = camera.x - vww/2, sy = camera.y - vwh/2;
  const fx = Math.floor(sx/GRID_SIZE)*GRID_SIZE, fy = Math.floor(sy/GRID_SIZE)*GRID_SIZE;
  for (let wx = fx; wx < sx+vww+GRID_SIZE; wx += GRID_SIZE) {
    const s = camera.worldToScreen(wx, 0);
    ctx.beginPath(); ctx.moveTo(s.x, 0); ctx.lineTo(s.x, camera.viewHeight); ctx.stroke();
  }
  for (let wy = fy; wy < sy+vwh+GRID_SIZE; wy += GRID_SIZE) {
    const s = camera.worldToScreen(0, wy);
    ctx.beginPath(); ctx.moveTo(0, s.y); ctx.lineTo(camera.viewWidth, s.y); ctx.stroke();
  }
}

function drawWorld() {
  ctx.fillStyle = bgColorsOn ? "#0b1622" : "#cfcfcf";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const center = camera.worldToScreen(WORLD_CIRCLE.cx, WORLD_CIRCLE.cy);
  const r = WORLD_CIRCLE.radius * camera.zoom;
  ctx.save();
  ctx.beginPath(); ctx.arc(center.x, center.y, r, 0, Math.PI*2); ctx.closePath();
  ctx.fillStyle = bgColorsOn ? "#eef3f7" : "#f5f5f5"; ctx.fill(); ctx.clip();
  if (bgColorsOn) drawGrid();
  ctx.restore();
  ctx.beginPath(); ctx.arc(center.x, center.y, r, 0, Math.PI*2);
  ctx.lineWidth = 4; ctx.strokeStyle = "#b0bec5"; ctx.stroke();
}

function drawCoins() {
  for (const coin of serverCoins) {
    const s = camera.worldToScreen(coin.x, coin.y);
    if (s.x < -20 || s.x > camera.viewWidth+20 || s.y < -20 || s.y > camera.viewHeight+20) continue;
    const alpha = Math.min(1, coin.life / 2);
    const r = 6 * camera.zoom;
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, Math.PI*2);
    ctx.fillStyle = "#FFD700"; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = "#B8860B"; ctx.stroke();
    ctx.fillStyle = "#B8860B";
    ctx.font = `bold ${Math.max(6, r*1.1)}px sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("¢", s.x, s.y + 0.5);
    ctx.restore();
  }
}

function drawEntities() {
  for (const e of Object.values(serverEntities)) {
    if (!e.alive) continue;
    const s = camera.worldToScreen(e.x, e.y);
    const r = e.radius * camera.zoom;
    if (s.x < -r-50 || s.x > camera.viewWidth+r+50 || s.y < -r-50 || s.y > camera.viewHeight+r+50) continue;

    const isMe = e.id === myEntityId;

    ctx.save();
    ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, Math.PI*2); ctx.closePath(); ctx.clip();
    ctx.fillStyle = "#fff";
    ctx.fillRect(s.x-r, s.y-r, r*2, r*2);
    const img = Country._flagCache[e.name];
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, s.x-r, s.y-r, r*2, r*2);
    } else {
      ctx.font = `${r*2.9}px sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(e.flag, s.x, s.y + r*0.08);
    }
    ctx.restore();

    if (isMe) {
      ctx.beginPath(); ctx.arc(s.x, s.y, r+2, 0, Math.PI*2);
      ctx.lineWidth = 5; ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.stroke();
      ctx.beginPath(); ctx.arc(s.x, s.y, r+5, 0, Math.PI*2);
      ctx.lineWidth = 3; ctx.strokeStyle = "rgba(58,123,213,0.8)"; ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, Math.PI*2);
    ctx.lineWidth = isMe ? 3 : 2;
    ctx.strokeStyle = isMe ? "#1a1a2e" : "rgba(0,0,0,0.55)"; ctx.stroke();

    // highlight: name tag above if another player
    if (e.isPlayer && !isMe) {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      const tag = `${e.flag} ${e.name}`;
      const tw = ctx.measureText(tag).width;
      ctx.fillRoundRect?.(s.x - tw/2 - 4, s.y - r - 22, tw + 8, 18, 4);
      ctx.fillStyle = "#fff";
      ctx.fillText(tag, s.x, s.y - r - 9);
    }

    if (r < 7) continue;
    const lsz = Math.max(9, Math.min(18, r*0.34));
    const psz = Math.max(8, Math.min(15, r*0.27));
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const nameY = s.y - psz*0.55, popY = s.y + lsz*0.65;

    function strokeLabel(text, x, y, size) {
      ctx.font = `bold ${size}px sans-serif`;
      ctx.lineWidth = size*0.38; ctx.lineJoin = "round";
      ctx.strokeStyle = "#000"; ctx.strokeText(text, x, y);
      ctx.fillStyle = "#fff"; ctx.fillText(text, x, y);
    }
    const popStr = e.population >= 1000 ? (e.population/1000).toFixed(2)+"B"
                 : e.population >= 1 ? e.population.toFixed(e.population < 10 ? 1 : 0)+"M"
                 : Math.round(e.population*1000)+"K";
    strokeLabel(e.name, s.x, nameY, lsz);
    strokeLabel(popStr, s.x, popY, psz);
  }
}

function drawBombsAndPoison() {
  for (const zone of serverPoison) {
    const s = camera.worldToScreen(zone.x, zone.y);
    const r = zone.radius * camera.zoom;
    const alpha = 0.18 + 0.07 * Math.sin(gameClock*4);
    ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, Math.PI*2);
    ctx.fillStyle = `rgba(118,255,3,${Math.max(0.08,alpha)})`; ctx.fill();
    ctx.strokeStyle = "rgba(76,175,0,0.6)"; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = "rgba(40,80,0,0.8)"; ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center"; ctx.fillText("TOXIC ZONE", s.x, s.y - r*0.4);
  }
  for (const bomb of serverBombs) {
    const s = camera.worldToScreen(bomb.x, bomb.y);
    const elapsed = gameClock - bomb.placedAt;
    const frac = Math.min(1, elapsed / BOMB_FUSE);
    ctx.beginPath(); ctx.arc(s.x, s.y, 16*camera.zoom, 0, Math.PI*2);
    ctx.fillStyle = "#212121"; ctx.fill();
    ctx.beginPath(); ctx.arc(s.x, s.y, 20*camera.zoom, -Math.PI/2, -Math.PI/2+frac*Math.PI*2);
    ctx.strokeStyle = "#ff1744"; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(Math.ceil(BOMB_FUSE - elapsed).toString(), s.x, s.y);
    ctx.beginPath(); ctx.arc(s.x, s.y, POISON_RADIUS*camera.zoom, 0, Math.PI*2);
    ctx.strokeStyle = `rgba(255,23,68,${0.08+0.03*Math.sin(gameClock*6)})`;
    ctx.lineWidth = 2; ctx.stroke();
  }
}

function drawMinimap() {
  mctx.clearRect(0, 0, minimap.width, minimap.height);
  mctx.fillStyle = bgColorsOn ? "#f5f8fb" : "#eee";
  mctx.fillRect(0, 0, minimap.width, minimap.height);
  const sx = minimap.width / WORLD.width, sy = minimap.height / WORLD.height;
  mctx.beginPath(); mctx.arc(WORLD_CIRCLE.cx*sx, WORLD_CIRCLE.cy*sy, WORLD_CIRCLE.radius*sx, 0, Math.PI*2);
  mctx.strokeStyle = "#ccc"; mctx.stroke();
  for (const zone of serverPoison) {
    mctx.beginPath(); mctx.arc(zone.x*sx, zone.y*sy, zone.radius*sx, 0, Math.PI*2);
    mctx.fillStyle = "rgba(118,255,3,0.35)"; mctx.fill();
  }
  for (const bomb of serverBombs) {
    mctx.beginPath(); mctx.arc(bomb.x*sx, bomb.y*sy, 3, 0, Math.PI*2);
    mctx.fillStyle = "#ff1744"; mctx.fill();
  }
  for (const e of Object.values(serverEntities)) {
    if (!e.alive) continue;
    const isMe = e.id === myEntityId;
    mctx.beginPath(); mctx.arc(e.x*sx, e.y*sy, isMe ? 3 : e.isPlayer ? 3 : 2, 0, Math.PI*2);
    mctx.fillStyle = isMe ? "#3a7bd5" : e.isPlayer ? "#f90" : "#999";
    mctx.fill();
  }
  if (camera) {
    const vx = (camera.x - camera.viewWidth/2)*sx, vy = (camera.y - camera.viewHeight/2)*sy;
    const vw = camera.viewWidth*sx, vh = camera.viewHeight*sy;
    mctx.strokeStyle = "#3a7bd5"; mctx.lineWidth = 1; mctx.strokeRect(vx, vy, vw, vh);
  }
}

function updateHUD() {
  const me = serverEntities[myEntityId];
  if (me) {
    document.getElementById("player-name").textContent = `${myFlag} ${myName}`;
    const pop = me.population;
    const popStr = pop >= 1000 ? (pop/1000).toFixed(2)+"B" : pop >= 1 ? pop.toFixed(pop<10?1:0)+"M" : Math.round(pop*1000)+"K";
    document.getElementById("pop").textContent = popStr;
  }
  const playerCount = Object.values(serverEntities).filter(e => e.isPlayer && e.alive).length;
  const totalCount = Object.values(serverEntities).filter(e => e.alive).length;
  document.getElementById("count").textContent = `${playerCount} players / ${totalCount} total`;
  document.getElementById("coins").textContent = myCoins;

  const indicators = [];
  if (boosts.speedMult > 1) indicators.push(`⚡ Speed x${boosts.speedMult.toFixed(1)}`);
  if (boosts.sizeMult  > 1) indicators.push(`🔵 Size x${boosts.sizeMult.toFixed(1)}`);
  document.getElementById("boost-indicators").textContent = indicators.join("  ");
}

// ── Game loop ─────────────────────────────────────────────────────────────────
let lastFrame = performance.now();
function gameLoop(now) {
  const dt = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;

  if (!paused) {
    updateParticles(dt);

    const me = serverEntities[myEntityId];
    if (me && camera) {
      camera.follow(me.x, me.y);
      camera.setZoomForRadius(me.radius);
    }
    if (camera) camera.updateZoom();
  }

  if (camera) {
    drawWorld();
    drawCoins();
    drawEntities();
    drawBombsAndPoison();
    drawParticles();
    drawMinimap();
    updateHUD();
    updateShopButtons();

    if (paused) {
      ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = "#fff"; ctx.font = "bold 32px sans-serif";
      ctx.textAlign = "center"; ctx.fillText("Paused", canvas.width/2, canvas.height/2);
    }
  }

  if (inGame) requestAnimationFrame(gameLoop);
}

socket.on("requestLobbyInfo", () => {}); // server-side only, ignore
// client requests lobby refresh on returning
socket.on("connect", () => {});
