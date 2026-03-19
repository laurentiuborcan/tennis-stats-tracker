/* ===================================================
   TENNIS STATS TRACKER — app.js
   Fetches ATP & WTA rankings from TennisAPI (RapidAPI)
   =================================================== */

const API_KEY  = '5c5381ae4fmsh6848925ad4226f3p172ac0jsn3743e19f6b98';
const API_HOST = 'tennisapi1.p.rapidapi.com';
const ENDPOINTS = {
  atp: `https://${API_HOST}/api/tennis/rankings/atp`,
  wta: `https://${API_HOST}/api/tennis/rankings/wta`,
};

// ===== STATE =====
const state = {
  currentTour: 'atp',
  cache: { atp: null, wta: null },
  query: '',
};

// ===== DOM REFS =====
const $ = id => document.getElementById(id);
const loadingEl   = $('loadingState');
const errorEl     = $('errorState');
const errorMsgEl  = $('errorMsg');
const tableEl     = $('rankingsTable');
const bodyEl      = $('rankingsBody');
const searchInput = $('searchInput');
const searchClear = $('searchClear');
const statusEl    = $('statusBar');
const emptySearch = $('emptySearch');
const emptyQuery  = $('emptyQuery');

// ===== API =====
async function fetchRankings(tour) {
  const res = await fetch(ENDPOINTS[tour], {
    method: 'GET',
    headers: {
      'x-rapidapi-key':  API_KEY,
      'x-rapidapi-host': API_HOST,
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

// ===== DATA PARSING =====
// Normalize different possible API response shapes into a flat array of
// { rank, name, country, points } objects.
function parseRankings(data) {
  // Try common shapes returned by TennisAPI / RapidAPI tennis endpoints
  let items = [];

  if (Array.isArray(data)) {
    items = data;
  } else if (Array.isArray(data?.rankings)) {
    items = data.rankings;
  } else if (Array.isArray(data?.data)) {
    items = data.data;
  } else if (Array.isArray(data?.results)) {
    items = data.results;
  } else {
    // Fallback: grab first array-valued key
    const firstArr = Object.values(data || {}).find(v => Array.isArray(v));
    if (firstArr) items = firstArr;
  }

  return items.map((item, idx) => {
    // rank
    const rank = item.ranking ?? item.rank ?? item.position ?? (idx + 1);

    // name
    const name =
      item.player?.name ??
      item.player?.fullName ??
      (item.player?.firstName && item.player?.lastName
        ? `${item.player.firstName} ${item.player.lastName}`
        : null) ??
      item.name ??
      item.fullName ??
      item.playerName ??
      'Unknown Player';

    // country
    const country =
      item.player?.country?.name ??
      item.player?.nationality ??
      item.player?.country ??
      item.country?.name ??
      item.nationality ??
      item.country ??
      '—';

    const countryCode =
      item.player?.country?.alpha2 ??
      item.player?.country?.ioc ??
      item.player?.countryCode ??
      item.country?.alpha2 ??
      item.countryCode ??
      '';

    // points
    const points =
      item.points ??
      item.rankingPoints ??
      item.atp_points ??
      item.wta_points ??
      0;

    return { rank: Number(rank), name: String(name), country: String(country), countryCode: String(countryCode), points: Number(points) };
  }).filter(p => p.name !== 'Unknown Player' || p.points > 0);
}

// ===== FLAG EMOJI =====
// Convert a 2-letter ISO country code to a flag emoji
function countryFlag(code) {
  if (!code || code.length !== 2) return '';
  const codePoints = [...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

// ===== NUMBER FORMATTING =====
function fmtPoints(n) {
  if (!n && n !== 0) return '—';
  return Number(n).toLocaleString('en-US');
}

// ===== HIGHLIGHT =====
function highlight(text, query) {
  if (!query) return escHtml(text);
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return escHtml(text).replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
}
function escHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ===== RENDER TABLE =====
function renderTable(players, query) {
  const filtered = query
    ? players.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    : players;

  // Hide/show states
  loadingEl.style.display  = 'none';
  errorEl.style.display    = 'none';

  if (filtered.length === 0 && query) {
    tableEl.style.display    = 'none';
    emptySearch.style.display = 'flex';
    emptyQuery.textContent   = query;
    statusEl.textContent     = '';
    return;
  }

  emptySearch.style.display = 'none';
  tableEl.style.display     = 'table';

  statusEl.textContent = query
    ? `Showing ${filtered.length} of ${players.length} players`
    : `${players.length} players`;

  bodyEl.innerHTML = filtered.map(p => {
    // Rank badge for top 3
    let rankHTML;
    if (p.rank === 1) {
      rankHTML = `<span class="rank-badge gold">1</span>`;
    } else if (p.rank === 2) {
      rankHTML = `<span class="rank-badge silver">2</span>`;
    } else if (p.rank === 3) {
      rankHTML = `<span class="rank-badge bronze">3</span>`;
    } else {
      rankHTML = `<span class="rank-num">${p.rank}</span>`;
    }

    const flag = countryFlag(p.countryCode);

    return `
      <tr>
        <td class="cell-rank">${rankHTML}</td>
        <td class="cell-player">
          <span class="player-name">${highlight(p.name, query)}</span>
        </td>
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

// ===== SHOW STATES =====
function showLoading() {
  loadingEl.style.display   = 'flex';
  errorEl.style.display     = 'none';
  tableEl.style.display     = 'none';
  emptySearch.style.display = 'none';
  statusEl.textContent      = '';
}

function showError(msg) {
  loadingEl.style.display   = 'none';
  errorEl.style.display     = 'flex';
  tableEl.style.display     = 'none';
  emptySearch.style.display = 'none';
  errorMsgEl.textContent    = msg || 'Failed to load rankings. Please try again.';
  statusEl.textContent      = '';
}

// ===== LOAD TOUR =====
async function loadTour(tour) {
  state.currentTour = tour;

  // Update tab UI
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tour === tour);
  });

  // Use cached data if available
  if (state.cache[tour]) {
    renderTable(state.cache[tour], state.query);
    return;
  }

  showLoading();

  try {
    const data    = await fetchRankings(tour);
    const players = parseRankings(data);

    if (players.length === 0) {
      showError('No ranking data returned by the API. The response format may have changed.');
      return;
    }

    state.cache[tour] = players;
    renderTable(players, state.query);
  } catch (err) {
    console.error(`[TennisStats] Failed to load ${tour.toUpperCase()} rankings:`, err);
    showError(`Could not load ${tour.toUpperCase()} rankings. ${err.message}`);
  }
}

// ===== SEARCH =====
function applySearch() {
  const q = searchInput.value.trim();
  state.query = q;
  searchClear.classList.toggle('visible', q.length > 0);

  const players = state.cache[state.currentTour];
  if (players) {
    renderTable(players, q);
  }
}

// ===== INIT =====
function init() {
  // Tab clicks
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.tour !== state.currentTour) {
        // Clear search when switching tours
        searchInput.value = '';
        state.query = '';
        searchClear.classList.remove('visible');
        loadTour(btn.dataset.tour);
      }
    });
  });

  // Search input
  searchInput.addEventListener('input', applySearch);
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      applySearch();
      searchInput.blur();
    }
  });

  // Clear button
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    applySearch();
    searchInput.focus();
  });

  // Retry button
  $('retryBtn').addEventListener('click', () => {
    state.cache[state.currentTour] = null;
    loadTour(state.currentTour);
  });

  // Load initial tour
  loadTour('atp');
}

document.addEventListener('DOMContentLoaded', init);
