"""
Resume PDF Generator v2 — Expert-level, recruiter-optimized, single-page resumes.

Design principles (based on recruiter eye-tracking studies and FAANG hiring practices):
  - Body: 10.5pt Helvetica, 12pt leading (readable, professional standard)
  - Name: 18pt bold (prominent but not wasteful)
  - Section headers: 11pt bold ALL CAPS dark blue with thin rule underneath
  - Job title left-aligned, dates right-aligned on same line
  - Company: 9pt italic gray (clear visual separation from title)
  - Body text: #333333 charcoal (softer than pure black, more polished)
  - Accent: #1B365D dark navy (universally professional)
  - Margins: 0.5" left/right, 0.4" top/bottom
  - Section separators: 0.5pt accent-colored rules under headers
  - ATS-safe: no complex tables, no columns, no graphics
  - Single page target verified programmatically
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from PyPDF2 import PdfReader
import os

# ─── Colors ───────────────────────────────────────────────────────────
NAVY = HexColor("#1B365D")       # accent — section headers, rules
CHARCOAL = HexColor("#333333")   # body text (softer than pure black)
DARK_GRAY = HexColor("#4A4A4A")  # secondary text (dates, locations)
MID_GRAY = HexColor("#666666")   # company names

# ─── Page dimensions ─────────────────────────────────────────────────
PAGE_W, PAGE_H = letter
MARGIN_LR = 0.5 * inch
MARGIN_TOP = 0.4 * inch
MARGIN_BOT = 0.4 * inch
TEXT_WIDTH = PAGE_W - 2 * MARGIN_LR


def create_styles():
    """Build all paragraph styles with professional typography."""
    s = {}

    # ── Name ──
    s['name'] = ParagraphStyle(
        'Name',
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=21,
        alignment=TA_CENTER,
        textColor=CHARCOAL,
        spaceAfter=1,
    )

    # ── Contact line ──
    s['contact'] = ParagraphStyle(
        'Contact',
        fontName='Helvetica',
        fontSize=9,
        leading=11,
        alignment=TA_CENTER,
        textColor=DARK_GRAY,
        spaceAfter=2,
    )

    # ── Section headers (EXPERIENCE, EDUCATION, etc.) ──
    s['section'] = ParagraphStyle(
        'Section',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=13,
        textColor=NAVY,
        spaceBefore=7,
        spaceAfter=0,
    )

    # ── Professional summary body ──
    s['summary'] = ParagraphStyle(
        'Summary',
        fontName='Helvetica',
        fontSize=10.5,
        leading=12.5,
        textColor=CHARCOAL,
        spaceAfter=0,
    )

    # ── Job title (left side of header row) ──
    s['job_title'] = ParagraphStyle(
        'JobTitle',
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=12,
        textColor=CHARCOAL,
    )

    # ── Dates (right side of header row) ──
    s['dates'] = ParagraphStyle(
        'Dates',
        fontName='Helvetica',
        fontSize=10,
        leading=12,
        textColor=DARK_GRAY,
        alignment=TA_RIGHT,
    )

    # ── Company name ──
    s['company'] = ParagraphStyle(
        'Company',
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=11,
        textColor=MID_GRAY,
        spaceAfter=1,
    )

    # ── Bullet points ──
    s['bullet'] = ParagraphStyle(
        'Bullet',
        fontName='Helvetica',
        fontSize=10.5,
        leading=12,
        textColor=CHARCOAL,
        leftIndent=14,
        firstLineIndent=-14,
        spaceAfter=1.5,
    )

    # ── Education lines ──
    s['edu'] = ParagraphStyle(
        'Education',
        fontName='Helvetica',
        fontSize=10,
        leading=12,
        textColor=CHARCOAL,
        spaceAfter=1,
    )

    # ── Skills lines ──
    s['skills'] = ParagraphStyle(
        'Skills',
        fontName='Helvetica',
        fontSize=9.5,
        leading=11.5,
        textColor=CHARCOAL,
        spaceAfter=1,
    )

    # ── Certifications / Languages ──
    s['certs'] = ParagraphStyle(
        'Certs',
        fontName='Helvetica',
        fontSize=9.5,
        leading=11.5,
        textColor=CHARCOAL,
        spaceAfter=0.5,
    )

    return s


def section_header(title):
    """Return a section header paragraph + thin rule underneath."""
    s = create_styles()
    return [
        Paragraph(title, s['section']),
        HRFlowable(
            width="100%",
            thickness=0.5,
            color=NAVY,
            spaceBefore=1,
            spaceAfter=3,
        ),
    ]


def job_entry(title, dates, company):
    """Return a job title row (left-aligned title, right-aligned dates) + company."""
    s = create_styles()

    # Simple two-column table for title | dates alignment
    title_p = Paragraph(title, s['job_title'])
    dates_p = Paragraph(dates, s['dates'])

    t = Table(
        [[title_p, dates_p]],
        colWidths=[TEXT_WIDTH * 0.68, TEXT_WIDTH * 0.32],
    )
    t.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'BOTTOM'),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))

    company_p = Paragraph(company, s['company'])
    return [Spacer(1, 3), t, company_p]


def bullet(text, styles):
    """Return a single bullet point paragraph."""
    return Paragraph(f"\u2022  {text}", styles['bullet'])


def make_doc(output_path):
    """Create a SimpleDocTemplate with standard margins."""
    return SimpleDocTemplate(
        output_path,
        pagesize=letter,
        topMargin=MARGIN_TOP,
        bottomMargin=MARGIN_BOT,
        leftMargin=MARGIN_LR,
        rightMargin=MARGIN_LR,
    )


def header_block(styles):
    """Return the name + contact + rule block (shared across all versions)."""
    return [
        Paragraph("Mario Alejandro Lizarraga Tolentino", styles['name']),
        Paragraph(
            'Redmond, WA  \u00b7  +1 (425) 543-7328  \u00b7  mario.lizarragat@gmail.com  \u00b7  '
            'linkedin.com/in/mario-lizarraga',
            styles['contact'],
        ),
        HRFlowable(width="100%", thickness=1, color=NAVY, spaceBefore=2, spaceAfter=2),
    ]


def verify_one_page(path):
    """Verify the PDF is exactly one page. Raise if not."""
    reader = PdfReader(path)
    pages = len(reader.pages)
    if pages != 1:
        raise ValueError(f"{os.path.basename(path)} is {pages} pages — must be 1!")
    return True


# ═══════════════════════════════════════════════════════════════════════
#  V1: Field Service Engineer
# ═══════════════════════════════════════════════════════════════════════

def build_field_service(output_path):
    doc = make_doc(output_path)
    s = create_styles()
    story = []

    # Header
    story.extend(header_block(s))

    # Summary
    story.extend(section_header("PROFESSIONAL SUMMARY"))
    story.append(Paragraph(
        "Automation engineer with 7+ years troubleshooting electro-mechanical systems in robotics "
        "and aerospace. Built a robotic test platform that cut cycle time by 67% and freed 1,300+ "
        "hours/year of manual labor. Own the full lifecycle \u2014 design, deploy, monitor, fix, improve. "
        "Willing to travel extensively.",
        s['summary'],
    ))

    # Experience
    story.extend(section_header("EXPERIENCE"))

    # Safran
    story.extend(job_entry(
        "Automation Engineer II",
        "Feb 2023 \u2013 Present",
        "Safran Electronics &amp; Defense \u2014 Redmond, WA",
    ))
    for b in [
        "Built and maintained a UFactory 850 robotic test system \u2014 troubleshot field failures "
        "across mechanical, electrical, firmware, and software subsystems and interfaces, cutting "
        "test time by 67% and freeing 25+ hrs/week",

        "Conducted failure analysis on force sensor data, identified root causes of recurring "
        "failures, and drove cross-functional corrective actions with manufacturing and operations",

        "Supervised 5 interns on AI defect detection and robotics \u2014 delivered a 92% accuracy "
        "ML model and hardware prototype for vision-based inspection",

        "Created 7+ service documents (setup, calibration, troubleshooting, failure modes), "
        "enabling field technicians to maintain deployed systems independently",

        "Designed test fixtures and end-effectors via iterative prototyping (SolidWorks, 3D "
        "printing), applying DFM/DFA principles with spares strategy",
    ]:
        story.append(bullet(b, s))

    # Jenton
    story.extend(job_entry(
        "Automation &amp; Design Engineer",
        "Nov 2021 \u2013 Dec 2022",
        "Jenton International \u2014 Whitchurch, UK",
    ))
    for b in [
        "Designed and commissioned custom automation equipment \u2014 mechanical layout, pneumatics, "
        "subsystem integration for manufacturing process lines",
        "Troubleshot electro-mechanical issues during build and commissioning, resolving fitment, "
        "wiring, and alignment problems in collaboration with operations teams",
    ]:
        story.append(bullet(b, s))

    # Honeywell
    story.extend(job_entry(
        "Design Engineer",
        "Jun 2019 \u2013 Sep 2020",
        "Honeywell Aerospace \u2014 Mexicali, MX",
    ))
    for b in [
        "Designed aerospace components in CATIA V5 for engine/APU systems, applying GD&amp;T and "
        "tolerance analysis",
        "Supported DFM/DFA reviews with casting and CNC suppliers, driving corrective actions "
        "before production release",
    ]:
        story.append(bullet(b, s))

    # El Garage
    story.extend(job_entry(
        "AR/VR Project Engineer",
        "Jul 2017 \u2013 Oct 2019",
        "El Garage Project Hub \u2014 Mexicali, MX",
    ))
    story.append(bullet(
        "Led the inaugural NASA Space Apps Challenge in Mexicali (175+ participants) and taught "
        "hands-on robotics workshops to 50+ students",
        s,
    ))

    # Education
    story.extend(section_header("EDUCATION"))
    story.append(Paragraph(
        "<b>MSc Space Systems Engineering</b> (Merit) \u2014 University of Southampton, UK  |  2020 \u2013 2021",
        s['edu'],
    ))
    story.append(Paragraph(
        "<b>BSc Mechatronics Engineering</b> (Magna Cum Laude, 96.36) \u2014 CETYS Universidad, Mexico  |  2013 \u2013 2017",
        s['edu'],
    ))

    # Skills
    story.extend(section_header("SKILLS"))
    for sk in [
        "<b>Robotics &amp; Electro-Mechanical:</b> robot arm troubleshooting, gantry systems, sensors "
        "(force, temp, vibration), actuators, PLC, relay circuits, serial/I2C, fleet maintenance, "
        "MTBF/MTTR, preventative maintenance",

        "<b>Technical:</b> Python, C (STM32), SQL, Git, SolidWorks, CATIA V5, Autodesk Inventor, "
        "Arduino, Raspberry Pi, Linux",

        "<b>Methods:</b> failure analysis, root cause analysis, DFM/DFA, GD&amp;T, machine learning, "
        "computer vision",
    ]:
        story.append(Paragraph(sk, s['skills']))

    # Certifications & Languages
    story.extend(section_header("CERTIFICATIONS &amp; LANGUAGES"))
    story.append(Paragraph(
        "Six Sigma Green Belt DFSS \u2014 Honeywell  |  CATIA V5 Expert \u2014 Dassault  |  "
        "GD&amp;T \u2014 Applied Geometrics",
        s['certs'],
    ))
    story.append(Paragraph("English (fluent)  |  Spanish (native)", s['certs']))

    doc.build(story)
    verify_one_page(output_path)
    return output_path


# ═══════════════════════════════════════════════════════════════════════
#  V2: Research Engineer, Robotics
# ═══════════════════════════════════════════════════════════════════════

def build_research_engineer(output_path):
    doc = make_doc(output_path)
    s = create_styles()
    story = []

    story.extend(header_block(s))

    # Summary
    story.extend(section_header("PROFESSIONAL SUMMARY"))
    story.append(Paragraph(
        "Mechatronics engineer with 7+ years designing electromechanical systems, writing embedded "
        "firmware, and building robotic prototypes in aerospace. Took a robotic test platform from "
        "whiteboard to production \u2014 cut cycle time by 67% and freed 1,300+ hrs/year. MSc in Space "
        "Systems Engineering (Mars Rover and CubeSat mechanisms).",
        s['summary'],
    ))

    # Experience
    story.extend(section_header("EXPERIENCE"))

    # Safran
    story.extend(job_entry(
        "Automation Engineer II",
        "Feb 2023 \u2013 Present",
        "Safran Electronics &amp; Defense \u2014 Redmond, WA",
    ))
    for b in [
        "Designed and built a robotic test platform \u2014 UFactory 850 arm, FUTEK USB520 load cell, "
        "3D-printed fixtures, STM32 continuity tester \u2014 cutting test time by 67% across 75 panels/week",

        "Wrote STM32 firmware in C for a custom continuity board \u2014 serial comms, signal "
        "acquisition, debounce logic for real-time validation during robot press cycles",

        "Modeled and iterated test fixtures and end-effectors in SolidWorks \u2014 sub-millimeter "
        "alignment through 4+ revisions (FDM/SLA)",

        "Developed a multi-axis gantry (X, Y, Z, rotation) for automated panel inspection \u2014 "
        "mechanical layout, motion control, DSLR integration",

        "Supervised 5 interns on AI defect detection and robotics \u2014 delivered a 92% accuracy "
        "ML model and hardware prototype for vision-based inspection",
    ]:
        story.append(bullet(b, s))

    # Jenton
    story.extend(job_entry(
        "Automation &amp; Design Engineer",
        "Nov 2021 \u2013 Dec 2022",
        "Jenton International \u2014 Whitchurch, UK",
    ))
    for b in [
        "Designed custom automation machinery in Autodesk Inventor \u2014 mechanical layouts, "
        "pneumatics, electromechanical assemblies",
        "Built and commissioned equipment on the shop floor, diagnosing mechanical, electrical, "
        "and sensor issues",
    ]:
        story.append(bullet(b, s))

    # Honeywell
    story.extend(job_entry(
        "Design Engineer",
        "Jun 2019 \u2013 Sep 2020",
        "Honeywell Aerospace \u2014 Mexicali, MX",
    ))
    for b in [
        "Designed jet engine APU components in CATIA V5, applying GD&amp;T per ASME Y14.5 and "
        "tolerance stackup analysis",
        "Completed Six Sigma Green Belt DFSS \u2014 applied DOE and statistical methods to "
        "tolerance analysis",
    ]:
        story.append(bullet(b, s))

    # El Garage
    story.extend(job_entry(
        "AR/VR Project Engineer",
        "Jul 2017 \u2013 Oct 2019",
        "El Garage Project Hub \u2014 Mexicali, MX",
    ))
    story.append(bullet(
        "Led the NASA Space Apps Challenge (175+ participants); built AR/VR prototypes in Unity (C#) "
        "and taught robotics workshops to 50+ students",
        s,
    ))

    # Education
    story.extend(section_header("EDUCATION"))
    story.append(Paragraph(
        "<b>MSc Space Systems Engineering</b> (Merit) \u2014 University of Southampton, UK  |  2020 \u2013 2021",
        s['edu'],
    ))
    story.append(Paragraph(
        "<b>BSc Mechatronics Engineering</b> (Magna Cum Laude, 96.36) \u2014 CETYS Universidad, Mexico  |  2013 \u2013 2017",
        s['edu'],
    ))

    # Skills
    story.extend(section_header("SKILLS"))
    for sk in [
        "<b>Design &amp; Prototyping:</b> fixture/end-effector design, mechanism design, 3D printing "
        "(FDM/SLA), CNC awareness, sheet metal",

        "<b>Electromechanical:</b> robot arm integration (xArm SDK), force sensors (FUTEK), vibration "
        "measurement, I2C/SPI/UART",

        "<b>Technical:</b> STM32 (C), Python, SciPy, OpenCV, SQL, Git, SolidWorks, CATIA V5, "
        "Autodesk Inventor, Arduino, Raspberry Pi",

        "<b>Methods:</b> GD&amp;T, tolerance analysis, DFM/DFA, Six Sigma DFSS, machine learning, "
        "computer vision",
    ]:
        story.append(Paragraph(sk, s['skills']))

    # Certifications & Languages
    story.extend(section_header("CERTIFICATIONS &amp; LANGUAGES"))
    story.append(Paragraph(
        "CATIA V5 Expert \u2014 Dassault  |  Six Sigma Green Belt DFSS \u2014 Honeywell  |  "
        "GD&amp;T \u2014 Applied Geometrics",
        s['certs'],
    ))
    story.append(Paragraph("English (fluent)  |  Spanish (native)", s['certs']))

    doc.build(story)
    verify_one_page(output_path)
    return output_path


# ═══════════════════════════════════════════════════════════════════════
#  V3: Mechanical Design Engineer
# ═══════════════════════════════════════════════════════════════════════

def build_mech_design(output_path):
    doc = make_doc(output_path)
    s = create_styles()
    story = []

    story.extend(header_block(s))

    # Summary
    story.extend(section_header("PROFESSIONAL SUMMARY"))
    story.append(Paragraph(
        "Mechanical design engineer with 7+ years in aerospace, robotics, and custom machinery. "
        "Designed test fixtures and instrumentation that cut cycle time by 67% across 75 panels/week. "
        "From CATIA V5 part design at Honeywell to robotic test systems and inspection gantries at "
        "Safran. Certified CATIA V5 Expert, GD&amp;T trained, Six Sigma Green Belt DFSS.",
        s['summary'],
    ))

    # Experience
    story.extend(section_header("EXPERIENCE"))

    # Safran
    story.extend(job_entry(
        "Automation Engineer II",
        "Feb 2023 \u2013 Present",
        "Safran Electronics &amp; Defense \u2014 Redmond, WA",
    ))
    for b in [
        "Designed test fixtures and end-effectors in SolidWorks \u2014 4+ prototype revisions "
        "(3D printing), sub-millimeter alignment under cyclic loads, enabling 67% reduction in "
        "per-panel test time",

        "Instrumented test platform with FUTEK USB520 load cell for force-vs-displacement capture; "
        "built Python pipeline (SciPy) to extract peak force, travel, and inflection points",

        "Installed accelerometers on fixtures, conducted vibration measurement to establish dynamic "
        "load profiles and validate design improvements",

        "Designed a multi-axis gantry (X, Y, Z, rotation) for automated panel inspection \u2014 "
        "mechanical layout, camera mounting, motion control",

        "Supervised 5 interns on AI defect detection and robotics \u2014 delivered a 92% accuracy "
        "ML model and hardware prototype",
    ]:
        story.append(bullet(b, s))

    # Jenton
    story.extend(job_entry(
        "Automation &amp; Design Engineer",
        "Nov 2021 \u2013 Dec 2022",
        "Jenton International \u2014 Whitchurch, UK",
    ))
    for b in [
        "Designed custom manufacturing equipment in Autodesk Inventor \u2014 mechanical layouts, "
        "pneumatics, guarding",
        "Produced manufacturing drawings with full GD&amp;T callouts, coordinating with suppliers "
        "on materials and tolerances",
    ]:
        story.append(bullet(b, s))

    # Honeywell
    story.extend(job_entry(
        "Design Engineer",
        "Jun 2019 \u2013 Sep 2020",
        "Honeywell Aerospace \u2014 Mexicali, MX",
    ))
    for b in [
        "Designed jet engine APU components in CATIA V5, applying GD&amp;T per ASME Y14.5 and "
        "tolerance stackup for cast and CNC parts in high-vibration environments",
        "Led DFM/DFA reviews with suppliers; completed Six Sigma Green Belt DFSS (DOE, statistical "
        "tolerance analysis)",
    ]:
        story.append(bullet(b, s))

    # El Garage
    story.extend(job_entry(
        "AR/VR Project Engineer",
        "Jul 2017 \u2013 Oct 2019",
        "El Garage Project Hub \u2014 Mexicali, MX",
    ))
    story.append(bullet(
        "Designed a 3D-printed 6-DOF robotic arm and led the NASA Space Apps Challenge in Mexicali "
        "(175+ participants)",
        s,
    ))

    # Education
    story.extend(section_header("EDUCATION"))
    story.append(Paragraph(
        "<b>MSc Space Systems Engineering</b> (Merit) \u2014 University of Southampton, UK  |  2020 \u2013 2021",
        s['edu'],
    ))
    story.append(Paragraph(
        "<b>BSc Mechatronics Engineering</b> (Magna Cum Laude, 96.36) \u2014 CETYS Universidad, Mexico  |  2013 \u2013 2017",
        s['edu'],
    ))

    # Skills
    story.extend(section_header("SKILLS"))
    for sk in [
        "<b>CAD:</b> CATIA V5 (certified expert), SolidWorks, Autodesk Inventor, Siemens NX",

        "<b>Design &amp; Test:</b> GD&amp;T (ASME Y14.5), tolerance stackup, DFM/DFA, fixture design, "
        "force sensors, accelerometers, vibration measurement",

        "<b>Prototyping:</b> 3D printing (FDM/SLA), CNC awareness, sheet metal, casting",

        "<b>Technical:</b> Python (SciPy, OpenCV), MATLAB, SQL, C (STM32), Git, Arduino, Raspberry Pi",
    ]:
        story.append(Paragraph(sk, s['skills']))

    # Certifications & Languages
    story.extend(section_header("CERTIFICATIONS &amp; LANGUAGES"))
    story.append(Paragraph(
        "CATIA V5 Expert \u2014 Dassault  |  Six Sigma Green Belt DFSS \u2014 Honeywell  |  "
        "GD&amp;T \u2014 Applied Geometrics",
        s['certs'],
    ))
    story.append(Paragraph("English (fluent)  |  Spanish (native)", s['certs']))

    doc.build(story)
    verify_one_page(output_path)
    return output_path


# ═══════════════════════════════════════════════════════════════════════
#  Main
# ═══════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    out_dir = r"c:\Users\taco\Desktop\Resume\New Resumes"

    v1 = build_field_service(os.path.join(out_dir, "ML_Meta_FieldServiceEngineer.pdf"))
    print(f"[OK] V1 Field Service: {v1}")

    v2 = build_research_engineer(os.path.join(out_dir, "ML_Meta_ResearchEngineerRobotics.pdf"))
    print(f"[OK] V2 Research Engineer: {v2}")

    v3 = build_mech_design(os.path.join(out_dir, "ML_Meta_MechDesignEngineer.pdf"))
    print(f"[OK] V3 Mech Design: {v3}")

    print("\nAll 3 resumes generated and verified as single-page PDFs.")
