/**
 * Resume Screener — Main App (SPA with sidebar nav, MTG dark theme)
 * All data stored in localStorage with JSON import/export.
 */

/* ─── Storage ──────────────────────────────────────────────── */
const STORAGE_KEYS = {
  history: 'rs_history',
  applications: 'rs_applications',
  theme: 'rs_theme',
};

function getHistory() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || '[]'); }
function saveHistory(h) { localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(h)); }
function getApps() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.applications) || '[]'); }
function saveApps(a) { localStorage.setItem(STORAGE_KEYS.applications, JSON.stringify(a)); }

/* ─── Toast ────────────────────────────────────────────────── */
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `<span>${message}</span><button class="toast__close" onclick="dismissToast(this.parentElement)">&times;</button>`;
  container.appendChild(toast);
  setTimeout(() => dismissToast(toast), duration);
}
function dismissToast(el) {
  if (!el || !el.parentElement) return;
  el.classList.add('toast--out');
  setTimeout(() => el.remove(), 200);
}

/* ─── Theme ────────────────────────────────────────────────── */
function toggleTheme() {
  const html = document.documentElement;
  const next = (html.getAttribute('data-theme') || 'dark') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem(STORAGE_KEYS.theme, next);
  updateThemeIcon(next);
}
function updateThemeIcon(theme) {
  const icon = document.getElementById('theme-icon');
  if (!icon) return;
  icon.innerHTML = theme === 'dark'
    ? '<circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>'
    : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
}

/* ─── Navigation ───────────────────────────────────────────── */
let currentPage = 'dashboard';

function navigate(page) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById('view-' + page);
  if (target) target.classList.add('active');
  document.querySelectorAll('.admin__link').forEach(l => l.classList.remove('active'));
  const link = document.querySelector(`.admin__link[data-page="${page}"]`);
  if (link) link.classList.add('active');
  currentPage = page;

  if (page === 'dashboard') renderDashboard();
  else if (page === 'history') renderHistory();
  else if (page === 'applications') renderApplications();
}

/* ─── Dashboard ────────────────────────────────────────────── */
function renderDashboard() {
  const history = getHistory();
  const apps = getApps();

  const totalScans = history.length;
  const avgAI = history.length > 0 ? Math.round(history.reduce((s, h) => s + (h.ai_score || 0), 0) / history.length) : 0;
  const avgATS = history.length > 0 ? Math.round(history.reduce((s, h) => s + (h.ats_score || 0), 0) / history.length) : 0;
  const totalApps = apps.length;

  document.getElementById('stat-scans').textContent = totalScans;
  document.getElementById('stat-ai').textContent = avgAI + '%';
  document.getElementById('stat-ats').textContent = avgATS + '%';
  document.getElementById('stat-apps').textContent = totalApps;

  // Recent scans
  const recentDiv = document.getElementById('recent-scans');
  if (history.length === 0) {
    recentDiv.innerHTML = '<div class="empty-state" style="padding:30px"><p>No scans yet</p></div>';
  } else {
    recentDiv.innerHTML = history.slice(-5).reverse().map(h => `
      <div class="dash-item" onclick="navigate('history')">
        <div class="dash-item__dot" style="background:${getScoreColor(h.ats_score || h.ai_score || 0)}"></div>
        <div class="dash-item__info">
          <div class="dash-item__title">${escapeHtml(h.filename || 'Untitled')}</div>
          <div class="dash-item__meta">${new Date(h.date).toLocaleDateString()} &middot; AI: ${h.ai_score || '-'}% &middot; ATS: ${h.ats_score || '-'}%</div>
        </div>
      </div>
    `).join('');
  }

  // Recent apps
  const appsDiv = document.getElementById('recent-apps');
  if (apps.length === 0) {
    appsDiv.innerHTML = '<div class="empty-state" style="padding:30px"><p>No applications tracked</p></div>';
  } else {
    appsDiv.innerHTML = apps.slice(-5).reverse().map(a => `
      <div class="dash-item" onclick="navigate('applications')">
        <div class="dash-item__dot" style="background:${getStatusColor(a.status)}"></div>
        <div class="dash-item__info">
          <div class="dash-item__title">${escapeHtml(a.company)} - ${escapeHtml(a.title)}</div>
          <div class="dash-item__meta">${a.status || 'draft'} &middot; ${a.date || ''}</div>
        </div>
      </div>
    `).join('');
  }
}

/* ─── Screener ─────────────────────────────────────────────── */
let currentResumeText = '';

function onFileSelect(input) {
  const card = document.getElementById('resumeCard');
  const nameEl = document.getElementById('fileName');
  if (input.files.length > 0) {
    card.classList.add('has-file');
    nameEl.textContent = input.files[0].name;
    nameEl.style.display = 'block';
  }
}

async function extractPdfText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async function() {
      try {
        const typedArray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(item => item.str).join(' ') + '\n';
        }
        resolve(text.trim());
      } catch (e) {
        reject(e);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

async function analyze() {
  const fileInput = document.getElementById('resumeFile');
  const jdText = document.getElementById('jdText').value;
  const file = fileInput.files[0];

  if (!file) { showToast('Please upload a resume file', 'error'); return; }
  if (!jdText.trim()) { showToast('Please paste a job description', 'error'); return; }

  const checks = [];
  if (document.getElementById('checkAI').checked) checks.push('ai');
  if (document.getElementById('checkATS').checked) checks.push('ats');
  if (document.getElementById('checkHuman').checked) checks.push('human');
  if (checks.length === 0) { showToast('Select at least one check', 'error'); return; }

  document.getElementById('loading').classList.add('active');
  document.getElementById('results').innerHTML = '';
  document.getElementById('analyzeBtn').disabled = true;

  try {
    let resumeText;
    if (file.name.toLowerCase().endsWith('.pdf')) {
      resumeText = await extractPdfText(file);
    } else {
      resumeText = await file.text();
    }

    if (!resumeText || resumeText.trim().length < 50) {
      showToast('Could not extract text from resume. Ensure it is a text-based PDF.', 'error');
      return;
    }

    currentResumeText = resumeText;
    const results = {};

    if (checks.includes('ai')) results.ai_detection = runAiDetection(resumeText);
    if (checks.includes('ats')) results.ats_filter = runAtsFilter(resumeText, jdText);
    if (checks.includes('human')) results.human_screener = runHumanScreener(resumeText, jdText);

    renderResults(results);

    // Save to history
    const entry = {
      id: Date.now().toString(),
      filename: file.name,
      date: new Date().toISOString(),
      word_count: resumeText.split(/\s+/).length,
      ai_score: results.ai_detection?.overall_score || null,
      ats_score: results.ats_filter?.overall_score || null,
      human_score: results.human_screener?.overall_score || null,
      results,
    };
    const history = getHistory();
    history.push(entry);
    saveHistory(history);
    showToast('Analysis saved to history', 'success');

  } catch (err) {
    showToast('Error: ' + err.message, 'error');
  } finally {
    document.getElementById('loading').classList.remove('active');
    document.getElementById('analyzeBtn').disabled = false;
  }
}

function renderResults(data) {
  const resultsDiv = document.getElementById('results');
  let html = '';
  if (data.ai_detection) html += renderSection('AI Detection', 'Will this resume be flagged as AI-generated?', data.ai_detection);
  if (data.ats_filter) html += renderSection('ATS Filter', 'Will this resume pass automated screening?', data.ats_filter);
  if (data.human_screener) html += renderSection('Human Screener', 'Would a recruiter call for an interview?', data.human_screener);
  resultsDiv.innerHTML = html;
  resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderSection(title, subtitle, result) {
  let checksHtml = '';
  for (const [key, check] of Object.entries(result.checks)) {
    const scoreClass = check.score >= 75 ? 'high' : check.score >= 50 ? 'mid' : 'low';
    let extraHtml = '';

    if (check.match_data) {
      extraHtml += '<div class="keyword-tags">';
      if (check.match_data.required_matched) check.match_data.required_matched.forEach(k => extraHtml += `<span class="tag matched">${escapeHtml(k)}</span>`);
      if (check.match_data.required_missing) check.match_data.required_missing.forEach(k => extraHtml += `<span class="tag missing">${escapeHtml(k)}</span>`);
      extraHtml += '</div>';
    }
    if (check.flags && check.flags.length > 0) {
      extraHtml += '<ul class="flags-list">' + check.flags.map(f => `<li>${escapeHtml(f)}</li>`).join('') + '</ul>';
    }
    if (check.examples) {
      extraHtml += '<div class="examples">';
      if (check.examples.great_examples?.length) extraHtml += '<p class="good">Strong: "' + escapeHtml(check.examples.great_examples[0]) + '"</p>';
      if (check.examples.weak_examples?.length) extraHtml += '<p class="bad">Weak: "' + escapeHtml(check.examples.weak_examples[0]) + '"</p>';
      extraHtml += '</div>';
    }

    checksHtml += `
      <div class="check-row">
        <div class="check-name">${escapeHtml(check.name)}</div>
        <div class="check-score ${scoreClass}">${check.score}%</div>
        <div>
          <div class="check-detail">${escapeHtml(check.detail)}</div>
          ${extraHtml}
        </div>
      </div>`;
  }

  const badgeClass = result.overall_score >= 75 ? 'pass' : result.overall_score >= 50 ? 'warning' : 'fail';
  return `
    <div class="result-section">
      <div class="result-header" onclick="this.parentElement.querySelector('.result-body').classList.toggle('collapsed')">
        <h2>
          <span class="score-badge ${badgeClass}">${result.overall_score}%</span>
          <span>${title}<br><small>${subtitle}</small></span>
        </h2>
      </div>
      <div class="verdict ${result.verdict_class}">${escapeHtml(result.verdict)}</div>
      <div class="result-body">${checksHtml}</div>
    </div>`;
}

/* ─── History ──────────────────────────────────────────────── */
function renderHistory() {
  const history = getHistory();
  const container = document.getElementById('history-list');

  if (history.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">&#128203;</div>
        <h3>No scan history</h3>
        <p>Run your first resume analysis to see results here.</p>
      </div>`;
    return;
  }

  container.innerHTML = history.slice().reverse().map(h => `
    <div class="history-card" onclick="viewHistoryEntry('${h.id}')">
      <div class="history-card__scores">
        ${h.ai_score != null ? `<div class="history-card__score" style="background:${getScoreColor(h.ai_score)}" title="AI">${h.ai_score}%</div>` : ''}
        ${h.ats_score != null ? `<div class="history-card__score" style="background:${getScoreColor(h.ats_score)}" title="ATS">${h.ats_score}%</div>` : ''}
        ${h.human_score != null ? `<div class="history-card__score" style="background:${getScoreColor(h.human_score)}" title="Human">${h.human_score}%</div>` : ''}
      </div>
      <div class="history-card__info">
        <div class="history-card__title">${escapeHtml(h.filename)}</div>
        <div class="history-card__meta">${new Date(h.date).toLocaleString()} &middot; ${h.word_count} words</div>
      </div>
      <button class="history-card__delete" onclick="event.stopPropagation();deleteHistory('${h.id}')" title="Delete">&times;</button>
    </div>
  `).join('');
}

function viewHistoryEntry(id) {
  const history = getHistory();
  const entry = history.find(h => h.id === id);
  if (!entry || !entry.results) return;
  navigate('screener');
  setTimeout(() => renderResults(entry.results), 100);
}

function deleteHistory(id) {
  const history = getHistory().filter(h => h.id !== id);
  saveHistory(history);
  renderHistory();
  showToast('Entry deleted', 'info');
}

function clearHistory() {
  if (!confirm('Delete all scan history?')) return;
  saveHistory([]);
  renderHistory();
  showToast('History cleared', 'info');
}

/* ─── Applications ─────────────────────────────────────────── */
function renderApplications() {
  const apps = getApps();
  const tbody = document.getElementById('apps-tbody');

  if (apps.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--color-text-muted)">No applications tracked yet. Click "Add Application" to start.</td></tr>`;
    return;
  }

  tbody.innerHTML = apps.map((a, i) => `
    <tr>
      <td style="font-weight:600;color:var(--color-heading)">${escapeHtml(a.company)}</td>
      <td>${escapeHtml(a.title)}</td>
      <td><span class="status-badge status-badge--${a.status || 'draft'}">${a.status || 'draft'}</span></td>
      <td>${a.date || ''}</td>
      <td>${a.deadline || ''}</td>
      <td>
        <button class="btn--icon" onclick="editApp(${i})" title="Edit">&#9998;</button>
        <button class="btn--icon" onclick="deleteApp(${i})" title="Delete" style="margin-left:4px">&times;</button>
      </td>
    </tr>
  `).join('');
}

function showAppModal(index) {
  const apps = getApps();
  const app = index != null ? apps[index] : { company: '', title: '', status: 'draft', date: '', deadline: '', notes: '', url: '' };
  const isEdit = index != null;

  const modal = document.getElementById('app-modal');
  modal.style.display = 'flex';
  modal.querySelector('.modal__header h3').textContent = isEdit ? 'Edit Application' : 'Add Application';

  document.getElementById('app-company').value = app.company;
  document.getElementById('app-title').value = app.title;
  document.getElementById('app-status').value = app.status || 'draft';
  document.getElementById('app-date').value = app.date || '';
  document.getElementById('app-deadline').value = app.deadline || '';
  document.getElementById('app-url').value = app.url || '';
  document.getElementById('app-notes').value = app.notes || '';
  document.getElementById('app-index').value = index != null ? index : '';
}

function saveApp() {
  const index = document.getElementById('app-index').value;
  const app = {
    company: document.getElementById('app-company').value,
    title: document.getElementById('app-title').value,
    status: document.getElementById('app-status').value,
    date: document.getElementById('app-date').value,
    deadline: document.getElementById('app-deadline').value,
    url: document.getElementById('app-url').value,
    notes: document.getElementById('app-notes').value,
  };

  if (!app.company || !app.title) { showToast('Company and title are required', 'error'); return; }

  const apps = getApps();
  if (index !== '') apps[parseInt(index)] = app;
  else apps.push(app);
  saveApps(apps);
  closeModal('app-modal');
  renderApplications();
  showToast(index !== '' ? 'Application updated' : 'Application added', 'success');
}

function editApp(i) { showAppModal(i); }
function deleteApp(i) {
  if (!confirm('Delete this application?')) return;
  const apps = getApps();
  apps.splice(i, 1);
  saveApps(apps);
  renderApplications();
  showToast('Application deleted', 'info');
}

/* ─── Import/Export ────────────────────────────────────────── */
function exportData() {
  const data = {
    version: 1,
    exported: new Date().toISOString(),
    history: getHistory(),
    applications: getApps(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `resume-screener-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Data exported', 'success');
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (e) => {
    try {
      const text = await e.target.files[0].text();
      const data = JSON.parse(text);
      if (!data.version) throw new Error('Invalid backup file');
      if (data.history) saveHistory(data.history);
      if (data.applications) saveApps(data.applications);
      showToast(`Imported ${(data.history?.length || 0)} scans, ${(data.applications?.length || 0)} applications`, 'success');
      navigate(currentPage);
    } catch (err) {
      showToast('Import failed: ' + err.message, 'error');
    }
  };
  input.click();
}

/* ─── Helpers ──────────────────────────────────────────────── */
function getScoreColor(score) {
  if (score >= 75) return 'var(--color-success)';
  if (score >= 50) return 'var(--color-warning)';
  return 'var(--color-error)';
}

function getStatusColor(status) {
  const colors = { draft: 'var(--color-info)', submitted: 'var(--color-accent)', interview: 'var(--color-success)', rejected: 'var(--color-error)', offer: 'var(--color-success)' };
  return colors[status] || 'var(--color-text-muted)';
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function closeModal(id) { document.getElementById(id).style.display = 'none'; }

/* ─── Init ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem(STORAGE_KEYS.theme) || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
  navigate('dashboard');
});
