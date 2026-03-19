# Human Recruiter Filter Audit — Mario Lizarraga

How this works: I'm reading each resume as a Meta recruiter would. I have 50-100 resumes that passed ATS for this role. I need to pick 15-20 for phone screens. I'm spending 15-20 seconds per resume. Here's my internal monologue.

---

## RESUME V1 → Field Service Engineer

### First 3 seconds (name, title, company)
"Automation Engineer II at Safran — aerospace, Redmond. Ok, credible company, local. But his title says 'Automation Engineer' not 'Field Service Engineer.' Is this a builder or a fixer? Let me keep reading."

### Summary (5 seconds)
"'Troubleshooting and maintaining electro-mechanical systems' — ok that's the right language. 'Diagnosing failures across mechanical, electrical, firmware, software' — good, that's what I need. 'Track fleet health through dashboards' — nice. 'Willing to travel' — checked that box. Ok, I'll look at the bullets."

### Current role bullets (10 seconds)
Reading bullet 1: "Built and maintained a UFactory 850 robotic test system... troubleshot failures across mechanical, electrical, firmware, and software" — **strong.** This person gets their hands dirty.

Reading bullet 2: "Structured failure analysis... identified root causes... corrective actions" — **good but vague.** Root cause of WHAT? How many failures? What was the impact? Did downtime go from X to Y?

Reading bullet 3: "Grafana dashboards... downtime events, failure mode frequency" — **good signal** for data-driven troubleshooting.

Reading bullet 4: "7+ service documents... enabling technicians" — **this is great for field service.** Shows they write procedures and train people.

Reading bullet 5: "Test fixtures... DFM/DFA... spares strategy" — ok, design work. Relevant but not the core of field service.

Reading bullet 6: "Vibration testing and measurement" — **good keyword** but feels thin. One line with no specifics. What equipment? What did you find?

Reading bullet 7: "Cross-functionally... drive corrective actions" — standard, everyone says this.

### Red Flags
- **No quantified business impact anywhere.** I see scope numbers (200+ switches, 7+ docs, 12+ months) but zero results. No "reduced downtime by X%", no "improved MTBF from X to Y hours", no "decreased mean time to repair from X to Y minutes." Every other candidate at Meta will have metrics.
- **No evidence of field/site work.** This person maintains their OWN systems in ONE facility. The job requires traveling to customer/partner sites to fix robots you didn't build. Where's evidence of working outside their home facility?
- **The IoT Raspberry Pi bullet feels small** for a Meta robotics role. A Pi with a relay HAT polling a database — is this the scale Meta operates at?
- **Title mismatch concern persists.** This person is a builder/designer who also maintains. Will they be happy doing pure field service? Or will they get bored and leave?

### Green Flags
- Hands-on across the full stack (mech + electrical + firmware + software)
- Writes documentation and trains technicians
- Aerospace = high standards, traceability
- Local to Redmond

### VERDICT: 60-65% chance of phone screen
The core skills are there but the resume doesn't PROVE impact, and it reads more like "engineer who maintains their own creation" than "field service engineer who keeps a fleet running." In a stack of 50 resumes, this lands in the "maybe" pile, not the "definitely call" pile.

---

## RESUME V2 → Research Engineer, Robotics

### First 3 seconds
"Automation Engineer at Safran. Mechatronics + MSc Space Systems. Interesting background for a robotics research role."

### Summary
"'Took a robotic testing platform from blank whiteboard to production' — strong ownership claim. 'CAD, 3D-printed fixtures, STM32 firmware, robot arm integration, sensor calibration, Python control software' — wow, that's full-stack hardware. 'CubeSat and Mars Rover' — cool, relevant to our work."

### Current role bullets
Bullet 1: "Complete robotic test platform: UFactory 850 arm, FUTEK USB520 load cell, custom 3D-printed fixtures, STM32-based continuity tester" — **very strong.** Specific, shows system-level ownership.

Bullet 2: "Embedded firmware in C for a custom STM32... serial communication, signal acquisition, debounce logic" — **exactly what I want.** Proves they can go deep on embedded.

Bullet 3: "Modeled, fabricated, and iterated on mechanical test fixtures in SolidWorks... sub-millimeter contact alignment through 4+ prototype revisions" — **shows iteration discipline.** Good.

Bullet 4: "Multi-axis gantry system (X, Y, Z, rotation)... mechanical layout, motion control" — **shows mechanism design at system level.**

Bullet 5: "Safety-critical control software... emergency stop, force rate limiting, watchdog timers — zero safety incidents" — **good result, shows they think about safety.**

Bullet 6: "Vibration testing and measurement" — same issue as V1. Thin.

Bullet 7: "Mentored 5 interns across two concurrent hardware projects" — **good leadership signal.**

### Red Flags
- **Again, no quantified impact.** What did the robotic test platform ACHIEVE for the business? How much faster than manual? How much money saved? How many tests per day?
- **"Automation Engineer" title** — recruiter may wonder if this is really a design engineer or more of a process/manufacturing automation role.
- **No FEA** — for a research engineer role where we prototype and test, I'd like to see simulation capability.
- **Vibration bullet is still weak** — "identify mechanical wear patterns" without specifics feels like padding.

### Green Flags
- Full-stack hardware: CAD + fabrication + firmware + software + test
- Specific part numbers and technical depth (not generic)
- Mars Rover + CubeSat mechanisms — directly relevant to Meta robotics prototyping
- Clear progression from education into hands-on engineering
- STM32 firmware is a differentiator — many ME candidates can't do embedded

### VERDICT: 70-75% chance of phone screen
This is the strongest resume of the three. The full-stack hardware story is compelling, and the specificity builds trust. The missing impact metrics keep it from being a slam dunk. In a stack of 50, this is in the top third — likely gets a call.

---

## RESUME V3 → Product Design Engineer (Reality Labs)

### First 3 seconds
"Automation Engineer. Mechanical design engineer in summary. 7 years. Hmm, we need 8+ in pure ME with high-volume consumer electronics experience."

### Quick scan
"CATIA V5 certified — good. GD&T — good. SolidWorks — good. But... aerospace low-volume manufacturing? We make millions of headsets. His experience is building one-off test fixtures and cockpit panels in small batches. Different world."

### VERDICT: 30% chance of phone screen
Wrong profile shape. The skills partially overlap but the experience context doesn't. The recruiter will likely pass in favor of candidates from consumer electronics, automotive, or high-volume hardware companies. Not worth rewriting further.

---

## RESUME V3 → Mech Design Engineer, Test & Measurement

### First 3 seconds
"Safran, mechanical design, test fixtures. Ok, test and measurement — let me check if they have the depth."

### Summary
"'Designed test fixtures, instrumentation setups, and data acquisition pipelines to characterize mechanical performance and validate design limits' — that's literally the job description. Good summary."

### Current role bullets
Bullet 1: Test fixtures, sub-millimeter alignment, cyclic loads — **relevant.**
Bullet 2: Force sensor instrumentation, signal processing — **relevant.**
Bullet 3: Vibration testing — **relevant but thin.** "Dynamic load profiles" is good language but I want to know: what sensors? What sampling rate? What analysis method?
Bullet 4: Gantry system — ok but this is more automation than test & measurement.
Bullet 5: "Managed multiple concurrent hardware projects" — **generic project management filler.** Everyone says this.
Bullet 6: Grafana dashboards — **mismatch.** This is software/data work, not mechanical test engineering.

### Red Flags
- **No FEA.** It's a hard requirement. I see zero mention. Next.
- **7 years vs. 8+ required.** Close but the missing year matters when I have other candidates who clear it.
- **No shock testing.** Vibration is mentioned but shock is separate (drop tests, impact tests). This role tests robots that take hits.
- **"Managed multiple concurrent hardware projects"** is filler. It tells me nothing specific. What projects? What constraints? What tradeoffs?
- **The Grafana bullet doesn't belong on this resume.** A T&M mech design engineer isn't expected to build software dashboards. It dilutes the mechanical focus.

### Green Flags
- Test fixture design is clearly demonstrated
- Force sensor instrumentation shows measurement capability
- GD&T certification is a strong credential for this role
- Honeywell "high-temperature, high-vibration" shows exposure to harsh environments

### VERDICT: 45-50% chance of phone screen
The test fixture and instrumentation experience is real, but the missing FEA is a hard gap that a hiring manager will notice immediately. In a competitive stack, candidates with FEA + shock/vib testing + 8+ years will be preferred.

---

# FINAL HUMAN FILTER SCORECARD

| Resume | Job | ATS Score | Human Score | Combined | Get a Call? |
|--------|-----|-----------|-------------|----------|-------------|
| V1 | Field Service Engineer | 92% | **60-65%** | **~78%** | Probable, not certain |
| V2 | Research Engineer, Robotics | 85% | **70-75%** | **~80%** | Likely yes |
| V3 | Product Design (Reality Labs) | 48% | **30%** | **~39%** | Unlikely |
| V3 | Mech Design T&M | 72% | **45-50%** | **~61%** | Coin flip |

---

# THE ONE PROBLEM HURTING ALL THREE RESUMES

## No quantified business impact. Zero.

Every bullet says WHAT you did. None say what CHANGED because you did it.

The resume currently reads like a capability statement:
"I built X, I designed Y, I troubleshot Z."

It needs to read like a results statement:
"I built X, which reduced manual testing time from 45 min/switch to 3 min/switch."
"I designed Y, which caught 15% more defects than visual inspection."
"I troubleshot Z, reducing system downtime from ~8 hrs/month to <1 hr/month."

At Meta, the recruiter has been trained to look for IMPACT because Meta's culture is "Focus on Impact." A resume that only describes activities without results signals someone who does the work but doesn't measure whether it mattered.

## Questions I need answered to fix this:

1. How long did manual switch testing take before the robot arm? How long does it take now per switch?
2. How many switches does the system test per day/week/month?
3. What was system downtime before your reliability improvements? What is it now?
4. The 20% inspection time reduction (from your old resume) — is that real? Can I use it?
5. Any cost savings estimates? Even rough — "saved X hours of technician time per week"?
6. The vibration testing — what did you use? Accelerometers? What did you find that changed a design?
