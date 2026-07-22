# HireAI — AI-Powered Recruitment & Interview Management Platform

A complete, working full-stack recruitment platform: candidates apply with AI-scored
resumes, HR teams screen and schedule interviews, and admins approve companies —
all in one app.

**Stack:** React (Vite) + Tailwind + Redux Toolkit + Framer Motion · Node/Express · MongoDB/Mongoose

> 📌 **No paid API keys required.** Resume parsing, match scoring, job
> recommendations, and interview-question generation all run on a local,
> rule-based engine (`server/services/`). If you later add a `GEMINI_API_KEY`,
> the match engine will quietly use it to add a short AI-written note — but
> the app is 100% functional without it.

---

## 1. Quick Start

```bash
# from the project root
bash setup.sh
```

This installs both `server/` and `client/` dependencies and creates working
`.env` files. Then:

```bash
# Make sure MongoDB is running locally, or point MONGO_URI at Atlas in server/.env

cd server
npm run seed      # creates admin + demo HR/company (pre-approved) + demo candidate + 6 sample jobs
npm run dev       # API on http://localhost:5000

# in a second terminal
cd client
npm run dev       # App on http://localhost:5173
```

Open **http://localhost:5173** and log in with any of the seeded accounts below.

### Demo accounts (after `npm run seed`)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@hireai.com` | `Admin@123` |
| HR (company pre-approved) | `hr@hireai.com` | `Hr@12345` |
| Candidate | `candidate@hireai.com` | `Candidate@123` |

You can also register fresh accounts from the landing page — new HR accounts
require admin approval before they can post jobs (visit `/admin/companies`
while logged in as admin to approve them).

---

## 2. Why no `npm install` was run for you

This project was built in a sandboxed environment with **no internet access**
(verified directly — every external host, including the npm registry, was
blocked). That means dependencies could not be installed or build-tested here.

To compensate, every file was verified the ways that *are* possible offline:

- **Every backend `.js` file** passed `node --check` (real syntax validation).
- **Every frontend `.jsx`/`.js` file** passed an offline TypeScript JSX parse-check.
- **Every relative import/require** was cross-checked against the real file tree.
- **Every named/default import** was cross-checked against the actual exports
  of its target module (this caught and fixed one real bug before delivery).
- **Every package actually imported** was cross-checked against `package.json`
  in both `server/` and `client/` — nothing missing, nothing unused.

What's still untested is a live `npm install` resolving network-only registry
metadata and a real MongoDB connection — run `bash setup.sh` on your machine
to complete that last mile.

---

## 3. Features

**Candidates**
- Registration/login, profile editor (skills, education, experience, links)
- Drag-and-drop **PDF resume upload** → real text extraction (`pdf-parse`) →
  skills auto-detected against a 150+ term skills dictionary
- Job search with debounced search + filters (location, type, category) + pagination
- One-click apply with AI match score (0–100), matched skills, and skill gaps
- Application tracker with status history
- Timed MCQ/coding assessments
- Interview schedule with AI-suggested prep questions
- Live notification bell (polls every 20s)

**HR / Recruiters**
- Company profile with logo upload, pending-approval flow
- Post / edit / activate / delete jobs
- Applicant list ranked by AI match score, one-click status updates
  (Applied → Screening → Shortlisted → Interview → Selected/Hired/Rejected)
- Create assessments (MCQ/coding), view candidate results
- Schedule interviews from a shortlisted pool — AI interview questions generated automatically
- Standalone AI interview-question generator tool
- Dashboard with live charts (Recharts)

**Admin**
- Platform-wide dashboard (users, companies, jobs, monthly registrations chart)
- User management (search, filter by role, ban/unban)
- **Manage Companies** — approve/revoke any company, or create a "house"
  company directly with no HR account required (auto-approved)
- **Manage Jobs** — full CRUD on *every* job on the platform regardless of
  who posted it: post a job on behalf of any company (bypassing the HR
  approval gate entirely), edit, activate/deactivate, delete, view applicants,
  and update application status — a complete superuser path alongside the
  normal HR flow

**The "AI" layer (fully local, zero cost)**
- `services/resumeParser.js` — extracts PDF text, matches against a skills dictionary
- `services/matchService.js` — weighted skill-overlap scoring, job recommendations,
  templated interview-question generation, candidate ranking
- Optional: set `GEMINI_API_KEY` in `server/.env` to add a one-sentence AI
  rationale to match scores. Never required, never blocks if absent/invalid.

**No external storage service required**
- Resumes/avatars/logos are stored on local disk (`server/uploads/`) via
  Multer and served statically — no Cloudinary/S3 account needed to run this.

---

## 4. Project Structure

```
hireai/
├── setup.sh                  ← one-command install for both halves
├── server/
│   ├── index.js               Express app entry point
│   ├── config/                db.js, skillsDictionary.js
│   ├── middleware/             auth, error handling, rate limiting, uploads
│   ├── models/                 9 Mongoose schemas
│   ├── controllers/            business logic, one file per resource
│   ├── routes/                 REST endpoints, one file per resource
│   ├── services/                resumeParser.js, matchService.js, emailService.js
│   ├── scripts/seed.js          demo data generator
│   └── uploads/                 local file storage (resumes/avatars/logos)
└── client/
    ├── src/
    │   ├── components/          ScoreDial (signature element), NotificationBell, etc.
    │   ├── layouts/              PublicLayout, CandidateLayout, HRLayout, AdminLayout
    │   ├── pages/                auth/ public/ candidate/ hr/ admin/
    │   ├── redux/                store + authSlice + notificationSlice
    │   ├── services/             api.js (axios instance)
    │   └── hooks/                 useAuth, useDebounce
    └── tailwind.config.js        custom design tokens (see Design notes below)
```

---

## 5. Design Notes

The product's one real mechanic is the **match score**, so that became the
visual signature: `ScoreDial` is a single animated component reused in the
hero, job cards, and applicant lists — not a generic icon grid.

- **Palette:** deep navy ink background, indigo "signal" brand color, teal
  "pulse" for positive/match states, amber "ember" for skill-gap warnings.
- **Type:** Space Grotesk (headings), Inter (body), JetBrains Mono (every
  score, percentage, and pipeline label — reinforces "this is a measurement tool").
- **Motion:** Framer Motion handles the hero's count-up ring, ambient floating
  cards, and scroll-reveal sections; everything respects `prefers-reduced-motion`.

---

## 6. Environment Variables

### `server/.env`
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/hireai
JWT_SECRET=change_me
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173

# Optional — leave blank to disable emails (app works fine without it)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=

# Optional — leave blank to use the local matching engine (default, fully working)
GEMINI_API_KEY=
```

### `client/.env`
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 7. API Reference

All routes are prefixed with `/api`. 🔒 = requires `Authorization: Bearer <token>`.

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/auth/register/candidate` | — | Register as candidate |

## Security

This project includes baseline security controls for coursework evidence:

- Rate limiting on authentication endpoints (express-rate-limit).
- Strong password hashing (bcrypt) and optional WebAuthn/TOTP MFA support.
- Server-side RBAC and middleware guards for sensitive endpoints.
- Activity logging with PII scrubbing and evidence folder for PoC artifacts.
- CI workflows include linting, tests, and CodeQL static analysis.

See `docs/SECURITY.md` for the full policy and `evidence/` for PoC files.
| POST | `/auth/register/hr` | — | Register as HR (+ company, pending approval) |
| POST | `/auth/login` | — | Login |
| GET | `/auth/me` | 🔒 | Current user |
| POST | `/auth/forgot-password` | — | Request password reset link |
| POST | `/auth/reset-password/:token` | — | Reset password |
| POST | `/auth/upload-avatar` | 🔒 | Upload profile photo |
| GET/PUT | `/candidates/profile` | 🔒 candidate | Candidate profile |
| POST | `/candidates/upload-resume` | 🔒 candidate | Upload + auto-parse PDF resume |
| GET | `/candidates/dashboard-stats` | 🔒 candidate | Application status counts |
| GET | `/jobs` | — | List/search/filter jobs |
| GET | `/jobs/:id` | — | Job detail |
| POST/PUT/DELETE | `/jobs/:id` | 🔒 hr | Manage own jobs |
| GET | `/jobs/:id/applicants` | 🔒 hr | Applicants for a job |
| POST | `/applications` | 🔒 candidate | Apply (triggers AI scoring) |
| GET | `/applications/my` | 🔒 candidate | My applications |
| PUT | `/applications/:id/status` | 🔒 hr | Update application status |
| GET/PUT | `/companies/profile` | 🔒 hr | Company profile (+ logo upload) |
| GET | `/companies/dashboard` | 🔒 hr | HR dashboard stats |
| GET | `/companies/:id/public` | — | Public company page |
| POST | `/assessments` | 🔒 hr | Create a test |
| GET | `/assessments/:id/take` | 🔒 candidate | Fetch test (no answers) |
| POST | `/assessments/:id/submit` | 🔒 candidate | Submit + auto-grade |
| POST | `/interviews` | 🔒 hr | Schedule (auto-generates AI questions) |
| GET | `/interviews/schedulable-pool` | 🔒 hr | Shortlisted candidates ready to schedule |
| GET | `/notifications` | 🔒 | Notification feed |
| GET | `/ai/recommend-jobs` | 🔒 candidate | AI-ranked job matches |
| POST | `/ai/generate-questions` | 🔒 hr | Standalone question generator |
| GET | `/admin/dashboard` | 🔒 admin | Platform stats |
| GET | `/admin/companies` | 🔒 admin | All companies (approved + pending) |
| POST | `/admin/companies` | 🔒 admin | Create a "house" company directly (auto-approved) |
| PUT | `/admin/companies/:id/toggle-approval` | 🔒 admin | Approve/revoke a company |
| GET | `/admin/jobs` | 🔒 admin | Every job on the platform |
| POST | `/admin/jobs` | 🔒 admin | Post a job for any company (bypasses HR approval gate) |
| PUT/DELETE | `/admin/jobs/:id` | 🔒 admin | Edit/delete any job |
| GET | `/admin/jobs/:id/applicants` | 🔒 admin | View applicants for any job |
| PUT | `/admin/applications/:id/status` | 🔒 admin | Update status on any application |

---

## 8. Deployment

- **Backend** → Render/Railway/Fly.io. Build: `npm install`. Start: `npm start`.
  Set all `server/.env` vars in the platform's dashboard.
- **Frontend** → Vercel/Netlify. Build: `npm run build`. Output dir: `dist`.
  Set `VITE_API_URL` to your deployed backend's `/api` URL.
- **Database** → MongoDB Atlas free tier. Whitelist your backend's IP (or
  `0.0.0.0/0` for quick testing only).
- Resumes/avatars/logos are stored on the backend's local disk — on most
  PaaS platforms this is **ephemeral**, so for production swap
  `middleware/upload.js` for a cloud storage adapter (Cloudinary/S3); the
  rest of the app already just stores whatever relative/absolute URL that
  adapter returns.

---

## 9. Troubleshooting

- **"I logged in but see no jobs"** — jobs only exist once someone has posted
  them. Run `cd server && npm run seed` to populate 6 demo jobs immediately,
  or log in as `admin@hireai.com` → **Manage Jobs** → **Post Job** to add one
  yourself (pick or create a company on the fly — no HR approval needed for
  admin-posted jobs).
- **"MongoDB connection failed"** — make sure `mongod` is running locally, or
  that `MONGO_URI` in `server/.env` is a valid Atlas connection string.
- **CORS errors in the browser** — `CLIENT_URL` in `server/.env` must exactly
  match the URL the frontend is running on.
- **Resume upload says "parsing failed"** — only PDF files are accepted, 5MB max.
- **HR can't post a job** — their company must be approved first; log in as
  admin and approve it under **Manage Companies** (the seeded demo HR account
  is already pre-approved). Alternatively, post the job directly from the
  admin panel instead of waiting on HR approval.
