// server.js — authoritative game server for Global Circles
// Run: npm install && node server.js
// Then open http://localhost:3000

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

app.use(express.static(path.join(__dirname, "public")));

// ── World constants (must match client) ──────────────────────────────────────
const WORLD = { width: 30000, height: 30000 };
const WORLD_CIRCLE = { cx: 15000, cy: 15000, radius: 14000 };
const PLAYER_BASE_SPEED = 220;
const BOMB_FUSE = 10;
const BOMB_MIN_INTERVAL = 90;
const BOMB_MAX_INTERVAL = 150;
const POISON_RADIUS = 2200;
const POISON_DURATION = 18;
const POISON_DAMAGE_PER_SEC = 0.01;
const COIN_PICKUP_RADIUS = 60;
const MAX_COINS = 800;
const RADIUS_SCALE = 6.2;
const MIN_RADIUS = 8;
const AI_VISION_RADIUS = 1800;
const AI_BASE_SPEED = 90;
const AI_FLEE_SPEED_MULT = 1.3;
const AI_STORM_FLEE_SPEED_MULT = 1.6;
const AI_WANDER_STRENGTH = 0.4;

const COUNTRY_DATA = [
  ["Israel","🇮🇱",9.4],["China","🇨🇳",1412],["India","🇮🇳",1428],
  ["United States","🇺🇸",339],["Indonesia","🇮🇩",277],["Pakistan","🇵🇰",240],
  ["Nigeria","🇳🇬",224],["Brazil","🇧🇷",216],["Bangladesh","🇧🇩",173],
  ["Russia","🇷🇺",144],["Mexico","🇲🇽",128],["Japan","🇯🇵",123],
  ["Ethiopia","🇪🇹",126],["Philippines","🇵🇭",117],["Egypt","🇪🇬",112],
  ["DR Congo","🇨🇩",102],["Vietnam","🇻🇳",98],["Iran","🇮🇷",89],
  ["Turkey","🇹🇷",85],["Germany","🇩🇪",84],["Thailand","🇹🇭",72],
  ["United Kingdom","🇬🇧",67],["Tanzania","🇹🇿",67],["France","🇫🇷",65],
  ["South Africa","🇿🇦",60],["Italy","🇮🇹",59],["Kenya","🇰🇪",55],
  ["Myanmar","🇲🇲",54],["Colombia","🇨🇴",52],["South Korea","🇰🇷",52],
  ["Sudan","🇸🇩",49],["Uganda","🇺🇬",49],["Spain","🇪🇸",48],
  ["Argentina","🇦🇷",46],["Algeria","🇩🇿",45],["Iraq","🇮🇶",45],
  ["Afghanistan","🇦🇫",42],["Yemen","🇾🇪",34],["Canada","🇨🇦",38],
  ["Poland","🇵🇱",37],["Morocco","🇲🇦",37],["Angola","🇦🇴",36],
  ["Uzbekistan","🇺🇿",35],["Ukraine","🇺🇦",36],["Saudi Arabia","🇸🇦",36],
  ["Peru","🇵🇪",34],["Malaysia","🇲🇾",34],["Mozambique","🇲🇿",33],
  ["Ghana","🇬🇭",33],["Venezuela","🇻🇪",28],["Madagascar","🇲🇬",30],
  ["Nepal","🇳🇵",30],["Ivory Coast","🇨🇮",28],["Cameroon","🇨🇲",28],
  ["North Korea","🇰🇵",26],["Niger","🇳🇪",26],["Australia","🇦🇺",26],
  ["Mali","🇲🇱",23],["Burkina Faso","🇧🇫",23],["Syria","🇸🇾",23],
  ["Sri Lanka","🇱🇰",22],["Malawi","🇲🇼",20],["Chad","🇹🇩",19],
  ["Kazakhstan","🇰🇿",20],["Zambia","🇿🇲",20],["Chile","🇨🇱",19.6],
  ["Romania","🇷🇴",19],["Somalia","🇸🇴",18],["Senegal","🇸🇳",18],
  ["Netherlands","🇳🇱",17.7],["Guatemala","🇬🇹",18],["Ecuador","🇪🇨",18],
  ["Zimbabwe","🇿🇼",16],["Cambodia","🇰🇭",17],["Guinea","🇬🇳",14],
  ["Rwanda","🇷🇼",14],["Benin","🇧🇯",13],["Burundi","🇧🇮",13],
  ["Tunisia","🇹🇳",12.4],["Bolivia","🇧🇴",12.2],["Belgium","🇧🇪",11.7],
  ["Haiti","🇭🇹",11.5],["Cuba","🇨🇺",11.2],["South Sudan","🇸🇸",11],
  ["Dominican Republic","🇩🇴",11.3],["Czech Republic","🇨🇿",10.5],
  ["Greece","🇬🇷",10.4],["Jordan","🇯🇴",11.3],["Portugal","🇵🇹",10.3],
  ["Azerbaijan","🇦🇿",10.4],["Sweden","🇸🇪",10.5],["Honduras","🇭🇳",10.6],
  ["United Arab Emirates","🇦🇪",9.5],["Hungary","🇭🇺",9.6],
  ["Tajikistan","🇹🇯",10],["Belarus","🇧🇾",9.5],["Austria","🇦🇹",9],
  ["Papua New Guinea","🇵🇬",10.3],["Switzerland","🇨🇭",8.8],
  ["Togo","🇹🇬",8.8],["Sierra Leone","🇸🇱",8.4],["Laos","🇱🇦",7.7],
  ["Paraguay","🇵🇾",6.8],["Bulgaria","🇧🇬",6.7],["Libya","🇱🇾",6.9],
  ["Lebanon","🇱🇧",5.5],["Nicaragua","🇳🇮",6.9],["Kyrgyzstan","🇰🇬",7],
  ["Serbia","🇷🇸",6.8],["Turkmenistan","🇹🇲",6.5],["Singapore","🇸🇬",6],
  ["Denmark","🇩🇰",5.9],["Finland","🇫🇮",5.5],["Congo","🇨🇬",6],
  ["Slovakia","🇸🇰",5.4],["Norway","🇳🇴",5.5],["Oman","🇴🇲",4.6],
  ["State of Palestine","🇵🇸",5.4],["Costa Rica","🇨🇷",5.2],
  ["Liberia","🇱🇷",5.4],["Ireland","🇮🇪",5.1],["New Zealand","🇳🇿",5.2],
  ["Central African Republic","🇨🇫",5.7],["Mauritania","🇲🇷",4.9],
  ["Panama","🇵🇦",4.5],["Kuwait","🇰🇼",4.3],["Croatia","🇭🇷",3.9],
  ["Moldova","🇲🇩",3.4],["Georgia","🇬🇪",3.7],["Eritrea","🇪🇷",3.6],
  ["Uruguay","🇺🇾",3.4],["Mongolia","🇲🇳",3.4],
  ["Bosnia and Herzegovina","🇧🇦",3.2],["Armenia","🇦🇲",3],
  ["Jamaica","🇯🇲",2.8],["Albania","🇦🇱",2.8],["Qatar","🇶🇦",2.7],
  ["Lithuania","🇱🇹",2.7],["Namibia","🇳🇦",2.6],["Gambia","🇬🇲",2.7],
  ["Botswana","🇧🇼",2.5],["Gabon","🇬🇦",2.4],["Lesotho","🇱🇸",2.3],
  ["North Macedonia","🇲🇰",2.1],["Slovenia","🇸🇮",2.1],
  ["Guinea-Bissau","🇬🇼",2.1],["Latvia","🇱🇻",1.8],["Bahrain","🇧🇭",1.5],
  ["Equatorial Guinea","🇬🇶",1.7],["Trinidad and Tobago","🇹🇹",1.5],
  ["Timor-Leste","🇹🇱",1.4],["Estonia","🇪🇪",1.3],["Mauritius","🇲🇺",1.3],
  ["Eswatini","🇸🇿",1.2],["Djibouti","🇩🇯",1.1],["Fiji","🇫🇯",0.9],
  ["Cyprus","🇨🇾",1.3],["Comoros","🇰🇲",0.9],["Bhutan","🇧🇹",0.8],
  ["Guyana","🇬🇾",0.8],["Solomon Islands","🇸🇧",0.7],["Luxembourg","🇱🇺",0.7],
  ["Montenegro","🇲🇪",0.6],["Suriname","🇸🇷",0.6],["Cabo Verde","🇨🇻",0.6],
  ["Malta","🇲🇹",0.5],["Brunei","🇧🇳",0.4],["Belize","🇧🇿",0.4],
  ["Bahamas","🇧🇸",0.4],["Maldives","🇲🇻",0.5],["Iceland","🇮🇸",0.4],
  ["Vanuatu","🇻🇺",0.3],["Barbados","🇧🇧",0.3],["Samoa","🇼🇸",0.2],
  ["São Tomé and Príncipe","🇸🇹",0.2],["Saint Lucia","🇱🇨",0.2],
  ["Kiribati","🇰🇮",0.13],["Grenada","🇬🇩",0.13],["Micronesia","🇫🇲",0.11],
  ["Tonga","🇹🇴",0.1],["Seychelles","🇸🇨",0.1],
  ["Antigua and Barbuda","🇦🇬",0.1],["Andorra","🇦🇩",0.08],
  ["Dominica","🇩🇲",0.07],["Marshall Islands","🇲🇭",0.04],
  ["Saint Kitts and Nevis","🇰🇳",0.05],["Monaco","🇲🇨",0.04],
  ["Liechtenstein","🇱🇮",0.04],["San Marino","🇸🇲",0.03],
  ["Palau","🇵🇼",0.02],["Tuvalu","🇹🇻",0.01],["Nauru","🇳🇷",0.01],
  ["Vatican City","🇻🇦",0.0008]
];

const COUNTRY_GDP = {
  "United States":25.5,"China":17.7,"Japan":4.2,"Germany":4.1,"India":3.4,
  "United Kingdom":3.1,"France":2.9,"Canada":2.1,"Russia":2.1,"Italy":2.0,
  "South Korea":1.7,"Australia":1.7,"Brazil":1.9,"Spain":1.4,"Mexico":1.3,
  "Indonesia":1.3,"Netherlands":1.0,"Saudi Arabia":1.1,"Switzerland":0.8,
  "Argentina":0.6,"Sweden":0.6,"Poland":0.7,"Belgium":0.6,"Norway":0.6,
  "Israel":0.52,"Austria":0.47,"Ireland":0.5,"Denmark":0.4,"South Africa":0.4,
  "Malaysia":0.4,"Thailand":0.5,"Philippines":0.4,"Vietnam":0.4,
  "Bangladesh":0.46,"Egypt":0.4,"Nigeria":0.48,"Turkey":0.9,"Ukraine":0.16,
  "Pakistan":0.37,"Czech Republic":0.3,"Romania":0.3,"Hungary":0.2,
  "Chile":0.3,"Colombia":0.3,"Finland":0.28,"Portugal":0.25,"Greece":0.22,
};

function gdpCoinRate(name) {
  const gdp = COUNTRY_GDP[name] || 0.01;
  return Math.max(0.1, Math.min(8, Math.sqrt(gdp) * 1.6));
}

function popToRadius(pop) {
  return Math.max(MIN_RADIUS, Math.sqrt(pop) * RADIUS_SCALE);
}

function spawnPos() {
  const margin = 300;
  const maxR = WORLD_CIRCLE.radius - margin;
  const angle = Math.random() * Math.PI * 2;
  const r = Math.sqrt(Math.random()) * maxR;
  return { x: WORLD_CIRCLE.cx + Math.cos(angle) * r, y: WORLD_CIRCLE.cy + Math.sin(angle) * r };
}

// ── Game state ────────────────────────────────────────────────────────────────
let gameRunning = false;
let gameClock = 0;
let nextBombAt = 0;

// entities keyed by id
const entities = {};   // id -> entity obj (players + AI)
const coins = [];
const coinTimers = {};
const bombs = [];
const poisonZones = [];
const playerSockets = {}; // socketId -> entityId
const playerCoins = {};   // entityId -> coin count
const playerBoosts = {};  // entityId -> { speedMult, sizeMult }

// taken country names (for AI + players)
const takenNames = new Set();

function makeAI(name, flag, pop) {
  const pos = spawnPos();
  const id = "ai_" + name.replace(/\s+/g, "_");
  entities[id] = {
    id, name, flag, population: pop,
    radius: popToRadius(pop), targetRadius: popToRadius(pop),
    targetPopulation: pop,
    x: pos.x, y: pos.y, vx: 0, vy: 0,
    alive: true, isPlayer: false,
    state: "idle", wanderAngle: Math.random() * Math.PI * 2
  };
}

function initWorld() {
  // clear everything
  Object.keys(entities).forEach(k => delete entities[k]);
  coins.length = 0;
  bombs.length = 0;
  poisonZones.length = 0;
  Object.keys(coinTimers).forEach(k => delete coinTimers[k]);
  takenNames.clear();

  // Re-add connected players to takenNames
  Object.values(playerSockets).forEach(eid => {
    if (entities[eid]) takenNames.add(entities[eid].name);
  });

  // spawn all AI countries except taken names
  for (const [name, flag, pop] of COUNTRY_DATA) {
    if (takenNames.has(name)) continue;
    makeAI(name, flag, pop);
  }

  gameClock = 0;
  nextBombAt = BOMB_MIN_INTERVAL + Math.random() * (BOMB_MAX_INTERVAL - BOMB_MIN_INTERVAL);
  gameRunning = true;
}

function scheduleNextBomb() {
  nextBombAt = gameClock + BOMB_MIN_INTERVAL + Math.random() * (BOMB_MAX_INTERVAL - BOMB_MIN_INTERVAL);
}

// ── AI logic ──────────────────────────────────────────────────────────────────
function updateEntityAI(self, dt) {
  // storm flee
  if (poisonZones.length) {
    let inside = null, bestDist = Infinity;
    for (const zone of poisonZones) {
      const dx = self.x - zone.x, dy = self.y - zone.y;
      const d = Math.sqrt(dx*dx+dy*dy);
      if (d < zone.radius + 150 && d < bestDist) { bestDist = d; inside = {zone,dx,dy,d}; }
    }
    if (inside) {
      self.state = "fleeing-storm";
      let dirX = inside.d > 0.001 ? inside.dx/inside.d : Math.cos(Math.random()*Math.PI*2);
      let dirY = inside.d > 0.001 ? inside.dy/inside.d : Math.sin(Math.random()*Math.PI*2);
      const speed = AI_BASE_SPEED * AI_STORM_FLEE_SPEED_MULT;
      self.vx = dirX * speed; self.vy = dirY * speed;
      return;
    }
  }

  let nearestThreat = null, nearestThreatDist = Infinity;
  let nearestPrey = null, nearestPreyDist = Infinity;

  for (const other of Object.values(entities)) {
    if (other === self || !other.alive) continue;
    const dx = other.x - self.x, dy = other.y - self.y;
    const d = Math.sqrt(dx*dx+dy*dy);
    if (d > AI_VISION_RADIUS) continue;
    if (other.radius > self.radius * 1.05 && d < nearestThreatDist) { nearestThreatDist = d; nearestThreat = other; }
    else if (other.radius < self.radius * 0.95 && d < nearestPreyDist) { nearestPreyDist = d; nearestPrey = other; }
  }

  let dirX = 0, dirY = 0, speed = AI_BASE_SPEED;
  if (nearestThreat) {
    self.state = "fleeing";
    dirX = self.x - nearestThreat.x; dirY = self.y - nearestThreat.y;
    speed = AI_BASE_SPEED * AI_FLEE_SPEED_MULT;
  } else if (nearestPrey) {
    self.state = "aggressive";
    dirX = nearestPrey.x - self.x; dirY = nearestPrey.y - self.y;
  } else {
    self.state = "idle";
    self.wanderAngle += (Math.random() - 0.5) * AI_WANDER_STRENGTH;
    dirX = Math.cos(self.wanderAngle); dirY = Math.sin(self.wanderAngle);
    speed = AI_BASE_SPEED * 0.5;
  }
  const len = Math.sqrt(dirX*dirX+dirY*dirY);
  if (len > 0.001) { dirX /= len; dirY /= len; }
  dirX += (Math.random()-0.5)*0.15; dirY += (Math.random()-0.5)*0.15;
  self.vx = dirX * speed; self.vy = dirY * speed;
}

function moveEntity(e, dt) {
  e.x += e.vx * dt; e.y += e.vy * dt;
  const dx = e.x - WORLD_CIRCLE.cx, dy = e.y - WORLD_CIRCLE.cy;
  const dist = Math.sqrt(dx*dx+dy*dy);
  const maxDist = WORLD_CIRCLE.radius - e.radius;
  if (maxDist > 0 && dist > maxDist) {
    const scale = maxDist / dist;
    e.x = WORLD_CIRCLE.cx + dx * scale;
    e.y = WORLD_CIRCLE.cy + dy * scale;
  }
  // grow toward target
  if (Math.abs(e.radius - e.targetRadius) > 0.05)
    e.radius += (e.targetRadius - e.radius) * 0.08;
  else e.radius = e.targetRadius;
  if (Math.abs(e.population - e.targetPopulation) > 0.001)
    e.population += (e.targetPopulation - e.population) * 0.08;
  else e.population = e.targetPopulation;
}

// ── Main server tick ──────────────────────────────────────────────────────────
const TICK_RATE = 30; // hz
const TICK_MS = 1000 / TICK_RATE;
let lastTick = Date.now();

function tick() {
  if (!gameRunning) return;
  const now = Date.now();
  const dt = Math.min(0.1, (now - lastTick) / 1000);
  lastTick = now;
  gameClock += dt;

  // -- AI movement --
  for (const e of Object.values(entities)) {
    if (!e.alive) continue;
    if (!e.isPlayer) updateEntityAI(e, dt);
    moveEntity(e, dt);
  }

  // -- collisions --
  const alive = Object.values(entities).filter(e => e.alive);
  for (let i = 0; i < alive.length; i++) {
    const a = alive[i];
    if (!a.alive) continue;
    for (let j = 0; j < alive.length; j++) {
      if (i === j) continue;
      const b = alive[j];
      if (!b.alive) continue;
      const boostA = a.isPlayer && playerBoosts[a.id] ? playerBoosts[a.id].sizeMult : 1;
      const boostB = b.isPlayer && playerBoosts[b.id] ? playerBoosts[b.id].sizeMult : 1;
      const aEffR = a.radius * boostA;
      const bEffR = b.radius * boostB;
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.sqrt(dx*dx+dy*dy);
      if (dist < aEffR + bEffR * 0.6 && aEffR > bEffR) {
        // a absorbs b
        a.targetPopulation = a.population + b.population;
        a.targetRadius = popToRadius(a.targetPopulation);
        b.alive = false;
        // if b was a player, notify them
        if (b.isPlayer) {
          const sock = io.sockets.sockets.get(b.id);
          if (sock) sock.emit("eliminated", { by: a.name });
        }
        io.emit("entityDied", { id: b.id, absorbedBy: a.id });
        if (b.id.startsWith("ai_")) takenNames.delete(b.name);
      }
    }
  }

  // prune dead
  for (const [id, e] of Object.entries(entities)) {
    if (!e.alive) delete entities[id];
  }

  // -- bombs --
  if (gameClock >= nextBombAt) {
    const pos = spawnPos();
    bombs.push({ x: pos.x, y: pos.y, placedAt: gameClock, id: "bomb_" + gameClock.toFixed(2) });
    scheduleNextBomb();
    io.emit("bombSpawned", bombs[bombs.length - 1]);
  }

  for (let i = bombs.length - 1; i >= 0; i--) {
    const bomb = bombs[i];
    if (gameClock - bomb.placedAt >= BOMB_FUSE) {
      const zone = { x: bomb.x, y: bomb.y, radius: POISON_RADIUS, expiresAt: gameClock + POISON_DURATION };
      poisonZones.push(zone);
      io.emit("bombExploded", { bombId: bomb.id, zone });
      bombs.splice(i, 1);
    }
  }

  // prune expired poison zones
  for (let i = poisonZones.length - 1; i >= 0; i--) {
    if (poisonZones[i].expiresAt <= gameClock) {
      io.emit("poisonExpired", { index: i });
      poisonZones.splice(i, 1);
    }
  }

  // -- poison damage --
  for (const e of Object.values(entities)) {
    if (!e.alive) continue;
    for (const zone of poisonZones) {
      const dx = e.x - zone.x, dy = e.y - zone.y;
      if (Math.sqrt(dx*dx+dy*dy) < zone.radius) {
        const fraction = POISON_DAMAGE_PER_SEC * dt;
        e.population = Math.max(0.001, e.population * (1 - fraction));
        e.targetPopulation = e.population;
        e.targetRadius = popToRadius(e.population);
        if (e.population <= 0.0015) {
          e.alive = false;
          io.emit("entityDied", { id: e.id, absorbedBy: "poison" });
          if (e.isPlayer) {
            const sock = io.sockets.sockets.get(e.id);
            if (sock) sock.emit("eliminated", { by: "the toxic zone" });
          }
        }
        break;
      }
    }
  }

  // -- coins (only for players) --
  for (const [socketId, eid] of Object.entries(playerSockets)) {
    const e = entities[eid];
    if (!e || !e.alive) continue;
    if (!coinTimers[eid]) coinTimers[eid] = 0;
    coinTimers[eid] += dt;
    const rate = gdpCoinRate(e.name);
    const interval = 1 / rate;
    while (coinTimers[eid] >= interval && coins.length < MAX_COINS) {
      coinTimers[eid] -= interval;
      const jitter = e.radius * 0.8;
      coins.push({
        id: "c" + Math.random().toString(36).slice(2),
        x: e.x + (Math.random()-0.5)*jitter,
        y: e.y + (Math.random()-0.5)*jitter,
        vx: (Math.random()-0.5)*30, vy: (Math.random()-0.5)*30,
        life: 6 + Math.random()*4, value: 1
      });
    }
  }
  // update coins
  for (let i = coins.length - 1; i >= 0; i--) {
    const c = coins[i];
    c.x += c.vx * dt; c.y += c.vy * dt;
    c.vx *= (1 - 2*dt); c.vy *= (1 - 2*dt);
    c.life -= dt;
    if (c.life <= 0) { coins.splice(i, 1); continue; }
    // check if any player picks it up
    for (const [sid, eid] of Object.entries(playerSockets)) {
      const e = entities[eid];
      if (!e || !e.alive) continue;
      const sizeMult = playerBoosts[eid] ? playerBoosts[eid].sizeMult : 1;
      const pr = COIN_PICKUP_RADIUS + e.radius * sizeMult * 0.5;
      const dx = c.x - e.x, dy = c.y - e.y;
      if (dx*dx + dy*dy < pr*pr) {
        playerCoins[eid] = (playerCoins[eid] || 0) + c.value;
        io.sockets.sockets.get(sid)?.emit("coinCollected", { coins: playerCoins[eid] });
        coins.splice(i, 1);
        break;
      }
    }
  }

  // -- broadcast state --
  const stateSnapshot = {
    entities: Object.values(entities).map(e => ({
      id: e.id, name: e.name, flag: e.flag,
      x: Math.round(e.x), y: Math.round(e.y),
      radius: Math.round(e.radius * 10) / 10,
      population: Math.round(e.population * 10) / 10,
      isPlayer: e.isPlayer, alive: e.alive
    })),
    coins: coins.map(c => ({ id: c.id, x: Math.round(c.x), y: Math.round(c.y), life: Math.round(c.life*10)/10 })),
    gameClock: Math.round(gameClock * 10) / 10,
    bombs: bombs.map(b => ({ id: b.id, x: b.x, y: b.y, placedAt: b.placedAt })),
    poisonZones: poisonZones.map(z => ({ x: z.x, y: z.y, radius: z.radius, expiresAt: z.expiresAt }))
  };
  io.emit("state", stateSnapshot);
}

setInterval(tick, TICK_MS);

// ── Socket.io events ──────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Send the list of taken names and country data so client can show picker
  socket.emit("lobbyInfo", {
    countryData: COUNTRY_DATA.map(([name, flag, pop]) => ({ name, flag, pop })),
    takenNames: [...takenNames]
  });

  socket.on("joinGame", ({ countryName }) => {
    const found = COUNTRY_DATA.find(([n]) => n === countryName);
    if (!found) return socket.emit("joinError", "Country not found");
    if (takenNames.has(countryName)) return socket.emit("joinError", "Country already taken");

    const [name, flag, pop] = found;
    takenNames.add(name);

    // Remove the AI for this country if it exists
    const aiId = "ai_" + name.replace(/\s+/g, "_");
    if (entities[aiId]) delete entities[aiId];

    const pos = spawnPos();
    entities[socket.id] = {
      id: socket.id, name, flag, population: pop,
      radius: popToRadius(pop), targetRadius: popToRadius(pop),
      targetPopulation: pop, x: pos.x, y: pos.y, vx: 0, vy: 0,
      alive: true, isPlayer: true, state: "idle", wanderAngle: 0
    };

    playerSockets[socket.id] = socket.id;
    playerCoins[socket.id] = 0;
    playerBoosts[socket.id] = { speedMult: 1.0, sizeMult: 1.0 };

    if (!gameRunning) initWorld();

    socket.emit("joined", {
      entityId: socket.id,
      x: pos.x, y: pos.y,
      name, flag, pop,
      coins: 0
    });

    console.log(`${name} joined as player`);
    io.emit("lobbyRefresh", { takenNames: [...takenNames] });
  });

  socket.on("input", ({ vx, vy }) => {
    const eid = playerSockets[socket.id];
    const e = entities[eid];
    if (!e || !e.alive) return;
    const boost = playerBoosts[eid]?.speedMult || 1;
    const speed = PLAYER_BASE_SPEED * boost;
    const len = Math.sqrt(vx*vx + vy*vy);
    if (len > 0.01) { e.vx = (vx/len)*speed; e.vy = (vy/len)*speed; }
    else { e.vx = 0; e.vy = 0; }
  });

  socket.on("buyBoost", ({ type }) => {
    const eid = playerSockets[socket.id];
    if (!eid) return;
    const boosts = playerBoosts[eid];
    const coins = playerCoins[eid] || 0;

    const SPEED_COST_BASE = 50;
    const SIZE_COST_BASE = 80;
    const COST_MULT = 1.6;

    if (type === "speed") {
      const level = Math.round((boosts.speedMult - 1.0) / 0.1);
      const cost = Math.round(SPEED_COST_BASE * Math.pow(COST_MULT, level));
      if (coins >= cost) {
        playerCoins[eid] -= cost;
        boosts.speedMult = Math.round((boosts.speedMult + 0.1) * 100) / 100;
        socket.emit("boostUpdate", { boosts, coins: playerCoins[eid] });
      }
    } else if (type === "size") {
      const level = Math.round((boosts.sizeMult - 1.0) / 0.1);
      const cost = Math.round(SIZE_COST_BASE * Math.pow(COST_MULT, level));
      if (coins >= cost) {
        playerCoins[eid] -= cost;
        boosts.sizeMult = Math.round((boosts.sizeMult + 0.1) * 100) / 100;
        const e = entities[eid];
        if (e) e.targetRadius = popToRadius(e.population) * boosts.sizeMult;
        socket.emit("boostUpdate", { boosts, coins: playerCoins[eid] });
      }
    } else if (type === "pop") {
      if (coins >= 120) {
        playerCoins[eid] -= 120;
        const e = entities[eid];
        if (e) {
          e.targetPopulation = e.population * 1.10;
          e.targetRadius = popToRadius(e.targetPopulation) * boosts.sizeMult;
        }
        socket.emit("boostUpdate", { boosts, coins: playerCoins[eid] });
      }
    }
  });

  socket.on("requestLobbyInfo", () => {
    socket.emit("lobbyInfo", {
      countryData: COUNTRY_DATA.map(([name, flag, pop]) => ({ name, flag, pop })),
      takenNames: [...takenNames]
    });
  });

  socket.on("disconnect", () => {
    const eid = playerSockets[socket.id];
    if (eid) {
      const e = entities[eid];
      if (e) {
        takenNames.delete(e.name);
        delete entities[eid];
        io.emit("entityDied", { id: eid, absorbedBy: "disconnect" });
      }
      delete playerSockets[socket.id];
      delete playerCoins[socket.id];
      delete playerBoosts[socket.id];
      delete coinTimers[socket.id];
      io.emit("lobbyRefresh", { takenNames: [...takenNames] });
    }
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`Global Circles running at http://localhost:${PORT}`));
