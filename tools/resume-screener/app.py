"""
Resume Screener — Local web app that simulates 3 screening layers:
  1. AI Detection (GPTZero/Originality.ai clone)
  2. ATS Filter (Workday/Greenhouse clone)
  3. Human Recruiter Scan

Run: python app.py
Open: http://localhost:8000
"""

from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import pdfplumber
import io
import json
import uvicorn

from ai_detector import run_ai_detection
from ats_filter import run_ats_filter
from human_screener import run_human_screener

app = FastAPI(title="Resume Screener")
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


def extract_pdf_text(file_bytes: bytes) -> str:
    """Extract text from PDF bytes using pdfplumber."""
    text = ""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text.strip()


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/analyze")
async def analyze(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    checks: str = Form("all"),  # "ai", "ats", "human", or "all"
):
    """Run selected screening checks on uploaded resume."""

    # Extract text from PDF
    file_bytes = await resume.read()

    if resume.filename.lower().endswith('.pdf'):
        resume_text = extract_pdf_text(file_bytes)
    else:
        # Assume plain text / markdown
        resume_text = file_bytes.decode('utf-8', errors='ignore')

    if not resume_text or len(resume_text.strip()) < 50:
        return {"error": "Could not extract text from resume. Ensure it's a text-based PDF (not scanned image)."}

    results = {
        "resume_preview": resume_text[:200] + "..." if len(resume_text) > 200 else resume_text,
        "word_count": len(resume_text.split()),
    }

    checks_to_run = checks.split(",") if checks != "all" else ["ai", "ats", "human"]

    if "ai" in checks_to_run:
        results["ai_detection"] = run_ai_detection(resume_text)

    if "ats" in checks_to_run:
        results["ats_filter"] = run_ats_filter(resume_text, job_description)

    if "human" in checks_to_run:
        results["human_screener"] = run_human_screener(resume_text, job_description)

    return results


if __name__ == "__main__":
    print("\n  Resume Screener running at http://localhost:8000\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
