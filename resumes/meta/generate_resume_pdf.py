"""
Resume PDF Generator — produces clean, ATS-friendly, single-page resumes.
Formatting follows recruiter best practices:
  - Font: Calibri-equivalent (Helvetica) at 10-11pt body
  - Margins: 0.5" all sides
  - Section headers: 11pt bold, dark blue
  - No graphics, tables, or columns (ATS-safe)
  - Single page target
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import os
import sys

# Colors
DARK_BLUE = HexColor("#1a5276")
BLACK = HexColor("#222222")
GRAY = HexColor("#555555")

def create_styles():
    """Create all paragraph styles for the resume."""
    styles = {}

    styles['name'] = ParagraphStyle(
        'Name',
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        alignment=TA_CENTER,
        textColor=BLACK,
        spaceAfter=2,
    )

    styles['contact'] = ParagraphStyle(
        'Contact',
        fontName='Helvetica',
        fontSize=9,
        leading=11,
        alignment=TA_CENTER,
        textColor=GRAY,
        spaceAfter=4,
    )

    styles['section_header'] = ParagraphStyle(
        'SectionHeader',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=13,
        textColor=DARK_BLUE,
        spaceBefore=6,
        spaceAfter=2,
    )

    styles['summary'] = ParagraphStyle(
        'Summary',
        fontName='Helvetica',
        fontSize=9.5,
        leading=12,
        textColor=BLACK,
        spaceAfter=2,
    )

    styles['job_title'] = ParagraphStyle(
        'JobTitle',
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=12,
        textColor=BLACK,
        spaceBefore=4,
        spaceAfter=0,
    )

    styles['company'] = ParagraphStyle(
        'Company',
        fontName='Helvetica',
        fontSize=9,
        leading=11,
        textColor=GRAY,
        spaceAfter=2,
    )

    styles['bullet'] = ParagraphStyle(
        'Bullet',
        fontName='Helvetica',
        fontSize=9.5,
        leading=11.5,
        textColor=BLACK,
        leftIndent=12,
        firstLineIndent=-12,
        spaceAfter=1.5,
    )

    styles['education'] = ParagraphStyle(
        'Education',
        fontName='Helvetica',
        fontSize=9.5,
        leading=11.5,
        textColor=BLACK,
        spaceAfter=1.5,
    )

    styles['skills'] = ParagraphStyle(
        'Skills',
        fontName='Helvetica',
        fontSize=9,
        leading=11,
        textColor=BLACK,
        spaceAfter=1.5,
    )

    styles['certs'] = ParagraphStyle(
        'Certs',
        fontName='Helvetica',
        fontSize=9,
        leading=11,
        textColor=BLACK,
        spaceAfter=1,
    )

    return styles


def build_field_service(output_path):
    """Build V1: Field Service Engineer resume."""
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        topMargin=0.4*inch,
        bottomMargin=0.4*inch,
        leftMargin=0.5*inch,
        rightMargin=0.5*inch,
    )

    s = create_styles()
    story = []

    # Header
    story.append(Paragraph("Mario Alejandro Lizarraga Tolentino", s['name']))
    story.append(Paragraph(
        'Redmond, WA  |  +1 (425) 543-7328  |  mario.lizarragat@gmail.com  |  '
        '<link href="https://linkedin.com/in/mario-lizarraga">linkedin.com/in/mario-lizarraga</link>',
        s['contact']
    ))
    story.append(HRFlowable(width="100%", thickness=0.5, color=DARK_BLUE, spaceAfter=4))

    # Summary
    story.append(Paragraph("Professional Summary", s['section_header']))
    story.append(Paragraph(
        "Automation engineer with 7+ years troubleshooting electro-mechanical systems in robotics and aerospace. "
        "Built a robotic test platform that cut cycle time by 67% and freed 1,300+ hours/year of manual labor. "
        "Own the full lifecycle — design, deploy, monitor, fix, improve. Willing to travel extensively.",
        s['summary']
    ))

    # Experience
    story.append(Paragraph("Experience", s['section_header']))

    # Safran
    story.append(Paragraph("Automation Engineer II  |  Feb 2023 – Present", s['job_title']))
    story.append(Paragraph("Safran Electronics &amp; Defense — Redmond, WA", s['company']))

    safran_bullets = [
        "Built and maintained a UFactory 850 robotic test system — troubleshot failures across mechanical, electrical, firmware, and software subsystems, cutting test time by 67% and freeing 25+ hrs/week",
        "Conducted failure analysis on force sensor data, identified root causes of recurring failures, and implemented corrective actions via custom monitoring platform",
        "Supervised 5 interns on AI defect detection and robotics — delivered a 92% accuracy ML model and hardware prototype for vision-based inspection",
        "Created 7+ service documents (setup, calibration, troubleshooting, failure modes), enabling technicians to maintain systems independently",
        "Designed test fixtures and end-effectors via iterative prototyping (SolidWorks, 3D printing), applying DFM/DFA with spares strategy",
    ]
    for b in safran_bullets:
        story.append(Paragraph(f"•  {b}", s['bullet']))

    # Jenton
    story.append(Paragraph("Automation &amp; Design Engineer  |  Nov 2021 – Dec 2022", s['job_title']))
    story.append(Paragraph("Jenton International — Whitchurch, UK", s['company']))

    jenton_bullets = [
        "Designed and commissioned custom automation equipment — mechanical layout, pneumatics, sensor integration",
        "Troubleshot electro-mechanical issues during build and commissioning, resolving fitment, wiring, and alignment problems",
    ]
    for b in jenton_bullets:
        story.append(Paragraph(f"•  {b}", s['bullet']))

    # Honeywell
    story.append(Paragraph("Design Engineer  |  Jun 2019 – Sep 2020", s['job_title']))
    story.append(Paragraph("Honeywell Aerospace — Mexicali, MX", s['company']))

    honeywell_bullets = [
        "Designed aerospace components in CATIA V5 for engine/APU systems, applying GD&amp;T and tolerance analysis",
        "Supported DFM/DFA reviews with casting and CNC suppliers, driving corrective actions before production release",
    ]
    for b in honeywell_bullets:
        story.append(Paragraph(f"•  {b}", s['bullet']))

    # El Garage
    story.append(Paragraph("AR/VR Project Engineer  |  Jul 2017 – Oct 2019", s['job_title']))
    story.append(Paragraph("El Garage Project Hub — Mexicali, MX", s['company']))

    # Education
    story.append(Paragraph("Education", s['section_header']))
    story.append(Paragraph(
        "<b>MSc Space Systems Engineering</b> (Merit) — University of Southampton, UK  |  2020 – 2021",
        s['education']
    ))
    story.append(Paragraph(
        "<b>BSc Mechatronics Engineering</b> (Magna Cum Laude, 96.36) — CETYS Universidad, Mexico  |  2013 – 2017",
        s['education']
    ))

    # Skills
    story.append(Paragraph("Skills", s['section_header']))
    skills = [
        "<b>Robotics &amp; Electro-Mechanical:</b> robot arm troubleshooting, gantry systems, sensors (force, temp, vibration), actuators, PLC, relay circuits, serial/I2C, fleet maintenance, MTBF/MTTR, preventative maintenance",
        "<b>Technical:</b> Python, C (STM32), SQL, Git, SolidWorks, CATIA V5, Autodesk Inventor, Arduino, Raspberry Pi, Linux",
        "<b>Methods:</b> failure analysis, root cause analysis, DFM/DFA, GD&amp;T, machine learning, computer vision",
    ]
    for sk in skills:
        story.append(Paragraph(sk, s['skills']))

    # Certifications + Languages
    story.append(Paragraph("Certifications &amp; Languages", s['section_header']))
    story.append(Paragraph(
        "Six Sigma Green Belt DFSS — Honeywell  |  CATIA V5 Expert — Dassault  |  GD&amp;T — Applied Geometrics",
        s['certs']
    ))
    story.append(Paragraph(
        "English (fluent)  |  Spanish (native)",
        s['certs']
    ))

    doc.build(story)
    return output_path


def build_research_engineer(output_path):
    """Build V2: Research Engineer, Robotics resume."""
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        topMargin=0.4*inch,
        bottomMargin=0.4*inch,
        leftMargin=0.5*inch,
        rightMargin=0.5*inch,
    )

    s = create_styles()
    story = []

    # Header
    story.append(Paragraph("Mario Alejandro Lizarraga Tolentino", s['name']))
    story.append(Paragraph(
        'Redmond, WA  |  +1 (425) 543-7328  |  mario.lizarragat@gmail.com  |  '
        '<link href="https://linkedin.com/in/mario-lizarraga">linkedin.com/in/mario-lizarraga</link>',
        s['contact']
    ))
    story.append(HRFlowable(width="100%", thickness=0.5, color=DARK_BLUE, spaceAfter=4))

    # Summary
    story.append(Paragraph("Professional Summary", s['section_header']))
    story.append(Paragraph(
        "Mechatronics engineer with 7+ years designing electromechanical systems, writing embedded firmware, "
        "and building robotic prototypes in aerospace. Took a robotic test platform from whiteboard to production "
        "— cut cycle time by 67% and freed 1,300+ hrs/year. MSc in Space Systems Engineering (Mars Rover and CubeSat mechanisms).",
        s['summary']
    ))

    # Experience
    story.append(Paragraph("Experience", s['section_header']))

    # Safran
    story.append(Paragraph("Automation Engineer II  |  Feb 2023 – Present", s['job_title']))
    story.append(Paragraph("Safran Electronics &amp; Defense — Redmond, WA", s['company']))

    safran_bullets = [
        "Designed and built a robotic test platform — UFactory 850 arm, FUTEK USB520 load cell, 3D-printed fixtures, STM32 continuity tester — cutting test time by 67% across 75 panels/week",
        "Wrote STM32 firmware in C for a custom continuity board — serial comms, signal acquisition, debounce logic for real-time validation during robot press cycles",
        "Modeled and iterated test fixtures and end-effectors in SolidWorks — sub-millimeter alignment through 4+ revisions (FDM/SLA)",
        "Developed a multi-axis gantry (X, Y, Z, rotation) for automated panel inspection — mechanical layout, motion control, DSLR integration",
        "Supervised 5 interns on AI defect detection and robotics — delivered a 92% accuracy ML model and hardware prototype for vision-based inspection",
    ]
    for b in safran_bullets:
        story.append(Paragraph(f"•  {b}", s['bullet']))

    # Jenton
    story.append(Paragraph("Automation &amp; Design Engineer  |  Nov 2021 – Dec 2022", s['job_title']))
    story.append(Paragraph("Jenton International — Whitchurch, UK", s['company']))

    jenton_bullets = [
        "Designed custom automation machinery in Autodesk Inventor — mechanical layouts, pneumatics, electromechanical assemblies",
        "Built and commissioned equipment on the shop floor, diagnosing mechanical, electrical, and sensor issues",
    ]
    for b in jenton_bullets:
        story.append(Paragraph(f"•  {b}", s['bullet']))

    # Honeywell
    story.append(Paragraph("Design Engineer  |  Jun 2019 – Sep 2020", s['job_title']))
    story.append(Paragraph("Honeywell Aerospace — Mexicali, MX", s['company']))

    honeywell_bullets = [
        "Designed jet engine APU components in CATIA V5, applying GD&amp;T per ASME Y14.5 and tolerance stackup analysis",
        "Completed Six Sigma Green Belt DFSS — applied DOE and statistical methods to tolerance analysis",
    ]
    for b in honeywell_bullets:
        story.append(Paragraph(f"•  {b}", s['bullet']))

    # El Garage
    story.append(Paragraph("AR/VR Project Engineer  |  Jul 2017 – Oct 2019", s['job_title']))
    story.append(Paragraph("El Garage Project Hub — Mexicali, MX", s['company']))

    # Education
    story.append(Paragraph("Education", s['section_header']))
    story.append(Paragraph(
        "<b>MSc Space Systems Engineering</b> (Merit) — University of Southampton, UK  |  2020 – 2021",
        s['education']
    ))
    story.append(Paragraph(
        "<b>BSc Mechatronics Engineering</b> (Magna Cum Laude, 96.36) — CETYS Universidad, Mexico  |  2013 – 2017",
        s['education']
    ))

    # Skills
    story.append(Paragraph("Skills", s['section_header']))
    skills = [
        "<b>Design &amp; Prototyping:</b> fixture/end-effector design, mechanism design, 3D printing (FDM/SLA), CNC awareness, sheet metal",
        "<b>Electromechanical:</b> robot arm integration (xArm SDK), force sensors (FUTEK), vibration measurement, I2C/SPI/UART",
        "<b>Technical:</b> STM32 (C), Python, SciPy, OpenCV, SQL, Git, SolidWorks, CATIA V5, Autodesk Inventor, Arduino, Raspberry Pi",
        "<b>Methods:</b> GD&amp;T, tolerance analysis, DFM/DFA, Six Sigma DFSS, machine learning, computer vision",
    ]
    for sk in skills:
        story.append(Paragraph(sk, s['skills']))

    # Certifications + Languages
    story.append(Paragraph("Certifications &amp; Languages", s['section_header']))
    story.append(Paragraph(
        "CATIA V5 Expert — Dassault  |  Six Sigma Green Belt DFSS — Honeywell  |  GD&amp;T — Applied Geometrics",
        s['certs']
    ))
    story.append(Paragraph(
        "English (fluent)  |  Spanish (native)",
        s['certs']
    ))

    doc.build(story)
    return output_path


def build_mech_design(output_path):
    """Build V3: Mechanical Design Engineer resume."""
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        topMargin=0.4*inch,
        bottomMargin=0.4*inch,
        leftMargin=0.5*inch,
        rightMargin=0.5*inch,
    )

    s = create_styles()
    story = []

    # Header
    story.append(Paragraph("Mario Alejandro Lizarraga Tolentino", s['name']))
    story.append(Paragraph(
        'Redmond, WA  |  +1 (425) 543-7328  |  mario.lizarragat@gmail.com  |  '
        '<link href="https://linkedin.com/in/mario-lizarraga">linkedin.com/in/mario-lizarraga</link>',
        s['contact']
    ))
    story.append(HRFlowable(width="100%", thickness=0.5, color=DARK_BLUE, spaceAfter=4))

    # Summary
    story.append(Paragraph("Professional Summary", s['section_header']))
    story.append(Paragraph(
        "Mechanical design engineer with 7+ years in aerospace, robotics, and custom machinery. "
        "Designed test fixtures and instrumentation that cut cycle time by 67% across 75 panels/week. "
        "From CATIA V5 part design at Honeywell to robotic test systems and inspection gantries at Safran. "
        "Certified CATIA V5 Expert, GD&amp;T trained, Six Sigma Green Belt DFSS.",
        s['summary']
    ))

    # Experience
    story.append(Paragraph("Experience", s['section_header']))

    # Safran
    story.append(Paragraph("Automation Engineer II  |  Feb 2023 – Present", s['job_title']))
    story.append(Paragraph("Safran Electronics &amp; Defense — Redmond, WA", s['company']))

    safran_bullets = [
        "Designed test fixtures and end-effectors in SolidWorks — 4+ prototype revisions (3D printing), sub-millimeter alignment under cyclic loads, enabling 67% reduction in per-panel test time",
        "Instrumented test platform with FUTEK USB520 load cell for force-vs-displacement capture; built Python pipeline (SciPy) to extract peak force, travel, and inflection points",
        "Installed accelerometers on fixtures, conducted vibration measurement to establish dynamic load profiles and validate design improvements",
        "Designed a multi-axis gantry (X, Y, Z, rotation) for automated panel inspection — mechanical layout, camera mounting, motion control",
        "Supervised 5 interns on AI defect detection and robotics — delivered a 92% accuracy ML model and hardware prototype",
    ]
    for b in safran_bullets:
        story.append(Paragraph(f"•  {b}", s['bullet']))

    # Jenton
    story.append(Paragraph("Automation &amp; Design Engineer  |  Nov 2021 – Dec 2022", s['job_title']))
    story.append(Paragraph("Jenton International — Whitchurch, UK", s['company']))

    jenton_bullets = [
        "Designed custom manufacturing equipment in Autodesk Inventor — mechanical layouts, pneumatics, guarding",
        "Produced manufacturing drawings with full GD&amp;T callouts, coordinating with suppliers on materials and tolerances",
    ]
    for b in jenton_bullets:
        story.append(Paragraph(f"•  {b}", s['bullet']))

    # Honeywell
    story.append(Paragraph("Design Engineer  |  Jun 2019 – Sep 2020", s['job_title']))
    story.append(Paragraph("Honeywell Aerospace — Mexicali, MX", s['company']))

    honeywell_bullets = [
        "Designed jet engine APU components in CATIA V5, applying GD&amp;T per ASME Y14.5 and tolerance stackup for cast and CNC parts in high-vibration environments",
        "Led DFM/DFA reviews with suppliers; completed Six Sigma Green Belt DFSS (DOE, statistical tolerance analysis)",
    ]
    for b in honeywell_bullets:
        story.append(Paragraph(f"•  {b}", s['bullet']))

    # El Garage
    story.append(Paragraph("AR/VR Project Engineer  |  Jul 2017 – Oct 2019", s['job_title']))
    story.append(Paragraph("El Garage Project Hub — Mexicali, MX", s['company']))

    # Education
    story.append(Paragraph("Education", s['section_header']))
    story.append(Paragraph(
        "<b>MSc Space Systems Engineering</b> (Merit) — University of Southampton, UK  |  2020 – 2021",
        s['education']
    ))
    story.append(Paragraph(
        "<b>BSc Mechatronics Engineering</b> (Magna Cum Laude, 96.36) — CETYS Universidad, Mexico  |  2013 – 2017",
        s['education']
    ))

    # Skills
    story.append(Paragraph("Skills", s['section_header']))
    skills = [
        "<b>CAD:</b> CATIA V5 (certified expert), SolidWorks, Autodesk Inventor, Siemens NX",
        "<b>Design &amp; Test:</b> GD&amp;T (ASME Y14.5), tolerance stackup, DFM/DFA, fixture design, force sensors, accelerometers, vibration measurement",
        "<b>Prototyping:</b> 3D printing (FDM/SLA), CNC awareness, sheet metal, casting",
        "<b>Technical:</b> Python (SciPy, OpenCV), MATLAB, SQL, C (STM32), Git, Arduino, Raspberry Pi",
    ]
    for sk in skills:
        story.append(Paragraph(sk, s['skills']))

    # Certifications + Languages
    story.append(Paragraph("Certifications &amp; Languages", s['section_header']))
    story.append(Paragraph(
        "CATIA V5 Expert — Dassault  |  Six Sigma Green Belt DFSS — Honeywell  |  GD&amp;T — Applied Geometrics",
        s['certs']
    ))
    story.append(Paragraph(
        "English (fluent)  |  Spanish (native)",
        s['certs']
    ))

    doc.build(story)
    return output_path


if __name__ == "__main__":
    out_dir = r"c:\Users\taco\Desktop\Resume\New Resumes"

    v1 = build_field_service(os.path.join(out_dir, "ML_Meta_FieldServiceEngineer.pdf"))
    print(f"V1 generated: {v1}")

    v2 = build_research_engineer(os.path.join(out_dir, "ML_Meta_ResearchEngineerRobotics.pdf"))
    print(f"V2 generated: {v2}")

    v3 = build_mech_design(os.path.join(out_dir, "ML_Meta_MechDesignEngineer.pdf"))
    print(f"V3 generated: {v3}")
