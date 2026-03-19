# Resume & Job Hunting Session Prompt

Paste this entire block into a new Claude Code session to resume work on job applications.

---

## Context

I'm Mario Lizarraga. I have a private GitHub repo for job hunting that contains all my tailored resumes, analysis files, interview prep, and application tracking.

## How to Access Everything

**Step 1: Pull my memories**
```bash
cd ~/Documents/Claude && git pull
cat ~/Documents/Claude/projects/Resume/CLAUDE.md
cat ~/Documents/Claude/projects/Resume/MEMORY.md
```

**Step 2: Clone or pull the job-hunting repo**
```bash
cd ~/Desktop && gh repo clone MarioLizarraga/job-hunting
# or if already cloned:
cd ~/Desktop/job-hunting && git pull
```

**Step 3: Read the project instructions**
```bash
cat ~/Desktop/job-hunting/CLAUDE.md
```

**Step 4: Read existing resumes and analysis**
```bash
ls ~/Desktop/job-hunting/resumes/meta/
ls ~/Desktop/job-hunting/analysis/
ls ~/Desktop/job-hunting/interview-prep/
```

## My Background (Quick Reference)

**Current Role:** Automation Engineer II at Safran Electronics & Defense (IDD Aerospace), Redmond, WA. Feb 2023 – Present.
**Education:** MSc Space Systems Engineering (Merit) — University of Southampton. BSc Mechatronics Engineering (Magna Cum Laude, 96.36) — CETYS Universidad.
**Previous:** Design Engineer at Jenton International (UK, 2021-2022), Design Engineer at Honeywell Aerospace (Mexico, 2019-2020), AR/VR Engineer at El Garage Project Hub (Mexico, 2017-2019).

**Key achievements at Safran:**
- Built robotic switch test system: UFactory 850 + FUTEK USB520. Cut per-panel test time from 30 min to 10 min (67%). 75 panels/week = 25+ hrs/week saved.
- Reduced equipment downtime from 3 days/month to 30 min every 6 months (99%+).
- ML defect detection: 92% accuracy, supervised 5 interns over 2 years.
- Built custom production monitoring platform from scratch (replaced Grafana) — tracks work orders, oven data, failures, locations, notifications.
- Multi-axis gantry inspection system (X, Y, Z, rotation) with DSLR cameras.
- Vibration testing with accelerometers on deployed fixtures.
- STM32 firmware in C for continuity testing board.

**Certifications:** CATIA V5 Mechanical Design Expert, Six Sigma Green Belt DFSS Hardware, GD&T Fundamentals.
**Languages:** English (fluent), Spanish (native).

## My GitHub Repos (for deeper context)

```bash
gh repo list MarioLizarraga --limit 30
```

Key repos:
- `robot-arm-switch-tester` — RA-AST system (mirrors internal Gitea)
- `paint-cure-monitor` — IoT paint oven monitoring
- `smartdarts` — AI dart scoring with computer vision
- `stack-attack` — Unity 6 mobile game
- `financial-management` — FastAPI + React finance app
- `mtg-deck-builder` — MTG deck builder (public, live on GitHub Pages)
- `claude-memories` — Central memory repo synced across devices

Org repos:
```bash
gh repo list needl-point --limit 10
```
- `Needl` — Embroidery business platform (Vite + React + Supabase)

## Resume Rules (IMPORTANT)

1. **1 page max** (475-540 words)
2. **Every bullet = quantified impact mapped to a JD requirement**
3. **Self-audit**: Run ATS keyword check AND recruiter scan simulation before presenting
4. **Ask for metrics** — don't guess, ask me
5. **Anti-AI-detection**: Use specific part numbers, domain jargon, varied sentence structure
6. **Submit as .docx**

## What I Might Ask You To Do

- Create new tailored resumes for new job listings
- Update existing resumes based on feedback
- Write cover letters
- Research companies and interview processes
- Track application status
- Prep for specific interviews (behavioral STAR stories, technical questions)
- Update the tracking spreadsheet

## LinkedIn

https://www.linkedin.com/in/mario-lizarraga/
