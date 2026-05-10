# ResumeForge AI — Product Requirements Document

## Original problem statement
Build a fast, modern, SEO-optimized resume builder SaaS for students, freshers, and professionals. Users can create resumes easily, preview live, download ATS-friendly PDFs, manage saved resumes via dashboard, and access from mobile/desktop. Monetization via Google AdSense, affiliate marketing, and (future) premium templates. Must include 5 templates, AI assistance, blog/SEO content, and feel professional — not a college mini project.

## User personas
- **Student / Fresher** — needs simple, education-first resume, low friction, ATS-safe.
- **Job seeker / Career switcher** — needs clean templates that survive Workday/Taleo and quick PDF export.
- **Mid-level professional** — needs polished, conservative formats and AI to sharpen bullets/summary.

## Architecture
- **Frontend**: React + Tailwind + Shadcn/UI, react-router-dom v7, axios with credentials, sonner toasts, html2canvas + jsPDF for PDF export.
- **Backend**: FastAPI + Motor (MongoDB) + bcrypt + PyJWT, httpOnly cookies (SameSite=None, Secure).
- **AI**: Claude Sonnet 4.5 via `emergentintegrations.llm.chat` using Emergent Universal LLM key.
- **Database (Mongo)**: `users`, `resumes`, `login_attempts`, `password_reset_tokens` (with TTL index).

## Core requirements (static)
1. JWT authentication (register/login/logout/me/refresh/forgot/reset)
2. 5 hand-crafted resume templates with same data shape
3. Resume CRUD scoped to user
4. Live preview with template switching
5. AI assistance (objective generation, bullet improvement, scoring)
6. Client-side PDF export (A4, multi-page support)
7. Dashboard with completion-score cards, duplicate/delete actions
8. SEO blog (4 long-form articles) with detail pages
9. AdSense placeholders + affiliate cards (non-functional, ready for codes)
10. Mobile-responsive across all routes

## What's been implemented (2026-02-10)
- ✅ Full JWT auth with brute-force protection (5 attempts → 15-min lockout)
- ✅ Admin seeding (`admin@resumeforge.ai` / `Admin@12345`)
- ✅ Resume CRUD + duplicate, user-scoped
- ✅ 5 templates: Modern Professional, Minimal ATS, Creative, Student, Corporate
- ✅ Live-preview builder with accordion form sections, auto-save (800ms debounce)
- ✅ AI: career objective, bullet improver, AI Score panel — all powered by Claude Sonnet 4.5
- ✅ Client-side PDF export (html2canvas + jsPDF) verified via Playwright download event
- ✅ Landing page (hero, feature bento, template gallery, testimonials, blog teaser, dark CTA)
- ✅ Blog list + 4 evergreen detail posts with SEO meta
- ✅ AdSense placeholder slots + 3 affiliate card examples
- ✅ Cabinet Grotesk-style display via Fraunces serif + IBM Plex Sans body, Klein Blue (#002FA7) accent, amber for AI actions, rounded-none Swiss aesthetic
- ✅ data-testid coverage on every interactive element
- ✅ Tested: 16/16 backend pytest, 10/10 frontend Playwright flows passing

## Iteration 2 (2026-02-10)
- ✅ Forgot password page (`/forgot-password`) + Reset password page (`/reset-password?token=...`)
- ✅ Settings page (`/settings`) — update name, change password, delete account (admin protected)
- ✅ 2 new premium-grade resume templates (free): **Executive**, **Tech Sleek**
- ✅ Public share links: toggle on resume / cover letter; public read endpoints `/r/{slug}` and `/c/{slug}`; auto-generated 10-char slug; copy-to-clipboard popover
- ✅ Cover Letter Generator: list page (`/cover-letters`), full builder workspace (`/cover-letter/:id`) with sender/recipient/body sections, live preview, 2 templates (Classic, Modern), auto-save, share, PDF download
- ✅ Quick AI modal: enter role + company + paste JD → Claude Sonnet 4.5 generates 3-paragraph draft (greeting/body/closing) and pre-fills the letter
- ✅ Real Google AdSense wiring via `REACT_APP_ADSENSE_CLIENT_ID` env (graceful placeholder fallback)
- ✅ `robots.txt` + `sitemap.xml` static files served from `/app/frontend/public/`
- ✅ Bug fix: removed `public_slug: None` from cover-letter insert (was conflicting with sparse-unique index)
- ✅ Tested: 25/25 backend pytest (incl. regression) + 13/13 new frontend flows passing

## Iteration 3 (2026-02-10)
- ✅ **AI Job-Tailor**: `POST /api/ai/tailor` — paste JD, AI returns match score, JD keywords, re-ordered skills (filtered to subset of existing skills server-side), and up to 3 bullet rewrites (with validated indices). Frontend modal in Builder workspace with two action paths: "Apply to this resume" (in-place edit + auto-save) or "Save as new copy" (creates `{name} — {company}` resume and navigates).
- ✅ Defensive server-side validation of AI tailor output (filters skills not in input, validates bullet section/item_index/bullet_index ranges, clamps match_score 0–100).
- ✅ **Email delivery (Resend)** for password reset: HTML + text email with 1-hr token; gracefully falls back to stdout `[email-stub]` log when `RESEND_API_KEY` is empty.
- ✅ Tailor button visible on all viewports (was lg:-only).
- ✅ Tested: 35/35 backend pytest (incl. all regression) + 9/9 new frontend flows passing.

## Prioritized backlog
### P1 (next iteration)
- Forgot/reset password flow UI pages (backend ready)
- Profile/settings page (change password, delete account)
- Resume version history (last 5 saves)
- Real Google AdSense code wiring once approved
- Sitemap.xml + robots.txt + per-page canonical URLs

### P2
- Premium templates (paid) + Stripe integration
- Cover letter generator
- Public shareable resume link (read-only URL)
- Multi-page PDF with proper page breaks per section
- "Resume Score" persisted on each resume

### P3
- AI keyword tailoring against pasted job description
- Server-side puppeteer PDF for pixel-perfect export
- Team / Career counsellor dashboard
- Internationalization (Hindi, Spanish)

## Test credentials
- Admin: `admin@resumeforge.ai` / `Admin@12345`
- See `/app/memory/test_credentials.md`
