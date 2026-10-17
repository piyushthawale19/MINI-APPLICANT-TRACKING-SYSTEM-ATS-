# EarlyJobs ATS — Mini Applicant Tracking System

A professional, full-stack Applicant Tracking System built with **Next.js 15**, **TypeScript**, **MongoDB**, and **Tailwind CSS**.

---

## Features

- **Authentication**: JWT-based login/register with bcrypt password hashing (HttpOnly cookies)
- **Candidate Management**: Full CRUD with search, multi-field filtering, sort, and pagination
- **Recruitment Pipeline**: Kanban board with stage transitions persisted to DB
- **Dashboard**: Real-time metrics from actual database records (not fake data)
- **Responsive**: Works on desktop, tablet, and mobile
- **Security**: Protected routes via Next.js middleware, ownership checks on all API operations

---

## Quick Start

### 1. Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### 2. Installation

```bash
cd mini-ats
npm install
```

### 3. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local .env.local.example
```

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Strong random string (min 32 chars) |

**Example**:
```env
MONGODB_URI=mongodb://localhost:27017/earljobs-ats
JWT_SECRET=super-secret-jwt-key-change-this-to-something-secure-32-chars-min
```

### 4. (Optional) Seed Demo Data

```bash
npx ts-node scripts/seed.ts
```

Demo credentials: `demo@earljobs.ai` / `demo123456`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
src/
  app/
    (auth)/          # Login & Register pages
    (dashboard)/     # Protected app pages
      dashboard/     # Analytics & overview
      candidates/    # CRUD + table
      pipeline/      # Kanban board
    api/             # REST API routes
  components/
    layout/          # Sidebar, TopNav, AppShell
    dashboard/       # StatCard, PipelineChart, RecentActivity
    candidates/      # CandidateTable, CandidateForm
    pipeline/        # KanbanBoard
    shared/          # Loading, Empty, Error, Confirm, Badge
  lib/
    db.ts            # MongoDB connection
    auth.ts          # JWT helpers
    utils.ts         # Utilities
  models/
    User.ts
    Candidate.ts
  types/
    index.ts
  middleware.ts      # Route protection
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout (clears cookie) |
| GET | `/api/auth/me` | Current user |
| GET | `/api/candidates` | List (paginated, filtered) |
| POST | `/api/candidates` | Create candidate |
| GET | `/api/candidates/:id` | Get candidate |
| PUT | `/api/candidates/:id` | Update candidate |
| DELETE | `/api/candidates/:id` | Delete candidate |
| PATCH | `/api/candidates/:id/stage` | Update stage only |
| GET | `/api/dashboard/stats` | Dashboard metrics |

---

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT stored as HttpOnly cookie (not localStorage)
- All private routes protected by Next.js middleware
- All API operations check candidate ownership (no cross-user data access)
- No secrets hardcoded in source

---

## Deployment (Vercel)

```bash
npm run build
```

Set these environment variables in your Vercel project:
- `MONGODB_URI` — Your MongoDB Atlas connection string
- `JWT_SECRET` — A strong, unique secret

---

## Hiring Stages

`Applied → Screening → Interview → Offer → Hired | Rejected`
