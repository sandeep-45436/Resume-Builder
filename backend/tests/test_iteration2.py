"""ResumeForge AI - Iteration 2 backend tests
Covers:
- Profile (PUT /auth/profile, POST /auth/change-password, DELETE /auth/account)
- Resume share (POST /resumes/{id}/share, GET /share/resume/{slug})
- Cover Letter CRUD + share (GET/POST/PUT/DELETE /cover-letters, GET /share/cover-letter/{slug})
- AI cover letter (POST /ai/cover-letter)
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://resume-forge-278.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@resumeforge.ai"
ADMIN_PASS = "Admin@12345"


def _new_user(prefix="i2user"):
    email = f"TEST_{prefix}_{uuid.uuid4().hex[:8]}@resumeforge.ai"
    return email, "Test@12345", "Iter2 User"


@pytest.fixture(scope="module")
def user_session():
    s = requests.Session()
    email, pw, name = _new_user("profile")
    r = s.post(f"{API}/auth/register", json={"email": email, "password": pw, "name": name}, timeout=15)
    assert r.status_code == 200, r.text
    s._email = email
    s._password = pw
    return s


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS}, timeout=15)
    assert r.status_code == 200, r.text
    return s


# ---------------- Profile ----------------
class TestProfile:
    def test_update_profile_name_persists(self, user_session):
        new_name = "Iter2 Updated Name"
        r = user_session.put(f"{API}/auth/profile", json={"name": new_name}, timeout=15)
        assert r.status_code == 200, r.text
        assert r.json()["name"] == new_name
        # GET /auth/me should reflect the change
        me = user_session.get(f"{API}/auth/me", timeout=10)
        assert me.status_code == 200
        assert me.json()["name"] == new_name

    def test_change_password_wrong_current_returns_400(self, user_session):
        r = user_session.post(
            f"{API}/auth/change-password",
            json={"current_password": "wrong-pass", "new_password": "NewPass@123"},
            timeout=15,
        )
        assert r.status_code == 400

    def test_change_password_success_then_login_with_new(self):
        s = requests.Session()
        email, pw, name = _new_user("pwch")
        s.post(f"{API}/auth/register", json={"email": email, "password": pw, "name": name}, timeout=15)
        new_pw = "NewPass@456"
        r = s.post(
            f"{API}/auth/change-password",
            json={"current_password": pw, "new_password": new_pw},
            timeout=15,
        )
        assert r.status_code == 200, r.text
        # Login with new password should work
        s2 = requests.Session()
        r2 = s2.post(f"{API}/auth/login", json={"email": email, "password": new_pw}, timeout=15)
        assert r2.status_code == 200
        # Old password should fail
        r3 = requests.post(f"{API}/auth/login", json={"email": email, "password": pw}, timeout=15)
        assert r3.status_code == 401

    def test_delete_account_admin_blocked(self, admin_session):
        r = admin_session.delete(f"{API}/auth/account", timeout=10)
        assert r.status_code == 400

    def test_delete_account_user_succeeds_and_cascades(self):
        s = requests.Session()
        email, pw, name = _new_user("delacc")
        s.post(f"{API}/auth/register", json={"email": email, "password": pw, "name": name}, timeout=15)

        # Create a resume + cover letter for the user
        r = s.post(f"{API}/resumes", json={"name": "TEST_del_resume", "template": "modern-professional", "data": {}}, timeout=15)
        assert r.status_code == 200
        r = s.post(f"{API}/cover-letters", json={"name": "TEST_del_cl", "template": "classic-letter", "data": {}}, timeout=15)
        assert r.status_code == 200

        # Delete account
        r = s.delete(f"{API}/auth/account", timeout=15)
        assert r.status_code == 200
        # Subsequent /auth/me should be 401
        r = s.get(f"{API}/auth/me", timeout=10)
        assert r.status_code == 401
        # Login should fail
        r = requests.post(f"{API}/auth/login", json={"email": email, "password": pw}, timeout=10)
        assert r.status_code == 401


# ---------------- Resume share ----------------
class TestResumeShare:
    def test_resume_share_toggle_and_public_get(self, user_session):
        s = user_session
        # Create a resume
        r = s.post(f"{API}/resumes", json={"name": "TEST_share_res", "template": "modern-professional", "data": {"objective": "hi"}}, timeout=15)
        assert r.status_code == 200
        rid = r.json()["id"]

        # Toggle share on
        r = s.post(f"{API}/resumes/{rid}/share", json={"is_public": True}, timeout=10)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["is_public"] is True
        slug = body["public_slug"]
        assert isinstance(slug, str) and len(slug) >= 6

        # Public GET (no auth)
        pub = requests.get(f"{API}/share/resume/{slug}", timeout=10)
        assert pub.status_code == 200, pub.text
        pdata = pub.json()
        assert pdata["id"] == rid
        assert "user_id" not in pdata
        assert "_id" not in pdata

        # Toggle off -> public GET should 404
        r = s.post(f"{API}/resumes/{rid}/share", json={"is_public": False}, timeout=10)
        assert r.status_code == 200
        pub2 = requests.get(f"{API}/share/resume/{slug}", timeout=10)
        assert pub2.status_code == 404

        # Cleanup
        s.delete(f"{API}/resumes/{rid}", timeout=10)


# ---------------- Cover Letter CRUD + share ----------------
class TestCoverLetters:
    def test_cover_letter_full_crud(self, user_session):
        s = user_session
        # CREATE
        r = s.post(f"{API}/cover-letters", json={"name": "TEST_CL1", "template": "classic-letter", "data": {}}, timeout=15)
        assert r.status_code == 200, r.text
        created = r.json()
        cid = created["id"]
        assert created["name"] == "TEST_CL1"
        assert created["template"] == "classic-letter"
        assert "_id" not in created
        assert created["is_public"] is False

        # LIST
        r = s.get(f"{API}/cover-letters", timeout=10)
        assert r.status_code == 200
        assert any(x["id"] == cid for x in r.json())

        # GET
        r = s.get(f"{API}/cover-letters/{cid}", timeout=10)
        assert r.status_code == 200
        assert r.json()["id"] == cid

        # UPDATE
        upd = {"name": "TEST_CL1_Updated", "template": "modern-letter", "data": {"greeting": "Hi"}}
        r = s.put(f"{API}/cover-letters/{cid}", json=upd, timeout=10)
        assert r.status_code == 200
        body = r.json()
        assert body["name"] == "TEST_CL1_Updated"
        assert body["template"] == "modern-letter"
        assert body["data"]["greeting"] == "Hi"

        # SHARE on
        r = s.post(f"{API}/cover-letters/{cid}/share", json={"is_public": True}, timeout=10)
        assert r.status_code == 200
        slug = r.json()["public_slug"]
        assert isinstance(slug, str) and len(slug) >= 6

        # Public GET
        pub = requests.get(f"{API}/share/cover-letter/{slug}", timeout=10)
        assert pub.status_code == 200
        pdata = pub.json()
        assert pdata["id"] == cid
        assert "user_id" not in pdata

        # SHARE off -> 404
        r = s.post(f"{API}/cover-letters/{cid}/share", json={"is_public": False}, timeout=10)
        assert r.status_code == 200
        pub2 = requests.get(f"{API}/share/cover-letter/{slug}", timeout=10)
        assert pub2.status_code == 404

        # DELETE
        r = s.delete(f"{API}/cover-letters/{cid}", timeout=10)
        assert r.status_code == 200
        r = s.get(f"{API}/cover-letters/{cid}", timeout=10)
        assert r.status_code == 404

    def test_cover_letter_unauthenticated_returns_401(self):
        r = requests.get(f"{API}/cover-letters", timeout=10)
        assert r.status_code == 401


# ---------------- AI Cover Letter ----------------
class TestAICoverLetter:
    def test_ai_cover_letter_returns_structured(self, user_session):
        payload = {
            "role": "Senior Backend Engineer",
            "company": "Acme Corp",
            "job_description": "We need someone with 5+ years of Python, FastAPI, and distributed systems experience to scale our payments platform.",
            "sender": {
                "fullName": "Jane Doe",
                "title": "Backend Engineer",
                "skills": ["Python", "FastAPI", "PostgreSQL", "Kubernetes"],
                "experience": [{"role": "Backend Engineer", "company": "StartupX"}],
            },
            "tone": "professional",
        }
        r = user_session.post(f"{API}/ai/cover-letter", json=payload, timeout=90)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "greeting" in data
        assert "body" in data
        assert "closing" in data
        assert isinstance(data["body"], list)
        assert len(data["body"]) >= 1
        # Body content should be non-trivial
        joined = " ".join(data["body"])
        assert len(joined) > 50
