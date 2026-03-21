/* =================================================
   TENNIS JOURNAL — app.js (v2 — League Edition)
   ================================================= */

// ===== STATIC LEAGUE DATA =====
const MY_NAME = 'Laurentiu Borcan';

const MY_MATCHES = [
  { id: 'lm1',  p1: 'Laurentiu Borcan',    s1: 8,  p2: 'Franco Gueli',          s2: 6,  result: 'win'  },
  { id: 'lm2',  p1: 'Laurentiu Borcan',    s1: 9,  p2: 'Laurent Gunsbourg',      s2: 7,  result: 'win'  },
  { id: 'lm3',  p1: 'Guillaume Lainé',     s1: 6,  p2: 'Laurentiu Borcan',       s2: 9,  result: 'win'  },
  { id: 'lm4',  p1: 'Georges Mensah',      s1: 6,  p2: 'Laurentiu Borcan',       s2: 8,  result: 'win'  },
  { id: 'lm5',  p1: 'Laurentiu Borcan',    s1: 9,  p2: 'Christophe Jonckheere',  s2: 7,  result: 'win'  },
  { id: 'lm6',  p1: 'Alain Braem',         s1: 7,  p2: 'Laurentiu Borcan',       s2: 7,  result: 'draw' },
  { id: 'lm7',  p1: 'Gilles Petit',        s1: 7,  p2: 'Laurentiu Borcan',       s2: 12, result: 'win'  },
  { id: 'lm8',  p1: 'Olivier Gatti',       s1: 7,  p2: 'Laurentiu Borcan',       s2: 7,  result: 'draw' },
  { id: 'lm9',  p1: 'Laurentiu Borcan',    s1: 12, p2: 'Christopher Debuyst',    s2: 5,  result: 'win'  },
  { id: 'lm10', p1: 'Laurentiu Borcan',    s1: 7,  p2: 'Jan Vavrovec',           s2: 8,  result: 'loss' },
];

const MY_UPCOMING = { date: '29/03/2026', time: '18:00', p1: 'Louis Herbert', p2: 'Laurentiu Borcan' };

const MY_STATS = { pts: 16, played: 10, w: 7, d: 2, l: 1, diff: 22, rating: 'C30.3', position: 2 };

const STANDINGS = [
  { name: 'Gilles Petit',          rating: 'C15.5', pts: 16, played: 9,  w: 8, d: 0, l: 1, diff: 60  },
  { name: 'Laurentiu Borcan',      rating: 'C30.3', pts: 16, played: 10, w: 7, d: 2, l: 1, diff: 22  },
  { name: 'Franco Gueli',          rating: 'NC',    pts: 12, played: 8,  w: 6, d: 0, l: 2, diff: 10  },
  { name: 'Georges Mensah',        rating: 'C30.1', pts: 12, played: 11, w: 6, d: 0, l: 5, diff: 0   },
  { name: 'Alain Braem',           rating: 'C30.5', pts: 11, played: 9,  w: 5, d: 1, l: 3, diff: 5   },
  { name: 'Louis Herbert',         rating: 'NC',    pts: 10, played: 8,  w: 5, d: 0, l: 3, diff: 16  },
  { name: 'Christopher Debuyst',   rating: 'C30.2', pts: 10, played: 8,  w: 5, d: 0, l: 3, diff: 1   },
  { name: 'Guillaume Lainé',       rating: 'NC',    pts: 6,  played: 8,  w: 3, d: 0, l: 5, diff: -1  },
  { name: 'Olivier Gatti',         rating: 'C30.1', pts: 6,  played: 9,  w: 2, d: 2, l: 5, diff: -9  },
  { name: 'Christophe Jonckheere', rating: 'C30.4', pts: 3,  played: 8,  w: 1, d: 1, l: 6, diff: -17 },
  { name: 'Laurent Gunsbourg',     rating: 'C30.2', pts: 2,  played: 9,  w: 1, d: 0, l: 8, diff: -31 },
  { name: 'Jan Vavrovec',          rating: 'C30.6', pts: 2,  played: 8,  w: 1, d: 0, l: 7, diff: -53 },
  { name: 'Xavier Naegel',         rating: 'C30.4', pts: 0,  played: 0,  w: 0, d: 0, l: 0, diff: 0   },
];

const ALL_MATCHES = [
  { p1: 'Guillaume Lainé',          s1: 7,  p2: 'Georges Mensah',         s2: 9  },
  { p1: 'Christophe Jonckheere',    s1: 4,  p2: 'Georges Mensah',         s2: 7  },
  { p1: 'Olivier Gatti',            s1: 15, p2: 'Jan Vavrovec',           s2: 4  },
  { p1: 'Gilles Petit',             s1: 16, p2: 'Laurent Gunsbourg',      s2: 4  },
  { p1: 'Laurentiu Borcan',         s1: 8,  p2: 'Franco Gueli',           s2: 6  },
  { p1: 'Laurentiu Borcan',         s1: 9,  p2: 'Laurent Gunsbourg',      s2: 7  },
  { p1: 'Christopher Debuyst',      s1: 7,  p2: 'Christophe Jonckheere',  s2: 5  },
  { p1: 'Laurent Gunsbourg',        s1: 4,  p2: 'Christopher Debuyst',    s2: 11 },
  { p1: 'Olivier Gatti',            s1: 6,  p2: 'Georges Mensah',         s2: 8  },
  { p1: 'Guillaume Lainé',          s1: 6,  p2: 'Laurentiu Borcan',       s2: 9  },
  { p1: 'Christophe Jonckheere',    s1: 7,  p2: 'Olivier Gatti',          s2: 7  },
  { p1: 'Laurent Gunsbourg',        s1: 5,  p2: 'Georges Mensah',         s2: 8  },
  { p1: 'Guillaume Lainé',          s1: 11, p2: 'Alain Braem',            s2: 6  },
  { p1: 'Georges Mensah',           s1: 6,  p2: 'Laurentiu Borcan',       s2: 8  },
  { p1: 'Gilles Petit',             s1: 13, p2: 'Christopher Debuyst',    s2: 4  },
  { p1: 'Franco Gueli',             s1: 8,  p2: 'Guillaume Lainé',        s2: 7  },
  { p1: 'Alain Braem',              s1: 11, p2: 'Laurent Gunsbourg',      s2: 6  },
  { p1: 'Jan Vavrovec',             s1: 4,  p2: 'Alain Braem',            s2: 10 },
  { p1: 'Gilles Petit',             s1: 13, p2: 'Jan Vavrovec',           s2: 4  },
  { p1: 'Louis Herbert',            s1: 17, p2: 'Alain Braem',            s2: 4  },
  { p1: 'Guillaume Lainé',          s1: 4,  p2: 'Gilles Petit',           s2: 9  },
  { p1: 'Christophe Jonckheere',    s1: 9,  p2: 'Franco Gueli',           s2: 6  },
  { p1: 'Franco Gueli',             s1: 9,  p2: 'Alain Braem',            s2: 7  },
  { p1: 'Laurentiu Borcan',         s1: 9,  p2: 'Christophe Jonckheere',  s2: 7  },
  { p1: 'Gilles Petit',             s1: 11, p2: 'Franco Gueli',           s2: 3  },
  { p1: 'Alain Braem',              s1: 7,  p2: 'Laurentiu Borcan',       s2: 7  },
  { p1: 'Jan Vavrovec',             s1: 5,  p2: 'Georges Mensah',         s2: 11 },
  { p1: 'Guillaume Lainé',          s1: 10, p2: 'Christophe Jonckheere',  s2: 5  },
  { p1: 'Louis Herbert',            s1: 12, p2: 'Jan Vavrovec',           s2: 7  },
  { p1: 'Gilles Petit',             s1: 13, p2: 'Olivier Gatti',          s2: 3  },
  { p1: 'Georges Mensah',           s1: 4,  p2: 'Gilles Petit',           s2: 14 },
  { p1: 'Gilles Petit',             s1: 7,  p2: 'Laurentiu Borcan',       s2: 12 },
  { p1: 'Franco Gueli',             s1: 12, p2: 'Louis Herbert',          s2: 7  },
  { p1: 'Laurent Gunsbourg',        s1: 7,  p2: 'Guillaume Lainé',        s2: 8  },
  { p1: 'Laurent Gunsbourg',        s1: 6,  p2: 'Louis Herbert',          s2: 10 },
  { p1: 'Alain Braem',              s1: 10, p2: 'Christophe Jonckheere',  s2: 6  },
  { p1: 'Guillaume Lainé',          s1: 5,  p2: 'Olivier Gatti',          s2: 6  },
  { p1: 'Georges Mensah',           s1: 5,  p2: 'Alain Braem',            s2: 10 },
  { p1: 'Jan Vavrovec',             s1: 4,  p2: 'Franco Gueli',           s2: 11 },
  { p1: 'Olivier Gatti',            s1: 7,  p2: 'Laurentiu Borcan',       s2: 7  },
  { p1: 'Louis Herbert',            s1: 4,  p2: 'Georges Mensah',         s2: 10 },
  { p1: 'Alain Braem',              s1: 9,  p2: 'Olivier Gatti',          s2: 4  },
  { p1: 'Christopher Debuyst',      s1: 4,  p2: 'Louis Herbert',          s2: 10 },
  { p1: 'Laurentiu Borcan',         s1: 12, p2: 'Christopher Debuyst',    s2: 5  },
  { p1: 'Louis Herbert',            s1: 6,  p2: 'Gilles Petit',           s2: 8  },
  { p1: 'Christopher Debuyst',      s1: 8,  p2: 'Olivier Gatti',          s2: 5  },
  { p1: 'Laurentiu Borcan',         s1: 7,  p2: 'Jan Vavrovec',           s2: 8  },
  { p1: 'Georges Mensah',           s1: 5,  p2: 'Christopher Debuyst',    s2: 6  },
  { p1: 'Franco Gueli',             s1: 10, p2: 'Laurent Gunsbourg',      s2: 9  },
  { p1: 'Olivier Gatti',            s1: 7,  p2: 'Louis Herbert',          s2: 8  },
  { p1: 'Jan Vavrovec',             s1: 3,  p2: 'Christopher Debuyst',    s2: 13 },
  { p1: 'Franco Gueli',             s1: 8,  p2: 'Georges Mensah',         s2: 4  },
  { p1: 'Christophe Jonckheere',    s1: 3,  p2: 'Laurent Gunsbourg',      s2: 7  },
];

const ALL_UPCOMING = [
  { date: '15/03/2026', time: '13:30', p1: 'Gilles Petit',        p2: 'Alain Braem'       },
  { date: '15/03/2026', time: '15:00', p1: 'Christopher Debuyst', p2: 'Guillaume Lainé'   },
  { date: '20/03/2026', time: '21:00', p1: 'Christopher Debuyst', p2: 'Alain Braem'       },
  { date: '22/03/2026', time: '18:00', p1: 'Jan Vavrovec',        p2: 'Guillaume Lainé'   },
  { date: '29/03/2026', time: '18:00', p1: 'Louis Herbert',       p2: 'Laurentiu Borcan'  },
  { date: '11/04/2026', time: '17:30', p1: 'Jan Vavrovec',        p2: 'Laurent Gunsbourg' },
  { date: '13/04/2026', time: '19:00', p1: 'Olivier Gatti',       p2: 'Laurent Gunsbourg' },
  { date: '15/04/2026', time: '17:30', p1: 'Guillaume Lainé',     p2: 'Louis Herbert'     },
];

// ===== STORAGE =====
const KEY = { matches: 'tj_matches', leagueNotes: 'tj_league_notes' };

function lsGet(k, def) {
  try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : def; } catch { return def; }
}
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

let matches     = lsGet(KEY.matches,     []);
let leagueNotes = lsGet(KEY.leagueNotes, {});

function saveMatches()     { lsSet(KEY.matches,     matches);     }
function saveLeagueNotes() { lsSet(KEY.leagueNotes, leagueNotes); }

// ===== STATE =====
const state = {
  view:       'my-league',  // 'my-league' | 'all-league' | 'other'
  otherSub:   'journal',    // 'journal' | 'detail' | 'add-match'
  detailId:   null,
  editId:     null,
  formSets:   [{ p: '', o: '' }],
  noteOpenId: null,
};

// ===== UTILS =====
function genId()    { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function today()    { return new Date().toISOString().slice(0, 10); }

function escHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmtDate(d) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[+m - 1]} ${+day}, ${y}`;
}

function fmtScore(sets) {
  return (sets || []).filter(s => s.p !== '' && s.o !== '').map(s => `${s.p}–${s.o}`).join('  ');
}

function surfaceLabel(s) {
  return { hard: 'Hard', clay: 'Clay', grass: 'Grass', indoor: 'Indoor' }[s] || (s || '');
}

// Wrap my name in a highlight span; escape other names
function hlName(name) {
  return name === MY_NAME
    ? `<span class="name-me">${escHtml(name)}</span>`
    : escHtml(name);
}

// Score string from my perspective (my games first)
function myScoreStr(m) {
  return m.p1 === MY_NAME ? `${m.s1}–${m.s2}` : `${m.s2}–${m.s1}`;
}

function myOpp(m) { return m.p1 === MY_NAME ? m.p2 : m.p1; }

// ===== NAVIGATION =====
function navigate(view, extras = {}) {
  if (view === 'my-league' || view === 'all-league') {
    state.view       = view;
    state.noteOpenId = null;
  } else {
    state.view    = 'other';
    state.otherSub = extras.sub || 'journal';
    if (extras.detailId !== undefined) state.detailId = extras.detailId;
    if (extras.sub === 'add-match') {
      if (extras.editId !== undefined) {
        state.editId   = extras.editId;
        const m        = matches.find(x => x.id === extras.editId);
        state.formSets = m ? m.sets.map(s => ({ p: String(s.p), o: String(s.o) })) : [{ p: '', o: '' }];
      } else {
        state.editId   = null;
        state.formSets = [{ p: '', o: '' }];
      }
    }
  }
  render();
  window.scrollTo(0, 0);
}

// ===== RENDER DISPATCHER =====
const app = document.getElementById('app');

function render() {
  document.querySelectorAll('.tab-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.view === state.view)
  );
  if      (state.view === 'my-league')  renderMyLeague();
  else if (state.view === 'all-league') renderAllLeague();
  else {
    if      (state.otherSub === 'journal')   renderOtherJournal();
    else if (state.otherSub === 'detail')    renderOtherDetail();
    else if (state.otherSub === 'add-match') renderOtherAddMatch();
    else    renderOtherJournal();
  }
}

// ===== MY LEAGUE =====
function renderMyLeague() {
  const s  = MY_STATS;
  const diffStr = `+${s.diff}`;

  const statsBar = `
    <div class="my-stats-bar">
      <div class="my-stat-card">
        <span class="my-stat-big">${s.pts}</span>
        <span class="my-stat-label">Points</span>
      </div>
      <div class="my-stat-card">
        <span class="my-stat-big">#${s.position}</span>
        <span class="my-stat-label">Position</span>
      </div>
      <div class="my-stat-card">
        <span class="my-stat-big">${s.played}</span>
        <span class="my-stat-label">Played</span>
      </div>
      <div class="my-stat-card my-stat-card--wdl">
        <span class="my-stat-big"><span class="col-green">${s.w}W</span> <span class="col-draw">${s.d}D</span> <span class="col-red">${s.l}L</span></span>
        <span class="my-stat-label">Record</span>
      </div>
      <div class="my-stat-card">
        <span class="my-stat-big col-green">${diffStr}</span>
        <span class="my-stat-label">Games Diff</span>
      </div>
      <div class="my-stat-card">
        <span class="my-stat-big col-orange">${s.rating}</span>
        <span class="my-stat-label">Ranking</span>
      </div>
    </div>`;

  const upcomingHtml = `
    <div class="upcoming-card upcoming-card--me">
      <span class="upcoming-badge">Next Match</span>
      <div>
        <div class="upcoming-dt">${MY_UPCOMING.date} · ${MY_UPCOMING.time}</div>
        <div class="upcoming-vs">${hlName(MY_UPCOMING.p1)} vs ${hlName(MY_UPCOMING.p2)}</div>
      </div>
    </div>`;

  const matchItems = MY_MATCHES.map(m => renderMyMatchItem(m)).join('');

  app.innerHTML = `
    <div class="league-view">
      ${statsBar}
      ${upcomingHtml}
      <div class="league-section-hd">Completed Matches <span class="section-hd-count">${MY_MATCHES.length}</span></div>
      <div class="league-match-list">${matchItems}</div>
    </div>`;
}

function renderMyMatchItem(m) {
  const opp     = myOpp(m);
  const score   = myScoreStr(m);
  const note    = leagueNotes[m.id] || '';
  const isOpen  = state.noteOpenId === m.id;
  const hasNote = !!note;
  const badgeLabel = m.result === 'win' ? 'W' : m.result === 'draw' ? 'D' : 'L';

  const noteBtn = `
    <button class="note-toggle-btn${hasNote ? ' has-note' : ''}"
            onclick="toggleNote('${m.id}')"
            title="${hasNote ? 'Edit note' : 'Add note'}">
      ${hasNote ? '📝' : '✏️'}
    </button>`;

  let noteContent = '';
  if (isOpen) {
    noteContent = `
      <div class="note-panel">
        <textarea class="note-ta" id="note-ta-${m.id}"
                  placeholder="Your notes for this match…">${escHtml(note)}</textarea>
        <div class="note-panel-actions">
          <button class="btn-primary btn-sm" onclick="saveNote('${m.id}')">Save</button>
          <button class="btn-secondary btn-sm" onclick="toggleNote('${m.id}')">Cancel</button>
        </div>
      </div>`;
  } else if (hasNote) {
    const preview = note.length > 130 ? note.slice(0, 130) + '…' : note;
    noteContent = `
      <div class="note-preview" onclick="toggleNote('${m.id}')">${escHtml(preview).replace(/\n/g, '<br>')}</div>`;
  }

  return `
    <div class="league-match-item">
      <div class="league-match-row">
        <span class="result-badge result-badge--${m.result}">${badgeLabel}</span>
        <span class="league-opp">vs ${escHtml(opp)}</span>
        <span class="league-score">${score}</span>
        ${noteBtn}
      </div>
      ${noteContent}
    </div>`;
}

function toggleNote(matchId) {
  state.noteOpenId = state.noteOpenId === matchId ? null : matchId;
  renderMyLeague();
}

function saveNote(matchId) {
  const ta = document.getElementById(`note-ta-${matchId}`);
  if (ta) {
    const text = ta.value.trim();
    if (text) leagueNotes[matchId] = text;
    else delete leagueNotes[matchId];
    saveLeagueNotes();
  }
  state.noteOpenId = null;
  renderMyLeague();
}

// ===== ALL LEAGUE =====
function renderAllLeague() {
  const standingsRows = STANDINGS.map((p, i) => {
    const isMe   = p.name === MY_NAME;
    const diff   = p.diff > 0 ? `+${p.diff}` : String(p.diff);
    const diffCl = p.diff > 0 ? 'col-green' : p.diff < 0 ? 'col-red' : '';
    return `
      <tr class="${isMe ? 'standings-me' : ''}">
        <td class="std-rank">${i + 1}</td>
        <td class="std-name">${hlName(p.name)}<span class="std-rating">${escHtml(p.rating)}</span></td>
        <td class="std-pts">${p.pts}</td>
        <td>${p.played}</td>
        <td class="col-green">${p.w}</td>
        <td class="col-draw">${p.d}</td>
        <td class="col-red">${p.l}</td>
        <td class="${diffCl}">${diff}</td>
      </tr>`;
  }).join('');

  const matchRows = ALL_MATCHES.map(m => {
    const isDraw  = m.s1 === m.s2;
    const p1wins  = m.s1 > m.s2;
    const hasMe   = m.p1 === MY_NAME || m.p2 === MY_NAME;
    const p1cl    = isDraw ? '' : (p1wins  ? 'match-winner' : 'match-loser');
    const p2cl    = isDraw ? '' : (!p1wins ? 'match-winner' : 'match-loser');
    const p1me    = m.p1 === MY_NAME ? ' name-me' : '';
    const p2me    = m.p2 === MY_NAME ? ' name-me' : '';
    return `
      <div class="all-match-row${hasMe ? ' all-match-row--me' : ''}">
        <span class="all-match-p1 ${p1cl}${p1me}">${escHtml(m.p1)}</span>
        <span class="all-match-score">${m.s1}–${m.s2}</span>
        <span class="all-match-p2 ${p2cl}${p2me}">${escHtml(m.p2)}</span>
      </div>`;
  }).join('');

  const upcomingRows = ALL_UPCOMING.map(u => {
    const hasMe = u.p1 === MY_NAME || u.p2 === MY_NAME;
    return `
      <div class="upcoming-item${hasMe ? ' upcoming-item--me' : ''}">
        <span class="upcoming-dt">${u.date} · ${u.time}</span>
        <span class="upcoming-match-str">${hlName(u.p1)} vs ${hlName(u.p2)}</span>
      </div>`;
  }).join('');

  app.innerHTML = `
    <div class="league-view">
      <div class="league-section-hd">Standings</div>
      <div class="standings-wrap">
        <table class="standings-table">
          <thead>
            <tr>
              <th>#</th>
              <th class="std-name">Player</th>
              <th>Pts</th>
              <th>P</th>
              <th class="col-green">W</th>
              <th class="col-draw">D</th>
              <th class="col-red">L</th>
              <th>Diff</th>
            </tr>
          </thead>
          <tbody>${standingsRows}</tbody>
        </table>
      </div>

      <div class="league-section-hd">All Results <span class="section-hd-count">${ALL_MATCHES.length}</span></div>
      <div class="all-matches-list">${matchRows}</div>

      <div class="league-section-hd">Upcoming <span class="section-hd-count">${ALL_UPCOMING.length}</span></div>
      <div class="upcoming-list">${upcomingRows}</div>
    </div>`;
}

// ===== OTHER MATCHES — JOURNAL =====
function renderOtherJournal() {
  const sorted = [...matches].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);

  if (!sorted.length) {
    app.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎾</div>
        <h2 class="empty-title">No matches logged yet</h2>
        <p class="empty-sub">Log your non-league matches here to track your progress.</p>
        <button class="btn-primary" onclick="navigate('other',{sub:'add-match'})">+ Log Your First Match</button>
      </div>`;
    return;
  }

  app.innerHTML = `
    <div class="journal-header">
      <span class="journal-count">${sorted.length} match${sorted.length !== 1 ? 'es' : ''}</span>
      <button class="btn-primary" onclick="navigate('other',{sub:'add-match'})">+ Add Match</button>
    </div>
    <div class="match-list">${sorted.map(renderOtherMatchCard).join('')}</div>`;
}

function renderOtherMatchCard(m) {
  const score = fmtScore(m.sets);
  return `
    <div class="match-card" onclick="navigate('other',{sub:'detail',detailId:'${m.id}'})">
      <div class="match-card-result match-card-result--${m.result}">${m.result === 'win' ? 'W' : 'L'}</div>
      <div class="match-card-body">
        <div class="match-card-top">
          <span class="match-opp">vs ${escHtml(m.opponent)}</span>
          <span class="match-date">${fmtDate(m.date)}</span>
        </div>
        <div class="match-card-mid">
          ${m.location ? `<span class="match-loc">📍 ${escHtml(m.location)}</span>` : ''}
          ${m.surface  ? `<span class="badge-surf badge-surf--${m.surface}">${surfaceLabel(m.surface)}</span>` : ''}
        </div>
        ${score ? `<div class="match-score">${escHtml(score)}</div>` : ''}
      </div>
      <div class="match-card-arrow">›</div>
    </div>`;
}

// ===== OTHER MATCHES — DETAIL =====
function renderOtherDetail() {
  const m = matches.find(x => x.id === state.detailId);
  if (!m) { navigate('other', { sub: 'journal' }); return; }

  const validSets = (m.sets || []).filter(s => s.p !== '' && s.o !== '');

  app.innerHTML = `
    <div class="detail-view">
      <div class="detail-nav">
        <button class="back-btn" onclick="navigate('other',{sub:'journal'})">← Other Matches</button>
        <div class="detail-actions">
          <button class="btn-secondary" onclick="navigate('other',{sub:'add-match',editId:'${m.id}'})">Edit</button>
          <button class="btn-danger" onclick="deleteOtherMatch('${m.id}')">Delete</button>
        </div>
      </div>

      <div class="detail-header">
        <div class="detail-result detail-result--${m.result}">${m.result === 'win' ? 'WIN' : 'LOSS'}</div>
        <div>
          <h2 class="detail-opp">vs ${escHtml(m.opponent)}</h2>
          <div class="detail-meta">
            <span>${fmtDate(m.date)}</span>
            ${m.location ? `<span class="meta-sep">·</span><span>${escHtml(m.location)}</span>` : ''}
            ${m.surface  ? `<span class="meta-sep">·</span><span class="badge-surf badge-surf--${m.surface}">${surfaceLabel(m.surface)}</span>` : ''}
          </div>
        </div>
      </div>

      ${validSets.length ? `
      <div class="detail-section">
        <div class="section-title">Score by Set</div>
        <div class="sets-display">
          ${validSets.map((s, i) => `
            <div class="set-box ${+s.p > +s.o ? 'set-box--won' : 'set-box--lost'}">
              <div class="set-label">Set ${i + 1}</div>
              <div class="set-score">${s.p}–${s.o}</div>
            </div>`).join('')}
        </div>
      </div>` : ''}

      ${m.notes ? `
      <div class="detail-section">
        <div class="section-title">Match Notes</div>
        <div class="notes-content">${escHtml(m.notes).replace(/\n/g, '<br>')}</div>
      </div>` : ''}
    </div>`;
}

function deleteOtherMatch(id) {
  if (!confirm('Delete this match? This cannot be undone.')) return;
  matches = matches.filter(m => m.id !== id);
  saveMatches();
  navigate('other', { sub: 'journal' });
}

// ===== OTHER MATCHES — ADD / EDIT =====
function renderOtherAddMatch() {
  const editing = state.editId ? matches.find(m => m.id === state.editId) : null;
  const f = editing || {};

  const setsHtml = state.formSets.map((s, i) => `
    <div class="set-row" id="set-row-${i}">
      <span class="set-row-label">Set ${i + 1}</span>
      <input type="number" class="set-input" id="sp-${i}"
             value="${escHtml(String(s.p))}" min="0" max="99" placeholder="0"
             oninput="updateSet(${i},'p',this.value)"/>
      <span class="set-sep">–</span>
      <input type="number" class="set-input" id="so-${i}"
             value="${escHtml(String(s.o))}" min="0" max="99" placeholder="0"
             oninput="updateSet(${i},'o',this.value)"/>
      ${state.formSets.length > 1
        ? `<button type="button" class="set-remove" onclick="removeSet(${i})" title="Remove set">×</button>`
        : ''}
    </div>`).join('');

  const isWin  = (f.result === 'win')  || !f.result;
  const isLoss = (f.result === 'loss');

  app.innerHTML = `
    <div class="form-view">
      <div class="form-nav">
        <button class="back-btn" onclick="handleFormBack()">← ${editing ? 'Back' : 'Other Matches'}</button>
        <h2 class="form-title">${editing ? 'Edit Match' : 'Log Match'}</h2>
      </div>

      <form id="matchForm" onsubmit="submitMatch(event)">
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label" for="fDate">Date <span class="req">*</span></label>
            <input class="form-input" type="date" id="fDate" value="${f.date || today()}" required/>
          </div>
          <div class="form-group">
            <label class="form-label" for="fSurface">Surface</label>
            <select class="form-select" id="fSurface">
              ${['hard','clay','grass','indoor'].map(s =>
                `<option value="${s}"${(f.surface || 'hard') === s ? ' selected' : ''}>${surfaceLabel(s)}</option>`
              ).join('')}
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="fOpp">Opponent <span class="req">*</span></label>
          <input class="form-input" type="text" id="fOpp"
                 value="${escHtml(f.opponent || '')}" placeholder="e.g. John Smith" required/>
        </div>

        <div class="form-group">
          <label class="form-label" for="fLoc">Tournament / Location</label>
          <input class="form-input" type="text" id="fLoc"
                 value="${escHtml(f.location || '')}" placeholder="e.g. Club Championship, Court 3"/>
        </div>

        <div class="form-group">
          <label class="form-label">Score by Set</label>
          <div id="setsContainer">${setsHtml}</div>
          ${state.formSets.length < 5
            ? `<button type="button" class="btn-add-set" onclick="addSet()">+ Add Set</button>`
            : ''}
        </div>

        <div class="form-group">
          <label class="form-label">Result <span class="req">*</span></label>
          <div class="result-toggle">
            <label class="result-option result-win-opt${isWin ? ' result-option--active' : ''}">
              <input type="radio" name="result" value="win" ${isWin ? 'checked' : ''}/>
              <span>Win</span>
            </label>
            <label class="result-option result-loss-opt${isLoss ? ' result-option--active' : ''}">
              <input type="radio" name="result" value="loss" ${isLoss ? 'checked' : ''}/>
              <span>Loss</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="fNotes">Match Notes</label>
          <textarea class="form-textarea" id="fNotes" rows="5"
                    placeholder="Tactics used, what went well, areas to improve…">${escHtml(f.notes || '')}</textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary btn-lg">
            ${editing ? 'Save Changes' : 'Log Match'}
          </button>
        </div>
      </form>
    </div>`;

  document.querySelectorAll('input[name="result"]').forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('.result-option').forEach(o => o.classList.remove('result-option--active'));
      radio.closest('.result-option').classList.add('result-option--active');
    });
  });
}

function handleFormBack() {
  if (state.editId) navigate('other', { sub: 'detail', detailId: state.editId });
  else              navigate('other', { sub: 'journal' });
}

function updateSet(idx, field, val) {
  if (state.formSets[idx]) state.formSets[idx][field] = val;
}

function addSet() {
  if (state.formSets.length >= 5) return;
  state.formSets.push({ p: '', o: '' });
  renderOtherAddMatch();
}

function removeSet(idx) {
  state.formSets.splice(idx, 1);
  renderOtherAddMatch();
}

function submitMatch(e) {
  e.preventDefault();
  const date     = document.getElementById('fDate').value;
  const opponent = document.getElementById('fOpp').value.trim();
  const location = document.getElementById('fLoc').value.trim();
  const surface  = document.getElementById('fSurface').value;
  const resultEl = document.querySelector('input[name="result"]:checked');
  const notes    = document.getElementById('fNotes').value.trim();

  if (!date || !opponent) { alert('Please fill in the required fields.'); return; }

  const result = resultEl ? resultEl.value : 'win';
  const sets   = state.formSets.map((_, i) => ({
    p: parseInt(document.getElementById(`sp-${i}`)?.value || '0', 10),
    o: parseInt(document.getElementById(`so-${i}`)?.value || '0', 10),
  }));

  if (state.editId) {
    const idx = matches.findIndex(m => m.id === state.editId);
    if (idx !== -1) matches[idx] = { ...matches[idx], date, opponent, location, surface, sets, result, notes };
  } else {
    matches.push({ id: genId(), date, opponent, location, surface, sets, result, notes, createdAt: Date.now() });
  }

  saveMatches();
  state.formSets = [{ p: '', o: '' }];
  navigate('other', { sub: 'journal' });
}

// ===== INIT =====
function init() {
  document.getElementById('tabsBar').addEventListener('click', e => {
    const btn = e.target.closest('.tab-btn');
    if (!btn || !btn.dataset.view) return;
    navigate(btn.dataset.view);
  });
  navigate('my-league');
}

document.addEventListener('DOMContentLoaded', init);
