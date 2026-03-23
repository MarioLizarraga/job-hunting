/**
 * ATS Filter Engine — Client-side port of ats_filter.py
 * Simulates Workday/Greenhouse/Taleo resume screening.
 * Includes a pure JS TF-IDF implementation (no sklearn).
 */

const KNOWN_SECTIONS = {
  experience: ["experience", "work experience", "professional experience", "employment", "employment history", "work history", "career history"],
  education: ["education", "academic background", "academic history", "degrees", "qualifications"],
  skills: ["skills", "technical skills", "core competencies", "competencies", "areas of expertise", "proficiencies", "tools", "technologies"],
  summary: ["summary", "professional summary", "profile", "objective", "career summary", "executive summary", "about"],
  certifications: ["certifications", "certificates", "licenses", "certifications & languages", "professional development"],
  projects: ["projects", "key projects", "notable projects"],
};

const DEGREE_PATTERNS = {
  "phd": 4, "ph.d": 4, "doctorate": 4, "doctor of": 4,
  "msc": 3, "m.sc": 3, "ms ": 3, "m.s.": 3, "master": 3, "mba": 3, "m.eng": 3,
  "bsc": 2, "b.sc": 2, "bs ": 2, "b.s.": 2, "bachelor": 2, "b.eng": 2, "ba ": 2,
  "associate": 1, "a.s.": 1, "a.a.": 1,
};

const ENGINEERING_FIELDS = [
  "mechanical", "electrical", "mechatronics", "robotics", "aerospace",
  "computer science", "software", "industrial", "manufacturing",
  "systems engineering", "space systems", "automation",
];

const STOP_WORDS = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'was', 'are', 'were', 'be', 'been',
  'has', 'have', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
  'it', 'its', 'you', 'your', 'we', 'our', 'their', 'them', 'not', 'no',
  'all', 'any', 'each', 'other', 'such', 'also', 'very', 'just', 'than',
  'then', 'now', 'here', 'there', 'who', 'what', 'which', 'how', 'when',
  'where', 'about', 'into', 'through', 'during', 'before', 'after',
  'above', 'below', 'between', 'under', 'over', 'out', 'up', 'down',
  'more', 'most', 'some', 'new', 'used', 'using', 'use', 'work',
  'able', 'well', 'back', 'even', 'still', 'way', 'take',
  'come', 'make', 'like', 'long', 'great', 'good', 'right', 'look',
  'think', 'know', 'need', 'want', 'going']);

const COMMON_NOISE = new Set(['experience', 'work', 'team', 'ability', 'strong', 'knowledge',
  'understanding', 'working', 'including', 'related', 'required',
  'preferred', 'years', 'minimum', 'within', 'across', 'role',
  'position', 'candidate', 'ideal', 'must', 'should', 'will',
  'based', 'level', 'high', 'specific', 'relevant', 'skills',
  'technical', 'professional', 'development', 'management',
  'actionable', 'ambiguous', 'clear', 'basic', 'consumer',
  'demonstrated', 'drivers', 'environments', 'evolving',
  'escalations', 'architecture', 'assembly', 'connectors',
  'effectively', 'efficiently', 'ensure', 'ensuring',
  'identify', 'identifying', 'improve', 'improving',
  'implement', 'implementing', 'maintain', 'maintaining',
  'manage', 'managing', 'monitor', 'monitoring',
  'perform', 'performing', 'provide', 'providing',
  'support', 'supporting', 'track', 'tracking',
  'analyze', 'analyzing', 'collaborate', 'collaborating',
  'communicate', 'communicating', 'coordinate', 'coordinating',
  'deliver', 'delivering', 'drive', 'driving',
  'evaluate', 'evaluating', 'execute', 'executing',
  'lead', 'leading', 'operate', 'operating',
  'participate', 'participating', 'plan', 'planning',
  'report', 'reporting', 'review', 'reviewing',
  'contribute', 'contributing', 'define', 'defining',
  'build', 'building', 'create', 'creating',
  'follow', 'following', 'focus', 'focusing',
  'include', 'involve', 'involving',
  'need', 'require', 'responsible', 'cross-functionally',
  'key', 'multiple', 'various', 'overall', 'critical',
  'proactive', 'proven', 'robust', 'significant',
  'successful', 'comprehensive', 'extensive', 'hands-on']);

function extractKeywords(text) {
  const textLower = text.toLowerCase();
  const words = textLower.match(/\b[a-z][a-z0-9.#+/\-]+\b/g) || [];
  const techRegex = /\b(?:solidworks|catia\s*v5|autodesk\s*inventor|siemens\s*nx|python|matlab|sql|git|c\+\+|c#|stm32|arduino|raspberry\s*pi|tensorflow|pytorch|opencv|scipy|numpy|pandas|gd&t|dfm|dfa|fea|cad|cam|cnc|plc|six\s*sigma|lean|kaizen|i2c|spi|uart|serial|tcp\/ip|can\s*bus|modbus|3d\s*printing|fdm|sla|injection\s*molding|sheet\s*metal|ufactory|xarm|futek|fanuc|kuka|abb|universal\s*robots|machine\s*learning|computer\s*vision|deep\s*learning|ros|ros2|linux|docker|aws|tolerance\s*analysis|tolerance\s*stackup|root\s*cause|failure\s*analysis|mtbf|mttr|asme|iso|ansi|mil-std)\b/g;
  const techTerms = textLower.match(techRegex) || [];
  const allTerms = new Set([...words, ...techTerms]);
  const result = new Set();
  allTerms.forEach(t => { if (!STOP_WORDS.has(t) && t.length > 1) result.add(t); });
  return result;
}

// Simple TF-IDF + cosine similarity (replaces sklearn)
function tfidfCosineSimilarity(text1, text2) {
  const tokenize = (t) => t.toLowerCase().match(/\b[a-z]{2,}\b/g) || [];
  const tokens1 = tokenize(text1).filter(w => !STOP_WORDS.has(w));
  const tokens2 = tokenize(text2).filter(w => !STOP_WORDS.has(w));

  // Build vocabulary
  const vocab = new Set([...tokens1, ...tokens2]);

  // Term frequency
  const tf = (tokens) => {
    const counts = {};
    tokens.forEach(t => counts[t] = (counts[t] || 0) + 1);
    const total = tokens.length || 1;
    const result = {};
    for (const [k, v] of Object.entries(counts)) result[k] = v / total;
    return result;
  };

  const tf1 = tf(tokens1);
  const tf2 = tf(tokens2);

  // IDF (2 documents)
  const idf = {};
  vocab.forEach(word => {
    const df = (tf1[word] ? 1 : 0) + (tf2[word] ? 1 : 0);
    idf[word] = Math.log(2 / df) + 1; // smoothed IDF
  });

  // TF-IDF vectors
  const vec1 = [], vec2 = [];
  vocab.forEach(word => {
    vec1.push((tf1[word] || 0) * idf[word]);
    vec2.push((tf2[word] || 0) * idf[word]);
  });

  // Cosine similarity
  let dot = 0, mag1 = 0, mag2 = 0;
  for (let i = 0; i < vec1.length; i++) {
    dot += vec1[i] * vec2[i];
    mag1 += vec1[i] * vec1[i];
    mag2 += vec2[i] * vec2[i];
  }
  mag1 = Math.sqrt(mag1);
  mag2 = Math.sqrt(mag2);
  return (mag1 > 0 && mag2 > 0) ? dot / (mag1 * mag2) : 0;
}

function extractJdRequirements(jdText) {
  const jdLower = jdText.toLowerCase();
  let reqSection = "", prefSection = "";

  const reqPatterns = [
    /(?:minimum|required|basic)\s+qualifications?\s*[:\n]([\s\S]*?)(?=preferred|bonus|nice|additional|$)/,
    /requirements?\s*[:\n]([\s\S]*?)(?=preferred|bonus|nice|additional|$)/,
    /what\s+you'?ll?\s+need\s*[:\n]([\s\S]*?)(?=preferred|bonus|nice|additional|$)/,
    /you\s+have\s*[:\n]([\s\S]*?)(?=preferred|bonus|nice|additional|$)/,
  ];
  const prefPatterns = [
    /(?:preferred|bonus|nice\s+to\s+have|additional)\s+qualifications?\s*[:\n]([\s\S]*?)$/,
    /preferred\s*[:\n]([\s\S]*?)$/,
  ];

  for (const p of reqPatterns) { const m = jdLower.match(p); if (m) { reqSection = m[1]; break; } }
  for (const p of prefPatterns) { const m = jdLower.match(p); if (m) { prefSection = m[1]; break; } }
  if (!reqSection) reqSection = jdLower;

  const reqKeywords = extractKeywords(reqSection);
  const prefKeywords = prefSection ? extractKeywords(prefSection) : new Set();

  const yearsMatch = jdLower.match(/(\d+)\+?\s*years?\s+(?:of\s+)?(?:experience|exp)/);
  const requiredYears = yearsMatch ? parseInt(yearsMatch[1]) : null;

  let requiredDegree = null;
  const sortedDegrees = Object.entries(DEGREE_PATTERNS).sort((a, b) => b[1] - a[1]);
  for (const [deg] of sortedDegrees) { if (jdLower.includes(deg)) { requiredDegree = deg; break; } }

  return { required_keywords: reqKeywords, preferred_keywords: prefKeywords, required_years: requiredYears, required_degree: requiredDegree, raw_required: reqSection };
}

function checkSectionDetection(resumeText) {
  const textLower = resumeText.toLowerCase();
  const found = [], missing = [];
  const essential = ["experience", "education", "skills"];
  const optional = ["summary", "certifications", "projects"];

  for (const section of essential) {
    let sectionFound = false;
    for (const variant of (KNOWN_SECTIONS[section] || [section])) {
      if (textLower.includes(variant)) { sectionFound = true; found.push(section.charAt(0).toUpperCase() + section.slice(1)); break; }
    }
    if (!sectionFound) missing.push(section.charAt(0).toUpperCase() + section.slice(1));
  }
  for (const section of optional) {
    for (const variant of (KNOWN_SECTIONS[section] || [section])) {
      if (textLower.includes(variant)) { found.push(section.charAt(0).toUpperCase() + section.slice(1)); break; }
    }
  }

  const essentialFound = essential.filter(s => found.includes(s.charAt(0).toUpperCase() + s.slice(1))).length;
  let score = (essentialFound / essential.length) * 80 + (found.length - essentialFound) * 5;
  const detail = missing.length > 0
    ? `Found: ${found.join(", ")}. MISSING: ${missing.join(", ")} \u2014 ATS may fail to parse`
    : `All sections detected: ${found.join(", ")} \u2014 clean parse expected`;

  return { score: Math.min(score, 100), detail, missing };
}

function checkKeywordMatch(resumeText, jdData) {
  const resumeKeywords = extractKeywords(resumeText);
  const reqKeywords = jdData.required_keywords;
  const prefKeywords = jdData.preferred_keywords;

  const reqMatches = new Set([...resumeKeywords].filter(x => reqKeywords.has(x)));
  let reqMissing = new Set([...reqKeywords].filter(x => !resumeKeywords.has(x)));
  const prefMatches = new Set([...resumeKeywords].filter(x => prefKeywords.has(x)));
  let prefMissing = new Set([...prefKeywords].filter(x => !resumeKeywords.has(x)));

  reqMissing = new Set([...reqMissing].filter(k => !COMMON_NOISE.has(k) && k.length > 2));
  prefMissing = new Set([...prefMissing].filter(k => !COMMON_NOISE.has(k) && k.length > 2));

  const semanticScore = tfidfCosineSimilarity(resumeText, jdData.raw_required) * 100;
  const reqMatchPct = reqKeywords.size > 0 ? (reqMatches.size / reqKeywords.size) * 100 : 0;
  const prefMatchPct = prefKeywords.size > 0 ? (prefMatches.size / prefKeywords.size) * 100 : 0;

  const score = reqMatchPct * 0.60 + prefMatchPct * 0.20 + semanticScore * 0.20;

  const detail = `Required keywords: ${reqMatches.size}/${reqKeywords.size} matched (${reqMatchPct.toFixed(0)}%). Preferred: ${prefMatches.size}/${prefKeywords.size} (${prefMatchPct.toFixed(0)}%). Semantic similarity: ${semanticScore.toFixed(0)}%`;

  const matchData = {
    required_matched: [...reqMatches].sort().slice(0, 15),
    required_missing: [...reqMissing].sort().slice(0, 15),
    preferred_matched: [...prefMatches].sort().slice(0, 10),
    preferred_missing: [...prefMissing].sort().slice(0, 10),
    semantic_score: Math.round(semanticScore * 10) / 10,
  };

  return { score: Math.min(score, 100), detail, matchData };
}

function checkExperienceYears(resumeText, jdData) {
  const required = jdData.required_years;
  if (!required) return { score: 80, detail: "No specific years requirement found in JD" };

  const datePatterns = resumeText.toLowerCase().match(/(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{4})/g) || [];
  const yearPatterns = resumeText.match(/\b(20\d{2})\b/g) || [];
  const allYears = [...new Set([...datePatterns.map(d => parseInt(d.match(/\d{4}/)[0])), ...yearPatterns.map(Number)])];

  const careerSpan = allYears.length >= 2 ? Math.max(...allYears) - Math.min(...allYears) : 0;
  const summaryYears = resumeText.toLowerCase().match(/(\d+)\+?\s*years?/);
  const statedYears = summaryYears ? parseInt(summaryYears[1]) : careerSpan;
  const actualYears = Math.max(statedYears, careerSpan);

  let score, detail;
  if (actualYears >= required) { score = 100; detail = `Experience: ${actualYears} years (required: ${required}+) \u2014 MEETS requirement`; }
  else if (actualYears >= required - 1) { score = 70; detail = `Experience: ${actualYears} years (required: ${required}+) \u2014 CLOSE, may pass`; }
  else if (actualYears >= required - 2) { score = 40; detail = `Experience: ${actualYears} years (required: ${required}+) \u2014 BELOW requirement`; }
  else { score = 15; detail = `Experience: ${actualYears} years (required: ${required}+) \u2014 SIGNIFICANTLY below`; }

  return { score, detail };
}

function checkEducation(resumeText, jdData) {
  const requiredDegree = jdData.required_degree;
  if (!requiredDegree) return { score: 80, detail: "No specific degree requirement found in JD" };

  const textLower = resumeText.toLowerCase();
  const requiredLevel = DEGREE_PATTERNS[requiredDegree] || 2;

  let resumeLevel = 0, resumeDegree = "None found";
  for (const [deg, level] of Object.entries(DEGREE_PATTERNS)) {
    if (textLower.includes(deg) && level > resumeLevel) { resumeLevel = level; resumeDegree = deg.toUpperCase(); }
  }

  const fieldMatch = ENGINEERING_FIELDS.some(f => textLower.includes(f));

  let score, detail;
  if (resumeLevel >= requiredLevel) {
    score = fieldMatch ? 100 : 85;
    detail = `Degree: ${resumeDegree} (required: ${requiredDegree.toUpperCase()}) \u2014 MEETS requirement`;
    if (!fieldMatch) detail += " (field may not match)";
  } else if (resumeLevel === requiredLevel - 1) {
    score = 60;
    detail = `Degree: ${resumeDegree} (required: ${requiredDegree.toUpperCase()}) \u2014 LOWER than required`;
  } else {
    score = 20;
    detail = `Degree: ${resumeDegree} (required: ${requiredDegree.toUpperCase()}) \u2014 DOES NOT MEET`;
  }

  return { score, detail };
}

function checkFormatting(resumeText) {
  const issues = [];
  const wordCount = resumeText.split(/\s+/).length;
  if (wordCount < 200) issues.push(`Very short (${wordCount} words) \u2014 may trigger minimum content filter`);
  else if (wordCount > 1000) issues.push(`Very long (${wordCount} words) \u2014 may exceed scanner limits`);

  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(resumeText);
  const hasPhone = /[\(\d][\d\s\(\)\-\+\.]{7,}/.test(resumeText);
  if (!hasEmail) issues.push("No email address detected");
  if (!hasPhone) issues.push("No phone number detected");

  const hasDates = /\b20\d{2}\b/.test(resumeText);
  if (!hasDates) issues.push("No dates detected \u2014 ATS cannot parse timeline");

  const score = Math.max(10, 100 - issues.length * 15);
  const detail = issues.length === 0 ? "Clean formatting \u2014 no parsing issues expected" : "Issues: " + issues.join("; ");

  return { score: Math.min(score, 100), detail };
}

function runAtsFilter(resumeText, jdText) {
  const jdData = extractJdRequirements(jdText);
  const checks = {};

  const kw = checkKeywordMatch(resumeText, jdData);
  checks.keywords = { name: "Keyword Match", score: Math.round(kw.score * 10) / 10, detail: kw.detail, weight: 0.40, match_data: kw.matchData };

  const sec = checkSectionDetection(resumeText);
  checks.sections = { name: "Section Detection (Parsability)", score: Math.round(sec.score * 10) / 10, detail: sec.detail, weight: 0.15 };

  const exp = checkExperienceYears(resumeText, jdData);
  checks.experience = { name: "Years of Experience", score: Math.round(exp.score * 10) / 10, detail: exp.detail, weight: 0.20 };

  const edu = checkEducation(resumeText, jdData);
  checks.education = { name: "Education Match", score: Math.round(edu.score * 10) / 10, detail: edu.detail, weight: 0.15 };

  const fmt = checkFormatting(resumeText);
  checks.formatting = { name: "Format & Parse Quality", score: Math.round(fmt.score * 10) / 10, detail: fmt.detail, weight: 0.10 };

  const overall = Object.values(checks).reduce((sum, c) => sum + c.score * c.weight, 0);

  let verdict, verdictClass;
  if (overall >= 80) { verdict = "STRONG MATCH \u2014 Resume will very likely reach the human recruiter."; verdictClass = "pass"; }
  else if (overall >= 60) { verdict = "DECENT MATCH \u2014 May pass ATS depending on applicant pool size."; verdictClass = "warning"; }
  else if (overall >= 40) { verdict = "WEAK MATCH \u2014 Likely filtered out. Add missing keywords from JD."; verdictClass = "fail"; }
  else { verdict = "POOR MATCH \u2014 Will be rejected by ATS. Major gaps in keyword coverage."; verdictClass = "fail"; }

  return { overall_score: Math.round(overall * 10) / 10, verdict, verdict_class: verdictClass, checks };
}
