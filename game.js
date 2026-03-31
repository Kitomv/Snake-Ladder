// ─── SOUND ENGINE (Web Audio API — synthesized, no files) ────────
let audioCtx = null;
let sfxMuted = false;

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function vib(pattern) {
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (e) { }
}

function toggleMute() {
  sfxMuted = !sfxMuted;
  const btn = document.getElementById('btn-mute');
  btn.textContent = sfxMuted ? '🔇' : '🔊';
  btn.style.color = sfxMuted ? '#f43f5e' : '#aaa';
  if (!sfxMuted) sfx.pop(0.05);
}

const sfx = {
  _node(type, freq, vol, start, dur, ctx, dest) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, start);
    g.gain.setValueAtTime(vol, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g); g.connect(dest);
    o.start(start); o.stop(start + dur + 0.02);
  },
  _noise(vol, start, dur, ctx, dest, lpFreq) {
    const sz = Math.ceil(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, sz, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < sz; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(), g = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = lpFreq || 800;
    g.gain.setValueAtTime(vol, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    src.buffer = buf; src.connect(lp); lp.connect(g); g.connect(dest);
    src.start(start); src.stop(start + dur + 0.02);
  },

  diceRoll() {
    if (sfxMuted) return;
    const ctx = getCtx(), t = ctx.currentTime;
    const m = ctx.createGain(); m.gain.value = 0.3; m.connect(ctx.destination);
    for (let i = 0; i < 7; i++) {
      const at = t + i * 0.08 + Math.random() * 0.02;
      this._noise(0.7, at, 0.04, ctx, m, 500 + Math.random() * 800);
    }
  },

  diceLand() {
    if (sfxMuted) return;
    const ctx = getCtx(), t = ctx.currentTime;
    const m = ctx.createGain(); m.gain.value = 0.5; m.connect(ctx.destination);
    this._node('sine', 90, 0.9, t, 0.2, ctx, m);
    this._node('sine', 55, 0.7, t, 0.25, ctx, m);
    this._noise(1.0, t, 0.025, ctx, m, 3000);
  },

  step() {
    if (sfxMuted) return;
    const ctx = getCtx(), t = ctx.currentTime;
    const m = ctx.createGain(); m.gain.value = 0.18; m.connect(ctx.destination);
    this._node('triangle', 340 + Math.random() * 80, 0.7, t, 0.06, ctx, m);
    this._noise(0.3, t, 0.025, ctx, m, 1500);
  },

  snake() {
    if (sfxMuted) return;
    const ctx = getCtx(), t = ctx.currentTime;
    const m = ctx.createGain(); m.gain.value = 0.5; m.connect(ctx.destination);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(480, t);
    o.frequency.exponentialRampToValueAtTime(75, t + 0.7);
    g.gain.setValueAtTime(0.55, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
    o.connect(g); g.connect(m); o.start(t); o.stop(t + 0.8);
    this._noise(0.35, t, 0.55, ctx, m, 3500);
    this._node('sine', 50, 0.7, t + 0.1, 0.55, ctx, m);
  },

  ladder() {
    if (sfxMuted) return;
    const ctx = getCtx(), t = ctx.currentTime;
    const m = ctx.createGain(); m.gain.value = 0.42; m.connect(ctx.destination);
    [523, 659, 784, 1047, 1319].forEach((f, i) => {
      this._node('sine', f, 0.6, t + i * 0.09, 0.28, ctx, m);
      this._node('triangle', f * 2, 0.14, t + i * 0.09, 0.18, ctx, m);
    });
    this._noise(0.2, t + 0.4, 0.15, ctx, m, 7000);
  },

  cardReveal() {
    if (sfxMuted) return;
    const ctx = getCtx(), t = ctx.currentTime;
    const m = ctx.createGain(); m.gain.value = 0.45; m.connect(ctx.destination);
    this._noise(0.8, t, 0.18, ctx, m, 2000);
    this._node('sine', 95, 0.9, t + 0.06, 0.14, ctx, m);
    this._node('sine', 75, 0.6, t + 0.22, 0.1, ctx, m);
  },

  done() {
    if (sfxMuted) return;
    const ctx = getCtx(), t = ctx.currentTime;
    const m = ctx.createGain(); m.gain.value = 0.42; m.connect(ctx.destination);
    [523, 659, 784].forEach((f, i) => {
      this._node('sine', f, 0.65 - i * 0.08, t + i * 0.07, 0.35, ctx, m);
    });
    this._node('triangle', 1047, 0.28, t + 0.2, 0.22, ctx, m);
  },

  skip() {
    if (sfxMuted) return;
    const ctx = getCtx(), t = ctx.currentTime;
    const m = ctx.createGain(); m.gain.value = 0.48; m.connect(ctx.destination);
    const mk = (freq1, freq2, at, dur) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(freq1, at);
      o.frequency.linearRampToValueAtTime(freq2, at + dur);
      g.gain.setValueAtTime(0.6, at); g.gain.exponentialRampToValueAtTime(0.0001, at + dur + 0.05);
      o.connect(g); g.connect(m); o.start(at); o.stop(at + dur + 0.08);
    };
    mk(320, 150, t, 0.28); mk(220, 100, t + 0.26, 0.3);
  },

  joker() {
    if (sfxMuted) return;
    const ctx = getCtx(), t = ctx.currentTime;
    const m = ctx.createGain(); m.gain.value = 0.4; m.connect(ctx.destination);
    [1047, 1319, 1568, 2093, 2637, 1568, 1047].forEach((f, i) => {
      this._node('sine', f, 0.5, t + i * 0.06, 0.18, ctx, m);
      if (i % 2 === 0) this._noise(0.12, t + i * 0.06, 0.08, ctx, m, 8000);
    });
  },

  jokerGet() {
    if (sfxMuted) return;
    const ctx = getCtx(), t = ctx.currentTime;
    const m = ctx.createGain(); m.gain.value = 0.4; m.connect(ctx.destination);
    [659, 784, 988, 1319].forEach((f, i) => {
      this._node('sine', f, 0.7, t + i * 0.07, 0.22, ctx, m);
    });
  },

  timerTick() {
    if (sfxMuted) return;
    const ctx = getCtx(), t = ctx.currentTime;
    const m = ctx.createGain(); m.gain.value = 0.15; m.connect(ctx.destination);
    this._noise(1.0, t, 0.016, ctx, m, 4000);
    this._node('sine', 900, 0.35, t, 0.016, ctx, m);
  },

  timerUrgent() {
    if (sfxMuted) return;
    const ctx = getCtx(), t = ctx.currentTime;
    const m = ctx.createGain(); m.gain.value = 0.28; m.connect(ctx.destination);
    this._noise(1.0, t, 0.022, ctx, m, 5500);
    this._node('square', 1300, 0.5, t, 0.022, ctx, m);
  },

  timerEnd() {
    if (sfxMuted) return;
    const ctx = getCtx(), t = ctx.currentTime;
    const m = ctx.createGain(); m.gain.value = 0.48; m.connect(ctx.destination);
    for (let i = 0; i < 3; i++) this._node('square', 880, 0.6, t + i * 0.18, 0.12, ctx, m);
    this._noise(0.4, t, 0.5, ctx, m, 2500);
  },

  bonusTurn() {
    if (sfxMuted) return;
    const ctx = getCtx(), t = ctx.currentTime;
    const m = ctx.createGain(); m.gain.value = 0.38; m.connect(ctx.destination);
    [523, 523, 659, 784, 1047].forEach((f, i) => {
      this._node('triangle', f, 0.6, t + i * 0.08, 0.2, ctx, m);
    });
  },

  winner() {
    if (sfxMuted) return;
    const ctx = getCtx(), t = ctx.currentTime;
    const m = ctx.createGain(); m.gain.value = 0.48; m.connect(ctx.destination);
    [[523, 0], [659, 0.12], [784, 0.24], [1047, 0.38], [1047, 0.58], [1319, 0.72], [1568, 0.86], [1568, 1.06]].forEach(([f, at]) => {
      this._node('sine', f, 0.6, t + at, 0.26, ctx, m);
      this._node('triangle', f * 2, 0.18, t + at, 0.2, ctx, m);
    });
    [130, 164, 196, 261].forEach((f, i) => { this._node('sine', f, 0.45, t + i * 0.28, 0.35, ctx, m); });
    this._noise(0.55, t, 0.45, ctx, m, 9000);
    this._noise(0.3, t + 0.85, 0.45, ctx, m, 9000);
  },

  pop(vol) {
    if (sfxMuted) return;
    const ctx = getCtx(), t = ctx.currentTime;
    const m = ctx.createGain(); m.gain.value = vol || 0.22; m.connect(ctx.destination);
    this._node('sine', 650, 0.9, t, 0.045, ctx, m);
  },
};

// ─── CONFIG ──────────────────────────────────────────────────────
const SNAKES = { 98: 78, 95: 56, 87: 36, 64: 60, 62: 19, 56: 53, 49: 11, 47: 26, 16: 6 };
const LADDERS = { 4: 14, 9: 31, 20: 38, 28: 84, 40: 59, 51: 67, 63: 81, 71: 91 };

const SPECIAL_CELLS = {
  7: 'duo', 15: 'duo', 25: 'duo', 34: 'duo', 45: 'duo', 58: 'duo', 72: 'duo', 85: 'duo', 93: 'duo',
  12: 'joker', 33: 'joker', 55: 'joker', 78: 'joker', 90: 'joker',
  18: 'wild', 37: 'wild', 60: 'wild', 83: 'wild',
  // Berani cells — only active in liar mode, otherwise treated as dare
  10: 'berani', 22: 'berani', 35: 'berani', 48: 'berani', 52: 'berani', 68: 'berani', 76: 'berani', 88: 'berani', 96: 'berani',
};

/** Skip ke-3+ berturut-turut: hukuman mundur (lebih berat dari skip biasa) */
const SKIP_OVER_LIMIT_PENALTY = 7;
const SKIP_OVER_LIMIT_PENALTY_BERANI = 10;

// Content loaded from challenges.json via window.CHALLENGES

// ─── GAME STATE ──────────────────────────────────────────────────
let currentMood = 'romantis'; // 'romantis' | 'playful' | 'liar'
/** Saat true: mode Liar disembunyikan & sel Berani diperlakukan seperti Dare biasa */
let santaiOnlyMode = false;

function isLiarModeActive() {
  return currentMood === 'liar' && !santaiOnlyMode;
}

let PLAYERS = [
  { name: "Pemain 1", colorHex: "#f472b6" },
  { name: "Pemain 2", colorHex: "#fb923c" },
];

// ─── GAME STATE (consolidated) ───────────────────────────────────
let pos = [1, 1];
let turn = 0;
let phase = 'roll';   // 'roll' | 'tod' | 'done'
let pendRaw = null;
let pendAfter = null;
let pendDice = 0;
let rolling = false;
let skipStreak = [0, 0];
let jokerCount = [0, 0];

/** Riwayat kartu TOD untuk review dari log (id monoton, array dibatasi) */
let todReviewIdSeq = 0;
let todReviewSnapshots = [];
const TOD_REVIEW_MAX = 50;
const GAME_LOG_MAX_ENTRIES = 48;

// GS helper - read-only snapshot for debugging
function getGameState() {
  return {
    turn, phase, pos: [...pos],
    skipStreak: [...skipStreak],
    jokerCount: [...jokerCount],
    pendRaw, pendAfter, pendDice,
    mood: currentMood, totalRounds,
  };
}
// ─── NO-REPEAT TRACKING ─────────────────────────────────────────
// Global session sets — track challenge text to prevent repeats across levels
let usedTruthSet = new Set();
let usedDareSet = new Set();
let usedDuoSet = new Set();
let usedBeraniSet = new Set();
// Legacy refs kept for backward compat with saveGame
let usedTruth = { mild: [], medium: [], hot: [] };
let usedDare = { mild: [], medium: [], hot: [] };
let usedDuo = [];
// These were previously used but removed — keep as empty arrays to avoid ReferenceError
let usedLiarTruth = [];
let usedLiarDare = [];
let usedBerani = [];

// Pick a random unused challenge from pool. Resets set if all exhausted.
function pickUnused(pool, usedSet) {
  // Filter out already-used challenges globally across all pools in this set
  let available = pool.filter(c => !usedSet.has(c));
  if (available.length === 0) {
    // This pool is exhausted — only clear items from THIS pool and retry
    pool.forEach(c => usedSet.delete(c));
    available = [...pool];
    addLog('🔄 Pool kartu habis — mulai ulang dari awal!');
  }
  const chosen = available[Math.floor(Math.random() * available.length)];
  usedSet.add(chosen);
  return chosen;
}

// ─── SANITIZE USER TEXT ──────────────────────────────────────────
function sanitizeText(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML; // encodes &, <, >, ", '
}

let CELL_TYPE = {};
let currentTodType = null;

// ─── TIMER STATE ─────────────────────────────────────────────────
let timerInterval = null;
let timerSecondsLeft = 0;
let pendingTimerSecs = null; // set when dare shown, cleared when started/skipped

// ─── STATS STATE ─────────────────────────────────────────────────
let stats = [
  {
    done: 0, skipped: 0, truths: 0, dares: 0, duos: 0, wilds: 0, jokerUsed: 0,
    snakeHits: 0, ladderHits: 0, bonusTurns: 0, maxStreak: 0, curStreak: 0
  },
  {
    done: 0, skipped: 0, truths: 0, dares: 0, duos: 0, wilds: 0, jokerUsed: 0,
    snakeHits: 0, ladderHits: 0, bonusTurns: 0, maxStreak: 0, curStreak: 0
  },
];
let totalRounds = 0;

// ─── MOOD SELECTOR ───────────────────────────────────────────────
function selectMood(mood) {
    currentMood = mood;
  ['romantis', 'playful', 'liar'].forEach(m => {
    const el = document.getElementById(`mood-${m}`);
    if (el) el.classList.toggle('active', m === mood);
  });
}

function applySantaiModeUI() {
  // Mode santai removed — Liar mode always available
}

// ─── GAME DURATION TIMER ─────────────────────────────────────────
let gameStartTime = null;
let gameDurationSec = 0;
let durationInterval = null;

function startDurationTimer() {
  gameStartTime = Date.now();
  gameDurationSec = 0;
  const el = document.getElementById('game-duration');
  if (el) { el.className = 'game-duration active'; }
  if (durationInterval) clearInterval(durationInterval);
  durationInterval = setInterval(() => {
    gameDurationSec = Math.floor((Date.now() - gameStartTime) / 1000);
    updateDurationDisplay();
  }, 1000);
}

function stopDurationTimer() {
  if (durationInterval) { clearInterval(durationInterval); durationInterval = null; }
  const el = document.getElementById('game-duration');
  if (el) el.className = 'game-duration done';
  updateDurationDisplay();
}

function resetDurationTimer() {
  if (durationInterval) { clearInterval(durationInterval); durationInterval = null; }
  gameStartTime = null; gameDurationSec = 0;
  const el = document.getElementById('game-duration');
  if (el) el.className = 'game-duration';
  const disp = document.getElementById('duration-display');
  if (disp) disp.textContent = '00:00';
}

function updateDurationDisplay() {
  const disp = document.getElementById('duration-display');
  if (!disp) return;
  const m = Math.floor(gameDurationSec / 60);
  const s = gameDurationSec % 60;
  disp.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatDuration(sec) {
  if (sec < 60) return `${sec} detik`;
  const m = Math.floor(sec / 60), s = sec % 60;
  return s > 0 ? `${m} mnt ${s} dtk` : `${m} menit`;
}

// ─── NAME SCREEN ─────────────────────────────────────────────────
function startGame() {
  let n0 = document.getElementById('name0').value.trim() || 'Kamu';
  let n1 = document.getElementById('name1').value.trim() || 'Dia';
  // Enhancement: prevent identical names
  if (n0.toLowerCase() === n1.toLowerCase()) {
    n1 = n1 + ' (2)';
    setTimeout(() => showStreakToast(`⚠️ Nama sama! Pemain 2 jadi "${n1}"`), 400);
  }
  PLAYERS[0].name = n0;
  PLAYERS[1].name = n1;
  document.getElementById('pname-text-0').textContent = n0;
  document.getElementById('pname-text-1').textContent = n1;
  document.getElementById('picon-0').innerHTML = getPlayerSVG(0);
  document.getElementById('picon-1').innerHTML = getPlayerSVG(1);
  document.getElementById('name-screen').style.display = 'none';

  // Show mood badge
  const MOOD_META = {
    romantis: { emoji: '💕', label: 'Romantis', color: '#f472b6' },
    playful: { emoji: '😜', label: 'Playful', color: '#fb923c' },
    liar: { emoji: '🔥', label: 'Liar', color: '#ef4444' },
  };
  const m = MOOD_META[currentMood];
  document.getElementById('mood-badge-bar').innerHTML =
    `<span style="background:${m.color}22;border:1px solid ${m.color}55;padding:3px 12px;border-radius:20px;color:${m.color};font-weight:800;font-size:11px">${m.emoji} Mode ${m.label}</span>`;

  resetTodReviewHistory();
  addLog(`💕 ${n0} vs ${n1} — Mulai! (${m.emoji} ${m.label})`);
  stats = [
    {
      done: 0, skipped: 0, truths: 0, dares: 0, duos: 0, wilds: 0, jokerUsed: 0,
      snakeHits: 0, ladderHits: 0, bonusTurns: 0, maxStreak: 0, curStreak: 0
    },
    {
      done: 0, skipped: 0, truths: 0, dares: 0, duos: 0, wilds: 0, jokerUsed: 0,
      snakeHits: 0, ladderHits: 0, bonusTurns: 0, maxStreak: 0, curStreak: 0
    },
  ];
  totalRounds = 0;
  usedTruthSet = new Set(); usedDareSet = new Set(); usedDuoSet = new Set(); usedBeraniSet = new Set();
  window._adaptedDir = null;
  initCellTypes();
  buildBoard();
  drawSnakesLadders();
  initPions();
  updateUI();
  spawnHearts();
  startDurationTimer();
}

function initCellTypes() {
  CELL_TYPE = {};
  // Mood affects truth/dare ratio: romantis=65% truth, playful=50/50, liar=65% dare
  const truthProb = currentMood === 'romantis' ? 0.65 : isLiarModeActive() ? 0.35 : 0.50;
  for (let i = 1; i <= 100; i++) {
    if (SPECIAL_CELLS[i]) {
      const t = SPECIAL_CELLS[i];
      // Berani aktif hanya jika mode Liar nyala (bukan Mode santai)
      CELL_TYPE[i] = (t === 'berani' && !isLiarModeActive()) ? 'dare' : t;
    } else CELL_TYPE[i] = Math.random() < truthProb ? 'truth' : 'dare';
  }
}

function initPionPickers() {
  [0, 1].forEach(pi => {
    const wrap = document.getElementById(`pions${pi}`);
    if (!wrap) return;
    wrap.innerHTML = '';
    ALL_PIONS.forEach((pion, idx) => {
      const el = document.createElement('div');
      el.className = 'pion-option' + (selectedPion[pi] === idx ? ` selected-${pi}` : '');
      el.title = pion.label;
      el.style.width = '44px';
      el.innerHTML = `<div style="width:28px;height:36px">${pion.svg}</div><div class="pion-label">${pion.label.split(' ')[0]}</div>`;
      el.addEventListener('click', () => {
        const other = 1 - pi;
        // Enhancement: auto-swap if other player already using this pion
        if (selectedPion[other] === idx) {
          // Find next available pion for the other player
          const next = (idx + 1) % ALL_PIONS.length;
          selectedPion[other] = next;
          // Refresh other player's picker UI
          const otherWrap = document.getElementById(`pions${other}`);
          if (otherWrap) {
            otherWrap.querySelectorAll('.pion-option').forEach((o, i) => {
              o.className = 'pion-option' + (i === next ? ` selected-${other}` : '');
            });
          }
          const otherIcon = document.getElementById(`picon-${other}`);
          if (otherIcon) otherIcon.innerHTML = ALL_PIONS[next].svg;
          showStreakToast(`💱 Bidak ${ALL_PIONS[idx].label.split(' ')[0]} dipindah dari Pemain ${other + 1}!`);
        }
        selectedPion[pi] = idx;
        // Update all options for this player
        wrap.querySelectorAll('.pion-option').forEach((o, i) => {
          o.className = 'pion-option' + (i === idx ? ` selected-${pi}` : '');
        });
        // Preview in player icon
        const iconEl = document.getElementById(`picon-${pi}`);
        if (iconEl) iconEl.innerHTML = pion.svg;
        sfx.pop(0.06);
      });
      wrap.appendChild(el);
    });
  });
}

function initInputListeners() {
  document.getElementById('name0').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('name1').focus(); });
  document.getElementById('name1').addEventListener('keydown', e => { if (e.key === 'Enter') startGame(); });
  applySantaiModeUI();
  const dw = document.getElementById('dice-wrap');
  if (dw) dw.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); rollDice(); } });
  const glog = document.getElementById('game-log');
  if (glog) {
    glog.addEventListener('click', (e) => {
      const row = e.target.closest('.log-entry-review');
      if (!row || row.dataset.reviewId == null) return;
      const id = +row.dataset.reviewId;
      const snap = todReviewSnapshots.find(s => s.id === id);
      if (!snap) {
        showStreakToast('Kartu itu sudah tidak ada di memori');
        return;
      }
      showTodReviewOverlay(snap);
    });
  }
  const revOv = document.getElementById('tod-review-overlay');
  if (revOv) {
    revOv.addEventListener('click', (e) => {
      if (e.target === revOv) hideTodReviewOverlay();
    });
  }
  initPionPickers();
}

function initActionDelegation() {
  document.body.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;
    switch (action) {
      case 'tod-done':
        todDone(el.dataset.completed !== 'false');
        break;
      case 'try-skip':
        trySkip();
        break;
      case 'resolve-wild':
        resolveWild(el.dataset.wild, +el.dataset.sq, el.dataset.level);
        break;
      case 'cancel-skip-confirm':
        if (window._todPrevBodyForSkip != null) {
          document.getElementById('tod-body').innerHTML = window._todPrevBodyForSkip;
          window._todPrevBodyForSkip = null;
        }
        break;
      case 'resume-game':
        resumeGame();
        break;
      case 'dismiss-save':
        dismissSave();
        break;
      case 'show-rules':
        showRules();
        break;
      case 'hide-rules':
        hideRules();
        break;
      case 'show-custom':
        showCustomOverlay();
        break;
      case 'hide-custom':
        hideCustomOverlay();
        break;
      case 'set-custom-tab':
        setCustomTab(el.dataset.tab);
        break;
      case 'add-custom':
        addCustomTantangan();
        break;
      case 'start-game':
        startGame();
        break;
      case 'select-mood':
        if (el.dataset.mood) selectMood(el.dataset.mood);
        break;
      case 'roll-dice':
        rollDice();
        break;
      case 'use-joker-panel':
        useJokerFromPanel(+el.dataset.player);
        break;
      case 'show-stats':
        showStats();
        break;
      case 'close-stats':
        document.getElementById('stats-overlay').classList.remove('show');
        break;
      case 'toggle-music':
        toggleMusic();
        break;
      case 'toggle-mute':
        toggleMute();
        break;
      case 'go-mood':
        showMoodConfirm();
        break;
      case 'confirm-mode-yes':
        hideMoodConfirm();
        goToMoodScreen();
        break;
      case 'confirm-mode-no':
        hideMoodConfirm();
        break;
      case 'timer-start':
        manualStartTimer();
        break;
      case 'timer-skip':
        manualSkipTimer();
        break;
      case 'use-joker':
        useJoker();
        break;
      case 'show-recap':
        showRecap();
        break;
      case 'confirm-reset':
        confirmReset();
        break;
      case 'download-recap':
        downloadRecap();
        break;
      case 'close-recap':
        document.getElementById('recap-overlay').classList.remove('show');
        break;
      case 'close-tod-review':
        hideTodReviewOverlay();
        break;
      case 'confirm-age':
        confirmAge();
        break;
      case 'exit-game':
        window.location.href = 'https://www.google.com';
        break;
      default:
        break;
    }
  });
}

function confirmAge() {
  const gate = document.getElementById('age-gate');
  if (gate) {
    gate.style.opacity = '0';
    gate.style.pointerEvents = 'none';
    gate.style.transform = 'scale(1.1)';
    gate.style.transition = 'all 0.5s ease';
    // Add the class to body to enforce CSS hiding
    document.body.classList.add('age-verified');
    // Save to session storage
    sessionStorage.setItem('ageVerified_v7', 'true');
    sfx.pop(0.1);
  }
}

// ─── HEARTS ──────────────────────────────────────────────────────
function spawnHearts() {
  const bg = document.getElementById('hearts-bg');
  if (bg.children.length > 0) return; // only spawn once
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const emojis = ['💕', '💗', '💖', '❤️', '🌹', '✨', '💫'];
  for (let i = 0; i < 10; i++) {
    const h = document.createElement('span');
    h.className = 'heart-float';
    h.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    h.style.left = (Math.random() * 100) + 'vw';
    h.style.animationDuration = (8 + Math.random() * 14) + 's';
    h.style.animationDelay = (Math.random() * 12) + 's';
    h.style.fontSize = (10 + Math.random() * 14) + 'px';
    bg.appendChild(h);
  }
}

// ─── BOARD ───────────────────────────────────────────────────────
function buildBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  const frag = document.createDocumentFragment();
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const rfb = 9 - row;
      const n = rfb * 10 + (rfb % 2 === 0 ? col : 9 - col) + 1;
      const cell = document.createElement('div');
      const special = SPECIAL_CELLS[n];
      let cls = 'cell ';
      if (special === 'duo') cls += 'cell-duo';
      else if (special === 'joker') cls += 'cell-joker';
      else if (special === 'wild') cls += 'cell-wild';
      else if (special === 'berani' && isLiarModeActive()) cls += 'cell-berani';
      else cls += (n % 2 === 0 ? 'cell-even' : 'cell-odd');
      if (SNAKES[n]) cls += ' cell-snake';
      if (LADDERS[n]) cls += ' cell-ladder';
      cell.className = cls;
      cell.id = `cell-${n}`;

      let badge = '';
      const ct = CELL_TYPE[n];
      if (ct === 'truth') badge = `<span class="cell-tod tod-t">T</span>`;
      else if (ct === 'dare') badge = `<span class="cell-tod tod-d">D</span>`;
      else if (ct === 'duo') badge = `<span class="cell-tod tod-duo">⚡</span>`;
      else if (ct === 'joker') badge = `<span class="cell-tod tod-joker">🃏</span>`;
      else if (ct === 'wild') badge = `<span class="cell-tod tod-wild">★</span>`;
      else if (ct === 'berani') badge = `<span class="cell-tod tod-berani">💪</span>`;

      cell.innerHTML = `<span class="cell-num">${n}</span><div class="cell-icons" id="ci-${n}"></div>${badge}`;
      frag.appendChild(cell);
    }
  }
  board.appendChild(frag);
}

// ─── SVG SNAKES & LADDERS ─────────────────────────────────────────
function cellCenter(n) {
  const rfb = Math.floor((n - 1) / 10);
  const pip = (n - 1) % 10;
  const col = rfb % 2 === 0 ? pip : 9 - pip;
  const row = 9 - rfb;
  return { x: (col + 0.5) * 10, y: (row + 0.5) * 10 };
}

// ─── helper: point on cubic bezier ──────────────────────────────
function bezierPt(p0, p1, p2, p3, t) {
  const m = 1 - t;
  return {
    x: m * m * m * p0.x + 3 * m * m * t * p1.x + 3 * m * t * t * p2.x + t * t * t * p3.x,
    y: m * m * m * p0.y + 3 * m * m * t * p1.y + 3 * m * t * t * p2.y + t * t * t * p3.y
  };
}

function drawSnakesLadders() {
  const svg = document.getElementById('board-overlay');
  // Unique gradient IDs per snake/ladder to avoid collisions
  let gradIdx = 0;
  let html = `<defs>
    <filter id="fblur" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="0.55" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="fdrop" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0.25" dy="0.45" stdDeviation="0.45" flood-color="#000" flood-opacity="0.55"/>
    </filter>
    <filter id="fglow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="1.2" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>`;
  for (const [f, t] of Object.entries(LADDERS)) { html += makeLadder(+f, +t, gradIdx); gradIdx++; }
  for (const [f, t] of Object.entries(SNAKES)) { html += makeSnake(+f, +t, gradIdx); gradIdx++; }
  svg.innerHTML = html;
}

// ─── REALISTIC LADDER ────────────────────────────────────────────
function makeLadder(from, to, gIdx) {
  const f = cellCenter(from), t = cellCenter(to);
  const dx = t.x - f.x, dy = t.y - f.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len, uy = dy / len;   // unit along ladder
  const px = -uy, py = ux;         // perpendicular (left)

  const W = 1.05; // rail half-spacing
  // Rail endpoints
  const lx1 = f.x + px * W, ly1 = f.y + py * W;
  const lx2 = t.x + px * W, ly2 = t.y + py * W;
  const rx1 = f.x - px * W, ry1 = f.y - py * W;
  const rx2 = t.x - px * W, ry2 = t.y - py * W;

  const nR = Math.max(3, Math.round(len / 2.8));
  const lid = `lg${gIdx}`;

  // Build rung elements
  let rungs = '';
  for (let i = 1; i <= nR; i++) {
    const tv = i / (nR + 1);
    const ax = lx1 + (lx2 - lx1) * tv, ay = ly1 + (ly2 - ly1) * tv;
    const bx = rx1 + (rx2 - rx1) * tv, by = ry1 + (ry2 - ry1) * tv;
    const rl = Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);
    // Shadow
    rungs += `<line x1="${(ax + 0.2).toFixed(2)}" y1="${(ay + 0.3).toFixed(2)}"
                  x2="${(bx + 0.2).toFixed(2)}" y2="${(by + 0.3).toFixed(2)}"
                  stroke="rgba(0,0,0,0.45)" stroke-width="1.55" stroke-linecap="round"/>`;
    // Dark underside
    rungs += `<line x1="${(ax + uy * 0.25).toFixed(2)}" y1="${(ay + uy * 0.25 + 0.12).toFixed(2)}"
                  x2="${(bx + uy * 0.25).toFixed(2)}" y2="${(by + uy * 0.25 + 0.12).toFixed(2)}"
                  stroke="#78350f" stroke-width="1.35" stroke-linecap="round"/>`;
    // Main rung face
    rungs += `<line x1="${ax.toFixed(2)}" y1="${ay.toFixed(2)}"
                  x2="${bx.toFixed(2)}" y2="${by.toFixed(2)}"
                  stroke="#d97706" stroke-width="1.05" stroke-linecap="round"/>`;
    // Top highlight
    rungs += `<line x1="${(ax - uy * 0.18).toFixed(2)}" y1="${(ay - uy * 0.18).toFixed(2)}"
                  x2="${(bx - uy * 0.18).toFixed(2)}" y2="${(by - uy * 0.18).toFixed(2)}"
                  stroke="#fef08a" stroke-width="0.32" stroke-linecap="round" opacity="0.75"/>`;
    // Wood grain mark on rung
    if (rl > 2.5) {
      const mx = (ax + bx) / 2, my = (ay + by) / 2;
      rungs += `<line x1="${(mx - px * 0.35).toFixed(2)}" y1="${(my - py * 0.35).toFixed(2)}"
                    x2="${(mx + px * 0.06).toFixed(2)}" y2="${(my + py * 0.06).toFixed(2)}"
                    stroke="#92400e" stroke-width="0.28" opacity="0.55"/>`;
    }
    // Metal bolt at each end
    for (const [boltX, boltY] of [[ax, ay], [bx, by]]) {
      rungs += `<circle cx="${boltX.toFixed(2)}" cy="${boltY.toFixed(2)}" r="0.5"  fill="#6b2d0f" opacity="0.92"/>`;
      rungs += `<circle cx="${boltX.toFixed(2)}" cy="${boltY.toFixed(2)}" r="0.32" fill="#fbbf24" opacity="0.85"/>`;
      rungs += `<circle cx="${(boltX - 0.1).toFixed(2)}" cy="${(boltY - 0.1).toFixed(2)}" r="0.1" fill="white" opacity="0.6"/>`;
    }
  }

  // Occasional wood knot on rails
  const knotT = 0.42;
  const kx = lx1 + (lx2 - lx1) * knotT, ky = ly1 + (ly2 - ly1) * knotT;
  const kx2 = rx1 + (rx2 - rx1) * knotT, ky2 = ry1 + (ry2 - ry1) * knotT;

  // Heart ornament at top
  const hx = t.x, hy = t.y - 2.0;
  const heartPath = `M${hx},${hy + 0.55} C${hx - 0.7},${hy - 0.35} ${hx - 1.6},${hy + 0.35} ${hx},${hy + 1.5} C${hx + 1.6},${hy + 0.35} ${hx + 0.7},${hy - 0.35} ${hx},${hy + 0.55}Z`;

  return `<g opacity="0.93">
  <defs>
    <linearGradient id="${lid}l" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"   stop-color="#78350f"/>
      <stop offset="35%"  stop-color="#b45309"/>
      <stop offset="65%"  stop-color="#d97706"/>
      <stop offset="100%" stop-color="#92400e"/>
    </linearGradient>
  </defs>

  <!-- Rail shadows -->
  <line x1="${(lx1 + 0.22).toFixed(2)}" y1="${(ly1 + 0.32).toFixed(2)}"
        x2="${(lx2 + 0.22).toFixed(2)}" y2="${(ly2 + 0.32).toFixed(2)}"
        stroke="rgba(0,0,0,0.45)" stroke-width="2.4" stroke-linecap="round"/>
  <line x1="${(rx1 + 0.22).toFixed(2)}" y1="${(ry1 + 0.32).toFixed(2)}"
        x2="${(rx2 + 0.22).toFixed(2)}" y2="${(ry2 + 0.32).toFixed(2)}"
        stroke="rgba(0,0,0,0.45)" stroke-width="2.4" stroke-linecap="round"/>

  <!-- Rail dark side (depth edge) -->
  <line x1="${(lx1 + px * 0.32).toFixed(2)}" y1="${(ly1 + py * 0.32).toFixed(2)}"
        x2="${(lx2 + px * 0.32).toFixed(2)}" y2="${(ly2 + py * 0.32).toFixed(2)}"
        stroke="#6b2d0f" stroke-width="2.1" stroke-linecap="round"/>
  <line x1="${(rx1 - px * 0.32).toFixed(2)}" y1="${(ry1 - py * 0.32).toFixed(2)}"
        x2="${(rx2 - px * 0.32).toFixed(2)}" y2="${(ry2 - py * 0.32).toFixed(2)}"
        stroke="#6b2d0f" stroke-width="2.1" stroke-linecap="round"/>

  <!-- Rail main face -->
  <line x1="${lx1.toFixed(2)}" y1="${ly1.toFixed(2)}"
        x2="${lx2.toFixed(2)}" y2="${ly2.toFixed(2)}"
        stroke="#b45309" stroke-width="1.7" stroke-linecap="round"/>
  <line x1="${rx1.toFixed(2)}" y1="${ry1.toFixed(2)}"
        x2="${rx2.toFixed(2)}" y2="${ry2.toFixed(2)}"
        stroke="#b45309" stroke-width="1.7" stroke-linecap="round"/>

  <!-- Rail highlight edge -->
  <line x1="${(lx1 - px * 0.28).toFixed(2)}" y1="${(ly1 - py * 0.28).toFixed(2)}"
        x2="${(lx2 - px * 0.28).toFixed(2)}" y2="${(ly2 - py * 0.28).toFixed(2)}"
        stroke="#fde68a" stroke-width="0.5" stroke-linecap="round" opacity="0.8"/>
  <line x1="${(rx1 + px * 0.28).toFixed(2)}" y1="${(ry1 + py * 0.28).toFixed(2)}"
        x2="${(rx2 + px * 0.28).toFixed(2)}" y2="${(ry2 + py * 0.28).toFixed(2)}"
        stroke="#fde68a" stroke-width="0.5" stroke-linecap="round" opacity="0.8"/>

  <!-- Wood grain lines on rails -->
  ${Array.from({ length: Math.round(len / 1.8) }, (_, i) => {
    const tv = (i + 0.5) / (Math.round(len / 1.8) + 1);
    const gax = lx1 + (lx2 - lx1) * tv + px * 0.05, gay = ly1 + (ly2 - ly1) * tv + py * 0.05;
    const gbx = rx1 + (rx2 - rx1) * tv - px * 0.05, gby = ry1 + (ry2 - ry1) * tv - py * 0.05;
    return `<line x1="${gax.toFixed(2)}" y1="${gay.toFixed(2)}" x2="${(gax + px * 0.55).toFixed(2)}" y2="${(gay + py * 0.55).toFixed(2)}" stroke="#92400e" stroke-width="0.22" opacity="0.45"/>
            <line x1="${gbx.toFixed(2)}" y1="${gby.toFixed(2)}" x2="${(gbx - px * 0.55).toFixed(2)}" y2="${(gby - py * 0.55).toFixed(2)}" stroke="#92400e" stroke-width="0.22" opacity="0.45"/>`;
  }).join('')}

  <!-- Wood knots -->
  <ellipse cx="${kx.toFixed(2)}"  cy="${ky.toFixed(2)}"  rx="0.55" ry="0.28" fill="#6b2d0f" opacity="0.5"/>
  <ellipse cx="${kx2.toFixed(2)}" cy="${ky2.toFixed(2)}" rx="0.55" ry="0.28" fill="#6b2d0f" opacity="0.5"/>

  <!-- Rungs -->
  ${rungs}

  <!-- Base cap (bottom foot) -->
  <ellipse cx="${f.x.toFixed(2)}" cy="${(f.y + 0.15).toFixed(2)}" rx="1.55" ry="0.6" fill="#5c1f07" opacity="0.8"/>
  <ellipse cx="${f.x.toFixed(2)}" cy="${f.y.toFixed(2)}"        rx="1.5"  ry="0.55" fill="#b45309"/>
  <ellipse cx="${f.x.toFixed(2)}" cy="${(f.y - 0.2).toFixed(2)}"  rx="1.3"  ry="0.42" fill="#fbbf24" opacity="0.9"/>
  <line x1="${(f.x - 1.0).toFixed(2)}" y1="${(f.y - 0.18).toFixed(2)}"
        x2="${(f.x + 1.0).toFixed(2)}" y2="${(f.y - 0.18).toFixed(2)}"
        stroke="#fef9c3" stroke-width="0.25" opacity="0.6"/>

  <!-- Top cap -->
  <ellipse cx="${t.x.toFixed(2)}" cy="${(t.y + 0.15).toFixed(2)}" rx="1.55" ry="0.6" fill="#5c1f07" opacity="0.8"/>
  <ellipse cx="${t.x.toFixed(2)}" cy="${t.y.toFixed(2)}"        rx="1.5"  ry="0.55" fill="#b45309"/>
  <ellipse cx="${t.x.toFixed(2)}" cy="${(t.y - 0.2).toFixed(2)}"  rx="1.3"  ry="0.42" fill="#fbbf24" opacity="0.9"/>

  <!-- Heart ornament -->
  <path d="${heartPath}" fill="#be123c" opacity="0.95"/>
  <path d="${heartPath}" fill="#f43f5e" opacity="0.85"/>
  <path d="${heartPath}" fill="none" stroke="#fda4af" stroke-width="0.22" opacity="0.7"/>
  <path d="M${hx},${(hy + 0.55).toFixed(2)} C${hx},${hy} ${(hx - 0.5).toFixed(2)},${(hy - 0.15).toFixed(2)} ${hx},${(hy + 0.55).toFixed(2)}Z"
        fill="rgba(255,255,255,0.22)"/>
</g>`;
}

// ─── REALISTIC SNAKE ─────────────────────────────────────────────
function makeSnake(from, to, gIdx) {
  const f = cellCenter(from), t = cellCenter(to);
  const dx = t.x - f.x, dy = t.y - f.y;
  const len = Math.sqrt(dx * dx + dy * dy);

  // S-curve bezier control points
  const bend1 = Math.min(len * 0.40, 13);
  const bend2 = -Math.min(len * 0.30, 10);
  const perp = { x: -dy / len, y: dx / len };
  const cp1 = { x: f.x + dx * 0.26 + perp.x * bend1, y: f.y + dy * 0.26 + perp.y * bend1 };
  const cp2 = { x: f.x + dx * 0.54 + perp.x * bend2, y: f.y + dy * 0.54 + perp.y * bend2 };
  const cp3 = { x: f.x + dx * 0.76 + perp.x * bend1 * 0.45, y: f.y + dy * 0.76 + perp.y * bend1 * 0.45 };
  const bodyPath = `M${f.x.toFixed(2)},${f.y.toFixed(2)} C${cp1.x.toFixed(2)},${cp1.y.toFixed(2)} ${cp2.x.toFixed(2)},${cp2.y.toFixed(2)} ${cp3.x.toFixed(2)},${cp3.y.toFixed(2)} S${t.x.toFixed(2)},${t.y.toFixed(2)} ${t.x.toFixed(2)},${t.y.toFixed(2)}`;

  // Head direction (tangent at start, pointing away from body)
  const hdx = f.x - cp1.x, hdy = f.y - cp1.y;
  const hl = Math.sqrt(hdx * hdx + hdy * hdy) || 1;
  const hn = { x: hdx / hl, y: hdy / hl };       // forward (out of head)
  const hp = { x: -hn.y, y: hn.x };          // perpendicular

  // Scale diamonds along body using bezier sampling
  const nSeg = Math.floor(len * 0.55);
  let scales = '';
  for (let i = 2; i <= nSeg; i++) {
    const tv = i / (nSeg + 1);
    const pt = bezierPt(f, cp1, cp2, { x: t.x, y: t.y }, tv);
    const r = 0.28 + Math.sin(i * 2.1) * 0.06;
    const col = (i % 3 === 0) ? 'rgba(159,18,57,0.75)'
      : (i % 3 === 1) ? 'rgba(136,19,55,0.65)'
        : 'rgba(190,18,60,0.5)';
    scales += `<circle cx="${pt.x.toFixed(2)}" cy="${pt.y.toFixed(2)}" r="${r.toFixed(2)}" fill="${col}"/>`;
    if (i % 3 === 1 && i < nSeg - 1) {
      const pt2 = bezierPt(f, cp1, cp2, { x: t.x, y: t.y }, (i + 0.5) / (nSeg + 1));
      scales += `<circle cx="${pt2.x.toFixed(2)}" cy="${pt2.y.toFixed(2)}" r="0.18" fill="rgba(253,164,175,0.35)"/>`;
    }
  }

  // Belly path (slightly offset)
  const bellyPath = `M${(f.x + hp.x * 0.25).toFixed(2)},${(f.y + hp.y * 0.25).toFixed(2)} C${(cp1.x + hp.x * 0.25).toFixed(2)},${(cp1.y + hp.y * 0.25).toFixed(2)} ${(cp2.x + hp.x * 0.25).toFixed(2)},${(cp2.y + hp.y * 0.25).toFixed(2)} ${(cp3.x + hp.x * 0.25).toFixed(2)},${(cp3.y + hp.y * 0.25).toFixed(2)} S${(t.x + hp.x * 0.25).toFixed(2)},${(t.y + hp.y * 0.25).toFixed(2)} ${(t.x + hp.x * 0.25).toFixed(2)},${(t.y + hp.y * 0.25).toFixed(2)}`;

  // Eye positions
  const er = 0.78;
  const e1 = { x: f.x + hp.x * er, y: f.y + hp.y * er };
  const e2 = { x: f.x - hp.x * er, y: f.y - hp.y * er };

  // Tongue
  const tb = 2.5, fork = 0.95;
  const tongBase = { x: f.x + hn.x * tb, y: f.y + hn.y * tb };
  const tTip1 = { x: tongBase.x + hn.x * 1.35 + hp.x * fork, y: tongBase.y + hn.y * 1.35 + hp.y * fork };
  const tTip2 = { x: tongBase.x + hn.x * 1.35 - hp.x * fork, y: tongBase.y + hn.y * 1.35 - hp.y * fork };

  // Nostril positions
  const nos1 = { x: f.x + hn.x * 1.9 + hp.x * 0.52, y: f.y + hn.y * 1.9 + hp.y * 0.52 };
  const nos2 = { x: f.x + hn.x * 1.9 - hp.x * 0.52, y: f.y + hn.y * 1.9 - hp.y * 0.52 };

  const sheenX = f.x - hn.x * 0.55 + hp.x * 0.35;
  const sheenY = f.y - hn.y * 0.55 + hp.y * 0.35;
  const sheenAngle = (Math.atan2(hn.y, hn.x) * 180 / Math.PI);
  const sid = `sg${gIdx}`;

  return `<g opacity="0.93">
  <defs>
    <radialGradient id="${sid}h" cx="35%" cy="35%" r="65%">
      <stop offset="0%"   stop-color="#fb7185"/>
      <stop offset="45%"  stop-color="#be123c"/>
      <stop offset="100%" stop-color="#881337"/>
    </radialGradient>
    <radialGradient id="${sid}e" cx="35%" cy="30%" r="70%">
      <stop offset="0%"   stop-color="#fcd34d"/>
      <stop offset="60%"  stop-color="#d97706"/>
      <stop offset="100%" stop-color="#92400e"/>
    </radialGradient>
  </defs>

  <path d="${bodyPath}" stroke="rgba(0,0,0,0.4)" stroke-width="3.8" fill="none" stroke-linecap="round"/>
  <path d="${bodyPath}" stroke="#9f1239" stroke-width="3.2" fill="none" stroke-linecap="round"/>
  <path d="${bodyPath}" stroke="#fda4af" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-dasharray="1.8 2.4" opacity="0.6"/>
  ${scales}

  <circle cx="${(f.x + 0.2).toFixed(2)}" cy="${(f.y + 0.3).toFixed(2)}" r="2.9" fill="rgba(0,0,0,0.4)"/>
  <circle cx="${f.x.toFixed(2)}" cy="${f.y.toFixed(2)}" r="2.8" fill="#881337"/>
  <circle cx="${f.x.toFixed(2)}" cy="${f.y.toFixed(2)}" r="2.4" fill="url(#${sid}h)"/>
  <ellipse cx="${sheenX.toFixed(2)}" cy="${sheenY.toFixed(2)}"
           rx="1.0" ry="0.55" fill="rgba(253,164,175,0.28)"
           transform="rotate(${sheenAngle.toFixed(1)} ${f.x.toFixed(2)} ${f.y.toFixed(2)})"/>

  <circle cx="${nos1.x.toFixed(2)}" cy="${nos1.y.toFixed(2)}" r="0.28" fill="#4c0519" opacity="0.9"/>
  <circle cx="${nos2.x.toFixed(2)}" cy="${nos2.y.toFixed(2)}" r="0.28" fill="#4c0519" opacity="0.9"/>
  <circle cx="${(nos1.x - 0.07).toFixed(2)}" cy="${(nos1.y - 0.07).toFixed(2)}" r="0.09" fill="rgba(255,255,255,0.35)"/>
  <circle cx="${(nos2.x - 0.07).toFixed(2)}" cy="${(nos2.y - 0.07).toFixed(2)}" r="0.09" fill="rgba(255,255,255,0.35)"/>

  <circle cx="${e1.x.toFixed(2)}" cy="${e1.y.toFixed(2)}" r="0.78" fill="white"/>
  <circle cx="${e2.x.toFixed(2)}" cy="${e2.y.toFixed(2)}" r="0.78" fill="white"/>
  <circle cx="${e1.x.toFixed(2)}" cy="${e1.y.toFixed(2)}" r="0.58" fill="url(#${sid}e)"/>
  <circle cx="${e2.x.toFixed(2)}" cy="${e2.y.toFixed(2)}" r="0.58" fill="url(#${sid}e)"/>
  <ellipse cx="${e1.x.toFixed(2)}" cy="${e1.y.toFixed(2)}" rx="0.22" ry="0.5" fill="#0c0a09"/>
  <ellipse cx="${e2.x.toFixed(2)}" cy="${e2.y.toFixed(2)}" rx="0.22" ry="0.5" fill="#0c0a09"/>
  <circle cx="${(e1.x - hn.x * 0.15 + hp.x * 0.15).toFixed(2)}" cy="${(e1.y - hn.y * 0.15 + hp.y * 0.15).toFixed(2)}" r="0.2" fill="white" opacity="0.92"/>
  <circle cx="${(e2.x - hn.x * 0.15 + hp.x * 0.15).toFixed(2)}" cy="${(e2.y - hn.y * 0.15 + hp.y * 0.15).toFixed(2)}" r="0.2" fill="white" opacity="0.92"/>

  <line x1="${f.x.toFixed(2)}" y1="${f.y.toFixed(2)}"
        x2="${tongBase.x.toFixed(2)}" y2="${tongBase.y.toFixed(2)}"
        stroke="#f43f5e" stroke-width="0.55" stroke-linecap="round"/>
  <line x1="${tongBase.x.toFixed(2)}" y1="${tongBase.y.toFixed(2)}"
        x2="${tTip1.x.toFixed(2)}" y2="${tTip1.y.toFixed(2)}"
        stroke="#f43f5e" stroke-width="0.5" stroke-linecap="round"/>
  <line x1="${tongBase.x.toFixed(2)}" y1="${tongBase.y.toFixed(2)}"
        x2="${tTip2.x.toFixed(2)}" y2="${tTip2.y.toFixed(2)}"
        stroke="#f43f5e" stroke-width="0.5" stroke-linecap="round"/>
</g>`;
}
// ─── PION SYSTEM ─────────────────────────────────────────────────
function squareToPercent(n) {
  const rfb = Math.floor((n - 1) / 10);
  const pip = (n - 1) % 10;
  const col = rfb % 2 === 0 ? pip : 9 - pip;
  const row = 9 - rfb;
  return { left: col * 10, top: row * 10 };
}

const pionEls = [null, null];

function initPions() {
  const layer = document.getElementById('pion-layer');
  layer.innerHTML = '';
  PLAYERS.forEach((p, i) => {
    const el = document.createElement('div');
    el.className = 'pion';
    el.id = `pion-${i}`;
    el.innerHTML = getPlayerSVG(i);
    el.style.marginLeft = i === 0 ? '-1.5%' : '1.5%';
    el.style.marginTop = i === 0 ? '-1.5%' : '1.5%';
    layer.appendChild(el);
    pionEls[i] = el;
    movePionTo(i, pos[i], true);
  });
}

function movePionTo(playerIdx, square, instant) {
  const el = pionEls[playerIdx];
  if (!el) return;
  const { left, top } = squareToPercent(square);
  if (instant) {
    el.style.transition = 'none';
    el.style.left = left + '%';
    el.style.top = top + '%';
    void el.offsetWidth;
    el.style.transition = '';
  } else {
    el.style.left = left + '%';
    el.style.top = top + '%';
  }
}

function pulseCell(n) {
  const cell = document.getElementById(`cell-${n}`);
  if (!cell) return;
  cell.classList.remove('cell-pulse');
  void cell.offsetWidth;
  cell.classList.add('cell-pulse');
  cell.addEventListener('animationend', () => cell.classList.remove('cell-pulse'), { once: true });
}

function animateSteps(playerIdx, from, to, callback) {
  const el = pionEls[playerIdx];
  const dir = to > from ? 1 : -1;
  const steps = Math.abs(to - from);
  let cur = from, step = 0;
  // Faster for long moves, snappier for short
  const stepMs = steps <= 2 ? 240 : steps <= 4 ? 190 : steps <= 7 ? 155 : 120;
  el.style.transition = `left ${stepMs}ms cubic-bezier(0.4,0,0.2,1), top ${stepMs}ms cubic-bezier(0.4,0,0.2,1), transform 0.18s cubic-bezier(0.34,1.56,0.64,1), filter 0.15s ease`;
  function doStep() {
    cur += dir; step++;
    movePionTo(playerIdx, cur, false);
    pulseCell(cur);
    sfx.step();
    // Jump arc: bigger at middle of move
    const progress = step / steps;
    const jumpScale = 1 + 0.45 * Math.sin(progress * Math.PI);
    const jumpY = -10 * Math.sin(progress * Math.PI);
    el.style.transform = `scale(${jumpScale.toFixed(2)}) translateY(${jumpY.toFixed(1)}px)`;
    el.style.filter = `drop-shadow(0 ${(6 + 8 * Math.sin(progress * Math.PI)).toFixed(0)}px 12px rgba(244,63,94,0.7)) brightness(${(1.2 + 0.3 * Math.sin(progress * Math.PI)).toFixed(2)})`;
    setTimeout(() => {
      document.getElementById(`ppos-${playerIdx}`).textContent = `Kotak ${cur}`;
      if (step < steps) {
        setTimeout(doStep, stepMs * 0.6);
      } else {
        // Landing bounce
        el.style.transform = 'scale(1.2) translateY(2px)';
        setTimeout(() => {
          el.style.transform = 'scale(0.92) translateY(1px)';
          setTimeout(() => {
            el.style.transform = 'scale(1)';
            el.style.filter = 'drop-shadow(0 4px 10px rgba(0,0,0,0.8))';
            pos[playerIdx] = cur;
            callback();
          }, 100);
        }, 90);
      }
    }, stepMs * 0.68);
  }
  doStep();
}

// Flash overlay helper (dipindah ke outer scope agar tidak redefined setiap panggilan)
function flashOverlay(type) {
  let overlay = document.getElementById('flash-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'flash-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:50;opacity:0;transition:opacity 0.15s ease';
    document.body.appendChild(overlay);
  }
  if (type === 'snake') {
    overlay.style.background = 'radial-gradient(ellipse at center, rgba(244,63,94,0.55) 0%, transparent 70%)';
  } else {
    overlay.style.background = 'radial-gradient(ellipse at center, rgba(252,211,77,0.45) 0%, transparent 70%)';
  }
  overlay.style.opacity = '1';
  setTimeout(() => { overlay.style.opacity = '0'; }, 500);
}

function animateSnakeLadder(playerIdx, from, to, callback) {
  const el = pionEls[playerIdx];
  const isSnake = to < from;
  const dur = isSnake ? 750 : 680;

  if (isSnake) {
    sfx.snake(); vib([80, 40, 80]);
    // Enhancement 4: dramatic red flash overlay
    flashOverlay('snake');
    // Snake: spin + shrink + red tint
    el.style.transition = `transform 0.25s cubic-bezier(0.4,0,0.2,1), filter 0.25s ease`;
    el.style.transform = 'scale(1.3) rotate(-20deg) translateY(-8px)';
    el.style.filter = 'drop-shadow(0 0 16px #f43f5e) brightness(1.5) hue-rotate(10deg)';
    setTimeout(() => {
      el.style.transition = `left ${dur}ms cubic-bezier(0.55,0,0.45,1), top ${dur}ms cubic-bezier(0.55,0,0.45,1), transform ${dur}ms cubic-bezier(0.4,0,0.6,1), filter 0.4s ease`;
      el.style.transform = 'scale(0.7) rotate(25deg)';
      el.style.filter = 'drop-shadow(0 2px 10px #f43f5e) brightness(0.75) saturate(1.5)';
      movePionTo(playerIdx, to, false);
      pulseCell(to);
      document.getElementById(`ppos-${playerIdx}`).textContent = `Kotak ${to}`;
    }, 200);
  } else {
    sfx.ladder(); vib([30, 20, 60]);
    // Enhancement 4: dramatic gold flash overlay
    flashOverlay('ladder');
    // Ladder: bounce up with glow
    el.style.transition = `transform 0.22s cubic-bezier(0.34,1.56,0.64,1), filter 0.2s ease`;
    el.style.transform = 'scale(1.6) translateY(-14px)';
    el.style.filter = 'drop-shadow(0 12px 24px gold) brightness(2) saturate(1.4)';
    // Confetti
    const bw = document.querySelector('.board-wrap');
    const rect = bw ? bw.getBoundingClientRect() : null;
    if (rect) {
      const dest = squareToPercent(to);
      launchConfetti(
        rect.left + rect.width * (dest.left / 100 + 0.05),
        rect.top + rect.height * (dest.top / 100 + 0.05),
        60
      );
    }
    setTimeout(() => {
      el.style.transition = `left ${dur}ms cubic-bezier(0.22,1,0.36,1), top ${dur}ms cubic-bezier(0.22,1,0.36,1), transform ${dur}ms cubic-bezier(0.34,1.56,0.64,1), filter 0.5s ease`;
      el.style.transform = 'scale(1.25) translateY(-6px)';
      el.style.filter = 'drop-shadow(0 8px 20px gold) brightness(1.6)';
      movePionTo(playerIdx, to, false);
      pulseCell(to);
      document.getElementById(`ppos-${playerIdx}`).textContent = `Kotak ${to}`;
    }, 180);
  }

  setTimeout(() => {
    el.style.transition = 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), filter 0.2s ease';
    el.style.transform = 'scale(1.1)';
    el.style.filter = 'drop-shadow(0 4px 10px rgba(0,0,0,0.8))';
  }, dur * (isSnake ? 0.8 : 0.75));

  setTimeout(() => {
    el.style.transform = 'scale(1)';
    el.style.filter = 'drop-shadow(0 4px 10px rgba(0,0,0,0.8))';
    pos[playerIdx] = to;
    callback();
  }, dur + (isSnake ? 180 : 150));
}

// ─── UPDATE UI ───────────────────────────────────────────────────
function updateUI() {
  for (let i = 0; i < 2; i++) {
    const c = document.getElementById(`pcard-${i}`);
    c.className = 'player-card' + (turn === i && phase !== 'done' ? ` active-${i}` : '');
    document.getElementById(`ppos-${i}`).textContent = `Kotak ${pos[i]}`;
    document.getElementById(`pturn-${i}`).style.display = (turn === i && phase === 'roll') ? 'block' : 'none';
    const jEl = document.getElementById(`joker-${i}`);
    const cnt = jokerCount[i];
    jEl.textContent = `🃏 ${cnt}`;
    jEl.className = 'joker-token' + (cnt > 0 ? ' has' : ' empty');
    // Streak badge
    const sb = document.getElementById(`streak-${i}`);
    if (sb) {
      const s = stats[i].curStreak;
      if (s >= 2) {
        const fires = s >= 7 ? '🔥🔥🔥' : s >= 5 ? '🔥🔥' : '🔥';
        sb.textContent = `${fires} ${s}x`;
        const cls = s >= 6 ? 'mega' : s >= 4 ? 'hot' : '';
        sb.className = `streak-badge show${cls ? ' ' + cls : ''}`;
      } else {
        sb.className = 'streak-badge';
        sb.textContent = '';
      }
    }
  }
  const maxPos = Math.max(pos[0], pos[1]);
  const heatLevel = maxPos >= 80 ? 3 : maxPos >= 55 ? 2 : maxPos >= 30 ? 1 : 0;
  document.getElementById('heat-overlay').className = heatLevel > 0 ? `heat-${heatLevel}` : '';
  for (let i = 0; i < 2; i++) {
    const hb = document.getElementById(`heat-badge-${i}`);
    const ph = pos[i] >= 80 ? 3 : pos[i] >= 55 ? 2 : pos[i] >= 30 ? 1 : 0;
    hb.className = `heat-badge heat-${ph}`;
    hb.textContent = ph === 3 ? '🔥🔥' : ph === 2 ? '🔥' : '🌶️';
  }
  const btn = document.getElementById('btn-roll');
  const canRoll = phase === 'roll' && !rolling;
  btn.disabled = !canRoll;
  const c = PLAYERS[turn].colorHex;
  btn.style.background = canRoll ? `linear-gradient(135deg, ${c}, ${c}88)` : 'rgba(255,255,255,0.08)';
  btn.textContent = rolling ? '🎲 Rolling...' : canRoll ? '🎲 Lempar!' : '💕 TOD dulu...';
}

// ─── DICE ────────────────────────────────────────────────────────
const DICE_DOTS = {
  1: [[50, 50]],
  2: [[27, 27], [73, 73]],
  3: [[27, 27], [50, 50], [73, 73]],
  4: [[27, 27], [73, 27], [27, 73], [73, 73]],
  5: [[27, 27], [73, 27], [50, 50], [27, 73], [73, 73]],
  6: [[27, 22], [73, 22], [27, 50], [73, 50], [27, 78], [73, 78]],
};

function rollDice() {
  if (phase !== 'roll' || rolling) return;
  rolling = true; updateUI();
  const wrap = document.getElementById('dice-wrap');
  wrap.classList.add('rolling');
  sfx.diceRoll();
  const spin = setInterval(() => renderDice(Math.ceil(Math.random() * 6)), 70);
  setTimeout(() => {
    clearInterval(spin); wrap.classList.remove('rolling');
    const dice = Math.ceil(Math.random() * 6);
    sfx.diceLand();
    renderDice(dice); rolling = false;
    pendDice = dice;
    const cur = pos[turn], raw = cur + dice;
    if (raw > 100) {
      addLog(`${PLAYERS[turn].name} 🎲 Dadu ${dice}. Butuh ${100 - cur} lagi!`);
      nextTurn(); return;
    }
    pendRaw = raw;
    pendAfter = SNAKES[raw] ?? LADDERS[raw] ?? raw;
    addLog(`${PLAYERS[turn].name} 🎲 Dadu ${dice}${dice === 6 ? ' — BONUS GILIRAN! 🎲' : ''} → kotak ${raw}`);
    updateUI();
    animateSteps(turn, cur, raw, () => {
      if (pos[turn] === 100) { endGame(); return; }
      phase = 'tod'; updateUI();
      showTOD(raw);
    });
  }, 750);
}

function renderDice(val) {
  const wrap = document.getElementById('dice-wrap');
  const c = PLAYERS[turn].colorHex;
  const dots = DICE_DOTS[val].map(([cx, cy]) =>
    `<circle cx="${cx}" cy="${cy}" r="8" fill="${c}"/>`).join('');
  wrap.innerHTML = `<rect rx="14" width="100" height="100" fill="#1a0f18"/><rect rx="12" x="3" y="3" width="94" height="94" fill="#2a0f1e" stroke="${c}" stroke-width="2" stroke-opacity="0.5"/>${dots}`;
}

// ─── TIMER ───────────────────────────────────────────────────────
// Parse duration (seconds) from challenge text
// Looks for patterns: "selama X menit", "selama X detik", "X menit penuh", "X detik penuh"
// Keywords yang menandakan durasi open-ended — tidak perlu timer
const NO_TIMER_KEYWORDS = [
  'tahan napas', 'tahan nafas',
  'sampai x bilang stop', 'bilang stop',
  'tahan sampai x yang pertama', 'yang pertama melepas',
  'jangan berhenti sampai', 'tidak boleh berhenti sampai',
  'sampai aku bilang', 'sampai kamu bilang',
  'selama yang bisa', 'selama yang kamu bisa', 'selama yang aku bisa',
];

function parseDurationFromText(text) {
  const plain = text.replace(/<[^>]+>/g, '').toLowerCase();
  // Check if challenge is open-ended — no timer
  if (NO_TIMER_KEYWORDS.some(kw => plain.includes(kw))) return -1; // -1 = no timer
  const original = text.replace(/<[^>]+>/g, '');
  let total = 0;
  const minMatch = original.match(/([0-9]+)\s*menit/i);
  if (minMatch) total += parseInt(minMatch[1]) * 60;
  const secMatch = original.match(/([0-9]+)\s*detik/i);
  if (secMatch) {
    total += parseInt(secMatch[1]); // always add seconds, even if minutes already found
  }
  return total > 0 ? Math.min(total, 300) : null; // Enhancement 5: cap at 5 minutes
}

function formatTimerHint(secs) {
  if (secs < 60) return `${secs} detik`;
  const m = Math.floor(secs / 60), s = secs % 60;
  return s > 0 ? `${m} menit ${s} detik` : `${m} menit`;
}

function startTimer(level, overrideSecs) {
  stopTimer();
  const totalSec = overrideSecs || 60;
  timerSecondsLeft = totalSec;
  const circumference = 163.4;
  const ring = document.getElementById('timer-ring');
  const text = document.getElementById('timer-text');
  const timerEl = document.getElementById('tod-timer');
  const hint = document.getElementById('timer-level-hint');
  if (hint) hint.textContent = overrideSecs ? `⏱ ${formatTimerHint(totalSec)}` : '⏱️ Timer siap';
  timerEl.classList.add('visible');
  timerEl.classList.remove('timer-urgent');

  function tick() {
    const ratio = timerSecondsLeft / totalSec;
    ring.style.strokeDashoffset = (circumference * (1 - ratio)).toFixed(2);

    if (timerSecondsLeft <= 10) {
      ring.style.stroke = '#ef4444';
      text.style.fill = '#ef4444';
      timerEl.classList.add('timer-urgent');
      sfx.timerUrgent(); if (timerSecondsLeft <= 5) vib(50);
    } else if (timerSecondsLeft <= 20) {
      ring.style.stroke = '#fb923c';
      text.style.fill = '#fb923c';
      sfx.timerTick();
    } else {
      ring.style.stroke = '#10b981';
      text.style.fill = 'white';
      sfx.timerTick();
    }
    text.textContent = timerSecondsLeft;

    if (timerSecondsLeft <= 0) {
      stopTimer();
      sfx.timerEnd(); vib([200, 100, 200]);
      addLog(`⏱️ Waktu habis! ${PLAYERS[turn].name} dianggap selesai — lanjut!`);
      // Auto-done when time runs out
      todDoneInternal(true);
      return;
    }
    timerSecondsLeft--;
  }

  tick(); // immediate first render
  timerInterval = setInterval(tick, 1000);
}

// Show timer in idle/ready state (not running yet)
function showTimerIdle(secs) {
  pendingTimerSecs = secs;
  const timerEl = document.getElementById('tod-timer');
  const hint = document.getElementById('timer-level-hint');
  const text = document.getElementById('timer-text');
  const ring = document.getElementById('timer-ring');
  const startBtn = document.getElementById('btn-timer-start');
  const skipBtn = document.getElementById('btn-timer-skip');
  if (!timerEl) return;
  // Show idle state
  timerEl.classList.add('visible');
  timerEl.classList.remove('timer-urgent');
  if (hint) hint.textContent = secs ? `⏱️ ${formatTimerHint(secs)}` : '⏱️ Timer siap';
  if (text) { text.textContent = secs ? (secs >= 60 ? Math.floor(secs / 60) + 'm' : secs + 's') : '–'; text.style.fill = 'rgba(255,255,255,0.4)'; }
  if (ring) { ring.style.stroke = 'rgba(255,255,255,0.2)'; ring.style.strokeDashoffset = '0'; }
  if (startBtn) startBtn.style.display = '';
  if (skipBtn) skipBtn.style.display = '';
}

function manualStartTimer() {
  const secs = pendingTimerSecs;
  pendingTimerSecs = null;
  // Hide start/skip buttons — timer running now
  const startBtn = document.getElementById('btn-timer-start');
  const skipBtn = document.getElementById('btn-timer-skip');
  if (startBtn) startBtn.style.display = 'none';
  if (skipBtn) skipBtn.style.display = 'none';
  const text = document.getElementById('timer-text');
  if (text) text.style.fill = 'white';
  startTimer(null, secs);
}

function manualSkipTimer() {
  pendingTimerSecs = null;
  stopTimer();
}

function stopTimer() {
  pendingTimerSecs = null;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  const timerEl = document.getElementById('tod-timer');
  if (timerEl) {
    timerEl.classList.remove('visible');
    timerEl.classList.remove('timer-urgent');
  }
  // reset ring
  const ring = document.getElementById('timer-ring');
  if (ring) {
    ring.style.strokeDashoffset = '0';
    ring.style.stroke = '#10b981';
  }
  const text = document.getElementById('timer-text');
  if (text) { text.textContent = ''; text.style.fill = 'white'; }
}

// ─── TOD MODAL ───────────────────────────────────────────────────
function getLevel(sq) {
  // Base level from board position
  if (sq <= 33) return 'mild';
  if (sq <= 66) return 'medium';
  return 'hot';
}

const LEVEL_ORDER = ['mild', 'medium', 'hot'];

function getAdaptiveLevel(sq) {
  const base = getLevel(sq);
  const s = stats[turn];
  const total = s.done + s.skipped;
  const baseIdx = LEVEL_ORDER.indexOf(base);

  // Need at least 2 rounds before adapting
  if (total < 2) return { level: base, adapted: null };

  // 🔥 Brave: 2+ done streak → bump up one level
  if (s.curStreak >= 2 && baseIdx < 2) {
    return { level: LEVEL_ORDER[baseIdx + 1], adapted: 'up' };
  }

  // 😅 Struggling: 1+ skip streak → drop down one level
  if (skipStreak[turn] >= 1 && baseIdx > 0) {
    return { level: LEVEL_ORDER[baseIdx - 1], adapted: 'down' };
  }

  // Skip ratio > 50% over last 4 rounds → drop
  if (total >= 4 && s.skipped / total > 0.5 && baseIdx > 0) {
    return { level: LEVEL_ORDER[baseIdx - 1], adapted: 'down' };
  }

  // Done ratio > 75% over last 4 rounds → bump
  if (total >= 4 && s.done / total > 0.75 && baseIdx < 2) {
    return { level: LEVEL_ORDER[baseIdx + 1], adapted: 'up' };
  }

  return { level: base, adapted: null };
}

// Helper: get active challenges pool based on currentMood
function getPool() {
  if (currentMood === 'romantis') return window.CHALLENGES_ROMANTIS;
  if (isLiarModeActive()) return window.CHALLENGES_LIAR;
  return window.CHALLENGES_PLAYFUL; // default playful
}

function setLevelUI(level) {
  const moodLabel = isLiarModeActive() ? '💋' : currentMood === 'romantis' ? '💕' : '😜';
  const labels = {
    mild: `🌸 Level Ringan`,
    medium: `🔥 Level Panas`,
    hot: `${moodLabel} Level Liar`,
  };
  const cls = { mild: 'level-mild', medium: 'level-medium', hot: 'level-hot' };
  const adaptDir = window._adaptedDir;
  const adaptBadge = adaptDir === 'up'
    ? `<span style="font-size:10px;background:rgba(16,185,129,0.25);color:#34d399;border:1px solid #10b981;border-radius:8px;padding:1px 6px;margin-left:6px;font-weight:900">🔥 NAIK</span>`
    : adaptDir === 'down'
      ? `<span style="font-size:10px;background:rgba(99,102,241,0.25);color:#a5b4fc;border:1px solid #6366f1;border-radius:8px;padding:1px 6px;margin-left:6px;font-weight:900">😌 TURUN</span>`
      : '';
  document.getElementById('level-label').innerHTML = labels[level] + adaptBadge;
  document.getElementById('level-label').className = `level-label ${cls[level]}`;
  ['lpip-0', 'lpip-1', 'lpip-2'].forEach((id, i) => {
    const pip = document.getElementById(id);
    pip.className = 'level-pip';
    if (level === 'mild' && i === 0) pip.classList.add('active-mild');
    if (level === 'medium' && i <= 1) pip.classList.add('active-medium');
    if (level === 'hot') pip.classList.add('active-hot');
  });
}

function showTOD(sq) {
  const p = PLAYERS[turn];
  const type = CELL_TYPE[sq] || 'dare';
  const { level, adapted } = getAdaptiveLevel(sq);
  currentTodType = type;
  // Store adapted info for UI hint
  window._adaptedDir = adapted;
  if (adapted === 'up') addLog(`🔥 ${PLAYERS[turn].name} on fire! Level naik → ${level}`);
  if (adapted === 'down') addLog(`😌 ${PLAYERS[turn].name} level turun → ${level}`);

  const card = document.getElementById('tod-card');
  const badge = document.getElementById('tod-badge');
  card.style.border = `2px solid ${p.colorHex}`;
  card.style.boxShadow = `0 0 60px ${p.colorHex}33`;

  const svgThumb = `<span style="display:inline-flex;width:18px;height:22px;vertical-align:middle;margin-right:4px">${getPlayerSVG(turn)}</span>`;
  badge.innerHTML = svgThumb + p.name;
  badge.style.background = `${p.colorHex}22`;
  badge.style.border = `2px solid ${p.colorHex}`;
  badge.style.color = p.colorHex;
  document.getElementById('tod-sq').textContent = `📍 Kotak ${sq}`;
  setLevelUI(level);

  const jokerBtn = document.getElementById('btn-joker');
  if (jokerCount[turn] > 0 && type !== 'joker' && type !== 'berani') {
    jokerBtn.classList.add('visible');
    jokerBtn.textContent = `🃏 Joker: Skip Gratis + Imun Ular! (${jokerCount[turn]}x)`;
  } else {
    jokerBtn.classList.remove('visible');
  }

  const skipWarn = document.getElementById('skip-warning');
  if (type === 'berani') {
    skipWarn.classList.remove('show'); // no skip warning for berani — can't skip at all
  } else if (skipStreak[turn] >= 1) {
    // skip ke-2 = langsung hukuman berat
    const hp = SKIP_OVER_LIMIT_PENALTY;
    skipWarn.textContent = `⚠️ Skip lagi = HUKUMAN ${hp} kotak mundur!`;
    skipWarn.classList.add('show');
  } else {
    skipWarn.classList.remove('show');
  }

  document.getElementById('tod-overlay').classList.add('show');
  sfx.cardReveal();

  if (type === 'joker') showJokerCell(sq, level);
  else if (type === 'duo') showDuoChallenge(sq, level);
  else if (type === 'wild') showWildChoice(sq, level);
  else if (type === 'berani' && isLiarModeActive()) showBeraniChallenge(sq, level);
  else if (type === 'berani') renderChallenge('dare', sq, level); // non-liar: treat as dare
  else renderChallenge(type, sq, level);
}

function showJokerCell(sq, level) {
  jokerCount[turn]++;
  sfx.jokerGet();
  updateUI();
  document.getElementById('btn-joker').classList.remove('visible');
  stopTimer(); // no timer for joker cells
  document.getElementById('tod-body').innerHTML = `
    <div class="tod-type-badge">
      <span class="tod-type-pill" style="background:rgba(252,211,77,0.2);border:1.5px solid #fcd34d;color:#fcd34d">🃏 JOKER</span>
    </div>
    <div class="tod-challenge" style="font-size:15px;line-height:1.7">
      <div style="font-size:40px;margin-bottom:12px;animation:jokerPop 0.5s ease">🃏</div>
      Kamu dapat <strong style="color:#fcd34d">Joker Token</strong>!<br/>
      Simpan untuk skip tantangan gratis kapanpun.<br/>
      <small style="color:#aaa;font-size:13px">Total joker kamu: ${jokerCount[turn]}x</small>
    </div>
    <div class="tod-action-btns" style="grid-template-columns:1fr">
      <button type="button" class="btn-done" data-action="tod-done" data-completed="true">✅ Sip, lanjut!</button>
    </div>`;
  registerTodReviewSnapshot(sq, '🃏 JOKER');
}

function showDuoChallenge(sq, level) {
  const duoPool = getPool().duo;
  const duoChosen = pickUnused(duoPool, usedDuoSet);
  const aku = PLAYERS[turn].name;
  const kamu = PLAYERS[(turn + 1) % 2].name;
  const challenge = duoChosen
    .replace(/\{AKU\}/g, `<strong style="color:${PLAYERS[turn].colorHex}">${aku}</strong>`)
    .replace(/\{KAMU\}/g, `<strong style="color:${PLAYERS[(turn + 1) % 2].colorHex}">${kamu}</strong>`);
  // DUO = dare-like, so start timer
  const duoParsed = parseDurationFromText(duoChosen);
  if (duoParsed === -1) {
    stopTimer(); // open-ended
  } else {
    if (duoParsed && duoParsed !== -1) showTimerIdle(duoParsed); else stopTimer();
  }
  document.getElementById('tod-body').innerHTML = `
    <div class="tod-type-badge">
      <span class="tod-type-pill pill-duo">⚡ BERDUA</span>
    </div>
    <div class="tod-challenge" style="font-size:15px;line-height:1.7">${challenge}</div>
    <div class="tod-action-btns">
      <button type="button" class="btn-done" data-action="tod-done" data-completed="true">✅ Selesai!</button>
      <button type="button" class="btn-skip" data-action="try-skip">❌ Skip (−3)</button>
    </div>
    <div class="tod-rule">Tantangan untuk kalian berdua! 💕</div>`;
  registerTodReviewSnapshot(sq, '⚡ Duo');
}

function showWildChoice(sq, level) {
  const p = PLAYERS[turn];
  stopTimer(); // no timer while choosing
  document.getElementById('btn-joker').classList.remove('visible');
  document.getElementById('tod-body').innerHTML = `
    <div class="tod-type-badge">
      <span class="tod-type-pill pill-wild">🎯 WILD</span>
    </div>
    <div class="tod-challenge" style="font-size:16px;line-height:1.6">
      <strong style="color:${p.colorHex}">${p.name}</strong> bebas pilih tantangannya! ✨
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <button type="button" data-action="resolve-wild" data-wild="truth" data-sq="${sq}" data-level="${level}" style="
        padding:20px 12px;border:none;border-radius:16px;color:white;
        background:linear-gradient(135deg,#6366f1,#8b5cf6);
        font-family:'Nunito',sans-serif;font-weight:900;font-size:17px;
        cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;
        box-shadow:0 6px 24px rgba(99,102,241,0.35)">
        <span style="font-size:28px">🤫</span>TRUTH
        <span style="font-size:11px;opacity:.8">Jujur saja</span>
      </button>
      <button type="button" data-action="resolve-wild" data-wild="dare" data-sq="${sq}" data-level="${level}" style="
        padding:20px 12px;border:none;border-radius:16px;color:white;
        background:linear-gradient(135deg,#f43f5e,#fb923c);
        font-family:'Nunito',sans-serif;font-weight:900;font-size:17px;
        cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;
        box-shadow:0 6px 24px rgba(244,63,94,0.35)">
        <span style="font-size:28px">🔥</span>DARE
        <span style="font-size:11px;opacity:.8">Berani kan?</span>
      </button>
    </div>`;
  registerTodReviewSnapshot(sq, '🎯 Wild');
}

function resolveWild(type, sq, level) {
  currentTodType = type;
  const jokerBtn = document.getElementById('btn-joker');
  if (jokerCount[turn] > 0) {
    jokerBtn.classList.add('visible');
    jokerBtn.textContent = `🃏 Joker: Skip Gratis + Imun Ular! (${jokerCount[turn]}x)`;
  }
  renderChallenge(type, sq, level);
}

function renderChallenge(type, sq, level) {
  let pool, used;
  const C = getPool();
  if (type === 'truth') {
    pool = level === 'mild' ? C.truth.mild : level === 'medium' ? C.truth.medium : C.truth.hot;
    // Mix in custom truths
    if (customTruths.length > 0) {
      const available = customTruths.filter((_, i) => !usedCustomTruth.includes(i));
      if (available.length === 0) { usedCustomTruth = []; }
      // 35% chance to use custom if available
      if (customTruths.length && Math.random() < 0.35) {
        const ci = customTruths.findIndex((_, i) => !usedCustomTruth.includes(i));
        if (ci >= 0) {
          usedCustomTruth.push(ci);
          const aku = PLAYERS[turn].name;
          const kamu = PLAYERS[(turn + 1) % 2].name;
          const challenge = sanitizeText(customTruths[ci])
            .replace(/\{AKU\}/g, `<strong style="color:${PLAYERS[turn].colorHex}">${aku}</strong>`)
            .replace(/\{KAMU\}/g, `<strong style="color:${PLAYERS[(turn + 1) % 2].colorHex}">${kamu}</strong>`);
          stopTimer();
          document.getElementById('tod-body').innerHTML = `
            <div class="tod-type-badge">
              <span class="tod-type-pill pill-truth">🤫 TRUTH <span style="font-size:9px;opacity:.7">✏️ KUSTOM</span></span>
            </div>
            <div class="tod-challenge" style="font-size:15px;line-height:1.7">${challenge}</div>
            <div class="tod-action-btns">
              <button type="button" class="btn-done" data-action="tod-done" data-completed="true">✅ Selesai!</button>
              <button type="button" class="btn-skip" data-action="try-skip">❌ Skip (−3)</button>
            </div>
            <div class="tod-rule">Jawab jujur ya... 👀</div>`;
          registerTodReviewSnapshot(sq, '🤫 Truth ✏️');
          return;
        }
      }
    }
    used = usedTruth[level];
  } else {
    pool = level === 'mild' ? C.dare.mild : level === 'medium' ? C.dare.medium : C.dare.hot;
    // Mix in custom dares
    if (customDares.length > 0) {
      const available = customDares.filter((_, i) => !usedCustomDare.includes(i));
      if (available.length === 0) { usedCustomDare = []; }
      if (customDares.length && Math.random() < 0.35) {
        const ci = customDares.findIndex((_, i) => !usedCustomDare.includes(i));
        if (ci >= 0) {
          usedCustomDare.push(ci);
          const aku = PLAYERS[turn].name;
          const kamu = PLAYERS[(turn + 1) % 2].name;
          const challenge = sanitizeText(customDares[ci])
            .replace(/\{AKU\}/g, `<strong style="color:${PLAYERS[turn].colorHex}">${aku}</strong>`)
            .replace(/\{KAMU\}/g, `<strong style="color:${PLAYERS[(turn + 1) % 2].colorHex}">${kamu}</strong>`);
          const customParsed = parseDurationFromText(customDares[ci]);
          if (customParsed === -1) {
            stopTimer();
          } else {
            if (customParsed && customParsed !== -1) showTimerIdle(customParsed); else stopTimer();
          }
          document.getElementById('tod-body').innerHTML = `
            <div class="tod-type-badge">
              <span class="tod-type-pill pill-dare">🔥 DARE <span style="font-size:9px;opacity:.7">✏️ KUSTOM</span></span>
            </div>
            <div class="tod-challenge" style="font-size:15px;line-height:1.7">${challenge}</div>
            <div class="tod-action-btns">
              <button type="button" class="btn-done" data-action="tod-done" data-completed="true">✅ Selesai!</button>
              <button type="button" class="btn-skip" data-action="try-skip">❌ Skip (−3)</button>
            </div>
            <div class="tod-rule">Berani lakukan ini? 🔥</div>`;
          registerTodReviewSnapshot(sq, '🔥 Dare ✏️');
          return;
        }
      }
    }
    used = usedDare[level];
  }
  // No-repeat: pick from global session set
  const activeSet = type === 'truth' ? usedTruthSet : usedDareSet;
  const chosenText = pickUnused(pool, activeSet);

  const aku = PLAYERS[turn].name;
  const kamu = PLAYERS[(turn + 1) % 2].name;
  const challenge = chosenText
    .replace(/\{AKU\}/g, `<strong style="color:${PLAYERS[turn].colorHex}">${aku}</strong>`)
    .replace(/\{KAMU\}/g, `<strong style="color:${PLAYERS[(turn + 1) % 2].colorHex}">${kamu}</strong>`);
  const isT = type === 'truth';

  // Show timer in idle state for DARE — player starts manually
  if (!isT) {
    const parsed = parseDurationFromText(chosenText);
    if (parsed === -1) {
      stopTimer(); // open-ended challenge — no timer
    } else {
      if (parsed && parsed !== -1) showTimerIdle(parsed); else stopTimer();
    }
  } else {
    stopTimer(); // no timer for truth
  }

  document.getElementById('tod-body').innerHTML = `
    <div class="tod-type-badge">
      <span class="tod-type-pill ${isT ? 'pill-truth' : 'pill-dare'}">${isT ? '🤫 TRUTH' : '🔥 DARE'}</span>
    </div>
    <div class="tod-challenge" style="font-size:15px;line-height:1.7">${challenge}</div>
    <div class="tod-action-btns">
      <button type="button" class="btn-done" data-action="tod-done" data-completed="true">✅ Selesai!</button>
      <button type="button" class="btn-skip" data-action="try-skip">❌ Skip (−3)</button>
    </div>
    <div class="tod-rule">${isT ? 'Jawab jujur ya... 👀' : 'Berani lakukan ini? 🔥'}</div>`;
  registerTodReviewSnapshot(sq, isT ? '🤫 Truth' : '🔥 Dare');
}

function useJoker() {
  if (jokerCount[turn] <= 0) return;
  // Joker tidak berlaku untuk Kartu Berani
  if (currentTodType === 'berani') {
    showStreakToast('🃏 Joker tidak berlaku untuk Kartu Berani!');
    return;
  }
  jokerCount[turn]--;
  sfx.joker();
  addLog(`🃏 ${PLAYERS[turn].name} pakai Joker! Skip gratis + imun ular aktif! (sisa: ${jokerCount[turn]})`);
  stopTimer();
  document.getElementById('tod-overlay').classList.remove('show');
  resolveAfterTOD(true, true /* isJoker */);
}

function useJokerFromPanel(playerIdx) {
  if (phase !== 'tod') return;
  if (playerIdx !== turn) return;
  if (jokerCount[turn] <= 0) return;
  useJoker();
}

function todDone(completed) {
  stopTimer();
  document.getElementById('tod-overlay').classList.remove('show');
  resolveAfterTOD(completed, false);
}

// Enhancement 3: skip ke-2 butuh konfirmasi inline
function trySkip() {
  // Kartu Berani wajib dilakukan — tidak bisa di-skip
  if (currentTodType === 'berani') {
    showStreakToast('💪 Kartu Berani wajib dilakukan!');
    return;
  }
  if (skipStreak[turn] >= 1) {
    // skip ke-2 = langsung hukuman berat — tampilkan konfirmasi
    const penalty = SKIP_OVER_LIMIT_PENALTY;
    const skipHint = `Ini <strong style="color:#f87171">skip ke-2</strong> — melebihi batas! Hukuman: mundur <strong style="color:#f43f5e">${penalty} kotak</strong>.`;
    window._todPrevBodyForSkip = document.getElementById('tod-body').innerHTML;
    document.getElementById('tod-body').innerHTML = `
      <div style="text-align:center;padding:16px 4px">
        <div style="font-size:36px;margin-bottom:10px">⚠️</div>
        <div style="font-family:'Playfair Display',serif;font-size:16px;color:#fca5a5;margin-bottom:6px">Yakin mau skip?</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:20px">${skipHint}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <button type="button" class="btn-skip" data-action="tod-done" data-completed="false" style="background:linear-gradient(135deg,#f43f5e,#dc2626);color:white;font-weight:900;border:none">
            ✅ Ya, Skip!
          </button>
          <button type="button" class="btn-done" data-action="cancel-skip-confirm" style="font-size:13px">
            ❌ Batal, Lanjut!
          </button>
        </div>
      </div>`;
    sfx.skip();
    return;
  }
  // First skip — no confirmation needed
  todDone(false);
}

// Internal auto-done (timer ran out) — doesn't remove overlay (already removed by stopTimer timing)
function todDoneInternal(completed) {
  document.getElementById('tod-overlay').classList.remove('show');
  resolveAfterTOD(completed, false);
}

function resolveAfterTOD(completed, isJoker) {
  let afterPos;
  if (isJoker || completed) {
    if (!isJoker) {
      sfx.done();
      skipStreak[turn] = 0;
      stats[turn].done++;
      stats[turn].curStreak++;
      if (stats[turn].curStreak > stats[turn].maxStreak) stats[turn].maxStreak = stats[turn].curStreak;
      if (currentTodType === 'truth') stats[turn].truths++;
      else if (currentTodType === 'dare' || currentTodType === 'berani') stats[turn].dares++;
      else if (currentTodType === 'duo') stats[turn].duos++;
      else if (currentTodType === 'wild') stats[turn].wilds++;

      // 🎊 Confetti on streak milestones (3, 5, 7...)
      const streak = stats[turn].curStreak;
      if (streak >= 3 && streak % 2 === 1) {
        const streakColors = ['#f43f5e', '#fcd34d', '#f472b6', '#fff'];
        setTimeout(() => launchConfetti(
          window.innerWidth * (turn === 0 ? 0.25 : 0.75),
          window.innerHeight * 0.45,
          streak >= 5 ? 80 : 50,
          { colors: streakColors, spread: 1.2 }
        ), 150);
        // Toast message
        const msgs = { 3: '🔥 ON FIRE! 3x berturut-turut!', 5: '🔥🔥 UNSTOPPABLE! 5x!', 7: '🔥🔥🔥 LEGENDARY! 7x!', 9: '💥 GODMODE! 9x!!!' };
        const toastMsg = msgs[streak] || (streak % 2 === 1 ? `🔥 ${streak}x STREAK!` : null);
        if (toastMsg) showStreakToast(`${PLAYERS[turn].name} — ${toastMsg}`);
      }
    } else {
      stats[turn].jokerUsed++;
    }

    if (isJoker) {
      // 🃏 JOKER PRIVILEGE: snake immunity — jika pendAfter < pendRaw (ular), abaikan
      const isSnake = pendAfter < pendRaw;
      const isLadder = pendAfter > pendRaw;
      if (isSnake) {
        afterPos = pendRaw; // ular diabaikan, tetap di kotak landing
        addLog(`🃏✨ Joker aktif! Ular di kotak ${pendRaw} diabaikan — ${PLAYERS[turn].name} tetap di sini!`);
      } else if (isLadder) {
        afterPos = pendAfter; // tangga tetap berlaku
        addLog(`🃏🪜 Joker + Tangga! ${PLAYERS[turn].name} naik → kotak ${pendAfter}`);
        stats[turn].ladderHits++;
      } else {
        afterPos = pendRaw;
        addLog(`🃏 ${PLAYERS[turn].name} pakai Joker — skip gratis, tetap di kotak ${pendRaw}!`);
      }
    } else {
      afterPos = pendAfter;
      if (pendAfter < pendRaw) { addLog(`💕 Selesai! 🐍 Turun → kotak ${pendAfter}`); stats[turn].snakeHits++; }
      else if (pendAfter > pendRaw) { addLog(`💕 Selesai! 🪜 Naik → kotak ${pendAfter}`); stats[turn].ladderHits++; }
      else addLog(`💕 ${PLAYERS[turn].name} selesai tantangan!`);
    }
  } else {
    sfx.skip();
    stats[turn].skipped++;
    stats[turn].curStreak = 0;
    skipStreak[turn]++;
    // FIX: threshold >= 2 (konsisten dengan warning di trySkip & showTOD yang cek >= 2)
    if (skipStreak[turn] >= 2) {
      skipStreak[turn] = 0;
      const overP = currentTodType === 'berani' ? SKIP_OVER_LIMIT_PENALTY_BERANI : SKIP_OVER_LIMIT_PENALTY;
      afterPos = Math.max(1, pendRaw - overP);
      addLog(`🔥 Hukuman skip berlebihan! ${PLAYERS[turn].name} mundur ${overP} kotak → kotak ${afterPos}`);
      sfx.snake();
      vib([90, 40, 90, 40, 100, 40, 150]);
    } else {
      const penalty = currentTodType === 'berani' ? 5 : 3;
      afterPos = Math.max(1, pendRaw - penalty);
      addLog(`😅 Skip ${skipStreak[turn]}/2 — ${PLAYERS[turn].name} mundur ${penalty} ke ${afterPos}${currentTodType === 'berani' ? ' 😬' : ''}`);
    }
  }

  const bonusTurn = completed && pendDice === 6 && !isJoker;
  totalRounds++;
  if (bonusTurn) stats[turn].bonusTurns++;
  updateStatsMini();

  const proceed = () => {
    if (pos[turn] === 100) { updateUI(); endGame(); return; }
    if (bonusTurn) {
      sfx.bonusTurn();
      addLog(`🎲 Dadu 6 — ${PLAYERS[turn].name} dapat giliran tambahan!`);
      phase = 'roll'; updateUI(); saveGame();
    } else {
      nextTurn();
    }
  };

  if (afterPos !== pendRaw) {
    animateSnakeLadder(turn, pendRaw, afterPos, () => {
      if (pos[turn] === 100) { updateUI(); endGame(); return; }
      proceed();
    });
  } else {
    pos[turn] = pendRaw;
    proceed();
  }
}

// ─── FLOW ────────────────────────────────────────────────────────
function nextTurn() {
  turn = (turn + 1) % 2;
  phase = 'roll';
  updateUI();
  addLog(`🎲 Giliran ${PLAYERS[turn].name}!`);
  saveGame();
}

function endGame() {
  phase = 'done'; updateUI();
  stopTimer();
  stopDurationTimer();
  try { localStorage.removeItem(SAVE_KEY); } catch (e) { }
  sfx.winner(); vib([100, 50, 100, 50, 200]);
  // Big confetti burst on win!
  setTimeout(() => launchConfetti(window.innerWidth / 2, window.innerHeight * 0.35, 180), 100);
  setTimeout(() => launchConfetti(window.innerWidth * 0.25, window.innerHeight * 0.4, 80), 400);
  setTimeout(() => launchConfetti(window.innerWidth * 0.75, window.innerHeight * 0.4, 80), 600);
  const p = PLAYERS[turn];
  document.getElementById('winner-name').textContent = `${p.name} 🏆`;
  document.getElementById('winner-stats-body').innerHTML = buildStatsHTML(true);
  setTimeout(() => document.getElementById('winner-overlay').classList.add('show'), 500);
}

function showMoodConfirm() {
  document.getElementById('confirm-mode-overlay').classList.add('show');
  sfx.pop(0.05);
}

function hideMoodConfirm() {
  document.getElementById('confirm-mode-overlay').classList.remove('show');
}

function goToMoodScreen() {
  // Full reset then show name screen with mood selector
  stopTimer();
  stopBgMusic();
  resetDurationTimer();
  // Reset all state
  pos = [1, 1]; turn = 0; phase = 'roll';
  pendRaw = null; pendAfter = null; pendDice = 0; rolling = false;
  usedTruth = { mild: [], medium: [], hot: [] };
  usedDare = { mild: [], medium: [], hot: [] };
  usedLiarTruth = []; usedLiarDare = [];
  usedDuo = [];
  usedTruthSet = new Set(); usedDareSet = new Set(); usedDuoSet = new Set(); usedBeraniSet = new Set();
  window._adaptedDir = null;
  usedCustomTruth = []; usedCustomDare = [];
  skipStreak = [0, 0]; jokerCount = [0, 0];
  currentTodType = null;
  stats = [
    { done: 0, skipped: 0, truths: 0, dares: 0, duos: 0, wilds: 0, jokerUsed: 0, snakeHits: 0, ladderHits: 0, bonusTurns: 0, maxStreak: 0, curStreak: 0 },
    { done: 0, skipped: 0, truths: 0, dares: 0, duos: 0, wilds: 0, jokerUsed: 0, snakeHits: 0, ladderHits: 0, bonusTurns: 0, maxStreak: 0, curStreak: 0 },
  ];
  totalRounds = 0;
  hideTodReviewOverlay();
  resetTodReviewHistory();
  // Hide overlays
  ['winner-overlay', 'recap-overlay', 'tod-overlay', 'stats-overlay', 'tod-review-overlay'].forEach(id => {
    document.getElementById(id).classList.remove('show');
  });
  // Reset mood UI
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
  const moodId = 'mood-' + currentMood;
  const mb = document.getElementById(moodId);
  if (mb) mb.classList.add('active');
  // Show name screen
  document.getElementById('name-screen').style.display = 'flex';
  applySantaiModeUI();
  initPionPickers();
  document.getElementById('mood-badge-bar').innerHTML = '';
}

function confirmReset() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) { }
  stopTimer();
  stopBgMusic();
  bgMusicOn = false;
  const btnM = document.getElementById('btn-music');
  if (btnM) { btnM.className = 'btn-music-wrap'; btnM.innerHTML = '<span class="music-dot"></span>🎵'; }
  resetDurationTimer();
  pos = [1, 1]; turn = 0; phase = 'roll';
  pendRaw = null; pendAfter = null; pendDice = 0; rolling = false;
  usedTruth = { mild: [], medium: [], hot: [] };
  usedDare = { mild: [], medium: [], hot: [] };
  usedDuo = [];
  // FIX: reset Set-based no-repeat trackers (sebelumnya terlewat, hanya legacy arrays yang direset)
  usedTruthSet = new Set(); usedDareSet = new Set(); usedDuoSet = new Set(); usedBeraniSet = new Set();
  window._adaptedDir = null;
  usedCustomTruth = [];
  usedCustomDare = [];
  skipStreak = [0, 0];
  jokerCount = [0, 0];
  currentTodType = null;
  stats = [
    {
      done: 0, skipped: 0, truths: 0, dares: 0, duos: 0, wilds: 0, jokerUsed: 0,
      snakeHits: 0, ladderHits: 0, bonusTurns: 0, maxStreak: 0, curStreak: 0
    },
    {
      done: 0, skipped: 0, truths: 0, dares: 0, duos: 0, wilds: 0, jokerUsed: 0,
      snakeHits: 0, ladderHits: 0, bonusTurns: 0, maxStreak: 0, curStreak: 0
    },
  ];
  totalRounds = 0;
  initCellTypes();
  document.getElementById('winner-overlay').classList.remove('show');
  document.getElementById('recap-overlay').classList.remove('show');
  document.getElementById('tod-overlay').classList.remove('show');
  document.getElementById('mood-badge-bar').innerHTML = '';
  resetTodReviewHistory();
  document.getElementById('game-log').innerHTML = `<div class="log-entry">💕 Game direset!</div>`;
  buildBoard();
  drawSnakesLadders();
  initPions();
  document.getElementById('dice-wrap').innerHTML = `<rect rx="14" width="100" height="100" fill="#2a0f1e"/><text x="50" y="66" text-anchor="middle" font-size="44">🎲</text>`;
  updateUI();
}

// ─── STATS ───────────────────────────────────────────────────────
function updateStatsMini() {
  for (let i = 0; i < 2; i++) {
    const s = stats[i];
    document.getElementById(`pstat-mini-${i}`).textContent = `✅${s.done} ❌${s.skipped}`;
  }
}

function getAchievements() {
  const achs = [];
  if (stats[0].dares >= 3 || stats[1].dares >= 3) {
    const who = stats[0].dares >= stats[1].dares ? 0 : 1;
    achs.push({ icon: '🔥', name: PLAYERS[who].name, text: `Paling berani — ${stats[who].dares} dare selesai!` });
  }
  if (stats[0].truths >= 3 || stats[1].truths >= 3) {
    const who = stats[0].truths >= stats[1].truths ? 0 : 1;
    achs.push({ icon: '🤫', name: PLAYERS[who].name, text: `Paling jujur — ${stats[who].truths} truth dijawab!` });
  }
  if (stats[0].skipped > 0 || stats[1].skipped > 0) {
    const who = stats[0].skipped >= stats[1].skipped ? 0 : 1;
    if (stats[who].skipped > 0)
      achs.push({ icon: '😅', name: PLAYERS[who].name, text: `Paling sering skip — ${stats[who].skipped}x kabur!` });
  }
  if (stats[0].ladderHits > 0 || stats[1].ladderHits > 0) {
    const who = stats[0].ladderHits >= stats[1].ladderHits ? 0 : 1;
    achs.push({ icon: '🪜', name: PLAYERS[who].name, text: `Si Beruntung — ${stats[who].ladderHits}x naik tangga!` });
  }
  if (stats[0].snakeHits > 0 || stats[1].snakeHits > 0) {
    const who = stats[0].snakeHits >= stats[1].snakeHits ? 0 : 1;
    achs.push({ icon: '🐍', name: PLAYERS[who].name, text: `Si Sial — ${stats[who].snakeHits}x kena ular!` });
  }
  const best = stats[0].maxStreak >= stats[1].maxStreak ? 0 : 1;
  if (stats[best].maxStreak >= 3)
    achs.push({ icon: '⚡', name: PLAYERS[best].name, text: `On Fire! ${stats[best].maxStreak}x selesai berturut-turut!` });
  if (stats[0].jokerUsed + stats[1].jokerUsed > 0) {
    const who = stats[0].jokerUsed >= stats[1].jokerUsed ? 0 : 1;
    achs.push({ icon: '🃏', name: PLAYERS[who].name, text: `Joker Player — pakai joker ${stats[who].jokerUsed}x!` });
  }
  return achs;
}

function buildStatsHTML(isWinner) {
  const s0 = stats[0], s1 = stats[1];
  const c0 = PLAYERS[0].colorHex, c1 = PLAYERS[1].colorHex;
  const n0 = PLAYERS[0].name, n1 = PLAYERS[1].name;
  const r0 = s0.done + s0.skipped || 1, r1 = s1.done + s1.skipped || 1;
  const pct0 = Math.round(s0.done / r0 * 100), pct1 = Math.round(s1.done / r1 * 100);
  let html = `
    <div class="stats-grid">
      <div class="stat-block"><div class="stat-num" style="color:${c0}">${s0.done}</div><div class="stat-label">${n0} selesai</div></div>
      <div class="stat-block"><div class="stat-num" style="color:${c1}">${s1.done}</div><div class="stat-label">${n1} selesai</div></div>
      <div class="stat-block"><div class="stat-num" style="color:#9ca3af">${s0.skipped}</div><div class="stat-label">${n0} skip</div></div>
      <div class="stat-block"><div class="stat-num" style="color:#9ca3af">${s1.skipped}</div><div class="stat-label">${n1} skip</div></div>
    </div>
    <div class="stats-section-title">Tingkat Keberanian</div>
    <div class="stat-bar-wrap">
      <div class="stat-bar-label"><span style="color:${c0}">${n0}</span><span>${pct0}% selesai</span></div>
      <div class="stat-bar" style="width:${pct0}%;background:${c0}"></div>
    </div>
    <div class="stat-bar-wrap">
      <div class="stat-bar-label"><span style="color:${c1}">${n1}</span><span>${pct1}% selesai</span></div>
      <div class="stat-bar" style="width:${pct1}%;background:${c1}"></div>
    </div>
    <div class="stats-grid" style="margin-top:14px">
      <div class="stat-block"><div class="stat-num" style="color:#a5b4fc">${s0.truths + s1.truths}</div><div class="stat-label">Total Truth</div></div>
      <div class="stat-block"><div class="stat-num" style="color:#fda4af">${s0.dares + s1.dares}</div><div class="stat-label">Total Dare</div></div>
      <div class="stat-block"><div class="stat-num" style="color:#67e8f9">${s0.duos + s1.duos}</div><div class="stat-label">Tantangan Duo</div></div>
      <div class="stat-block"><div class="stat-num" style="color:#fcd34d">${totalRounds}</div><div class="stat-label">Total Giliran</div></div>
    </div>
    ${gameDurationSec > 0 ? `
    <div style="margin-top:12px;text-align:center;padding:10px;background:rgba(244,114,182,0.07);border:1px solid rgba(244,114,182,0.2);border-radius:12px">
      <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-bottom:3px;letter-spacing:1px">⏱️ DURASI PERMAINAN</div>
      <div style="font-size:22px;font-weight:900;color:#f9a8d4;letter-spacing:2px">${document.getElementById('duration-display')?.textContent || '00:00'}</div>
      <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:2px">${formatDuration(gameDurationSec)}</div>
    </div>` : ''}`;
  const achs = getAchievements();
  if (achs.length > 0) {
    html += `<div class="stats-section-title">🏅 Pencapaian</div>`;
    achs.forEach(a => {
      html += `<div class="stat-achievement"><span class="ach-icon">${a.icon}</span><div class="ach-text"><div class="ach-name">${a.name}</div>${a.text}</div></div>`;
    });
  }
  return html;
}

function showStats() {
  document.getElementById('stats-body').innerHTML = buildStatsHTML(false);
  document.getElementById('stats-overlay').classList.add('show');
}

function resetTodReviewHistory() {
  todReviewSnapshots = [];
  todReviewIdSeq = 0;
}

function stripInteractiveFromTodBodyHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  tmp.querySelectorAll('button, .tod-action-btns').forEach(el => el.remove());
  tmp.querySelectorAll('div').forEach(div => {
    if (div.children.length === 0 && !div.textContent.trim()) div.remove();
  });
  return tmp.innerHTML;
}

/** Simpan isi #tod-body (tanpa tombol) dan tambah baris log yang bisa diketuk */
function registerTodReviewSnapshot(sq, label) {
  const body = document.getElementById('tod-body');
  if (!body) return;
  const raw = body.innerHTML;
  if (!raw.trim()) return;
  const bodyHtml = stripInteractiveFromTodBodyHtml(raw);
  if (!bodyHtml.replace(/<[^>]+>/g, '').trim()) return;
  const id = ++todReviewIdSeq;
  const levelEl = document.getElementById('level-label');
  todReviewSnapshots.push({
    id,
    sq,
    label,
    playerName: PLAYERS[turn].name,
    playerColor: PLAYERS[turn].colorHex,
    bodyHtml,
    levelText: levelEl ? levelEl.innerText.replace(/\s+/g, ' ').trim() : '',
  });
  while (todReviewSnapshots.length > TOD_REVIEW_MAX) todReviewSnapshots.shift();
  addLog(`📋 ${label} · kotak ${sq} · ${PLAYERS[turn].name}`, id);
}

function showTodReviewOverlay(snap) {
  const ov = document.getElementById('tod-review-overlay');
  if (!ov || !snap) return;
  document.getElementById('tod-review-title').textContent = `${snap.label} · Kotak ${snap.sq}`;
  document.getElementById('tod-review-meta').textContent =
    `${snap.playerName}${snap.levelText ? ' · ' + snap.levelText : ''}`;
  document.getElementById('tod-review-body').innerHTML = snap.bodyHtml;
  ov.classList.add('show');
}

function hideTodReviewOverlay() {
  const ov = document.getElementById('tod-review-overlay');
  if (ov) ov.classList.remove('show');
}

function addLog(msg, reviewId) {
  const log = document.getElementById('game-log');
  const d = document.createElement('div');
  d.className = 'log-entry' + (reviewId != null ? ' log-entry-review' : '');
  d.textContent = msg;
  if (reviewId != null) {
    d.dataset.reviewId = String(reviewId);
    d.title = 'Ketuk untuk lihat kartu lagi';
  }
  log.insertBefore(d, log.firstChild);
  while (log.children.length > GAME_LOG_MAX_ENTRIES) log.removeChild(log.lastChild);
}

// ─── RECAP CARD (Canvas 2D — downloadable PNG) ───────────────────
const MOOD_META = {
  romantis: { emoji: '💕', label: 'Romantis', color: '#f472b6', bg1: '#2a0820', bg2: '#1a0f18' },
  playful: { emoji: '😜', label: 'Playful', color: '#fb923c', bg1: '#201208', bg2: '#180f0a' },
  liar: { emoji: '🔥', label: 'Liar', color: '#ef4444', bg1: '#220808', bg2: '#180808' },
};

function showRecap() {
  buildRecapCanvas();
  document.getElementById('recap-overlay').classList.add('show');
}

function downloadRecap() {
  const canvas = document.getElementById('recap-canvas');
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  const n0 = PLAYERS[0].name, n1 = PLAYERS[1].name;
  a.download = `tod-recap-${n0}-${n1}.png`;
  a.click();
}

function buildRecapCanvas() {
  const canvas = document.getElementById('recap-canvas');
  const ctx = canvas.getContext('2d');
  const W = 360, H = 640;
  canvas.width = W; canvas.height = H;

  const m = MOOD_META[currentMood] || MOOD_META.playful;
  const s0 = stats[0], s1 = stats[1];
  const wIdx = turn; // winner index
  const lIdx = (turn + 1) % 2;
  const wp = PLAYERS[wIdx], lp = PLAYERS[lIdx];

  // ── Background gradient ──
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, m.bg1);
  bgGrad.addColorStop(0.5, '#0f0810');
  bgGrad.addColorStop(1, m.bg2);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // ── Decorative radial glows ──
  const glow1 = ctx.createRadialGradient(W * 0.2, H * 0.15, 0, W * 0.2, H * 0.15, 200);
  glow1.addColorStop(0, `${m.color}28`);
  glow1.addColorStop(1, 'transparent');
  ctx.fillStyle = glow1; ctx.fillRect(0, 0, W, H);

  const glow2 = ctx.createRadialGradient(W * 0.8, H * 0.85, 0, W * 0.8, H * 0.85, 180);
  glow2.addColorStop(0, `${PLAYERS[lIdx].colorHex}22`);
  glow2.addColorStop(1, 'transparent');
  ctx.fillStyle = glow2; ctx.fillRect(0, 0, W, H);

  // ── Scattered hearts ──
  const hearts = ['💕', '💗', '✨', '💖', '🌹', '💫'];
  ctx.font = '14px serif';
  ctx.globalAlpha = 0.22;
  const heartPositions = [
    [28, 38], [310, 55], [45, 300], [325, 280], [18, 500], [340, 490],
    [80, 600], [280, 580], [160, 22], [200, 618], [55, 170], [305, 420]
  ];
  heartPositions.forEach(([x, y], i) => {
    ctx.fillText(hearts[i % hearts.length], x, y);
  });
  ctx.globalAlpha = 1;

  // ── Top border line ──
  const lineGrad = ctx.createLinearGradient(0, 0, W, 0);
  lineGrad.addColorStop(0, 'transparent');
  lineGrad.addColorStop(0.3, m.color);
  lineGrad.addColorStop(0.7, wp.colorHex);
  lineGrad.addColorStop(1, 'transparent');
  ctx.strokeStyle = lineGrad; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(W, 4); ctx.stroke();

  // ── Header: title ──
  ctx.textAlign = 'center';
  ctx.font = 'bold 11px Nunito, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillText('TRUTH OR DARE • FOR COUPLES', W / 2, 28);
  ctx.font = '11px Nunito, sans-serif';
  ctx.fillStyle = m.color;
  ctx.fillText(`${m.emoji} Mode ${m.label.toUpperCase()}`, W / 2, 48);

  // ── Trophy & winner block ──
  ctx.font = '52px serif';
  ctx.textAlign = 'center';
  ctx.fillText('🏆', W / 2, 118);

  ctx.font = 'bold 11px Nunito, sans-serif';
  ctx.fillStyle = 'rgba(244,63,94,0.8)';
  ctx.letterSpacing = '4px';
  ctx.fillText('P E M E N A N G', W / 2, 148);

  // Winner name with gradient
  const nameGrad = ctx.createLinearGradient(W / 2 - 100, 0, W / 2 + 100, 0);
  nameGrad.addColorStop(0, wp.colorHex);
  nameGrad.addColorStop(1, '#fcd34d');
  ctx.fillStyle = nameGrad;
  ctx.font = 'bold 32px Playfair Display, serif';
  ctx.fillText(wp.name, W / 2, 185);

  ctx.font = '13px Nunito, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText(`Sampai di kotak 100! 💋`, W / 2, 208);

  // ── Divider ──
  const div1 = ctx.createLinearGradient(40, 0, W - 40, 0);
  div1.addColorStop(0, 'transparent');
  div1.addColorStop(0.4, `${wp.colorHex}66`);
  div1.addColorStop(0.6, `${lp.colorHex}66`);
  div1.addColorStop(1, 'transparent');
  ctx.strokeStyle = div1; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(40, 222); ctx.lineTo(W - 40, 222); ctx.stroke();

  // ── Stats grid (2x2) ──
  function statBox(x, y, w, h, val, label, col) {
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    roundRect(ctx, x, y, w, h, 12); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, w, h, 12); ctx.stroke();
    ctx.fillStyle = col || 'white';
    ctx.font = 'bold 26px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(val, x + w / 2, y + h * 0.55);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '10px Nunito, sans-serif';
    ctx.fillText(label.toUpperCase(), x + w / 2, y + h * 0.82);
  }

  const bw = 78, bh = 64, gap = 8, startX = 20, sy = 236;
  statBox(startX, sy, bw, bh, s0.done + s1.done, 'Selesai', '#10b981');
  statBox(startX + bw + gap, sy, bw, bh, s0.skipped + s1.skipped, 'Skip', '#9ca3af');
  statBox(startX + 2 * (bw + gap), sy, bw, bh, s0.truths + s1.truths, 'Truth', '#a5b4fc');
  statBox(startX + 3 * (bw + gap), sy, bw, bh, s0.dares + s1.dares, 'Dare', '#fda4af');

  // ── Player comparison bars ──
  const barY = 318;
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = 'bold 10px Nunito, sans-serif';
  ctx.fillText('PERBANDINGAN PEMAIN', 20, barY);

  function playerBar(y, player, s, isWinner) {
    const total = s.done + s.skipped || 1;
    const pct = s.done / total;
    const maxW = W - 40;

    // Player name
    ctx.fillStyle = player.colorHex;
    ctx.font = `bold 13px Nunito, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText((isWinner ? '🏆 ' : '') + player.name, 20, y + 14);

    // Bar bg
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    roundRect(ctx, 20, y + 18, maxW, 10, 5); ctx.fill();

    // Bar fill
    const bGrad = ctx.createLinearGradient(20, 0, 20 + maxW * pct, 0);
    bGrad.addColorStop(0, player.colorHex + 'cc');
    bGrad.addColorStop(1, player.colorHex);
    ctx.fillStyle = bGrad;
    roundRect(ctx, 20, y + 18, maxW * pct, 10, 5); ctx.fill();

    // Percent label
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '10px Nunito, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`✅${s.done} ❌${s.skipped} (${Math.round(pct * 100)}%)`, W - 20, y + 14);
  }

  playerBar(barY + 8, PLAYERS[wIdx], stats[wIdx], true);
  playerBar(barY + 46, PLAYERS[lIdx], stats[lIdx], false);

  // ── Achievements section ──
  const achs = getAchievements().slice(0, 3);
  if (achs.length > 0) {
    const achY = 440;
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 10px Nunito, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('PENCAPAIAN', 20, achY);

    achs.forEach((a, i) => {
      const ay = achY + 10 + i * 36;
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      roundRect(ctx, 20, ay, W - 40, 30, 8); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1;
      roundRect(ctx, 20, ay, W - 40, 30, 8); ctx.stroke();
      ctx.font = '15px serif';
      ctx.fillText(a.icon, 32, ay + 20);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 11px Nunito, sans-serif';
      ctx.fillText(a.name, 56, ay + 14);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '10px Nunito, sans-serif';
      ctx.fillText(a.text, 56, ay + 26);
    });
  }

  // ── Footer ──
  const footerY = H - 38;
  const footGrad = ctx.createLinearGradient(0, footerY, W, footerY);
  footGrad.addColorStop(0, 'transparent');
  footGrad.addColorStop(0.3, `${m.color}55`);
  footGrad.addColorStop(0.7, `${wp.colorHex}55`);
  footGrad.addColorStop(1, 'transparent');
  ctx.strokeStyle = footGrad; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, footerY); ctx.lineTo(W, footerY); ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '10px Nunito,sans-serif';
  ctx.fillText(`💋 Truth or Dare · ${totalRounds} giliran · ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, W / 2, H - 18);

  // Bottom border
  ctx.strokeStyle = lineGrad; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, H - 4); ctx.lineTo(W, H - 4); ctx.stroke();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// ─── PION SVGs ───────────────────────────────────────────────────
// ─── BIDAK CATALOG (pilih saat name screen) ─────────────────────
const ALL_PIONS = [
  { label: '🎀 Hello Kitty', svg: '<img src=\"data:image/png;base64,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1FAtLS36wx/+UMvLy/tkAP/u0N+jPeWUU/SnP/2pNjY2HhKfHk9OWWYolondu3frPffco+F222Na/hvtHHYmoysqKrjxxht1zZo12traegjxwth1NBMlR7MrY6BF2NXVpatXr9arr75aw86WzPLqqArUWGB0+GaUEJWVlSxatEjPP/98zj777HS3/0BVmP4e+0BdjoN9FW3m3wO1xA5kN+vr61m/fj3PPvsszz33nLzzzjvpzyKRSPqV86OuMceS6g63SGYSNDc3l3nz5umiRYtYsGABc+fOZcqUKemDxwfDtCMlEQazbbWrq4va2lpef/11Xn31VV555RU2bdokjY2N7zmff1gGDyTV4Us++n9WXl7OjBkztLKyklmzZjFu3DimTZtGQUEBxcXFlJWVEYvF0tdgEgjJZJKuri46OzvZv38/TU1N7N27l+rqanbt2sW2bdvYtm2b1NXVkUwmD3EiM3c5jAnBOR6cslAawlToe92fm5tLPB4nNzeXRCKh4etvI5EIsVisjy30PI/u7m48zyOZTNLe3i6tra10dnamdyYcKSoI04tj5UVgxx2DD5cd6x9mhLZypCUnU5v0t8vHQ9747y4Q6/PC58P8fbS2+njaI5VFFllkkUUWWWSRRRZZZJFFFllkkUUWWWSRRRZZZJFFFllkkUUWWWSRRRZZjAn8f6rwVaXyHXTmAAAAAElFTkSuQmCC\" style=\"width:100%;height:100%;object-fit:contain\"/>' },
  { label: '🐹 Hamtaro', svg: '<img src=\"data:image/png;base64,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\" style=\"width:100%;height:100%;object-fit:contain\"/>' },
  { label: '🐱 Pusheen', svg: '<img src=\"data:image/png;base64,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\" style=\"width:100%;height:100%;object-fit:contain\"/>' },
  { label: '🎀 Dasi', svg: '<img src=\"data:image/png;base64,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\" style=\"width:100%;height:100%;object-fit:contain\"/>' },
  { label: '🖤 Kuromi', svg: '<img src=\"data:image/png;base64,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\" style=\"width:100%;height:100%;object-fit:contain\"/>' },
];

// Active pion choices — index into ALL_PIONS
let selectedPion = [0, 1]; // default: kitty, hamtaro

// Get SVG for a player (uses selected pion)
function getPlayerSVG(playerIdx) {
  return ALL_PIONS[selectedPion[playerIdx]].svg;
}

// ─── CUSTOM TANTANGAN ────────────────────────────────────────────
let customTruths = [];
let customDares = [];
let customTab = 'truth';
let usedCustomTruth = [];
let usedCustomDare = [];

function showCustomOverlay() {
  renderCustomList();
  const o = document.getElementById('custom-overlay');
  if (o) o.style.display = 'flex';
}
function hideCustomOverlay() {
  const o = document.getElementById('custom-overlay');
  if (o) o.style.display = 'none';
}

function setCustomTab(tab) {
  customTab = tab;
  document.getElementById('ctab-truth').classList.toggle('active', tab === 'truth');
  document.getElementById('ctab-dare').classList.toggle('active', tab === 'dare');
  document.getElementById('custom-input').placeholder =
    tab === 'truth' ? 'Tulis pertanyaan Truth...' : 'Tulis tantangan Dare...';
  renderCustomList();
}

function addCustomTantangan() {
  const input = document.getElementById('custom-input');
  const text = input.value.trim();
  if (!text) return;
  const maxItems = 15;
  const arr = customTab === 'truth' ? customTruths : customDares;
  if (arr.length >= maxItems) { input.style.borderColor = '#f43f5e'; setTimeout(() => input.style.borderColor = '', 600); return; }
  arr.push(text);
  input.value = '';
  sfx.pop(0.08);
  renderCustomList();
  updateCustomCount();
}

function deleteCustom(tab, idx) {
  if (tab === 'truth') customTruths.splice(idx, 1);
  else customDares.splice(idx, 1);
  renderCustomList();
  updateCustomCount();
}

function renderCustomList() {
  const list = document.getElementById('custom-list');
  const arr = customTab === 'truth' ? customTruths : customDares;
  list.innerHTML = '';
  if (!arr.length) {
    const empty = document.createElement('div');
    empty.className = 'custom-empty';
    empty.textContent = `Belum ada tantangan kustom ${customTab === 'truth' ? 'Truth' : 'Dare'}.`;
    list.appendChild(empty);
    return;
  }
  const frag = document.createDocumentFragment();
  arr.forEach((t, i) => {
    const item = document.createElement('div');
    item.className = 'custom-item';
    const span = document.createElement('span');
    span.className = 'custom-item-text';
    span.textContent = t; // safe - no innerHTML
    const btn = document.createElement('button');
    btn.className = 'btn-custom-del';
    btn.textContent = '✕';
    btn.addEventListener('click', () => deleteCustom(customTab, i));
    item.appendChild(span);
    item.appendChild(btn);
    frag.appendChild(item);
  });
  list.appendChild(frag);
}

function updateCustomCount() {
  const total = customTruths.length + customDares.length;
  document.getElementById('custom-count-label').textContent = total ? `(${total})` : '(0)';
}




// ─── KARTU BERANI (mode Liar only) ───────────────────────────────
function showBeraniChallenge(sq, level) {
  const beraniPool = window.CHALLENGES_LIAR ? window.CHALLENGES_LIAR.berani : [];
  if (!beraniPool || beraniPool.length === 0) {
    renderChallenge('dare', sq, level);
    return;
  }
  const beraniChosen = pickUnused(beraniPool, usedBeraniSet);
  const aku = PLAYERS[turn].name;
  const kamu = PLAYERS[(turn + 1) % 2].name;
  const c0 = PLAYERS[turn].colorHex;
  const c1 = PLAYERS[(turn + 1) % 2].colorHex;
  currentTodType = 'berani';
  const beraniParsed = parseDurationFromText(beraniChosen);
  if (beraniParsed === -1) {
    stopTimer();
  } else {
    if (beraniParsed && beraniParsed !== -1) showTimerIdle(beraniParsed); else stopTimer();
  }
  const challenge = beraniChosen
    .replace(/\{AKU\}/g, `<strong style="color:${c0}">${aku}</strong>`)
    .replace(/\{KAMU\}/g, `<strong style="color:${c1}">${kamu}</strong>`);
  document.getElementById('tod-body').innerHTML = `
    <div class="tod-type-badge">
      <span class="tod-type-pill pill-berani">💪 KARTU BERANI</span>
    </div>
    <div class="tod-challenge" style="font-size:15px;line-height:1.7">${challenge}</div>
    <div class="tod-action-btns">
      <button type="button" class="btn-done" data-action="tod-done" data-completed="true">✅ Selesai!</button>
    </div>
    <div class="tod-rule" style="color:#fb923c">Kartu Berani — wajib dilakukan, tidak bisa di-skip! 💪</div>`;
  registerTodReviewSnapshot(sq, '💪 Berani');
}

// ─── BACKGROUND MUSIC ENGINE (Web Audio API) ─────────────────────
let bgMusicOn = false;
let bgMusicGain = null;
let bgMusicFilter = null;
let bgMusicScheduler = null;
let bgMusicBar = 0;

// Romantic lo-fi chord progression: extended with 8 bars for more variety
const BG_CHORDS = [
  { bass: 65.4, pads: [261, 311, 392, 466], name: 'Cm7' },
  { bass: 87.3, pads: [220, 261, 349, 440], name: 'Fm7' },
  { bass: 103.8, pads: [207, 261, 311, 415], name: 'Abmaj7' },
  { bass: 98.0, pads: [196, 233, 294, 392], name: 'Gm7' },
  { bass: 73.4, pads: [220, 277, 370, 440], name: 'Ebmaj7' },
  { bass: 87.3, pads: [174, 220, 294, 349], name: 'Fm9' },
  { bass: 116.5, pads: [233, 294, 349, 466], name: 'Bbmaj7' },
  { bass: 98.0, pads: [196, 247, 311, 392], name: 'G7' },
];

function toggleMusic() {
  bgMusicOn = !bgMusicOn;
  const btn = document.getElementById('btn-music');
  btn.className = bgMusicOn ? 'btn-music-wrap on' : 'btn-music-wrap';
  btn.innerHTML = bgMusicOn
    ? '<span class="music-dot"></span>🎵 ON'
    : '<span class="music-dot"></span>🎵';
  if (bgMusicOn) {
    startBgMusic();
  } else {
    stopBgMusic();
  }
}

function startBgMusic() {
  const ctx = getCtx();
  bgMusicGain = ctx.createGain();
  bgMusicGain.gain.setValueAtTime(0, ctx.currentTime);
  bgMusicGain.gain.linearRampToValueAtTime(0.13, ctx.currentTime + 1.5);
  bgMusicFilter = ctx.createBiquadFilter();
  bgMusicFilter.type = 'lowpass';
  bgMusicFilter.frequency.value = 900;
  bgMusicFilter.Q.value = 0.8;
  bgMusicGain.connect(bgMusicFilter);
  bgMusicFilter.connect(ctx.destination);
  bgMusicBar = 0;
  playMusicBar();
}

function stopBgMusic() {
  if (bgMusicScheduler) { clearTimeout(bgMusicScheduler); bgMusicScheduler = null; }
  if (bgMusicGain) {
    try {
      const ctx = getCtx();
      bgMusicGain.gain.setTargetAtTime(0, ctx.currentTime, 0.8);
    } catch (e) { }
    bgMusicGain = null;
  }
}

function playMusicBar() {
  if (!bgMusicOn || !bgMusicGain) return;
  const ctx = getCtx();
  const t = ctx.currentTime;
  const chord = BG_CHORDS[bgMusicBar % BG_CHORDS.length];
  const barDur = 3.2;

  // Bass note — warm sine with subtle vibrato
  const bass = ctx.createOscillator(), bg = ctx.createGain();
  bass.type = 'sine'; bass.frequency.value = chord.bass;
  bass.frequency.setValueAtTime(chord.bass, t);
  bass.frequency.linearRampToValueAtTime(chord.bass * 1.003, t + 1.6);
  bass.frequency.linearRampToValueAtTime(chord.bass, t + barDur);
  bg.gain.setValueAtTime(0, t);
  bg.gain.linearRampToValueAtTime(0.52, t + 0.4);
  bg.gain.setValueAtTime(0.52, t + barDur - 0.6);
  bg.gain.linearRampToValueAtTime(0, t + barDur);
  bass.connect(bg); bg.connect(bgMusicGain);
  bass.start(t); bass.stop(t + barDur + 0.1);

  // Pad chords — layered with slight detuning for warmth
  chord.pads.forEach((freq, i) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = i < 2 ? 'triangle' : 'sine';
    o.frequency.value = freq * (1 + (i % 2 ? 0.002 : -0.002)); // slight detune
    const vol = 0.26 - i * 0.04;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.55);
    g.gain.setValueAtTime(vol * 0.9, t + barDur - 0.55);
    g.gain.linearRampToValueAtTime(0, t + barDur);
    o.connect(g); g.connect(bgMusicGain);
    o.start(t); o.stop(t + barDur + 0.1);
  });

  // Arpeggio melody — pattern varies every 4 bars
  const barIdx = bgMusicBar % 4;
  const arpPatterns = [
    [2, 3, 2, 1, 3, 2],   // ascending
    [3, 2, 1, 2, 3, 1],   // descending
    [1, 3, 2, 3, 1, 2],   // alt
    [2, 1, 3, 1, 2, 3],   // cross
  ];
  const pat = arpPatterns[barIdx];
  pat.forEach((pi, i) => {
    const freq = chord.pads[pi % chord.pads.length];
    const octave = (bgMusicBar % 8 < 4) ? 2 : (i % 2 === 0 ? 2 : 4); // octave var every 8 bars
    const at = t + 0.12 + i * (barDur * 0.148);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.value = freq * octave;
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(0.065, at + 0.055);
    g.gain.exponentialRampToValueAtTime(0.001, at + 0.42);
    o.connect(g); g.connect(bgMusicGain);
    o.start(at); o.stop(at + 0.48);
  });

  // Soft hi-hat / percussion (noise bursts on beat 1 and 3)
  [0, barDur * 0.5].forEach(offset => {
    const bufSize = ctx.sampleRate * 0.04;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let k = 0; k < bufSize; k++) data[k] = (Math.random() * 2 - 1) * 0.35;
    const src = ctx.createBufferSource(), hpf = ctx.createBiquadFilter(), hg = ctx.createGain();
    hpf.type = 'highpass'; hpf.frequency.value = 6000;
    hg.gain.setValueAtTime(0.045, t + offset);
    hg.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.06);
    src.buffer = buf;
    src.connect(hpf); hpf.connect(hg); hg.connect(bgMusicGain);
    src.start(t + offset);
  });

  bgMusicBar++;
  bgMusicScheduler = setTimeout(playMusicBar, (barDur - 0.15) * 1000);
}

// ─── STREAK TOAST ─────────────────────────────────────────────────
let streakToastTimer = null;
function showStreakToast(msg) {
  const el = document.getElementById('streak-toast');
  if (!el) return;
  if (streakToastTimer) clearTimeout(streakToastTimer);
  el.textContent = msg;
  el.classList.add('show');
  streakToastTimer = setTimeout(() => {
    el.classList.remove('show');
    streakToastTimer = null;
  }, 2500);
}

// ─── CONFETTI ENGINE ──────────────────────────────────────────────
let confettiCanvas = null;
let confettiCtx = null;
function getConfettiCtx() {
  if (!confettiCanvas) {
    confettiCanvas = document.getElementById('confetti-canvas');
    confettiCtx = confettiCanvas.getContext('2d');
  }
  return confettiCtx;
}
let confettiParticles = [];
let confettiRAF = null;

const CONFETTI_COLORS = ['#f472b6', '#f43f5e', '#fcd34d', '#a855f7', '#fb923c', '#fda4af', '#c4b5fd', '#fff', '#fb7185', '#f9a8d4'];

class ConfettiParticle {
  constructor(x, y, options = {}) {
    this.x = x;
    this.y = y;
    const spread = options.spread || 1;
    this.vx = (Math.random() - 0.5) * 12 * spread;
    this.vy = -(Math.random() * 14 + 5) * spread;
    this.color = options.colors
      ? options.colors[Math.floor(Math.random() * options.colors.length)]
      : CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    this.w = Math.random() * 10 + 4;
    this.h = Math.random() * 6 + 3;
    this.rot = Math.random() * Math.PI * 2;
    this.rotV = (Math.random() - 0.5) * 0.35;
    this.gravity = 0.35;
    this.life = 1.0;
    this.decay = Math.random() * 0.007 + 0.010;
    // Shape: rect, circle, heart
    const r = Math.random();
    this.shape = r < 0.25 ? 'circle' : r < 0.5 ? 'heart' : 'rect';
  }
  update() {
    this.vy += this.gravity;
    this.vx *= 0.99;
    this.x += this.vx;
    this.y += this.vy;
    this.rot += this.rotV;
    this.life -= this.decay;
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.fillStyle = this.color;
    if (this.shape === 'circle') {
      ctx.beginPath(); ctx.arc(0, 0, this.w / 2, 0, Math.PI * 2); ctx.fill();
    } else if (this.shape === 'heart') {
      const s = this.w * 0.4;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.6);
      ctx.bezierCurveTo(-s * 1.5, -s * 0.4, -s * 2, s * 1.4, 0, s * 2.2);
      ctx.bezierCurveTo(s * 2, s * 1.4, s * 1.5, -s * 0.4, 0, s * 0.6);
      ctx.fill();
    } else {
      ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
    }
    ctx.restore();
  }
}

function launchConfetti(cx, cy, count = 90, options = {}) {
  getConfettiCtx();
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
  for (let i = 0; i < count; i++) {
    confettiParticles.push(new ConfettiParticle(
      cx ?? Math.random() * window.innerWidth,
      cy ?? window.innerHeight * 0.4,
      options
    ));
  }
  if (!confettiRAF) animateConfetti();
}

function animateConfetti() {
  getConfettiCtx();
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiParticles = confettiParticles.filter(p => p.life > 0 && p.y < confettiCanvas.height + 60);
  confettiParticles.forEach(p => { p.update(); p.draw(confettiCtx); });
  if (confettiParticles.length) {
    confettiRAF = requestAnimationFrame(animateConfetti);
  } else {
    confettiRAF = null;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}


window.addEventListener('load', () => {
  initActionDelegation();
  initInputListeners();
  checkSavedGame();
});

window.addEventListener('beforeunload', (e) => {
  if (phase !== 'done' && totalRounds > 0) {
    e.preventDefault();
    e.returnValue = '';
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const trev = document.getElementById('tod-review-overlay');
  if (trev && trev.classList.contains('show')) { hideTodReviewOverlay(); e.preventDefault(); return; }
  const rules = document.getElementById('rules-overlay');
  const custom = document.getElementById('custom-overlay');
  const stats = document.getElementById('stats-overlay');
  if (rules && rules.style.display === 'flex') { hideRules(); e.preventDefault(); return; }
  if (custom && custom.style.display === 'flex') { hideCustomOverlay(); e.preventDefault(); return; }
  if (stats && stats.classList.contains('show')) { stats.classList.remove('show'); e.preventDefault(); }
});

// ─── localStorage SAVE / LOAD ─────────────────────────────────────
const SAVE_KEY = 'tod_game_save_v2';

// ─── RULES OVERLAY ───────────────────────────────────────────────
function showRules() {
  const o = document.getElementById('rules-overlay');
  o.style.display = 'flex';
}
function hideRules() {
  const o = document.getElementById('rules-overlay');
  o.style.display = 'none';
}

function saveGame() {
  if (phase === 'done' || phase === 'roll' && pos[0] === 1 && pos[1] === 1 && totalRounds === 0) return;
  try {
    const data = {
      pos, turn, phase, pendRaw, pendAfter, pendDice,
      skipStreak, jokerCount, currentMood, santaiOnlyMode, totalRounds,
      currentTodType, gameDurationSec,
      players: PLAYERS.map(p => ({ name: p.name, colorHex: p.colorHex })),
      stats,
      usedTruth, usedDare,
      usedDuo,
      // Serialize Sets as arrays so no-repeat tracking survives resume
      usedTruthArr: [...usedTruthSet],
      usedDareArr: [...usedDareSet],
      usedDuoArr: [...usedDuoSet],
      usedBeraniArr: [...usedBeraniSet],
      CELL_TYPE,
      ts: Date.now(),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) { }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const d = JSON.parse(raw);
    // Expire save after 24 hours
    if (Date.now() - d.ts > 86400000) { localStorage.removeItem(SAVE_KEY); return false; }
    // Restore state
    pos = d.pos; turn = d.turn; phase = d.phase;
    pendRaw = d.pendRaw; pendAfter = d.pendAfter; pendDice = d.pendDice ?? 0;
    skipStreak = d.skipStreak; jokerCount = d.jokerCount;
    currentMood = d.currentMood; totalRounds = d.totalRounds;
    santaiOnlyMode = !!d.santaiOnlyMode;
    currentTodType = d.currentTodType ?? null;
    gameDurationSec = d.gameDurationSec ?? 0;
    d.players.forEach((p, i) => { PLAYERS[i].name = p.name; PLAYERS[i].colorHex = p.colorHex; });
    stats = d.stats;
    usedTruth = d.usedTruth; usedDare = d.usedDare;
    usedLiarTruth = []; usedLiarDare = [];
    usedDuo = d.usedDuo ?? []; usedBerani = d.usedBerani ?? [];
    // Rebuild Sets from saved arrays — restores no-repeat tracking after resume
    usedTruthSet = new Set(d.usedTruthArr ?? []);
    usedDareSet = new Set(d.usedDareArr ?? []);
    usedDuoSet = new Set(d.usedDuoArr ?? []);
    usedBeraniSet = new Set(d.usedBeraniArr ?? []);
    CELL_TYPE = d.CELL_TYPE;
    return true;
  } catch (e) { return false; }
}

function checkSavedGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    if (Date.now() - d.ts > 86400000) { localStorage.removeItem(SAVE_KEY); return; }
    if (!d.players || d.phase === 'done') { localStorage.removeItem(SAVE_KEY); return; }
    // Show resume banner
    const banner = document.createElement('div');
    banner.id = 'resume-banner';
    banner.style.cssText = `
      position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
      background:linear-gradient(135deg,#1a0f18,#2a0f1e);
      border:1.5px solid rgba(244,63,94,0.5);border-radius:20px;
      padding:12px 20px;z-index:600;display:flex;align-items:center;gap:12px;
      box-shadow:0 8px 32px rgba(0,0,0,0.6);font-family:'Nunito',sans-serif;
      animation:slideUp .4s cubic-bezier(0.34,1.56,0.64,1);
      white-space:nowrap;
    `;
    banner.innerHTML = `
      <span style="font-size:13px;color:#f9a8d4">💾 Ada game tersimpan<br>
        <small style="color:rgba(255,255,255,0.45);font-size:11px">${d.players[0].name} vs ${d.players[1].name} · Kotak ${d.pos[0]}/${d.pos[1]}</small>
      </span>
      <button type="button" data-action="resume-game" style="
        background:linear-gradient(135deg,#f43f5e,#fb923c);border:none;border-radius:12px;
        color:white;font-weight:900;font-size:12px;padding:8px 14px;cursor:pointer;
        font-family:'Nunito',sans-serif;">▶ Lanjut</button>
      <button type="button" data-action="dismiss-save" style="
        background:none;border:1px solid rgba(255,255,255,0.15);border-radius:12px;
        color:rgba(255,255,255,0.45);font-size:12px;padding:8px 12px;cursor:pointer;
        font-family:'Nunito',sans-serif;">✕</button>
    `;
    document.body.appendChild(banner);
  } catch (e) { }
}

function resumeGame() {
  const banner = document.getElementById('resume-banner');
  if (banner) banner.remove();
  if (!loadGame()) return;
  hideTodReviewOverlay();
  resetTodReviewHistory();
  // Apply colors
  document.documentElement.style.setProperty('--p0', PLAYERS[0].colorHex);
  document.documentElement.style.setProperty('--p1', PLAYERS[1].colorHex);
  // Setup UI
  document.getElementById('name-screen').style.display = 'none';
  document.getElementById('pname-text-0').textContent = PLAYERS[0].name;
  document.getElementById('pname-text-1').textContent = PLAYERS[1].name;
  document.getElementById('picon-0').innerHTML = getPlayerSVG(0);
  document.getElementById('picon-1').innerHTML = getPlayerSVG(1);
  const MOOD_META = { romantis: { emoji: '💕', label: 'Romantis', color: '#f472b6' }, playful: { emoji: '😜', label: 'Playful', color: '#fb923c' }, liar: { emoji: '🔥', label: 'Liar', color: '#ef4444' } };
  const m = MOOD_META[currentMood];
  document.getElementById('mood-badge-bar').innerHTML =
    `<span style="background:${m.color}22;border:1px solid ${m.color}55;padding:3px 12px;border-radius:20px;color:${m.color};font-weight:800;font-size:11px">${m.emoji} Mode ${m.label}</span>`;
  buildBoard();
  drawSnakesLadders();
  initPions();
  updateUI();
  spawnHearts();
  // Resume duration
  if (gameDurationSec > 0) {
    updateDurationDisplay();
    const el = document.getElementById('game-duration');
    if (el) el.className = 'game-duration active';
    startDurationTimer();
  }
  addLog(`💾 Game dilanjutkan! ${PLAYERS[0].name} di kotak ${pos[0]}, ${PLAYERS[1].name} di kotak ${pos[1]}`);
}

function dismissSave() {
  const banner = document.getElementById('resume-banner');
  if (banner) banner.remove();
  localStorage.removeItem(SAVE_KEY);
}