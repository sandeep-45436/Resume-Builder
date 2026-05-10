"""ResumeForge AI - Backend API tests (pytest)
Tests: health, auth (register/login/me/logout/refresh), resume CRUD + isolation,
AI endpoints (Claude Sonnet 4.5), brute force lockout (run last to avoid affecting other tests).
"""
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://resume-forge-278.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@resumeforge.ai"
ADMIN_PASS = "Admin@12345"


# ------------------ Fixtures ------------------
@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS}, timeout=15)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    return s


def _new_user(prefix="testuser"):
    email = f"TEST_{prefix}_{uuid.uuid4().hex[:8]}@resumeforge.ai"
    return email, "Test@12345", "Test User"


@pytest.fixture(scope="module")
def user_session():
    s = requests.Session()
    email, pw, name = _new_user("auth")
    r = s.post(f"{API}/auth/register", json={"email": email, "password": pw, "name": name}, timeout=15)
    assert r.status_code == 200, f"Register failed: {r.status_code} {r.text}"
    s._email = email
    s._password = pw
    return s


# ------------------ Health ------------------
class TestHealth:
    def test_health_root(self):
        r = requests.get(f"{API}/", timeout=10)
        assert r.status_code == 200
        body = r.json()
        assert body.get("status") == "ok"


# ------------------ Auth ------------------
class TestAuth:
    def test_register_creates_user_and_sets_cookies(self):
        s = requests.Session()
        email, pw, name = _new_user("reg")
        r = s.post(f"{API}/auth/register", json={"email": email, "password": pw, "name": name}, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == email.lower()
        assert data["name"] == name
        assert data["role"] == "user"
        assert "id" in data
        # Cookies set
        assert "access_token" in s.cookies
        assert "refresh_token" in s.cookies

    def test_register_duplicate_email_returns_400(self):
        s = requests.Session()
        email, pw, name = _new_user("dup")
        r1 = s.post(f"{API}/auth/register", json={"email": email, "password": pw, "name": name}, timeout=15)
        assert r1.status_code == 200
        r2 = requests.post(f"{API}/auth/register", json={"email": email, "password": pw, "name": name}, timeout=15)
        assert r2.status_code == 400

    def test_login_admin_seeded(self):
        s = requests.Session()
        r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS}, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        assert "access_token" in s.cookies

    def test_me_returns_user(self, user_session):
        r = user_session.get(f"{API}/auth/me", timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == user_session._email.lower()

    def test_me_unauthenticated_returns_401(self):
        r = requests.get(f"{API}/auth/me", timeout=10)
        assert r.status_code == 401

    def test_login_invalid_password_returns_401(self):
        # Use a brand-new email so we don't trigger lockout on a real account
        email, pw, name = _new_user("bad")
        s = requests.Session()
        s.post(f"{API}/auth/register", json={"email": email, "password": pw, "name": name}, timeout=15)
        r = requests.post(f"{API}/auth/login", json={"email": email, "password": "wrong-password"}, timeout=15)
        assert r.status_code == 401

    def test_refresh_token_endpoint(self):
        s = requests.Session()
        email, pw, name = _new_user("refresh")
        s.post(f"{API}/auth/register", json={"email": email, "password": pw, "name": name}, timeout=15)
        r = s.post(f"{API}/auth/refresh", timeout=10)
        assert r.status_code == 200
        assert r.json().get("ok") is True

    def test_logout_clears_session(self):
        s = requests.Session()
        email, pw, name = _new_user("logout")
        s.post(f"{API}/auth/register", json={"email": email, "password": pw, "name": name}, timeout=15)
        r = s.post(f"{API}/auth/logout", timeout=10)
        assert r.status_code == 200
        # After logout, /auth/me should fail
        r2 = s.get(f"{API}/auth/me", timeout=10)
        assert r2.status_code == 401


# ------------------ Resume CRUD ------------------
class TestResumes:
    def test_create_list_get_update_delete_resume(self, user_session):
        s = user_session
        # CREATE
        r = s.post(f"{API}/resumes", json={"name": "TEST_Resume1", "template": "modern-professional", "data": {}}, timeout=15)
        assert r.status_code == 200, r.text
        created = r.json()
        rid = created["id"]
        assert created["name"] == "TEST_Resume1"
        assert created["template"] == "modern-professional"
        assert "_id" not in created

        # LIST
        r = s.get(f"{API}/resumes", timeout=10)
        assert r.status_code == 200
        assert any(x["id"] == rid for x in r.json())

        # GET
        r = s.get(f"{API}/resumes/{rid}", timeout=10)
        assert r.status_code == 200
        assert r.json()["id"] == rid

        # UPDATE
        upd = {"name": "TEST_Resume1_Updated", "template": "minimal-ats", "data": {"objective": "hello"}}
        r = s.put(f"{API}/resumes/{rid}", json=upd, timeout=10)
        assert r.status_code == 200
        # GET to verify persistence
        r = s.get(f"{API}/resumes/{rid}", timeout=10)
        body = r.json()
        assert body["name"] == "TEST_Resume1_Updated"
        assert body["template"] == "minimal-ats"
        assert body["data"]["objective"] == "hello"

        # DUPLICATE
        r = s.post(f"{API}/resumes/{rid}/duplicate", timeout=10)
        assert r.status_code == 200
        dup = r.json()
        assert dup["id"] != rid
        assert "(Copy)" in dup["name"]

        # DELETE
        r = s.delete(f"{API}/resumes/{rid}", timeout=10)
        assert r.status_code == 200
        # Verify deletion
        r = s.get(f"{API}/resumes/{rid}", timeout=10)
        assert r.status_code == 404
        # Cleanup duplicate
        s.delete(f"{API}/resumes/{dup['id']}", timeout=10)

    def test_resume_user_isolation(self):
        # Create two users
        sA = requests.Session()
        emailA, pwA, _ = _new_user("isoA")
        sA.post(f"{API}/auth/register", json={"email": emailA, "password": pwA, "name": "A"}, timeout=15)
        sB = requests.Session()
        emailB, pwB, _ = _new_user("isoB")
        sB.post(f"{API}/auth/register", json={"email": emailB, "password": pwB, "name": "B"}, timeout=15)

        # A creates a resume
        r = sA.post(f"{API}/resumes", json={"name": "TEST_A_resume", "template": "modern-professional", "data": {}}, timeout=15)
        assert r.status_code == 200
        rid = r.json()["id"]

        # B tries to access -> 404
        r = sB.get(f"{API}/resumes/{rid}", timeout=10)
        assert r.status_code == 404
        # B tries to update -> 404
        r = sB.put(f"{API}/resumes/{rid}", json={"name": "x", "template": "modern-professional", "data": {}}, timeout=10)
        assert r.status_code == 404
        # B tries to delete -> 404
        r = sB.delete(f"{API}/resumes/{rid}", timeout=10)
        assert r.status_code == 404
        # B's list does not include A's resume
        r = sB.get(f"{API}/resumes", timeout=10)
        ids = [x["id"] for x in r.json()]
        assert rid not in ids

        # cleanup
        sA.delete(f"{API}/resumes/{rid}", timeout=10)

    def test_resumes_unauthenticated_returns_401(self):
        r = requests.get(f"{API}/resumes", timeout=10)
        assert r.status_code == 401


# ------------------ AI ------------------
class TestAI:
    def test_ai_objective(self, user_session):
        r = user_session.post(
            f"{API}/ai/objective",
            json={"role": "Software Engineer", "skills": ["Python", "React"], "experience_years": "2", "target_role": "Full Stack Engineer"},
            timeout=60,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data.get("text"), str) and len(data["text"]) > 10

    def test_ai_improve_bullet(self, user_session):
        r = user_session.post(
            f"{API}/ai/improve-bullet",
            json={"text": "Worked on backend stuff for the team", "context": "Backend Engineer at startup"},
            timeout=60,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data.get("text"), str) and len(data["text"]) > 5

    def test_ai_score(self, user_session):
        sample = {
            "personal": {"fullName": "Jane Doe", "title": "SWE", "email": "j@x.com"},
            "objective": "Backend engineer with 3 yrs experience.",
            "experience": [{"role": "Engineer", "company": "Acme", "bullets": ["Built APIs"]}],
            "skills": {"technical": ["Python", "FastAPI"]},
        }
        r = user_session.post(f"{API}/ai/score", json={"resume": sample}, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "score" in data
        assert isinstance(data["score"], (int, float))
        assert "strengths" in data
        assert "improvements" in data


# ------------------ Brute force (run LAST) ------------------
class TestZBruteForce:
    """Named with Z prefix to run after all other tests; locks out one isolated user."""

    def test_brute_force_lockout(self):
        # Create dedicated user to lock out (unique email so no collision)
        s = requests.Session()
        email, pw, name = _new_user("brute")
        s.post(f"{API}/auth/register", json={"email": email, "password": pw, "name": name}, timeout=15)

        last_status = None
        for i in range(6):
            r = requests.post(f"{API}/auth/login", json={"email": email, "password": "wrong"}, timeout=10)
            last_status = r.status_code
            if r.status_code == 429:
                break
        # After 5 failed attempts, should return 429
        assert last_status == 429, f"Expected 429 after 5 failed attempts, got {last_status}"
