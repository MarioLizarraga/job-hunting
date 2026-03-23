/**
 * Resume Screener — Main App (SPA with sidebar nav, MTG dark theme)
 * All data stored in localStorage with JSON import/export.
 */

/* ─── Storage ──────────────────────────────────────────────── */
const STORAGE_KEYS = {
  history: 'rs_history',
  applications: 'rs_applications',
  resumes: 'rs_resumes',
  theme: 'rs_theme',
};

function getHistory() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || '[]'); }
function saveHistory(h) { localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(h)); }
function getApps() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.applications) || '[]'); }
function saveApps(a) { localStorage.setItem(STORAGE_KEYS.applications, JSON.stringify(a)); }
function getResumes() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.resumes) || '[]'); }
function saveResumes(r) { localStorage.setItem(STORAGE_KEYS.resumes, JSON.stringify(r)); }

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
  localStorage.setItem('rs_page', page);

  if (page === 'dashboard') renderDashboard();
  else if (page === 'resumes') renderResumesPage();
  else if (page === 'screener') renderResumeLibrary();
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

  document.getElementById('stat-scans').textContent = totalScans;
  document.getElementById('stat-ai').textContent = avgAI + '%';
  document.getElementById('stat-ats').textContent = avgATS + '%';
  document.getElementById('stat-apps').textContent = apps.length;

  const recentDiv = document.getElementById('recent-scans');
  recentDiv.innerHTML = history.length === 0
    ? '<div class="empty-state" style="padding:30px"><p>No scans yet</p></div>'
    : history.slice(-5).reverse().map(h => `
      <div class="dash-item" onclick="navigate('history')">
        <div class="dash-item__dot" style="background:${getScoreColor(h.ats_score || h.ai_score || 0)}"></div>
        <div class="dash-item__info">
          <div class="dash-item__title">${escapeHtml(h.filename || 'Untitled')}${h.jdMeta?.title ? ' vs ' + escapeHtml(h.jdMeta.title) : ''}</div>
          <div class="dash-item__meta">${new Date(h.date).toLocaleDateString()} &middot; AI: ${h.ai_score || '-'}% &middot; ATS: ${h.ats_score || '-'}%</div>
        </div>
      </div>`).join('');

  const appsDiv = document.getElementById('recent-apps');
  appsDiv.innerHTML = apps.length === 0
    ? '<div class="empty-state" style="padding:30px"><p>No applications tracked</p></div>'
    : apps.slice(-5).reverse().map(a => `
      <div class="dash-item" onclick="navigate('applications')">
        <div class="dash-item__dot" style="background:${getStatusColor(a.status)}"></div>
        <div class="dash-item__info">
          <div class="dash-item__title">${escapeHtml(a.company)} - ${escapeHtml(a.title)}</div>
          <div class="dash-item__meta">${a.status || 'draft'} &middot; ${a.date || ''}</div>
        </div>
      </div>`).join('');
}

/* ─── Resumes Page (full library) ──────────────────────────── */
function renderResumesPage() {
  const resumes = getResumes();
  const container = document.getElementById('resumes-list');

  if (resumes.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">&#128196;</div>
        <h3>No resumes saved</h3>
        <p>Upload resumes here to build your library, then use them in the Screener.</p>
      </div>`;
    return;
  }

  container.innerHTML = resumes.map(r => `
    <div class="history-card">
      <div class="history-card__scores">
        <div class="history-card__score" style="background:var(--color-accent)">${r.wordCount}</div>
      </div>
      <div class="history-card__info">
        <div class="history-card__title">${escapeHtml(r.name)}</div>
        <div class="history-card__meta">${r.wordCount} words &middot; Added ${new Date(r.date).toLocaleDateString()}</div>
      </div>
      <button class="history-card__delete" onclick="deleteResume('${r.id}');renderResumesPage()" title="Delete">&times;</button>
    </div>
  `).join('');
}

async function uploadResumesToLibrary() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.pdf,.txt,.md';
  input.multiple = true;
  input.onchange = async (e) => {
    let count = 0;
    for (const file of e.target.files) {
      try {
        let text;
        if (file.name.toLowerCase().endsWith('.pdf')) {
          text = await extractPdfText(file);
        } else {
          text = await file.text();
        }
        if (text && text.trim().length > 30) {
          await saveResumeToLibrary(file.name, text);
          count++;
        }
      } catch (err) {
        showToast(`Failed to read ${file.name}`, 'error');
      }
    }
    if (count > 0) {
      showToast(`${count} resume(s) added to library`, 'success');
      renderResumesPage();
    }
  };
  input.click();
}

/* ─── Resume Library (inline in screener) ──────────────────── */
let selectedResumeId = null;

function renderResumeLibrary() {
  const resumes = getResumes();
  const container = document.getElementById('resume-library');
  if (!container) return;
  if (resumes.length === 0) { container.innerHTML = ''; return; }

  container.innerHTML = `
    <div class="resume-lib">
      <div class="resume-lib__label">Saved Resumes</div>
      <div class="resume-lib__list">
        ${resumes.map(r => `
          <button class="resume-lib__item ${selectedResumeId === r.id ? 'active' : ''}" onclick="selectResume('${r.id}')">
            <span class="resume-lib__name">${escapeHtml(r.name)}</span>
            <span class="resume-lib__meta">${r.wordCount} words</span>
            <span class="resume-lib__delete" onclick="event.stopPropagation();deleteResume('${r.id}')" title="Remove">&times;</span>
          </button>
        `).join('')}
      </div>
    </div>`;
}

function selectResume(id) {
  const resumes = getResumes();
  const resume = resumes.find(r => r.id === id);
  if (!resume) return;
  selectedResumeId = selectedResumeId === id ? null : id;
  const card = document.getElementById('resumeCard');
  const nameEl = document.getElementById('fileName');
  if (selectedResumeId) {
    card.classList.add('has-file');
    nameEl.textContent = resume.name;
    nameEl.style.display = 'block';
    document.getElementById('resumeFile').value = '';
  } else {
    card.classList.remove('has-file');
    nameEl.style.display = 'none';
  }
  renderResumeLibrary();
}

function deleteResume(id) {
  const resumes = getResumes().filter(r => r.id !== id);
  saveResumes(resumes);
  if (selectedResumeId === id) selectedResumeId = null;
  renderResumeLibrary();
  showToast('Resume removed', 'info');
}

async function saveResumeToLibrary(name, text) {
  const resumes = getResumes();
  const existing = resumes.findIndex(r => r.name === name);
  const entry = { id: Date.now().toString(), name, text, wordCount: text.split(/\s+/).length, date: new Date().toISOString() };
  if (existing >= 0) { entry.id = resumes[existing].id; resumes[existing] = entry; }
  else resumes.push(entry);
  saveResumes(resumes);
  renderResumeLibrary();
}

/* ─── Screener ─────────────────────────────────────────────── */
let currentResumeText = '';

function onFileSelect(input) {
  if (input.files.length > 0) {
    selectedResumeId = null;
    const card = document.getElementById('resumeCard');
    const nameEl = document.getElementById('fileName');
    card.classList.add('has-file');
    nameEl.textContent = input.files[0].name;
    nameEl.style.display = 'block';
    renderResumeLibrary();
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
      } catch (e) { reject(e); }
    };
    reader.readAsArrayBuffer(file);
  });
}

/* ─── JD URL Fetcher ───────────────────────────────────────── */
let lastFetchedJd = null;
let lastRawJinaText = '';

async function fetchJdFromUrl() {
  const urlInput = document.getElementById('jdUrl');
  let url = urlInput.value.trim();
  if (!url) { showToast('Enter a job posting URL', 'error'); return; }
  if (!url.startsWith('http://') && !url.startsWith('https://')) { url = 'https://' + url; urlInput.value = url; }

  const fetchBtn = document.getElementById('fetchJdBtn');
  fetchBtn.disabled = true;
  fetchBtn.textContent = 'Fetching...';

  try {
    const jinaUrl = 'https://r.jina.ai/' + url;
    const resp = await fetch(jinaUrl, { signal: AbortSignal.timeout(15000), headers: { 'Accept': 'text/plain' } });
    if (!resp.ok) throw new Error('Reader returned ' + resp.status);
    const rawText = await resp.text();
    if (!rawText || rawText.trim().length < 50) throw new Error('No content returned');

    lastRawJinaText = rawText;

    // Parse Jina headers before cleaning
    const jinaHeaders = parseJinaHeaders(rawText);

    // Clean markdown for display
    let cleaned = (jinaHeaders.body || rawText)
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
      .replace(/^#{1,6}\s*/gm, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/^\s*[-*]\s+/gm, '- ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (cleaned.length > 8000) cleaned = cleaned.substring(0, 8000) + '\n\n[Truncated...]';

    document.getElementById('jdText').value = cleaned;
    lastFetchedJd = extractJobMetadata(rawText, url, jinaHeaders);
    showToast(`Loaded: ${lastFetchedJd.title || 'Job'} at ${lastFetchedJd.company || 'Unknown'}`, 'success', 4000);

  } catch (err) {
    showToast('Fetch failed: ' + err.message + '. Try pasting the JD manually.', 'error');
  } finally {
    fetchBtn.disabled = false;
    fetchBtn.textContent = 'Fetch';
  }
}

/* ─── Jina Header Parser ──────────────────────────────────── */
function parseJinaHeaders(raw) {
  const headers = { title: '', url: '', body: '' };
  const lines = raw.split('\n');

  // Jina format: "Title: ...\n\nURL Source: ...\n\nMarkdown Content:\n..."
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const line = lines[i];
    if (line.startsWith('Title: ')) headers.title = line.substring(7).trim();
    else if (line.startsWith('URL Source: ')) headers.url = line.substring(12).trim();
    else if (line.startsWith('Markdown Content:')) {
      headers.body = lines.slice(i + 1).join('\n');
      break;
    }
  }

  if (!headers.body) headers.body = raw;
  return headers;
}

/* ─── Job Metadata Extraction (v2 — uses Jina headers) ───── */
function extractJobMetadata(text, url, jinaHeaders) {
  const meta = { company: '', title: '', salary: '', url: url || '' };
  const jh = jinaHeaders || parseJinaHeaders(text);
  const body = jh.body || text;

  // ── Company from URL domain ──
  const COMPANY_DOMAINS = {
    'metacareers.com': 'Meta', 'meta.com': 'Meta', 'facebook.com': 'Meta',
    'amazon.jobs': 'Amazon', 'amazon.com': 'Amazon',
    'google.com': 'Google', 'careers.google.com': 'Google',
    'apple.com': 'Apple', 'jobs.apple.com': 'Apple',
    'microsoft.com': 'Microsoft', 'careers.microsoft.com': 'Microsoft',
    'tesla.com': 'Tesla', 'spacex.com': 'SpaceX',
    'nvidia.com': 'NVIDIA', 'intel.com': 'Intel',
    'boeing.com': 'Boeing', 'lockheedmartin.com': 'Lockheed Martin',
    'northropgrumman.com': 'Northrop Grumman', 'raytheon.com': 'Raytheon',
    'honeywell.com': 'Honeywell', 'netflix.com': 'Netflix',
    'airbnb.com': 'Airbnb', 'uber.com': 'Uber', 'lyft.com': 'Lyft',
    'salesforce.com': 'Salesforce', 'oracle.com': 'Oracle',
    'ibm.com': 'IBM', 'cisco.com': 'Cisco', 'adobe.com': 'Adobe',
    'linkedin.com': '', 'indeed.com': '', 'monster.com': '', 'glassdoor.com': '',
    'greenhouse.io': '', 'lever.co': '', 'workday.com': '', 'myworkdayjobs.com': '',
  };

  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    for (const [domain, company] of Object.entries(COMPANY_DOMAINS)) {
      if (hostname.includes(domain)) { if (company) meta.company = company; break; }
    }
    // Greenhouse: {company}.greenhouse.io or boards.greenhouse.io/{company}
    if (hostname.endsWith('.greenhouse.io') && !hostname.startsWith('boards.')) {
      meta.company = hostname.replace('.greenhouse.io', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    } else if (hostname === 'boards.greenhouse.io') {
      const seg = new URL(url).pathname.split('/').filter(Boolean)[0];
      if (seg) meta.company = seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
    // Lever: jobs.lever.co/{company}
    if (hostname === 'jobs.lever.co') {
      const seg = new URL(url).pathname.split('/').filter(Boolean)[0];
      if (seg) meta.company = seg.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
    // Workday: {company}.wd*.myworkdayjobs.com
    if (hostname.includes('.myworkdayjobs.com')) {
      meta.company = hostname.split('.')[0].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
  } catch (e) {}

  // ── Title: from Jina header (best for Workday, Lever, Amazon) ──
  const jinaTitle = jh.title || '';
  // Generic titles to ignore — these are site names, not job titles
  const genericTitles = ['meta careers', 'spacex', 'microsoft careers', 'careers at', 'jobs', 'indeed', 'linkedin', 'monster', 'glassdoor', 'just a moment'];

  if (jinaTitle && !genericTitles.some(g => jinaTitle.toLowerCase().includes(g))) {
    // Lever format: "Company - Job Title" or "Company — Job Title"
    const leverSplit = jinaTitle.split(/\s*[-–—|]\s*/);
    if (leverSplit.length >= 2) {
      // If first part is a short company name, title is the rest
      if (leverSplit[0].length < 30 && leverSplit.slice(1).join(' - ').length > 3) {
        if (!meta.company) meta.company = leverSplit[0].trim();
        meta.title = leverSplit.slice(1).join(' - ').trim();
      } else {
        meta.title = jinaTitle;
      }
    } else {
      meta.title = jinaTitle;
    }
  }

  // ── Title: from first markdown heading (# Title) — best for Meta ──
  if (!meta.title || meta.title.length > 80) {
    const headingMatch = body.match(/^#\s+(.{5,80})$/m);
    if (headingMatch) {
      const h = headingMatch[1].trim();
      // Skip nav headings
      if (!/^(about|menu|footer|nav|sign|log|cookie|home|teams|career|working)/i.test(h)) {
        meta.title = h;
      }
    }
  }

  // ── Title: role-keyword pattern in text ──
  if (!meta.title) {
    const roleWords = 'Engineer|Developer|Designer|Manager|Analyst|Scientist|Specialist|Technician|Lead|Director|Coordinator|Associate|Intern|Architect|Researcher|Operator|Administrator|Consultant';
    const roleRegex = new RegExp(`^(.{3,70}(?:${roleWords}).{0,20})$`, 'm');
    const m = body.match(roleRegex);
    if (m) {
      const candidate = m[1].trim();
      if (candidate.length < 80 && !/^(about|apply|share|working|join|meet|explore)/i.test(candidate)) {
        meta.title = candidate;
      }
    }
  }

  // Clean up title
  if (meta.title) {
    meta.title = meta.title.replace(/\s+/g, ' ').replace(/\|.*$/, '').trim();
    if (meta.title.length > 70) meta.title = meta.title.substring(0, 70).trim();
  }

  // ── Salary: find the RANGE pattern (prioritize X to Y or X - Y) ──
  const salaryPatterns = [
    // "$173,000/year to $245,000/year" — Meta format
    /\$([\d,]+)(?:\.00)?\/year\s+to\s+\$([\d,]+)(?:\.00)?\/year/i,
    // "$120,000 - $160,000" with optional /year
    /\$([\d,]+)(?:\.?\d{0,2})?\s*[-–—]\s*\$([\d,]+)(?:\.?\d{0,2})?(?:\s*(?:per\s+)?(?:year|yr|annually|annual|\/yr|\/year|USD))?/i,
    // "$120K - $160K"
    /\$([\d.]+)\s*[kK]\s*[-–—to]+\s*\$?([\d.]+)\s*[kK]/,
    // "Salary: $X - $Y" or "Compensation: $X to $Y"
    /(?:salary|compensation|pay|base|total\s*comp)[:\s]+\$([\d,]+)(?:\.?\d*)?\s*[-–—to]+\s*\$?([\d,]+)/i,
    // "XX,XXX - YY,YYY USD" or "per year"
    /([\d,]{5,10})\s*[-–—]\s*([\d,]{5,10})\s*(?:USD|usd|per year|annually|\/year)/,
    // Single salary: "$173,000/year"
    /\$([\d,]+)(?:\.00)?(?:\s*\/|\s+per\s+)(?:year|yr|annum)/i,
  ];

  for (const pat of salaryPatterns) {
    const m = body.match(pat);
    if (m) {
      const fmt = (n) => {
        if (!n) return '';
        const num = parseFloat(n.replace(/,/g, ''));
        if (num >= 1000) return '$' + Math.round(num / 1000) + 'k';
        if (num > 0) return '$' + num + 'k';
        return '';
      };
      if (m[2]) meta.salary = fmt(m[1]) + ' - ' + fmt(m[2]);
      else meta.salary = fmt(m[1]);
      break;
    }
  }

  return meta;
}

/* ─── Analyze ──────────────────────────────────────────────── */
async function analyze() {
  const fileInput = document.getElementById('resumeFile');
  const jdText = document.getElementById('jdText').value;
  const file = fileInput.files[0];

  let resumeText = '', resumeName = '';
  if (selectedResumeId) {
    const resume = getResumes().find(r => r.id === selectedResumeId);
    if (resume) { resumeText = resume.text; resumeName = resume.name; }
  } else if (file) {
    resumeText = file.name.toLowerCase().endsWith('.pdf') ? await extractPdfText(file) : await file.text();
    resumeName = file.name;
  }

  if (!resumeText || resumeText.trim().length < 50) { showToast('Select a saved resume or upload a file', 'error'); return; }
  if (!jdText.trim()) { showToast('Please paste a job description or fetch from URL', 'error'); return; }

  const checks = [];
  if (document.getElementById('checkAI').checked) checks.push('ai');
  if (document.getElementById('checkATS').checked) checks.push('ats');
  if (document.getElementById('checkHuman').checked) checks.push('human');
  if (checks.length === 0) { showToast('Select at least one check', 'error'); return; }

  document.getElementById('loading').classList.add('active');
  document.getElementById('results').innerHTML = '';
  document.getElementById('analyzeBtn').disabled = true;

  try {
    currentResumeText = resumeText;
    const results = {};
    if (checks.includes('ai')) results.ai_detection = runAiDetection(resumeText);
    if (checks.includes('ats')) results.ats_filter = runAtsFilter(resumeText, jdText);
    if (checks.includes('human')) results.human_screener = runHumanScreener(resumeText, jdText);
    renderResults(results);

    if (!selectedResumeId && file) { await saveResumeToLibrary(resumeName, resumeText); }

    const jdUrl = document.getElementById('jdUrl').value.trim();
    const jdMeta = lastFetchedJd || extractJobMetadata(jdText, jdUrl);

    const entry = {
      id: Date.now().toString(),
      filename: resumeName,
      date: new Date().toISOString(),
      word_count: resumeText.split(/\s+/).length,
      ai_score: results.ai_detection?.overall_score || null,
      ats_score: results.ats_filter?.overall_score || null,
      human_score: results.human_screener?.overall_score || null,
      jdMeta,
      results,
    };
    const history = getHistory();
    history.push(entry);
    saveHistory(history);
    lastFetchedJd = null; // Reset for next scan
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
    if (check.flags?.length) extraHtml += '<ul class="flags-list">' + check.flags.map(f => `<li>${escapeHtml(f)}</li>`).join('') + '</ul>';
    if (check.examples) {
      extraHtml += '<div class="examples">';
      if (check.examples.great_examples?.length) extraHtml += '<p class="good">Strong: "' + escapeHtml(check.examples.great_examples[0]) + '"</p>';
      if (check.examples.weak_examples?.length) extraHtml += '<p class="bad">Weak: "' + escapeHtml(check.examples.weak_examples[0]) + '"</p>';
      extraHtml += '</div>';
    }
    checksHtml += `<div class="check-row"><div class="check-name">${escapeHtml(check.name)}</div><div class="check-score ${scoreClass}">${check.score}%</div><div><div class="check-detail">${escapeHtml(check.detail)}</div>${extraHtml}</div></div>`;
  }
  const badgeClass = result.overall_score >= 75 ? 'pass' : result.overall_score >= 50 ? 'warning' : 'fail';
  return `<div class="result-section"><div class="result-header" onclick="this.parentElement.querySelector('.result-body').classList.toggle('collapsed')"><h2><span class="score-badge ${badgeClass}">${result.overall_score}%</span><span>${title}<br><small>${subtitle}</small></span></h2></div><div class="verdict ${result.verdict_class}">${escapeHtml(result.verdict)}</div><div class="result-body">${checksHtml}</div></div>`;
}

/* ─── History ──────────────────────────────────────────────── */
function renderHistory() {
  const history = getHistory();
  const container = document.getElementById('history-list');

  if (history.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state__icon">&#128203;</div><h3>No scan history</h3><p>Run your first resume analysis to see results here.</p></div>`;
    return;
  }

  container.innerHTML = history.slice().reverse().map(h => {
    const jobLabel = h.jdMeta?.title
      ? `vs <strong>${escapeHtml(h.jdMeta.title)}</strong>${h.jdMeta.company ? ' at ' + escapeHtml(h.jdMeta.company) : ''}`
      : '<span class="history-card__add-job" onclick="event.stopPropagation();editHistoryJob(\''+h.id+'\')">+ add job info</span>';

    return `
    <div class="history-card" onclick="viewHistoryEntry('${h.id}')">
      <div class="history-card__scores">
        ${h.ai_score != null ? `<div class="history-card__score" style="background:${getScoreColor(h.ai_score)}" title="AI">${h.ai_score}%</div>` : ''}
        ${h.ats_score != null ? `<div class="history-card__score" style="background:${getScoreColor(h.ats_score)}" title="ATS">${h.ats_score}%</div>` : ''}
        ${h.human_score != null ? `<div class="history-card__score" style="background:${getScoreColor(h.human_score)}" title="Human">${h.human_score}%</div>` : ''}
      </div>
      <div class="history-card__info">
        <div class="history-card__title">${escapeHtml(h.filename)}</div>
        <div class="history-card__meta">${new Date(h.date).toLocaleString()} &middot; ${jobLabel}</div>
      </div>
      <button class="history-card__action" onclick="event.stopPropagation();createAppFromHistory('${h.id}')" title="Create Application">+App</button>
      <button class="history-card__delete" onclick="event.stopPropagation();deleteHistory('${h.id}')" title="Delete">&times;</button>
    </div>`;
  }).join('');
}

function editHistoryJob(id) {
  const history = getHistory();
  const entry = history.find(h => h.id === id);
  if (!entry) return;
  const jm = entry.jdMeta || {};

  const company = prompt('Company:', jm.company || '');
  if (company === null) return;
  const title = prompt('Job Title:', jm.title || '');
  if (title === null) return;
  const url = prompt('Job URL:', jm.url || '');

  entry.jdMeta = { ...jm, company: company.trim(), title: title.trim(), url: (url || '').trim() };
  saveHistory(history);
  renderHistory();
  showToast('Job info updated', 'success');
}

function viewHistoryEntry(id) {
  const entry = getHistory().find(h => h.id === id);
  if (!entry?.results) return;
  navigate('screener');
  setTimeout(() => renderResults(entry.results), 100);
}

function deleteHistory(id) {
  saveHistory(getHistory().filter(h => h.id !== id));
  renderHistory();
  showToast('Entry deleted', 'info');
}

function clearHistory() {
  if (!confirm('Delete all scan history?')) return;
  saveHistory([]);
  renderHistory();
  showToast('History cleared', 'info');
}

/* ─── History → Application ────────────────────────────────── */
function createAppFromHistory(historyId) {
  const entry = getHistory().find(h => h.id === historyId);
  if (!entry) return;
  const jm = entry.jdMeta || {};

  const modal = document.getElementById('app-modal');
  modal.style.display = 'flex';
  modal.querySelector('.modal__header h3').textContent = 'Add Application';

  document.getElementById('app-company').value = jm.company || '';
  document.getElementById('app-title').value = jm.title || '';
  document.getElementById('app-status').value = 'draft';
  document.getElementById('app-date').value = new Date().toISOString().slice(0, 10);
  document.getElementById('app-url').value = jm.url || '';
  document.getElementById('app-salary').value = jm.salary || '';
  document.getElementById('app-resume').value = entry.filename || '';
  document.getElementById('app-notes').value = '';
  document.getElementById('app-index').value = '';
  document.getElementById('app-scan-id').value = historyId;

  if (jm.company) {
    if (!jm.title) setTimeout(() => document.getElementById('app-title').focus(), 100);
  } else {
    setTimeout(() => document.getElementById('app-company').focus(), 100);
  }
  if (jm.company || jm.title || jm.salary) showToast('Fields auto-filled from scan data', 'info');
}

/* ─── Applications ─────────────────────────────────────────── */
function renderApplications() {
  const apps = getApps();
  const tbody = document.getElementById('apps-tbody');

  if (apps.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--color-text-muted)">No applications tracked yet. Click "Add Application" to start.</td></tr>`;
    return;
  }

  tbody.innerHTML = apps.map((a, i) => {
    const scores = a.scanScores;
    const scoreHtml = scores
      ? `<div style="display:flex;gap:4px">${scores.ai != null ? `<span class="mini-score" style="background:${getScoreColor(scores.ai)}" title="AI">${scores.ai}</span>` : ''}${scores.ats != null ? `<span class="mini-score" style="background:${getScoreColor(scores.ats)}" title="ATS">${scores.ats}</span>` : ''}${scores.human != null ? `<span class="mini-score" style="background:${getScoreColor(scores.human)}" title="Human">${scores.human}</span>` : ''}</div>`
      : '<span style="color:var(--color-text-muted)">-</span>';

    const linkHtml = a.url ? `<a href="${escapeHtml(a.url)}" target="_blank" rel="noopener" class="app-link" onclick="event.stopPropagation()" title="${escapeHtml(a.url)}">Open</a>` : '';

    return `<tr>
      <td style="font-weight:600;color:var(--color-heading)">${escapeHtml(a.company)}</td>
      <td>${escapeHtml(a.title)}</td>
      <td><span class="status-badge status-badge--${a.status || 'draft'}">${a.status || 'draft'}</span></td>
      <td>${scoreHtml}</td>
      <td>${escapeHtml(a.resume || '')}</td>
      <td>${a.salary || ''}</td>
      <td>${a.date || ''}</td>
      <td>${linkHtml}</td>
      <td>
        <button class="btn--icon" onclick="editApp(${i})" title="Edit">&#9998;</button>
        <button class="btn--icon" onclick="deleteApp(${i})" title="Delete" style="margin-left:4px">&times;</button>
      </td>
    </tr>`;
  }).join('');
}

function showAppModal(index) {
  const apps = getApps();
  const app = index != null ? apps[index] : {};
  const modal = document.getElementById('app-modal');
  modal.style.display = 'flex';
  modal.querySelector('.modal__header h3').textContent = index != null ? 'Edit Application' : 'Add Application';

  document.getElementById('app-company').value = app.company || '';
  document.getElementById('app-title').value = app.title || '';
  document.getElementById('app-status').value = app.status || 'draft';
  document.getElementById('app-date').value = app.date || '';
  document.getElementById('app-url').value = app.url || '';
  document.getElementById('app-salary').value = app.salary || '';
  document.getElementById('app-resume').value = app.resume || '';
  document.getElementById('app-notes').value = app.notes || '';
  document.getElementById('app-index').value = index != null ? index : '';
  document.getElementById('app-scan-id').value = app.scanId || '';
}

function saveApp() {
  const index = document.getElementById('app-index').value;
  const scanId = document.getElementById('app-scan-id').value;

  const app = {
    company: document.getElementById('app-company').value,
    title: document.getElementById('app-title').value,
    status: document.getElementById('app-status').value,
    date: document.getElementById('app-date').value,
    url: document.getElementById('app-url').value,
    salary: document.getElementById('app-salary').value,
    resume: document.getElementById('app-resume').value,
    notes: document.getElementById('app-notes').value,
    scanId: scanId || '',
  };

  if (scanId) {
    const entry = getHistory().find(h => h.id === scanId);
    if (entry) app.scanScores = { ai: entry.ai_score, ats: entry.ats_score, human: entry.human_score };
  }
  if (index !== '' && !scanId) {
    const existing = getApps()[parseInt(index)];
    if (existing?.scanScores) app.scanScores = existing.scanScores;
    if (existing?.scanId) app.scanId = existing.scanId;
  }

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
  const data = { version: 3, exported: new Date().toISOString(), history: getHistory(), applications: getApps(), resumes: getResumes() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = `resume-screener-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click(); URL.revokeObjectURL(url);
  showToast('Data exported', 'success');
}

function importData() {
  const input = document.createElement('input'); input.type = 'file'; input.accept = '.json';
  input.onchange = async (e) => {
    try {
      const text = await e.target.files[0].text();
      const data = JSON.parse(text);
      if (data.history) saveHistory(data.history);
      if (data.applications) saveApps(data.applications);
      if (data.resumes) saveResumes(data.resumes);
      showToast(`Imported ${(data.history?.length||0)} scans, ${(data.applications?.length||0)} apps, ${(data.resumes?.length||0)} resumes`, 'success');
      navigate(currentPage);
    } catch (err) { showToast('Import failed: ' + err.message, 'error'); }
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
  const c = { draft: 'var(--color-info)', submitted: 'var(--color-accent)', interview: 'var(--color-success)', rejected: 'var(--color-error)', offer: 'var(--color-success)' };
  return c[status] || 'var(--color-text-muted)';
}
function escapeHtml(s) { return s ? s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : ''; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

/* ─── Init ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem(STORAGE_KEYS.theme) || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
  navigate(localStorage.getItem('rs_page') || 'dashboard');
});
