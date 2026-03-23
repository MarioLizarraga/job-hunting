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

function clearScreener() {
  // Reset resume selection
  selectedResumeId = null;
  document.getElementById('resumeFile').value = '';
  document.getElementById('resumeCard').classList.remove('has-file');
  document.getElementById('fileName').style.display = 'none';
  renderResumeLibrary();

  // Reset JD
  document.getElementById('jdUrl').value = '';
  document.getElementById('jdText').value = '';
  lastFetchedJd = null;
  lastRawJinaText = '';
  currentResumeText = '';

  // Clear results
  document.getElementById('results').innerHTML = '';

  showToast('Screener cleared', 'info');
}

/* ─── JD URL Fetcher ───────────────────────────────────────── */
let lastFetchedJd = null;
let lastRawJinaText = '';

function normalizeJobUrl(url) {
  try {
    const u = new URL(url);

    // LinkedIn: extract job ID from any URL variant and use /jobs/view/{id}
    if (u.hostname.includes('linkedin.com')) {
      // /jobs/collections/recommended/?currentJobId=123 → /jobs/view/123
      const currentJobId = u.searchParams.get('currentJobId');
      if (currentJobId) return `https://www.linkedin.com/jobs/view/${currentJobId}`;
      // /jobs/search/?currentJobId=123
      // /jobs/collections/...?currentJobId=123
      // Already /jobs/view/123 — extract just the ID to normalize
      const viewMatch = u.pathname.match(/\/jobs\/view\/(\d+)/);
      if (viewMatch) return `https://www.linkedin.com/jobs/view/${viewMatch[1]}`;
    }

    // Meta: /profile/job_details/123 → /jobs/123 (public URL)
    if (u.hostname.includes('metacareers.com')) {
      const detailMatch = u.pathname.match(/\/profile\/job_details\/(\d+)/);
      if (detailMatch) return `https://www.metacareers.com/jobs/${detailMatch[1]}`;
    }

    // Microsoft: extract job ID from search/tracking URLs → clean /careers/job/{id}
    if (u.hostname.includes('careers.microsoft.com')) {
      // Search page with pid= param: /careers?pid=123&... → /careers/job/123
      const pid = u.searchParams.get('pid');
      if (pid) return `https://apply.careers.microsoft.com/careers/job/${pid}?domain=microsoft.com`;
      // Already a job URL — strip tracking params
      const jobMatch = u.pathname.match(/\/careers\/job\/(\d+)/);
      if (jobMatch) return `https://apply.careers.microsoft.com/careers/job/${jobMatch[1]}?domain=microsoft.com`;
    }

    // Indeed: ensure clean URL without tracking params
    if (u.hostname.includes('indeed.com')) {
      const jk = u.searchParams.get('jk');
      if (jk) return `https://www.indeed.com/viewjob?jk=${jk}`;
    }

    // Amazon: strip tracking params, keep clean job URL
    if (u.hostname.includes('amazon.jobs')) {
      const jobMatch = u.pathname.match(/(\/en\/jobs\/\d+\/[^?]*)/);
      if (jobMatch) return `https://www.amazon.jobs${jobMatch[1]}`;
    }

    // Greenhouse: normalize board URLs
    if (u.hostname.includes('greenhouse.io')) {
      const jobMatch = u.pathname.match(/(\/[\w-]+\/jobs\/\d+)/);
      if (jobMatch) return `https://${u.hostname}${jobMatch[1]}`;
    }

    // General: strip common tracking params for cleaner fetching
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'src', 'ref', 'fbclid', 'gclid'].forEach(p => u.searchParams.delete(p));
    return u.toString();
  } catch (e) {}
  return url;
}

async function fetchWithFallback(url) {
  const methods = [
    { name: 'Jina Reader', fetch: () => fetch('https://r.jina.ai/' + url, { signal: AbortSignal.timeout(30000), headers: { 'Accept': 'text/plain' } }) },
    { name: 'Jina (retry)', fetch: () => fetch('https://r.jina.ai/' + url, { signal: AbortSignal.timeout(30000), headers: { 'Accept': 'text/plain', 'X-Return-Format': 'text' } }) },
    { name: 'corsproxy.io', fetch: () => fetch('https://corsproxy.io/?' + encodeURIComponent(url), { signal: AbortSignal.timeout(20000) }) },
    { name: 'allorigins', fetch: () => fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent(url), { signal: AbortSignal.timeout(20000) }) },
  ];

  const errors = [];
  for (const method of methods) {
    try {
      const resp = await method.fetch();
      if (!resp.ok) { errors.push(`${method.name}: HTTP ${resp.status}`); continue; }
      const text = await resp.text();
      if (text && text.trim().length > 100) return text;
      errors.push(`${method.name}: empty response`);
    } catch (e) {
      errors.push(`${method.name}: ${e.message}`);
    }
  }
  throw new Error('All methods failed (' + errors.join('; ') + ')');
}

function cleanFetchedContent(raw) {
  let text = raw;

  // 1. Remove JSON blobs (Microsoft injects theme config as JSON in markdown)
  text = text.replace(/`\{[\s\S]*?\}`/g, '');          // backtick-wrapped JSON
  text = text.replace(/\{[^{}]*"[^"]*":\s*"[^"]*"[^{}]*\}/g, ''); // inline JSON objects
  text = text.replace(/\{"[\s\S]{50,}?\}/g, '');        // large JSON blocks

  // 2. Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, '');

  // 3. Remove HTML tags that leak through
  text = text.replace(/<[^>]+>/g, '');

  // 4. Remove CSS/style content
  text = text.replace(/[a-z-]+\s*:\s*#[0-9a-fA-F]{3,8}\s*;?/g, '');  // color: #xxx
  text = text.replace(/[a-z-]+\s*:\s*"[^"]*"\s*;?/g, '');             // prop: "value"

  // 5. Remove image references and markdown links (keep link text)
  text = text.replace(/!\[.*?\]\(.*?\)/g, '');
  text = text.replace(/\[([^\]]+)\]\(.*?\)/g, '$1');

  // 6. Remove markdown formatting but keep content
  text = text.replace(/^#{1,6}\s*/gm, '');
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/^\s*[-*]\s+/gm, '- ');

  // 7. Remove lines that are clearly not job content
  const lines = text.split('\n');
  const filtered = lines.filter(line => {
    const t = line.trim();
    if (t.length === 0) return true;  // keep blank lines for spacing
    if (t.length < 3) return false;
    // Skip navigation/UI noise
    if (/^(Skip to|Sign in|Sign up|Log in|Create account|Cookie|Privacy|Terms|Accept all|Reject|©|All rights|Follow us)/i.test(t)) return false;
    // Skip lines that are just URLs
    if (/^https?:\/\/\S+$/.test(t)) return false;
    // Skip lines that look like CSS/code
    if (/^[a-z-]+\s*{/.test(t)) return false;
    if (/^\s*[a-z-]+\s*:\s*[#"'\d]/.test(t) && t.length < 80) return false;
    // Skip bracket noise
    if (/^[\[\]{}(),;]+$/.test(t)) return false;
    return true;
  });

  text = filtered.join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // 8. Cap length
  if (text.length > 8000) text = text.substring(0, 8000) + '\n\n[Truncated...]';

  return text;
}

async function fetchJdFromUrl() {
  const urlInput = document.getElementById('jdUrl');
  let url = urlInput.value.trim();
  if (!url) { showToast('Enter a job posting URL', 'error'); return; }
  if (!url.startsWith('http://') && !url.startsWith('https://')) { url = 'https://' + url; }

  // Normalize URL (LinkedIn collections → /jobs/view/, Meta profile → /jobs/, etc.)
  url = normalizeJobUrl(url);
  urlInput.value = url;

  const fetchBtn = document.getElementById('fetchJdBtn');
  fetchBtn.disabled = true;
  fetchBtn.textContent = 'Fetching...';

  try {
    const rawText = await fetchWithFallback(url);
    lastRawJinaText = rawText;

    const jinaHeaders = parseJinaHeaders(rawText);

    let cleaned = cleanFetchedContent(jinaHeaders.body || rawText);

    document.getElementById('jdText').value = cleaned;
    // Pass cleaned text for body scanning (raw has JSON/CSS noise on Microsoft etc.)
    const cleanedHeaders = { ...jinaHeaders, body: cleaned };
    lastFetchedJd = extractJobMetadata(cleaned, url, cleanedHeaders);
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

/* ─── Salary Extraction (comprehensive) ────────────────────── */
function extractSalary(text) {
  const fmtNum = (n) => {
    if (!n) return '';
    const num = parseFloat(n.replace(/,/g, ''));
    if (num >= 1000) return '$' + Math.round(num / 1000) + 'k';
    if (num > 0) return '$' + num + 'k';
    return '';
  };

  // All range patterns — each returns [full, low, high]
  const RANGE_PATTERNS = [
    // Meta: "$173,000/year to $245,000/year + bonus"
    /\$([\d,]+)(?:\.\d{0,2})?(?:\/(?:year|yr))?\s+to\s+\$([\d,]+)(?:\.\d{0,2})?(?:\/(?:year|yr))?/ig,
    // Google/generic: "$136,000-$200,000" or "$136,000 - $200,000"
    /\$([\d,]+)(?:\.\d{0,2})?\s*[-–—]\s*\$([\d,]+)(?:\.\d{0,2})?/ig,
    // Microsoft: "USD $124,800 - $266,800 per year"
    /USD\s*\$\s*([\d,]+)(?:\.\d{0,2})?\s*[-–—]\s*\$\s*([\d,]+)(?:\.\d{0,2})?/ig,
    // K notation: "$85K - $120K" or "$85k-$120k"
    /\$([\d.]+)\s*[kK]\s*[-–—]\s*\$?([\d.]+)\s*[kK]/ig,
    // Amazon: "117,300.00 - 160,000.00 USD annually"
    /([\d,]+\.\d{2})\s*[-–—]\s*([\d,]+\.\d{2})\s*(?:USD|usd)/ig,
    // Bare numbers + USD: "117,300 - 160,000 USD"
    /([\d,]{5,10})(?:\.\d{0,2})?\s*[-–—]\s*([\d,]{5,10})(?:\.\d{0,2})?\s*(?:USD|usd)/ig,
    // Bare numbers + per year: "120,000 - 160,000 per year"
    /([\d,]{5,10})(?:\.\d{0,2})?\s*[-–—]\s*([\d,]{5,10})(?:\.\d{0,2})?\s*(?:per\s*year|annually|\/year|\/yr|a\s*year|per\s*annum|pa)\b/ig,
    // $X to $Y (word separator)
    /\$([\d,]+)(?:\.\d{0,2})?\s+to\s+\$([\d,]+)(?:\.\d{0,2})?/ig,
    // UK: £30,000 - £50,000
    /£([\d,]+)(?:\.\d{0,2})?\s*[-–—]\s*£([\d,]+)(?:\.\d{0,2})?/ig,
    // EUR: €50,000 - €70,000
    /€([\d,]+)(?:\.\d{0,2})?\s*[-–—]\s*€([\d,]+)(?:\.\d{0,2})?/ig,
    // CAD/AUD: "CAD 50,000 - 70,000"
    /(?:CAD|AUD)\s*([\d,]+)(?:\.\d{0,2})?\s*[-–—]\s*([\d,]+)(?:\.\d{0,2})?/ig,
    // Labeled: "Salary: $X - $Y" or "Base: $X-$Y" or "Compensation: $X to $Y"
    /(?:salary|compensation|pay|base|total\s*comp|earning)[:\s]+\$?([\d,]+)(?:\.\d{0,2})?\s*[-–—to]+\s*\$?([\d,]+)/ig,
    // Hourly: "$25 - $35 per hour" or "$25/hr - $35/hr"
    /\$([\d.]+)\s*(?:\/hr)?\s*[-–—]\s*\$([\d.]+)\s*(?:\/hr|per\s*hour|an?\s*hour)/ig,
    // Monthly: "$8,000 - $12,000 per month" or "a month"
    /\$([\d,]+)(?:\.\d{0,2})?\s*[-–—]\s*\$([\d,]+)(?:\.\d{0,2})?\s*(?:per\s*month|a\s*month|\/month|\/mo)/ig,
    // OTE: "OTE: $X - $Y" or "On-Target Earnings: $X"
    /(?:OTE|on[- ]target\s*earnings?)[:\s]+\$?([\d,]+)(?:\.\d{0,2})?\s*[-–—to]*\s*\$?([\d,]+)?/ig,
  ];

  // Collect all candidates
  const candidates = [];
  for (const pat of RANGE_PATTERNS) {
    let m;
    while ((m = pat.exec(text)) !== null) {
      const rawLow = m[1].replace(/,/g, '');
      const rawHigh = (m[2] || '').replace(/,/g, '');
      let low = parseFloat(rawLow) || 0;
      let high = parseFloat(rawHigh) || 0;

      // Detect if hourly (< $200) and convert to annual estimate
      const isHourly = /(?:\/hr|per\s*hour|an?\s*hour)/i.test(m[0]);
      const isMonthly = /(?:\/month|per\s*month|a\s*month|\/mo)/i.test(m[0]);
      let type = 'annual';
      if (isHourly) { low *= 2080; high *= 2080; type = 'hourly'; }
      else if (isMonthly) { low *= 12; high *= 12; type = 'monthly'; }
      // K notation
      else if (low < 1000 && low > 10) { low *= 1000; high *= 1000; }

      // Validate: looks like plausible annual compensation
      if (low < 15000 || low > 2000000) continue;
      if (high && (high < low || high > 5000000)) continue;

      candidates.push({ low, high: high || low, raw: m[0], type });
    }
  }

  // Also check for single salary values if no ranges found
  if (candidates.length === 0) {
    const singlePatterns = [
      /\$([\d,]+)(?:\.\d{0,2})?\s*(?:\/year|per\s*year|annually|a\s*year|per\s*annum)/ig,
      /(?:up\s*to|starting\s*at|from)\s*\$([\d,]+)/ig,
      /\$([\d,]+)\s*\+/ig, // "$100,000+"
    ];
    for (const pat of singlePatterns) {
      let m;
      while ((m = pat.exec(text)) !== null) {
        const val = parseFloat(m[1].replace(/,/g, ''));
        if (val >= 30000 && val <= 2000000) {
          candidates.push({ low: val, high: val, raw: m[0], type: 'single' });
        }
      }
    }
  }

  if (candidates.length === 0) return '';

  // Pick the best candidate: prefer ranges over singles, then highest high value
  candidates.sort((a, b) => {
    // Prefer actual ranges over single values
    const aIsRange = a.high > a.low ? 1 : 0;
    const bIsRange = b.high > b.low ? 1 : 0;
    if (aIsRange !== bIsRange) return bIsRange - aIsRange;
    // Then by highest value (likely the main salary, not a smaller bonus number)
    return b.high - a.high;
  });

  const best = candidates[0];
  if (best.high > best.low) {
    return fmtNum(String(best.low)) + ' - ' + fmtNum(String(best.high));
  }
  return fmtNum(String(best.low));
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

  // ── Title extraction (ordered by reliability) ──

  const GENERIC_TITLE = /^(meta\s*careers?|spacex|microsoft\s*careers?|careers?\s*(at|stage)|jobs?|indeed|linkedin|monster|glassdoor|just\s*a\s*moment|google\s*careers?|apple|amazon|netflix|airbnb|uber|welcome|home|sign\s*in)/i;
  const ROLE_KEYWORDS = /(?:Engineer|Developer|Designer|Manager|Analyst|Scientist|Specialist|Technician|Lead|Director|Coordinator|Associate|Intern|Architect|Researcher|Operator|Administrator|Consultant|Strategist|Producer|Officer|VP|Head\s+of)/i;

  // Strategy 1: Jina Title: header (best for Amazon, Workday, Lever — contains real title)
  const jinaTitle = (jh.title || '').trim();
  if (jinaTitle && !GENERIC_TITLE.test(jinaTitle)) {
    // Split on separators: "Job Title | Company Name" or "Company - Job Title"
    const parts = jinaTitle.split(/\s*[-–—|]\s*/).filter(p => p.length > 1);
    if (parts.length >= 2) {
      // Find which parts are generic (site names) vs. real titles
      const realParts = parts.filter(p => !GENERIC_TITLE.test(p));
      const genericParts = parts.filter(p => GENERIC_TITLE.test(p));
      if (realParts.length > 0) {
        // Pick the part with a role keyword as title, or the longest real part
        const titlePart = realParts.find(p => ROLE_KEYWORDS.test(p)) || realParts[0];
        meta.title = titlePart.trim();
        // If there's a non-generic non-title part, it might be the company
        const otherParts = realParts.filter(p => p !== titlePart);
        if (otherParts.length > 0 && !meta.company) meta.company = otherParts[0].trim();
      } else {
        meta.title = parts[0].trim();
      }
    } else {
      meta.title = jinaTitle;
    }
  }

  // Strategy 2: Scan body for short, title-like lines with role keywords
  // (best for Meta where Jina header is generic "Meta Careers")
  if (!meta.title) {
    const bodyLines = body.split('\n').map(l => l.replace(/^#+\s*/, '').trim()).filter(l => l.length > 3 && l.length < 80);
    for (const line of bodyLines) {
      // Must contain a role keyword
      if (!ROLE_KEYWORDS.test(line)) continue;
      // Skip generic site names
      if (GENERIC_TITLE.test(line)) continue;
      // Skip bullet points, numbered items, requirements
      if (/^[-*•\d]/.test(line)) continue;
      // Skip lines that start with lowercase (sentences, not titles)
      if (/^[a-z]/.test(line)) continue;
      // Skip lines with sentence patterns (contains "you", "we", "the", "and" prominently)
      if (/\b(you['']?ll|you will|we are|we're|as a|join our|looking for|responsible for|must have|years of)\b/i.test(line)) continue;
      // Skip nav/UI noise
      if (/^(skip|menu|footer|cookie|privacy|sign|log|apply|share|save|blog|podcast|team|working|career\s+program|about)/i.test(line)) continue;
      // Must be short (title-like, not a sentence)
      if (line.split(/\s+/).length > 10) continue;
      meta.title = line;
      break;
    }
  }

  // Strategy 3: First markdown heading with a role keyword
  if (!meta.title) {
    const headings = body.match(/^#+\s+(.{5,80})$/gm) || [];
    for (const h of headings) {
      const cleaned = h.replace(/^#+\s*/, '').trim();
      if (ROLE_KEYWORDS.test(cleaned) && !GENERIC_TITLE.test(cleaned)) {
        meta.title = cleaned;
        break;
      }
    }
  }

  // Clean up title
  if (meta.title) {
    meta.title = meta.title
      .replace(/\s+/g, ' ')
      .replace(/\|.*$/, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/[*_#]/g, '')
      .trim();
    if (meta.title.length > 70) meta.title = meta.title.substring(0, 70).trim();
  }

  // ── Salary extraction: comprehensive multi-format scanner ──
  meta.salary = extractSalary(body);

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
