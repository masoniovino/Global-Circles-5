// sounds.js
// Sound effects + Hava Nagila background music via <audio> element.

const COUNTRY_LANG = {
  "Israel": "he-IL",
  "China": "zh-CN",
  "India": "en-IN",
  "United States": "en-US",
  "Indonesia": "id-ID",
  "Pakistan": "ur-PK",
  "Nigeria": "en-NG",
  "Brazil": "pt-BR",
  "Bangladesh": "bn-BD",
  "Russia": "ru-RU",
  "Mexico": "es-MX",
  "Japan": "ja-JP",
  "France": "fr-FR",
  "Germany": "de-DE",
  "Italy": "it-IT",
  "Spain": "es-ES",
  "United Kingdom": "en-GB",
  "South Korea": "ko-KR",
  "Jamaica": "en-JM",
  "Ireland": "en-IE",
  "Australia": "en-AU",
  "Canada": "en-CA",
  "Greece": "el-GR",
  "Turkey": "tr-TR",
  "Netherlands": "nl-NL",
  "Sweden": "sv-SE",
  "Poland": "pl-PL",
  "Egypt": "ar-EG",
  "Saudi Arabia": "ar-SA",
  "Vietnam": "vi-VN",
  "Thailand": "th-TH",
  "Philippines": "fil-PH",
  "South Africa": "en-ZA",
  "Portugal": "pt-PT",
  "Norway": "nb-NO",
  "Finland": "fi-FI",
  "Denmark": "da-DK",
  "Ukraine": "uk-UA",
  "Austria": "de-AT",
  "Switzerland": "de-CH",
  "Argentina": "es-AR",
  "Colombia": "es-CO",
  "Czech Republic": "cs-CZ",
  "Romania": "ro-RO",
  "Hungary": "hu-HU"
};

const EATEN_LINES = {
  "Jamaica": ["Bomboclaat!"],
  "United Kingdom": ["Oh, bollocks!", "Bloody hell!"],
  "Australia": ["Ah, crikey!", "Strewth!"],
  "United States": ["Aw, come on, man!", "Leeroy Jenkins... noooo!"],
  "Brazil": ["Ai caramba!", "Eita!"],
  "Russia": ["In Soviet Russia, I eat you... not today."],
  "Japan": ["Nani?! Sugoi... but bad!"],
  "India": ["Arre yaar, kya hua?!"],
  "Germany": ["Achtung! Nein nein nein!"],
  "France": ["Sacre bleu, oh la la!"],
  "Italy": ["Mamma mia, che disastro!"],
  "Mexico": ["Ay caramba!"],
  "Spain": ["Olé... oh no!"],
  "China": ["Aiyaa!"],
  "South Korea": ["Aigoo, daebak fail!"],
  "Canada": ["Sorry, eh? Ouch!"],
  "Ireland": ["Top o' the mornin'... to ya, jerk!"],
  "Sweden": ["Skal... oh nej!"],
  "default": ["there's a jew!"]
};

const EAT_LINES = {
  "Jamaica": ["Yeah mon, easy ting!"],
  "United Kingdom": ["Right then, mine now, innit!"],
  "Australia": ["Too easy, mate, no worries!"],
  "United States": ["Booyah! USA! USA!"],
  "Brazil": ["Isso ai, vai Brasil!"],
  "Russia": ["Hmm, very nice, great success!"],
  "Japan": ["Sugoi! Banzai!"],
  "India": ["Are wah, mast hai!"],
  "Germany": ["Sehr gut, very efficient!"],
  "France": ["Magnifique, oui oui!"],
  "Italy": ["Mamma mia, bellissimo!"],
  "Mexico": ["Ándale, arriba!"],
  "Spain": ["Olé! Vamos!"],
  "China": ["Hen hao, very good!"],
  "South Korea": ["Daebak! Jackpot!"],
  "Canada": ["Sorry not sorry, eh!"],
  "Ireland": ["Ah go on, lucky charm!"],
  "Sweden": ["Skal! Fantastiskt!"],
  "default": ["those jews are greedy huh!"]
};

function pickLine(table, name) {
  const v = table[name] || table.default;
  if (Array.isArray(v)) return v[Math.floor(Math.random() * v.length)];
  return v;
}

// ---- Sound manager ----
const SoundManager = {
  sfxVolume: 0.8,
  musicVolume: 0.3,
  musicOn: true,
  audioCtx: null,
  _musicEl: null,

  maxHearRange: 4000,

  init() {
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      this.audioCtx = null;
    }
    this._musicEl = document.getElementById("bg-music");
  },

  ensureContext() {
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  },

  speak(countryName, eaten, distance) {
    if (this.sfxVolume <= 0) return;
    if (!("speechSynthesis" in window)) return;

    const line = eaten ? pickLine(EATEN_LINES, countryName) : pickLine(EAT_LINES, countryName);
    const lang = COUNTRY_LANG[countryName] || "en-US";

    let proximity = 1;
    if (typeof distance === "number") {
      proximity = Math.max(0, Math.min(1, 1 - distance / this.maxHearRange));
    }

    const volume = this.sfxVolume * (0.12 + 0.88 * proximity);
    const basePitch = eaten ? 1.1 : 0.95;
    const pitchSpread = (Math.random() - 0.5) * 0.25;
    const pitch = basePitch + proximity * 0.35 + pitchSpread;
    const rate = 0.95 + proximity * 0.15 + (Math.random() - 0.5) * 0.15;

    try {
      const utter = new SpeechSynthesisUtterance(line);
      utter.lang = lang;
      utter.volume = Math.max(0, Math.min(1, volume));
      utter.rate = Math.max(0.7, Math.min(1.6, rate));
      utter.pitch = Math.max(0.5, Math.min(2, pitch));

      const voices = speechSynthesis.getVoices();
      const match = voices.find(v => v.lang === lang) ||
                     voices.find(v => v.lang && v.lang.startsWith(lang.split("-")[0]));
      if (match) utter.voice = match;

      speechSynthesis.speak(utter);
    } catch (e) {}
  },

  // Start Hava Nagila looping
  startMusic() {
    if (!this._musicEl) this._musicEl = document.getElementById("bg-music");
    if (!this._musicEl) return;
    this._musicEl.volume = this.musicOn ? this.musicVolume : 0;
    this._musicEl.loop = true;
    const playPromise = this._musicEl.play();
    if (playPromise) playPromise.catch(() => {});
  },

  setMusicOn(on) {
    this.musicOn = on;
    if (this._musicEl) {
      this._musicEl.volume = on ? this.musicVolume : 0;
    }
  },

  setMusicVolume(v) {
    this.musicVolume = v;
    if (this._musicEl && this.musicOn) {
      this._musicEl.volume = v;
    }
  },

  setSfxVolume(v) {
    this.sfxVolume = v;
  },

  // Simple synthesized "ding" for coin pickups
  playCoinDing() {
    if (this.sfxVolume <= 0) return;
    if (!this.audioCtx) {
      try {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) { return; }
    }
    this.ensureContext();
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1600, now);
    osc.frequency.exponentialRampToValueAtTime(2000, now + 0.03);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.12, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  },

  setPaused(paused) {
    if (!this._musicEl) return;
    if (paused) {
      this._musicEl.pause();
    } else {
      if (this.musicOn) {
        const p = this._musicEl.play();
        if (p) p.catch(() => {});
      }
    }
  }
};
