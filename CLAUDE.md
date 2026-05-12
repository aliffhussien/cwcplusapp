# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CWC+ (Cooking With Cattitude+) is a private culinary platform PWA built with React 19 + Vite + Supabase. It serves recipe vaults, masterclasses, meal planning, and a merch shop behind a subscription/tier access model. The app is deployed to Vercel.

## Commands

```bash
npm run dev        # Start Vite dev server (localhost:5173)
npm run build      # Production build
npm run lint       # ESLint
npm run preview    # Preview production build locally
```

There is no test suite. There are no TypeScript checks (JS/JSX only, except Supabase Edge Functions which use Deno TypeScript).

## Environment Setup

Copy `.env.example` to `.env` and fill in values:
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon key
- `VITE_HITPAY_API_KEY` / `VITE_HITPAY_ENV` — Optional HitPay payment gateway

Supabase Edge Function secrets (`STRIPE_SECRET_KEY`) are set in the Supabase dashboard, not in `.env`.

Run `supabase_init.sql` in the Supabase SQL editor to initialize all tables, RLS policies, triggers, and RPCs.

## Architecture

### Data Layer: AppDataProvider

`src/context/AppDataProvider.jsx` is the central data hub. It manages five parallel data streams — recipes, classes, media, notifications, and merch — each as a self-contained internal state function. Every stream follows the same pattern:

1. **Optimistic init** from `localStorage` (instant perceived load)
2. **Supabase fetch** on mount to hydrate from DB
3. **Realtime channel** subscription to keep data live (each channel gets a random suffix to avoid collisions)
4. Exposes CRUD mutations that update both local state and Supabase simultaneously

The thin hooks in `src/hooks/` (`useRecipes`, `useClasses`, `useMedia`, etc.) simply call `useContext` on the relevant context — they contain no logic of their own.

`useUser` (`src/hooks/useUser.js`) is **outside** AppDataProvider and manages Supabase Auth session + user profile separately.

### Authentication & Authorization

- Auth is Google OAuth via Supabase Auth
- `useUser` fetches the user profile from the `people` table after auth
- Roles: `user`, `employee`, `management`, `admin`
- **God admin**: `ononeline30@gmail.com` — always receives `admin` role regardless of DB value; `isGod` is computed live from email and **never** trusted from localStorage or persisted
- Admin check throughout the app: `['admin', 'management', 'employee'].includes(user?.role)`

### Content Access Control (Tier Gating)

Recipes and classes are gated at two levels:

1. **Client-side** (`hasAccessToRecipe` / `hasAccessToClass` in `useUser`): gates UI display. Any non-`'Free'` `subscriptionTier` grants access to all content; individual volumes/classes can also be unlocked.

2. **Server-side RPC** (the authoritative gate): sensitive content (ingredients, steps, video, live stream links) is **never** returned in normal `SELECT` queries. It's only accessible via:
   - `get_recipe_content(p_id)` — enforces volume/tier access
   - `get_class_content(p_id)` — enforces class tier access, also returns `live_link`

   `fetchRecipeContent` / `fetchClassContent` in AppDataProvider call these RPCs. Never bypass them to `SELECT` content fields directly.

### Routing

```
/auth/callback       → AuthCallback (OAuth redirect)
/                    → Home (inside GlobalAuthGuard)
/recipes             → RecipeList
/recipe/:id          → RecipeView
/classes             → Classes
/planner             → Planner
/pantry              → Pantry
/shop                → Shop
/sanctum             → Sanctum
/notifications       → Notifications
/profile             → Profile
/admin               → Admin (lazy-loaded, code-split)
*                    → redirect to /
```

All routes except `/auth/callback` are wrapped in `GlobalAuthGuard` (redirects unauthenticated users to a sign-in screen) and then `AppDataProvider` + `NavStateProvider`.

### Payments

- **Stripe** (primary): `src/lib/stripe.js` calls the `create-checkout` Edge Function which creates a Stripe session. The `verify-payment` Edge Function confirms payment server-side and updates `unlocked_volumes`/`unlocked_classes` on the `people` table.
- **HitPay**: `src/lib/hitpay.js` — currently makes direct client-side API calls (flagged in comments as insecure; should be moved to an Edge Function if used in production).

### Supabase Edge Functions (`/supabase/functions/`)

Written in Deno TypeScript. Three functions:
- `create-checkout` — Creates a Stripe checkout session
- `verify-payment` — Verifies Stripe payment and unlocks purchased content
- `send-push` — Sends web push notifications; triggered automatically by a Postgres trigger (`tr_send_push_on_broadcast`) on `INSERT` to the `notifications` table

### Database Schema (key tables)

| Table | Purpose |
|---|---|
| `people` | User profiles, roles, subscription tiers, unlocked content |
| `recipes` | Recipe metadata (content gated via RPC) |
| `classes` | Masterclass metadata (content + `live_link` gated via RPC) |
| `media_library` | Centralized asset store with `hero_url`, `thumb_url`, `card_url` |
| `merch` | Shop products |
| `orders` | Purchase records with Stripe session IDs |
| `notifications` | Push + in-app notifications (NULL `user_id` = global broadcast) |
| `settings` | Single-row key-value config (`id = 'platform'`) |

### localStorage Keys

| Key | Contents |
|---|---|
| `cwc_user` | Cached user profile (never stores `isGod`) |
| `cwc_recipes` | Cached recipe list |
| `cwc_classes` | Cached class list |
| `cwc_merch` | Cached merch list |
| `cwc_planner` | Meal plan (entirely local, no DB sync) |
| `cwc_settings` | Cached platform settings |
| `dismissed_notifs_{userId}` | Per-user dismissed notification IDs |
| `read_notifs_{userId}` | Per-user read notification IDs |

## Key Conventions

**Field naming**: DB columns use `snake_case`; React state uses `camelCase`. AppDataProvider maps these on fetch (e.g., `is_featured` → `isFeatured`, `tier_required` → `tierRequired`).

**Status field**: `'published' | 'draft'` — draft content is filtered out for non-admin users client-side. Scheduled content (`scheduled_post_date` in the future) is also hidden from non-admins.

**Brand copy**: All UI text strings live in `src/config/appCopy.js` — use `APP_COPY` for labels rather than hardcoding strings.

**Performance components**: `src/components/PerformanceUI.jsx` exports `Skeleton`, `JankFreeButton`, `OptimizedImage`, `OfflineSentry`, and `triggerHaptic`. Use these instead of rolling custom loading states.

**Admin panel**: The `/admin` route renders `EmpireCommandCenter` (lazy-loaded from `src/pages/Admin.jsx`), which composes `AnalyticsDashboard`, `ContentCurator`, `MediaStudio`, and `OrdersManager` from `src/components/admin/`.

**PWA**: The app registers a service worker (`public/sw.js`) and supports push notifications via `PushManager.jsx`. The `notifications_updated` custom DOM event is used to sync notification state across components.

**useAppSettings**: Fetches the `settings` table `platform` row and subscribes to realtime changes. Use this hook for currency, tier prices, banners, and feature flags — these are admin-configurable at runtime.
