# Notely — Changelog

All notable changes to this project are documented here.
Follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) conventions.

---

## [Unreleased]

---

## [Step 6] — 2026-06-04 · Final Polish (MVP)

### Frontend (`src/`)
- **Updated** `src/routes/index.tsx` (Dashboard):
  - Changed the Target GPA card to act as a shortcut to `/analytics`.
  - Replaced the `BarChart2` icon with the cleaner `BarChart` icon from `lucide-react` across the dashboard to perfectly match the BottomNav icons.
  - Linked the "My Stats" quick-link directly to `/analytics`.
- **Updated** `src/components/BottomNav.tsx`:
  - Updated icons for the new routes: swapped `BarChart2` for `BarChart` (Stats) and `Crown` for `CreditCard` (Premium) to ensure a polished, consistent aesthetic.

---

## [Step 5] — 2026-06-04 · Productivity Analytics (Premium Feature)

### Backend (`backend/`)
- **Added** `GET /api/analytics/stats` endpoint:
  - Validates `user_id` and checks if the user is premium (`user.is_premium`).
  - Returns a 403 Forbidden error if the user is not premium.
  - Calculates total tasks, completed, and pending from `Task` table.
  - Aggregates task priorities into a high/medium/low distribution.
  - Calculates a 7-day completion history based on `updated_at`.

### Frontend (`src/`)
- **Added** `src/routes/analytics.tsx` (Analytics Route):
  - Fetches `/api/analytics/stats` using TanStack Query.
  - Displays a Premium Lock screen (403 fallback) if the user is not premium, prompting them to upgrade via `/billing`.
  - Shows an animated Completion Rate progress bar.
  - Includes a `recharts` BarChart for 7-day history and PieChart for priority distribution.
  - UI styled with existing bento card patterns and brand colors (mint, purple, orange, blue, yellow).
- **Updated** `src/components/BottomNav.tsx`:
  - Added the **Stats** tab pointing to `/analytics` with `BarChart2` icon.
- **Updated** `src/routeTree.gen.ts`:
  - Registered the new `/analytics` route.

---

## [Step 4] — 2026-06-04 · Premium Subscription & Billing Page

### Backend (`backend/`)

#### `main.py`
- **Added** `POST /api/users/{user_id}/upgrade` endpoint  
  Simulates a successful premium payment by:
  - Setting `user.is_premium = True` on the `users` row
  - Upserting a `subscriptions` row to `plan="pro"`, `status="active"`, `renews_at=now+30d`
  - Returns the updated `UserRead` object

#### `models.py` *(pre-existing, verified)*
- `UserBase` already contained `is_premium: bool = Field(default=False)` — no schema change needed
- `UserRead` already exposes `is_premium` to the API — no change needed

---

### Frontend (`src/`)

#### `src/lib/api.ts`
- **Added** `User` TypeScript interface (`id`, `email`, `display_name`, `avatar_url`, `is_premium`, `created_at`)
- **Added** `usersApi` object with:
  - `usersApi.get(id)` → `GET /api/users/:id`
  - `usersApi.upgrade(id)` → `POST /api/users/:id/upgrade`

#### `src/routes/billing.tsx` *(new file)*
Full bento-grid billing & pricing page:
- **Header** — dynamic title ("You're Premium ✨" vs "Upgrade Your Plan")
- **Premium status badge** — shown when `user.is_premium === true`, displays renewal info
- **Plan comparison cards** — Free (col-span-3, `bg-card`) vs Premium (col-span-3, `bg-purple-soft`) with feature checklists using `CheckCircle2` / `XCircle`
- **Upgrade CTA card** — full-width dark bento (`bg-ink`) with "Upgrade to Premium" button; hidden once already premium
- **Mock payment modal** — bottom-sheet with simulated card field, triggers `usersApi.upgrade(1)` via `useMutation`; shows success toast with user's display name on completion; hides on cancel or error
- **Perks grid** — 2×2 bento tiles (AI Planner, Smart Notifications, Instant Sync, Priority Support) using `bg-purple-soft`, `bg-orange-soft`, `bg-yellow-soft`, `bg-mint-soft`
- **Social proof tile** — `bg-blue-soft` with avatar stack and testimonial quote
- Uses `useQuery` to fetch live `is_premium` status from user 1 (demo)
- All animations via `framer-motion` `fadeUp` variants matching the home dashboard pattern

#### `src/components/BottomNav.tsx`
- **Added** `Crown` icon import from `lucide-react`
- **Added** `{ to: "/billing", label: "Premium", icon: Crown }` tab entry — appears as the 5th nav item

#### `src/routeTree.gen.ts`
- **Added** `BillingRouteImport` import from `./routes/billing`
- **Registered** `BillingRoute` via `.update({ id: '/billing', path: '/billing', ... })`
- **Updated** all TypeScript interfaces: `FileRoutesByFullPath`, `FileRoutesByTo`, `FileRoutesById`, `FileRouteTypes`, `RootRouteChildren`, and the `declare module` augmentation to include `/billing`
- **Added** `BillingRoute` to `rootRouteChildren` map

---

## [Step 3] — Previous iteration

See branch `previous-iteration` for the pre-Step-4 state of `main`.

---

## [Step 1–2] — Initial build

- Bootstrapped Vite + TanStack Router + React project
- Designed Notely bento-style dashboard (`src/routes/index.tsx`)
- Built FastAPI backend with SQLModel: `users`, `tasks`, `schedule_events`, `subscriptions`, `notification_log` tables
- Implemented task CRUD, schedule CRUD, subscription read/create endpoints
- Added `QuickAdd` voice/text task entry component
- Added `BottomNav` with Home / Tasks / Schedule / Tools tabs
- Integrated `framer-motion` animations and `sonner` toasts
- Set up Tailwind v4 with custom Notely design tokens (oklch brand palette, `bento` utility class)
