# Implementation plan

`product.md` and `architecture.md` remain the source of truth. This plan records implementation choices, not changes to product scope. The user later authorized all milestones. Their code is implemented, pending hosted Supabase and physical Expo Go validation.

## Repository audit

The initial repository is an uninstalled Expo SDK 54 template: React 19.1, React Native 0.81.5, Router 6, NativeWind 4, Tailwind 3, strict TypeScript, TanStack Query and Zod. It has one example tab and a dead example button. The unrelated Manus OAuth/tRPC/Express/MySQL/Drizzle template is not a working Wayfarer backend. Replace that unused scaffolding with the explicitly requested Supabase stack. Preserve the supplied product, architecture and UI inspiration files.

## Milestones and acceptance gates

| Milestone | Scope | Gate |
| --- | --- | --- |
| 0 | Router, NativeWind, tokens/primitives, Supabase client, environment validation, Query/Auth providers, email auth, session restoration | Real sign-up/sign-in/sign-out and cold launch on compatible Expo Go |
| 1 | Profile completion/editing, seeded destinations/places, Explore/search/details, saved places | Browse/save real backend records |
| 2 | Transactional trip creation/owner membership, dates/day generation, list/detail/edit | Reopen persisted trip |
| 3 | Exact user lookup, invitations, atomic acceptance with row locking, five-member limit, member realtime | Two accounts share trip; concurrent sixth-member attempt rejected |
| 4 | Day itinerary, ordering, status, comments, votes, realtime | Shared edits persist across accounts |
| 5 | Integer-minor-unit expenses, transactional splits, balances | Remainders deterministic; balances sum to zero |
| 6 | OpenAI or Gemini through Supabase Edge Functions, Zod output, proposal preview/apply, deterministic no-key fallback | Confirmed suggestions create real itinerary rows |
| 7 | Explicit gallery permission, paginated metadata, local clusters/review, optional selected upload | Real photos organized without whole-library upload |
| 8 | Demo seeds, accessibility, error/retry states, two-device test, documentation and rehearsal | Full PRD demo on Expo Go |

## Foundation decisions

- Retain SDK 54 / Router 6 / NativeWind 4 and use the matching SDK 54 Android Expo Go download from expo.dev/go. The current store build may target a newer SDK. The physical device scan remains pending.
- Use Expo's compatibility metadata and `expo install --check`, `expo-doctor`, native bundle exports and a physical phone test. Bundle exports alone do not prove Expo Go launch.
- Keep routes thin; new code lives under `src/` by feature. Screens consume hooks/providers; repositories own Supabase calls. No Express server or local MySQL is required.
- Use the Supabase React Native AsyncStorage session adapter and URL polyfill; stop/start token refresh with AppState. Use a single auth state owner. Clear Query data at identity changes.
- Public Supabase URL and publishable (or legacy anon) key are required for auth. Missing/invalid configuration produces an explicit setup state, never fake authentication. No client service-role or AI keys.
- M0 added Supabase JS and its URL polyfill. The later gallery slice added Expo managed media modules. No additional form or state library was needed.
- M0 added profiles, signup trigger, own-row RLS and a profile-recovery RPC. Later migrations add travel data and transactional operations.
- The five tabs now have implemented workflows backed by repositories or local photos. Hosted validation remains pending.
- Light-first, warm off-white, forest green, restrained orange/lime accents, bold system typography, generous spacing, comfortable targets. Welcome artwork uses local vector shapes so onboarding does not depend on external image loading. Story-style destination browsing arrives with real content in M1, without a public social feed.

## Decisions still needed

1. Android SDK 54 Expo Go installation on the test phone. The user will scan the Metro QR code; the physical-device check remains pending.
2. Supabase development project URL/public key and email-confirmation settings. Configure values locally, not in chat; use test-only accounts. Hosted backend tests require this project.
3. M1: destination photo sourcing/licensing, username rules and avatar upload limits.
4. M2: explicit budget scope (per-person or group), trip timezone/date conventions and archive/delete behavior.
5. M3: exact email lookup through a restricted RPC, member/profile visibility and realtime policies.
6. M6: OpenAI versus Gemini model, quotas/cost ceilings and deployment region; secrets remain in Edge Functions. No other AI providers.
7. M7: local photo metadata persistence (AsyncStorage versus SQLite), clustering thresholds and platform permission behavior.

## References checked

- https://expo.dev/go
- https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/
- https://supabase.com/docs/guides/auth/quickstarts/react-native
- https://www.nativewind.dev/docs/getting-started/installation

Do not confuse the current website's SDK reference with SDK 54: its historical SDK links currently redirect to latest. The installed SDK's bundled compatibility metadata is the dependency authority for this checkout.
