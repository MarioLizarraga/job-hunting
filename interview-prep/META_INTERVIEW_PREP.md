# Meta Interview Prep Guide — Mario Lizarraga

## How Meta's Hiring Process Works (Hardware/Robotics Roles)

### Timeline: 4–8 weeks typically

1. **Resume Screen** (~90% of applicants are eliminated here)
   - ATS keyword matching + recruiter scan
   - Your resume gets ~6 seconds of human attention
   - Key: match job title keywords, quantify impact, show progression

2. **Recruiter Call** (30 min)
   - "Tell me about yourself" — have a 2-minute pitch ready
   - Why Meta? Why this role? Why now?
   - They're checking: communication, motivation, culture fit
   - Ask smart questions (see below)

3. **Technical Phone Screen** (45–60 min)
   - For hardware/robotics: expect design problems, troubleshooting scenarios
   - "Walk me through how you'd design a test fixture for X"
   - "A robot arm is consistently missing its target by 2mm — how do you debug this?"
   - They want structured thinking, not just the answer

4. **On-Site Loop** (4–5 interviews in one day)
   - **Technical Design** (1–2 rounds): Mechanical/electrical design problems
   - **System Design**: "Design an automated inspection system for..."
   - **Behavioral** (1 round, 45 min): See below
   - **Coding** (for some roles): Python problem-solving, may include AI-assisted round

5. **Debrief + Hiring Committee**
   - Interviewers submit independent written feedback
   - Hiring committee makes decision (you don't talk to them)

6. **Offer/Negotiation**

---

## Meta's Core Values (Weave These Into Every Answer)

| Value | What It Means | Your Story |
|-------|--------------|------------|
| **Move Fast** | Ship, iterate, don't over-plan | You built the robot arm test system and had it running in production — iterating through prototypes rapidly |
| **Focus on Impact** | Prioritize what matters most | You were hired to automate a manual facility — you picked the highest-ROI projects first |
| **Be Bold** | Take risks, try new approaches | You proposed and built systems nobody at IDD had done before (ML defect detection, robotic testing) |
| **Be Open** | Share information, give/receive feedback | You documented everything (7+ docs), mentored interns, collaborated cross-functionally |
| **Build Social Value** | Make the world better | Aerospace safety — your products go in cockpits, your inspection systems catch defects that matter |

---

## Behavioral Interview (STAR Method)

Meta's behavioral interview is 45 minutes and focuses on past experiences. Use STAR: **Situation, Task, Action, Result**.

### Common Questions + Your Prepared Stories

**1. "Tell me about a time you had to work in an ambiguous environment."**
> STAR: When you started at Safran/IDD, there was no automation roadmap. No existing systems, no precedent. You had to assess the entire manufacturing floor, identify which processes had the biggest manual bottleneck, prioritize, and build systems from scratch. Result: robot arm tester, gantry inspection system, paint cure monitor — all now in production use.

**2. "Tell me about a time you disagreed with someone."**
> STAR: Think of a time where you pushed for a technical approach that wasn't obvious (e.g., using a robot arm vs. a simpler manual fixture, or choosing YOLO over a rule-based vision system). Show you presented data, listened to the other perspective, and reached a resolution.

**3. "Tell me about a time you failed."**
> STAR: Early iterations of the force curve algorithm that didn't work — the signal was too noisy, the first approach (simple thresholding) failed on certain switch types. You iterated through multiple smoothing strategies (median, Savitzky-Golay, multi-scale) and developed the adaptive retry system. Show humility + systematic debugging.

**4. "Tell me about a time you showed leadership."**
> STAR: Mentoring 5 interns across 2 concurrent projects. Define scope, review deliverables, unblock them technically, manage their learning curve. Also: organizing the NASA Space Apps Challenge for 175+ people.

**5. "Tell me about your most impactful project."**
> STAR: The robot arm switch tester. Quantify: replaced manual testing for 200+ switch variants, zero safety incidents, comprehensive documentation enabling other engineers to maintain it. End-to-end ownership from concept to production.

**6. "Why Meta?"**
> "I've spent the last three years building robotic and automated inspection systems in aerospace, and I've seen firsthand how much impact the right automation has on quality and throughput. Meta's robotics work is at a scale and pace that I find genuinely exciting — the hardware is still being invented, the problems are real, and the team is building things that haven't been done before. I want to work where the systems I build have that kind of reach, and where I can grow as an engineer alongside people pushing the state of the art."

**7. "Why are you leaving your current role?"**
> Frame positively: "I've built the automation program at IDD from the ground up and I'm proud of what we've shipped. But I'm looking for a team where robotics is the core product, not a support function — where I can go deeper on the electromechanical and systems challenges and work alongside a larger engineering team solving harder problems."

---

## Technical Interview Prep

### For Field Service Engineer
Be ready to whiteboard/discuss:
- **Troubleshooting methodology**: How do you systematically isolate a failure in a robotic system? (Electrical → mechanical → firmware → software)
- **Root cause analysis**: Given symptoms X, Y, Z — what's your diagnostic tree?
- **Fleet management**: How would you track failures across 50 deployed robots? What metrics matter? (MTBF, MTTR, failure pareto)
- **DFM feedback**: You find a part that keeps failing in the field — how do you communicate this back to the design team?

### For Research Engineer, Robotics
Be ready to discuss:
- **Mechanism design**: How would you design a gripper/end-effector for task X?
- **Sensor integration**: Trade-offs between different force sensors, encoders, proximity sensors
- **Prototyping strategy**: When to 3D print vs. machine vs. buy off-the-shelf
- **Embedded systems**: How do you architect communication between a sensor, microcontroller, and host PC?

### For Mechanical Design / Test & Measurement
Be ready to discuss:
- **Test fixture design**: How would you design a fixture to apply a specific load profile to a component?
- **Instrumentation**: Selecting sensors, sampling rates, data acquisition systems
- **GD&T**: Read and apply callouts on a drawing
- **FEA basics**: When to use it, what types of analysis, how to validate results

---

## Questions to Ask Your Interviewers

These show genuine interest and help you evaluate fit:

- "What does the robotics fleet look like today? How many platforms, how many deployed?"
- "What's the biggest reliability challenge the team is facing right now?"
- "How does the team balance speed of deployment vs. thorough qualification?"
- "What does a typical week look like for someone in this role?"
- "How does field feedback get incorporated back into the design cycle?"
- "What's the ratio of planned work vs. reactive firefighting?"
- "What tools/systems does the team use for failure tracking and fleet health?"

---

## Application Tips

1. **Apply through metacareers.com directly** — don't rely on third-party boards
2. **Submit .docx format** for best ATS parsing
3. **Tailor the resume for each role** — use the three versions I created
4. **Apply to all 4 roles** — Meta's system allows multiple applications, and teams can see cross-applications
5. **Connect with Meta recruiters on LinkedIn** after applying — a short, specific message referencing the role ID
6. **Timeline**: The Field Service Engineer deadline is April 17, 2026 — apply this week
7. **Referral**: If you know anyone at Meta, even loosely, ask for a referral. Referred candidates are 4x more likely to get an interview.

---

## LinkedIn Quick Wins Before Applying

Your LinkedIn (linkedin.com/in/mario-lizarraga) should mirror your strongest resume. Quick fixes:
- Update your headline to something like: "Automation Engineer | Robotics | Machine Vision | Aerospace"
- Expand your About section with your 2-minute pitch (see "Why Meta" above but more personal)
- Add the robot arm project, gantry system, and paint cure monitor as discrete projects
- Add the NASA Space Apps Challenge as a volunteer experience
- Make sure your Safran role bullet points match the depth of your resume bullets
