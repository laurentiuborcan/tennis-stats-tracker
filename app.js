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
      item.team?.name ??
      item.rowName ??
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
      item.team?.country?.name ??
      item.player?.country?.name ??
      item.player?.nationality ??
      item.player?.country ??
      item.country?.name ??
      item.nationality ??
      item.country ??
      '—';

    const countryCode =
      item.team?.country?.alpha2 ??
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

  // DEBUG: probe match-related endpoints — remove when done
  probeEndpoints();
}

// ===== DEBUG: ENDPOINT PROBE =====
// Phase 1: flat event/match routes
const PROBE_ENDPOINTS_PHASE1 = [
  { path: '/api/tennis/matches/live',    label: null },
  { path: '/api/tennis/events/live',     label: null },
  { path: '/api/tennis/matches/today',   label: null },
  { path: '/api/tennis/events',          label: null },
  { path: '/api/tennis/scores',          label: null },
  { path: '/api/tennis/matches',         label: null },
];

// Phase 2: results/schedule variations
const PROBE_ENDPOINTS_PHASE2 = [
  { path: '/api/tennis/events/results',           label: null },
  { path: '/api/tennis/events/today',             label: null },
  { path: '/api/tennis/events/2026-03-19',        label: null },
  { path: '/api/tennis/events/finished',          label: null },
  { path: '/api/tennis/events/schedule',          label: null },
  { path: '/api/tennis/events/2026/3/19',         label: '204 = valid but empty (no data for date)' },
  { path: '/api/tennis/category/3',               label: null },
  { path: '/api/tennis/tournament/2430',          label: 'ATP Miami' },
  { path: '/api/tennis/tournament/2430/seasons',  label: 'ATP Miami seasons → 17 items' },
  { path: '/api/tennis/tournament/2587/seasons',  label: 'WTA Miami seasons → 17 items' },
];

// Phase 3: the working season-based routes (discovered via live event tournament IDs)
const PROBE_ENDPOINTS_PHASE3 = [
  {
    path: '/api/tennis/tournament/2430/season/80799/events/last/0',
    label: 'ATP Miami 2026 — finished results (30 events, hasNextPage)',
  },
  {
    path: '/api/tennis/tournament/2430/season/80799/events/next/0',
    label: 'ATP Miami 2026 — upcoming/live events (30 events, hasNextPage)',
  },
  {
    path: '/api/tennis/tournament/2430/season/80799/rounds',
    label: 'ATP Miami 2026 — round list (9 rounds)',
  },
  {
    path: '/api/tennis/tournament/2587/seasons',
    label: 'WTA Miami — season list',
  },
];

async function probeOne(path) {
  const url = `https://${API_HOST}${path}`;
  try {
    const res = await fetch(url, {
      headers: { 'x-rapidapi-key': API_KEY, 'x-rapidapi-host': API_HOST },
    });
    const text = await res.text();
    let parsed = null;
    try { parsed = JSON.parse(text); } catch (_) {}
    const topKeys = parsed && typeof parsed === 'object' ? Object.keys(parsed) : null;
    const firstArr = topKeys && topKeys.find(k => Array.isArray(parsed[k]));
    const itemCount = firstArr ? parsed[firstArr].length : (Array.isArray(parsed) ? parsed.length : null);
    const sampleKeys = firstArr && parsed[firstArr].length
      ? Object.keys(parsed[firstArr][0])
      : (Array.isArray(parsed) && parsed.length ? Object.keys(parsed[0]) : null);
    return { path, status: res.status, ok: res.ok, topKeys, firstArr, itemCount, sampleKeys, raw: parsed };
  } catch (err) {
    return { path, status: 'ERR', ok: false, error: err.message };
  }
}

function renderProbeRow(r, label, container) {
  const isSuccess = r.ok || r.status === 204;
  const row = document.createElement('div');
  row.style.cssText = 'border-bottom:1px solid #2a2a2a;padding:0.65rem 0;display:grid;grid-template-columns:1.5rem 1fr;gap:0.4rem;align-items:start;';

  const dot = document.createElement('span');
  dot.textContent = isSuccess ? '✓' : '✗';
  dot.style.cssText = `color:${isSuccess ? '#4ec9b0' : '#f44747'};font-size:1rem;margin-top:1px;`;

  const info = document.createElement('div');
  let html = `<span style="color:${isSuccess ? '#4ec9b0' : '#f44747'};font-weight:bold;">HTTP ${r.status}</span>`
           + `  <span style="color:#ddd;">${r.path}</span>`;

  if (label) html += `<br><span style="color:#888;font-style:italic;">${label}</span>`;

  if (r.ok) {
    if (r.topKeys)  html += `<br><span style="color:#666;">keys: </span><span style="color:#ce9178;">${r.topKeys.join(', ')}</span>`;
    if (r.firstArr) html += `  <span style="color:#666;">→ </span><span style="color:#ce9178;">"${r.firstArr}"</span>`
                          + ` <span style="color:#888;">(${r.itemCount} items)</span>`;
    if (r.sampleKeys) html += `<br><span style="color:#666;">fields: </span><span style="color:#9cdcfe;">${r.sampleKeys.slice(0, 12).join(', ')}${r.sampleKeys.length > 12 ? '…' : ''}</span>`;
    if (r.raw) {
      const arr = r.firstArr ? r.raw[r.firstArr] : (Array.isArray(r.raw) ? r.raw : null);
      const sample = arr ? arr[0] : r.raw;
      const pre = document.createElement('pre');
      pre.style.cssText = 'margin:0.4rem 0 0;color:#d4d4d4;font-size:0.72rem;max-height:220px;overflow:auto;background:#252526;padding:0.5rem;border-radius:3px;white-space:pre-wrap;word-break:break-all;';
      pre.textContent = JSON.stringify(sample, null, 2);
      info.innerHTML = html;
      info.appendChild(pre);
      row.appendChild(dot);
      row.appendChild(info);
      container.appendChild(row);
      return;
    }
  } else if (r.status === 204) {
    html += `<br><span style="color:#888;font-style:italic;">No content — route exists but returned empty body</span>`;
  } else {
    if (r.error) html += `<br><span style="color:#888;">${r.error}</span>`;
  }

  info.innerHTML = html;
  row.appendChild(dot);
  row.appendChild(info);
  container.appendChild(row);
}

function renderPhaseHeader(text, container) {
  const h = document.createElement('div');
  h.style.cssText = 'color:#569cd6;font-weight:bold;margin:1rem 0 0.4rem;padding-top:0.4rem;border-top:1px solid #333;font-size:0.8rem;letter-spacing:0.05em;';
  h.textContent = text;
  container.appendChild(h);
}

async function probeEndpoints() {
  const container = document.getElementById('debugProbeBody');
  if (!container) return;
  container.innerHTML = '<p style="color:#888;margin:0">Probing endpoints…</p>';

  const [r1, r2, r3] = await Promise.all([
    Promise.all(PROBE_ENDPOINTS_PHASE1.map(e => probeOne(e.path))),
    Promise.all(PROBE_ENDPOINTS_PHASE2.map(e => probeOne(e.path))),
    Promise.all(PROBE_ENDPOINTS_PHASE3.map(e => probeOne(e.path))),
  ]);

  container.innerHTML = '';

  renderPhaseHeader('Phase 1 — Basic event/match routes (from previous probe)', container);
  r1.forEach((r, i) => renderProbeRow(r, PROBE_ENDPOINTS_PHASE1[i].label, container));

  renderPhaseHeader('Phase 2 — Results / schedule / category / tournament variations', container);
  r2.forEach((r, i) => renderProbeRow(r, PROBE_ENDPOINTS_PHASE2[i].label, container));

  renderPhaseHeader('Phase 3 — Season-based routes (WORKING — discovered via live event tournament IDs)', container);
  r3.forEach((r, i) => renderProbeRow(r, PROBE_ENDPOINTS_PHASE3[i].label, container));

  const summary = document.createElement('div');
  summary.style.cssText = 'margin-top:1.2rem;padding:0.8rem;background:#0d2d0d;border:1px solid #4ec9b0;border-radius:4px;color:#4ec9b0;font-size:0.78rem;line-height:1.6;';
  summary.innerHTML = `<strong>Key findings:</strong><br>
  ✓ <code>/api/tennis/events/live</code> — 18 live events<br>
  ✓ <code>/api/tennis/tournament/{id}/seasons</code> — season list for any tournament<br>
  ✓ <code>/api/tennis/tournament/{id}/season/{sid}/events/last/0</code> — <strong>finished results</strong> (paginated)<br>
  ✓ <code>/api/tennis/tournament/{id}/season/{sid}/events/next/0</code> — upcoming/in-progress (paginated)<br>
  ✓ <code>/api/tennis/tournament/{id}/season/{sid}/rounds</code> — round/draw structure<br>
  ✗ All flat date-based and category routes return 404`;
  container.appendChild(summary);
}

document.addEventListener('DOMContentLoaded', init);
