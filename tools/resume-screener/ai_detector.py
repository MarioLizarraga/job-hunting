"""
AI Detection Engine — Simulates GPTZero/Originality.ai/Turnitin resume screening.

Analyzes text for patterns typical of AI-generated content:
1. Perplexity proxy (vocabulary predictability)
2. Burstiness (sentence length variation)
3. AI phrase detection (overused AI-typical words)
4. Structural uniformity (bullet pattern repetition)
5. Type-Token Ratio (vocabulary diversity)
6. Sentence opener diversity
"""

import re
import math
from collections import Counter
from typing import Dict, List, Tuple


# ─── AI-typical phrases (flagged by GPTZero, Originality.ai) ───────────
AI_PHRASES = {
    # High-signal phrases (strong AI indicators)
    "high": [
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
    # Medium-signal phrases (common in AI but also in human writing)
    "medium": [
        "resulting in", "responsible for", "tasked with",
        "collaborated with", "contributed to",
        "successfully implemented", "effectively managed",
        "demonstrated ability", "strong understanding",
        "key stakeholder", "cross-functional",
        "ensuring compliance", "maintaining quality",
        "continuous improvement", "proactive approach",
        "data-driven", "mission-critical",
    ],
}

# Sentence starters that AI over-uses
AI_STARTERS = [
    "additionally", "furthermore", "moreover", "consequently",
    "subsequently", "in addition", "as a result",
    "this involved", "this included", "this required",
    "i am", "i have", "i possess",
    "with a", "with over", "with extensive",
    "demonstrated", "utilized", "implemented",
    "responsible for", "tasked with",
]

# Strong action verbs that humans use naturally (not AI-flagged)
HUMAN_VERBS = [
    "built", "broke", "fixed", "hacked", "wired", "soldered",
    "debugged", "ripped out", "rewrote", "shipped", "cut",
    "slashed", "freed", "troubleshot", "modeled", "iterated",
    "instrumented", "installed", "wrote", "designed",
]


def analyze_perplexity_proxy(text: str) -> Tuple[float, str]:
    """
    Proxy for perplexity — measures how predictable the word choices are.
    AI text tends to have low perplexity (very predictable next words).

    Uses bigram predictability: how often word pairs repeat.
    Human text has more surprising word combinations.
    """
    words = re.findall(r'\b[a-z]+\b', text.lower())
    if len(words) < 20:
        return 50.0, "Insufficient text for perplexity analysis"

    # Bigram frequency analysis
    bigrams = [(words[i], words[i+1]) for i in range(len(words) - 1)]
    bigram_counts = Counter(bigrams)
    total_bigrams = len(bigrams)
    unique_bigrams = len(bigram_counts)

    # Bigram uniqueness ratio (higher = more human-like)
    bigram_ratio = unique_bigrams / total_bigrams if total_bigrams > 0 else 0

    # Word-level entropy (Shannon entropy)
    word_counts = Counter(words)
    total_words = len(words)
    entropy = -sum(
        (count / total_words) * math.log2(count / total_words)
        for count in word_counts.values()
    )

    # Normalize entropy (typical range for English: 7-10 bits for diverse text)
    max_entropy = math.log2(total_words) if total_words > 1 else 1
    normalized_entropy = entropy / max_entropy if max_entropy > 0 else 0

    # Score: higher entropy + higher bigram uniqueness = more human-like
    # AI text: entropy ~0.5-0.7, bigram ratio ~0.4-0.6
    # Human text: entropy ~0.7-0.9, bigram ratio ~0.7-0.9
    score = (normalized_entropy * 0.5 + bigram_ratio * 0.5) * 100

    if score > 70:
        detail = f"High vocabulary diversity (entropy: {entropy:.1f} bits, bigram uniqueness: {bigram_ratio:.1%}) — resembles human writing"
    elif score > 50:
        detail = f"Moderate vocabulary diversity (entropy: {entropy:.1f} bits, bigram uniqueness: {bigram_ratio:.1%}) — borderline"
    else:
        detail = f"Low vocabulary diversity (entropy: {entropy:.1f} bits, bigram uniqueness: {bigram_ratio:.1%}) — may flag as AI-generated"

    return score, detail


def analyze_burstiness(text: str) -> Tuple[float, str]:
    """
    Burstiness = variation in sentence length.
    AI writes uniform sentences. Humans write short punchy + long complex.

    Measured as coefficient of variation of sentence word counts.
    """
    sentences = re.split(r'[.!?•\n]+', text)
    sentences = [s.strip() for s in sentences if len(s.strip().split()) >= 3]

    if len(sentences) < 5:
        return 50.0, "Too few sentences for burstiness analysis"

    lengths = [len(s.split()) for s in sentences]
    mean_len = sum(lengths) / len(lengths)
    variance = sum((l - mean_len) ** 2 for l in lengths) / len(lengths)
    std_dev = math.sqrt(variance)
    cv = (std_dev / mean_len) * 100 if mean_len > 0 else 0

    # Also check min/max range
    length_range = max(lengths) - min(lengths)

    # AI text: CV typically 20-35%, range 5-15 words
    # Human text: CV typically 40-80%, range 15-40+ words
    if cv > 50:
        score = min(95, 50 + cv * 0.6)
        detail = f"High sentence length variation (CV: {cv:.0f}%, range: {min(lengths)}-{max(lengths)} words) — natural human pattern"
    elif cv > 30:
        score = 40 + cv * 0.5
        detail = f"Moderate variation (CV: {cv:.0f}%, range: {min(lengths)}-{max(lengths)} words) — borderline"
    else:
        score = max(10, cv * 1.5)
        detail = f"Low variation (CV: {cv:.0f}%, range: {min(lengths)}-{max(lengths)} words) — uniform length typical of AI"

    return min(score, 95), detail


def analyze_ai_phrases(text: str) -> Tuple[float, str]:
    """
    Detect AI-typical phrases and buzzwords.
    Counts occurrences and severity.
    """
    text_lower = text.lower()
    words = text_lower.split()
    total_words = len(words)

    high_hits = []
    medium_hits = []

    for phrase in AI_PHRASES["high"]:
        if phrase in text_lower:
            high_hits.append(phrase)

    for phrase in AI_PHRASES["medium"]:
        if phrase in text_lower:
            medium_hits.append(phrase)

    # Weighted score: high-signal phrases count 3x
    penalty = (len(high_hits) * 3 + len(medium_hits) * 1)

    # Normalize by document length (per 100 words)
    penalty_per_100 = (penalty / total_words * 100) if total_words > 0 else 0

    # Also check for human-like verbs (bonus)
    human_hits = sum(1 for v in HUMAN_VERBS if v in text_lower)
    bonus = min(human_hits * 3, 15)  # Up to 15 point bonus

    # Score: fewer AI phrases = higher score (more human-like)
    score = max(5, 100 - penalty_per_100 * 15 + bonus)
    score = min(score, 98)

    flagged = high_hits + medium_hits
    if not flagged:
        detail = "No AI-typical phrases detected — clean"
    else:
        detail = f"Flagged {len(high_hits)} high-signal + {len(medium_hits)} medium-signal AI phrases: {', '.join(flagged[:5])}"
        if len(flagged) > 5:
            detail += f" (+{len(flagged)-5} more)"

    return score, detail


def analyze_structural_uniformity(text: str) -> Tuple[float, str]:
    """
    Check if bullet points follow a repetitive structure.
    AI tends to write bullets as: "Verb + noun + prep + result" every time.
    Humans vary their structure.
    """
    # Extract bullet lines
    bullets = re.findall(r'[•\-\*]\s*(.+?)(?:\n|$)', text)
    if len(bullets) < 4:
        return 70.0, "Too few bullets for structural analysis"

    # Analyze first word of each bullet
    first_words = [b.strip().split()[0].lower().rstrip(',') for b in bullets if b.strip()]

    # Check for verb-start pattern repetition
    unique_starters = len(set(first_words))
    total_bullets = len(first_words)
    starter_diversity = unique_starters / total_bullets if total_bullets > 0 else 0

    # Check bullet length uniformity (same issue as burstiness but for bullets)
    bullet_lengths = [len(b.split()) for b in bullets]
    if len(bullet_lengths) > 2:
        mean_bl = sum(bullet_lengths) / len(bullet_lengths)
        bl_variance = sum((l - mean_bl) ** 2 for l in bullet_lengths) / len(bullet_lengths)
        bl_cv = math.sqrt(bl_variance) / mean_bl * 100 if mean_bl > 0 else 0
    else:
        bl_cv = 50

    # Check if bullets follow same grammatical pattern
    # AI pattern: "Verbed X by doing Y, resulting in Z"
    result_pattern = sum(1 for b in bullets if re.search(
        r'resulting in|leading to|achieving|enabling|driving|improving', b.lower()
    ))
    result_ratio = result_pattern / total_bullets if total_bullets > 0 else 0

    # Score
    score = (starter_diversity * 40) + (min(bl_cv, 60) * 0.5) + ((1 - result_ratio) * 30)
    score = min(max(score, 10), 95)

    if score > 70:
        detail = f"Good structural variety ({unique_starters}/{total_bullets} unique starters, CV: {bl_cv:.0f}%)"
    elif score > 45:
        detail = f"Moderate uniformity ({unique_starters}/{total_bullets} unique starters, {result_pattern} 'resulting in' patterns)"
    else:
        detail = f"High uniformity — {total_bullets - unique_starters} repeated starters, {result_pattern} formulaic result clauses"

    return score, detail


def analyze_ttr(text: str) -> Tuple[float, str]:
    """
    Type-Token Ratio — vocabulary richness.
    AI text tends to reuse the same words. Human text has more unique words.
    """
    words = re.findall(r'\b[a-z]+\b', text.lower())
    # Filter out common stop words
    stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
                  'of', 'with', 'by', 'from', 'is', 'was', 'are', 'were', 'be', 'been',
                  'has', 'have', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
                  'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
                  'it', 'its', 'i', 'my', 'we', 'our', 'their', 'them', 'not', 'no'}

    content_words = [w for w in words if w not in stop_words and len(w) > 2]

    if len(content_words) < 20:
        return 60.0, "Insufficient content words for TTR analysis"

    unique = len(set(content_words))
    total = len(content_words)
    ttr = unique / total

    # For resumes (typically 300-500 words), expected TTR:
    # AI: 0.40-0.55 (repetitive vocabulary)
    # Human: 0.55-0.75 (richer vocabulary)
    score = min(95, max(10, (ttr - 0.3) * 200))

    detail = f"Type-Token Ratio: {ttr:.2f} ({unique} unique / {total} content words)"
    if ttr > 0.60:
        detail += " — rich vocabulary, human-like"
    elif ttr > 0.48:
        detail += " — moderate diversity, borderline"
    else:
        detail += " — repetitive vocabulary, AI-like"

    return score, detail


def analyze_sentence_openers(text: str) -> Tuple[float, str]:
    """
    Check diversity of sentence/bullet openers.
    AI tends to start with the same transition words.
    """
    lines = re.split(r'[•\-\*\n]+', text)
    lines = [l.strip() for l in lines if len(l.strip().split()) >= 3]

    if len(lines) < 5:
        return 70.0, "Too few lines for opener analysis"

    # Check for AI-typical starters
    ai_opener_count = 0
    for line in lines:
        first_words = ' '.join(line.lower().split()[:2])
        for starter in AI_STARTERS:
            if first_words.startswith(starter):
                ai_opener_count += 1
                break

    ai_ratio = ai_opener_count / len(lines) if lines else 0

    # Score: fewer AI openers = higher score
    score = max(10, 100 - ai_ratio * 120)
    score = min(score, 95)

    if ai_ratio < 0.1:
        detail = f"Opener diversity is strong — only {ai_opener_count}/{len(lines)} use AI-typical starters"
    elif ai_ratio < 0.3:
        detail = f"Some AI-typical openers detected ({ai_opener_count}/{len(lines)})"
    else:
        detail = f"Many AI-typical openers ({ai_opener_count}/{len(lines)}) — flag risk"

    return score, detail


def run_ai_detection(resume_text: str) -> Dict:
    """
    Run full AI detection analysis. Returns overall score and breakdown.

    Score interpretation:
    - 80-100%: Very likely human-written (PASS)
    - 60-79%: Borderline — may flag on some detectors
    - 40-59%: Likely flagged as AI-assisted
    - 0-39%: Almost certainly flagged as AI-generated
    """
    checks = {}

    perp_score, perp_detail = analyze_perplexity_proxy(resume_text)
    checks["perplexity_proxy"] = {
        "name": "Vocabulary Predictability",
        "score": round(perp_score, 1),
        "detail": perp_detail,
        "weight": 0.20,
    }

    burst_score, burst_detail = analyze_burstiness(resume_text)
    checks["burstiness"] = {
        "name": "Sentence Length Variation (Burstiness)",
        "score": round(burst_score, 1),
        "detail": burst_detail,
        "weight": 0.20,
    }

    phrase_score, phrase_detail = analyze_ai_phrases(resume_text)
    checks["ai_phrases"] = {
        "name": "AI Phrase Detection",
        "score": round(phrase_score, 1),
        "detail": phrase_detail,
        "weight": 0.25,
    }

    struct_score, struct_detail = analyze_structural_uniformity(resume_text)
    checks["structure"] = {
        "name": "Structural Uniformity",
        "score": round(struct_score, 1),
        "detail": struct_detail,
        "weight": 0.15,
    }

    ttr_score, ttr_detail = analyze_ttr(resume_text)
    checks["ttr"] = {
        "name": "Vocabulary Diversity (TTR)",
        "score": round(ttr_score, 1),
        "detail": ttr_detail,
        "weight": 0.10,
    }

    opener_score, opener_detail = analyze_sentence_openers(resume_text)
    checks["openers"] = {
        "name": "Sentence Opener Diversity",
        "score": round(opener_score, 1),
        "detail": opener_detail,
        "weight": 0.10,
    }

    # Weighted overall score
    overall = sum(
        checks[k]["score"] * checks[k]["weight"]
        for k in checks
    )

    # Determine verdict
    if overall >= 80:
        verdict = "PASS — Likely human-written. Low risk of AI detection."
        verdict_class = "pass"
    elif overall >= 60:
        verdict = "BORDERLINE — May flag on some AI detectors. Consider rewording flagged phrases."
        verdict_class = "warning"
    elif overall >= 40:
        verdict = "RISKY — Likely flagged as AI-assisted. Significant rewriting recommended."
        verdict_class = "fail"
    else:
        verdict = "FAIL — Will almost certainly be flagged as AI-generated."
        verdict_class = "fail"

    return {
        "overall_score": round(overall, 1),
        "verdict": verdict,
        "verdict_class": verdict_class,
        "checks": checks,
    }
