"""ResumeForge AI - Iteration 3 backend tests
Covers:
- POST /api/ai/tailor (Claude Sonnet 4.5)
- POST /api/auth/forgot-password (Resend stdout fallback when RESEND_API_KEY empty)
- POST /api/auth/reset-password end-to-end
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


def _new_user(prefix="i3user"):
    email = f"TEST_{prefix}_{uuid.uuid4().hex[:8]}@resumeforge.ai"
    return email, "Test@12345", "Iter3 User"


@pytest.fixture(scope="module")
def user_session():
    s = requests.Session()
    email, pw, name = _new_user("tailor")
    r = s.post(f"{API}/auth/register", json={"email": email, "password": pw, "name": name}, timeout=15)
    assert r.status_code == 200, r.text
    s._email = email
    s._password = pw
    return s


SAMPLE_RESUME = {
    "personal": {"fullName": "Jane Doe", "title": "Backend Engineer", "email": "jane@example.com"},
    "objective": "Backend engineer with 5 years of Python experience.",
    "experience": [
        {
            "role": "Backend Engineer",
            "company": "StartupX",
            "bullets": [
                "Worked on backend services for the team",
                "Built features in the API",
            ],
        },
        {
            "role": "Software Engineer",
            "company": "BigCorp",
            "bullets": [
                "Helped with database optimisation tasks",
            ],
        },
    ],
    "projects": [
        {
            "name": "PaymentsLite",
            "bullets": [
                "Built a small payments microservice for fun",
            ],
        }
    ],
    "skills": {
        "technical": ["Python", "FastAPI", "PostgreSQL", "Docker", "Kubernetes", "Redis"],
        "soft": ["Communication", "Mentoring"],
    },
}

JD = (
    "We are hiring a Senior Backend Engineer with strong Python and FastAPI experience. "
    "You will build distributed systems on Kubernetes, optimise PostgreSQL queries, and own "
    "payment-critical microservices. Experience with Redis caching and observability a plus."
)


# ---------------- Smoke regression (iteration 1+2) ----------------
class TestRegressionSmoke:
    def test_admin_login(self):
        s = requests.Session()
        r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS}, timeout=15)
        assert r.status_code == 200
        assert r.json()["role"] == "admin"

    def test_resume_crud_smoke(self, user_session):
        s = user_session
        r = s.post(f"{API}/resumes", json={"name": "TEST_smoke_r", "template": "modern-professional", "data": {}}, timeout=15)
        assert r.status_code == 200
        rid = r.json()["id"]
        r = s.get(f"{API}/resumes/{rid}", timeout=10)
        assert r.status_code == 200
        s.delete(f"{API}/resumes/{rid}", timeout=10)

    def test_cover_letter_create_smoke(self, user_session):
        s = user_session
        r = s.post(f"{API}/cover-letters", json={"name": "TEST_smoke_cl", "template": "classic-letter", "data": {}}, timeout=15)
        assert r.status_code == 200
        cid = r.json()["id"]
        s.delete(f"{API}/cover-letters/{cid}", timeout=10)


# ---------------- AI Tailor ----------------
class TestAITailor:
    def test_tailor_basic_shape(self, user_session):
        r = user_session.post(
            f"{API}/ai/tailor",
            json={"resume": SAMPLE_RESUME, "job_description": JD, "role": "Senior Backend Engineer", "company": "Acme"},
            timeout=90,
        )
        assert r.status_code == 200, r.text
        data = r.json()

        # match_score
        assert "match_score" in data
        assert isinstance(data["match_score"], (int, float))
        assert 0 <= int(data["match_score"]) <= 100

        # keywords_added: list of strings
        assert isinstance(data.get("keywords_added"), list)
        for k in data["keywords_added"]:
            assert isinstance(k, str)

        # skills_order: must be subset of input skills.technical
        assert isinstance(data.get("skills_order"), list)
        input_skills = set(SAMPLE_RESUME["skills"]["technical"])
        for s_ in data["skills_order"]:
            assert isinstance(s_, str)
            assert s_ in input_skills, f"skills_order contained fabricated skill: {s_}"

        # bullets: array of up to 3 objects
        assert isinstance(data.get("bullets"), list)
        assert len(data["bullets"]) <= 3
        for b in data["bullets"]:
            assert b.get("section") in ("experience", "projects")
            assert isinstance(b.get("item_index"), int)
            assert isinstance(b.get("bullet_index"), int)
            assert isinstance(b.get("original"), str)
            assert isinstance(b.get("suggested"), str)
            # Validate indices are not invalid
            section_list = SAMPLE_RESUME.get(b["section"], [])
            assert 0 <= b["item_index"] < len(section_list), \
                f"invalid item_index {b['item_index']} for section {b['section']}"
            item = section_list[b["item_index"]]
            bullets = item.get("bullets", [])
            assert 0 <= b["bullet_index"] < len(bullets), \
                f"invalid bullet_index {b['bullet_index']}"

    def test_tailor_empty_jd_returns_valid_object(self, user_session):
        r = user_session.post(
            f"{API}/ai/tailor",
            json={"resume": SAMPLE_RESUME, "job_description": ""},
            timeout=90,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        # Defaults populated
        assert "match_score" in data
        assert isinstance(data.get("keywords_added"), list)
        assert isinstance(data.get("skills_order"), list)
        assert isinstance(data.get("bullets"), list)

    def test_tailor_no_experience_or_projects_bullets_empty(self, user_session):
        bare_resume = {
            "personal": {"fullName": "John Smith", "email": "john@example.com"},
            "skills": {"technical": ["Python", "FastAPI"]},
        }
        r = user_session.post(
            f"{API}/ai/tailor",
            json={"resume": bare_resume, "job_description": JD},
            timeout=90,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        # No experience or projects -> bullets MUST be empty (no valid indices possible)
        assert isinstance(data.get("bullets"), list)
        # All returned bullets, if any, must reference a valid section — but there are none
        for b in data.get("bullets", []):
            section_list = bare_resume.get(b.get("section"), [])
            # Any returned bullet would have invalid indices; the test is whether server filters them
            # If LLM returns any, this is a code review item (server should filter), not strictly required by test
            pytest.fail(f"Server returned bullet with no possible source: {b}")

    def test_tailor_unauth_401(self):
        r = requests.post(
            f"{API}/ai/tailor",
            json={"resume": SAMPLE_RESUME, "job_description": JD},
            timeout=30,
        )
        assert r.status_code == 401


# ---------------- Forgot/Reset password (Resend stdout fallback) ----------------
def _tail_backend_log(seconds=2.0, lines=400):
    time.sleep(seconds)
    out = subprocess.run(
        ["bash", "-lc", f"tail -n {lines} /var/log/supervisor/backend.err.log /var/log/supervisor/backend.out.log 2>/dev/null"],
        capture_output=True, text=True
    )
    return (out.stdout or "") + (out.stderr or "")


class TestForgotPasswordStub:
    def test_forgot_password_existing_email_logs_stub(self):
        # Create a fresh user
        s = requests.Session()
        email, pw, _ = _new_user("forgot")
        r = s.post(f"{API}/auth/register", json={"email": email, "password": pw, "name": "Forgot"}, timeout=15)
        assert r.status_code == 200

        # Trigger forgot-password
        r = requests.post(f"{API}/auth/forgot-password", json={"email": email}, timeout=15)
        assert r.status_code == 200
        body = r.json()
        assert body.get("ok") is True
        assert "If the email exists" in body.get("message", "")

        # Verify the stub log line
        log = _tail_backend_log(seconds=2.0)
        assert f"[email-stub] Password reset for {email.lower()}" in log, \
            f"Expected stub log line for {email}, last logs:\n{log[-2000:]}"

    def test_forgot_password_unknown_email_returns_200_no_enumeration(self):
        unknown = f"TEST_doesnotexist_{uuid.uuid4().hex[:6]}@resumeforge.ai"
        r = requests.post(f"{API}/auth/forgot-password", json={"email": unknown}, timeout=15)
        assert r.status_code == 200
        body = r.json()
        assert body.get("ok") is True
        # Same message — no leakage
        assert "If the email exists" in body.get("message", "")
        # Should NOT log a stub line for unknown email (user is None)
        log = _tail_backend_log(seconds=1.5, lines=200)
        assert f"[email-stub] Password reset for {unknown.lower()}" not in log

    def test_reset_flow_end_to_end(self):
        # Create user
        s = requests.Session()
        email, pw, _ = _new_user("reset")
        r = s.post(f"{API}/auth/register", json={"email": email, "password": pw, "name": "ResetUser"}, timeout=15)
        assert r.status_code == 200

        # Forgot
        r = requests.post(f"{API}/auth/forgot-password", json={"email": email}, timeout=15)
        assert r.status_code == 200

        # Grep token from logs
        log = _tail_backend_log(seconds=2.0, lines=600)
        # Pattern: [email-stub] Password reset for <email>: <link>?token=<token>
        m = re.search(rf"\[email-stub\] Password reset for {re.escape(email.lower())}: \S*token=([A-Za-z0-9_\-]+)", log)
        assert m, f"Could not find reset token in logs for {email}. Tail:\n{log[-2000:]}"
        token = m.group(1)

        # Reset password
        new_pw = "NewPass@789"
        r = requests.post(f"{API}/auth/reset-password", json={"token": token, "new_password": new_pw}, timeout=15)
        assert r.status_code == 200, r.text

        # Login with new password
        s2 = requests.Session()
        r = s2.post(f"{API}/auth/login", json={"email": email, "password": new_pw}, timeout=15)
        assert r.status_code == 200, r.text

        # Old password should now fail
        r = requests.post(f"{API}/auth/login", json={"email": email, "password": pw}, timeout=15)
        assert r.status_code == 401

        # Restore original password via change-password (logged in with new)
        r = s2.post(
            f"{API}/auth/change-password",
            json={"current_password": new_pw, "new_password": pw},
            timeout=15,
        )
        assert r.status_code == 200

        # Re-used token should now fail
        r = requests.post(f"{API}/auth/reset-password", json={"token": token, "new_password": "Other@789"}, timeout=15)
        assert r.status_code == 400
