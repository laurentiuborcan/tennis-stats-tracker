#!/usr/bin/env node
// Discovery script — uses curl via child_process (Node.js DNS blocked, curl works)

const { execSync } = require('child_process');

const API_KEY  = '5c5381ae4fmsh6848925ad4226f3p172ac0jsn3743e19f6b98';
const API_HOST = 'tennisapi1.p.rapidapi.com';

function apiFetch(path) {
  const url = `https://${API_HOST}${path}`;
  try {
    const out = execSync(
      `curl -s --max-time 15 ` +
      `-H "x-rapidapi-key: ${API_KEY}" ` +
      `-H "x-rapidapi-host: ${API_HOST}" ` +
      `-w "\\n__STATUS__%{http_code}" ` +
      `"${url}"`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    );
    const parts = out.split('\n__STATUS__');
    const status = parseInt(parts[1] ?? '0', 10);
    const body   = parts[0].trim();
    if (status === 204 || body === '') return null;
    if (status !== 200) return { __error: status, __url: url };
    return JSON.parse(body);
  } catch (e) {
    return { __error: e.message.slice(0, 100), __url: url };
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── 1. Live events ──────────────────────────────────────────────────────────
async function discoverFromLive() {
  console.log('\n════════════════════════════════════════════════════');
  console.log('1. LIVE EVENTS  →  GET /api/tennis/events/live');
  console.log('════════════════════════════════════════════════════');

  const data = apiFetch('/api/tennis/events/live');

  if (!data || data.__error) {
    console.log('Response:', JSON.stringify(data));
    return [];
  }

  console.log('Top-level keys:', Object.keys(data));
  const events = data.events ?? data.results ?? data.data ?? [];
  console.log(`Events found: ${events.length}`);

  if (events.length > 0) {
    console.log('Sample event keys:', Object.keys(events[0]));
    console.log('Sample event:', JSON.stringify(events[0]).slice(0, 400));
  }

  const tourMap = new Map();
  for (const ev of events) {
    const t = ev.tournament ?? ev.season?.tournament ?? ev.event?.tournament;
    if (t && t.id) tourMap.set(t.id, t.name ?? '(unnamed)');
  }

  console.log(`\nUnique tournaments in live feed (${tourMap.size}):`);
  for (const [id, name] of tourMap) {
    console.log(`  id=${id}  name="${name}"`);
  }

  return [...tourMap.entries()];
}

// ── 2. Tournament seasons ────────────────────────────────────────────────────
async function fetchSeasons(tournId, tournName) {
  await sleep(150);
  const data = apiFetch(`/api/tennis/tournament/${tournId}/seasons`);
  if (!data || data.__error) {
    console.log(`  ${tournName} (${tournId}) → ERROR: ${JSON.stringify(data)}`);
    return null;
  }
  const seasons = data.seasons ?? data.results ?? data.data ?? data;
  if (!Array.isArray(seasons) || seasons.length === 0) {
    console.log(`  ${tournName} (${tournId}) → no seasons  raw:`, JSON.stringify(data).slice(0, 120));
    return null;
  }
  const latest = seasons[0];
  console.log(`  ${tournName} (${tournId}) → ${seasons.length} seasons, latest: id=${latest.id} year=${latest.year ?? latest.name}`);
  return { tournId, tournName, latestSeasonId: latest.id, latestSeasonYear: latest.year ?? latest.name };
}

// ── 3. Brute-force IDs 1-20 ─────────────────────────────────────────────────
async function probeIds() {
  console.log('\n════════════════════════════════════════════════════');
  console.log('3. BRUTE-FORCE PROBE  GET /api/tennis/tournament/1..20');
  console.log('════════════════════════════════════════════════════');

  const results = [];
  for (let id = 1; id <= 20; id++) {
    await sleep(100);
    const data = apiFetch(`/api/tennis/tournament/${id}`);
    if (!data || data.__error) {
      console.log(`  id=${id}  → ${data?.__error ?? 'null/204'}`);
    } else {
      const t = data.tournament ?? data;
      const name     = t.name ?? t.fullName ?? JSON.stringify(t).slice(0, 60);
      const category = t.category?.name ?? t.sport?.name ?? '';
      console.log(`  id=${id}  "${name}"  [${category}]`);
      results.push({ id, name, category });
    }
  }
  return results;
}

// ── 4. Search ────────────────────────────────────────────────────────────────
function searchQuery(query) {
  const data = apiFetch(`/api/tennis/search/${encodeURIComponent(query)}`);
  if (!data || data.__error) return { all: [], tennis: [], error: data };
  const results = data.results ?? [];
  const tennis = results.filter(r => {
    const sport = r?.entity?.sport?.name ?? r?.entity?.category?.sport?.name ?? '';
    return sport === 'Tennis';
  });
  return { all: results, tennis };
}

async function main() {
  const liveTourn = await discoverFromLive();

  if (liveTourn.length > 0) {
    console.log('\n════════════════════════════════════════════════════');
    console.log('2. SEASONS for each live tournament');
    console.log('════════════════════════════════════════════════════');

    const summary = [];
    for (const [id, name] of liveTourn) {
      const row = await fetchSeasons(id, name);
      if (row) summary.push(row);
    }

    console.log('\n┌── SUMMARY TABLE ──────────────────────────────────────────────────────────┐');
    console.log('│ Tournament Name                     │ TournID │ LatestSeasonID  │ Year  │');
    console.log('├─────────────────────────────────────┼─────────┼─────────────────┼───────┤');
    for (const r of summary) {
      const n   = r.tournName.padEnd(36).slice(0, 36);
      const id  = String(r.tournId).padEnd(7);
      const sid = String(r.latestSeasonId).padEnd(15);
      const yr  = String(r.latestSeasonYear ?? '').padEnd(5);
      console.log(`│ ${n} │ ${id} │ ${sid} │ ${yr} │`);
    }
    console.log('└───────────────────────────────────────────────────────────────────────────┘');
  } else {
    console.log('\n(No live events — skipping seasons step)');
  }

  await probeIds();

  console.log('\n════════════════════════════════════════════════════');
  console.log('4. SEARCH for known major tournaments');
  console.log('════════════════════════════════════════════════════');

  for (const query of ['Miami Open', 'Roland Garros', 'Wimbledon', 'US Open', 'Australian Open', 'Monte-Carlo']) {
    await sleep(200);
    console.log(`\n  Search: "${query}"`);
    const { all, tennis, error } = searchQuery(query);

    if (error) {
      console.log(`    ERROR: ${JSON.stringify(error)}`);
      continue;
    }

    if (tennis.length === 0) {
      console.log(`    No tennis hits. Total results: ${all.length}`);
      for (const r of all.slice(0, 5)) {
        const sport = r?.entity?.sport?.name ?? r?.entity?.category?.sport?.name ?? '?';
        const name  = r?.entity?.name ?? r?.entity?.fullName ?? '?';
        console.log(`      type=${r?.entity?.type}  sport="${sport}"  name="${name}"  id=${r?.entity?.id}`);
      }
    } else {
      console.log(`    Tennis hits (${tennis.length}):`);
      for (const r of tennis.slice(0, 8)) {
        const name     = r?.entity?.name ?? r?.entity?.fullName ?? '?';
        const category = r?.entity?.category?.name ?? r?.entity?.country?.name ?? '';
        console.log(`      type=${r?.entity?.type}  name="${name}"  id=${r?.entity?.id}  category="${category}"`);
      }
    }
  }

  console.log('\n════════════════════════════════════════════════════');
  console.log('5. EXTRA PROBES');
  console.log('════════════════════════════════════════════════════');

  for (const path of [
    '/api/tennis/events/top',
    '/api/tennis/tournaments',
    '/api/tennis/category/1/tournaments',
    '/api/tennis/category/2/tournaments',
    '/api/tennis/category/3/tournaments',
  ]) {
    await sleep(150);
    const data = apiFetch(path);
    if (data && !data.__error) {
      const keys = Object.keys(data);
      const arr  = data[keys[0]];
      const count = Array.isArray(arr) ? arr.length : '?';
      console.log(`  ${path}  → keys:${JSON.stringify(keys).slice(0, 60)}  items:${count}`);
      if (Array.isArray(arr) && arr.length > 0) {
        console.log('    sample:', JSON.stringify(arr[0]).slice(0, 200));
      }
    } else {
      console.log(`  ${path}  → ${JSON.stringify(data)}`);
    }
  }

  console.log('\n════ DONE ════\n');
}

main().catch(e => { console.error(e); process.exit(1); });
