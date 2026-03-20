/* ===================================================
   TENNIS STATS TRACKER — app.js
   =================================================== */

const API_KEY  = '5c5381ae4fmsh6848925ad4226f3p172ac0jsn3743e19f6b98';
const API_HOST = 'tennisapi1.p.rapidapi.com';

const ENDPOINTS = {
  atp:  `https://${API_HOST}/api/tennis/rankings/atp`,
  wta:  `https://${API_HOST}/api/tennis/rankings/wta`,
  live: `https://${API_HOST}/api/tennis/events/live`,
};

// Cache TTLs in milliseconds
const TTL = {
  atp:  24 * 60 * 60 * 1000,  // 24 hours
  wta:  24 * 60 * 60 * 1000,  // 24 hours
  live:  5 * 60 * 1000,        // 5 minutes
};

const CACHE_KEY = tour => `tennis_v1_${tour}`;

// ===== DEMO DATA (fallback when API quota is exhausted) =====
const DEMO = {
  atp: [
    { rank:  1, name: 'Jannik Sinner',                country: 'Italy',     countryCode: 'IT', points: 11830 },
    { rank:  2, name: 'Carlos Alcaraz',               country: 'Spain',     countryCode: 'ES', points:  9255 },
    { rank:  3, name: 'Alexander Zverev',             country: 'Germany',   countryCode: 'DE', points:  7880 },
    { rank:  4, name: 'Novak Djokovic',               country: 'Serbia',    countryCode: 'RS', points:  6160 },
    { rank:  5, name: 'Daniil Medvedev',              country: 'Russia',    countryCode: 'RU', points:  5765 },
    { rank:  6, name: 'Casper Ruud',                  country: 'Norway',    countryCode: 'NO', points:  4320 },
    { rank:  7, name: 'Andrey Rublev',                country: 'Russia',    countryCode: 'RU', points:  3890 },
    { rank:  8, name: 'Taylor Fritz',                 country: 'USA',       countryCode: 'US', points:  3645 },
    { rank:  9, name: 'Alex de Minaur',               country: 'Australia', countryCode: 'AU', points:  3410 },
    { rank: 10, name: 'Grigor Dimitrov',              country: 'Bulgaria',  countryCode: 'BG', points:  3280 },
    { rank: 11, name: 'Tommy Paul',                   country: 'USA',       countryCode: 'US', points:  3050 },
    { rank: 12, name: 'Stefanos Tsitsipas',           country: 'Greece',    countryCode: 'GR', points:  2985 },
    { rank: 13, name: 'Holger Rune',                  country: 'Denmark',   countryCode: 'DK', points:  2740 },
    { rank: 14, name: 'Ben Shelton',                  country: 'USA',       countryCode: 'US', points:  2615 },
    { rank: 15, name: 'Ugo Humbert',                  country: 'France',    countryCode: 'FR', points:  2480 },
    { rank: 16, name: 'Sebastian Korda',              country: 'USA',       countryCode: 'US', points:  2210 },
    { rank: 17, name: 'Frances Tiafoe',               country: 'USA',       countryCode: 'US', points:  2070 },
    { rank: 18, name: 'Francisco Cerundolo',          country: 'Argentina', countryCode: 'AR', points:  1960 },
    { rank: 19, name: 'Alejandro Davidovich Fokina',  country: 'Spain',     countryCode: 'ES', points:  1885 },
    { rank: 20, name: 'Karen Khachanov',              country: 'Russia',    countryCode: 'RU', points:  1810 },
  ],
  wta: [
    { rank:  1, name: 'Aryna Sabalenka',      country: 'Belarus',        countryCode: 'BY', points: 10485 },
    { rank:  2, name: 'Iga Swiatek',          country: 'Poland',         countryCode: 'PL', points:  9295 },
    { rank:  3, name: 'Coco Gauff',           country: 'USA',            countryCode: 'US', points:  6530 },
    { rank:  4, name: 'Elena Rybakina',       country: 'Kazakhstan',     countryCode: 'KZ', points:  5745 },
    { rank:  5, name: 'Jessica Pegula',       country: 'USA',            countryCode: 'US', points:  4960 },
    { rank:  6, name: 'Mirra Andreeva',       country: 'Russia',         countryCode: 'RU', points:  4215 },
    { rank:  7, name: 'Jasmine Paolini',      country: 'Italy',          countryCode: 'IT', points:  4050 },
    { rank:  8, name: 'Emma Navarro',         country: 'USA',            countryCode: 'US', points:  3620 },
    { rank:  9, name: 'Madison Keys',         country: 'USA',            countryCode: 'US', points:  3290 },
    { rank: 10, name: 'Daria Kasatkina',      country: 'Russia',         countryCode: 'RU', points:  3105 },
    { rank: 11, name: 'Barbora Krejcikova',   country: 'Czech Republic', countryCode: 'CZ', points:  2870 },
    { rank: 12, name: 'Paula Badosa',         country: 'Spain',          countryCode: 'ES', points:  2755 },
    { rank: 13, name: 'Qinwen Zheng',         country: 'China',          countryCode: 'CN', points:  2630 },
    { rank: 14, name: 'Karolina Muchova',     country: 'Czech Republic', countryCode: 'CZ', points:  2510 },
    { rank: 15, name: 'Anna Kalinskaya',      country: 'Russia',         countryCode: 'RU', points:  2380 },
    { rank: 16, name: 'Beatriz Haddad Maia',  country: 'Brazil',         countryCode: 'BR', points:  2225 },
    { rank: 17, name: 'Elina Svitolina',      country: 'Ukraine',        countryCode: 'UA', points:  2090 },
    { rank: 18, name: 'Caroline Garcia',      country: 'France',         countryCode: 'FR', points:  1965 },
    { rank: 19, name: 'Maria Sakkari',        country: 'Greece',         countryCode: 'GR', points:  1870 },
    { rank: 20, name: 'Liudmila Samsonova',   country: 'Russia',         countryCode: 'RU', points:  1755 },
  ],
};

// ===== STATE =====
const state = {
  currentTour: null,
  // In-session memory cache: { data, ts } per tour
  cache: { atp: null, wta: null, live: null },
  query: '',
  ageTick: null,  // setInterval handle for "last updated" counter
};

// ===== DOM REFS =====
const $ = id => document.getElementById(id);
const loadingEl   = $('loadingState');
const errorEl     = $('errorState');
const errorIcon   = $('errorIcon');
const errorMsgEl  = $('errorMsg');
const tableEl     = $('rankingsTable');
const bodyEl      = $('rankingsBody');
const searchWrap  = $('searchWrap');
const searchInput = $('searchInput');
const searchClear = $('searchClear');
const toolbar     = $('toolbar');
const statusEl    = $('statusBar');
const lastUpdEl   = $('lastUpdated');
const refreshBtn  = $('refreshBtn');
const tableWrap   = $('tableWrap');
const welcomeEl   = $('welcomeState');
const emptySearch = $('emptySearch');
const emptyQuery  = $('emptyQuery');
const livePanel   = $('livePanel');
const demoBanner  = $('demoBanner');

// ===== LOCAL STORAGE CACHE =====
function lsGet(tour) {
  try {
    const raw = localStorage.getItem(CACHE_KEY(tour));
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (!entry?.ts || !entry?.data) return null;
    if (Date.now() - entry.ts > TTL[tour]) return null;  // expired
    return entry;
  } catch {
    return null;
  }
}

function lsSet(tour, data) {
  try {
    localStorage.setItem(CACHE_KEY(tour), JSON.stringify({ data, ts: Date.now() }));
  } catch { /* storage full — silently ignore */ }
}

function lsClear(tour) {
  try { localStorage.removeItem(CACHE_KEY(tour)); } catch {}
}

// Returns a fresh cache entry (in-session first, then localStorage), or null.
function getCached(tour) {
  if (state.cache[tour]) return state.cache[tour];
  const entry = lsGet(tour);
  if (entry) { state.cache[tour] = entry; }
  return entry;
}

function setCached(tour, data) {
  const entry = { data, ts: Date.now() };
  state.cache[tour] = entry;
  lsSet(tour, data);
}

function bustCache(tour) {
  state.cache[tour] = null;
  lsClear(tour);
}

// ===== TIME FORMATTING =====
function formatAge(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 10)  return 'Just now';
  if (s < 60)  return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function startAgeTick(getTsCallback) {
  clearInterval(state.ageTick);
  state.ageTick = setInterval(() => {
    const ts = getTsCallback();
    if (ts) lastUpdEl.textContent = `Updated ${formatAge(ts)}`;
  }, 30_000);
}

function stopAgeTick() {
  clearInterval(state.ageTick);
  state.ageTick = null;
}

// ===== API =====
async function apiFetch(url) {
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': API_HOST },
  });
  if (res.status === 429) {
    const err = new Error('Rate limit reached');
    err.status = 429;
    throw err;
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ===== HELPERS =====
function escHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function countryFlag(code) {
  if (!code || code.length !== 2) return '';
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
}

function fmtPoints(n) {
  if (!n && n !== 0) return '—';
  return Number(n).toLocaleString('en-US');
}

function highlight(text, query) {
  if (!query) return escHtml(text);
  return escHtml(text).replace(
    new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
    '<mark>$1</mark>'
  );
}

// ===== DATA PARSING =====
function parseRankings(data) {
  let items = [];
  if (Array.isArray(data))              items = data;
  else if (Array.isArray(data?.rankings)) items = data.rankings;
  else if (Array.isArray(data?.data))   items = data.data;
  else if (Array.isArray(data?.results)) items = data.results;
  else {
    const arr = Object.values(data || {}).find(v => Array.isArray(v));
    if (arr) items = arr;
  }

  return items.map((item, idx) => {
    const rank = item.ranking ?? item.rank ?? item.position ?? (idx + 1);
    const name =
      item.team?.name ?? item.rowName ?? item.player?.name ?? item.player?.fullName ??
      (item.player?.firstName && item.player?.lastName
        ? `${item.player.firstName} ${item.player.lastName}` : null) ??
      item.name ?? item.fullName ?? item.playerName ?? 'Unknown Player';
    const country =
      item.team?.country?.name ?? item.player?.country?.name ?? item.player?.nationality ??
      item.country?.name ?? item.nationality ?? item.country ?? '—';
    const countryCode =
      item.team?.country?.alpha2 ?? item.player?.country?.alpha2 ?? item.player?.country?.ioc ??
      item.player?.countryCode ?? item.country?.alpha2 ?? item.countryCode ?? '';
    const points = item.points ?? item.rankingPoints ?? item.atp_points ?? item.wta_points ?? 0;

    return {
      rank: Number(rank), name: String(name),
      country: String(country), countryCode: String(countryCode), points: Number(points),
    };
  }).filter(p => p.name !== 'Unknown Player' || p.points > 0);
}

// ===== SHOW / HIDE HELPERS =====
function showRankingsArea() {
  livePanel.style.display = 'none';
  tableWrap.style.display = 'block';
  searchWrap.style.display = '';
  toolbar.style.display   = '';
}

function showLiveArea() {
  tableWrap.style.display  = 'none';
  searchWrap.style.display = 'none';
  livePanel.style.display  = 'block';
  toolbar.style.display    = '';
  demoBanner.style.display = 'none';
}

function setAllHidden() {
  welcomeEl.style.display  = 'none';
  loadingEl.style.display  = 'none';
  errorEl.style.display    = 'none';
  tableEl.style.display    = 'none';
  emptySearch.style.display = 'none';
}

function showWelcome() {
  stopAgeTick();
  toolbar.style.display    = 'none';
  searchWrap.style.display = 'none';
  livePanel.style.display  = 'none';
  tableWrap.style.display  = 'block';
  setAllHidden();
  welcomeEl.style.display  = '';
}

function showLoading(label) {
  setAllHidden();
  loadingEl.querySelector('span').textContent = label || 'Loading…';
  loadingEl.style.display = 'flex';
  statusEl.textContent    = '';
  lastUpdEl.textContent   = '';
  stopAgeTick();
}

function showError(msg, is429 = false) {
  setAllHidden();
  errorIcon.textContent  = is429 ? '🕐' : '⚠️';
  errorMsgEl.textContent = msg;
  errorEl.style.display  = 'flex';
  statusEl.textContent   = '';
}

// ===== RANKINGS RENDER =====
function renderTable(players, query, ts) {
  const filtered = query
    ? players.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    : players;

  setAllHidden();

  if (filtered.length === 0 && query) {
    emptySearch.style.display = 'flex';
    emptyQuery.textContent    = query;
    statusEl.textContent      = '';
    return;
  }

  tableEl.style.display    = 'table';
  statusEl.textContent     = query
    ? `Showing ${filtered.length} of ${players.length} players`
    : `${players.length} players`;

  if (ts) {
    lastUpdEl.textContent = `Updated ${formatAge(ts)}`;
    startAgeTick(() => state.cache[state.currentTour]?.ts);
  }

  bodyEl.innerHTML = filtered.map(p => {
    let rankHTML;
    if (p.rank === 1)      rankHTML = `<span class="rank-badge gold">1</span>`;
    else if (p.rank === 2) rankHTML = `<span class="rank-badge silver">2</span>`;
    else if (p.rank === 3) rankHTML = `<span class="rank-badge bronze">3</span>`;
    else                   rankHTML = `<span class="rank-num">${p.rank}</span>`;

    const flag = countryFlag(p.countryCode);
    return `
      <tr>
        <td class="cell-rank">${rankHTML}</td>
        <td class="cell-player"><span class="player-name">${highlight(p.name, query)}</span></td>
        <td class="cell-country">
          <div class="country-wrap">
            ${flag ? `<span class="country-flag">${flag}</span>` : ''}
            <span class="country-name">${escHtml(p.country)}</span>
          </div>
        </td>
        <td class="cell-points">${fmtPoints(p.points)}</td>
      </tr>`;
  }).join('');
}

// ===== LIVE RENDER =====
function renderLive(data, ts) {
  const events = data?.events ?? [];

  if (ts) {
    lastUpdEl.textContent = `Updated ${formatAge(ts)}`;
    startAgeTick(() => state.cache.live?.ts);
  }

  if (events.length === 0) {
    livePanel.innerHTML = `
      <div class="live-empty">
        <div class="live-empty-icon">📡</div>
        <p class="live-empty-title">No live matches right now</p>
        <p class="live-empty-sub">Check back later or click Refresh to try again.</p>
      </div>`;
    statusEl.textContent = '0 live matches';
    return;
  }

  statusEl.textContent = `${events.length} live match${events.length !== 1 ? 'es' : ''}`;

  // DEBUG: raw JSON of first event so field names are visible for next mapping step
  const first = events[0];
  livePanel.innerHTML = `
    <div class="live-header">
      <span class="live-dot" aria-hidden="true"></span>
      <span>${events.length} live match${events.length !== 1 ? 'es' : ''}</span>
    </div>
    <details open class="live-debug">
      <summary>Field reference — raw JSON of first event (remove once mapped)</summary>
      <pre>${escHtml(JSON.stringify(first, null, 2))}</pre>
    </details>`;
}

function showLivePlaceholder() {
  livePanel.innerHTML = `
    <div class="live-placeholder">
      <div class="live-placeholder-icon">📡</div>
      <p class="live-placeholder-title">Live Matches</p>
      <p class="live-placeholder-sub">
        Click <strong>Refresh</strong> to load live match data from the API.
        Results are cached for 5 minutes.
      </p>
    </div>`;
  statusEl.textContent  = '';
  lastUpdEl.textContent = '';
}

// ===== LOAD RANKINGS =====
async function loadRankings(tour, force = false) {
  showRankingsArea();
  demoBanner.style.display = 'none';

  if (!force) {
    const cached = getCached(tour);
    if (cached) {
      renderTable(cached.data, state.query, cached.ts);
      return;
    }
  }

  showLoading(`Loading ${tour.toUpperCase()} rankings…`);

  try {
    const raw     = await apiFetch(ENDPOINTS[tour]);
    const players = parseRankings(raw);
    if (!players.length) {
      showError('No ranking data returned. The API response format may have changed.');
      return;
    }
    setCached(tour, players);
    demoBanner.style.display = 'none';
    renderTable(players, state.query, state.cache[tour].ts);
  } catch (err) {
    // API unavailable — fall back to demo data
    const demo = DEMO[tour];
    setAllHidden();
    tableEl.style.display    = 'table';
    demoBanner.style.display = '';
    statusEl.textContent     = `${demo.length} players (demo)`;
    lastUpdEl.textContent    = '';
    stopAgeTick();
    bodyEl.innerHTML = demo.map(p => {
      let rankHTML;
      if (p.rank === 1)      rankHTML = `<span class="rank-badge gold">1</span>`;
      else if (p.rank === 2) rankHTML = `<span class="rank-badge silver">2</span>`;
      else if (p.rank === 3) rankHTML = `<span class="rank-badge bronze">3</span>`;
      else                   rankHTML = `<span class="rank-num">${p.rank}</span>`;
      const flag = countryFlag(p.countryCode);
      return `
        <tr>
          <td class="cell-rank">${rankHTML}</td>
          <td class="cell-player"><span class="player-name">${escHtml(p.name)}</span></td>
          <td class="cell-country">
            <div class="country-wrap">
              ${flag ? `<span class="country-flag">${flag}</span>` : ''}
              <span class="country-name">${escHtml(p.country)}</span>
            </div>
          </td>
          <td class="cell-points">${fmtPoints(p.points)}</td>
        </tr>`;
    }).join('');
  }
}

// ===== LOAD LIVE =====
async function loadLive(force = false) {
  showLiveArea();

  if (!force) {
    const cached = getCached('live');
    if (cached) {
      renderLive(cached.data, cached.ts);
      return;
    }
    // No cache yet — show placeholder instead of auto-fetching
    showLivePlaceholder();
    return;
  }

  showLoading('Loading live matches…');
  tableWrap.style.display = 'none';
  livePanel.style.display = 'block';
  livePanel.innerHTML = `
    <div class="live-loading-inner">
      <div class="spinner"></div>
      <span>Fetching live matches…</span>
    </div>`;

  try {
    const raw = await apiFetch(ENDPOINTS.live);
    setCached('live', raw);
    renderLive(raw, state.cache.live.ts);
  } catch (err) {
    if (err.status === 429) {
      livePanel.innerHTML = `
        <div class="live-error-card">
          <div class="live-error-icon">🕐</div>
          <p class="live-error-title">Rate limit reached</p>
          <p class="live-error-sub">Too many requests — please wait a few minutes, then click Refresh.</p>
        </div>`;
      statusEl.textContent  = '';
      lastUpdEl.textContent = '';
    } else {
      livePanel.innerHTML = `
        <div class="live-error-card">
          <div class="live-error-icon">⚠️</div>
          <p class="live-error-title">Could not load live matches</p>
          <p class="live-error-sub">${escHtml(err.message)}</p>
        </div>`;
      statusEl.textContent = '';
    }
  }
}

// ===== ACTIVATE TAB =====
function activateTab(tour) {
  state.currentTour = tour;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tour === tour);
  });
}

// ===== LOAD TOUR (entry point for tab clicks) =====
function loadTour(tour, force = false) {
  if (!force && tour === state.currentTour) return;
  activateTab(tour);

  if (tour === 'live') {
    loadLive(force);
  } else {
    // Clear search when switching between ranking tabs
    if (state.currentTour !== tour || force) {
      searchInput.value = '';
      state.query = '';
      searchClear.classList.remove('visible');
    }
    loadRankings(tour, force);
  }
}

// ===== SEARCH =====
function applySearch() {
  const q = searchInput.value.trim();
  state.query = q;
  searchClear.classList.toggle('visible', q.length > 0);
  const cached = getCached(state.currentTour);
  if (cached) renderTable(cached.data, q, cached.ts);
}

// ===== INIT =====
function init() {
  // Tab clicks (tabs-bar)
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.tour !== state.currentTour) {
        searchInput.value = '';
        state.query = '';
        searchClear.classList.remove('visible');
      }
      loadTour(btn.dataset.tour);
    });
  });

  // Welcome screen shortcut buttons
  document.querySelectorAll('.welcome-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => loadTour(btn.dataset.tour));
  });

  // Search
  searchInput.addEventListener('input', applySearch);
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') { searchInput.value = ''; applySearch(); searchInput.blur(); }
  });
  searchClear.addEventListener('click', () => {
    searchInput.value = ''; applySearch(); searchInput.focus();
  });

  // Retry button (rankings error state)
  $('retryBtn').addEventListener('click', () => {
    if (state.currentTour && state.currentTour !== 'live') {
      bustCache(state.currentTour);
      loadRankings(state.currentTour, true);
    }
  });

  // Refresh button (toolbar)
  refreshBtn.addEventListener('click', () => {
    if (!state.currentTour) return;
    bustCache(state.currentTour);
    if (state.currentTour === 'live') {
      loadLive(true);
    } else {
      loadRankings(state.currentTour, true);
    }
  });

  // On load: check for fresh cached ATP data → show it silently, otherwise welcome
  const cached = getCached('atp');
  if (cached) {
    activateTab('atp');
    showRankingsArea();
    renderTable(cached.data, '', cached.ts);
  } else {
    showWelcome();
  }
}

document.addEventListener('DOMContentLoaded', init);
