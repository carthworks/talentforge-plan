# TalentForge — Project Management & Sprint Tracker

India's multi-disciplinary talent verification & project marketplace. This is the internal documentation site and sprint management dashboard built with **Next.js 16**, **TypeScript**, and **Vercel KV** for persistent state.

---

## 🚀 Live URL

> **[talentforge.vercel.app](https://talentforge.vercel.app)**

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5.4 |
| **Styling** | Vanilla CSS (design tokens, dark theme) |
| **State** | React Context + localStorage (client) |
| **Persistence** | Vercel KV (Redis) via API routes |
| **Auth** | Static login system with role-based access |
| **Deployment** | Vercel (Mumbai — `bom1` region) |
| **Icons** | Tabler Icons (CDN) |

---

## 📂 Project Structure

```
docs/
├── app/
│   ├── api/progress/       # GET/PUT — Vercel KV progress persistence
│   ├── api/users/          # GET/POST/PUT/DELETE — Team roster API
│   ├── dashboard/           # Sprint dashboard with sidebar & quick-filtering
│   ├── login/               # Roster credentials sign-in page
│   ├── reports/             # Analytical reports module
│   ├── settings/            # System settings panel (admin-only)
│   ├── sprints/             # 26-sprint overview with task tracking
│   ├── users/               # Team member roster page
│   ├── globals.css          # Design system + all component styles
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home — business plan overview
│   └── providers.tsx        # Auth + Store + Guard composition
├── components/
│   ├── AuthGuard.tsx        # Route protection & loading state
│   ├── Navbar.tsx           # Top navigation (cleaned modules)
│   ├── TaskAssign.tsx       # Team member assignment dropdown
│   ├── TaskNotes.tsx        # Inline task notes editor
│   └── UserBar.tsx          # Logged-in user bar + sprint progress
├── lib/
│   ├── auth.tsx             # Auth context & dynamic roster synchronization
│   └── store.tsx            # Sprint progress & configurations store
├── public/                  # Static assets
├── vercel.json              # Vercel deployment config
├── package.json
└── tsconfig.json
```

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Install & Run

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| `admin@talentforge.in` | `tf2025` | Admin |
| `dev@talentforge.in` | `tf2025` | Developer |
| `designer@talentforge.in` | `tf2025` | Designer |
| `pm@talentforge.in` | `tf2025` | Project Manager |
| `devops@talentforge.in` | `tf2025` | DevOps Engineer |
| `qa@talentforge.in` | `tf2025` | QA Engineer |

---

## 🌐 Deployment (Vercel)

### 1. Link project

```bash
vercel link
```

### 2. Add Vercel KV (optional — app works without it)

1. Go to **Vercel Dashboard** → your project → **Storage**
2. Create a **KV** database → connect to your project
3. Pull environment variables:

```bash
npx vercel env pull .env.local
```

### 3. Deploy

```bash
vercel --prod
```

### Environment Variables

| Variable | Required | Source |
|----------|----------|--------|
| `KV_REST_API_URL` | Optional | Vercel KV (auto-set) |
| `KV_REST_API_TOKEN` | Optional | Vercel KV (auto-set) |

> **Note:** Without KV, the app operates on persistent local database files (`.kv_fallback_users.json` and `.kv_fallback_progress.json` in the root directory). All features, dynamic users, custom tasks, and completions fully survive next builds and dev restarts.

---

## 📊 Features

### Pages

| Route | Description |
|-------|-------------|
| `/` | Business plan overview (8 collapsible sections) |
| `/dashboard` | Sprint dashboard with sidebar, stats, dynamic task edits |
| `/sprints` | 26-sprint breakdown across 4 phases |
| `/users` | Roster management page (add/edit/delete members) |
| `/reports` | Workload analytics and sprint completion metrics |
| `/settings` | System settings configuration panel (admin-only) |
| `/login` | Authentication page |

### Core Functionality

- **Dynamic Authentication & Roster** — Add/edit/delete dynamic users, sync session changes, and manage passwords.
- **Dynamic Task Management** — Inline creation of custom tasks, title/owner editing, and custom task deletion.
- **Assignee & Stack Quick-Filtering** — Instantly filter lists by clicking assignees or role breakdown rows with active clearable badges.
- **System Settings Dashboard** — Category configuration panel (AI engine, adaptive IRT, proctoring sensitivity, subdomains, theme color preview, DPDP, and SOC 2 toggles) protected by Admin-only permissions.
- **Task Tracking & Progress** — Toggle task completion, write custom notes, and view real-time progress percentages.
- **Responsive Shell** — Mobile-first, fully responsive design.

### Data Persistence

```
Client → localStorage (instant, 0ms)
       → debounce 500ms → PUT /api/progress → Vercel KV (Redis)

Page Load:
       ← localStorage (instant hydrate)
       ← GET /api/progress → Vercel KV (background, server = truth)
```

---

## 🏗️ Sprint Phases

| Phase | Period | Sprints | Focus |
|-------|--------|---------|-------|
| 1. Foundation MVP | M1–4 | S1–S8 | Infra, AI engine, student UI, CIE, marketplace, blockchain |
| 2. Gamification | M5–9 | S9–S14 | XP engine, leagues, CIE Mechanical, community pods |
| 3. Blockchain + Trust | M10–14 | S15–S20 | NFT marketplace, SBTs, employer SaaS, NSDC, SOC 2 |
| 4. AI Behavioral + Scale | M15–24 | S21–S24 | Career Twin, DAO, enterprise GTM, international expansion |

---

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 📄 License

Private — Internal use only.
