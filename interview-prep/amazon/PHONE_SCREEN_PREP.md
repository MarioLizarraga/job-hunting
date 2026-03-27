# Amazon Phone Screen Prep — Hardware Development Engineer II (L5)

## Interview Details
- **Date:** Tuesday, March 31st, 2026 at 12:00 PM PDT
- **Duration:** 45-60 minutes via Zoom
- **Interviewer:** Stephen Elliott — Systems Engineering & Analytics Manager, Advanced Technology / Grocery Automation
- **Job ID:** 3196391
- **Team:** WWGS (Worldwide Grocery Store), GRAS (Robotics & Automation Systems) Hardware
- **Format:** Behavioral (STAR) + Technical discussion. Stephen will type notes during the call.

---

## About Your Interviewer: Stephen Elliott

Stephen leads the Systems Engineering and Analytics Team (AT-SEA) within Amazon's Advanced Technology org. His team:
- Accelerates rapid development of automation and mechatronic systems through **testing and evaluation**
- Builds **data pipelines and dashboards** for test results
- Delivers **final test reports and recommendations** to senior decision makers
- Defines requirements, models metrics, and establishes system targets

**He's a Coast Guard veteran.** Military background = values discipline, clear communication, follow-through.

### What Stephen will likely care about:
1. **Data-driven decisions** — His team builds dashboards and data pipelines. Your monitoring platform story is gold.
2. **Testing rigor** — His team does testing and evaluation. Your test plan methodology matters.
3. **Vendor skepticism** — "Healthy skepticism toward vendor assertions" is core to the team culture. Your FUTEK vendor validation story is perfect.
4. **Systems thinking** — He's a Systems Engineer. He wants to hear you think across mechanical + electrical + software.
5. **Quantified results** — Data pipelines → metrics → recommendations. Lead with numbers.

---

## The 3 Focus Areas (from the recruiter email)

### 1. DIVE DEEP
**LP Definition:** "Leaders operate at all levels, stay connected to the details, audit frequently, and are skeptical when metrics and anecdote differ. No task is beneath them."

**What they evaluate:**
- Can you peel back layers to find the REAL root cause?
- Do you stay connected to the data, not just take someone's word for it?
- Are you skeptical when the data doesn't match what people say?
- Are you hands-on? No task beneath you?

**YOUR BEST DIVE DEEP STORIES:**

#### Story A: Thermal Expansion Root Cause (PRIMARY — use this one)
> **S:** Our robot arm test system was flagging about 15% of panels as failures when they should have passed. Technicians said "just recalibrate the robot."
>
> **T:** I needed to find the real root cause, not just patch the symptom.
>
> **A:** Instead of recalibrating, I pulled two weeks of raw force data — every single press cycle — into Python. Used SciPy for analysis: Savitzky-Golay smoothing, peak detection, statistical analysis. I plotted force curves color-coded by pass/fail, time of day, panel type, and fixture position.
>
> A clear pattern emerged — failures spiked in the afternoon. I cross-referenced with temperature logs from our monitoring platform and found the 3D-printed fixture was thermally expanding. The afternoon sun heats that side of the shop floor, and the fixture was shifting about 0.3mm — enough to throw off the force readings.
>
> **R:** Root cause was material choice, not calibration. Switched to a low-thermal-expansion material. False failures dropped from 15% to under 1%. If I'd just recalibrated like everyone suggested, we'd still be chasing this problem weekly.
>
> **Key LP signals:** Skeptical of the easy answer. Used data to disprove the anecdote. Went hands-on with the analysis. Found the real root cause three layers deep.

**Follow-up questions to prepare for:**
- "How did you choose which data to analyze?" → I started broad (all variables) and narrowed based on correlation patterns. Time of day was the strongest signal.
- "Why didn't you trust the recalibration suggestion?" → The failures weren't consistent across all panels — if it were calibration, all panels would drift, not just afternoon ones.
- "What would you do differently?" → I'd add temperature compensation from day one and choose materials with thermal expansion in mind for production fixtures.
- "How did you validate the fix?" → Ran the new fixture for two weeks, tracked the same metrics, confirmed false failures stayed below 1%.

#### Story B: FUTEK Vendor Validation (BACKUP — also great for vendor skepticism)
> **S:** When selecting the force sensor for our robot arm, I evaluated three vendors. FUTEK claimed sub-Newton accuracy and millisecond response time.
>
> **T:** I needed to independently validate these claims before committing $X to production hardware.
>
> **A:** Didn't trust the spec sheet. Ordered evaluation units from FUTEK and a competitor. Designed a head-to-head comparison test: applied calibrated masses at various rates, checked linearity, repeatability, and thermal drift. FUTEK matched their claims. The competitor showed 3x more drift at elevated temperatures — critical because our shop floor has real temperature swings throughout the day.
>
> **R:** Data justified FUTEK's 40% price premium. Negotiated volume pricing and a spare parts agreement. I don't put anything in production that I haven't independently validated.

---

### 2. DEALING WITH AMBIGUITY
**Maps to LPs:** Bias for Action + Are Right, A Lot

**What they evaluate:**
- Can you act decisively with incomplete information?
- Do you know when you have "enough" data to move vs. when to gather more?
- Can you make calculated bets and iterate?

**YOUR BEST AMBIGUITY STORIES:**

#### Story A: Robot Arm — Make vs Buy with Incomplete Data (PRIMARY)
> **S:** I had to choose between a UFactory 850 cobot and a more expensive Fanuc for our test system. I had spec sheets from both vendors but no hands-on experience with either. And the budget cycle was closing in three days.
>
> **T:** Make a $15K+ decision that would affect production for years, with incomplete data and a tight deadline.
>
> **A:** I couldn't test both robots in three days. So I identified the three things that actually mattered for our application: force accuracy at our working range, Python SDK quality for fast development, and total cost including peripherals. Our application was straightforward — pick-and-press, not complex path planning — so the UFactory's lower specs were still well within our requirements. The $15K savings funded the FUTEK sensors and STM32 hardware we needed regardless.
>
> I accepted the risk of less community support because I could mitigate it: I'd document every integration issue as I went, building our own knowledge base.
>
> **R:** System has been running reliably in production. The decision worked because I matched the tool to actual requirements, not to what felt safest. I acted at 70% information rather than waiting for 100%.

#### Story B: Building the Test System From Scratch — No Spec, No Precedent (BACKUP)
> **S:** When I was hired at Safran, there was no specification for what the automated test system should do. No requirements document. The old equipment barely worked and nobody had documented what it actually tested or why.
>
> **T:** Design and build a complete test system with no formal requirements and no precedent to follow.
>
> **A:** I started by observing. I sat with technicians for a full week watching them test panels manually, noting every step, every measurement, every judgment call. I reverse-engineered the requirements from the manual process. Then I defined my own specification: force limits, travel limits, continuity thresholds — all derived from the manual process data.
>
> Rather than trying to get perfect requirements signed off (which could take months in aerospace), I shipped an 80% version in six weeks that handled the most common panel types. I ran it in parallel with the manual process to validate results matched. Then I iterated.
>
> **R:** Went from zero spec to production system in under three months. 67% time reduction, 1,300+ hours/year freed. The lesson: when requirements don't exist, go observe the actual work, define your own spec, and iterate.

---

### 3. CAD DESIGN EXPERIENCE
**What they evaluate:**
- Your design PROCESS, not just which buttons you click
- Decision-making: why this material? Why this geometry? Why this tolerance?
- How you go from concept → prototype → production
- GD&T knowledge and tolerance stackup understanding

**YOUR CAD STORY — The Robotic Test Fixture Design**
> **S:** Each illuminated cockpit panel at Safran has a different switch layout, and the robot arm needs sub-millimeter alignment to press each switch accurately. The legacy approach would have been one custom fixture per panel type — dozens of fixtures.
>
> **T:** Design a universal fixture system that handles all panel types with sub-millimeter repeatability.
>
> **A:** I designed a modular system in SolidWorks: a universal base plate with precision locating features, and small swappable adapter plates for each panel type. The base plate handles robot-to-fixture alignment, the adapters handle panel-to-fixture alignment.
>
> I went through 4+ design revisions:
> - Rev 1: FDM printed, rough alignment. Learned that layer lines caused inconsistent mating surfaces.
> - Rev 2: SLA printed, much better surface finish. Sub-millimeter accuracy achieved.
> - Rev 3: Added alignment pins and kinematic locating features for repeatable adapter mounting.
> - Rev 4: Material change to address thermal expansion issue discovered during production testing.
>
> Each revision was informed by test data — I measured dimensional accuracy after 500, 1000, 2000 cycles and tracked degradation.
>
> **R:** Final design achieves sub-millimeter repeatability across all panel types. Reduced fixture inventory from potentially dozens of custom jigs to one base + small adapters. And because each adapter is just a small flat plate with locating holes, a new panel type can be supported in hours, not weeks.

**GD&T topics to refresh (30 min before the interview):**
- Position tolerance (most common question)
- MMC vs LMC vs RFS
- Datum reference frames — how you'd define datums on your fixture
- Tolerance stackup — walk through a real example from your fixture design
- Flatness and perpendicularity — relevant to your fixture mating surfaces

---

## Questions They'll Likely Ask (and your answers)

### "Tell me about yourself" (90 seconds max)
> I'm Mario, a mechanical engineer with 7+ years in hardware design and automation, currently at Safran in Redmond. My main project there has been designing and building a robotic test platform from scratch — I did the mechanical design in SolidWorks, selected and validated sensors and actuators, wrote custom firmware, and built the data pipeline. It cut test time by 67% and freed over 1,300 hours per year.
>
> What I'm most drawn to in this role is the make-vs-buy and vendor evaluation work. At Safran I do that daily — I've independently validated vendor claims, designed custom tooling when commercial options didn't fit, and made hardware trade-off decisions under tight timelines. The GRAS team's focus on grocery automation systems — ASRS, robotic arms, portioning equipment — is exactly the kind of complex hardware challenge I want to take on at Amazon's scale.

### "Why Amazon? Why this role?"
> Three reasons. First, the work itself — skeptically reviewing vendor assertions, designing adjacent systems, investigating deployment issues — that's literally what I do at Safran, just in aerospace. I validate vendor claims through independent testing, design custom fixtures when commercial options don't work, and troubleshoot production issues using data. The difference is Amazon does this across an entire grocery fulfillment network, not one production line.
>
> Second, the Leadership Principles aren't aspirational for me — they're descriptive. I built a monitoring platform because I owned the problem, not because anyone asked. I dove into force data to find a root cause everyone else wanted to shortcut. I shipped an 80% system in six weeks rather than waiting for perfection. Ownership, Dive Deep, Bias for Action — I've been living these.
>
> Third, grocery automation is fascinating — the complexity of multi-temperature zones, fresh food handling, high throughput with perishable products — that's a harder version of the manufacturing problems I solve now. And I want harder problems.

### "Walk me through your robotic test platform at Safran"
> [Use the full architecture walkthrough from your Amazon answer #8 — but emphasize make-vs-buy decisions and vendor evaluation since that's what Stephen cares about]

### "Tell me about a time you critically evaluated a vendor's claims"
> [Use FUTEK vendor validation story above]

### "How do you approach make-vs-buy decisions?"
> My framework is: buy commodity, build custom. I bought the robot arm and sensors because those are commodity items where the vendor's R&D investment and manufacturing quality will always exceed what I can do in-house. But I built the fixtures, the firmware, and the software — because those needed to be custom to our panel geometry, our test requirements, and our monitoring platform integration.
>
> For each decision, I weigh: cost (upfront and ongoing), lead time (can I iterate fast enough?), customization needs (does a commercial solution actually fit?), vendor reliability (will they support it long-term?), and IP/knowledge retention (does building it in-house develop capabilities we'll need again?).
>
> The fixture decision was interesting — I could have machined aluminum fixtures ($500+ each, 3-week lead time) or 3D printed them ($20 each, overnight). I compared both: ran 1,000 test cycles on each, measured dimensional accuracy. The printed fixtures degraded after ~2,000 cycles, but at $20 each with overnight turnaround, I could iterate four times in the time it took to get one machined part. For development, printing won. For final production, I'd move to machining once the design stabilizes.

---

## Questions to Ask Stephen (pick 3-4)

**About the work:**
1. "The job description mentions 'skeptically reviewing vendor assertions' — can you give me an example of a time the team caught a vendor overstating their system's capabilities? What happened?"
2. "For the ASRS systems, are you primarily evaluating third-party systems like Knapp or Swisslog, or is Amazon developing custom solutions?"
3. "When a deployment doesn't go as planned, what does the investigation process look like? How autonomous is the engineer in driving the root cause analysis?"

**About the team:**
4. "How does the GRAS Hardware team collaborate with the broader Amazon Robotics teams? Are there shared platforms or is each grocery system fairly independent?"
5. "What does the first 90 days look like for a new HDE on the team?"
6. "The team description mentions 'business impact over perfection' — how does that play out in practice when you're designing for food-safe warehouse environments?"

**About growth:**
7. "What's the path from HDE II to senior on this team? What does someone need to demonstrate?"

---

## The Day-Of Checklist

### Night Before (Monday March 30)
- [ ] Re-read this entire document once
- [ ] Re-read the job description once
- [ ] Review your resume — know every bullet cold
- [ ] Practice "Tell me about yourself" out loud 3 times (90 seconds max)
- [ ] Practice Dive Deep story out loud 2 times
- [ ] Practice Ambiguity story out loud 2 times
- [ ] Practice CAD Design story out loud 2 times
- [ ] Review GD&T basics: position, MMC/LMC, datum frames, tolerance stackup
- [ ] Test Zoom link: https://amazon.zoom.us/j/96252182842?pwd=CBJzwvSlJaEjtjVPxKkzzdwwbP6aKk.1
- [ ] Charge laptop, test headset/mic
- [ ] Set out water glass

### Morning Of (Tuesday March 31)
- [ ] Review just the STAR stories (not the whole document — you don't want to sound rehearsed)
- [ ] Have resume printed or open on screen
- [ ] Have this prep doc open on a second tab (for questions to ask at the end)
- [ ] Join Zoom 5 min early (11:55 AM)
- [ ] Quiet room, no distractions, strong internet
- [ ] Water nearby

### During the Interview
- [ ] **Listen for LP signals** — when Stephen says "tell me about a time..." he's probing a specific LP
- [ ] **Use "I" not "we"** — Stephen wants YOUR contributions
- [ ] **2-3 minutes per answer** — not more
- [ ] **Lead with the result if you can** — "I reduced false failures from 15% to under 1% by diving into force data..."
- [ ] **It's okay to pause** — "That's a great question, let me think about the best example for a moment"
- [ ] **Don't be afraid to ask clarifying questions** — "Are you asking about the mechanical design decision or the vendor selection?"
- [ ] **Stephen will type during the call** — silences while he types are normal, don't fill them nervously

---

## Know These Numbers Cold

| Metric | Number | Context |
|--------|--------|---------|
| Test time reduction | 30 min → 10 min (67%) | Robot arm vs manual |
| Hours freed per year | 1,300+ | 75 panels/week × 20 min saved |
| Panels per week | 75 | Production throughput |
| Downtime reduction | 3 days/month → 30 min/6 months | Monitoring platform |
| ML accuracy | 92% | Defect detection model |
| Interns supervised | 5 over 2 years | AI + robotics projects |
| Service documents | 7+ | Test system documentation |
| Fixture revisions | 4+ | SolidWorks iterations |
| Sensor replacement cost | $750+ quarterly | Legacy machine crashes |
| False failure reduction | 15% → <1% | Thermal expansion root cause |
| FUTEK drift comparison | 3x more drift (competitor) | Vendor validation |
| Work Order Tracker | 80+ devices building-wide | Arduino IoT system |
| Robot arm cost | ~$15K total | UFactory 850 + peripherals |

---

## About the WWGS GRAS Team (know this context)

**What they build:**
- **ASRS** — Shuttle-based goods-to-person systems. Robotic shuttles on rails retrieve totes across temperature zones (ambient, chilled, frozen). 200-700 lines/hour. Major vendors: Knapp, Dematic, Swisslog, AutoStore, Exotec.
- **Manual Bag Sorters** — Semi-automated systems for sorting customer order bags by delivery route/window. Automated conveyance + manual final sorting.
- **Third-party portioning robots** — Robotic arms for portioning fresh food. Key company: Chef Robotics (AI-powered, 40M+ meals processed). Also: Marel, Vemag, Ishida.
- **Micro-fulfillment centers** — 10,000 sq ft automated centers inside existing stores (Whole Foods Plymouth Meeting pilot with Fulfil Solutions). 12,000+ unique items across all temperature zones.

**Key constraints unique to grocery:**
- Multi-temperature zones (ambient, chilled, frozen)
- Fresh food handling and spoilage reduction
- Food-safe materials and washdown environments
- High volume order profiles with perishable products
- Very different from standard Amazon FC automation

**Team culture keywords from the JD:**
- "Business impact over perfection"
- "Healthy skepticism toward vendor assertions"
- "Resilient enough to withstand demanding warehouse environments"
- "Building capacity" — growing team, they need people who can hit the ground running

---

## CRITICAL REMINDERS

1. **Stephen is the HIRING MANAGER** — this isn't just a screen, it's the person who decides if you join his team. Show him you'd be a strong, autonomous contributor.

2. **He builds data pipelines and dashboards** — your monitoring platform story will resonate deeply. Mention it naturally.

3. **"Skeptically review vendor assertions"** — this is their #1 job. Your FUTEK validation story IS the job they're hiring for. Make it shine.

4. **Don't use GenAI during the interview** — they explicitly warned about this. Your answers need to be natural and from memory.

5. **It's a PHONE screen** — slightly more relaxed than an onsite loop. Conversational tone is fine. But still structured STAR answers.

6. **Prepare for 3-4 questions total** — a 45-60 min interview with intro and questions-for-you time means 3-4 behavioral/technical questions, each with 2-3 follow-ups.

7. **Use Amazon LP language naturally** — don't say "I demonstrated Dive Deep." Instead, just tell the story and let the LP speak for itself.
