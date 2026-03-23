/**
 * Interview Prep — UI logic for company-specific interview preparation
 */

const ANSWERS_KEY = 'rs_interview_answers';
let currentCompany = null;

function getAnswers() { return JSON.parse(localStorage.getItem(ANSWERS_KEY) || '{}'); }
function saveAnswers(a) { localStorage.setItem(ANSWERS_KEY, JSON.stringify(a)); }

function renderInterviewHome() {
  const container = document.getElementById('interview-companies');
  const detail = document.getElementById('interview-detail');
  container.style.display = 'grid';
  detail.style.display = 'none';
  currentCompany = null;

  container.innerHTML = Object.entries(INTERVIEW_DATA).map(([key, co]) => `
    <div class="company-card" onclick="openCompany('${key}')" style="border-top:3px solid ${co.color}">
      <div class="company-card__logo" style="color:${co.color};font-weight:900;font-family:system-ui">${co.logo}</div>
      <div class="company-card__name">${co.name}</div>
      <div class="company-card__desc">${co.desc}</div>
      <div style="margin-top:12px;font-size:0.72rem;color:var(--color-text-muted)">${co.questions.length} questions &middot; ${co.timeline.length} stages</div>
    </div>
  `).join('');
}

function openCompany(key) {
  currentCompany = key;
  const co = INTERVIEW_DATA[key];
  if (!co) return;

  document.getElementById('interview-companies').style.display = 'none';
  const detail = document.getElementById('interview-detail');
  detail.style.display = 'block';

  const answers = getAnswers();
  const coAnswers = answers[key] || {};
  const answeredCount = Object.values(coAnswers).filter(a => a && a.trim().length > 0).length;

  detail.innerHTML = `
    <button class="interview__back" onclick="renderInterviewHome()">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      Back to companies
    </button>
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">
      <div style="font-size:2rem;font-weight:900;color:${co.color};font-family:system-ui">${co.logo}</div>
      <div>
        <h2 style="color:var(--color-heading);margin-bottom:2px">${co.name} Interview Prep</h2>
        <p style="color:var(--color-text-muted);font-size:0.82rem">${answeredCount}/${co.questions.length} answers prepared &middot; ${co.values.join(' &middot; ')}</p>
      </div>
    </div>

    <div class="interview__tabs">
      <button class="interview__tab active" onclick="showTab('${key}','process',this)">Process & Timeline</button>
      <button class="interview__tab" onclick="showTab('${key}','questions',this)">Questions & Answers</button>
      <button class="interview__tab" onclick="showTab('${key}','study',this)">Study Guide</button>
      <button class="interview__tab" onclick="showTab('${key}','values',this)">Values & Culture</button>
    </div>
    <div id="interview-tab-content" class="interview__content"></div>
  `;

  showTab(key, 'process', detail.querySelector('.interview__tab'));
}

function showTab(companyKey, tab, btn) {
  // Update active tab
  document.querySelectorAll('.interview__tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const content = document.getElementById('interview-tab-content');
  const co = INTERVIEW_DATA[companyKey];

  switch (tab) {
    case 'process': renderProcessTab(content, co); break;
    case 'questions': renderQuestionsTab(content, co, companyKey); break;
    case 'study': renderStudyTab(content, co); break;
    case 'values': renderValuesTab(content, co); break;
  }
}

function renderProcessTab(el, co) {
  el.innerHTML = `
    <h3 style="color:var(--color-heading);margin-bottom:16px">Interview Process</h3>
    ${co.timeline.map((step, i) => `
      <div class="timeline-step">
        <div class="timeline-step__num">${i + 1}</div>
        <div class="timeline-step__info">
          <div class="timeline-step__title">${step.title}</div>
          <div class="timeline-step__desc">${step.desc}</div>
          <div class="timeline-step__time">${step.time}</div>
        </div>
      </div>
    `).join('')}
    <div style="margin-top:20px;padding:16px;background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-md)">
      <strong style="color:var(--color-heading)">Total Timeline:</strong>
      <span style="color:var(--color-text-muted)"> Typically 4-8 weeks from application to offer</span>
    </div>
  `;
}

function renderQuestionsTab(el, co, companyKey) {
  const answers = getAnswers();
  const coAnswers = answers[companyKey] || {};

  const types = [...new Set(co.questions.map(q => q.type))];
  const filterHtml = `
    <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
      <button class="btn btn--sm btn--outline qa-filter active" onclick="filterQuestions('all',this)">All (${co.questions.length})</button>
      ${types.map(t => {
        const count = co.questions.filter(q => q.type === t).length;
        return `<button class="btn btn--sm btn--outline qa-filter" onclick="filterQuestions('${t}',this)">${t.charAt(0).toUpperCase() + t.slice(1)} (${count})</button>`;
      }).join('')}
    </div>
  `;

  el.innerHTML = filterHtml + `
    <div id="qa-list">
      ${co.questions.map((q, i) => {
        const savedAnswer = coAnswers[i] || '';
        const hasContent = savedAnswer.trim().length > 0;
        return `
        <div class="qa-card" data-type="${q.type}">
          <div class="qa-card__header" onclick="toggleQA(this)">
            <span class="qa-card__q">${q.q}</span>
            <span class="qa-card__type qa-card__type--${q.type}">${q.type}</span>
          </div>
          <div class="qa-card__body">
            <div class="qa-card__tip">${q.tip}</div>
            <textarea class="qa-card__answer ${hasContent ? 'has-content' : ''}"
              placeholder="Write your answer here... Use STAR format: Situation, Task, Action, Result"
              oninput="saveAnswer('${companyKey}',${i},this.value);this.classList.toggle('has-content',this.value.trim().length>0)"
            >${escapeHtml(savedAnswer)}</textarea>
          </div>
        </div>`;
      }).join('')}
    </div>
  `;
}

function renderStudyTab(el, co) {
  el.innerHTML = `
    <h3 style="color:var(--color-heading);margin-bottom:16px">Study Guide & Preparation</h3>
    <div style="background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:20px">
      ${co.studyGuide.map(item => `
        <div class="study-item">
          <div class="study-item__icon" style="background:var(--color-accent-glow);color:var(--color-accent);width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem">${item.icon}</div>
          <div class="study-item__text">${item.text}</div>
        </div>
      `).join('')}
    </div>

    <h3 style="color:var(--color-heading);margin:24px 0 16px">General Interview Tips</h3>
    <div style="background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:20px">
      <div class="study-item"><div class="study-item__icon">1</div><div class="study-item__text"><strong>Practice out loud</strong> — Recording yourself answering questions reveals filler words, pacing issues, and unclear structure.</div></div>
      <div class="study-item"><div class="study-item__icon">2</div><div class="study-item__text"><strong>2-3 minutes per answer</strong> — Too short = no depth. Too long = rambling. Time yourself.</div></div>
      <div class="study-item"><div class="study-item__icon">3</div><div class="study-item__text"><strong>Prepare 10-12 STAR stories</strong> — Each story can answer multiple questions. Map stories to question types.</div></div>
      <div class="study-item"><div class="study-item__icon">4</div><div class="study-item__text"><strong>Research the interviewer</strong> — Check LinkedIn. Find common ground. Reference their work if relevant.</div></div>
      <div class="study-item"><div class="study-item__icon">5</div><div class="study-item__text"><strong>Ask 2-3 thoughtful questions</strong> — Shows genuine interest. Never say "I don't have any questions."</div></div>
    </div>
  `;
}

function renderValuesTab(el, co) {
  el.innerHTML = `
    <h3 style="color:var(--color-heading);margin-bottom:16px">${co.name} Values & Culture</h3>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-bottom:24px">
      ${co.values.map(v => `
        <div style="background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:16px;text-align:center">
          <div style="font-weight:600;color:var(--color-heading);font-size:0.9rem">${v}</div>
        </div>
      `).join('')}
    </div>
    <div style="background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:20px">
      <h4 style="color:var(--color-heading);margin-bottom:8px">How to Use These in Interviews</h4>
      <p style="font-size:0.85rem;color:var(--color-text)">Weave company values into every answer naturally. Don't say "I demonstrate ${co.values[0]}" — instead, tell a story that naturally shows it. Interviewers are trained to assess value alignment through your examples, not your declarations.</p>
    </div>
  `;
}

/* ─── Question Interactions ────────────────────────────────── */
function toggleQA(header) {
  const body = header.nextElementSibling;
  body.classList.toggle('open');
}

function filterQuestions(type, btn) {
  document.querySelectorAll('.qa-filter').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.qa-card').forEach(card => {
    card.style.display = (type === 'all' || card.dataset.type === type) ? '' : 'none';
  });
}

function saveAnswer(companyKey, questionIdx, text) {
  const answers = getAnswers();
  if (!answers[companyKey]) answers[companyKey] = {};
  answers[companyKey][questionIdx] = text;
  saveAnswers(answers);
}

/* ─── Import/Export Answers ────────────────────────────────── */
function loadInterviewAnswers(input) {
  if (!input.files.length) return;
  const file = input.files[0];
  file.text().then(text => {
    try {
      const data = JSON.parse(text);
      if (data.interview_answers) {
        saveAnswers(data.interview_answers);
        showToast(`Loaded answers for ${Object.keys(data.interview_answers).length} companies`, 'success');
        if (currentCompany) openCompany(currentCompany);
        else renderInterviewHome();
      } else {
        throw new Error('No interview_answers key found');
      }
    } catch (e) {
      showToast('Invalid JSON: ' + e.message, 'error');
    }
  });
  input.value = '';
}

function exportInterviewAnswers() {
  const answers = getAnswers();
  const data = {
    version: 1,
    exported: new Date().toISOString(),
    interview_answers: answers,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `interview-answers-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Answers exported', 'success');
}
