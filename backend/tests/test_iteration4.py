"""ResumeForge AI - Iteration 4 backend tests
Covers:
- POST /api/contact happy path + DB persistence
- POST /api/contact validation (email, message length, name)
- POST /api/contact stub log when RESEND_API_KEY empty
- /sitemap.xml + /robots.txt static SEO files
- Smoke regression: admin login, GET /api/resumes, POST /api/ai/tailor
"""
import os
import re
import time
import uuid
import subprocess
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://resume-forge-278.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@resumeforge.ai"
ADMIN_PASS = "Admin@12345"


def _tail_backend_log(seconds=2.0, lines=400):
    time.sleep(seconds)
    out = subprocess.run(
        ["bash", "-lc", f"tail -n {lines} /var/log/supervisor/backend.err.log /var/log/supervisor/backend.out.log 2>/dev/null"],
        capture_output=True, text=True
    )
    return (out.stdout or "") + (out.stderr or "")


# ---------------- Contact endpoint ----------------
class TestContactEndpoint:
    def test_contact_happy_path(self):
        payload = {
            "name": "TEST_Contact User",
            "email": f"TEST_contact_{uuid.uuid4().hex[:8]}@resumeforge.ai",
            "subject": "Bug report",
            "message": "Hello team, I encountered a small issue while exporting my resume. Please check.",
        }
        r = requests.post(f"{API}/contact", json=payload, timeout=15)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body.get("ok") is True

    def test_contact_logs_stub_when_resend_empty(self):
        unique_subj = f"TEST_subj_{uuid.uuid4().hex[:8]}"
        unique_email = f"TEST_stub_{uuid.uuid4().hex[:8]}@resumeforge.ai"
        payload = {
            "name": "Stub Tester",
            "email": unique_email,
            "subject": unique_subj,
            "message": "This is a test for the contact stub fallback behaviour.",
        }
        r = requests.post(f"{API}/contact", json=payload, timeout=15)
        assert r.status_code == 200
        log = _tail_backend_log(seconds=2.0)
        # logger.info(f"[contact-stub] {email} ({name}): {subject} — stored, not emailed")
        assert "[contact-stub]" in log
        assert unique_email.lower() in log
        assert unique_subj in log

    def test_contact_persists_in_mongo(self):
        unique_email = f"TEST_persist_{uuid.uuid4().hex[:8]}@resumeforge.ai"
        payload = {
            "name": "Persistence Tester",
            "email": unique_email,
            "subject": "Feature request",
            "message": "Persistence verification message exceeds ten characters.",
        }
        r = requests.post(f"{API}/contact", json=payload, timeout=15)
        assert r.status_code == 200
        # Verify via mongo shell
        out = subprocess.run(
            ["bash", "-lc",
             f"mongosh test_database --quiet --eval 'db.contact_messages.findOne({{email: \"{unique_email.lower()}\"}})'"],
            capture_output=True, text=True, timeout=15,
        )
        combined = (out.stdout or "") + (out.stderr or "")
        assert unique_email.lower() in combined, f"Doc not found in mongo. Output: {combined[:1000]}"
        assert "id" in combined or "_id" in combined
        assert "created_at" in combined

    def test_contact_missing_email_422(self):
        r = requests.post(f"{API}/contact", json={
            "name": "No Email", "subject": "x",
            "message": "Long enough message here.",
        }, timeout=10)
        assert r.status_code == 422

    def test_contact_invalid_email_422(self):
        r = requests.post(f"{API}/contact", json={
            "name": "Bad Email", "email": "not-an-email", "subject": "x",
            "message": "Long enough message here.",
        }, timeout=10)
        assert r.status_code == 422

    def test_contact_short_message_422(self):
        r = requests.post(f"{API}/contact", json={
            "name": "Short Msg",
            "email": f"TEST_short_{uuid.uuid4().hex[:6]}@resumeforge.ai",
            "subject": "x",
            "message": "short",  # <10 chars
        }, timeout=10)
        assert r.status_code == 422

    def test_contact_missing_name_422(self):
        r = requests.post(f"{API}/contact", json={
            "email": f"TEST_nname_{uuid.uuid4().hex[:6]}@resumeforge.ai",
            "subject": "x",
            "message": "Long enough message here.",
        }, timeout=10)
        assert r.status_code == 422


# ---------------- SEO static files ----------------
class TestSEOStatic:
    def test_sitemap_xml_serves_and_contains_new_pages(self):
        r = requests.get(f"{BASE_URL}/sitemap.xml", timeout=15)
        assert r.status_code == 200, r.text
        body = r.text
        for path in ["/about", "/contact", "/privacy", "/terms"]:
            assert path in body, f"{path} missing from sitemap.xml"

    def test_robots_txt_serves(self):
        r = requests.get(f"{BASE_URL}/robots.txt", timeout=15)
        assert r.status_code == 200
        assert "User-agent" in r.text


# ---------------- Frontend pages render with 200 ----------------
class TestFrontendPagesReachable:
    @pytest.mark.parametrize("path", ["/about", "/contact", "/privacy", "/terms"])
    def test_page_returns_200(self, path):
        # React SPA – any route returns index.html. Just ensure 200 and HTML.
        r = requests.get(f"{BASE_URL}{path}", timeout=15)
        assert r.status_code == 200
        assert "<!doctype html" in r.text.lower() or "<html" in r.text.lower()


# ---------------- Regression smoke ----------------
class TestRegressionSmoke:
    def test_admin_login_and_resumes_get(self):
        s = requests.Session()
        r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS}, timeout=15)
        assert r.status_code == 200, r.text
        assert r.json().get("role") == "admin"
        r = s.get(f"{API}/resumes", timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_ai_tailor_smoke(self):
        # Use a fresh user to avoid polluting admin
        s = requests.Session()
        email = f"TEST_iter4_tailor_{uuid.uuid4().hex[:8]}@resumeforge.ai"
        r = s.post(f"{API}/auth/register", json={"email": email, "password": "Test@12345", "name": "Iter4"}, timeout=15)
        assert r.status_code == 200
        sample_resume = {
            "personal": {"fullName": "Smoke Test", "email": email},
            "experience": [{"role": "Engineer", "company": "X", "bullets": ["Did things"]}],
            "skills": {"technical": ["Python", "FastAPI"]},
        }
        r = s.post(
            f"{API}/ai/tailor",
            json={"resume": sample_resume, "job_description": "Python FastAPI backend role.", "role": "Backend"},
            timeout=90,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert "match_score" in data
        assert isinstance(data.get("keywords_added"), list)
