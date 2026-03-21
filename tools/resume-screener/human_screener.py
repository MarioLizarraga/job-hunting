"""
Human Recruiter Screener — Simulates a 15-second recruiter scan.

Checks what a real human recruiter evaluates:
1. Visual density (is it too cramped or too sparse?)
2. Bullet quality (action verbs, quantified results, specificity)
3. Career progression (logical flow, no unexplained gaps)
4. Impact signals (numbers, percentages, scale indicators)
5. Company recognition (brand names that catch the eye)
6. Red flags (job hopping, irrelevant content, vague language)
7. Title-to-JD relevance
"""

import re
import math
from typing import Dict, List, Tuple
from datetime import datetime


# ─── Strong action verbs recruiters respond to ────────────────────────
STRONG_VERBS = {
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
}

WEAK_VERBS = {
    "assisted", "helped", "supported", "participated", "contributed",
    "involved", "utilized", "leveraged", "facilitated", "handled",
    "responsible for", "tasked with", "worked on", "dealt with",
}

# Companies that make recruiters stop scrolling
KNOWN_COMPANIES = {
    "google", "meta", "amazon", "apple", "microsoft", "tesla", "spacex",
    "boeing", "lockheed", "raytheon", "northrop grumman", "general dynamics",
    "honeywell", "safran", "thales", "bae systems", "rolls-royce",
    "nasa", "jpl", "esa", "darpa",
    "nvidia", "intel", "qualcomm", "broadcom", "amd",
    "ge", "siemens", "abb", "rockwell", "fanuc", "kuka",
    "deloitte", "mckinsey", "bcg",
}

# Education institutions that catch attention
KNOWN_UNIVERSITIES = {
    "mit", "stanford", "caltech", "carnegie mellon", "georgia tech",
    "berkeley", "michigan", "purdue", "university of southampton",
    "southampton", "oxford", "cambridge", "imperial",
    "cetys", "itesm", "tec de monterrey", "unam",
}


def check_visual_density(resume_text: str) -> Tuple[float, str]:
    """
    Estimate visual density from text content.
    Too dense = wall of text. Too sparse = wasted space.
    Sweet spot: 350-500 words for 1 page.
    """
    word_count = len(resume_text.split())
    line_count = len(resume_text.strip().split('\n'))

    # Count bullets — handle various bullet chars from PDF extraction
    bullet_count = len(re.findall(r'(?:[•\-\*\u2022\u2023\u25CF\u25CB\u25E6\u2043\u2219]|\(cid:\d+\)|\d+\.)\s', resume_text))
    # Fallback: count lines starting with action verbs (PDF may strip bullet chars)
    if bullet_count == 0:
        verb_starts = sum(1 for line in resume_text.split('\n')
                         if line.strip() and line.strip().split()[0].lower().rstrip('ed,s') in
                         {'built', 'design', 'develop', 'creat', 'led', 'manag', 'direct',
                          'reduc', 'cut', 'increas', 'improv', 'launch', 'deploy',
                          'automat', 'troubleshot', 'debug', 'wrote', 'program',
                          'analyz', 'measur', 'test', 'model', 'prototype', 'supervis',
                          'conduct', 'support', 'install', 'instrument', 'produc'})
        bullet_count = verb_starts

    if 350 <= word_count <= 500:
        score = 90
        detail = f"{word_count} words — ideal density for a 1-page resume"
    elif 300 <= word_count < 350:
        score = 75
        detail = f"{word_count} words — slightly light, consider adding relevant detail"
    elif 500 < word_count <= 600:
        score = 70
        detail = f"{word_count} words — slightly dense, may feel cramped"
    elif word_count < 300:
        score = 45
        detail = f"{word_count} words — too sparse, looks like a junior resume"
    else:
        score = 40
        detail = f"{word_count} words — too dense, recruiter will skim and miss key info"

    # Bullets check
    if 8 <= bullet_count <= 15:
        score += 5
        detail += f". {bullet_count} bullet points (ideal range)"
    elif bullet_count < 6:
        score -= 5
        detail += f". Only {bullet_count} bullets — too few accomplishments shown"

    return min(score, 100), detail


def check_bullet_quality(resume_text: str) -> Tuple[float, str, Dict]:
    """
    Analyze individual bullet quality.
    Great bullets: Start with strong verb, include numbers, specific.
    Weak bullets: Passive, vague, no results.
    """
    # Try multiple bullet detection strategies
    bullets = re.findall(r'(?:[•\-\*\u2022\u2023\u25CF\u25CB\u25E6\u2043\u2219]|\(cid:\d+\))\s*(.+?)(?:\n|$)', resume_text)

    # Fallback: detect lines that start with action verbs (PDF may strip bullet chars)
    if len(bullets) < 3:
        all_verbs = STRONG_VERBS | WEAK_VERBS
        for line in resume_text.split('\n'):
            line = line.strip()
            if line and len(line.split()) >= 6:
                first = line.split()[0].lower()
                if any(first.startswith(v) for v in all_verbs):
                    if line not in bullets:
                        bullets.append(line)

    if not bullets:
        return 30.0, "No bullet points found", {}

    strong_verb_count = 0
    weak_verb_count = 0
    quantified_count = 0
    too_short = 0
    too_long = 0
    great_bullets = []
    weak_bullets = []

    for b in bullets:
        b_lower = b.strip().lower()
        words = b.strip().split()
        first_word = words[0].lower() if words else ""

        # Check for strong action verb start (match beginning of first word)
        is_strong = any(first_word.startswith(v) or first_word == v for v in STRONG_VERBS)
        is_weak = any(v in b_lower[:30] for v in WEAK_VERBS)

        if is_strong:
            strong_verb_count += 1
        if is_weak:
            weak_verb_count += 1

        # Check for quantified results (numbers, percentages)
        has_numbers = bool(re.search(r'\d+[%+]?', b))
        if has_numbers:
            quantified_count += 1

        # Check length
        word_len = len(words)
        if word_len < 8:
            too_short += 1
        elif word_len > 35:
            too_long += 1

        # Classify
        if is_strong and has_numbers and 10 <= word_len <= 30:
            great_bullets.append(b.strip()[:80])
        elif is_weak or (not has_numbers and word_len < 12):
            weak_bullets.append(b.strip()[:80])

    total = len(bullets)

    # Scoring
    verb_score = (strong_verb_count / total) * 40 if total > 0 else 0
    quant_score = (quantified_count / total) * 30 if total > 0 else 0
    weak_penalty = (weak_verb_count / total) * 15 if total > 0 else 0
    length_penalty = ((too_short + too_long) / total) * 15 if total > 0 else 0

    score = verb_score + quant_score + 30 - weak_penalty - length_penalty
    score = min(max(score, 10), 95)

    detail = (f"{strong_verb_count}/{total} bullets start with strong verbs. "
              f"{quantified_count}/{total} include quantified results. "
              f"{weak_verb_count} weak verb uses.")

    data = {
        "great_examples": great_bullets[:3],
        "weak_examples": weak_bullets[:3],
        "strong_verb_pct": round(strong_verb_count / max(total, 1) * 100),
        "quantified_pct": round(quantified_count / max(total, 1) * 100),
    }

    return score, detail, data


def check_impact_signals(resume_text: str) -> Tuple[float, str]:
    """
    Count impact signals — numbers, percentages, scale indicators.
    Recruiters are trained to look for these.
    """
    # Count different types of metrics
    percentages = re.findall(r'\d+%', resume_text)
    dollar_amounts = re.findall(r'\$[\d,]+', resume_text)
    time_savings = re.findall(r'\d+\+?\s*(?:hrs?|hours?|min|minutes?|days?)/(?:week|month|year)', resume_text)
    scale_numbers = re.findall(r'\d+\+?\s*(?:panels?|units?|parts?|systems?|interns?|students?|participants?|documents?)', resume_text.lower())
    plain_numbers = re.findall(r'\b\d+(?:\.\d+)?(?:\+|%|x)?\b', resume_text)

    total_metrics = len(percentages) + len(dollar_amounts) + len(time_savings) + len(scale_numbers)

    # A good 1-page resume should have 5-10 concrete metrics
    if total_metrics >= 8:
        score = 95
        detail = f"Excellent — {total_metrics} concrete metrics found (percentages: {len(percentages)}, time: {len(time_savings)}, scale: {len(scale_numbers)})"
    elif total_metrics >= 5:
        score = 80
        detail = f"Good — {total_metrics} metrics found. Consider adding more to weaker bullets."
    elif total_metrics >= 3:
        score = 60
        detail = f"Fair — only {total_metrics} metrics. Recruiters want numbers in most bullets."
    else:
        score = 30
        detail = f"Weak — only {total_metrics} metrics. Resume reads as responsibilities, not achievements."

    return score, detail


def check_career_progression(resume_text: str) -> Tuple[float, str]:
    """
    Check for logical career flow, gaps, and progression.
    """
    # Extract date ranges
    date_ranges = re.findall(
        r'(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{4})\s*[-–—]\s*'
        r'(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{4})|present)',
        resume_text.lower()
    )

    if not date_ranges:
        # Try simpler pattern
        date_ranges = re.findall(r'(\d{4})\s*[-–—]\s*(?:(\d{4})|present)', resume_text.lower())

    if len(date_ranges) < 2:
        return 70.0, "Could not extract enough dates for progression analysis"

    # Check for gaps > 6 months
    years = []
    for match in date_ranges:
        years.append(int(match[0]))
        if match[1] and match[1] != 'present':
            years.append(int(match[1]))

    years_sorted = sorted(set(years))

    # Check job count vs career span
    career_span = max(years) - min(years) if years else 0
    job_count = len(date_ranges)

    issues = []

    # Job hopping check (avg tenure < 1.5 years with 3+ jobs)
    if job_count >= 3 and career_span > 0:
        avg_tenure = career_span / job_count
        if avg_tenure < 1.2:
            issues.append(f"Short average tenure ({avg_tenure:.1f} years) — may raise job-hopping concern")

    # Check for upward progression (title analysis)
    text_lower = resume_text.lower()
    has_progression = (
        ("engineer ii" in text_lower or "senior" in text_lower or "lead" in text_lower or "manager" in text_lower) and
        ("engineer" in text_lower or "designer" in text_lower)
    )

    if has_progression:
        score = 85
        detail = f"Career shows progression over {career_span} years with {job_count} positions"
    else:
        score = 70
        detail = f"Lateral moves over {career_span} years — no clear upward progression visible"

    if issues:
        score -= 15
        detail += ". Concerns: " + "; ".join(issues)

    return max(score, 20), detail


def check_company_recognition(resume_text: str) -> Tuple[float, str]:
    """
    Check for recognizable company/university names.
    Brand recognition creates instant credibility.
    """
    text_lower = resume_text.lower()
    recognized = []

    for company in KNOWN_COMPANIES:
        if company in text_lower:
            recognized.append(company.title())

    for uni in KNOWN_UNIVERSITIES:
        if uni in text_lower:
            recognized.append(uni.title())

    if len(recognized) >= 3:
        score = 90
        detail = f"Strong brand recognition: {', '.join(recognized[:5])}"
    elif len(recognized) >= 2:
        score = 75
        detail = f"Good brand recognition: {', '.join(recognized)}"
    elif len(recognized) >= 1:
        score = 60
        detail = f"Some brand recognition: {', '.join(recognized)}"
    else:
        score = 40
        detail = "No immediately recognizable company or university names"

    return score, detail


def check_red_flags(resume_text: str) -> Tuple[float, str, List[str]]:
    """
    Scan for common resume red flags that make recruiters hesitate.
    """
    flags = []
    text_lower = resume_text.lower()

    # Objective statement (outdated)
    if re.search(r'\b(career\s+)?objective\b', text_lower):
        flags.append("'Objective' section — outdated since ~2015, use 'Summary' instead")

    # References available
    if "references available" in text_lower or "references upon request" in text_lower:
        flags.append("'References available upon request' — wastes space, assumed")

    # Vague buzzwords without substance
    vague_count = sum(1 for v in ["team player", "hard worker", "self-starter",
                                   "go-getter", "detail-oriented", "results-oriented"]
                      if v in text_lower)
    if vague_count >= 2:
        flags.append(f"{vague_count} vague personality buzzwords without evidence")

    # No metrics in first 3 bullets
    first_bullets = re.findall(r'[•\-\*]\s*(.+?)(?:\n|$)', resume_text)[:3]
    first_bullet_metrics = sum(1 for b in first_bullets if re.search(r'\d', b))
    if first_bullet_metrics == 0 and first_bullets:
        flags.append("No numbers in first 3 bullets — recruiter may stop reading")

    # Unprofessional email
    email = re.search(r'([\w.-]+@[\w.-]+)', text_lower)
    if email:
        addr = email.group(1)
        if any(x in addr for x in ['420', '69', 'sexy', 'babe', 'hot', 'cool', 'xxx']):
            flags.append("Unprofessional email address")

    # Excessive bullet points on one role
    # (crude check: count bullets between job headers)
    bullet_count = len(re.findall(r'[•\-\*]\s', resume_text))
    if bullet_count > 18:
        flags.append(f"{bullet_count} total bullets — too many, dilutes impact")

    score = max(20, 100 - len(flags) * 15)

    if not flags:
        detail = "No red flags detected — clean resume"
    else:
        detail = f"{len(flags)} red flag(s) found"

    return score, detail, flags


def check_jd_relevance(resume_text: str, jd_text: str) -> Tuple[float, str]:
    """
    High-level relevance check — does this person seem like a fit
    based on title, industry, and top-level experience match?
    """
    resume_lower = resume_text.lower()
    jd_lower = jd_text.lower()

    relevance_signals = 0
    total_checks = 0

    # Check if current/recent title is related to JD title
    jd_titles = re.findall(r'(?:title|position|role)\s*:\s*(.+?)(?:\n|$)', jd_lower)
    if not jd_titles:
        # Try to get title from first line or prominent text
        jd_titles = [jd_lower[:100]]

    # Industry overlap
    industries = ["aerospace", "robotics", "automation", "manufacturing",
                  "automotive", "defense", "electronics", "hardware",
                  "mechanical", "electrical", "firmware", "embedded"]
    jd_industries = [i for i in industries if i in jd_lower]
    resume_industries = [i for i in industries if i in resume_lower]
    industry_overlap = set(jd_industries) & set(resume_industries)

    if industry_overlap:
        relevance_signals += 2
    total_checks += 2

    # Key technical overlap (top 5 technical terms from JD)
    jd_tech = re.findall(
        r'\b(?:solidworks|catia|python|matlab|cnc|plc|robot|gantry|'
        r'firmware|stm32|arduino|vision|sensor|actuator|3d\s*print|'
        r'tolerance|gd&t|fea|cad|machine\s*learning|embedded|linux)\b',
        jd_lower
    )
    resume_tech = re.findall(
        r'\b(?:solidworks|catia|python|matlab|cnc|plc|robot|gantry|'
        r'firmware|stm32|arduino|vision|sensor|actuator|3d\s*print|'
        r'tolerance|gd&t|fea|cad|machine\s*learning|embedded|linux)\b',
        resume_lower
    )
    tech_overlap = set(jd_tech) & set(resume_tech)
    if len(tech_overlap) >= 3:
        relevance_signals += 3
    elif len(tech_overlap) >= 1:
        relevance_signals += 1
    total_checks += 3

    score = (relevance_signals / max(total_checks, 1)) * 100
    score = min(max(score, 20), 95)

    detail = (f"Industry overlap: {', '.join(industry_overlap) or 'none'}. "
              f"Technical overlap: {', '.join(sorted(tech_overlap)[:5]) or 'none'}")

    return score, detail


def run_human_screener(resume_text: str, jd_text: str) -> Dict:
    """
    Simulate a human recruiter's 15-second resume scan.

    Score interpretation:
    - 80-100%: Would get a phone screen call
    - 60-79%: Maybe pile — depends on other candidates
    - 40-59%: Probably not — resume doesn't stand out
    - 0-39%: Definite no — significant issues
    """
    checks = {}

    # 1. Visual density
    density_score, density_detail = check_visual_density(resume_text)
    checks["density"] = {
        "name": "Visual Density & Length",
        "score": round(density_score, 1),
        "detail": density_detail,
        "weight": 0.10,
    }

    # 2. Bullet quality
    bullet_score, bullet_detail, bullet_data = check_bullet_quality(resume_text)
    checks["bullets"] = {
        "name": "Bullet Point Quality",
        "score": round(bullet_score, 1),
        "detail": bullet_detail,
        "weight": 0.25,
        "examples": bullet_data,
    }

    # 3. Impact signals
    impact_score, impact_detail = check_impact_signals(resume_text)
    checks["impact"] = {
        "name": "Impact & Metrics",
        "score": round(impact_score, 1),
        "detail": impact_detail,
        "weight": 0.20,
    }

    # 4. Career progression
    career_score, career_detail = check_career_progression(resume_text)
    checks["career"] = {
        "name": "Career Progression",
        "score": round(career_score, 1),
        "detail": career_detail,
        "weight": 0.10,
    }

    # 5. Company recognition
    brand_score, brand_detail = check_company_recognition(resume_text)
    checks["brands"] = {
        "name": "Brand Recognition",
        "score": round(brand_score, 1),
        "detail": brand_detail,
        "weight": 0.10,
    }

    # 6. Red flags
    flag_score, flag_detail, flags = check_red_flags(resume_text)
    checks["red_flags"] = {
        "name": "Red Flag Scan",
        "score": round(flag_score, 1),
        "detail": flag_detail,
        "weight": 0.10,
        "flags": flags,
    }

    # 7. JD relevance
    relevance_score, relevance_detail = check_jd_relevance(resume_text, jd_text)
    checks["relevance"] = {
        "name": "Role Relevance",
        "score": round(relevance_score, 1),
        "detail": relevance_detail,
        "weight": 0.15,
    }

    # Weighted overall
    overall = sum(checks[k]["score"] * checks[k]["weight"] for k in checks)

    if overall >= 80:
        verdict = "PHONE SCREEN — This resume would get a call. Strong match with clear impact."
        verdict_class = "pass"
    elif overall >= 65:
        verdict = "MAYBE PILE — Depends on the applicant pool. Could go either way."
        verdict_class = "warning"
    elif overall >= 45:
        verdict = "PROBABLY NOT — Resume doesn't stand out enough. Needs stronger bullets/metrics."
        verdict_class = "fail"
    else:
        verdict = "PASS — Significant issues would prevent this resume from getting a call."
        verdict_class = "fail"

    return {
        "overall_score": round(overall, 1),
        "verdict": verdict,
        "verdict_class": verdict_class,
        "checks": checks,
    }
