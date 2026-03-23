/**
 * AI Detection Engine — Client-side port of ai_detector.py
 * Simulates GPTZero/Originality.ai/Turnitin resume screening.
 */

const AI_PHRASES = {
  high: [
    "leveraged", "spearheaded", "orchestrated", "synergized",
    "facilitated seamless", "comprehensive suite", "holistic approach",
    "cutting-edge", "state-of-the-art", "best-in-class",
    "proven track record", "results-driven professional",
    "dynamic professional", "seasoned professional",
    "passionate about", "adept at", "excels in",
    "in today's fast-paced", "ever-evolving", "landscape",
    "delve into", "tapestry", "testament to",
    "it's worth noting", "it is important to note",
    "in conclusion", "furthermore", "moreover", "additionally",
    "plays a crucial role", "plays a pivotal role",
    "a wide range of", "a broad spectrum of",
    "streamlined operations", "optimized workflows",
    "foster collaboration", "drive innovation",
    "meticulously", "strategically positioned",
  ],
  medium: [
    "resulting in", "responsible for", "tasked with",
    "collaborated with", "contributed to",
    "successfully implemented", "effectively managed",
    "demonstrated ability", "strong understanding",
    "key stakeholder", "cross-functional",
    "ensuring compliance", "maintaining quality",
    "continuous improvement", "proactive approach",
    "data-driven", "mission-critical",
  ],
};

const AI_STARTERS = [
  "additionally", "furthermore", "moreover", "consequently",
  "subsequently", "in addition", "as a result",
  "this involved", "this included", "this required",
  "i am", "i have", "i possess",
  "with a", "with over", "with extensive",
  "demonstrated", "utilized", "implemented",
  "responsible for", "tasked with",
];

const HUMAN_VERBS = [
  "built", "broke", "fixed", "hacked", "wired", "soldered",
  "debugged", "ripped out", "rewrote", "shipped", "cut",
  "slashed", "freed", "troubleshot", "modeled", "iterated",
  "instrumented", "installed", "wrote", "designed",
];

function analyzePerplexityProxy(text) {
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
  if (words.length < 20) return { score: 50, detail: "Insufficient text for perplexity analysis" };

  const bigrams = [];
  for (let i = 0; i < words.length - 1; i++) bigrams.push(words[i] + " " + words[i + 1]);
  const bigramCounts = {};
  bigrams.forEach(b => bigramCounts[b] = (bigramCounts[b] || 0) + 1);
  const bigramRatio = Object.keys(bigramCounts).length / bigrams.length;

  const wordCounts = {};
  words.forEach(w => wordCounts[w] = (wordCounts[w] || 0) + 1);
  const total = words.length;
  let entropy = 0;
  Object.values(wordCounts).forEach(c => {
    const p = c / total;
    entropy -= p * Math.log2(p);
  });
  const maxEntropy = Math.log2(total);
  const normEntropy = maxEntropy > 0 ? entropy / maxEntropy : 0;

  const score = Math.min(95, (normEntropy * 0.5 + bigramRatio * 0.5) * 100);

  let detail;
  if (score > 70) detail = `High vocabulary diversity (entropy: ${entropy.toFixed(1)} bits, bigram uniqueness: ${(bigramRatio * 100).toFixed(0)}%) \u2014 resembles human writing`;
  else if (score > 50) detail = `Moderate vocabulary diversity (entropy: ${entropy.toFixed(1)} bits, bigram uniqueness: ${(bigramRatio * 100).toFixed(0)}%) \u2014 borderline`;
  else detail = `Low vocabulary diversity (entropy: ${entropy.toFixed(1)} bits, bigram uniqueness: ${(bigramRatio * 100).toFixed(0)}%) \u2014 may flag as AI-generated`;

  return { score: Math.round(score * 10) / 10, detail };
}

function analyzeBurstiness(text) {
  const sentences = text.split(/[.!?\u2022\n]+/).map(s => s.trim()).filter(s => s.split(/\s+/).length >= 3);
  if (sentences.length < 5) return { score: 50, detail: "Too few sentences for burstiness analysis" };

  const lengths = sentences.map(s => s.split(/\s+/).length);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((a, l) => a + (l - mean) ** 2, 0) / lengths.length;
  const stdDev = Math.sqrt(variance);
  const cv = mean > 0 ? (stdDev / mean) * 100 : 0;

  let score, detail;
  if (cv > 50) {
    score = Math.min(95, 50 + cv * 0.6);
    detail = `High sentence length variation (CV: ${cv.toFixed(0)}%, range: ${Math.min(...lengths)}-${Math.max(...lengths)} words) \u2014 natural human pattern`;
  } else if (cv > 30) {
    score = 40 + cv * 0.5;
    detail = `Moderate variation (CV: ${cv.toFixed(0)}%, range: ${Math.min(...lengths)}-${Math.max(...lengths)} words) \u2014 borderline`;
  } else {
    score = Math.max(10, cv * 1.5);
    detail = `Low variation (CV: ${cv.toFixed(0)}%, range: ${Math.min(...lengths)}-${Math.max(...lengths)} words) \u2014 uniform length typical of AI`;
  }

  return { score: Math.min(Math.round(score * 10) / 10, 95), detail };
}

function analyzeAiPhrases(text) {
  const textLower = text.toLowerCase();
  const words = textLower.split(/\s+/);
  const totalWords = words.length;

  const highHits = AI_PHRASES.high.filter(p => textLower.includes(p));
  const mediumHits = AI_PHRASES.medium.filter(p => textLower.includes(p));

  const penalty = highHits.length * 3 + mediumHits.length;
  const penaltyPer100 = totalWords > 0 ? (penalty / totalWords) * 100 : 0;

  const humanHits = HUMAN_VERBS.filter(v => textLower.includes(v)).length;
  const bonus = Math.min(humanHits * 3, 15);

  let score = Math.max(5, 100 - penaltyPer100 * 15 + bonus);
  score = Math.min(score, 98);

  const flagged = [...highHits, ...mediumHits];
  let detail;
  if (flagged.length === 0) {
    detail = "No AI-typical phrases detected \u2014 clean";
  } else {
    detail = `Flagged ${highHits.length} high-signal + ${mediumHits.length} medium-signal AI phrases: ${flagged.slice(0, 5).join(", ")}`;
    if (flagged.length > 5) detail += ` (+${flagged.length - 5} more)`;
  }

  return { score: Math.round(score * 10) / 10, detail };
}

function analyzeStructuralUniformity(text) {
  const bulletRegex = /(?:[\u2022\u2023\u25CF\u25CB\u25E6\u2043\u2219\-\*]|\(cid:\d+\))\s*(.+?)(?:\n|$)/g;
  const bullets = [];
  let m;
  while ((m = bulletRegex.exec(text)) !== null) bullets.push(m[1]);
  if (bullets.length < 4) return { score: 70, detail: "Too few bullets for structural analysis" };

  const firstWords = bullets.map(b => b.trim().split(/\s+/)[0].toLowerCase().replace(/,$/, '')).filter(Boolean);
  const uniqueStarters = new Set(firstWords).size;
  const totalBullets = firstWords.length;
  const starterDiversity = totalBullets > 0 ? uniqueStarters / totalBullets : 0;

  const bulletLengths = bullets.map(b => b.split(/\s+/).length);
  let blCv = 50;
  if (bulletLengths.length > 2) {
    const meanBl = bulletLengths.reduce((a, b) => a + b, 0) / bulletLengths.length;
    const blVar = bulletLengths.reduce((a, l) => a + (l - meanBl) ** 2, 0) / bulletLengths.length;
    blCv = meanBl > 0 ? (Math.sqrt(blVar) / meanBl) * 100 : 0;
  }

  const resultPattern = bullets.filter(b => /resulting in|leading to|achieving|enabling|driving|improving/i.test(b)).length;
  const resultRatio = totalBullets > 0 ? resultPattern / totalBullets : 0;

  let score = (starterDiversity * 40) + (Math.min(blCv, 60) * 0.5) + ((1 - resultRatio) * 30);
  score = Math.min(Math.max(score, 10), 95);

  let detail;
  if (score > 70) detail = `Good structural variety (${uniqueStarters}/${totalBullets} unique starters, CV: ${blCv.toFixed(0)}%)`;
  else if (score > 45) detail = `Moderate uniformity (${uniqueStarters}/${totalBullets} unique starters, ${resultPattern} 'resulting in' patterns)`;
  else detail = `High uniformity \u2014 ${totalBullets - uniqueStarters} repeated starters, ${resultPattern} formulaic result clauses`;

  return { score: Math.round(score * 10) / 10, detail };
}

function analyzeTTR(text) {
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'was', 'are', 'were', 'be', 'been',
    'has', 'have', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
    'it', 'its', 'i', 'my', 'we', 'our', 'their', 'them', 'not', 'no']);

  const contentWords = words.filter(w => !stopWords.has(w) && w.length > 2);
  if (contentWords.length < 20) return { score: 60, detail: "Insufficient content words for TTR analysis" };

  const unique = new Set(contentWords).size;
  const total = contentWords.length;
  const ttr = unique / total;

  let score = Math.min(95, Math.max(10, (ttr - 0.3) * 200));

  let detail = `Type-Token Ratio: ${ttr.toFixed(2)} (${unique} unique / ${total} content words)`;
  if (ttr > 0.60) detail += " \u2014 rich vocabulary, human-like";
  else if (ttr > 0.48) detail += " \u2014 moderate diversity, borderline";
  else detail += " \u2014 repetitive vocabulary, AI-like";

  return { score: Math.round(score * 10) / 10, detail };
}

function analyzeSentenceOpeners(text) {
  const lines = text.split(/[\u2022\-\*\n]+/).map(l => l.trim()).filter(l => l.split(/\s+/).length >= 3);
  if (lines.length < 5) return { score: 70, detail: "Too few lines for opener analysis" };

  let aiOpenerCount = 0;
  for (const line of lines) {
    const firstWords = line.toLowerCase().split(/\s+/).slice(0, 2).join(" ");
    if (AI_STARTERS.some(s => firstWords.startsWith(s))) aiOpenerCount++;
  }

  const aiRatio = lines.length > 0 ? aiOpenerCount / lines.length : 0;
  let score = Math.max(10, 100 - aiRatio * 120);
  score = Math.min(score, 95);

  let detail;
  if (aiRatio < 0.1) detail = `Opener diversity is strong \u2014 only ${aiOpenerCount}/${lines.length} use AI-typical starters`;
  else if (aiRatio < 0.3) detail = `Some AI-typical openers detected (${aiOpenerCount}/${lines.length})`;
  else detail = `Many AI-typical openers (${aiOpenerCount}/${lines.length}) \u2014 flag risk`;

  return { score: Math.round(score * 10) / 10, detail };
}

function runAiDetection(resumeText) {
  const checks = {};

  const perp = analyzePerplexityProxy(resumeText);
  checks.perplexity_proxy = { name: "Vocabulary Predictability", score: perp.score, detail: perp.detail, weight: 0.20 };

  const burst = analyzeBurstiness(resumeText);
  checks.burstiness = { name: "Sentence Length Variation (Burstiness)", score: burst.score, detail: burst.detail, weight: 0.20 };

  const phrase = analyzeAiPhrases(resumeText);
  checks.ai_phrases = { name: "AI Phrase Detection", score: phrase.score, detail: phrase.detail, weight: 0.25 };

  const struct = analyzeStructuralUniformity(resumeText);
  checks.structure = { name: "Structural Uniformity", score: struct.score, detail: struct.detail, weight: 0.15 };

  const ttr = analyzeTTR(resumeText);
  checks.ttr = { name: "Vocabulary Diversity (TTR)", score: ttr.score, detail: ttr.detail, weight: 0.10 };

  const opener = analyzeSentenceOpeners(resumeText);
  checks.openers = { name: "Sentence Opener Diversity", score: opener.score, detail: opener.detail, weight: 0.10 };

  const overall = Object.values(checks).reduce((sum, c) => sum + c.score * c.weight, 0);

  let verdict, verdictClass;
  if (overall >= 80) { verdict = "PASS \u2014 Likely human-written. Low risk of AI detection."; verdictClass = "pass"; }
  else if (overall >= 60) { verdict = "BORDERLINE \u2014 May flag on some AI detectors. Consider rewording flagged phrases."; verdictClass = "warning"; }
  else if (overall >= 40) { verdict = "RISKY \u2014 Likely flagged as AI-assisted. Significant rewriting recommended."; verdictClass = "fail"; }
  else { verdict = "FAIL \u2014 Will almost certainly be flagged as AI-generated."; verdictClass = "fail"; }

  return { overall_score: Math.round(overall * 10) / 10, verdict, verdict_class: verdictClass, checks };
}
