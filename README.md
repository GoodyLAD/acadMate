# AcadMate 🎓

**AcadMate** is a full-stack academic management platform built for Smart India Hackathon (SIH). It connects **Students**, **Faculty**, **Admins**, and **Recruiters** under one unified dashboard — enabling course tracking, community interaction, verifiable credentials, GitHub integrations, AI assistance, and much more.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS, Radix UI, Framer Motion, GSAP |
| Backend / DB | Supabase (PostgreSQL + Auth + RLS) |
| State Management | TanStack React Query |
| Routing | React Router DOM v6 |
| Blockchain | Ethers.js, MerkleTree.js (credential anchoring) |
| AI Chatbot | Custom AI component (`ChatbotToggle`) |
| 3D / Animations | Three.js, OGL, Postprocessing |
| Forms | React Hook Form + Zod |
| PDF Generation | html2pdf.js |
| QR Codes | qrcode |
| Charts | Recharts |

---

## 📁 Project Structure

```
SIH2-main/
├── src/
│   ├── pages/          # All route-level page components
│   ├── components/     # Reusable UI & feature components
│   │   ├── admin/      # Admin layout & panels
│   │   ├── ai/         # AI chatbot components
│   │   ├── auth/       # Login / registration UI
│   │   ├── certificates/    # Certificate viewer & issuer
│   │   ├── dashboard/  # Student & Faculty dashboards
│   │   ├── goals/      # Student goal tracking
│   │   ├── integrations/    # Platform integration cards
│   │   ├── layout/     # AppLayout wrapper
│   │   ├── recommendations/ # AI recommendations UI
│   │   ├── routing/    # Role-based route guards
│   │   ├── ui/         # shadcn/ui primitives
│   │   └── verifiableCredentials/  # VC display & verification
│   ├── hooks/          # Custom React hooks
│   ├── services/       # Business logic & API services
│   ├── contexts/       # React contexts (Blockchain)
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility helpers
│   ├── api/            # API route handlers
│   ├── data/           # Static / seed data
│   └── integrations/   # Supabase client & generated types
├── supabase/           # Supabase migrations & config
├── scripts/            # Data population scripts
├── clean_schema.sql    # Production-ready DB schema
└── mock_users.sql      # Seed data for testing
```

---

## 👥 User Roles & Modules

### 🎓 Student
Students have access to a rich, personalized dashboard with the following features:

| Feature | Route | Description |
|---|---|---|
| Dashboard / Home | `/home` | Personalized overview with stats, announcements, quick links |
| Profile | `/profile` | Edit personal info, skills, social links, and avatar |
| Leaderboard | `/leaderboard` | Rank students by points and achievements |
| Events | `/events` | Browse and register for academic/extracurricular events |
| Event Detail | `/events/:id` | Full event info and registration button |
| Event Registration | `/event-registration/:id` | Form-based event sign-up |
| Community | `/community` | Student discussion forums and posts |
| Student Goals | `/student/goals` | Set, track, and complete academic goals |
| Integrations | `/integrations` | Link external platforms (GitHub, LeetCode, Coursera, etc.) |
| Academic Achievements | `/academic-achievements` | View certificates, awards, and milestones |
| Resume Generator | `/resume-generator` | Auto-generate a PDF resume from profile data |
| My Projects | `/my-projects` | Add and track personal/team projects |
| My Activities | `/my-activities` | Log and review extracurricular activities |
| Certificate Management | `/certificate-management` | Upload, view, and manage certificates |
| Student Courses | `/student-courses` | Browse enrolled and available courses |
| GitHub Integration | `/integrations` → GitHub | Connect GitHub account, view repos & stats |
| Credential Verification | `/verify` | Publicly verify a blockchain-anchored credential via QR |

---

### 👩‍🏫 Faculty
Faculty members manage courses, schedules, and student progress.

| Feature | Route | Description |
|---|---|---|
| Faculty Dashboard | `/` (role-based) | Overview of classes, schedule, and pending tasks |
| Courses | `/courses` | Manage course content, assignments, and enrolled students |
| Schedule | `/schedule` | View and manage weekly class timetable |
| Students List | `/faculty/students` | Browse all students under the faculty |
| Student Detail | `/faculty/students/:id` | View individual student profile and progress |
| Faculty Community | `/faculty/community` | Faculty-only discussion and resource sharing |
| Faculty Chat Hub | `/faculty/chat` | Real-time messaging with colleagues and students |

---

### 🔑 Admin (Admin-Level Faculty)
Admins have an elevated panel for system-wide management.

| Feature | Route | Description |
|---|---|---|
| Admin Dashboard | `/admin` | System-wide stats and overview |
| Faculty Management | `/admin/faculty` | Add, edit, deactivate faculty accounts |
| Assignment Management | `/admin/assignments` | Create and assign coursework across departments |
| Integrations Config | `/admin/integrations` | Configure third-party platform API keys and settings |
| Reports | `/admin/reports` | Generate academic and activity reports |
| API Testing | `/admin/api-testing` | Built-in API playground for debugging integrations |
| Debug Panel | `/admin/debug` | Internal debug tools and system health checks |

---

### 🕵️ Recruiter
A separate, self-authenticated portal for recruiters to discover students.

| Feature | Route | Description |
|---|---|---|
| Recruiter Login | `/recruiter/login` | Standalone login (independent of Student/Faculty auth) |
| Recruiter Dashboard | `/recruiter/dashboard` | Browse and filter students by skills, achievements, GPA |
| Student Profile View | `/recruiter/student/:id` | Full read-only view of a student's portfolio |

---

## ⚙️ Core Services

### 🔗 Blockchain & Verifiable Credentials
- **`blockchainService.ts`** — Interact with blockchain (Ethers.js) for credential storage.
- **`blockchainAnchoringService.ts`** — Anchor credential hashes on-chain using Merkle proofs.
- **`verifiableCredentialService.ts`** — Issue, store, and retrieve W3C-style verifiable credentials.
- **`verifiableCredentialServiceSimple.ts`** — Lightweight VC ops for fast verification flows.
- **`keyManagementService.ts`** — Generate and manage cryptographic key pairs.
- **`BlockchainContext.tsx`** — React context exposing blockchain state app-wide.
- **`/verify`** — Public page to verify a credential via QR code or link.

### 🔌 External Platform Integrations
- **`platforms.ts`** — Unified integration layer for GitHub, LeetCode, Coursera, HackerRank, and more.
- **`githubService.ts`** — Fetch repos, commits, contribution graphs via GitHub API.
- **`githubAuth.ts`** — OAuth flow for GitHub account linking.
- **`externalPlatformAPIs.ts`** — Abstracted API calls to all linked external platforms.
- **`externalCourseService.ts`** — Aggregate external courses (Coursera, edX, etc.).
- **`usePlatformIntegration.ts`** — Hook to connect/disconnect platforms and fetch their data.

### 🤖 AI & Recommendations
- **`recommendationService.ts`** — AI-driven course, event, and skill recommendations.
- **`ChatbotToggle`** — Floating AI chatbot assistant available across all pages.

### 🔔 Notifications
- **`notificationService.ts`** — Full notifications system (read/unread, types, timestamps).
- **`simpleNotificationService.ts`** — Lightweight in-app notification helper.
- **`useNotifications.ts`** / **`useSimpleNotifications.ts`** — Hooks for notification state.
- **`NotificationBell.tsx`** / **`NotificationCenter.tsx`** — UI components for notification display.

### 📊 Dashboard & Community
- **`dashboardService.ts`** — Fetch and aggregate data for Student/Faculty dashboards.
- **`communityService.ts`** — CRUD for community posts, comments, and reactions.
- **`socialActivityService.ts`** — Track and log social/extracurricular activity.

---

## 🪝 Custom Hooks

| Hook | Purpose |
|---|---|
| `useAuth` | Authentication state, login, logout |
| `useStudent` | Full student data (profile, achievements, courses, projects) |
| `useStudentSafe` | Safe version of `useStudent` with graceful fallbacks |
| `useFaculty` | Faculty profile, courses, students, and schedule |
| `useProfile` | Editable user profile (shared logic) |
| `useCommunity` | Community posts, reactions, comments |
| `useEvents` | Event listing, detail, and registration |
| `useRecruiter` | Recruiter auth and student search |
| `useNotifications` | Full notification management |
| `useSimpleNotifications` | Lightweight notification read/dismiss |
| `usePlatformIntegration` | External platform connect/disconnect/sync |
| `useMockData` | Toggle mock data for local development |
| `use-mobile` | Responsive breakpoint detection |
| `use-toast` | Toast notification trigger (shadcn pattern) |

---

## 🗄️ Database (Supabase)

The schema is defined in `clean_schema.sql` and `supabase_complete_schema.sql`. Key tables include:

- `profiles` — Extended user data (role, avatar, bio, skills)
- `students` — Student-specific records
- `faculty` — Faculty-specific records
- `courses` — Course definitions
- `enrollments` — Student–course relationships
- `events` — Academic and extra-curricular events
- `event_registrations` — Event sign-ups
- `achievements` / `certificates` — Awarded credentials
- `community_posts` / `community_comments` — Forum data
- `notifications` — Notification records
- `platform_integrations` — Linked external accounts
- `verifiable_credentials` — Issued VCs with blockchain anchors
- `goals` — Student learning goals

Row-Level Security (RLS) policies enforce role-based data access for all tables.

---

## 🏁 Getting Started

### Prerequisites
- Node.js ≥ 18
- A Supabase project with the schema applied

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### Database Setup

1. Run `clean_schema.sql` in your Supabase SQL editor to create all tables and RLS policies.
2. (Optional) Run `mock_users.sql` to seed test data for all roles.
3. (Optional) Run the data population script:

```bash
npm run populate-mock-data
```

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix lint errors |
| `npm run format` | Format code with Prettier |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run check` | Run typecheck + lint + format check |
| `npm run populate-mock-data` | Seed mock data via Node script |

---

## 🔐 Authentication & Role Routing

- Authentication is handled by **Supabase Auth**.
- On login, the user's role (`student`, `faculty`, `admin`, `recruiter`) is fetched from the `profiles` table.
- Route guards (`StudentRoute`, `FacultyRoute`, `AdminRoute`) redirect unauthorized users.
- Recruiters use a **separate login flow** at `/recruiter/login`.

---

