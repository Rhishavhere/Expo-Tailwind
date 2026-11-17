# Wayfarer

Android travel prototype using Expo SDK 54, Expo Router, TypeScript, NativeWind, Supabase and npm. The interface follows the warm surfaces and bold type in `docs/ui inspo*.jpg`. Product rules live in [docs/product.md](docs/product.md) and the technical design in [docs/architecture.md](docs/architecture.md).

## Before you scan the QR code

1. Install Node 22.14+ and run `npm install` in this folder.
2. Install **Expo Go for SDK 54 on Android** from [expo.dev/go](https://expo.dev/go): select SDK 54, then Android. The current Play Store Expo Go may target a newer SDK and reject this project. Check the SDK number inside Expo Go.
3. Put the phone and computer on the same Wi-Fi, with local firewall access to Metro. Run `npm start`, open Expo Go, and scan the terminal QR code. If LAN discovery fails, use `npx expo start --go --tunnel`; this needs an internet connection and may prompt for `@expo/ngrok`.

The app shows setup instructions when Supabase settings are absent. Android bundling and the offline Metro server were checked locally; a physical phone scan has not been performed in this workspace.

## Your Supabase setup

These steps need your Supabase project account. Do them when you are ready to test accounts and collaboration:

1. Create a **development** Supabase project. In Dashboard → SQL Editor, run every file in `supabase/migrations/` in filename order (001–004). Then run [supabase/seed.sql](supabase/seed.sql). The seed contains illustrative destinations and places; no fake users or reviews.
2. Copy [.env.example](.env.example) to `.env`. Fill `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from Dashboard → Project Settings → API. A legacy anon key can go in `EXPO_PUBLIC_SUPABASE_ANON_KEY` instead. Restart Metro after editing `.env`. Never place a service-role or provider key in this file.
3. In Dashboard → Authentication → Providers → Email, keep email/password enabled. For a quick development demo you may disable email confirmation; with it enabled, use a working confirmation email setup and follow the email link before signing in. This is a development choice only.
4. Create test accounts in the app. In Profile, set each account's unique username (3–24 lowercase letters, numbers or underscores). Use a second phone or a second Expo Go session to test invitations. The owner creates a trip, opens Members, searches by exact username/email, and invites the other account. The invitee accepts in Together.
5. Optional AI: deploy `supabase/functions/generate-itinerary` using Supabase CLI. Set Edge Function secrets `AI_PROVIDER=openai` or `gemini`, the matching `OPENAI_API_KEY` or `GEMINI_API_KEY`, and `OPENAI_MODEL` or `GEMINI_MODEL`. Provider keys stay server-side. The assistant's **Demo suggestions** switch works without a provider key using curated places. The function still validates the user's Supabase session and trip membership.

The migrations enable RLS and Postgres Changes for shared trip tables. Invitation acceptance, trip creation, date changes, reordering, expense splitting and AI draft application are server transactions. Trip capacity is five including the owner. Expenses use integer minor units and the trip currency only.

## Checks

```sh
npm run check
npm run lint
npm test
npx expo install --check
npm run doctor
npm run export:android
```

The included PostgreSQL test uses PGlite locally to run every migration and check auth visibility, capacity, vote replacement, split totals and rollback. It does **not** replace a hosted Supabase and two-device test. The Android export only proves bundling, not rendering in Expo Go.

## Manual Expo Go walkthrough

After Supabase setup: scan the QR, sign up, close and reopen Expo Go to verify session restoration, sign out and sign in. Browse Explore, search and save a place. Create a trip, invite a second account and accept in Together. From each account, add an itinerary stop, vote/comment and add an expense. Verify the changes appear on both phones and that a sixth invite is refused. In Memories choose photos or grant gallery access for a paged scan, name a local collection, correct its location, and remove a photo reference without removing the original. In the assistant, generate demo suggestions, review the dates and cost estimates, then apply them to the real itinerary. If an AI function is deployed, try Connected AI separately.

## Current limits

Memories and journals are stored locally under the current account on one device. Metadata scanning handles 40 photos at a time and can resume; photo selection may use today's date when the picker omits capture metadata. Shared media upload and background scanning are not implemented. Venue facts, costs and photographs are illustrative; destination images are remote and show a fallback when unavailable. The app has no bookings or payments. The Android app needs a real Supabase project before auth and shared screens can be verified on devices.
