// entities.js
// Country entity: position, population/radius, growth animation, flag-as-background rendering.

const COUNTRY_DATA = [
  ["Israel", "🇮🇱", 9.4],
  ["China", "🇨🇳", 1412],
  ["India", "🇮🇳", 1428],
  ["United States", "🇺🇸", 339],
  ["Indonesia", "🇮🇩", 277],
  ["Pakistan", "🇵🇰", 240],
  ["Nigeria", "🇳🇬", 224],
  ["Brazil", "🇧🇷", 216],
  ["Bangladesh", "🇧🇩", 173],
  ["Russia", "🇷🇺", 144],
  ["Mexico", "🇲🇽", 128],
  ["Japan", "🇯🇵", 123],
  ["Ethiopia", "🇪🇹", 126],
  ["Philippines", "🇵🇭", 117],
  ["Egypt", "🇪🇬", 112],
  ["DR Congo", "🇨🇩", 102],
  ["Vietnam", "🇻🇳", 98],
  ["Iran", "🇮🇷", 89],
  ["Turkey", "🇹🇷", 85],
  ["Germany", "🇩🇪", 84],
  ["Thailand", "🇹🇭", 72],
  ["United Kingdom", "🇬🇧", 67],
  ["Tanzania", "🇹🇿", 67],
  ["France", "🇫🇷", 65],
  ["South Africa", "🇿🇦", 60],
  ["Italy", "🇮🇹", 59],
  ["Kenya", "🇰🇪", 55],
  ["Myanmar", "🇲🇲", 54],
  ["Colombia", "🇨🇴", 52],
  ["South Korea", "🇰🇷", 52],
  ["Sudan", "🇸🇩", 49],
  ["Uganda", "🇺🇬", 49],
  ["Spain", "🇪🇸", 48],
  ["Argentina", "🇦🇷", 46],
  ["Algeria", "🇩🇿", 45],
  ["Iraq", "🇮🇶", 45],
  ["Afghanistan", "🇦🇫", 42],
  ["Yemen", "🇾🇪", 34],
  ["Canada", "🇨🇦", 38],
  ["Poland", "🇵🇱", 37],
  ["Morocco", "🇲🇦", 37],
  ["Angola", "🇦🇴", 36],
  ["Uzbekistan", "🇺🇿", 35],
  ["Ukraine", "🇺🇦", 36],
  ["Saudi Arabia", "🇸🇦", 36],
  ["Peru", "🇵🇪", 34],
  ["Malaysia", "🇲🇾", 34],
  ["Mozambique", "🇲🇿", 33],
  ["Ghana", "🇬🇭", 33],
  ["Venezuela", "🇻🇪", 28],
  ["Madagascar", "🇲🇬", 30],
  ["Nepal", "🇳🇵", 30],
  ["Ivory Coast", "🇨🇮", 28],
  ["Cameroon", "🇨🇲", 28],
  ["North Korea", "🇰🇵", 26],
  ["Niger", "🇳🇪", 26],
  ["Australia", "🇦🇺", 26],
  ["Mali", "🇲🇱", 23],
  ["Burkina Faso", "🇧🇫", 23],
  ["Syria", "🇸🇾", 23],
  ["Sri Lanka", "🇱🇰", 22],
  ["Malawi", "🇲🇼", 20],
  ["Chad", "🇹🇩", 19],
  ["Kazakhstan", "🇰🇿", 20],
  ["Zambia", "🇿🇲", 20],
  ["Chile", "🇨🇱", 19.6],
  ["Romania", "🇷🇴", 19],
  ["Somalia", "🇸🇴", 18],
  ["Senegal", "🇸🇳", 18],
  ["Netherlands", "🇳🇱", 17.7],
  ["Guatemala", "🇬🇹", 18],
  ["Ecuador", "🇪🇨", 18],
  ["Zimbabwe", "🇿🇼", 16],
  ["Cambodia", "🇰🇭", 17],
  ["Guinea", "🇬🇳", 14],
  ["Rwanda", "🇷🇼", 14],
  ["Benin", "🇧🇯", 13],
  ["Burundi", "🇧🇮", 13],
  ["Tunisia", "🇹🇳", 12.4],
  ["Bolivia", "🇧🇴", 12.2],
  ["Belgium", "🇧🇪", 11.7],
  ["Haiti", "🇭🇹", 11.5],
  ["Cuba", "🇨🇺", 11.2],
  ["South Sudan", "🇸🇸", 11],
  ["Dominican Republic", "🇩🇴", 11.3],
  ["Czech Republic", "🇨🇿", 10.5],
  ["Greece", "🇬🇷", 10.4],
  ["Jordan", "🇯🇴", 11.3],
  ["Portugal", "🇵🇹", 10.3],
  ["Azerbaijan", "🇦🇿", 10.4],
  ["Sweden", "🇸🇪", 10.5],
  ["Honduras", "🇭🇳", 10.6],
  ["United Arab Emirates", "🇦🇪", 9.5],
  ["Hungary", "🇭🇺", 9.6],
  ["Tajikistan", "🇹🇯", 10],
  ["Belarus", "🇧🇾", 9.5],
  ["Austria", "🇦🇹", 9],
  ["Papua New Guinea", "🇵🇬", 10.3],
  ["Switzerland", "🇨🇭", 8.8],
  ["Togo", "🇹🇬", 8.8],
  ["Sierra Leone", "🇸🇱", 8.4],
  ["Laos", "🇱🇦", 7.7],
  ["Paraguay", "🇵🇾", 6.8],
  ["Bulgaria", "🇧🇬", 6.7],
  ["Libya", "🇱🇾", 6.9],
  ["Lebanon", "🇱🇧", 5.5],
  ["Nicaragua", "🇳🇮", 6.9],
  ["Kyrgyzstan", "🇰🇬", 7],
  ["Serbia", "🇷🇸", 6.8],
  ["Turkmenistan", "🇹🇲", 6.5],
  ["Singapore", "🇸🇬", 6],
  ["Denmark", "🇩🇰", 5.9],
  ["Finland", "🇫🇮", 5.5],
  ["Congo", "🇨🇬", 6],
  ["Slovakia", "🇸🇰", 5.4],
  ["Norway", "🇳🇴", 5.5],
  ["Oman", "🇴🇲", 4.6],
  ["State of Palestine", "🇵🇸", 5.4],
  ["Costa Rica", "🇨🇷", 5.2],
  ["Liberia", "🇱🇷", 5.4],
  ["Ireland", "🇮🇪", 5.1],
  ["New Zealand", "🇳🇿", 5.2],
  ["Central African Republic", "🇨🇫", 5.7],
  ["Mauritania", "🇲🇷", 4.9],
  ["Panama", "🇵🇦", 4.5],
  ["Kuwait", "🇰🇼", 4.3],
  ["Croatia", "🇭🇷", 3.9],
  ["Moldova", "🇲🇩", 3.4],
  ["Georgia", "🇬🇪", 3.7],
  ["Eritrea", "🇪🇷", 3.6],
  ["Uruguay", "🇺🇾", 3.4],
  ["Mongolia", "🇲🇳", 3.4],
  ["Bosnia and Herzegovina", "🇧🇦", 3.2],
  ["Armenia", "🇦🇲", 3],
  ["Jamaica", "🇯🇲", 2.8],
  ["Albania", "🇦🇱", 2.8],
  ["Qatar", "🇶🇦", 2.7],
  ["Lithuania", "🇱🇹", 2.7],
  ["Namibia", "🇳🇦", 2.6],
  ["Gambia", "🇬🇲", 2.7],
  ["Botswana", "🇧🇼", 2.5],
  ["Gabon", "🇬🇦", 2.4],
  ["Lesotho", "🇱🇸", 2.3],
  ["North Macedonia", "🇲🇰", 2.1],
  ["Slovenia", "🇸🇮", 2.1],
  ["Guinea-Bissau", "🇬🇼", 2.1],
  ["Latvia", "🇱🇻", 1.8],
  ["Bahrain", "🇧🇭", 1.5],
  ["Equatorial Guinea", "🇬🇶", 1.7],
  ["Trinidad and Tobago", "🇹🇹", 1.5],
  ["Timor-Leste", "🇹🇱", 1.4],
  ["Estonia", "🇪🇪", 1.3],
  ["Mauritius", "🇲🇺", 1.3],
  ["Eswatini", "🇸🇿", 1.2],
  ["Djibouti", "🇩🇯", 1.1],
  ["Fiji", "🇫🇯", 0.9],
  ["Cyprus", "🇨🇾", 1.3],
  ["Comoros", "🇰🇲", 0.9],
  ["Bhutan", "🇧🇹", 0.8],
  ["Guyana", "🇬🇾", 0.8],
  ["Solomon Islands", "🇸🇧", 0.7],
  ["Luxembourg", "🇱🇺", 0.7],
  ["Montenegro", "🇲🇪", 0.6],
  ["Suriname", "🇸🇷", 0.6],
  ["Cabo Verde", "🇨🇻", 0.6],
  ["Malta", "🇲🇹", 0.5],
  ["Brunei", "🇧🇳", 0.4],
  ["Belize", "🇧🇿", 0.4],
  ["Bahamas", "🇧🇸", 0.4],
  ["Maldives", "🇲🇻", 0.5],
  ["Iceland", "🇮🇸", 0.4],
  ["Vanuatu", "🇻🇺", 0.3],
  ["Barbados", "🇧🇧", 0.3],
  ["Samoa", "🇼🇸", 0.2],
  ["São Tomé and Príncipe", "🇸🇹", 0.2],
  ["Saint Lucia", "🇱🇨", 0.2],
  ["Kiribati", "🇰🇮", 0.13],
  ["Grenada", "🇬🇩", 0.13],
  ["Micronesia", "🇫🇲", 0.11],
  ["Tonga", "🇹🇴", 0.1],
  ["Seychelles", "🇸🇨", 0.1],
  ["Antigua and Barbuda", "🇦🇬", 0.1],
  ["Andorra", "🇦🇩", 0.08],
  ["Dominica", "🇩🇲", 0.07],
  ["Marshall Islands", "🇲🇭", 0.04],
  ["Saint Kitts and Nevis", "🇰🇳", 0.05],
  ["Monaco", "🇲🇨", 0.04],
  ["Liechtenstein", "🇱🇮", 0.04],
  ["San Marino", "🇸🇲", 0.03],
  ["Palau", "🇵🇼", 0.02],
  ["Tuvalu", "🇹🇻", 0.01],
  ["Nauru", "🇳🇷", 0.01],
  ["Vatican City", "🇻🇦", 0.0008]
];

// radius (in world units) ∝ sqrt(population in millions).
// Slightly smaller overall scale so the map feels less spaced out.
const RADIUS_SCALE = 6.2;
const MIN_RADIUS = 8;

function populationToRadius(popMillions) {
  return Math.max(MIN_RADIUS, Math.sqrt(popMillions) * RADIUS_SCALE);
}

function formatPopulation(popMillions) {
  if (popMillions >= 1000) return (popMillions / 1000).toFixed(2) + "B";
  if (popMillions >= 1) return popMillions.toFixed(popMillions < 10 ? 1 : 0) + "M";
  return Math.round(popMillions * 1000) + "K";
}

// stable-ish pastel color per name, used for particle bursts
function colorForName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 60%)`;
}

class Country {
  constructor(x, y, population, name, flag, isPlayer = false) {
    this.x = x;
    this.y = y;
    this.population = population;       // in millions
    this.radius = populationToRadius(population);
    this.targetRadius = this.radius;
    this.targetPopulation = population;

    this.name = name;
    this.flag = flag;
    this.isPlayer = isPlayer;
    this.alive = true;
    this.color = colorForName(name);

    this.vx = 0;
    this.vy = 0;

    this.state = "idle"; // 'aggressive' | 'fleeing' | 'idle'
    this.wanderAngle = Math.random() * Math.PI * 2;
  }

  // smoothly animate radius & population toward target values
  updateGrowth() {
    if (this.radius < this.targetRadius) {
      const diff = this.targetRadius - this.radius;
      this.radius += diff * 0.08;
      if (diff < 0.05) this.radius = this.targetRadius;
    } else if (this.radius > this.targetRadius) {
      const diff = this.targetRadius - this.radius;
      this.radius += diff * 0.08;
      if (Math.abs(diff) < 0.05) this.radius = this.targetRadius;
    }

    if (this.population !== this.targetPopulation) {
      const diff = this.targetPopulation - this.population;
      this.population += diff * 0.08;
      if (Math.abs(diff) < 0.001) this.population = this.targetPopulation;
    }
  }

  // absorb another country: combine populations, radius ∝ sqrt(population)
  absorb(other) {
    this.targetPopulation = this.population + other.population;
    this.targetRadius = populationToRadius(this.targetPopulation);
    other.alive = false;
  }

  // reduce population by a fraction (0..1) of current population, e.g. poison damage
  takeDamage(fraction) {
    this.population = Math.max(0.001, this.population * (1 - fraction));
    this.targetPopulation = this.population;
    this.targetRadius = populationToRadius(this.population);
    if (this.radius > this.targetRadius * 1.5) {
      // allow visible shrink animation, but don't let radius lag too far behind
      this.radius = Math.max(this.targetRadius, this.radius * (1 - fraction));
    }
    if (this.population <= 0.0015) {
      this.alive = false;
    }
  }

  // move and clamp to the circular world boundary
  move(worldCircle, dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    const dx = this.x - worldCircle.cx;
    const dy = this.y - worldCircle.cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = worldCircle.radius - this.radius;

    if (maxDist > 0 && dist > maxDist) {
      const scale = maxDist / dist;
      this.x = worldCircle.cx + dx * scale;
      this.y = worldCircle.cy + dy * scale;
    }
  }

  // draw using camera world->screen transform.
  // The flag image fills the circle as background; name + population
  // are overlaid with bold white text and thick black stroke (like the reference).
  draw(ctx, camera) {
    const screen = camera.worldToScreen(this.x, this.y);
    const r = this.radius * camera.zoom;

    // skip drawing if far off-screen (perf)
    if (
      screen.x < -r - 50 || screen.x > camera.viewWidth + r + 50 ||
      screen.y < -r - 50 || screen.y > camera.viewHeight + r + 50
    ) {
      return;
    }

    ctx.save();
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // white background fallback
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(screen.x - r, screen.y - r, r * 2, r * 2);

    // draw flag image if loaded, else fall back to emoji
    const img = Country._flagCache[this.name];
    if (img && img.complete && img.naturalWidth > 0) {
      // cover-fit: scale so the image fills the circle's bounding box
      ctx.drawImage(img, screen.x - r, screen.y - r, r * 2, r * 2);
    } else {
      // fallback: large emoji
      const flagSize = r * 2.9;
      ctx.font = `${flagSize}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.flag, screen.x, screen.y + r * 0.08);
    }

    ctx.restore();

    // ---- border / outline ----
    // player gets a bright accent ring; others get a subtle 3-D look
    if (this.isPlayer) {
      // outer glow ring
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, r + 2, 0, Math.PI * 2);
      ctx.lineWidth = 5;
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, r + 5, 0, Math.PI * 2);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(58,123,213,0.8)";
      ctx.stroke();
    }

    // main border (always drawn)
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, r, 0, Math.PI * 2);
    ctx.lineWidth = this.isPlayer ? 3 : 2;
    ctx.strokeStyle = this.isPlayer ? "#1a1a2e" : "rgba(0,0,0,0.55)";
    ctx.stroke();

    // subtle top-highlight arc for a glossy 3-D effect
    ctx.save();
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, r - 1, Math.PI * 1.1, Math.PI * 1.9);
    ctx.lineWidth = r * 0.08;
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.stroke();
    ctx.restore();

    // ---- text labels: bold white fill + thick black stroke (like reference image) ----
    if (r < 7) return; // too tiny to label

    const labelSize = Math.max(9, Math.min(18, r * 0.34));
    const popSize   = Math.max(8, Math.min(15, r * 0.27));

    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";

    // vertical layout: name centered slightly above, pop slightly below
    const nameY = screen.y - popSize * 0.55;
    const popY  = screen.y + labelSize * 0.65;

    // helper: draw text with thick black stroke then white fill (no blur needed)
    function strokeText(text, x, y, size) {
      ctx.font = `bold ${size}px sans-serif`;
      ctx.lineWidth   = size * 0.38;
      ctx.lineJoin    = "round";
      ctx.strokeStyle = "#000000";
      ctx.strokeText(text, x, y);
      ctx.fillStyle   = "#ffffff";
      ctx.fillText(text, x, y);
    }

    strokeText(this.name,                        screen.x, nameY, labelSize);
    strokeText(formatPopulation(this.population), screen.x, popY,  popSize);
  }
}

// ---- Flag image cache ----
// Uses flagcdn.com which provides high-quality flag images by ISO-3166-1 alpha-2 code.
Country._flagCache = {};

// Map country names to their ISO 3166-1 alpha-2 codes for flagcdn.com
const COUNTRY_ISO = {
  "Israel": "il", "China": "cn", "India": "in", "United States": "us",
  "Indonesia": "id", "Pakistan": "pk", "Nigeria": "ng", "Brazil": "br",
  "Bangladesh": "bd", "Russia": "ru", "Mexico": "mx", "Japan": "jp",
  "Ethiopia": "et", "Philippines": "ph", "Egypt": "eg", "DR Congo": "cd",
  "Vietnam": "vn", "Iran": "ir", "Turkey": "tr", "Germany": "de",
  "Thailand": "th", "United Kingdom": "gb", "Tanzania": "tz", "France": "fr",
  "South Africa": "za", "Italy": "it", "Kenya": "ke", "Myanmar": "mm",
  "Colombia": "co", "South Korea": "kr", "Sudan": "sd", "Uganda": "ug",
  "Spain": "es", "Argentina": "ar", "Algeria": "dz", "Iraq": "iq",
  "Afghanistan": "af", "Yemen": "ye", "Canada": "ca", "Poland": "pl",
  "Morocco": "ma", "Angola": "ao", "Uzbekistan": "uz", "Ukraine": "ua",
  "Saudi Arabia": "sa", "Peru": "pe", "Malaysia": "my", "Mozambique": "mz",
  "Ghana": "gh", "Venezuela": "ve", "Madagascar": "mg", "Nepal": "np",
  "Ivory Coast": "ci", "Cameroon": "cm", "North Korea": "kp", "Niger": "ne",
  "Australia": "au", "Mali": "ml", "Burkina Faso": "bf", "Syria": "sy",
  "Sri Lanka": "lk", "Malawi": "mw", "Chad": "td", "Kazakhstan": "kz",
  "Zambia": "zm", "Chile": "cl", "Romania": "ro", "Somalia": "so",
  "Senegal": "sn", "Netherlands": "nl", "Guatemala": "gt", "Ecuador": "ec",
  "Zimbabwe": "zw", "Cambodia": "kh", "Guinea": "gn", "Rwanda": "rw",
  "Benin": "bj", "Burundi": "bi", "Tunisia": "tn", "Bolivia": "bo",
  "Belgium": "be", "Haiti": "ht", "Cuba": "cu", "South Sudan": "ss",
  "Dominican Republic": "do", "Czech Republic": "cz", "Greece": "gr",
  "Jordan": "jo", "Portugal": "pt", "Azerbaijan": "az", "Sweden": "se",
  "Honduras": "hn", "United Arab Emirates": "ae", "Hungary": "hu",
  "Tajikistan": "tj", "Belarus": "by", "Austria": "at",
  "Papua New Guinea": "pg", "Switzerland": "ch", "Togo": "tg",
  "Sierra Leone": "sl", "Laos": "la", "Paraguay": "py", "Bulgaria": "bg",
  "Libya": "ly", "Lebanon": "lb", "Nicaragua": "ni", "Kyrgyzstan": "kg",
  "Serbia": "rs", "Turkmenistan": "tm", "Singapore": "sg", "Denmark": "dk",
  "Finland": "fi", "Congo": "cg", "Slovakia": "sk", "Norway": "no",
  "Oman": "om", "State of Palestine": "ps", "Costa Rica": "cr",
  "Liberia": "lr", "Ireland": "ie", "New Zealand": "nz",
  "Central African Republic": "cf", "Mauritania": "mr", "Panama": "pa",
  "Kuwait": "kw", "Croatia": "hr", "Moldova": "md", "Georgia": "ge",
  "Eritrea": "er", "Uruguay": "uy", "Mongolia": "mn",
  "Bosnia and Herzegovina": "ba", "Armenia": "am", "Jamaica": "jm",
  "Albania": "al", "Qatar": "qa", "Lithuania": "lt", "Namibia": "na",
  "Gambia": "gm", "Botswana": "bw", "Gabon": "ga", "Lesotho": "ls",
  "North Macedonia": "mk", "Slovenia": "si", "Guinea-Bissau": "gw",
  "Latvia": "lv", "Bahrain": "bh", "Equatorial Guinea": "gq",
  "Trinidad and Tobago": "tt", "Timor-Leste": "tl", "Estonia": "ee",
  "Mauritius": "mu", "Eswatini": "sz", "Djibouti": "dj", "Fiji": "fj",
  "Cyprus": "cy", "Comoros": "km", "Bhutan": "bt", "Guyana": "gy",
  "Solomon Islands": "sb", "Luxembourg": "lu", "Montenegro": "me",
  "Suriname": "sr", "Cabo Verde": "cv", "Malta": "mt", "Brunei": "bn",
  "Belize": "bz", "Bahamas": "bs", "Maldives": "mv", "Iceland": "is",
  "Vanuatu": "vu", "Barbados": "bb", "Samoa": "ws",
  "São Tomé and Príncipe": "st", "Saint Lucia": "lc", "Kiribati": "ki",
  "Grenada": "gd", "Micronesia": "fm", "Tonga": "to", "Seychelles": "sc",
  "Antigua and Barbuda": "ag", "Andorra": "ad", "Dominica": "dm",
  "Marshall Islands": "mh", "Saint Kitts and Nevis": "kn", "Monaco": "mc",
  "Liechtenstein": "li", "San Marino": "sm", "Palau": "pw", "Tuvalu": "tv",
  "Nauru": "nr", "Vatican City": "va"
};

// Preload all flag images from flagcdn.com (80px wide is plenty for our circles)
function preloadFlags() {
  for (const [name] of COUNTRY_DATA) {
    const iso = COUNTRY_ISO[name];
    if (!iso) continue;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `https://flagcdn.com/w80/${iso}.png`;
    Country._flagCache[name] = img;
  }
}

// circle-circle collision (slight leniency for natural absorption feel)
function circlesCollide(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  return dist < a.radius + b.radius * 0.6;
}

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}
