"""
Microsoft Senior Test Engineer — Resume PDF Generator
Uses the same professional typography as the Meta/Amazon versions.
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

NAVY = HexColor("#1B365D")
CHARCOAL = HexColor("#333333")
DARK_GRAY = HexColor("#4A4A4A")
MID_GRAY = HexColor("#666666")

PAGE_W, PAGE_H = letter
MARGIN_LR = 0.5 * inch
MARGIN_TOP = 0.4 * inch
MARGIN_BOT = 0.4 * inch
TEXT_WIDTH = PAGE_W - 2 * MARGIN_LR


def create_styles():
    s = {}
    s['name'] = ParagraphStyle('Name', fontName='Helvetica-Bold', fontSize=18, leading=21, alignment=TA_CENTER, textColor=CHARCOAL, spaceAfter=1)
    s['contact'] = ParagraphStyle('Contact', fontName='Helvetica', fontSize=9, leading=11, alignment=TA_CENTER, textColor=DARK_GRAY, spaceAfter=2)
    s['section'] = ParagraphStyle('Section', fontName='Helvetica-Bold', fontSize=11, leading=13, textColor=NAVY, spaceBefore=7, spaceAfter=0)
    s['summary'] = ParagraphStyle('Summary', fontName='Helvetica', fontSize=10.5, leading=12.5, textColor=CHARCOAL, spaceAfter=0)
    s['job_title'] = ParagraphStyle('JobTitle', fontName='Helvetica-Bold', fontSize=10.5, leading=12, textColor=CHARCOAL)
    s['dates'] = ParagraphStyle('Dates', fontName='Helvetica', fontSize=10, leading=12, textColor=DARK_GRAY, alignment=TA_RIGHT)
    s['company'] = ParagraphStyle('Company', fontName='Helvetica-Oblique', fontSize=9, leading=11, textColor=MID_GRAY, spaceAfter=1)
    s['bullet'] = ParagraphStyle('Bullet', fontName='Helvetica', fontSize=10.5, leading=12, textColor=CHARCOAL, leftIndent=14, firstLineIndent=-14, spaceAfter=1.5)
    s['edu'] = ParagraphStyle('Education', fontName='Helvetica', fontSize=10, leading=12, textColor=CHARCOAL, spaceAfter=1)
    s['skills'] = ParagraphStyle('Skills', fontName='Helvetica', fontSize=9.5, leading=11.5, textColor=CHARCOAL, spaceAfter=1)
    s['certs'] = ParagraphStyle('Certs', fontName='Helvetica', fontSize=9.5, leading=11.5, textColor=CHARCOAL, spaceAfter=0.5)
    return s


def section_header(title, s):
    return [
        Paragraph(title, s['section']),
        HRFlowable(width="100%", thickness=0.5, color=NAVY, spaceBefore=1, spaceAfter=3),
    ]


def job_entry(title, dates, company, s):
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
    return [Spacer(1, 3), t, Paragraph(company, s['company'])]


def bullet(text, s):
    return Paragraph(f"\u2022  {text}", s['bullet'])


def build_microsoft_ste(output_path):
    doc = SimpleDocTemplate(
        output_path, pagesize=letter,
        topMargin=MARGIN_TOP, bottomMargin=MARGIN_BOT,
        leftMargin=MARGIN_LR, rightMargin=MARGIN_LR,
    )
    s = create_styles()
    story = []

    # Header
    story.append(Paragraph("Mario Alejandro Lizarraga Tolentino", s['name']))
    story.append(Paragraph(
        'Redmond, WA  \u00b7  +1 (425) 543-7328  \u00b7  mario.lizarragat@gmail.com  \u00b7  '
        'linkedin.com/in/mario-lizarraga',
        s['contact'],
    ))
    story.append(HRFlowable(width="100%", thickness=1, color=NAVY, spaceBefore=2, spaceAfter=2))

    # Summary
    story.extend(section_header("PROFESSIONAL SUMMARY", s))
    story.append(Paragraph(
        "Test and automation engineer with 7+ years designing, building, and validating control "
        "systems and sensor-driven test platforms in aerospace manufacturing. Built a robotic test "
        "system with real-time data acquisition that cut cycle time by 67% and freed 1,300+ hrs/year. "
        "Wrote custom back-end software (Python, APIs, SQL databases) for monitoring, data collection, "
        "and automated reporting. MSc in Space Systems Engineering.",
        s['summary'],
    ))

    # Experience
    story.extend(section_header("EXPERIENCE", s))

    # Safran
    story.extend(job_entry(
        "Automation Engineer II",
        "Feb 2023 \u2013 Present",
        "Safran Electronics &amp; Defense \u2014 Redmond, WA",
        s,
    ))
    for b in [
        "Designed and validated an industrial control system \u2014 UFactory 850 robot arm, FUTEK "
        "load cell, STM32 controller, relay circuits \u2014 with test plans, procedures, and reports "
        "that cut test time by 67% across 75 units/week",

        "Built a data acquisition framework in Python (SciPy) for sensor data collection and "
        "analysis \u2014 force-vs-displacement, peak force, travel, and inflection point detection",

        "Developed a back-end monitoring platform (Python, REST APIs, SQL) tracking equipment "
        "health, failure modes, and downtime; reduced unplanned downtime from 3 days/month to "
        "30 min every 6 months",

        "Wrote STM32 firmware in C for a continuity controller \u2014 serial comms, signal "
        "acquisition, debounce logic for real-time validation during automated press cycles",

        "Documented test requirements, test plans, and procedures for system qualification; "
        "created 7+ service documents; supervised 5 interns delivering 92% accuracy ML model for DFx",
    ]:
        story.append(bullet(b, s))

    # Jenton
    story.extend(job_entry(
        "Design Engineer",
        "Nov 2021 \u2013 Dec 2022",
        "Jenton International \u2014 Whitchurch, UK",
        s,
    ))
    for b in [
        "Designed and commissioned custom automation equipment \u2014 control system integration, "
        "pneumatics, sensors, and relay logic for manufacturing process lines",
        "Tested and qualified new equipment on the shop floor, gathering performance requirements "
        "and diagnosing mechanical, electrical, and sensor issues",
    ]:
        story.append(bullet(b, s))

    # Honeywell
    story.extend(job_entry(
        "Design Engineer",
        "Jun 2019 \u2013 Sep 2020",
        "Honeywell Aerospace \u2014 Mexicali, MX",
        s,
    ))
    for b in [
        "Designed jet engine APU components in CATIA V5, applying GD&amp;T per ASME Y14.5 and "
        "tolerance stackup for reliability in high-vibration, high-temperature environments",
        "Completed Six Sigma Green Belt DFSS \u2014 applied DOE and statistical methods to validate "
        "design reliability",
    ]:
        story.append(bullet(b, s))

    # El Garage
    story.extend(job_entry(
        "AR/VR Project Engineer",
        "Jul 2017 \u2013 Oct 2019",
        "El Garage Project Hub \u2014 Mexicali, MX",
        s,
    ))
    story.append(bullet(
        "Led the NASA Space Apps Challenge (175+ participants); built prototypes in Unity (C#) "
        "and taught robotics workshops to 50+ students",
        s,
    ))

    # Education
    story.extend(section_header("EDUCATION", s))
    story.append(Paragraph(
        "<b>MSc Space Systems Engineering</b> (Merit) \u2014 University of Southampton, UK  |  2020 \u2013 2021",
        s['edu'],
    ))
    story.append(Paragraph(
        "<b>BSc Mechatronics Engineering</b> (Magna Cum Laude, 96.36) \u2014 CETYS Universidad, Mexico  |  2013 \u2013 2017",
        s['edu'],
    ))

    # Skills
    story.extend(section_header("SKILLS", s))
    for sk in [
        "<b>Test &amp; Control Systems:</b> industrial control system testing, sensor data acquisition "
        "(force, temperature, vibration), data analysis pipelines, relay circuits, serial/I2C/UART, "
        "test plan development, test procedures, test reports, DFx",

        "<b>Software &amp; Data:</b> Python (SciPy, FastAPI, OpenCV), C (STM32 firmware), SQL databases, "
        "REST APIs, Git, Linux, Raspberry Pi, Arduino",

        "<b>Design &amp; Methods:</b> SolidWorks, CATIA V5, GD&amp;T, DFM/DFA, failure analysis, root cause "
        "analysis, reliability engineering, Six Sigma DFSS",
    ]:
        story.append(Paragraph(sk, s['skills']))

    # Certifications & Languages
    story.extend(section_header("CERTIFICATIONS &amp; LANGUAGES", s))
    story.append(Paragraph(
        "Six Sigma Green Belt DFSS \u2014 Honeywell  |  CATIA V5 Expert \u2014 Dassault  |  "
        "GD&amp;T \u2014 Applied Geometrics",
        s['certs'],
    ))
    story.append(Paragraph("English (fluent)  |  Spanish (native)", s['certs']))

    doc.build(story)

    # Verify single page
    reader = PdfReader(output_path)
    pages = len(reader.pages)
    if pages != 1:
        raise ValueError(f"PDF is {pages} pages — must be 1!")
    print(f"[OK] Verified: {pages} page, {os.path.basename(output_path)}")

    return output_path


def build_microsoft_sme(output_path):
    """Senior Mechanical Engineer — Datacenter Engineering"""
    doc = SimpleDocTemplate(
        output_path, pagesize=letter,
        topMargin=MARGIN_TOP, bottomMargin=MARGIN_BOT,
        leftMargin=MARGIN_LR, rightMargin=MARGIN_LR,
    )
    s = create_styles()
    story = []

    # Header
    story.append(Paragraph("Mario Alejandro Lizarraga Tolentino", s['name']))
    story.append(Paragraph(
        'Redmond, WA  \u00b7  +1 (425) 543-7328  \u00b7  mario.lizarragat@gmail.com  \u00b7  '
        'linkedin.com/in/mario-lizarraga',
        s['contact'],
    ))
    story.append(HRFlowable(width="100%", thickness=1, color=NAVY, spaceBefore=2, spaceAfter=2))

    story.extend(section_header("PROFESSIONAL SUMMARY", s))
    story.append(Paragraph(
        "Mechanical engineer with 7+ years designing, prototyping, and commissioning complex "
        "mechanical systems in aerospace and industrial automation. Led equipment design from "
        "concept through commissioning \u2014 CAD models, drawings, specifications, and vendor "
        "coordination. Built automation and control systems that cut cycle time by 67% and freed "
        "1,300+ hrs/year. MSc in Space Systems Engineering, Six Sigma Green Belt DFSS.",
        s['summary'],
    ))

    story.extend(section_header("EXPERIENCE", s))

    # Safran
    story.extend(job_entry("Automation Engineer II", "Feb 2023 \u2013 Present",
        "Safran Electronics &amp; Defense \u2014 Redmond, WA", s))
    for b in [
        "Designed and commissioned a robotic test system \u2014 mechanical layout, pneumatics, "
        "cooling integration, relay control circuits \u2014 delivering specifications and drawings "
        "that cut test time by 67% across 75 units/week",

        "Built a monitoring platform (Python, REST APIs, SQL) tracking equipment health, failure "
        "modes, and environmental conditions; reduced unplanned downtime from 3 days/month to "
        "30 min every 6 months",

        "Developed a multi-axis gantry (X, Y, Z, rotation) for automated inspection \u2014 "
        "mechanical design, motion control, sensor integration, and commissioning",

        "Modeled and iterated test fixtures in SolidWorks through 4+ revisions (FDM/SLA), "
        "sub-millimeter alignment under cyclic loads, applying DFM/DFA for manufacturability",

        "Supervised 5 interns on AI defect detection \u2014 delivered 92% accuracy ML model; "
        "documented test requirements, plans, and procedures for system qualification",
    ]:
        story.append(bullet(b, s))

    # Jenton
    story.extend(job_entry("Design Engineer", "Nov 2021 \u2013 Dec 2022",
        "Jenton International \u2014 Whitchurch, UK", s))
    for b in [
        "Designed complex custom automation equipment in Autodesk Inventor \u2014 mechanical "
        "layouts, pneumatics, guarding, sensor integration, and control system wiring",
        "Produced manufacturing drawings with full GD&amp;T callouts, coordinating with suppliers "
        "on materials, tolerances, and equipment specifications",
    ]:
        story.append(bullet(b, s))

    # Honeywell
    story.extend(job_entry("Design Engineer", "Jun 2019 \u2013 Sep 2020",
        "Honeywell Aerospace \u2014 Mexicali, MX", s))
    for b in [
        "Designed jet engine APU components in CATIA V5, applying GD&amp;T per ASME Y14.5 and "
        "tolerance stackup for cast/CNC parts in high-vibration, high-temperature environments",
        "Led DFM/DFA reviews with suppliers; completed Six Sigma Green Belt DFSS (DOE, "
        "statistical tolerance analysis)",
    ]:
        story.append(bullet(b, s))

    # El Garage
    story.extend(job_entry("AR/VR Project Engineer", "Jul 2017 \u2013 Oct 2019",
        "El Garage Project Hub \u2014 Mexicali, MX", s))
    story.append(bullet(
        "Designed a 3D-printed 6-DOF robotic arm; led the NASA Space Apps Challenge in Mexicali "
        "(175+ participants)", s))

    # Education
    story.extend(section_header("EDUCATION", s))
    story.append(Paragraph(
        "<b>MSc Space Systems Engineering</b> (Merit) \u2014 University of Southampton, UK  |  2020 \u2013 2021",
        s['edu']))
    story.append(Paragraph(
        "<b>BSc Mechatronics Engineering</b> (Magna Cum Laude, 96.36) \u2014 CETYS Universidad, Mexico  |  2013 \u2013 2017",
        s['edu']))

    # Skills
    story.extend(section_header("SKILLS", s))
    for sk in [
        "<b>CAD &amp; Design:</b> SolidWorks, CATIA V5 (certified expert), Autodesk Inventor, Siemens NX, "
        "detailed drawings, GD&amp;T (ASME Y14.5), tolerance stackup, specifications",

        "<b>Mechanical Systems:</b> equipment design, pneumatics, cooling systems, piping, control "
        "system integration, commissioning, factory acceptance testing, DFM/DFA",

        "<b>Technical:</b> Python (SciPy, FastAPI, OpenCV), C (STM32), SQL, Git, Linux, Raspberry Pi, "
        "building automation awareness, reliability engineering, Six Sigma DFSS",
    ]:
        story.append(Paragraph(sk, s['skills']))

    story.extend(section_header("CERTIFICATIONS &amp; LANGUAGES", s))
    story.append(Paragraph(
        "CATIA V5 Expert \u2014 Dassault  |  Six Sigma Green Belt DFSS \u2014 Honeywell  |  "
        "GD&amp;T \u2014 Applied Geometrics", s['certs']))
    story.append(Paragraph("English (fluent)  |  Spanish (native)", s['certs']))

    doc.build(story)
    reader = PdfReader(output_path)
    pages = len(reader.pages)
    if pages != 1:
        raise ValueError(f"PDF is {pages} pages!")
    print(f"[OK] Verified: {pages} page, {os.path.basename(output_path)}")
    return output_path


if __name__ == "__main__":
    d = os.path.dirname(__file__)

    out1 = build_microsoft_ste(os.path.join(d, "ML_Microsoft_SeniorTestEngineer.pdf"))
    print(f"Generated: {out1}")

    out2 = build_microsoft_sme(os.path.join(d, "ML_Microsoft_SeniorMechEngineer.pdf"))
    print(f"Generated: {out2}")

    print("\nAll Microsoft resumes generated.")
