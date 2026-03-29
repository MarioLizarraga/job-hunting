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
      ${co.phoneScreen ? `<button class="interview__tab active" onclick="showTab('${key}','phonescreen',this)" style="color:var(--color-success);font-weight:700">Phone Screen Prep</button>` : ''}
      ${key === 'amazon' ? `<button class="interview__tab" onclick="showTab('${key}','lps',this)" style="color:#FF9900">Leadership Principles</button>` : ''}
      <button class="interview__tab ${co.phoneScreen ? '' : 'active'}" onclick="showTab('${key}','process',this)">Process & Timeline</button>
      <button class="interview__tab" onclick="showTab('${key}','questions',this)">Questions & Answers</button>
      <button class="interview__tab" onclick="showTab('${key}','study',this)">Study Guide</button>
      <button class="interview__tab" onclick="showTab('${key}','values',this)">Values & Culture</button>
    </div>
    <div id="interview-tab-content" class="interview__content"></div>
  `;

  showTab(key, co.phoneScreen ? 'phonescreen' : 'process', detail.querySelector('.interview__tab'));
}

function showTab(companyKey, tab, btn) {
  // Update active tab
  document.querySelectorAll('.interview__tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const content = document.getElementById('interview-tab-content');
  const co = INTERVIEW_DATA[companyKey];

  switch (tab) {
    case 'phonescreen': renderPhoneScreenTab(content, co); break;
    case 'lps': renderLPsTab(content, co); break;
    case 'process': renderProcessTab(content, co); break;
    case 'questions': renderQuestionsTab(content, co, companyKey); break;
    case 'study': renderStudyTab(content, co); break;
    case 'values': renderValuesTab(content, co); break;
  }
}

const LP_DATA = [
  { name: 'Customer Obsession', desc: 'Start with the customer and work backwards', tested: false,
    meaning: 'EVERYTHING starts with the customer. Amazon won\'t write code until the "working backwards" documents (press release + FAQ) prove the product matters. Being aware of competitors is fine, but spend most time on what customers want. Being customer-obsessed doesn\'t mean ignoring economics — unsustainable businesses don\'t help customers long-term.',
    lookFor: 'Stories where you prioritized the customer\'s need over what was easy, popular, or profitable short-term.',
    mistake: 'Thinking it means ignoring business sustainability.',
    quote: '"If you\'re trying to help customers make the best possible decision for themselves, having honest customer reviews is incredibly helpful."' },
  { name: 'Ownership', desc: 'Think long term, never say "that\'s not my job"', tested: false,
    meaning: 'Think like it\'s your personal money. The renters vs owners analogy: a renter nails a Christmas tree into hardwood floors — an owner never would. If you see a problem with no owner, find the owner or fix it yourself. Don\'t assume someone else has it. Think from the entire company perspective, not just your team.',
    lookFor: 'Stories where you went beyond your job description, took ownership of something nobody asked you to, thought long-term.',
    mistake: '"I don\'t get paid more for that." That\'s the anti-ownership answer.',
    quote: '"Owners ensure the problems are owned, that they have a path to resolution, and they drive it themselves as needed."' },
  { name: 'Invent and Simplify', desc: 'Expect innovation, always find ways to simplify', tested: false,
    meaning: 'Most companies succeed on ONE idea then iterate forever. Amazon constantly reinvents. The Marketplace story: tried auctions (failed — Ebay clone), then Z-shops (nobody visited), then the simplifying assumption — put 3P items on same product pages as 1P. That one insight unlocked 65% of all units sold today. Be externally aware. Don\'t reject ideas because "not invented here."',
    lookFor: 'Stories where you found a simplifying insight that unlocked a problem, or invented something new rather than just iterating.',
    mistake: 'Describing incremental improvements as "invention." Real invention changes the game.',
    quote: '"It wasn\'t until we came up with a simplifying assumption... which in retrospect seems blindingly obvious."' },
  { name: 'Are Right, A Lot', desc: 'Strong judgment, seek diverse perspectives', tested: true,
    meaning: 'This is about JUDGMENT, not winning arguments. The goal is the best answer for customers — doesn\'t matter whose idea it is. Leaders speak LAST. They want everyone\'s input first. Great leaders actively try to disprove their own beliefs. In the best meetings, the leader never even expresses an opinion — the team sorts it out.',
    lookFor: 'Stories where you changed your mind based on new data, or helped a group reach the right answer (not YOUR answer).',
    mistake: 'Thinking it means always pushing your idea. It means getting to the best answer, period.',
    quote: '"All we care about as leaders is getting to the best possible answer for customers. That\'s our job."' },
  { name: 'Learn and Be Curious', desc: 'Never done learning, always improve', tested: false,
    meaning: 'The #1 differentiator between people who grow vs. stagnate. The moment you think there\'s little left to learn, you\'re unwinding. It\'s not enough to TALK about learning — build a plan and actually change. When your field flips upside down, see it as fun, not threatening.',
    lookFor: 'Concrete examples of learning something new AND applying it. Not courses — real skills built and deployed.',
    mistake: 'Talking about learning without the result. "I took a course" is weak. "I learned X in a week and shipped Y" is strong.',
    quote: '"The second you think there\'s little left to learn is the second you are unwinding as an individual."' },
  { name: 'Hire and Develop the Best', desc: 'Raise the bar with every hire', tested: false,
    meaning: 'In hiring loops, each interviewer takes an LP — that\'s how Amazon defines "great people." Always ask: does this person raise the bar? NEVER lower it, even under time pressure. Being a manager is a PRIVILEGE with responsibility to develop people. The managers with biggest career impact weren\'t the nicest — they identified where you needed to grow.',
    lookFor: 'Stories about mentoring, developing people, giving hard feedback, and the measurable growth that resulted.',
    mistake: 'Only talking about what reports did well. Show how you identified growth areas and coached through them.',
    quote: '"The managers who had the biggest impact in my career were not necessarily the ones that were the nicest to me."' },
  { name: 'Insist on the Highest Standards', desc: 'Relentlessly high standards', tested: false,
    meaning: '"Perhaps unreasonably high, but it\'s the right level." Higher expectations ALWAYS lead to better results. You can\'t be in every meeting — so MODEL what good looks like in the meetings you ARE in. It spreads. Standards slipped during COVID. "Keep fighting. That is a fight worth fighting."',
    lookFor: 'Stories where you raised standards others thought were too high, and results proved it right. Or caught a defect before it went downstream.',
    mistake: 'Confusing high standards with perfectionism. High standards + speed = the goal.',
    quote: '"Higher expectations lead to better results."' },
  { name: 'Think Big', desc: 'Create bold direction that inspires results', tested: false,
    meaning: 'If you want a company lasting 100+ years, you can\'t run the same playbook for decades. Look around corners: what technology will change the customer experience? Examples: multi-day to 2-day to same-day to drone delivery. AWS. Kuiper broadband. Healthcare reinvention. Taking risks is hard — that\'s why Think Big leaders are so important.',
    lookFor: 'Stories where you saw a bigger opportunity than what was asked, or proposed a bold approach others thought too ambitious.',
    mistake: 'Confusing "think big" with "dream big." Think Big requires action — a bold direction you actually pursue.',
    quote: '"If you want to build a company that lasts over 100 years, you cannot run the same playbook for decades."' },
  { name: 'Bias for Action', desc: 'Speed matters, most decisions are reversible', tested: true,
    meaning: 'Speed disproportionately matters at every size. "Speed is not preordained, it is a leadership and culture decision." Two-way doors (reversible) = decide quickly at team level. One-way doors (irreversible) = small number, think carefully. Most decisions are two-way doors. "Don\'t take weeks to get done what could be done in days or hours." Think of every opportunity as a closing window.',
    lookFor: 'Stories where you acted decisively with incomplete information. Bonus: identifying it was a two-way door.',
    mistake: 'Describing recklessness as speed. Bias for Action = calculated risk, not carelessness.',
    quote: '"Think of ourselves as being the world\'s biggest startup. That\'s the way we need to behave."' },
  { name: 'Frugality', desc: 'Accomplish more with less', tested: false,
    meaning: 'Door desks are a SIGNAL: scrappy, no garnishing. "I\'ll bend over for a penny." Constraints BREED invention — AWS built S3 and EC2 with 13-person teams each. "Don\'t get numb to large numbers." Don\'t believe the best way to build your career is having large teams. Amazon values people who build amazing things LEANLY.',
    lookFor: 'Stories where you accomplished something impressive with limited resources, or reduced cost without sacrificing quality.',
    mistake: 'Confusing frugality with cheapness. Frugality = more impact per dollar.',
    quote: '"Our very best people, our very best teams, our very best businesses do more with less."' },
  { name: 'Earn Trust', desc: 'Listen, speak candidly, be vocally self-critical', tested: false,
    meaning: 'NOT about being nice or social cohesion. It\'s about honesty: be authentic, straightforward, listen intently, challenge respectfully, deliver what you promised. If something isn\'t going well — own it, be self-critical, fix it. Use DATA to benchmark. Andy Jassy\'s story: wrong numbers on slide 10 of 220 in a Bezos presentation. Owned it, learned, improved.',
    lookFor: 'Stories where you owned a mistake publicly, gave hard feedback, or built trust through transparency.',
    mistake: 'Thinking it means never disagreeing. It means the opposite — honest, candid, respectful.',
    quote: '"I earned trust by owning it, being vocally self-critical, and actually getting better."' },
  { name: 'Dive Deep', desc: 'Stay connected to details, audit frequently, be skeptical', tested: true,
    meaning: 'Amazon expects BOTH strategic AND detail-oriented. "So many people can fill whiteboards with ideas but can\'t get the details right." Narratives exist because "it is hard to fake details in a narrative." Follow anecdotes: at Amazon\'s scale, 0.5% = millions of people. Big metrics can look fine while individuals suffer. There IS tension with Think Big — Amazon wants you great at BOTH.',
    lookFor: 'Stories where you went into details, found something others missed, followed an anecdote to discover a real problem hidden in aggregate metrics.',
    mistake: 'Staying at the strategic level. "I delegated the details" is a Dive Deep failure.',
    quote: '"The details of any idea are what matters most. That\'s what customers actually see."' },
  { name: 'Have Backbone; Disagree and Commit', desc: 'Challenge decisions respectfully, then commit fully', tested: false,
    meaning: 'You\'re EXPECTED to speak up, regardless of level. "I told you so" is completely useless — it\'s a failure either way (didn\'t speak up, or not committing). Social cohesion = compromising to get along. "10 ft vs 14 ft, compromise at 12 ft — but it\'s usually not 12 ft." Be truth-seeking, not peace-keeping. After the debate, FULLY commit even if you disagreed.',
    lookFor: 'Stories where you challenged a decision with data, AND stories where you committed fully to a decision you disagreed with.',
    mistake: 'Only telling the "disagree" part. Always include the "commit" part. Both matter.',
    quote: '"I told you so is completely useless at Amazon because it\'s a failure one way or the other."' },
  { name: 'Deliver Results', desc: 'Focus on key inputs, deliver with quality and timeliness', tested: false,
    meaning: 'You can get everything else right — if you fail to deliver, none of it matters. Outputs (revenue, margin) vs Inputs (the initiatives that drive them). You can\'t manage outputs by staring at them — manage the INPUTS. "Launch is NOT the finish line. It\'s the starting line." Very few things become hits on day one. Launch, get feedback, iterate 7-8-9 times.',
    lookFor: 'Stories with quantified outcomes AND what happened after launch — feedback, iteration, improvement.',
    mistake: 'Ending the story at launch. Always describe what happened AFTER.',
    quote: '"Launch or delivery is not the finish line. It\'s the starting line."' },
  { name: 'Strive to be Earth\'s Best Employer', desc: 'Create safer, more productive work environment', tested: false,
    meaning: 'What makes a great workplace: (1) mission that makes customers\' lives better, (2) at very large scale, (3) willingness to invent and invest long-term, (4) smart, passionate teammates. You can\'t be all things to all employees. Areas to improve: safety, manager quality, diversity.',
    lookFor: 'Stories about making the workplace better — safety improvements, mentoring, process improvements for people.',
    mistake: 'Interpreting too broadly. Focus on team safety, development, and inclusion.',
    quote: '"Being willing to look at what customers care about and invent on their behalf is pretty inspiring."' },
  { name: 'Success and Scale Bring Broad Responsibility', desc: 'Create more than you consume', tested: false,
    meaning: 'Are the communities where we operate better off because we\'re there? If not, take action. Not just jobs — affordable housing ($1.8B), food security (10M+ meals), education (3.9M people), disaster relief (23M items). "Leaders create more than they consume."',
    lookFor: 'Stories about considering broader impact — community, environment, future generations.',
    mistake: 'Ignoring this LP entirely. Know it even if it\'s rarely asked directly.',
    quote: '"We have to keep asking whether the communities in which we reside are better off because we\'re there."' },
];

function renderLPGrid(color, clickable) {
  return LP_DATA.map(function(lp, i) {
    var borderColor = lp.tested ? color : 'var(--color-border)';
    var bgColor = lp.tested ? color + '15' : 'var(--color-bg)';
    var textColor = lp.tested ? color : 'var(--color-heading)';
    var star = lp.tested ? '&#9733; ' : '';
    var cursor = clickable ? 'cursor:pointer;' : '';
    var onclick = clickable ? ' onclick="toggleLP(' + i + ')"' : '';
    var detailId = 'lp-detail-' + i;
    var detail = clickable ? '<div id="' + detailId + '" style="display:none;margin-top:8px;padding-top:8px;border-top:1px solid var(--color-border);font-size:0.75rem;line-height:1.6">' +
      '<div style="color:var(--color-text);margin-bottom:6px"><strong style="color:' + textColor + '">What it really means:</strong> ' + lp.meaning + '</div>' +
      '<div style="color:var(--color-text);margin-bottom:6px"><strong style="color:var(--color-success)">Interviewers look for:</strong> ' + lp.lookFor + '</div>' +
      '<div style="color:var(--color-text);margin-bottom:6px"><strong style="color:var(--color-error)">Common mistake:</strong> ' + lp.mistake + '</div>' +
      '<div style="color:' + color + ';font-style:italic">' + lp.quote + '</div>' +
      '</div>' : '';
    return '<div style="padding:10px 12px;border-radius:var(--radius-sm);border:1px solid ' + borderColor + ';background:' + bgColor + ';' + cursor + '"' + onclick + '>' +
      '<div style="font-size:0.8rem;font-weight:700;color:' + textColor + '">' + star + lp.name + (clickable ? ' <span style="font-size:0.65rem;color:var(--color-text-muted)">&#9660;</span>' : '') + '</div>' +
      '<div style="font-size:0.7rem;color:var(--color-text-muted);margin-top:2px">' + lp.desc + '</div>' +
      detail +
    '</div>';
  }).join('');
}

function toggleLP(idx) {
  var el = document.getElementById('lp-detail-' + idx);
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function renderPhoneScreenTab(el, co) {
  const ps = co.phoneScreen;
  if (!ps) { el.innerHTML = '<p>No phone screen scheduled.</p>'; return; }

  const interviewDate = new Date(ps.date);
  const now = new Date();
  const daysUntil = Math.ceil((interviewDate - now) / (1000 * 60 * 60 * 24));
  const dateStr = interviewDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const timeStr = interviewDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
  const urgencyColor = daysUntil <= 2 ? 'var(--color-error)' : daysUntil <= 5 ? 'var(--color-warning)' : 'var(--color-success)';
  const urgencyText = daysUntil <= 0 ? 'TODAY!' : daysUntil === 1 ? 'TOMORROW!' : `${daysUntil} days away`;

  el.innerHTML = `
    <!-- Countdown banner -->
    <div style="background:linear-gradient(135deg,${co.color}22,${co.color}11);border:2px solid ${co.color};border-radius:var(--radius-md);padding:20px;margin-bottom:20px;text-align:center">
      <div style="font-size:2rem;font-weight:900;color:${urgencyColor}">${urgencyText}</div>
      <div style="color:var(--color-heading);font-size:1.1rem;margin:4px 0">${dateStr} at ${timeStr}</div>
      <div style="color:var(--color-text-muted);font-size:0.85rem">${ps.duration} via ${ps.platform}</div>
      <div style="margin-top:12px">
        <a href="${ps.zoomUrl}" target="_blank" class="btn btn--primary" style="font-size:0.85rem">Join Zoom Meeting</a>
      </div>
      <div style="margin-top:8px;font-size:0.72rem;color:var(--color-text-muted)">ID: ${ps.zoomId} &middot; Passcode: ${ps.zoomPass}</div>
    </div>

    <!-- Interviewer card -->
    <div style="background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:20px;margin-bottom:20px">
      <h3 style="color:var(--color-heading);margin-bottom:12px">Your Interviewer</h3>
      <div style="font-size:1.1rem;font-weight:700;color:var(--color-heading)">${ps.interviewer.name}</div>
      <div style="color:${co.color};font-size:0.85rem;margin-bottom:4px">${ps.interviewer.title}</div>
      <div style="color:var(--color-text-muted);font-size:0.82rem;margin-bottom:12px">${ps.interviewer.team}</div>
      <div style="font-size:0.85rem;color:var(--color-text);margin-bottom:16px;line-height:1.6">${ps.interviewer.background}</div>
      <h4 style="color:var(--color-heading);margin-bottom:8px;font-size:0.85rem">What ${ps.interviewer.name.split(' ')[0]} Will Care About:</h4>
      <ul style="font-size:0.82rem;color:var(--color-text);line-height:1.8;padding-left:20px">
        ${ps.interviewer.careAbout.map(c => `<li>${c}</li>`).join('')}
      </ul>
    </div>

    <!-- Tell me about yourself -->
    <div style="background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:20px;margin-bottom:20px">
      <h3 style="color:var(--color-heading);margin-bottom:12px">"Tell Me About Yourself" (90 sec max)</h3>
      <div style="font-size:0.85rem;color:var(--color-text);line-height:1.7;white-space:pre-line;background:var(--color-bg);padding:16px;border-radius:var(--radius-sm);border-left:3px solid ${co.color}">${ps.tellMeAboutYourself}</div>
    </div>

    <!-- STAR Method Deep Dive -->
    <div style="background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:20px;margin-bottom:20px">
      <h3 style="color:var(--color-heading);margin-bottom:6px">The STAR Method</h3>
      <p style="font-size:0.82rem;color:var(--color-text-muted);margin-bottom:14px">When Amazon asks "Tell me about a time when..." they want a complete story. STAR is a tool to organize your thoughts — not a rigid script. The interviewer will guide you and ask follow-ups.</p>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px;margin-bottom:16px">
        <div style="background:var(--color-bg);padding:16px;border-radius:var(--radius-sm);border-left:4px solid ${co.color}">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
            <div style="font-size:1.5rem;font-weight:900;color:${co.color};min-width:30px">S</div>
            <div style="font-size:0.95rem;font-weight:700;color:var(--color-heading)">Situation</div>
          </div>
          <div style="font-size:0.8rem;color:var(--color-text);line-height:1.6">Set the scene. Where were you working? What was going on? What made it challenging or interesting? <strong>Give just enough background</strong> so the interviewer understands the big picture — don't spend 2 minutes on context.</div>
          <div style="margin-top:8px;font-size:0.75rem;color:var(--color-text-muted);font-style:italic">~15-20% of your answer (2-3 sentences)</div>
        </div>
        <div style="background:var(--color-bg);padding:16px;border-radius:var(--radius-sm);border-left:4px solid ${co.color}">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
            <div style="font-size:1.5rem;font-weight:900;color:${co.color};min-width:30px">T</div>
            <div style="font-size:0.95rem;font-weight:700;color:var(--color-heading)">Task</div>
          </div>
          <div style="font-size:0.8rem;color:var(--color-text);line-height:1.6">What was YOUR goal? What were you responsible for? This helps the interviewer understand your specific role and what you were trying to achieve.</div>
          <div style="margin-top:8px;font-size:0.75rem;color:var(--color-text-muted);font-style:italic">~5-10% of your answer (1 sentence)</div>
        </div>
        <div style="background:var(--color-bg);padding:16px;border-radius:var(--radius-sm);border-left:4px solid var(--color-success)">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
            <div style="font-size:1.5rem;font-weight:900;color:var(--color-success);min-width:30px">A</div>
            <div style="font-size:0.95rem;font-weight:700;color:var(--color-heading)">Action <span style="font-size:0.7rem;color:var(--color-success)">(MOST IMPORTANT)</span></div>
          </div>
          <div style="font-size:0.8rem;color:var(--color-text);line-height:1.6">Walk through what YOU did step by step. What was your approach? What decisions did you make? Use <strong>"I"</strong> not "we" — even if it was a team effort, the interviewer needs to assess YOUR contribution. This is where the interviewer learns how you think and problem-solve.</div>
          <div style="margin-top:8px;font-size:0.75rem;color:var(--color-success);font-style:italic;font-weight:600">~60-70% of your answer (the bulk)</div>
        </div>
        <div style="background:var(--color-bg);padding:16px;border-radius:var(--radius-sm);border-left:4px solid ${co.color}">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
            <div style="font-size:1.5rem;font-weight:900;color:${co.color};min-width:30px">R</div>
            <div style="font-size:0.95rem;font-weight:700;color:var(--color-heading)">Result</div>
          </div>
          <div style="font-size:0.8rem;color:var(--color-text);line-height:1.6">How did it turn out? Share what you accomplished — with <strong>numbers and specific outcomes</strong>. Then add what you <strong>learned</strong>. Not every story needs a success ending — failure stories are fine if you show what you learned and how you grew.</div>
          <div style="margin-top:8px;font-size:0.75rem;color:var(--color-text-muted);font-style:italic">~15-20% of your answer (quantified + lesson)</div>
        </div>
      </div>

      <div style="background:${co.color}11;border-radius:var(--radius-sm);padding:14px;margin-bottom:12px">
        <div style="font-size:0.82rem;font-weight:700;color:${co.color};margin-bottom:8px">Key Tips from Amazon:</div>
        <ul style="font-size:0.78rem;color:var(--color-text);line-height:1.7;padding-left:18px;margin:0">
          <li><strong>Frame answers in relation to Leadership Principles</strong> — your stories should naturally demonstrate LPs</li>
          <li><strong>Failure stories are welcome</strong> — "we know failure is part of innovation. What matters is what you learned"</li>
          <li><strong>The interviewer will help guide you</strong> — they'll ask follow-ups to get the details they need</li>
          <li><strong>Don't memorize scripts</strong> — know your stories well enough to tell them naturally</li>
          <li><strong>Use "I" not "we"</strong> — even on team projects, be clear about YOUR specific contribution</li>
        </ul>
      </div>

      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <div style="flex:1;min-width:200px;padding:10px 14px;background:var(--color-bg);border-radius:var(--radius-sm);border:1px solid var(--color-border)">
          <div style="font-size:0.75rem;font-weight:700;color:var(--color-success)">&#10003; Target: 2-3 minutes</div>
          <div style="font-size:0.72rem;color:var(--color-text-muted)">Your initial answer. Then the interviewer probes deeper with 2-3 follow-ups.</div>
        </div>
        <div style="flex:1;min-width:200px;padding:10px 14px;background:var(--color-bg);border-radius:var(--radius-sm);border:1px solid var(--color-border)">
          <div style="font-size:0.75rem;font-weight:700;color:var(--color-error)">&#10007; Under 1 minute</div>
          <div style="font-size:0.72rem;color:var(--color-text-muted)">Too shallow. You're not giving enough detail for the interviewer to assess you.</div>
        </div>
        <div style="flex:1;min-width:200px;padding:10px 14px;background:var(--color-bg);border-radius:var(--radius-sm);border:1px solid var(--color-border)">
          <div style="font-size:0.75rem;font-weight:700;color:var(--color-error)">&#10007; Over 4 minutes</div>
          <div style="font-size:0.72rem;color:var(--color-text-muted)">Rambling. The interviewer needs time for follow-ups. Let them guide you deeper.</div>
        </div>
      </div>
    </div>

    <!-- Leadership Principles Quick Reference -->
    <div style="background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:20px;margin-bottom:20px">
      <h3 style="color:var(--color-heading);margin-bottom:4px">Amazon's 16 Leadership Principles</h3>
      <p style="font-size:0.78rem;color:var(--color-text-muted);margin-bottom:14px">The 3 being tested in your phone screen are highlighted</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px">
        ${renderLPGrid(co.color, true)}
      </div>
      <div style="margin-top:12px;font-size:0.75rem;color:var(--color-text-muted)">&#9733; = Being tested in your phone screen (Dive Deep, Dealing with Ambiguity maps to Bias for Action + Are Right A Lot)</div>
    </div>

    <!-- 3 Focus Areas -->
    <h3 style="color:var(--color-heading);margin-bottom:16px">The 3 Focus Areas</h3>
    ${ps.focusAreas.map((area, aIdx) => `
      <div style="background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:20px;margin-bottom:16px">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          <div style="background:${co.color};color:#fff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:0.9rem">${aIdx + 1}</div>
          <div>
            <div style="font-weight:700;color:var(--color-heading);font-size:1rem">${area.name}</div>
            <div style="font-size:0.78rem;color:var(--color-text-muted);font-style:italic">${area.lp}</div>
          </div>
        </div>

        <h4 style="color:var(--color-heading);font-size:0.82rem;margin-bottom:8px">What They Evaluate:</h4>
        <ul style="font-size:0.82rem;color:var(--color-text);line-height:1.7;padding-left:20px;margin-bottom:16px">
          ${area.whatTheyEvaluate.map(w => `<li>${w}</li>`).join('')}
        </ul>

        ${area.stories.map(story => `
          <div style="border:1px solid var(--color-border);border-radius:var(--radius-sm);padding:16px;margin-bottom:12px;border-left:3px solid ${story.label === 'primary' ? 'var(--color-success)' : 'var(--color-text-muted)'}">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
              <strong style="color:var(--color-heading);font-size:0.9rem">${story.title}</strong>
              ${story.label === 'primary' ? '<span style="background:var(--color-success);color:#fff;padding:2px 8px;border-radius:4px;font-size:0.7rem;font-weight:700">USE THIS</span>' : '<span style="background:var(--color-text-muted);color:#fff;padding:2px 8px;border-radius:4px;font-size:0.7rem">BACKUP</span>'}
            </div>
            <div style="font-size:0.82rem;line-height:1.7">
              <div style="margin-bottom:8px"><span style="color:${co.color};font-weight:700">S:</span> <span style="color:var(--color-text)">${story.star.s}</span></div>
              <div style="margin-bottom:8px"><span style="color:${co.color};font-weight:700">T:</span> <span style="color:var(--color-text)">${story.star.t}</span></div>
              <div style="margin-bottom:8px"><span style="color:${co.color};font-weight:700">A:</span> <span style="color:var(--color-text)">${story.star.a}</span></div>
              <div style="margin-bottom:12px"><span style="color:${co.color};font-weight:700">R:</span> <span style="color:var(--color-text)">${story.star.r}</span></div>
            </div>
            ${story.conversational ? `
              <details style="margin-top:12px;border-top:1px solid var(--color-border);padding-top:12px">
                <summary style="cursor:pointer;font-size:0.82rem;color:var(--color-success);font-weight:600">How I\'d actually say it (conversational version)</summary>
                <div style="margin-top:10px;font-size:0.85rem;color:var(--color-text);line-height:1.7;white-space:pre-line;background:var(--color-bg);padding:14px;border-radius:var(--radius-sm);border-left:3px solid var(--color-success)">${story.conversational}</div>
              </details>
            ` : ''}

            ${story.followUps?.length ? `
              <details style="margin-top:8px">
                <summary style="cursor:pointer;font-size:0.82rem;color:${co.color};font-weight:600">Prepare for ${story.followUps.length} follow-up questions</summary>
                <div style="margin-top:8px">
                  ${story.followUps.map(fu => `
                    <div style="margin-bottom:8px;font-size:0.82rem">
                      <div style="color:var(--color-heading);font-weight:600">Q: ${fu.q}</div>
                      <div style="color:var(--color-text);padding-left:12px;margin-top:4px">A: ${fu.a}</div>
                    </div>
                  `).join('')}
                </div>
              </details>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `).join('')}

    <!-- Why Amazon -->
    <div style="background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:20px;margin-bottom:20px">
      <h3 style="color:var(--color-heading);margin-bottom:12px">"Why Amazon? Why This Role?"</h3>
      <div style="font-size:0.85rem;color:var(--color-text);line-height:1.7;white-space:pre-line;background:var(--color-bg);padding:16px;border-radius:var(--radius-sm);border-left:3px solid ${co.color}">${ps.whyAmazon}</div>
    </div>

    <!-- Questions to Ask -->
    <div style="background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:20px;margin-bottom:20px">
      <h3 style="color:var(--color-heading);margin-bottom:12px">Questions to Ask Stephen (pick 3-4)</h3>
      ${ps.questionsToAsk.map((q, i) => `
        <div style="display:flex;gap:12px;margin-bottom:12px;align-items:flex-start">
          <div style="min-width:24px;height:24px;background:${co.color}22;color:${co.color};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700">${i + 1}</div>
          <div style="font-size:0.85rem;color:var(--color-text);line-height:1.6">"${q}"</div>
        </div>
      `).join('')}
    </div>

    <!-- Key Numbers -->
    <div style="background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:20px;margin-bottom:20px">
      <h3 style="color:var(--color-heading);margin-bottom:12px">Know These Numbers Cold</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px">
        ${ps.keyNumbers.map(n => `
          <div style="background:var(--color-bg);padding:12px;border-radius:var(--radius-sm);border:1px solid var(--color-border)">
            <div style="font-size:1rem;font-weight:900;color:${co.color}">${n.value}</div>
            <div style="font-size:0.78rem;color:var(--color-heading);font-weight:600">${n.metric}</div>
            <div style="font-size:0.7rem;color:var(--color-text-muted)">${n.context}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Team Context -->
    <div style="background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:20px;margin-bottom:20px">
      <h3 style="color:var(--color-heading);margin-bottom:12px">About the WWGS GRAS Team</h3>
      <h4 style="color:var(--color-heading);font-size:0.85rem;margin-bottom:8px">What They Build:</h4>
      <ul style="font-size:0.82rem;color:var(--color-text);line-height:1.7;padding-left:20px;margin-bottom:16px">
        ${ps.teamContext.whatTheyBuild.map(w => `<li style="margin-bottom:6px">${w}</li>`).join('')}
      </ul>
      <h4 style="color:var(--color-heading);font-size:0.85rem;margin-bottom:8px">Grocery-Specific Constraints:</h4>
      <ul style="font-size:0.82rem;color:var(--color-text);line-height:1.7;padding-left:20px;margin-bottom:16px">
        ${ps.teamContext.groceryConstraints.map(c => `<li>${c}</li>`).join('')}
      </ul>
      <h4 style="color:var(--color-heading);font-size:0.85rem;margin-bottom:8px">Team Culture Keywords:</h4>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        ${ps.teamContext.cultureKeywords.map(k => `<span style="background:${co.color}22;color:${co.color};padding:4px 12px;border-radius:12px;font-size:0.78rem;font-weight:600">${k}</span>`).join('')}
      </div>
    </div>

    <!-- Day-Of Checklist -->
    <div style="background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:20px;margin-bottom:20px">
      <h3 style="color:var(--color-heading);margin-bottom:16px">Preparation Checklist</h3>

      <h4 style="color:var(--color-heading);font-size:0.85rem;margin-bottom:8px">Night Before (Monday March 30)</h4>
      ${ps.checklist.nightBefore.map(item => `
        <label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:0.82rem;color:var(--color-text);cursor:pointer">
          <input type="checkbox" style="accent-color:${co.color}"> ${item}
        </label>
      `).join('')}

      <h4 style="color:var(--color-heading);font-size:0.85rem;margin:16px 0 8px">Morning Of (Tuesday March 31)</h4>
      ${ps.checklist.dayOf.map(item => `
        <label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:0.82rem;color:var(--color-text);cursor:pointer">
          <input type="checkbox" style="accent-color:${co.color}"> ${item}
        </label>
      `).join('')}

      <h4 style="color:var(--color-heading);font-size:0.85rem;margin:16px 0 8px">During the Interview</h4>
      ${ps.checklist.duringInterview.map(item => `
        <label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:0.82rem;color:var(--color-text);cursor:pointer">
          <input type="checkbox" style="accent-color:${co.color}"> ${item}
        </label>
      `).join('')}
    </div>

    <!-- Critical Reminders -->
    <div style="background:var(--color-error)11;border:2px solid var(--color-error);border-radius:var(--radius-md);padding:20px">
      <h3 style="color:var(--color-error);margin-bottom:12px">Critical Reminders</h3>
      <ul style="font-size:0.85rem;color:var(--color-text);line-height:1.8;padding-left:20px">
        <li><strong>Stephen is the HIRING MANAGER</strong> — not just a screener. He decides if you join his team.</li>
        <li><strong>He builds data pipelines and dashboards</strong> — your monitoring platform story will resonate deeply.</li>
        <li><strong>"Skeptically review vendor assertions"</strong> — this is their #1 job. Your FUTEK validation story IS the job.</li>
        <li><strong>Do NOT use GenAI during the interview</strong> — they explicitly warned. Answers must be from memory.</li>
        <li><strong>Use "I" not "we"</strong> — Amazon wants YOUR individual contributions.</li>
        <li><strong>Expect 3-4 questions total</strong> — each with 2-3 follow-ups. Quality over quantity.</li>
      </ul>
    </div>
  `;
}

function renderLPsTab(el, co) {
  el.innerHTML = '<h3 style="color:var(--color-heading);margin-bottom:6px">Amazon\'s 16 Leadership Principles</h3>' +
    '<p style="font-size:0.82rem;color:var(--color-text-muted);margin-bottom:16px">Distilled from Andy Jassy\'s official LP videos. Click any principle to expand the full study notes: what it really means, what interviewers look for, common mistakes, and the key quote to remember.</p>' +
    '<div style="display:grid;grid-template-columns:1fr;gap:10px">' +
    LP_DATA.map(function(lp, i) {
      var color = co.color;
      var borderColor = lp.tested ? color : 'var(--color-border)';
      var bgColor = lp.tested ? color + '15' : 'var(--color-bg-card)';
      var textColor = lp.tested ? color : 'var(--color-heading)';
      var star = lp.tested ? '&#9733; ' : '';
      var badge = lp.tested ? ' <span style="background:' + color + ';color:#fff;padding:1px 6px;border-radius:3px;font-size:0.65rem;font-weight:700;margin-left:6px">TESTED IN YOUR PHONE SCREEN</span>' : '';
      return '<div style="padding:16px;border-radius:var(--radius-sm);border:1px solid ' + borderColor + ';background:' + bgColor + ';cursor:pointer" onclick="toggleLP(' + i + ')">' +
        '<div style="display:flex;align-items:center;gap:10px">' +
          '<div style="min-width:28px;height:28px;background:' + color + '22;color:' + color + ';border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:900">' + (i+1) + '</div>' +
          '<div style="flex:1">' +
            '<div style="font-size:0.9rem;font-weight:700;color:' + textColor + '">' + star + lp.name + badge + ' <span style="font-size:0.65rem;color:var(--color-text-muted)">&#9660;</span></div>' +
            '<div style="font-size:0.78rem;color:var(--color-text-muted);margin-top:2px">' + lp.desc + '</div>' +
          '</div>' +
        '</div>' +
        '<div id="lp-detail-' + i + '" style="display:none;margin-top:14px;padding-top:14px;border-top:1px solid var(--color-border);font-size:0.82rem;line-height:1.7">' +
          '<div style="color:var(--color-text);margin-bottom:10px"><strong style="color:' + textColor + '">What it really means:</strong><br>' + lp.meaning + '</div>' +
          '<div style="color:var(--color-text);margin-bottom:10px;padding:10px 14px;background:var(--color-bg);border-radius:var(--radius-sm);border-left:3px solid var(--color-success)"><strong style="color:var(--color-success)">What interviewers look for:</strong><br>' + lp.lookFor + '</div>' +
          '<div style="color:var(--color-text);margin-bottom:10px;padding:10px 14px;background:var(--color-bg);border-radius:var(--radius-sm);border-left:3px solid var(--color-error)"><strong style="color:var(--color-error)">Common mistake:</strong><br>' + lp.mistake + '</div>' +
          '<div style="color:' + color + ';font-style:italic;padding:10px 14px;background:var(--color-bg);border-radius:var(--radius-sm);border-left:3px solid ' + color + '">' + lp.quote + '</div>' +
        '</div>' +
      '</div>';
    }).join('') +
    '</div>' +
    '<div style="margin-top:20px;background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:16px">' +
      '<h4 style="color:var(--color-heading);margin-bottom:8px;font-size:0.85rem">Priority for Hardware Development Engineer</h4>' +
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;font-size:0.78rem">' +
        '<div style="padding:8px 12px;background:' + co.color + '22;border-radius:var(--radius-sm);color:' + co.color + ';font-weight:600">&#9733; TESTED: Dive Deep</div>' +
        '<div style="padding:8px 12px;background:' + co.color + '22;border-radius:var(--radius-sm);color:' + co.color + ';font-weight:600">&#9733; TESTED: Bias for Action</div>' +
        '<div style="padding:8px 12px;background:' + co.color + '22;border-radius:var(--radius-sm);color:' + co.color + ';font-weight:600">&#9733; TESTED: Are Right, A Lot</div>' +
        '<div style="padding:8px 12px;background:var(--color-bg);border-radius:var(--radius-sm);color:var(--color-text)">LIKELY: Ownership</div>' +
        '<div style="padding:8px 12px;background:var(--color-bg);border-radius:var(--radius-sm);color:var(--color-text)">LIKELY: Invent and Simplify</div>' +
        '<div style="padding:8px 12px;background:var(--color-bg);border-radius:var(--radius-sm);color:var(--color-text)">LIKELY: Deliver Results</div>' +
        '<div style="padding:8px 12px;background:var(--color-bg);border-radius:var(--radius-sm);color:var(--color-text)">POSSIBLE: Earn Trust</div>' +
        '<div style="padding:8px 12px;background:var(--color-bg);border-radius:var(--radius-sm);color:var(--color-text)">POSSIBLE: Have Backbone</div>' +
        '<div style="padding:8px 12px;background:var(--color-bg);border-radius:var(--radius-sm);color:var(--color-text)">POSSIBLE: Frugality</div>' +
      '</div>' +
    '</div>';
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
  const isOpen = body.classList.contains('open');

  // Close all other open questions (accordion behavior)
  document.querySelectorAll('.qa-card__body.open').forEach(b => b.classList.remove('open'));

  // Toggle this one
  if (!isOpen) {
    body.classList.add('open');
    // Scroll into view smoothly
    setTimeout(() => header.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }
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
