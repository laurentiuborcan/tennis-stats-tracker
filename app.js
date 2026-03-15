/* ===================================================
   TENNIS JOURNAL — app.js
   =================================================== */

// ===== DATA LAYER =====
const DB = {
  MATCHES_KEY: 'tj_matches',
  NOTES_KEY: 'tj_notes',

  getMatches() {
    try { return JSON.parse(localStorage.getItem(this.MATCHES_KEY)) || []; }
    catch { return []; }
  },
  saveMatches(matches) {
    localStorage.setItem(this.MATCHES_KEY, JSON.stringify(matches));
  },
  addMatch(match) {
    const matches = this.getMatches();
    match.id = Date.now().toString();
    match.createdAt = new Date().toISOString();
    matches.unshift(match);
    this.saveMatches(matches);
    return match;
  },
  updateMatch(id, data) {
    const matches = this.getMatches();
    const idx = matches.findIndex(m => m.id === id);
    if (idx !== -1) { matches[idx] = { ...matches[idx], ...data }; this.saveMatches(matches); }
  },
  deleteMatch(id) {
    this.saveMatches(this.getMatches().filter(m => m.id !== id));
  },

  getNotes() {
    try { return JSON.parse(localStorage.getItem(this.NOTES_KEY)) || []; }
    catch { return []; }
  },
  saveNotes(notes) {
    localStorage.setItem(this.NOTES_KEY, JSON.stringify(notes));
  },
  addNote(note) {
    const notes = this.getNotes();
    note.id = Date.now().toString();
    note.createdAt = new Date().toISOString();
    notes.unshift(note);
    this.saveNotes(notes);
    return note;
  },
  updateNote(id, data) {
    const notes = this.getNotes();
    const idx = notes.findIndex(n => n.id === id);
    if (idx !== -1) { notes[idx] = { ...notes[idx], ...data, updatedAt: new Date().toISOString() }; this.saveNotes(notes); }
  },
  deleteNote(id) {
    this.saveNotes(this.getNotes().filter(n => n.id !== id));
  },
};

// ===== STATS HELPERS =====
const Stats = {
  compute(matches) {
    const wins = matches.filter(m => m.result === 'win').length;
    const losses = matches.filter(m => m.result === 'loss').length;
    const total = wins + losses;
    const winRate = total ? Math.round((wins / total) * 100) : null;
    const streak = this.streak(matches);
    const bySurface = this.bySurface(matches);
    const byMonth = this.byMonth(matches);
    const byOpponent = this.byOpponent(matches);
    return { wins, losses, total, winRate, streak, bySurface, byMonth, byOpponent };
  },
  streak(matches) {
    if (!matches.length) return null;
    const sorted = [...matches].sort((a, b) => new Date(b.date) - new Date(a.date));
    const first = sorted[0].result;
    let count = 0;
    for (const m of sorted) {
      if (m.result === first) count++;
      else break;
    }
    return { result: first, count };
  },
  bySurface(matches) {
    const surfaces = {};
    for (const m of matches) {
      if (!surfaces[m.surface]) surfaces[m.surface] = { wins: 0, losses: 0 };
      surfaces[m.surface][m.result === 'win' ? 'wins' : 'losses']++;
    }
    return surfaces;
  },
  byMonth(matches) {
    const months = {};
    for (const m of matches) {
      const key = m.date.slice(0, 7); // YYYY-MM
      if (!months[key]) months[key] = { wins: 0, losses: 0 };
      months[key][m.result === 'win' ? 'wins' : 'losses']++;
    }
    return months;
  },
  byOpponent(matches) {
    const opps = {};
    for (const m of matches) {
      const name = m.opponent.trim();
      if (!opps[name]) opps[name] = { wins: 0, losses: 0 };
      opps[name][m.result === 'win' ? 'wins' : 'losses']++;
    }
    return opps;
  },
};

// ===== UTILITIES =====
function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, mo, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, mo - 1, d);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
function monthLabel(key) {
  const [y, mo] = key.split('-');
  return new Date(Number(y), Number(mo) - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}
function escHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ===== TOAST =====
let toastTimer;
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = 'toast'; }, 2500);
}

// ===== NAVIGATION =====
let currentPage = 'dashboard';
function navigate(page) {
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === `page-${page}`));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.page === page));
  if (page === 'dashboard') renderDashboard();
  if (page === 'log') { resetMatchForm(); renderMatchHistory(); }
  if (page === 'notes') renderNotes();
  if (page === 'stats') renderStats();
  window.scrollTo(0, 0);
}

// ===== DASHBOARD =====
function renderDashboard() {
  const matches = DB.getMatches();
  const stats = Stats.compute(matches);

  // Quick stats
  document.getElementById('qs-wins').textContent = stats.wins;
  document.getElementById('qs-losses').textContent = stats.losses;
  document.getElementById('qs-winrate').textContent = stats.winRate !== null ? `${stats.winRate}%` : '—';
  if (stats.streak) {
    const s = stats.streak;
    document.getElementById('qs-streak').textContent = `${s.count}${s.result === 'win' ? 'W' : 'L'}`;
  } else {
    document.getElementById('qs-streak').textContent = '—';
  }

  // Today's date
  document.getElementById('todayDate').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Recent matches (up to 5)
  const container = document.getElementById('recentMatchesList');
  const recent = matches.slice(0, 5);
  if (!recent.length) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🎾</span>
        <p>No matches logged yet.</p>
        <button class="btn btn-primary" data-page-link="log">Log Your First Match</button>
      </div>`;
    bindPageLinks(container);
    return;
  }
  container.innerHTML = recent.map(m => matchItemHTML(m, false)).join('');
  bindMatchItemClicks(container);
}

// ===== MATCH ITEM HTML =====
function matchItemHTML(m, showActions = true) {
  const actionsHTML = showActions ? `
    <div class="match-actions" onclick="event.stopPropagation()">
      <button class="match-action-btn edit" onclick="editMatch('${m.id}')" title="Edit">✏️</button>
      <button class="match-action-btn delete" onclick="confirmDeleteMatch('${m.id}')" title="Delete">🗑️</button>
    </div>` : '';
  return `
    <div class="match-item" data-match-id="${m.id}">
      <div class="match-result-badge ${m.result}">${m.result === 'win' ? 'W' : 'L'}</div>
      <div class="match-info">
        <div class="match-opponent">${escHtml(m.opponent)}</div>
        <div class="match-meta">
          <span class="surface-dot ${m.surface}"></span>
          <span>${capitalize(m.surface)}</span>
          <span>·</span>
          <span>${formatDate(m.date)}</span>
        </div>
      </div>
      ${m.score ? `<div class="match-score">${escHtml(m.score)}</div>` : ''}
      ${actionsHTML}
    </div>`;
}

function bindMatchItemClicks(container) {
  container.querySelectorAll('.match-item').forEach(el => {
    el.addEventListener('click', () => openMatchModal(el.dataset.matchId));
  });
}
function bindPageLinks(container) {
  container.querySelectorAll('[data-page-link]').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.pageLink));
  });
}

// ===== MATCH MODAL =====
function openMatchModal(id) {
  const m = DB.getMatches().find(x => x.id === id);
  if (!m) return;
  document.getElementById('matchModalContent').innerHTML = `
    <div class="modal-match-header">
      <div class="modal-result-badge ${m.result}">${m.result === 'win' ? 'W' : 'L'}</div>
      <div>
        <div class="modal-opponent">${escHtml(m.opponent)}</div>
        ${m.score ? `<div class="modal-score">${escHtml(m.score)}</div>` : ''}
      </div>
    </div>
    <div class="modal-details">
      <div class="modal-detail-row">
        <span class="modal-detail-label">Date</span>
        <span class="modal-detail-value">${formatDate(m.date)}</span>
      </div>
      <div class="modal-detail-row">
        <span class="modal-detail-label">Surface</span>
        <span class="modal-detail-value">
          <span class="surface-pill ${m.surface}">
            <span class="surface-dot ${m.surface}"></span>
            ${capitalize(m.surface)}
          </span>
        </span>
      </div>
      <div class="modal-detail-row">
        <span class="modal-detail-label">Result</span>
        <span class="modal-detail-value" style="color: ${m.result === 'win' ? 'var(--green)' : 'var(--red)'}; font-weight: 700;">
          ${m.result === 'win' ? 'Win 🏆' : 'Loss'}
        </span>
      </div>
      ${m.notes ? `
      <div class="modal-detail-row">
        <span class="modal-detail-label">Notes</span>
        <span class="modal-detail-value modal-notes-text">${escHtml(m.notes)}</span>
      </div>` : ''}
    </div>
    <div class="modal-match-actions">
      <button class="btn btn-secondary btn-sm" onclick="closeMatchModal(); editMatch('${m.id}')">Edit</button>
      <button class="btn btn-danger btn-sm" onclick="closeMatchModal(); confirmDeleteMatch('${m.id}')">Delete</button>
    </div>`;
  document.getElementById('matchModal').classList.add('open');
}
function closeMatchModal() {
  document.getElementById('matchModal').classList.remove('open');
}

// ===== MATCH FORM =====
function resetMatchForm() {
  document.getElementById('matchForm').reset();
  document.getElementById('editMatchId').value = '';
  document.getElementById('logFormTitle').textContent = 'Log a Match';
  document.getElementById('submitMatchBtn').textContent = 'Save Match';
  document.getElementById('cancelEdit').style.display = 'none';

  // Default date = today
  document.getElementById('matchDate').value = new Date().toISOString().slice(0, 10);

  // Reset result toggle
  setResultToggle('win');
  // Reset surface toggle
  setSurfaceToggle('hard');
}

function setResultToggle(value) {
  document.getElementById('matchResult').value = value;
  document.getElementById('resultWin').classList.toggle('active', value === 'win');
  document.getElementById('resultLoss').classList.toggle('active', value === 'loss');
}

function setSurfaceToggle(value) {
  document.getElementById('matchSurface').value = value;
  document.querySelectorAll('.surface-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.value === value);
  });
}

function editMatch(id) {
  const m = DB.getMatches().find(x => x.id === id);
  if (!m) return;
  navigate('log');
  document.getElementById('editMatchId').value = m.id;
  document.getElementById('matchDate').value = m.date;
  document.getElementById('opponentName').value = m.opponent;
  document.getElementById('matchScore').value = m.score || '';
  document.getElementById('matchNotes').value = m.notes || '';
  setResultToggle(m.result);
  setSurfaceToggle(m.surface);
  document.getElementById('logFormTitle').textContent = 'Edit Match';
  document.getElementById('submitMatchBtn').textContent = 'Update Match';
  document.getElementById('cancelEdit').style.display = 'inline-flex';
  window.scrollTo(0, 0);
}

function confirmDeleteMatch(id) {
  if (confirm('Delete this match? This cannot be undone.')) {
    DB.deleteMatch(id);
    showToast('Match deleted');
    if (currentPage === 'dashboard') renderDashboard();
    if (currentPage === 'log') renderMatchHistory();
    if (currentPage === 'stats') renderStats();
  }
}

// ===== MATCH HISTORY (Log page) =====
function renderMatchHistory() {
  const surface = document.getElementById('filterSurface').value;
  const result = document.getElementById('filterResult').value;
  let matches = DB.getMatches();
  if (surface !== 'all') matches = matches.filter(m => m.surface === surface);
  if (result !== 'all') matches = matches.filter(m => m.result === result);

  const container = document.getElementById('matchHistoryList');
  if (!matches.length) {
    container.innerHTML = `<div class="empty-state"><span class="empty-icon">🎾</span><p>No matches found.</p></div>`;
    return;
  }
  container.innerHTML = matches.map(m => matchItemHTML(m, true)).join('');
  bindMatchItemClicks(container);
}

// ===== NOTES =====
let activeNoteId = null;

function renderNotes() {
  const notes = DB.getNotes();
  const container = document.getElementById('notesList');
  if (!notes.length) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📝</span>
        <p>No notes yet. Start capturing your tennis thoughts!</p>
        <button class="btn btn-primary" id="newNoteBtn2">Create First Note</button>
      </div>`;
    document.getElementById('newNoteBtn2')?.addEventListener('click', openNoteEditor);
    return;
  }
  container.innerHTML = notes.map(n => `
    <div class="note-card tag-${n.tag}" data-note-id="${n.id}">
      <div class="note-card-header">
        <div class="note-title">${escHtml(n.title || 'Untitled')}</div>
        <span class="note-tag-badge ${n.tag}">${capitalize(n.tag)}</span>
      </div>
      <div class="note-preview">${escHtml(n.content)}</div>
      <div class="note-date">${formatDate(n.createdAt?.slice(0,10))}${n.updatedAt ? ' · edited' : ''}</div>
    </div>`).join('');
  container.querySelectorAll('.note-card').forEach(el => {
    el.addEventListener('click', () => openNoteModal(el.dataset.noteId));
  });
}

function openNoteEditor(noteId = null) {
  const editor = document.getElementById('noteEditor');
  editor.style.display = 'block';
  if (noteId) {
    const n = DB.getNotes().find(x => x.id === noteId);
    if (!n) return;
    document.getElementById('noteTitle').value = n.title || '';
    document.getElementById('noteContent').value = n.content || '';
    document.getElementById('editNoteId').value = n.id;
    setNoteTag(n.tag || 'general');
  } else {
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').value = '';
    document.getElementById('editNoteId').value = '';
    setNoteTag('general');
  }
  editor.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeNoteEditor() {
  document.getElementById('noteEditor').style.display = 'none';
}

function setNoteTag(tag) {
  document.getElementById('noteTag').value = tag;
  document.querySelectorAll('.tag-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tag === tag);
  });
}

function openNoteModal(id) {
  activeNoteId = id;
  const n = DB.getNotes().find(x => x.id === id);
  if (!n) return;
  document.getElementById('noteModalContent').innerHTML = `
    <h2 style="margin-bottom:0.5rem;padding-right:2rem">${escHtml(n.title || 'Untitled')}</h2>
    <div style="margin-bottom:1rem">
      <span class="note-tag-badge ${n.tag}">${capitalize(n.tag)}</span>
      <span style="font-size:0.78rem;color:var(--gray-500);margin-left:0.5rem">${formatDate(n.createdAt?.slice(0,10))}</span>
    </div>
    <p style="white-space:pre-wrap;line-height:1.7;font-size:0.95rem">${escHtml(n.content)}</p>`;
  document.getElementById('noteModal').classList.add('open');
}
function closeNoteModal() {
  document.getElementById('noteModal').classList.remove('open');
  activeNoteId = null;
}

// ===== STATS PAGE =====
function renderStats() {
  const matches = DB.getMatches();
  const s = Stats.compute(matches);

  document.getElementById('stat-wins').textContent = s.wins;
  document.getElementById('stat-losses').textContent = s.losses;

  const bar = document.getElementById('winrateBar');
  const label = document.getElementById('winrateLabel');
  if (s.winRate !== null) {
    bar.style.width = `${s.winRate}%`;
    label.textContent = `${s.winRate}% win rate (${s.total} matches)`;
  } else {
    bar.style.width = '0%';
    label.textContent = 'No matches yet';
  }

  // Streak
  const streakEl = document.getElementById('streakDisplay');
  if (s.streak) {
    const cls = s.streak.result === 'win' ? 'streak-win' : 'streak-loss';
    streakEl.className = `streak-display ${cls}`;
    streakEl.textContent = `${s.streak.count} ${s.streak.result === 'win' ? 'Win' : 'Loss'}${s.streak.count > 1 ? 's' : ''} in a row`;
  } else {
    streakEl.className = 'streak-display';
    streakEl.textContent = 'No matches yet';
  }

  // Surface
  const surfaceEl = document.getElementById('surfaceStats');
  const surfaces = ['hard', 'clay', 'grass', 'indoor'];
  const surfaceData = surfaces.filter(sv => s.bySurface[sv]);
  if (!surfaceData.length) {
    surfaceEl.innerHTML = '<p style="color:var(--gray-500);font-size:0.9rem">No data yet.</p>';
  } else {
    surfaceEl.innerHTML = surfaceData.map(sv => {
      const d = s.bySurface[sv];
      const total = d.wins + d.losses;
      const pct = total ? Math.round((d.wins / total) * 100) : 0;
      return `
        <div class="surface-row">
          <div class="surface-row-header">
            <span class="surface-name">
              <span class="surface-dot ${sv}"></span>
              ${capitalize(sv)}
            </span>
            <span class="surface-record">${d.wins}W - ${d.losses}L (${pct}%)</span>
          </div>
          <div class="surface-bar-wrap">
            <div class="surface-bar ${sv}" style="width:${pct}%"></div>
          </div>
        </div>`;
    }).join('');
  }

  // Monthly
  const monthlyEl = document.getElementById('monthlyStats');
  const monthKeys = Object.keys(s.byMonth).sort().slice(-6);
  if (!monthKeys.length) {
    monthlyEl.innerHTML = '<p style="color:var(--gray-500);font-size:0.9rem">No data yet.</p>';
  } else {
    const maxMatches = Math.max(...monthKeys.map(k => s.byMonth[k].wins + s.byMonth[k].losses), 1);
    monthlyEl.innerHTML = monthKeys.map(k => {
      const d = s.byMonth[k];
      const total = d.wins + d.losses;
      const wPct = Math.round((d.wins / maxMatches) * 100);
      const lPct = Math.round((d.losses / maxMatches) * 100);
      return `
        <div class="month-row">
          <span class="month-label">${monthLabel(k)}</span>
          <div class="month-bars">
            ${d.wins ? `<div class="month-bar-w" style="width:${wPct}%;height:${wPct}%" title="${d.wins} wins"></div>` : ''}
            ${d.losses ? `<div class="month-bar-l" style="width:${lPct}%;height:${lPct}%" title="${d.losses} losses"></div>` : ''}
          </div>
          <span class="month-count">${d.wins}W ${d.losses}L</span>
        </div>`;
    }).join('');
  }

  // Opponents
  const oppEl = document.getElementById('opponentStats');
  const opps = Object.entries(s.byOpponent).sort((a, b) => (b[1].wins + b[1].losses) - (a[1].wins + a[1].losses));
  if (!opps.length) {
    oppEl.innerHTML = '<p style="color:var(--gray-500);font-size:0.9rem">No data yet.</p>';
  } else {
    oppEl.innerHTML = opps.map(([name, d]) => `
      <div class="opponent-row">
        <span class="opponent-name">${escHtml(name)}</span>
        <span class="opponent-record">
          <span class="opp-w">${d.wins}W</span>
          <span style="color:var(--gray-300)"> - </span>
          <span class="opp-l">${d.losses}L</span>
        </span>
      </div>`).join('');
  }
}

// ===== SEED DEMO DATA =====
function seedDemoData() {
  if (DB.getMatches().length > 0) return; // Already has data
  const demos = [
    { date: '2026-03-12', opponent: 'Carlos R.', score: '6-4, 7-5', result: 'win', surface: 'clay', notes: 'Great baseline rally. My slice backhand worked really well today.' },
    { date: '2026-03-08', opponent: 'James T.', score: '3-6, 4-6', result: 'loss', surface: 'hard', notes: 'Struggled with my second serve. Need to work on toss consistency.' },
    { date: '2026-03-05', opponent: 'Mike S.', score: '6-2, 6-3', result: 'win', surface: 'grass', notes: 'Serve and volley worked perfectly on grass. Fast starts in each set.' },
    { date: '2026-02-28', opponent: 'Daniel P.', score: '7-6, 5-7, 10-8', result: 'win', surface: 'hard', notes: 'Tight match. Super tiebreak was intense. Mental game held up.' },
    { date: '2026-02-20', opponent: 'Carlos R.', score: '4-6, 6-4, 6-7', result: 'loss', surface: 'clay', notes: 'Lost the momentum in the third set. Got frustrated with line calls.' },
    { date: '2026-02-14', opponent: 'Alex W.', score: '6-1, 6-0', result: 'win', surface: 'indoor', notes: 'Dominant performance. Everything clicked today.' },
  ];
  demos.forEach(d => DB.addMatch(d));

  const demoNotes = [
    { title: 'Serve toss fix', tag: 'technique', content: 'Keep the toss out in front and slightly to the right for the flat serve.\nPractice drill: toss without hitting, let ball drop, check landing spot.' },
    { title: 'Match tactics vs baseliners', tag: 'tactics', content: '- Attack short balls with inside-out forehand\n- Use slice backhand to change pace\n- Come to net after wide serve\n- Target the backhand wing consistently' },
    { title: 'Fitness goals March', tag: 'fitness', content: '- 3x per week on-court footwork ladders\n- Sprint intervals on off-days\n- Improve split step timing on returns' },
  ];
  demoNotes.forEach(n => DB.addNote(n));
}

// ===== EVENT BINDING =====
function init() {
  seedDemoData();

  // Navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.page));
  });

  // Page links (in content)
  document.querySelectorAll('[data-page-link]').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.pageLink));
  });

  // Result toggle
  document.getElementById('resultWin').addEventListener('click', () => setResultToggle('win'));
  document.getElementById('resultLoss').addEventListener('click', () => setResultToggle('loss'));

  // Surface toggle
  document.querySelectorAll('.surface-btn').forEach(btn => {
    btn.addEventListener('click', () => setSurfaceToggle(btn.dataset.value));
  });

  // Match form submit
  document.getElementById('matchForm').addEventListener('submit', e => {
    e.preventDefault();
    const editId = document.getElementById('editMatchId').value;
    const date = document.getElementById('matchDate').value;
    const opponent = document.getElementById('opponentName').value.trim();
    const score = document.getElementById('matchScore').value.trim();
    const result = document.getElementById('matchResult').value;
    const surface = document.getElementById('matchSurface').value;
    const notes = document.getElementById('matchNotes').value.trim();

    if (!date || !opponent) { showToast('Date and opponent are required', 'error'); return; }

    if (editId) {
      DB.updateMatch(editId, { date, opponent, score, result, surface, notes });
      showToast('Match updated!');
    } else {
      DB.addMatch({ date, opponent, score, result, surface, notes });
      showToast('Match saved! 🎾');
    }
    resetMatchForm();
    renderMatchHistory();
  });

  // Cancel edit
  document.getElementById('cancelEdit').addEventListener('click', () => {
    resetMatchForm();
    renderMatchHistory();
  });

  // Filters
  document.getElementById('filterSurface').addEventListener('change', renderMatchHistory);
  document.getElementById('filterResult').addEventListener('change', renderMatchHistory);

  // Notes
  document.getElementById('newNoteBtn').addEventListener('click', () => openNoteEditor());

  document.querySelectorAll('.tag-btn').forEach(btn => {
    btn.addEventListener('click', () => setNoteTag(btn.dataset.tag));
  });

  document.getElementById('saveNote').addEventListener('click', () => {
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();
    const tag = document.getElementById('noteTag').value;
    const editId = document.getElementById('editNoteId').value;
    if (!content) { showToast('Note content cannot be empty', 'error'); return; }
    if (editId) {
      DB.updateNote(editId, { title, content, tag });
      showToast('Note updated!');
    } else {
      DB.addNote({ title, content, tag });
      showToast('Note saved!');
    }
    closeNoteEditor();
    renderNotes();
  });

  document.getElementById('cancelNote').addEventListener('click', closeNoteEditor);

  // Note modal actions
  document.getElementById('editNoteFromModal').addEventListener('click', () => {
    const id = activeNoteId;
    closeNoteModal();
    openNoteEditor(id);
  });
  document.getElementById('deleteNoteFromModal').addEventListener('click', () => {
    if (confirm('Delete this note?')) {
      DB.deleteNote(activeNoteId);
      showToast('Note deleted');
      closeNoteModal();
      renderNotes();
    }
  });
  document.getElementById('closeNoteModal').addEventListener('click', closeNoteModal);
  document.getElementById('noteModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeNoteModal();
  });

  // Match modal
  document.getElementById('closeMatchModal').addEventListener('click', closeMatchModal);
  document.getElementById('matchModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeMatchModal();
  });

  // Initial render
  navigate('dashboard');
}

document.addEventListener('DOMContentLoaded', init);
