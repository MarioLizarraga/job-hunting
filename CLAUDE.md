# Job Hunting Project

**Owner:** Mario Lizarraga (mario.lizarragat@gmail.com)
**Repo:** https://github.com/MarioLizarraga/job-hunting (private)
**Device:** Windows 11 Home (user: taco)

## What This Project Is

Central hub for all job applications, tailored resumes, interview prep, and application tracking. Currently targeting Meta robotics/automation roles in Redmond, WA.

## Folder Structure

```
job-hunting/
├── CLAUDE.md                  # This file — project instructions
├── RESUME-SESSION-PROMPT.md   # Full prompt to start a new Claude session for resume work
├── resumes/
│   └── meta/                  # Meta-specific tailored resumes
│       ├── Resume_..._FieldServiceEngineer.md
│       ├── Resume_..._ResearchEngineerRobotics.md
│       └── Resume_..._MechDesignEngineer.md
├── analysis/
│   ├── META_JOB_ANALYSIS.md       # Job fit analysis for all 4 Meta roles
│   ├── ATS_FILTER_AUDIT.md        # Keyword-by-keyword ATS scoring
│   └── HUMAN_RECRUITER_AUDIT.md   # Recruiter 15-second scan simulation
├── interview-prep/
│   └── META_INTERVIEW_PREP.md     # Full interview prep: process, STAR stories, technical, questions
└── tracking/
    └── applications.md            # Application status tracker
```

## Resume Writing Rules

These rules were established through iterative feedback and should always be followed:

1. **1 page max** — 475-540 words. No half-empty second pages.
2. **Impact first** — every bullet needs a quantified result. "Cut cycle time by 67%" not "Built a system."
3. **JD-mapped bullets** — each bullet answers a specific required or preferred qualification.
4. **Self-audit before presenting** — run ATS keyword audit AND recruiter scan simulation.
5. **Ask for metrics early** — don't guess impact numbers, ask Mario.
6. **Anti-AI-detection** — specific part numbers (FUTEK USB520, UFactory 850), domain jargon, varied structure.
7. **Submit as .docx** — best ATS parsing compatibility.

## Verified Impact Metrics (use these in all resumes)

- **Robot arm test system**: 30 min → 10 min per panel (67% reduction). 75 panels/week. 25+ hrs/week saved = 1,300+ hrs/year
- **Equipment downtime**: 3 days/month → 30 min every 6 months (99%+ reduction)
- **ML defect detection**: 92% classification accuracy. 5 interns supervised over 2 years. Hardware prototype for vision capture.
- **Custom monitoring platform**: Built from scratch (replaced Grafana). Tracks work orders, locations, oven time/temp, robot arm downtime, failures, top failure modes. Sends automated notifications.

## Current Applications

### Meta (Redmond, WA) — Deadline: April 17, 2026
| Job ID | Title | Resume | ATS | Human | Status |
|--------|-------|--------|-----|-------|--------|
| 1717981592943031 | Field Service Engineer | V1 | 92% | 78-82% | Not yet submitted |
| 1526017051698282 | Research Engineer, Robotics | V2 | 85% | 82-85% | Not yet submitted |
| 1287364610007364 | Mech Design Engineer T&M | V3 | 72% | 55-60% | Not yet submitted |
| 1092822929374881 | Product Design Engineer | V3 | 48% | 35% | Not yet submitted |

## Known Gaps (cannot be fabricated)

- No FEA experience
- No high-volume consumer electronics
- No shock testing (has vibration testing with accelerometers)
- Title mismatch: "Automation Engineer" vs. target job titles
