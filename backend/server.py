from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import logging
import secrets
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any

import bcrypt
import jwt
import asyncio
import resend
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field
from emergentintegrations.llm.chat import LlmChat, UserMessage


# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("resumeforge")

mongo_url = os.environ["MONGO_URL"]
db_name = os.environ["DB_NAME"]
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_MIN = 60 * 24  # 1 day
REFRESH_TOKEN_DAYS = 7
LOCKOUT_THRESHOLD = 5
LOCKOUT_MINUTES = 15

app = FastAPI(title="ResumeForge AI")
api_router = APIRouter(prefix="/api")


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordIn(BaseModel):
    email: EmailStr


class ResetPasswordIn(BaseModel):
    token: str
    new_password: str = Field(min_length=6)


class UserOut(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str = "user"
    created_at: str


class ResumeIn(BaseModel):
    name: str = "Untitled Resume"
    template: str = "modern-professional"
    data: Dict[str, Any] = Field(default_factory=dict)


class ResumeOut(BaseModel):
    id: str
    user_id: str
    name: str
    template: str
    data: Dict[str, Any]
    created_at: str
    updated_at: str


class AIObjectiveIn(BaseModel):
    role: str
    skills: List[str] = []
    experience_years: Optional[str] = None
    target_role: Optional[str] = None


class AIBulletIn(BaseModel):
    text: str
    context: Optional[str] = None  # role / project name


class AIScoreIn(BaseModel):
    resume: Dict[str, Any]


class UpdateProfileIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)


class ChangePasswordIn(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6)


class ShareToggleIn(BaseModel):
    is_public: bool


class CoverLetterIn(BaseModel):
    name: str = "Untitled Cover Letter"
    template: str = "classic-letter"
    data: Dict[str, Any] = Field(default_factory=dict)


class AICoverLetterIn(BaseModel):
    role: str
    company: str
    job_description: Optional[str] = None
    sender: Dict[str, Any] = Field(default_factory=dict)
    tone: Optional[str] = "professional"


class AITailorIn(BaseModel):
    resume: Dict[str, Any]
    job_description: str
    role: Optional[str] = None
    company: Optional[str] = None



# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_MIN),
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "type": "refresh",
        "exp": datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_DAYS),
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, access: str, refresh: str) -> None:
    response.set_cookie(
        key="access_token",
        value=access,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=ACCESS_TOKEN_MIN * 60,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=REFRESH_TOKEN_DAYS * 24 * 3600,
        path="/",
    )


def clear_auth_cookies(response: Response) -> None:
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")


def user_to_out(u: dict) -> dict:
    return {
        "id": u["id"],
        "email": u["email"],
        "name": u.get("name", ""),
        "role": u.get("role", "user"),
        "created_at": u["created_at"],
    }


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def get_client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


# ---------------------------------------------------------------------------
# Auth Endpoints
# ---------------------------------------------------------------------------

@api_router.post("/auth/register")
async def register(body: RegisterIn, response: Response):
    email = body.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": user_id,
        "email": email,
        "password_hash": hash_password(body.password),
        "name": body.name.strip(),
        "role": "user",
        "created_at": now,
    }
    await db.users.insert_one(doc)
    access = create_access_token(user_id, email)
    refresh = create_refresh_token(user_id)
    set_auth_cookies(response, access, refresh)
    return user_to_out(doc)


@api_router.post("/auth/login")
async def login(body: LoginIn, request: Request, response: Response):
    email = body.email.lower().strip()
    ip = get_client_ip(request)
    identifier = f"{ip}:{email}"

    # brute force lockout
    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt and attempt.get("count", 0) >= LOCKOUT_THRESHOLD:
        locked_until = attempt.get("locked_until")
        if locked_until and datetime.fromisoformat(locked_until) > datetime.now(timezone.utc):
            raise HTTPException(status_code=429, detail="Too many failed attempts. Try again later.")

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        new_count = (attempt.get("count", 0) if attempt else 0) + 1
        update = {"identifier": identifier, "count": new_count}
        if new_count >= LOCKOUT_THRESHOLD:
            update["locked_until"] = (datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_MINUTES)).isoformat()
        await db.login_attempts.update_one(
            {"identifier": identifier}, {"$set": update}, upsert=True
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")

    await db.login_attempts.delete_one({"identifier": identifier})
    access = create_access_token(user["id"], email)
    refresh = create_refresh_token(user["id"])
    set_auth_cookies(response, access, refresh)
    return user_to_out(user)


@api_router.post("/auth/logout")
async def logout(response: Response, _user: dict = Depends(get_current_user)):
    clear_auth_cookies(response)
    return {"ok": True}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user_to_out(user)


@api_router.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        access = create_access_token(user["id"], user["email"])
        response.set_cookie(
            key="access_token",
            value=access,
            httponly=True,
            secure=True,
            samesite="none",
            max_age=ACCESS_TOKEN_MIN * 60,
            path="/",
        )
        return {"ok": True}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


@api_router.post("/auth/forgot-password")
async def forgot_password(body: ForgotPasswordIn):
    email = body.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if user:
        token = secrets.token_urlsafe(32)
        await db.password_reset_tokens.insert_one({
            "token": token,
            "user_id": user["id"],
            "used": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "expires_at": datetime.now(timezone.utc) + timedelta(hours=1),
        })
        frontend = os.environ.get("FRONTEND_URL", "http://localhost:3000")
        link = f"{frontend}/reset-password?token={token}"
        await send_password_reset_email(email, user.get("name") or "there", link)
    # Same response either way to prevent enumeration
    return {"ok": True, "message": "If the email exists, a reset link has been sent."}


async def send_password_reset_email(to_email: str, name: str, link: str) -> None:
    api_key = os.environ.get("RESEND_API_KEY", "").strip()
    if not api_key:
        logger.info(f"[email-stub] Password reset for {to_email}: {link}")
        return
    sender = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
    subject = "Reset your ResumeForge AI password"
    text = (
        f"Hi {name},\n\n"
        f"Use the link below to reset your ResumeForge AI password. "
        f"It expires in 1 hour.\n\n{link}\n\n"
        "If you did not request this, you can safely ignore this email."
    )
    html = f"""
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf9;padding:32px 0;font-family:'IBM Plex Sans',-apple-system,Helvetica,Arial,sans-serif;color:#0c0a09;">
      <tr><td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e7e5e4;padding:32px;">
          <tr><td>
            <div style="font-family:'Fraunces',Georgia,serif;font-size:22px;font-weight:700;color:#0c0a09;">ResumeForge <span style="color:#d97706;font-size:11px;letter-spacing:0.2em;">AI</span></div>
            <h1 style="font-family:'Fraunces',Georgia,serif;font-size:28px;line-height:1.15;margin:24px 0 8px;">Reset your password</h1>
            <p style="color:#44403c;font-size:14px;line-height:1.6;margin:0 0 24px;">Hi {name}, click the button below to set a new password. This link expires in 1 hour.</p>
            <a href="{link}" style="display:inline-block;background:#002FA7;color:#fff;text-decoration:none;padding:12px 22px;font-weight:600;font-size:14px;">Reset password &rarr;</a>
            <p style="color:#78716c;font-size:12px;line-height:1.6;margin:28px 0 0;">If the button doesn't work, paste this URL into your browser:<br><span style="color:#002FA7;word-break:break-all;">{link}</span></p>
            <p style="color:#a8a29e;font-size:12px;margin:28px 0 0;border-top:1px solid #e7e5e4;padding-top:16px;">If you didn't request this, ignore this email &mdash; your password won't change.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
    """
    try:
        resend.api_key = api_key
        await asyncio.to_thread(
            resend.Emails.send,
            {"from": sender, "to": [to_email], "subject": subject, "html": html, "text": text},
        )
        logger.info(f"Password reset email sent to {to_email}")
    except Exception as e:
        logger.exception(f"Resend send failed for {to_email}: {e}")


@api_router.post("/auth/reset-password")
async def reset_password(body: ResetPasswordIn):
    record = await db.password_reset_tokens.find_one({"token": body.token, "used": False})
    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    expires_at = record["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at < datetime.now(timezone.utc).replace(tzinfo=expires_at.tzinfo):
        raise HTTPException(status_code=400, detail="Token expired")
    new_hash = hash_password(body.new_password)
    await db.users.update_one({"id": record["user_id"]}, {"$set": {"password_hash": new_hash}})
    await db.password_reset_tokens.update_one({"token": body.token}, {"$set": {"used": True}})
    return {"ok": True}


# ---------------------------------------------------------------------------
# Resume Endpoints
# ---------------------------------------------------------------------------

DEFAULT_RESUME_DATA = {
    "personal": {
        "fullName": "",
        "title": "",
        "email": "",
        "phone": "",
        "location": "",
        "linkedin": "",
        "portfolio": "",
        "github": "",
    },
    "objective": "",
    "education": [],
    "experience": [],
    "projects": [],
    "skills": {"technical": [], "soft": [], "languages": []},
    "certifications": [],
    "achievements": [],
}


@api_router.get("/resumes")
async def list_resumes(user: dict = Depends(get_current_user)):
    items = await db.resumes.find({"user_id": user["id"]}, {"_id": 0}).sort("updated_at", -1).to_list(200)
    return items


@api_router.post("/resumes")
async def create_resume(body: ResumeIn, user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    data = body.data if body.data else DEFAULT_RESUME_DATA
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "name": body.name,
        "template": body.template,
        "data": data,
        "created_at": now,
        "updated_at": now,
    }
    await db.resumes.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.get("/resumes/{resume_id}")
async def get_resume(resume_id: str, user: dict = Depends(get_current_user)):
    item = await db.resumes.find_one({"id": resume_id, "user_id": user["id"]}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Resume not found")
    return item


@api_router.put("/resumes/{resume_id}")
async def update_resume(resume_id: str, body: ResumeIn, user: dict = Depends(get_current_user)):
    existing = await db.resumes.find_one({"id": resume_id, "user_id": user["id"]})
    if not existing:
        raise HTTPException(status_code=404, detail="Resume not found")
    update = {
        "name": body.name,
        "template": body.template,
        "data": body.data,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.resumes.update_one({"id": resume_id}, {"$set": update})
    item = await db.resumes.find_one({"id": resume_id}, {"_id": 0})
    return item


@api_router.delete("/resumes/{resume_id}")
async def delete_resume(resume_id: str, user: dict = Depends(get_current_user)):
    res = await db.resumes.delete_one({"id": resume_id, "user_id": user["id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Resume not found")
    return {"ok": True}


@api_router.post("/resumes/{resume_id}/duplicate")
async def duplicate_resume(resume_id: str, user: dict = Depends(get_current_user)):
    src = await db.resumes.find_one({"id": resume_id, "user_id": user["id"]}, {"_id": 0})
    if not src:
        raise HTTPException(status_code=404, detail="Resume not found")
    now = datetime.now(timezone.utc).isoformat()
    new_doc = {
        **src,
        "id": str(uuid.uuid4()),
        "name": f"{src['name']} (Copy)",
        "created_at": now,
        "updated_at": now,
    }
    await db.resumes.insert_one(new_doc)
    new_doc.pop("_id", None)
    return new_doc


# ---------------------------------------------------------------------------
# AI Endpoints (Claude Sonnet 4.5 via emergentintegrations)
# ---------------------------------------------------------------------------

def _llm(session_id: str, system: str) -> LlmChat:
    return LlmChat(
        api_key=os.environ["EMERGENT_LLM_KEY"],
        session_id=session_id,
        system_message=system,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")


@api_router.post("/ai/objective")
async def ai_objective(body: AIObjectiveIn, user: dict = Depends(get_current_user)):
    system = (
        "You are an expert resume writer. Produce a concise, ATS-friendly career objective "
        "in 2-3 sentences (max 60 words). No buzzwords like 'team player' or 'hardworking'. "
        "Be specific, action-driven, and quantifiable when possible. Plain text only, no markdown."
    )
    skills = ", ".join(body.skills) if body.skills else "various technical skills"
    target = body.target_role or body.role
    prompt = (
        f"Write a career objective for a {body.role}.\n"
        f"Target role: {target}.\n"
        f"Years of experience: {body.experience_years or 'unspecified'}.\n"
        f"Key skills: {skills}.\n"
        "Output the objective only, no preamble."
    )
    try:
        chat = _llm(f"objective-{user['id']}-{uuid.uuid4()}", system)
        text = await chat.send_message(UserMessage(text=prompt))
        return {"text": (text or "").strip()}
    except Exception as e:
        logger.exception("AI objective failed")
        raise HTTPException(status_code=502, detail=f"AI generation failed: {e}")


@api_router.post("/ai/improve-bullet")
async def ai_improve_bullet(body: AIBulletIn, user: dict = Depends(get_current_user)):
    system = (
        "You are an expert resume editor. Rewrite the user's experience or project bullet "
        "into one strong, ATS-friendly bullet point. Start with a strong action verb, include "
        "measurable impact when possible, keep it under 28 words, no markdown, no leading dash. "
        "Return the rewritten bullet only."
    )
    ctx = f"Context: {body.context}\n" if body.context else ""
    prompt = f"{ctx}Original bullet: {body.text}\n\nRewrite:"
    try:
        chat = _llm(f"bullet-{user['id']}-{uuid.uuid4()}", system)
        text = await chat.send_message(UserMessage(text=prompt))
        cleaned = (text or "").strip().lstrip("-•").strip()
        return {"text": cleaned}
    except Exception as e:
        logger.exception("AI bullet failed")
        raise HTTPException(status_code=502, detail=f"AI generation failed: {e}")


@api_router.post("/ai/score")
async def ai_score(body: AIScoreIn, user: dict = Depends(get_current_user)):
    system = (
        "You are a strict resume reviewer. Given a resume in JSON, output ONLY a JSON object "
        "with keys: score (integer 0-100), strengths (array of 3 short strings), "
        "improvements (array of 3 short, actionable strings). "
        "No markdown, no commentary outside JSON."
    )
    import json
    prompt = f"Resume JSON:\n{json.dumps(body.resume)[:6000]}\n\nReturn the JSON object."
    try:
        chat = _llm(f"score-{user['id']}-{uuid.uuid4()}", system)
        text = await chat.send_message(UserMessage(text=prompt))
        raw = (text or "").strip()
        # try to find JSON in the response
        start = raw.find("{")
        end = raw.rfind("}")
        if start != -1 and end != -1:
            raw = raw[start : end + 1]
        try:
            parsed = json.loads(raw)
        except Exception:
            parsed = {"score": 60, "strengths": [], "improvements": [raw[:200]]}
        return parsed
    except Exception as e:
        logger.exception("AI score failed")
        raise HTTPException(status_code=502, detail=f"AI generation failed: {e}")


# ---------------------------------------------------------------------------
# Profile / Account Endpoints
# ---------------------------------------------------------------------------

@api_router.put("/auth/profile")
async def update_profile(body: UpdateProfileIn, user: dict = Depends(get_current_user)):
    await db.users.update_one({"id": user["id"]}, {"$set": {"name": body.name.strip()}})
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password_hash": 0})
    return user_to_out(updated)


@api_router.post("/auth/change-password")
async def change_password(body: ChangePasswordIn, user: dict = Depends(get_current_user)):
    full = await db.users.find_one({"id": user["id"]})
    if not full or not verify_password(body.current_password, full["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"password_hash": hash_password(body.new_password)}},
    )
    return {"ok": True}


@api_router.delete("/auth/account")
async def delete_account(response: Response, user: dict = Depends(get_current_user)):
    if user.get("role") == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete admin account")
    await db.resumes.delete_many({"user_id": user["id"]})
    await db.cover_letters.delete_many({"user_id": user["id"]})
    await db.users.delete_one({"id": user["id"]})
    clear_auth_cookies(response)
    return {"ok": True}


# ---------------------------------------------------------------------------
# Resume sharing (public read links)
# ---------------------------------------------------------------------------

def _slug() -> str:
    return secrets.token_urlsafe(8).replace("_", "").replace("-", "")[:10]


@api_router.post("/resumes/{resume_id}/share")
async def toggle_resume_share(resume_id: str, body: ShareToggleIn, user: dict = Depends(get_current_user)):
    existing = await db.resumes.find_one({"id": resume_id, "user_id": user["id"]})
    if not existing:
        raise HTTPException(status_code=404, detail="Resume not found")
    update: Dict[str, Any] = {"is_public": body.is_public}
    if body.is_public and not existing.get("public_slug"):
        update["public_slug"] = _slug()
    await db.resumes.update_one({"id": resume_id}, {"$set": update})
    item = await db.resumes.find_one({"id": resume_id}, {"_id": 0})
    return {"is_public": item.get("is_public", False), "public_slug": item.get("public_slug")}


@api_router.get("/share/resume/{slug}")
async def get_public_resume(slug: str):
    item = await db.resumes.find_one({"public_slug": slug, "is_public": True}, {"_id": 0, "user_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Resume not found or not public")
    return item


@api_router.get("/share/cover-letter/{slug}")
async def get_public_cover_letter(slug: str):
    item = await db.cover_letters.find_one({"public_slug": slug, "is_public": True}, {"_id": 0, "user_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Cover letter not found or not public")
    return item


# ---------------------------------------------------------------------------
# Cover Letters CRUD + AI
# ---------------------------------------------------------------------------

DEFAULT_COVER_LETTER = {
    "sender": {"fullName": "", "title": "", "email": "", "phone": "", "location": "", "linkedin": ""},
    "recipient": {"hiringManager": "", "company": "", "role": "", "address": ""},
    "date": "",
    "greeting": "Dear Hiring Manager,",
    "body": [""],
    "closing": "Sincerely,",
}


@api_router.get("/cover-letters")
async def list_cover_letters(user: dict = Depends(get_current_user)):
    items = await db.cover_letters.find({"user_id": user["id"]}, {"_id": 0}).sort("updated_at", -1).to_list(200)
    return items


@api_router.post("/cover-letters")
async def create_cover_letter(body: CoverLetterIn, user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc).isoformat()
    data = body.data if body.data else DEFAULT_COVER_LETTER
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "name": body.name,
        "template": body.template,
        "data": data,
        "is_public": False,
        # NOTE: do NOT set public_slug to None — unique sparse index in MongoDB
        # still indexes null values, which causes duplicate-key errors on the
        # second insert. Field is added later by /share endpoint.
        "created_at": now,
        "updated_at": now,
    }
    await db.cover_letters.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.get("/cover-letters/{cl_id}")
async def get_cover_letter(cl_id: str, user: dict = Depends(get_current_user)):
    item = await db.cover_letters.find_one({"id": cl_id, "user_id": user["id"]}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Cover letter not found")
    return item


@api_router.put("/cover-letters/{cl_id}")
async def update_cover_letter(cl_id: str, body: CoverLetterIn, user: dict = Depends(get_current_user)):
    existing = await db.cover_letters.find_one({"id": cl_id, "user_id": user["id"]})
    if not existing:
        raise HTTPException(status_code=404, detail="Cover letter not found")
    update = {
        "name": body.name,
        "template": body.template,
        "data": body.data,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.cover_letters.update_one({"id": cl_id}, {"$set": update})
    item = await db.cover_letters.find_one({"id": cl_id}, {"_id": 0})
    return item


@api_router.delete("/cover-letters/{cl_id}")
async def delete_cover_letter(cl_id: str, user: dict = Depends(get_current_user)):
    res = await db.cover_letters.delete_one({"id": cl_id, "user_id": user["id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cover letter not found")
    return {"ok": True}


@api_router.post("/cover-letters/{cl_id}/share")
async def toggle_cover_letter_share(cl_id: str, body: ShareToggleIn, user: dict = Depends(get_current_user)):
    existing = await db.cover_letters.find_one({"id": cl_id, "user_id": user["id"]})
    if not existing:
        raise HTTPException(status_code=404, detail="Cover letter not found")
    update: Dict[str, Any] = {"is_public": body.is_public}
    if body.is_public and not existing.get("public_slug"):
        update["public_slug"] = _slug()
    await db.cover_letters.update_one({"id": cl_id}, {"$set": update})
    item = await db.cover_letters.find_one({"id": cl_id}, {"_id": 0})
    return {"is_public": item.get("is_public", False), "public_slug": item.get("public_slug")}


@api_router.post("/ai/cover-letter")
async def ai_cover_letter(body: AICoverLetterIn, user: dict = Depends(get_current_user)):
    system = (
        "You are an expert career writer. Generate a 3-paragraph cover letter body. "
        "Paragraph 1: a strong opening that names the role and shows genuine interest. "
        "Paragraph 2: 2-3 specific, measurable accomplishments tying the candidate to the role. "
        "Paragraph 3: enthusiastic close with a clear call to action. "
        "Return ONLY a JSON object: {\"greeting\": string, \"body\": [string, string, string], \"closing\": string}. "
        "No markdown. Use a professional, warm tone. Avoid clichés like 'I am writing to express my interest'."
    )
    sender = body.sender or {}
    sender_brief = (
        f"Name: {sender.get('fullName','')}; Title: {sender.get('title','')}; "
        f"Skills: {', '.join((sender.get('skills') or [])[:8])}; "
        f"Recent role: {(sender.get('experience') or [{}])[0].get('role','')} at {(sender.get('experience') or [{}])[0].get('company','')}."
    )
    jd = (body.job_description or "").strip()[:2000]
    prompt = (
        f"Candidate profile: {sender_brief}\n"
        f"Target role: {body.role} at {body.company}\n"
        f"Tone: {body.tone or 'professional'}\n"
        f"Job description (may be empty):\n{jd}\n\n"
        "Return the JSON object only."
    )
    import json
    try:
        chat = _llm(f"cover-{user['id']}-{uuid.uuid4()}", system)
        text = await chat.send_message(UserMessage(text=prompt))
        raw = (text or "").strip()
        start = raw.find("{")
        end = raw.rfind("}")
        if start != -1 and end != -1:
            raw = raw[start : end + 1]
        try:
            parsed = json.loads(raw)
        except Exception:
            parsed = {
                "greeting": "Dear Hiring Manager,",
                "body": [raw[:600]],
                "closing": "Sincerely,",
            }
        if not isinstance(parsed.get("body"), list):
            parsed["body"] = [str(parsed.get("body", ""))]
        return parsed
    except Exception as e:
        logger.exception("AI cover letter failed")
        raise HTTPException(status_code=502, detail=f"AI generation failed: {e}")



# ---------------------------------------------------------------------------
# AI Job Tailor
# ---------------------------------------------------------------------------

@api_router.post("/ai/tailor")
async def ai_tailor(body: AITailorIn, user: dict = Depends(get_current_user)):
    import json
    system = (
        "You are an expert resume tailor. Given a resume JSON and a job description, "
        "tailor the resume to better match the JD WITHOUT fabricating new experience. "
        "Return ONLY a JSON object with these keys:\n"
        "  match_score: integer 0-100 (how well the original resume matches the JD)\n"
        "  keywords_added: array of strings (key JD nouns/phrases the candidate should emphasise)\n"
        "  skills_order: array of strings — the candidate's existing technical skills re-ordered "
        "with the most JD-relevant first; only include skills already present in resume.skills.technical\n"
        "  bullets: array of up to 3 objects, each {\n"
        "    section: 'experience' | 'projects',\n"
        "    item_index: integer (0-based index into resume.experience or resume.projects),\n"
        "    bullet_index: integer (0-based index into that item's bullets),\n"
        "    original: string (the original bullet text),\n"
        "    suggested: string (a stronger, JD-aligned rewrite, 1 sentence, action verb led, measurable, ATS-friendly, <30 words)\n"
        "  }\n"
        "Pick bullets that have the most upside for matching the JD. Do NOT invent metrics or roles. "
        "Output the JSON object only — no markdown, no commentary."
    )
    resume_json = json.dumps(body.resume)[:8000]
    jd = (body.job_description or "").strip()[:4000]
    extra = ""
    if body.role or body.company:
        extra = f"Target: {body.role or ''} at {body.company or ''}.\n"
    prompt = f"{extra}Job description:\n{jd}\n\nResume:\n{resume_json}\n\nReturn the JSON object."
    try:
        chat = _llm(f"tailor-{user['id']}-{uuid.uuid4()}", system)
        text = await chat.send_message(UserMessage(text=prompt))
        raw = (text or "").strip()
        start = raw.find("{")
        end = raw.rfind("}")
        if start != -1 and end != -1:
            raw = raw[start : end + 1]
        try:
            parsed = json.loads(raw)
        except Exception:
            logger.warning("ai_tailor: JSON parse failed")
            parsed = {"match_score": 0, "keywords_added": [], "skills_order": [], "bullets": []}
        parsed.setdefault("match_score", 0)
        parsed.setdefault("keywords_added", [])
        parsed.setdefault("skills_order", [])
        parsed.setdefault("bullets", [])
        if not isinstance(parsed["bullets"], list):
            parsed["bullets"] = []
        return parsed
    except Exception as e:
        logger.exception("AI tailor failed")
        raise HTTPException(status_code=502, detail=f"AI generation failed: {e}")


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@api_router.get("/")
async def root():
    return {"status": "ok", "service": "ResumeForge AI"}


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------

@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier", unique=True)
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
    await db.password_reset_tokens.create_index("token", unique=True)
    await db.resumes.create_index([("user_id", 1), ("updated_at", -1)])
    await db.resumes.create_index("public_slug", unique=True, sparse=True)
    await db.cover_letters.create_index([("user_id", 1), ("updated_at", -1)])
    await db.cover_letters.create_index("public_slug", unique=True, sparse=True)

    # Seed admin user
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@resumeforge.ai").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@12345")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Seeded admin {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )
        logger.info(f"Updated admin password for {admin_email}")


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


# Include router and CORS
app.include_router(api_router)

frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

