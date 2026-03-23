/**
 * Human Recruiter Screener — Client-side port of human_screener.py
 * Simulates a 15-second recruiter scan.
 */

const STRONG_VERBS = new Set([
  "built", "designed", "developed", "created", "architected", "engineered",
  "led", "managed", "directed", "supervised", "mentored", "coordinated",
  "reduced", "cut", "decreased", "eliminated", "saved", "freed",
  "increased", "improved", "boosted", "accelerated", "grew",
  "launched", "deployed", "shipped", "delivered", "released",
  "automated", "streamlined", "optimized", "simplified",
  "troubleshot", "debugged", "diagnosed", "resolved", "fixed",
  "wrote", "programmed", "coded", "implemented", "integrated",
  "analyzed", "measured", "instrumented", "tested", "validated",
  "modeled", "prototyped", "fabricated", "machined", "assembled",
  "invented", "patented", "published", "presented",
]);

const WEAK_VERBS = new Set([
  "assisted", "helped", "supported", "participated", "contributed",
  "involved", "utilized", "leveraged", "facilitated", "handled",
  "responsible for", "tasked with", "worked on", "dealt with",
]);

const KNOWN_COMPANIES = new Set([
  "google", "meta", "amazon", "apple", "microsoft", "tesla", "spacex",
  "boeing", "lockheed", "raytheon", "northrop grumman", "general dynamics",
  "honeywell", "safran", "thales", "bae systems", "rolls-royce",
  "nasa", "jpl", "esa", "darpa",
  "nvidia", "intel", "qualcomm", "broadcom", "amd",
  "ge", "siemens", "abb", "rockwell", "fanuc", "kuka",
  "deloitte", "mckinsey", "bcg",
]);

const KNOWN_UNIVERSITIES = new Set([
  "mit", "stanford", "caltech", "carnegie mellon", "georgia tech",
  "berkeley", "michigan", "purdue", "university of southampton",
  "southampton", "oxford", "cambridge", "imperial",
  "cetys", "itesm", "tec de monterrey", "unam",
]);

function checkVisualDensity(resumeText) {
  const wordCount = resumeText.split(/\s+/).length;

  // Count bullets
  let bulletCount = (resumeText.match(/(?:[\u2022\u2023\u25CF\u25CB\u25E6\u2043\u2219\-\*]|\(cid:\d+\)|\d+\.)\s/g) || []).length;
  if (bulletCount === 0) {
    const allVerbs = new Set([...STRONG_VERBS, ...WEAK_VERBS]);
    bulletCount = resumeText.split('\n').filter(line => {
      const first = line.trim().split(/\s+/)[0]?.toLowerCase().replace(/ed$|s$|,$/, '');
      return first && allVerbs.has(first) || STRONG_VERBS.has(line.trim().split(/\s+/)[0]?.toLowerCase());
    }).length;
  }

  let score, detail;
  if (wordCount >= 350 && wordCount <= 500) { score = 90; detail = `${wordCount} words \u2014 ideal density for a 1-page resume`; }
  else if (wordCount >= 300 && wordCount < 350) { score = 75; detail = `${wordCount} words \u2014 slightly light, consider adding relevant detail`; }
  else if (wordCount > 500 && wordCount <= 600) { score = 70; detail = `${wordCount} words \u2014 slightly dense, may feel cramped`; }
  else if (wordCount < 300) { score = 45; detail = `${wordCount} words \u2014 too sparse, looks like a junior resume`; }
  else { score = 40; detail = `${wordCount} words \u2014 too dense, recruiter will skim and miss key info`; }

  if (bulletCount >= 8 && bulletCount <= 15) { score += 5; detail += `. ${bulletCount} bullet points (ideal range)`; }
  else if (bulletCount < 6) { score -= 5; detail += `. Only ${bulletCount} bullets \u2014 too few accomplishments shown`; }

  return { score: Math.min(score, 100), detail };
}

function checkBulletQuality(resumeText) {
  const bulletRegex = /(?:[\u2022\u2023\u25CF\u25CB\u25E6\u2043\u2219\-\*]|\(cid:\d+\))\s*(.+?)(?:\n|$)/g;
  const bullets = [];
  let m;
  while ((m = bulletRegex.exec(resumeText)) !== null) bullets.push(m[1]);

  // Fallback: detect verb-starting lines
  if (bullets.length < 3) {
    for (const line of resumeText.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && trimmed.split(/\s+/).length >= 6) {
        const first = trimmed.split(/\s+/)[0].toLowerCase();
        if ([...STRONG_VERBS, ...WEAK_VERBS].some(v => first.startsWith(v))) {
          if (!bullets.includes(trimmed)) bullets.push(trimmed);
        }
      }
    }
  }

  if (bullets.length === 0) return { score: 30, detail: "No bullet points found", data: {} };

  let strongVerbCount = 0, weakVerbCount = 0, quantifiedCount = 0, tooShort = 0, tooLong = 0;
  const greatBullets = [], weakBullets = [];

  for (const b of bullets) {
    const bLower = b.trim().toLowerCase();
    const words = b.trim().split(/\s+/);
    const firstWord = (words[0] || "").toLowerCase();

    const isStrong = [...STRONG_VERBS].some(v => firstWord.startsWith(v) || firstWord === v);
    const isWeak = [...WEAK_VERBS].some(v => bLower.substring(0, 30).includes(v));

    if (isStrong) strongVerbCount++;
    if (isWeak) weakVerbCount++;

    const hasNumbers = /\d+[%+]?/.test(b);
    if (hasNumbers) quantifiedCount++;

    if (words.length < 8) tooShort++;
    else if (words.length > 35) tooLong++;

    if (isStrong && hasNumbers && words.length >= 10 && words.length <= 30) greatBullets.push(b.trim().substring(0, 80));
    else if (isWeak || (!hasNumbers && words.length < 12)) weakBullets.push(b.trim().substring(0, 80));
  }

  const total = bullets.length;
  const verbScore = total > 0 ? (strongVerbCount / total) * 40 : 0;
  const quantScore = total > 0 ? (quantifiedCount / total) * 30 : 0;
  const weakPenalty = total > 0 ? (weakVerbCount / total) * 15 : 0;
  const lengthPenalty = total > 0 ? ((tooShort + tooLong) / total) * 15 : 0;

  let score = verbScore + quantScore + 30 - weakPenalty - lengthPenalty;
  score = Math.min(Math.max(score, 10), 95);

  const detail = `${strongVerbCount}/${total} bullets start with strong verbs. ${quantifiedCount}/${total} include quantified results. ${weakVerbCount} weak verb uses.`;

  return {
    score: Math.round(score * 10) / 10,
    detail,
    data: {
      great_examples: greatBullets.slice(0, 3),
      weak_examples: weakBullets.slice(0, 3),
      strong_verb_pct: Math.round((strongVerbCount / Math.max(total, 1)) * 100),
      quantified_pct: Math.round((quantifiedCount / Math.max(total, 1)) * 100),
    }
  };
}

function checkImpactSignals(resumeText) {
  const percentages = resumeText.match(/\d+%/g) || [];
  const dollarAmounts = resumeText.match(/\$[\d,]+/g) || [];
  const timeSavings = resumeText.match(/\d+\+?\s*(?:hrs?|hours?|min|minutes?|days?)\/(?:week|month|year)/gi) || [];
  const scaleNumbers = resumeText.toLowerCase().match(/\d+\+?\s*(?:panels?|units?|parts?|systems?|interns?|students?|participants?|documents?)/g) || [];

  const totalMetrics = percentages.length + dollarAmounts.length + timeSavings.length + scaleNumbers.length;

  let score, detail;
  if (totalMetrics >= 8) { score = 95; detail = `Excellent \u2014 ${totalMetrics} concrete metrics found (percentages: ${percentages.length}, time: ${timeSavings.length}, scale: ${scaleNumbers.length})`; }
  else if (totalMetrics >= 5) { score = 80; detail = `Good \u2014 ${totalMetrics} metrics found. Consider adding more to weaker bullets.`; }
  else if (totalMetrics >= 3) { score = 60; detail = `Fair \u2014 only ${totalMetrics} metrics. Recruiters want numbers in most bullets.`; }
  else { score = 30; detail = `Weak \u2014 only ${totalMetrics} metrics. Resume reads as responsibilities, not achievements.`; }

  return { score, detail };
}

function checkCareerProgression(resumeText) {
  let dateRanges = resumeText.toLowerCase().match(/(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{4})\s*[-\u2013\u2014]\s*(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{4})|present)/g) || [];
  if (dateRanges.length < 2) dateRanges = resumeText.match(/(\d{4})\s*[-\u2013\u2014]\s*(?:(\d{4})|present)/g) || [];

  if (dateRanges.length < 2) return { score: 70, detail: "Could not extract enough dates for progression analysis" };

  const years = [];
  for (const dr of dateRanges) {
    const matches = dr.match(/\d{4}/g);
    if (matches) matches.forEach(y => years.push(parseInt(y)));
  }

  const careerSpan = years.length > 0 ? Math.max(...years) - Math.min(...years) : 0;
  const jobCount = dateRanges.length;
  const issues = [];

  if (jobCount >= 3 && careerSpan > 0) {
    const avgTenure = careerSpan / jobCount;
    if (avgTenure < 1.2) issues.push(`Short average tenure (${avgTenure.toFixed(1)} years) \u2014 may raise job-hopping concern`);
  }

  const textLower = resumeText.toLowerCase();
  const hasProgression = (textLower.includes("engineer ii") || textLower.includes("senior") || textLower.includes("lead") || textLower.includes("manager")) && (textLower.includes("engineer") || textLower.includes("designer"));

  let score, detail;
  if (hasProgression) { score = 85; detail = `Career shows progression over ${careerSpan} years with ${jobCount} positions`; }
  else { score = 70; detail = `Lateral moves over ${careerSpan} years \u2014 no clear upward progression visible`; }

  if (issues.length > 0) { score -= 15; detail += ". Concerns: " + issues.join("; "); }

  return { score: Math.max(score, 20), detail };
}

function checkCompanyRecognition(resumeText) {
  const textLower = resumeText.toLowerCase();
  const recognized = [];

  KNOWN_COMPANIES.forEach(c => { if (textLower.includes(c)) recognized.push(c.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')); });
  KNOWN_UNIVERSITIES.forEach(u => { if (textLower.includes(u)) recognized.push(u.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')); });

  let score, detail;
  if (recognized.length >= 3) { score = 90; detail = `Strong brand recognition: ${recognized.slice(0, 5).join(", ")}`; }
  else if (recognized.length >= 2) { score = 75; detail = `Good brand recognition: ${recognized.join(", ")}`; }
  else if (recognized.length >= 1) { score = 60; detail = `Some brand recognition: ${recognized.join(", ")}`; }
  else { score = 40; detail = "No immediately recognizable company or university names"; }

  return { score, detail };
}

function checkRedFlags(resumeText) {
  const flags = [];
  const textLower = resumeText.toLowerCase();

  if (/\b(career\s+)?objective\b/.test(textLower)) flags.push("'Objective' section \u2014 outdated since ~2015, use 'Summary' instead");
  if (textLower.includes("references available") || textLower.includes("references upon request")) flags.push("'References available upon request' \u2014 wastes space, assumed");

  const vagueCount = ["team player", "hard worker", "self-starter", "go-getter", "detail-oriented", "results-oriented"].filter(v => textLower.includes(v)).length;
  if (vagueCount >= 2) flags.push(`${vagueCount} vague personality buzzwords without evidence`);

  const firstBullets = (resumeText.match(/[\u2022\-\*]\s*(.+?)(?:\n|$)/g) || []).slice(0, 3);
  const firstBulletMetrics = firstBullets.filter(b => /\d/.test(b)).length;
  if (firstBulletMetrics === 0 && firstBullets.length > 0) flags.push("No numbers in first 3 bullets \u2014 recruiter may stop reading");

  const bulletCount = (resumeText.match(/[\u2022\-\*]\s/g) || []).length;
  if (bulletCount > 18) flags.push(`${bulletCount} total bullets \u2014 too many, dilutes impact`);

  const score = Math.max(20, 100 - flags.length * 15);
  const detail = flags.length === 0 ? "No red flags detected \u2014 clean resume" : `${flags.length} red flag(s) found`;

  return { score, detail, flags };
}

function checkJdRelevance(resumeText, jdText) {
  const resumeLower = resumeText.toLowerCase();
  const jdLower = jdText.toLowerCase();

  let relevanceSignals = 0, totalChecks = 0;

  const industries = ["aerospace", "robotics", "automation", "manufacturing", "automotive", "defense", "electronics", "hardware", "mechanical", "electrical", "firmware", "embedded"];
  const jdIndustries = industries.filter(i => jdLower.includes(i));
  const resumeIndustries = industries.filter(i => resumeLower.includes(i));
  const industryOverlap = jdIndustries.filter(i => resumeIndustries.includes(i));

  if (industryOverlap.length > 0) relevanceSignals += 2;
  totalChecks += 2;

  const techRegex = /\b(?:solidworks|catia|python|matlab|cnc|plc|robot|gantry|firmware|stm32|arduino|vision|sensor|actuator|3d\s*print|tolerance|gd&t|fea|cad|machine\s*learning|embedded|linux)\b/g;
  const jdTech = [...new Set((jdLower.match(techRegex) || []))];
  const resumeTech = [...new Set((resumeLower.match(techRegex) || []))];
  const techOverlap = jdTech.filter(t => resumeTech.includes(t));

  if (techOverlap.length >= 3) relevanceSignals += 3;
  else if (techOverlap.length >= 1) relevanceSignals += 1;
  totalChecks += 3;

  let score = (relevanceSignals / Math.max(totalChecks, 1)) * 100;
  score = Math.min(Math.max(score, 20), 95);

  const detail = `Industry overlap: ${industryOverlap.join(", ") || "none"}. Technical overlap: ${techOverlap.slice(0, 5).join(", ") || "none"}`;

  return { score, detail };
}

function runHumanScreener(resumeText, jdText) {
  const checks = {};

  const density = checkVisualDensity(resumeText);
  checks.density = { name: "Visual Density & Length", score: Math.round(density.score * 10) / 10, detail: density.detail, weight: 0.10 };

  const bullet = checkBulletQuality(resumeText);
  checks.bullets = { name: "Bullet Point Quality", score: Math.round(bullet.score * 10) / 10, detail: bullet.detail, weight: 0.25, examples: bullet.data };

  const impact = checkImpactSignals(resumeText);
  checks.impact = { name: "Impact & Metrics", score: Math.round(impact.score * 10) / 10, detail: impact.detail, weight: 0.20 };

  const career = checkCareerProgression(resumeText);
  checks.career = { name: "Career Progression", score: Math.round(career.score * 10) / 10, detail: career.detail, weight: 0.10 };

  const brand = checkCompanyRecognition(resumeText);
  checks.brands = { name: "Brand Recognition", score: Math.round(brand.score * 10) / 10, detail: brand.detail, weight: 0.10 };

  const flags = checkRedFlags(resumeText);
  checks.red_flags = { name: "Red Flag Scan", score: Math.round(flags.score * 10) / 10, detail: flags.detail, weight: 0.10, flags: flags.flags };

  const relevance = checkJdRelevance(resumeText, jdText);
  checks.relevance = { name: "Role Relevance", score: Math.round(relevance.score * 10) / 10, detail: relevance.detail, weight: 0.15 };

  const overall = Object.values(checks).reduce((sum, c) => sum + c.score * c.weight, 0);

  let verdict, verdictClass;
  if (overall >= 80) { verdict = "PHONE SCREEN \u2014 This resume would get a call. Strong match with clear impact."; verdictClass = "pass"; }
  else if (overall >= 65) { verdict = "MAYBE PILE \u2014 Depends on the applicant pool. Could go either way."; verdictClass = "warning"; }
  else if (overall >= 45) { verdict = "PROBABLY NOT \u2014 Resume doesn't stand out enough. Needs stronger bullets/metrics."; verdictClass = "fail"; }
  else { verdict = "PASS \u2014 Significant issues would prevent this resume from getting a call."; verdictClass = "fail"; }

  return { overall_score: Math.round(overall * 10) / 10, verdict, verdict_class: verdictClass, checks };
}
