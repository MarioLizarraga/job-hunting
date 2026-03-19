# ATS Filter Audit — Mario Lizarraga vs. 4 Meta Jobs

Scoring method: Each required qualification from the JD is checked against the resume for keyword presence and evidence. Full match = 1.0, partial/implied = 0.5, missing = 0. Required quals weighted 70%, preferred 30%. Final score = likelihood of passing automated + first-human screen.

---

## RESUME V1 (Field Service) → Job 1: Field Service Engineer

| # | Required Qualification | Found in Resume? | Score |
|---|----------------------|-----------------|-------|
| 1 | 3+ years hands-on troubleshooting electro-mechanical systems in robotics/automation | "7+ years troubleshooting...electro-mechanical systems in robotics and aerospace" | 1.0 |
| 2 | Understanding of electro-mechanical system architecture and subsystem interfaces | "failures across mechanical...electrical...firmware...software" — shows subsystem-level understanding | 1.0 |
| 3 | Failure analysis and root cause analysis | "structured failure analysis" + "identified root causes" + "corrective actions" | 1.0 |
| 4 | Mechanical assembly and manufacturing process knowledge | "fabricated custom test fixtures" + Jenton commissioning + Honeywell casting/CNC | 1.0 |
| 5 | DFM/DFA principles | "applying DFM/DFA principles" in bullet + skills section | 1.0 |
| 6 | Analyze service data and identify reliability trends | "failure analysis on force sensor data" + IoT monitoring — but NO "reliability trends", "MTBF", "MTTR" keywords | 0.5 |
| 7 | Cross-functional collaboration | "Partnered cross-functionally with manufacturing, quality, and design engineering" | 1.0 |
| 8 | Willingness to travel and support urgent escalations | NOT MENTIONED ANYWHERE | 0.0 |
| 9 | Ambiguous environments with evolving hardware | "ambiguous, fast-moving hardware environments" in summary | 1.0 |

**Required: 7.5 / 9 = 83%**

| # | Preferred Qualification | Found? | Score |
|---|------------------------|--------|-------|
| 1 | Robotics fleet support, preventative maintenance, spare parts | "maintained" robotic system + IoT system "12+ months" — but no "fleet", "preventative maintenance", "spare parts" | 0.5 |
| 2 | Service procedure creation and technician training | "7+ service documents" + "enabling manufacturing technicians" | 1.0 |
| 3 | Reliability metrics and operational reporting | No MTBF, MTTR, or "operational reporting" | 0.0 |
| 4 | Driving corrective actions through validation and testing | "drive corrective actions" x2, "implemented corrective actions" | 1.0 |

**Preferred: 2.5 / 4 = 63%**

### TOTAL: 0.7(83) + 0.3(63) = 77%

### GAPS TO FIX:
- ❌ Add "willingness to travel" (easy — one line)
- ❌ Add "MTBF/MTTR" or "reliability metrics" language
- ❌ Add "fleet" or "preventative maintenance" language
- ❌ Add "spare parts" or "spares strategy"

---

## RESUME V2 (Research Engineer) → Job 3: Research Engineer, Robotics

| # | Required Qualification | Found? | Score |
|---|----------------------|--------|-------|
| 1 | 5+ years ME/EE Design with machine design or electrical component development | "7+ years designing electromechanical systems" + "machine design" in skills + fixture/end-effector design | 1.0 |
| 2 | Electromechanical assembly design (robotics, aerospace, industrial automation) | "robotic test platform" + "aerospace" + Jenton "electromechanical assemblies" | 1.0 |
| 3 | CAD tools (SolidWorks, Siemens NX, or equivalent) | "SolidWorks, CATIA V5, Autodesk Inventor, Siemens NX" | 1.0 |
| 4 | Prototyping processes and materials knowledge | "3D printing (FDM/SLA)" + "4+ prototype revisions" + "CNC machining awareness" | 1.0 |
| 5 | Embedded systems and communication protocols | "STM32 firmware (C)" + "serial communication" + "I2C/SPI/UART" | 1.0 |
| 6 | Tolerance analysis and GD&T expertise | "GD&T per ASME Y14.5" + "tolerance stackup analysis" + GD&T cert | 1.0 |
| 7 | BS in ME/EE or related field | "BSc Mechatronics Engineering" — related field | 0.8 |

**Required: 6.8 / 7 = 97%**

| # | Preferred Qualification | Found? | Score |
|---|------------------------|--------|-------|
| 1 | 3+ years Mechanical Design Engineering | 3+ years at Safran doing exactly this | 1.0 |
| 2 | Robotics and consumer electronics product design | Robotics yes, consumer electronics no | 0.5 |
| 3 | Power electronics and battery management | NOT MENTIONED | 0.0 |
| 4 | Mass production manufacturing (injection molding, CNC, sheet metal) | "CNC machining awareness, sheet metal" — no injection molding | 0.5 |
| 5 | Automation equipment and custom machine design | Jenton custom machinery + Safran robotic test systems | 1.0 |
| 6 | FEA simulation | NOT MENTIONED | 0.0 |

**Preferred: 3.0 / 6 = 50%**

### TOTAL: 0.7(97) + 0.3(50) = 83%

### GAPS TO FIX:
- ❌ Add "FEA" if you have ANY experience (even from university — CubeSat structural analysis?)
- ⚠️ "Consumer electronics" — can't fabricate this, leave it
- ⚠️ "Power electronics / battery management" — can't fabricate this

---

## RESUME V3 (Mech Design) → Job 2: Product Design Engineer (Reality Labs)

| # | Required Qualification | Found? | Score |
|---|----------------------|--------|-------|
| 1 | BS in Mechanical Engineering | "BSc Mechatronics Engineering" — close but not exact match | 0.5 |
| 2 | 8+ years industry experience in mechanical design | "7+ years" — falls short of stated minimum | 0.5 |
| 3 | DFM/DFA, statistical tolerance analysis, GD&T, 3D/2D CAD | All present and certified | 1.0 |
| 4 | Material properties (plastics, metals, adhesives, glass) | Metals, casting mentioned — no plastics, adhesives, or glass | 0.3 |
| 5 | Testing and analysis (FEA, simulation, DOE) | DOE (Six Sigma) — but no explicit FEA or simulation | 0.3 |
| 6 | High-volume manufacturing (stamping, machining, injection molding) | CNC machining + casting — but no stamping, injection molding, and experience is LOW-volume aerospace | 0.3 |

**Required: 2.9 / 6 = 48%**

### TOTAL: ~48% — LIKELY FILTERED OUT

### VERDICT: This job is a poor match. The JD wants a deep ME with 8+ years in high-volume consumer electronics. Your background is low-volume aerospace + automation. Applying is a long shot but won't hurt — just don't spend time optimizing for it.

---

## RESUME V3 (Mech Design) → Job 4: Mechanical Design Engineer — Test & Measurement

| # | Required Qualification | Found? | Score |
|---|----------------------|--------|-------|
| 1 | 8+ years mechanical design in harsh environments | "7+ years" + Honeywell "high-temperature, high-vibration" — close but under stated min | 0.5 |
| 2 | BS in ME or equivalent | BSc Mechatronics — arguably equivalent | 0.7 |
| 3 | Shock and vibration measurement and analysis | "high-vibration environments" mentioned but no measurement/analysis of shock & vib specifically | 0.2 |
| 4 | Test fixture design experience | Multiple bullets dedicated to this | 1.0 |
| 5 | CAD tools (SolidWorks, Siemens NX) | All four major CAD tools listed | 1.0 |
| 6 | Prototyping manufacturing and materials knowledge | 3D printing, CNC, sheet metal, casting | 1.0 |
| 7 | Project management for time-sensitive deliverables | Implied (Jenton "delivery deadlines") but not stated explicitly | 0.3 |
| 8 | Tolerance analysis and GD&T | Certified, ASME Y14.5 referenced | 1.0 |
| 9 | FEA (static and modal analysis) | NOT MENTIONED | 0.0 |

**Required: 5.7 / 9 = 63%**

### TOTAL: ~63% — BORDERLINE, could go either way

### GAPS TO FIX:
- ❌ Add FEA (critical — it's a hard requirement)
- ❌ Add "project management" language explicitly
- ❌ Add "shock and vibration" if any experience exists
- ⚠️ Years gap (7 vs 8) — can't fix, but close enough that a human might pass it

---

# SUMMARY SCORECARD

| Resume | Job | ATS Score | Pass Filter? |
|--------|-----|-----------|-------------|
| V1 (Field Service) | Field Service Engineer | **77%** | YES but with fixable holes |
| V2 (Research Engineer) | Research Engineer, Robotics | **83%** | YES, strong |
| V3 (Mech Design) | Product Design Engineer | **48%** | LIKELY NO |
| V3 (Mech Design) | Mech Design — T&M | **63%** | BORDERLINE |

# FIXABLE GAPS (what I should patch right now)

## V1 — would go from 77% → ~90%
1. Add travel willingness
2. Add MTBF/MTTR / reliability metrics language
3. Add "fleet" or "preventative maintenance" wording

## V2 — would go from 83% → ~88%
1. Add FEA mention (even university-level)

## V3 — would go from 63% → ~72% for T&M job
1. Add FEA
2. Add "project management" explicitly
3. Add shock/vibration language if any basis exists
