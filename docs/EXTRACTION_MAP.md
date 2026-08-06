# EXTRACTION MAP — CWC+ PLATFORM

**Prepared by:** H0MER (AI OS)  
**Target:** React to TypeScript Migration (cwc-platform)  
**Date:** May 18, 2026  

This document serves as the absolute blueprint and single source of truth for the codebase restructuring and TypeScript conversion of `cwc-platform` under **TECH_SOP v1.0**.

---

## 1. Auth Flow (Login, Signup, Session)

### Source Location
- Primary Hook: [useUser.js](file:///C:/Sheikh%20Hussien%20Empire/APPS/cwc-platform/src/hooks/useUser.js)
- UI: [AuthModal.jsx](file:///C:/Sheikh%20Hussien%20Empire/APPS/cwc-platform/src/components/AuthModal.jsx)
- Router Guard: [App.jsx](file:///C:/Sheikh%20Hussien%20Empire/APPS/cwc-platform/src/App.jsx) (`GlobalAuthGuard` and `AdminGuard`)
- Callback: [AuthCallback.jsx](file:///C:/Sheikh%20Hussien%20Empire/APPS/cwc-platform/src/pages/AuthCallback.jsx)

### Logic Details
1. **Session Management:**
   - Listens to authentication state via `supabase.auth.getSession()` and `supabase.auth.onAuthStateChange`.
   - On state changes:
     - If `session.user` exists, calls `fetchUserProfile(session.user)`.
     - Else, calls `loadLocalUser()` which loads user profile from `localStorage` (`cwc_user`), resetting to `defaultUser` if empty.
2. **User Profile Mapping (`fetchUserProfile`):**
   - Fetches record from table `people` where `id = user.id`.
   - If profile exists in database:
     - Sets state and `localStorage` with values from database, including role mapping (`admin`, `management`, `employee`, or default `user`).
     - Computes `isGod = ['admin', 'management', 'employee'].includes(role)`.
   - If profile does NOT exist in database:
     - Creates new profile with `Free` subscription tier and role `user`.
     - Performs `supabase.from('people').upsert(...)`.
3. **Local Storage Synchronization:**
   - Persists user object to `localStorage` key `'cwc_user'` (excluding transient fields like `isGod`).
   - Listens to window custom event `cwc_user_updated` to keep state synced across tabs.
4. **Sign Out:**
   - Triggers `supabase.auth.signOut()`.
   - Clears memory state, resets to `defaultUser`, and removes `'cwc_user'` from `localStorage`.

---

## 2. Paywall Logic & Access Control

### Source Location
- Access Engine: [useUser.js](file:///C:/Sheikh%20Hussien%20Empire/APPS/cwc-platform/src/hooks/useUser.js) (`hasAccessToRecipe`, `hasAccessToClass`)
- Blocking UI: [RecipeView.jsx](file:///C:/Sheikh%20Hussien%20Empire/APPS/cwc-platform/src/pages/RecipeView.jsx), [Classes.jsx](file:///C:/Sheikh%20Hussien%20Empire/APPS/cwc-platform/src/pages/Classes.jsx) (`AccessDeniedModal`)

### Rules Mapping
1. **Recipe Access Control (`hasAccessToRecipe`):**
   - If `recipe.volume` is `"Free"` or `undefined` -> **GRANT**
   - If `user.role` is in `['admin', 'management', 'employee']` -> **GRANT**
   - If `user.subscriptionTier` is not `"Free"` (e.g. "Basic Premium", "Plus Member", "Gold Member") -> **GRANT**
   - If `user.unlockedVolumes` contains `recipe.volume` -> **GRANT**
   - Otherwise -> **DENY** (Triggers Access Denied Modal)
2. **Class Access Control (`hasAccessToClass`):**
   - If `cls.tier_required` is `"Free"` or `undefined` -> **GRANT**
   - If `user.role` is in `['admin', 'management', 'employee']` -> **GRANT**
   - If `user.subscriptionTier` is not `"Free"` -> **GRANT**
   - If `user.subscriptionTier === cls.tier_required` -> **GRANT**
   - If `user.unlockedClasses` contains `cls.id` -> **GRANT**
   - Otherwise -> **DENY**

---

## 3. Stripe Checkout Connection

### Source Location
- Service Client: [stripe.js](file:///C:/Sheikh%20Hussien%20Empire/APPS/cwc-platform/src/lib/stripe.js)
- Purchase Action: [Profile.jsx](file:///C:/Sheikh%20Hussien%20Empire/APPS/cwc-platform/src/pages/Profile.jsx), [Shop.jsx](file:///C:/Sheikh%20Hussien%20Empire/APPS/cwc-platform/src/pages/Shop.jsx)

### Integration Logic
1. **Stripe Session Generation:**
   - Calls the `createStripeCheckout` helper:
     ```javascript
     const createStripeCheckout = async (amount, currency, reference, redirectUrl, productName) => { ... }
     ```
   - Invokes the Supabase Edge Function `create-checkout` via `supabase.functions.invoke('create-checkout', { body })`.
   - Returns a Stripe Checkout Session URL (`data.url`) and redirects the user (`window.location.href = url`).
2. **Post-Payment Verification:**
   - Upon redirect back, pages call `refreshUserFromDB()` in `useUser` to reload the newly synced VIP credentials from the Supabase `people` table.
   - Also, `RecipeView.jsx` and `Classes.jsx` contain logic to call the `verify-payment` Edge Function to check transaction statuses.

---

## 4. Supabase Queries Map

Every single query and realtime channel in `cwc-platform` mapped systematically:

### A. Authentication & Users (`people` table)
- **Get Profile:** `supabase.from('people').select('*').eq('id', authUser.id).single()`
- **Register / Upsert Profile:** `supabase.from('people').upsert([newProfile], { onConflict: 'id' })`
- **Update Profile:** `supabase.from('people').update(dbUpdates).eq('id', session.user.id)`
- **Get All Users (Admin Hook):** `supabase.from('people').select('id, name, email, subscription_tier, role, created_at, avatar_url').order('created_at', { ascending: false })`
- **Delete User (Admin Hook):** `supabase.from('people').delete().eq('id', id)`
- **Update Subscription Tier (Admin hook):** `supabase.from('people').update({ subscription_tier: newTier }).eq('id', id)`
- **Realtime Users Sync:** `supabase.channel('people_realtime').on('postgres_changes', ...)`

### B. Settings (`settings` table)
- **Get Platform Config:** `supabase.from('settings').select('config').eq('id', 'platform').single()`
- **Update Platform Config:** `supabase.from('settings').upsert({ id: 'platform', config: updated, updated_at: new Date() })`
- **Realtime Settings Sync:** `supabase.channel('cwc_settings').on('postgres_changes', { filter: 'id=eq.platform' }, ...)`

### C. Recipes (`recipes` table)
- **Get Recipes List:** `supabase.from('recipes').select(cols).order('created_at', { ascending: false }).limit(200)`
- **Add Recipe:** `supabase.from('recipes').insert([newRecipe]).select()`
- **Update Recipe:** `supabase.from('recipes').update(updates).eq('id', id)`
- **Delete Recipe:** `supabase.from('recipes').delete().eq('id', id)`
- **Get Secure Recipe Content (RPC):** `supabase.rpc('get_recipe_content', { p_id: Number(id) })`
- **Realtime Recipes Sync:** `supabase.channel('cwc_recipes').on('postgres_changes', ...)`

### D. Classes (`classes` table)
- **Get Classes List:** `supabase.from('classes').select('*').order('created_at', { ascending: false }).limit(200)`
- **Add Class:** `supabase.from('classes').insert([payload]).select()`
- **Update Class:** `supabase.from('classes').update(updates).eq('id', id)`
- **Delete Class:** `supabase.from('classes').delete().eq('id', id)`
- **Get Secure Class Content (RPC):** `supabase.rpc('get_class_content', { p_id: Number(id) })`
- **Realtime Classes Sync:** `supabase.channel('cwc_classes').on('postgres_changes', ...)`

### E. Media Library (`media_library` table)
- **Get Media (Limit 500):** `supabase.from('media_library').select('*').order('created_at', { ascending: false }).limit(500)`
- **Add Media Record:** `supabase.from('media_library').insert([mediaData]).select()`
- **Delete Media Record:** `supabase.from('media_library').delete().eq('id', id)`
- **Update SEO Metadata:** `supabase.from('media_library').update({ filename, seo_schema }).eq('id', id)`
- **Unset Primaries:** `supabase.from('media_library').update({ is_primary: false }).eq('content_id', item.content_id)...`
- **Set Primary:** `supabase.from('media_library').update({ is_primary: nextState }).eq('id', id)`

### F. Orders (`orders` table)
- **Update Fulfillment Status:** `supabase.from('orders').update(updates).eq('id', id)`
- **Realtime Orders Sync:** `supabase.channel('orders_realtime').on('postgres_changes', ...)`

### G. Notifications (`notifications` table)
- **Get Broadcasts:** `supabase.from('notifications').select('*').or('user_id.eq.id,user_id.is.null').or('scheduled_post_date.is.null,scheduled_post_date.lte.now').order('created_at')`
- **Mark as Read:** `supabase.from('notifications').update({ read_status: true }).eq(id)`
- **Create Admin Broadcast:** `supabase.from('notifications').insert([{ ...notif }])`
- **Delete Broadcast:** `supabase.from('notifications').delete().eq('id', id)`

### H. Edge Functions & Storage
- **Upload File:** `supabase.storage.from('public-assets').upload(filePath, file)`
- **Get File URL:** `supabase.storage.from('public-assets').getPublicUrl(filePath)`
- **Verify Recipe Payment:** `supabase.functions.invoke('verify-payment', { body: { itemType: 'recipe', itemId } })`
- **Verify Class Payment:** `supabase.functions.invoke('verify-payment', { body: { itemType: 'class', itemId } })`

---

## 5. A.R.C Design Tokens (Brand System)

From [index.css](file:///C:/Sheikh%20Hussien%20Empire/APPS/cwc-platform/src/index.css), these represent the true branding of CWC+. Using arbitrary darks like `#050505` and `#0a0a0a` violates this token system.

### Color Tokens
- **Base Canvas:** `var(--color-base)` -> `#050D0E` (Teal-tinted Dark Black)
- **Surface Panels:** `var(--color-surface)` -> `#0A1517` (Teal Dark Surface)
- **Elevated Items:** `var(--color-elevated)` -> `#0F1E21` (Teal Elevated Dark)
- **Overlay Elements:** `var(--color-overlay)` -> `#0D1A1D`
- **Empire Accent:** `var(--color-accent)` -> `#10B981` (Vibrant Emerald Teal)
- **Accent Dim:** `var(--color-accent-dim)` -> `#059669`
- **Secondary Accent:** `var(--color-accent-sec)` -> `#34D399`
- **Deep Accent:** `var(--color-accent-dk)` -> `#065F46`
- **Text Primary:** `var(--color-text-1)` -> `#F0FDF4` (Milky White-Teal)
- **Text Secondary:** `var(--color-text-2)` -> `#A7F3D0` (Teal-tinted Green)
- **Text Muted:** `var(--color-text-3)` -> `#4B7A65` (Moss Green-Gray)

### Semantic Additions
- **Danger/Alert:** `#EF4444` (`danger`)
- **Warning/Alert:** `#F59E0B` (`warning`)
- **Success:** `#10B981` (`success`)
- **Premium/VIP:** `#8B5CF6` (`premium`)

---

## 6. Routing Structure Map

Defined inside [App.jsx](file:///C:/Sheikh%20Hussien%20Empire/APPS/cwc-platform/src/App.jsx):

```
/ (Root Route)
│
├── /auth/callback                     ← OAuth Callback Page (Unprotected)
│
└── /* (Protected under GlobalAuthGuard + Context Providers)
    ├── /                              ← Home Dashboard Page
    ├── /recipes                       ← Recipe Library Page
    ├── /recipe/:id                    ← Recipe Reader Page
    ├── /recipe/:id/print              ← Printable Recipe Page
    ├── /classes                       ← Class Theater Page
    ├── /planner                       ← Meal Planner Page
    ├── /notifications                 ← User Notification Center
    ├── /pantry                        ← Pantry Inventory Page
    ├── /profile                       ← Profile Settings Page
    ├── /sanctum                       ← Special Cooking Sanctum View
    ├── /shop                          ← Merchandise Shop Page
    │
    └── /admin (Protected via AdminGuard)
        └── /                          ← CWC+ Command Center
```

---

## 7. TS Core Abstractions & Types Required (Abstractions plan)

During `STEP 2 & 3`, the following absolute TypeScript interfaces will be defined in `src/types/index.ts`:

```typescript
export interface UserProfile {
    id: string | null;
    email: string | null;
    name: string;
    subscriptionTier: 'Free' | 'Basic Premium' | 'Plus Member' | 'Gold Member';
    role: 'user' | 'admin' | 'management' | 'employee';
    isGod: boolean;
    unlockedVolumes: string[];
    unlockedClasses: number[];
    avatarUrl: string | null;
    coverUrl: string | null;
    dietaryPreferences: string[];
    favoriteFood: string | null;
    pushSubscription?: any;
}

export interface Recipe {
    id: number;
    title: string;
    author: string | null;
    time: string | null;
    image: string | null;
    category: string | null;
    difficulty: string | null;
    rating: number;
    status: 'published' | 'draft';
    isFeatured: boolean;
    tierRequired: 'Free' | 'Basic' | 'Plus' | 'Premium';
    volume: string;
    scheduled_post_date?: string;
    created_at?: string;
    cover_image_id?: number;
    hero_image?: string;
    hero_image_id?: number;
}

export interface CookingClass {
    id: number;
    title: string;
    instructor: string;
    duration: string;
    price: string;
    image: string;
    video?: string;
    status: 'published' | 'draft';
    tierRequired: 'Free' | 'Basic' | 'Plus' | 'Premium';
    isFeatured: boolean;
    ingredients?: any[];
    steps?: string[];
    notes?: string;
    attachments?: any[];
    live_link?: string;
    created_at?: string;
}

export interface PlatformSettings {
    heroTitle: string;
    siteName: string;
    maintenanceMode: boolean;
    bannerEnabled: boolean;
    bannerText: string;
    youtubeLiveUrl?: string;
    tiktokLiveUrl?: string;
    classesHeroTitle?: string;
    classesHeroDesc?: string;
    classesHeroClassId?: string;
    classesHeroImageUrl?: string;
    currency: string;
    premiumTiers: { id: string; name: string; price: string; discount: number; benefits: string }[];
    accentColor: string;
    secondaryAccentColor: string;
    plugins: { stripe: boolean; mailchimp: boolean; zapier: boolean };
    apiKeys: any[];
    volumes: { id: string; name: string; price: string; discount: number }[];
}
```

---
*Blueprint verified and signed off for structure rebuild.*
