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

**How I'd actually say it (conversational version):**
> "So we had this robot arm test system I'd built at Safran — it uses a UFactory 850 arm with a FUTEK load cell to test illuminated cockpit panels. It was working great for months, but then about 15% of panels started randomly failing when they shouldn't have. The technicians kept telling me to just recalibrate the robot, but something didn't feel right — if it were a calibration issue, it should've affected all panels equally, not randomly.
>
> So instead of recalibrating, I pulled two full weeks of force data into Python and really dug into it. I used SciPy — Savitzky-Golay smoothing, peak detection — and plotted every single press cycle color-coded by pass/fail, time of day, fixture position. And this clear pattern popped out: the failures were spiking in the afternoon. Not random at all.
>
> I cross-referenced that with temperature logs from our monitoring platform, and it clicked — the 3D-printed fixture was thermally expanding. The afternoon sun heats up that side of the shop floor, and the fixture was shifting about 0.3 millimeters. That's enough to throw off the force readings and trigger false failures.
>
> So the root cause wasn't calibration at all — it was material choice. I switched to a material with lower thermal expansion, and false failures dropped from 15% to under 1%. If I'd just recalibrated like everyone wanted, we'd honestly still be chasing that problem every week."

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

**How I'd actually say it (conversational version):**
> "When I was picking the force sensor for our robot arm system, I evaluated three vendors. FUTEK was claiming sub-Newton accuracy and millisecond response, which sounded great on paper. But I've learned not to trust spec sheets — vendors have every incentive to show their product in the best possible light.
>
> So I ordered evaluation units from FUTEK and one of their competitors, and I designed a head-to-head test. I applied calibrated masses at different rates, checked linearity, repeatability, and — this was the big one — thermal drift. Because our shop floor has real temperature swings throughout the day, and I'd already learned the hard way that temperature matters in our environment.
>
> FUTEK's sensor performed exactly as advertised. The competitor showed about three times more drift at elevated temperatures. That was the deciding factor — in our environment, that drift would've caused measurement errors.
>
> So the data justified FUTEK's 40% price premium. I also negotiated volume pricing and a spare parts agreement while I was at it. I did the same kind of independent validation for the robot arm itself — tested repeatability at our actual press forces, verified the Python SDK, and stress-tested for 10,000 cycles before I committed to production deployment. I just don't put things into production that I haven't validated myself."

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

**How I'd actually say it (conversational version):**
> "So I had to pick the robot arm for our test system, and it came down to a UFactory 850 cobot versus a more expensive Fanuc. The Fanuc was the 'safe' choice — bigger brand, more documentation, better support — but it cost about $15K more. And the budget cycle was closing in three days, so I couldn't do a months-long evaluation.
>
> I couldn't test both robots in that timeframe. So I asked myself: what actually matters for this application? Three things — force accuracy at our working range, a Python SDK so I could develop fast, and total cost including all the peripherals. Our use case was pretty straightforward — pick-and-press motions, not complex path planning — so the UFactory's specs were well within what we needed. And that $15K in savings? That funded the FUTEK sensors and the STM32 hardware, which we needed no matter which robot we chose.
>
> I accepted the risk of less community support because I could mitigate it — I committed to documenting every integration issue as I went, basically building our own knowledge base. And honestly, the system has been running reliably in production. The decision worked because I matched the tool to the actual requirements instead of going with what felt safest. Sometimes you have to act with 70% of the information rather than waiting for 100%."

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

**How I'd actually say it (conversational version):**
> "When I was hired at Safran, there was literally no specification for what the automated test system should do. No requirements document, no test protocol — the legacy equipment barely worked, and nobody had ever documented what it actually tested or why. Just tribal knowledge with the technicians.
>
> So I had a choice — I could spend months trying to get formal requirements signed off through the aerospace quality process, or I could go figure it out myself. I chose to go observe. I sat with the technicians for a full week, just watching them test panels manually. Every step, every measurement, every judgment call — I documented all of it. Then I reverse-engineered the actual requirements from what they were doing: force limits, travel limits, continuity thresholds.
>
> Rather than waiting for a perfect spec, I shipped an 80% version in about six weeks. It handled the most common panel types automatically. I ran it in parallel with the manual process to validate — compared 100 panels side by side, got 99% agreement. That told me my self-defined requirements matched reality. Then I iterated over the following months to cover the remaining panel types.
>
> We went from zero spec to a production system in under three months. Test time dropped 67%, freed over 1,300 hours per year. The lesson for me was: when requirements don't exist, don't wait for someone to write them. Go observe the actual work, define your own spec, and iterate fast."

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

**How I'd actually say it (conversational version):**
> "So at Safran, we make illuminated cockpit panels — each one has a completely different switch layout. The robot arm needs sub-millimeter alignment to press each switch accurately and get reliable force measurements. The obvious approach would've been to machine a custom fixture for every panel type, but that would've meant dozens of fixtures, each costing hundreds of dollars with weeks of lead time.
>
> Instead, I designed a modular system in SolidWorks. There's a universal base plate with precision locating features that handles the robot-to-fixture alignment, and then small swappable adapter plates for each panel type that handle the panel-to-fixture alignment. So you get the precision of a custom fixture with the flexibility of a modular system.
>
> I went through four-plus design revisions, and each one taught me something. The first version was FDM printed — worked okay but the layer lines created inconsistent mating surfaces, so alignment wasn't reliable enough. Rev 2 I switched to SLA printing, much better surface finish, and that's where I first hit sub-millimeter accuracy. Rev 3 I added alignment pins and kinematic locating features for repeatable adapter mounting. And Rev 4 was the material change — that was after I discovered the thermal expansion issue during production, where the afternoon heat was causing dimensional shift.
>
> Each revision was driven by test data — I measured dimensional accuracy after 500, 1,000, 2,000 cycles and tracked degradation. The final design gives us sub-millimeter repeatability across all panel types. And because each adapter is just a small flat plate with a few locating holes, I can support a brand-new panel type in hours instead of weeks. That's a huge deal in aerospace where we're constantly getting new panel designs from customers."

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

## HOW THE SCORING WORKS (from research)

**Rating scale:**
- **Strongly Inclined** — Clear hire, exceeds the bar
- **Inclined** — Passed, should get an offer
- **Neutral** — Neither for nor against
- **Not Inclined** — Did not pass
- **Strongly Not Inclined** — Reserved for serious issues (fabrication, ethics)

**What makes someone "Not Inclined" on Dive Deep:**
- Surface-level answers without analytical rigor
- Can't explain the "how" of problem-solving
- Vague language ("we improved things") instead of specific data
- Can't go deeper when probed with follow-ups
- No root cause analysis or skepticism of initial assumptions

**What separates "Strong Hire" from "Inclined":**
- Multiple layers of depth + specific metrics
- Clear personal ownership ("I" not "we")
- Excitement about problem-solving (interviewers love when you get visibly engaged going 4-5 levels deep)
- Research turned into measurable action
- Lessons learned applied forward

---

## PHONE SCREEN FORMAT (from research)

- **4-6 questions total** in 45-60 min (not 3-4 as I originally said)
- **7-11 minutes per question** including follow-ups
- Your initial STAR response: **2-3 minutes**
- Then 2-3 follow-up probes per story
- Brief intro/rapport: 2-5 min
- Your questions for Stephen: 5 min at end

**Stephen as Hiring Manager (HM) — what this means:**
1. **He has VETO POWER** — even if every loop interviewer says hire, Stephen can block it
2. **He evaluates holistic team fit**, not just one LP — loop interviewers get assigned specific LPs, Stephen takes the full picture
3. **He knows exactly what gaps the team has** — his questions are designed around the actual work
4. **If Stephen is not inclined, there is NO loop** — this is pass/fail for advancing
5. **His style may be more conversational** than a loop interviewer's rigid LP assessment
6. **He's thinking long-term** — "will this person grow with us?" not just "can they do the job today?"

---

## COMMON MISTAKES TO AVOID (from Amazon's own recruiters)

1. **Failing to include enough data** — Replace vague with specific, quantifiable information
2. **Using "we" instead of "I"** — Interviewers CANNOT assess YOUR impact if you say "we"
3. **Not using STAR** — Interviewers need to follow your story structure
4. **Freezing or rambling** — Keep answers under 3 minutes, then let follow-ups guide you deeper
5. **Failing to ask questions** — Always have 3-4 prepared. Shows genuine interest.
6. **Not preparing for follow-up probes** — Know your top stories well enough to discuss for 20 minutes each

**How to handle "tell me more" probes:**
- Don't get flustered — follow-ups mean the interviewer is ENGAGED (good sign)
- Switch from "we" to "I" and clarify your specific role
- Include trade-offs, constraints, and what you'd do differently
- Use timeline markers and specific numbers

---

## CRITICAL REMINDERS

1. **Stephen is the HIRING MANAGER** — this isn't just a screen, it's the person who decides if you join his team. He has veto power. Show him you'd be a strong, autonomous contributor.

2. **He builds data pipelines and dashboards** — your monitoring platform story will resonate deeply. Mention it naturally.

3. **"Skeptically review vendor assertions"** — this is their #1 job. Your FUTEK validation story IS the job they're hiring for. Make it shine.

4. **Don't use GenAI during the interview** — they explicitly warned about this. Your answers need to be natural and from memory.

5. **It's a PHONE screen** — slightly more relaxed than an onsite loop. Conversational tone is fine. But still structured STAR answers.

6. **Prepare for 4-6 questions total** — each with 2-3 follow-ups. Quality and depth matter more than covering many stories.

7. **Use Amazon LP language naturally** — don't say "I demonstrated Dive Deep." Just tell the story and let the LP speak for itself.

8. **Get visibly excited when diving deep** — interviewers LOVE when candidates get engaged going 4-5 levels deep into a problem. Your thermal expansion story is perfect for this — show the excitement of the detective work.
