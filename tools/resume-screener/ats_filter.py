"""
ATS Filter Engine — Simulates Workday/Greenhouse/Taleo resume screening.

Scores a resume against a job description using the same methods
real ATS systems use:
1. Keyword matching (exact + fuzzy)
2. Section detection and parsability
3. Years of experience extraction
4. Education matching
5. Job title relevance
6. Skills coverage (required vs preferred)
"""

import re
from collections import Counter
from typing import Dict, List, Tuple, Set
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


# ─── Standard section headers ATS systems recognize ───────────────────
KNOWN_SECTIONS = {
    "experience": ["experience", "work experience", "professional experience",
                   "employment", "employment history", "work history", "career history"],
    "education": ["education", "academic background", "academic history",
                  "degrees", "qualifications"],
    "skills": ["skills", "technical skills", "core competencies", "competencies",
               "areas of expertise", "proficiencies", "tools", "technologies"],
    "summary": ["summary", "professional summary", "profile", "objective",
                "career summary", "executive summary", "about"],
    "certifications": ["certifications", "certificates", "licenses",
                       "certifications & languages", "certifications and languages",
                       "professional development"],
    "projects": ["projects", "key projects", "notable projects"],
}

# ─── Common degree abbreviations ──────────────────────────────────────
DEGREE_PATTERNS = {
    "phd": 4, "ph.d": 4, "doctorate": 4, "doctor of": 4,
    "msc": 3, "m.sc": 3, "ms ": 3, "m.s.": 3, "master": 3, "mba": 3, "m.eng": 3,
    "bsc": 2, "b.sc": 2, "bs ": 2, "b.s.": 2, "bachelor": 2, "b.eng": 2, "ba ": 2,
    "associate": 1, "a.s.": 1, "a.a.": 1,
}

ENGINEERING_FIELDS = [
    "mechanical", "electrical", "mechatronics", "robotics", "aerospace",
    "computer science", "software", "industrial", "manufacturing",
    "systems engineering", "space systems", "automation",
]


def extract_keywords(text: str) -> Set[str]:
    """Extract meaningful keywords/phrases from text."""
    text_lower = text.lower()

    # Extract multi-word technical terms (2-3 word phrases)
    words = re.findall(r'\b[a-z][a-z0-9.#+/\-]+\b', text_lower)

    # Also extract specific technical terms that matter
    tech_patterns = re.findall(
        r'\b(?:solidworks|catia\s*v5|autodesk\s*inventor|siemens\s*nx|'
        r'python|matlab|sql|git|c\+\+|c#|stm32|arduino|raspberry\s*pi|'
        r'tensorflow|pytorch|opencv|scipy|numpy|pandas|'
        r'gd&t|gd&amp;t|dfm|dfa|dfm/dfa|fea|cad|cam|cnc|plc|'
        r'six\s*sigma|lean|kaizen|'
        r'i2c|spi|uart|serial|tcp/ip|can\s*bus|modbus|'
        r'3d\s*printing|fdm|sla|injection\s*molding|sheet\s*metal|'
        r'ufactory|xarm|futek|fanuc|kuka|abb|universal\s*robots|'
        r'machine\s*learning|computer\s*vision|deep\s*learning|'
        r'ros|ros2|linux|docker|aws|'
        r'tolerance\s*analysis|tolerance\s*stackup|root\s*cause|'
        r'failure\s*analysis|mtbf|mttr|'
        r'asme|iso|ansi|mil-std)\b',
        text_lower
    )

    all_terms = set(words) | set(tech_patterns)

    # Remove common stop words
    stop = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'is', 'was', 'are', 'were', 'be', 'been',
            'has', 'have', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
            'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
            'it', 'its', 'you', 'your', 'we', 'our', 'their', 'them', 'not', 'no',
            'all', 'any', 'each', 'other', 'such', 'also', 'very', 'just', 'than',
            'then', 'now', 'here', 'there', 'who', 'what', 'which', 'how', 'when',
            'where', 'about', 'into', 'through', 'during', 'before', 'after',
            'above', 'below', 'between', 'under', 'over', 'out', 'up', 'down',
            'more', 'most', 'some', 'new', 'used', 'using', 'use', 'work',
            'able', 'well', 'also', 'back', 'even', 'still', 'way', 'take',
            'come', 'make', 'like', 'long', 'great', 'good', 'right', 'look',
            'think', 'know', 'need', 'want', 'going'}

    return {t for t in all_terms if t not in stop and len(t) > 1}


def extract_jd_requirements(jd_text: str) -> Dict:
    """
    Parse job description to extract required/preferred qualifications.
    """
    jd_lower = jd_text.lower()

    # Try to find required vs preferred sections
    req_section = ""
    pref_section = ""

    # Common JD section patterns
    req_patterns = [
        r'(?:minimum|required|basic)\s+qualifications?\s*[:\n](.*?)(?=preferred|bonus|nice|additional|\Z)',
        r'requirements?\s*[:\n](.*?)(?=preferred|bonus|nice|additional|\Z)',
        r'what\s+you\'ll?\s+need\s*[:\n](.*?)(?=preferred|bonus|nice|additional|\Z)',
        r'you\s+have\s*[:\n](.*?)(?=preferred|bonus|nice|additional|\Z)',
    ]

    pref_patterns = [
        r'(?:preferred|bonus|nice\s+to\s+have|additional)\s+qualifications?\s*[:\n](.*?)(?=\Z)',
        r'preferred\s*[:\n](.*?)(?=\Z)',
    ]

    for pattern in req_patterns:
        match = re.search(pattern, jd_lower, re.DOTALL)
        if match:
            req_section = match.group(1)
            break

    for pattern in pref_patterns:
        match = re.search(pattern, jd_lower, re.DOTALL)
        if match:
            pref_section = match.group(1)
            break

    # If no sections found, treat entire JD as requirements
    if not req_section:
        req_section = jd_lower

    req_keywords = extract_keywords(req_section)
    pref_keywords = extract_keywords(pref_section) if pref_section else set()

    # Extract years of experience requirement
    years_match = re.search(r'(\d+)\+?\s*years?\s+(?:of\s+)?(?:experience|exp)', jd_lower)
    required_years = int(years_match.group(1)) if years_match else None

    # Extract education requirement
    required_degree = None
    for degree, level in sorted(DEGREE_PATTERNS.items(), key=lambda x: -x[1]):
        if degree in jd_lower:
            required_degree = degree
            break

    return {
        "required_keywords": req_keywords,
        "preferred_keywords": pref_keywords,
        "required_years": required_years,
        "required_degree": required_degree,
        "raw_required": req_section,
        "raw_preferred": pref_section,
    }


def check_section_detection(resume_text: str) -> Tuple[float, str, List[str]]:
    """
    Check if the resume has standard, ATS-recognizable sections.
    Missing sections = parsing failure = auto-reject on some systems.
    """
    text_lower = resume_text.lower()
    found = []
    missing = []

    essential = ["experience", "education", "skills"]
    optional = ["summary", "certifications", "projects"]

    for section in essential:
        section_found = False
        for variant in KNOWN_SECTIONS.get(section, [section]):
            if variant in text_lower:
                section_found = True
                found.append(section.title())
                break
        if not section_found:
            missing.append(section.title())

    for section in optional:
        for variant in KNOWN_SECTIONS.get(section, [section]):
            if variant in text_lower:
                found.append(section.title())
                break

    # Score: essential sections are critical
    essential_found = len([s for s in essential if s.title() in found])
    score = (essential_found / len(essential)) * 80 + (len(found) - essential_found) * 5

    if missing:
        detail = f"Found: {', '.join(found)}. MISSING: {', '.join(missing)} — ATS may fail to parse"
    else:
        detail = f"All sections detected: {', '.join(found)} — clean parse expected"

    return min(score, 100), detail, missing


def check_keyword_match(resume_text: str, jd_data: Dict) -> Tuple[float, str, Dict]:
    """
    Core ATS check — keyword overlap between resume and JD requirements.
    Uses both exact matching and TF-IDF semantic similarity.
    """
    resume_keywords = extract_keywords(resume_text)
    req_keywords = jd_data["required_keywords"]
    pref_keywords = jd_data["preferred_keywords"]

    # Exact keyword matches
    req_matches = resume_keywords & req_keywords
    req_missing = req_keywords - resume_keywords
    pref_matches = resume_keywords & pref_keywords
    pref_missing = pref_keywords - resume_keywords

    # Filter out very common words from missing (reduce noise)
    common_noise = {'experience', 'work', 'team', 'ability', 'strong', 'knowledge',
                    'understanding', 'working', 'including', 'related', 'required',
                    'preferred', 'years', 'minimum', 'within', 'across', 'role',
                    'position', 'candidate', 'ideal', 'must', 'should', 'will',
                    'based', 'level', 'high', 'specific', 'relevant', 'skills',
                    'technical', 'professional', 'development', 'management'}
    req_missing = {k for k in req_missing if k not in common_noise and len(k) > 2}
    pref_missing = {k for k in pref_missing if k not in common_noise and len(k) > 2}

    # TF-IDF semantic similarity between full texts
    try:
        vectorizer = TfidfVectorizer(stop_words='english', max_features=200)
        tfidf_matrix = vectorizer.fit_transform([resume_text.lower(), jd_data["raw_required"]])
        semantic_score = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0] * 100
    except Exception:
        semantic_score = 50.0

    # Calculate match percentages
    req_match_pct = len(req_matches) / max(len(req_keywords), 1) * 100
    pref_match_pct = len(pref_matches) / max(len(pref_keywords), 1) * 100

    # Overall keyword score (weighted: 60% required, 20% preferred, 20% semantic)
    score = req_match_pct * 0.60 + pref_match_pct * 0.20 + semantic_score * 0.20

    detail = (f"Required keywords: {len(req_matches)}/{len(req_keywords)} matched "
              f"({req_match_pct:.0f}%). Preferred: {len(pref_matches)}/{len(pref_keywords)} "
              f"({pref_match_pct:.0f}%). Semantic similarity: {semantic_score:.0f}%")

    match_data = {
        "required_matched": sorted(req_matches)[:15],
        "required_missing": sorted(req_missing)[:15],
        "preferred_matched": sorted(pref_matches)[:10],
        "preferred_missing": sorted(pref_missing)[:10],
        "semantic_score": round(semantic_score, 1),
    }

    return min(score, 100), detail, match_data


def check_experience_years(resume_text: str, jd_data: Dict) -> Tuple[float, str]:
    """Extract years of experience from resume and compare to JD requirement."""
    required = jd_data.get("required_years")
    if not required:
        return 80.0, "No specific years requirement found in JD"

    # Try to extract years from resume dates
    date_patterns = re.findall(
        r'(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{4})',
        resume_text.lower()
    )
    year_patterns = re.findall(r'\b(20\d{2})\b', resume_text)
    all_years = [int(y) for y in set(date_patterns + year_patterns)]

    if len(all_years) >= 2:
        career_span = max(all_years) - min(all_years)
    else:
        career_span = 0

    # Also check for "X+ years" in summary
    summary_years = re.search(r'(\d+)\+?\s*years?', resume_text.lower())
    stated_years = int(summary_years.group(1)) if summary_years else career_span

    actual_years = max(stated_years, career_span)

    if actual_years >= required:
        score = 100
        detail = f"Experience: {actual_years} years (required: {required}+) — MEETS requirement"
    elif actual_years >= required - 1:
        score = 70
        detail = f"Experience: {actual_years} years (required: {required}+) — CLOSE, may pass"
    elif actual_years >= required - 2:
        score = 40
        detail = f"Experience: {actual_years} years (required: {required}+) — BELOW requirement"
    else:
        score = 15
        detail = f"Experience: {actual_years} years (required: {required}+) — SIGNIFICANTLY below"

    return score, detail


def check_education(resume_text: str, jd_data: Dict) -> Tuple[float, str]:
    """Check if education meets JD requirements."""
    required_degree = jd_data.get("required_degree")
    if not required_degree:
        return 80.0, "No specific degree requirement found in JD"

    text_lower = resume_text.lower()
    required_level = DEGREE_PATTERNS.get(required_degree, 2)

    # Find highest degree in resume
    resume_level = 0
    resume_degree = "None found"
    for degree, level in DEGREE_PATTERNS.items():
        if degree in text_lower and level > resume_level:
            resume_level = level
            resume_degree = degree.upper()

    # Check field relevance
    field_match = any(f in text_lower for f in ENGINEERING_FIELDS)

    if resume_level >= required_level:
        score = 100 if field_match else 85
        detail = f"Degree: {resume_degree} (required: {required_degree.upper()}) — MEETS requirement"
        if not field_match:
            detail += " (field may not match)"
    elif resume_level == required_level - 1:
        score = 60
        detail = f"Degree: {resume_degree} (required: {required_degree.upper()}) — LOWER than required"
    else:
        score = 20
        detail = f"Degree: {resume_degree} (required: {required_degree.upper()}) — DOES NOT MEET"

    return score, detail


def check_formatting(resume_text: str) -> Tuple[float, str]:
    """
    Check for formatting issues that cause ATS parsing failures.
    """
    issues = []

    # Check for sufficient text content
    word_count = len(resume_text.split())
    if word_count < 200:
        issues.append(f"Very short ({word_count} words) — may trigger minimum content filter")
    elif word_count > 1000:
        issues.append(f"Very long ({word_count} words) — may exceed scanner limits")

    # Check for special characters that break parsing
    special_chars = re.findall(r'[^\x00-\x7F]', resume_text)
    non_standard = [c for c in special_chars if c not in '–—·•é']
    if len(non_standard) > 5:
        issues.append(f"Many non-ASCII characters ({len(non_standard)}) — may cause encoding issues")

    # Check for contact info
    has_email = bool(re.search(r'[\w.-]+@[\w.-]+\.\w+', resume_text))
    has_phone = bool(re.search(r'[\(\d][\d\s\(\)\-\+\.]{7,}', resume_text))
    if not has_email:
        issues.append("No email address detected")
    if not has_phone:
        issues.append("No phone number detected")

    # Check for dates
    has_dates = bool(re.search(r'\b20\d{2}\b', resume_text))
    if not has_dates:
        issues.append("No dates detected — ATS cannot parse timeline")

    score = max(10, 100 - len(issues) * 15)

    if not issues:
        detail = "Clean formatting — no parsing issues expected"
    else:
        detail = "Issues: " + "; ".join(issues)

    return min(score, 100), detail


def run_ats_filter(resume_text: str, jd_text: str) -> Dict:
    """
    Run full ATS screening. Returns overall score and breakdown.

    Score interpretation:
    - 80-100%: Strong match — very likely to reach human recruiter
    - 60-79%: Decent match — may pass depending on applicant pool
    - 40-59%: Weak match — likely filtered out
    - 0-39%: Poor match — almost certainly rejected by ATS
    """
    jd_data = extract_jd_requirements(jd_text)
    checks = {}

    # 1. Keyword matching (heaviest weight — this is what ATS primarily does)
    kw_score, kw_detail, kw_data = check_keyword_match(resume_text, jd_data)
    checks["keywords"] = {
        "name": "Keyword Match",
        "score": round(kw_score, 1),
        "detail": kw_detail,
        "weight": 0.40,
        "match_data": kw_data,
    }

    # 2. Section detection
    sec_score, sec_detail, sec_missing = check_section_detection(resume_text)
    checks["sections"] = {
        "name": "Section Detection (Parsability)",
        "score": round(sec_score, 1),
        "detail": sec_detail,
        "weight": 0.15,
    }

    # 3. Years of experience
    exp_score, exp_detail = check_experience_years(resume_text, jd_data)
    checks["experience"] = {
        "name": "Years of Experience",
        "score": round(exp_score, 1),
        "detail": exp_detail,
        "weight": 0.20,
    }

    # 4. Education
    edu_score, edu_detail = check_education(resume_text, jd_data)
    checks["education"] = {
        "name": "Education Match",
        "score": round(edu_score, 1),
        "detail": edu_detail,
        "weight": 0.15,
    }

    # 5. Formatting / parsability
    fmt_score, fmt_detail = check_formatting(resume_text)
    checks["formatting"] = {
        "name": "Format & Parse Quality",
        "score": round(fmt_score, 1),
        "detail": fmt_detail,
        "weight": 0.10,
    }

    # Weighted overall
    overall = sum(checks[k]["score"] * checks[k]["weight"] for k in checks)

    if overall >= 80:
        verdict = "STRONG MATCH — Resume will very likely reach the human recruiter."
        verdict_class = "pass"
    elif overall >= 60:
        verdict = "DECENT MATCH — May pass ATS depending on applicant pool size."
        verdict_class = "warning"
    elif overall >= 40:
        verdict = "WEAK MATCH — Likely filtered out. Add missing keywords from JD."
        verdict_class = "fail"
    else:
        verdict = "POOR MATCH — Will be rejected by ATS. Major gaps in keyword coverage."
        verdict_class = "fail"

    return {
        "overall_score": round(overall, 1),
        "verdict": verdict,
        "verdict_class": verdict_class,
        "checks": checks,
    }
