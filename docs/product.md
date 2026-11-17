# Product Requirements Document (PRD)

## Project: Wayfarer --- Working Codename

**Document status:** Prototype specification\
**Version:** 1.0\
**Last updated:** 17 November 2026\
**Platform:** Expo / React Native mobile app\
**Primary implementation partner:** Codex

> Working name only. Product naming, branding and final visual identity
> are intentionally open.

------------------------------------------------------------------------

## 1. Product summary

Wayfarer is a mobile-first travel companion that brings the full travel
lifecycle into one place: discovering destinations, planning trips,
coordinating with friends, managing budgets, getting useful local
information, and preserving travel memories.

The product is not intended to be a flight/hotel booking marketplace in
its first prototype. It is a travel planning and memory workspace that
can link to external booking providers where useful.

### Product promise

**Plan together. Explore smarter. Remember everything.**

### Core product loop

1.  Discover destinations, restaurants and experiences.
2.  Save interesting places to personal collections or a trip.
3.  Create a trip and invite friends.
4.  Collaboratively build and vote on an itinerary.
5.  Track trip expenses and practical information.
6.  Use the app during the trip for the day's plan and local discovery.
7.  Organize photos and preserve the trip as a memory.
8.  Use saved preferences and past trips to improve future
    recommendations.

### Product pillars

-   **Travel:** destination discovery, trip planning, itineraries, maps,
    local guides and budgets.
-   **Together:** friends, invitations, shared decisions, comments and
    group expenses.
-   **Memories:** location-aware gallery organization, trip timelines,
    photo maps and journals.
-   **Intelligence:** contextual AI that understands the user's trip and
    can suggest or perform permitted actions.

------------------------------------------------------------------------

## 2. Prototype goals and non-goals

### 2.1 Goals

The prototype must:

-   Feel like a coherent, polished mobile product rather than a
    collection of disconnected screens.
-   Run in Expo Go on a compatible Expo SDK.
-   Use real navigation, forms, validation, loading states and
    persistence.
-   Support multiple real user accounts/devices through Supabase.
-   Demonstrate a trip with a maximum of **5 members total, including
    its creator**.
-   Allow users to invite friends, accept/decline invitations, and
    collaborate on a shared trip.
-   Persist itinerary items, comments, votes, expenses and trip
    membership.
-   Include a useful destination discovery experience with seeded
    content.
-   Include a working AI itinerary-generation flow when an AI backend
    key is configured, with a clear deterministic fallback when it is
    not.
-   Request gallery permission and organize available photo metadata
    into location/date-based groupings.
-   Be demoable with seeded accounts, sample destinations and a sample
    trip.
-   Provide graceful empty, loading, offline/error and permission-denied
    states.

### 2.2 Non-goals for this prototype

Do not build these unless explicitly requested later:

-   Flight, hotel or train booking checkout.
-   Payment processing or real money transfers.
-   A public social network/feed.
-   Open marketplace for tour guides.
-   Complex role-based enterprise permissions.
-   More than five members in a trip.
-   Production-grade fraud prevention, abuse moderation or large-scale
    infrastructure.
-   A custom computer-vision model.
-   Guaranteed automatic recognition of every photo's location.
-   Background location tracking.
-   A web application.
-   A complex autonomous multi-agent system.

### 2.3 Prototype quality bar

A feature is not complete merely because its screen exists. It is
complete when:

-   The user can perform the intended action.
-   The action is validated.
-   The result persists.
-   The UI reflects the result.
-   Other trip members see shared changes where applicable.
-   Errors are visible and recoverable.
-   The flow works on a physical phone using Expo Go.

No fake buttons, dead-end cards, non-functional tabs or misleading
success messages.

------------------------------------------------------------------------

## 3. Target users and use cases

### Primary users

1.  **Friend groups:** people coordinating a shared holiday, weekend
    trip or road trip.
2.  **Solo travellers:** people who want destination discovery,
    planning, budgets and a personal travel archive.
3.  **Travel enthusiasts:** people who save places and want to organize
    past and future journeys.
4.  **Couples/families:** smaller groups who want one shared plan and
    expense record.

### Core personas

#### A. Trip organizer

-   Creates the trip.
-   Sets dates, destination and budget.
-   Invites friends.
-   Adds initial itinerary items.
-   Needs to know who has responded and what decisions remain.

#### B. Collaborator

-   Joins using an invitation.
-   Suggests places and activities.
-   Votes on suggestions.
-   Comments on itinerary items.
-   Adds expenses and views balances.

#### C. Explorer

-   Browses destination pages.
-   Saves restaurants, attractions and experiences.
-   Uses filters for interests and budget.
-   Adds discoveries to a future trip.

#### D. Memory keeper

-   Grants photo-library access.
-   Wants photos grouped by trip, date and location.
-   Reviews uncertain location matches.
-   Creates or edits a travel journal.

------------------------------------------------------------------------

## 4. Information architecture

### Primary bottom navigation

Use five tabs:

1.  **Explore** --- destination discovery, categories, search, nearby
    places and saved collections.
2.  **Trips** --- upcoming, ongoing, completed and draft trips.
3.  **Together** --- friend list, invitations and shared trip activity.
4.  **Memories** --- photo collections, map/timeline views and trip
    journals.
5.  **Profile** --- personal details, preferences, saved items and
    settings.

The AI assistant should be accessible as a persistent contextual action,
not a sixth bottom tab. Within a trip, it should know which trip is
active.

### Main route map

-   `/` --- authenticated app shell / redirect
-   `/(auth)/welcome`
-   `/(auth)/sign-in`
-   `/(auth)/sign-up`
-   `/(tabs)/explore`
-   `/(tabs)/trips`
-   `/(tabs)/together`
-   `/(tabs)/memories`
-   `/(tabs)/profile`
-   `/destination/[destinationId]`
-   `/place/[placeId]`
-   `/trip/create`
-   `/trip/[tripId]`
-   `/trip/[tripId]/itinerary`
-   `/trip/[tripId]/members`
-   `/trip/[tripId]/budget`
-   `/trip/[tripId]/discussion`
-   `/trip/[tripId]/bookings`
-   `/trip/[tripId]/memories`
-   `/invite/[token]`
-   `/assistant`
-   `/memory/[memoryId]`
-   `/settings`

Use Expo Router typed routes where supported by the installed Expo SDK.

------------------------------------------------------------------------

## 5. Functional requirements

Priority labels: - **P0:** required for the prototype demo. - **P1:**
valuable if time permits after P0 is stable. - **P2:** later
enhancement.

### 5.1 Authentication and profile

**P0** - Email/password sign-up and sign-in using Supabase Auth. -
Sign-out. - Persist session between app launches. - Create a profile row
after sign-up. - Edit display name, username and avatar. - Show a useful
unauthenticated state. - Support password reset if straightforward with
the selected Supabase email configuration.

**Acceptance criteria** - A user can sign up, sign out and sign back
in. - The app restores the session after restart. - Profile edits
persist and appear in relevant member lists. - No screen assumes a
hard-coded current user.

For a quick demo, email confirmation may be disabled in the Supabase
development project. Do not make that a production recommendation.

### 5.2 Explore and destination discovery

**P0** - Explore landing screen with editorial destination cards. -
Search destinations and places from seeded database content. - Filter by
category and interest. - Destination detail page with: - Overview - Best
time to visit (seeded informational content) - Highlights -
Attractions - Food recommendations - Practical local tips - Estimated
budget band - Save destination/place action - Add to trip action - Place
detail page with name, category, description, address/area, image, tags
and map/deep-link action where available.

**P1** - Nearby places using foreground location permission. -
Sort/filter by category, budget and user interest. - User-submitted
place suggestions.

**Acceptance criteria** - Search returns real seeded database records,
not a hard-coded UI-only result. - Save/unsave persists for the
signed-in user. - A saved place can be added to a trip. - Empty search
results show a helpful state. - Place data is labelled as curated/demo
data when not verified live.

### 5.3 Trips

**P0** - Create trip with: - Name - Destination (one or more) - Start
date and end date - Cover image (optional) - Short description
(optional) - Currency (default INR) - Optional target budget - List
trips grouped into Upcoming, Ongoing, Completed and Drafts. - Trip
detail overview. - Edit trip details. - Archive or delete trip with
confirmation. - Trip creator becomes owner. - Creator can invite up to
four additional members. - Hard product rule: maximum five trip members
including owner. - Show member avatars and invitation status.

**Acceptance criteria** - Created trip persists and appears in Trips. -
Editing updates all members' view. - A sixth member cannot join. Show a
clear capacity message. - Date validation prevents end date before start
date. - Deletion requires confirmation and has a defined
cascade/soft-delete strategy.

### 5.4 Friends and invitations

This is a critical demo feature. It must be implemented as a real
cross-account workflow.

**P0** - Find a user by exact username or email (for prototype). - Send
a trip invitation to an existing registered user. - Show pending,
accepted and declined invitations. - Invitee can accept or decline. -
Accepted invitee becomes a trip member. - Trip members can view the same
trip and collaborate. - Creator can revoke a pending invitation. -
Member can leave a trip. - Owner can remove a member (except themselves;
ownership transfer is out of scope unless implemented cleanly). -
Prevent duplicate membership and duplicate pending invitations. -
Enforce five-member cap in the database operation, not only the UI.

**Invitation flow** 1. Owner opens Trip → Members → Invite. 2. Owner
searches by username/email. 3. Search result shows profile identity. 4.
Owner taps Invite. 5. Invitation record is created. 6. Invitee sees
invitation in Together and/or notification inbox. 7. Invitee accepts or
declines. 8. On acceptance, membership is created atomically if capacity
remains. 9. All trip members see the updated member list.

**Acceptance criteria** - Test with two separate accounts on two
devices/sessions. - Invite appears for the correct invitee. - Accepting
updates the trip member list for both users. - A non-member cannot
access the trip through normal app queries. - Sixth member attempt fails
cleanly. - Realtime updates are reflected without manually restarting
the app; a refresh fallback is acceptable.

### 5.5 Collaborative itinerary

**P0** - Day-based itinerary generated from trip dates. - Add itinerary
item: - Title - Place (optional) - Day/date - Start time (optional) -
End time (optional) - Category - Notes - Estimated cost (optional) -
Added by - Edit and delete items. - Reorder items within a day. - Mark
item as planned/completed/skipped. - Add comments to an item or trip
discussion. - Vote on an itinerary item: upvote / downvote or interested
/ not interested. - Show vote counts and current user's vote. - Realtime
updates for trip members. - Add a saved place to an itinerary.

**P1** - Drag-and-drop reordering if stable in Expo Go; otherwise
provide explicit move up/down controls. - Route/time suggestions. -
AI-generated day plan.

**Acceptance criteria** - Itinerary items persist after restart. - All
trip members see new or edited items. - One vote per user per item;
changing vote updates the existing vote. - Item ordering is
deterministic. - Conflicting edits do not silently erase data; use
`updated_at` and refresh before overwriting.

### 5.6 Budget and expenses

**P0** - Set trip target budget and currency. - Add expense: - Title -
Amount - Currency - Category - Paid by - Date - Optional note - Split
participants - Equal split across selected participants. - Custom split
amounts can be P1. - Expense list and category totals. - Per-member paid
amount and owed amount. - Basic settlement summary showing who owes
whom. - Edit/delete an expense by its creator or trip owner.

**Prototype rules** - Use one base trip currency for calculations. - If
an expense currency differs, require a conversion rate to base currency
or prevent mixed-currency calculation and label it clearly. - Store
amounts as integer minor units (paise/cents), never floating-point
currency values. - Do not process payments. Settlement is informational
only.

**Acceptance criteria** - Adding an expense updates trip totals. - Equal
split sums exactly to the expense total, distributing remainder minor
units deterministically. - Each member's balance is calculated from paid
minus owed. - The sum of all member balances equals zero (within the
chosen currency's minor unit). - Editing/deleting recalculates balances.

### 5.7 AI travel assistant

**P0** - Chat interface scoped to active trip when launched from a
trip. - User can ask for destination suggestions and an itinerary
draft. - AI response can produce structured itinerary suggestions. -
User previews the proposed changes before applying them. - Applying
suggestions creates actual itinerary items. - If AI credentials are
missing, show a working fallback that offers a small set of
deterministic sample suggestions and clearly labels them as demo
suggestions.

**P1** - Contextual answers using trip dates, destinations, budget,
preferences and current itinerary. - Suggest alternatives when time or
budget changes. - Food and local-guide suggestions grounded in stored
place data. - Explain destination information from curated content.

**AI safety/product rules** - Do not claim live opening hours, prices,
weather, booking availability or emergency status without a live
source. - Mark generated estimates as estimates. - Never silently modify
a trip. Show a preview and require confirmation. - Validate model output
against a Zod schema before using it. - Never expose a provider secret
in the mobile app. - If model output is malformed, show a recoverable
error and keep the user's prompt.

### 5.8 Gallery and Memories

**P0** - Ask for explicit media-library permission. - Support limited
photo selection where platform/API permits. - Read available photo
metadata such as creation date and EXIF location. - Do not upload the
entire gallery. - Create local groupings by date and coordinates. -
Display photo thumbnails and metadata. - Let user assign a group to an
existing trip or create a memory collection. - Let user correct/confirm
a detected location. - Show a clear explanation when photos have no
location metadata.

**P1** - Location clusters using a configurable distance/time window. -
Map view with photo clusters. - Timeline view. - Upload selected photos
to Supabase Storage for shared trip albums. - Shared album for trip
members. - AI-generated recap using selected photos and known trip data.

**Important limitations** - Many images do not contain GPS metadata. - A
location inferred from visual recognition is uncertain and must be
user-confirmed. - Background gallery scanning is not required for the
prototype. - Gallery scanning should be initiated by the user and should
be resumable. - Avoid downloading/uploading full-resolution media when a
thumbnail is enough.

**Acceptance criteria** - Permission denied does not crash the app. -
The user can continue using the rest of the app without granting gallery
access. - Photos with GPS are grouped by approximate location. - Photos
without GPS are placed in an "Unknown location" collection. - User can
remove a photo from an app collection without deleting the original from
the device. - Shared uploads happen only after explicit selection.

### 5.9 Together hub

**P0** - List friend/trip invitations. - Show trips shared with the
user. - Show recent shared-trip activity (invited, joined, itinerary
item added, expense added). - Search registered users. - Show pending
invitations and actions.

**P1** - Friend connections independent of a trip. - Direct friend
suggestions. - Lightweight group discussion.

### 5.10 Profile and settings

**P0** - Display name, username and avatar. - Interest preferences
(food, nature, adventure, art/culture, photography, spirituality,
nightlife, relaxation). - Default currency. - Saved places. -
Sign-out. - Permission and privacy controls for gallery/location.

**P1** - Travel statistics. - Countries/cities visited. - Personal
travel map.

------------------------------------------------------------------------

## 6. UX and visual design requirements

### Design direction

The app should feel like a premium travel journal combined with a modern
planning workspace. Avoid the visual language of a generic booking
marketplace or admin dashboard.

### Visual principles

-   Photography-led discovery.
-   Calm, warm, neutral surfaces.
-   Strong readable typography.
-   Spacious layouts and consistent spacing.
-   Rounded cards, but avoid excessive pill shapes.
-   Subtle borders and restrained shadows.
-   Clear information hierarchy.
-   Small, intentional motion.
-   Excellent empty states.
-   Dark mode can follow system preference; light mode is the initial
    design priority.

### Suggested design tokens

Treat these as starting values, not immutable rules:

-   Background: warm off-white `#F7F6F2`
-   Surface: `#FFFFFF`
-   Primary text: `#202522`
-   Secondary text: `#747B75`
-   Primary accent: deep forest `#245B4A`
-   Secondary accent: muted sage `#DCE8DF`
-   Warm accent: `#D99B65`
-   Border: `#E8E8E1`
-   Error: accessible muted red
-   Success: accessible green

Typography: - Use a strong sans-serif for UI. - Use a restrained
editorial display face for destination headings only if the font is
bundled and reliable in Expo Go. - Avoid too many font families.

### Interaction rules

-   All tap targets should be comfortably sized.
-   Show pressed/selected states.
-   Use skeletons or lightweight loading indicators for asynchronous
    content.
-   Use confirmation dialogs for destructive actions.
-   Use toast/snackbar feedback for successful actions.
-   Do not use `alert()` as the default UX.
-   Keyboard should not cover form actions.
-   Handle safe areas and small screens.
-   Provide accessible labels for icon-only controls.

### Screen-level polish checklist

Every screen must have: - Loading state - Empty state - Error state -
Content state - Pull-to-refresh where appropriate - Safe-area handling -
Keyboard handling where relevant

------------------------------------------------------------------------

## 7. Demo scenario and seeded content

The app must be ready to demonstrate without manually entering every
record.

### Demo users

Seed or manually create five accounts: - `rhishav` --- trip owner -
`ananya` - `samar` - `meera` - `kabir`

Use test-only email addresses and passwords configured in the local
README or environment setup. Do not hard-code real personal data.

If creating Auth users through a seed script is impractical, provide a
manual setup guide and a development-only seed utility.

### Demo trip

**Trip:** Kerala Escape\
**Dates:** 12--17 December (demo dates configurable)\
**Members:** up to five demo users\
**Currency:** INR\
**Target budget:** ₹15,000 per person

Seed destinations/places: - Fort Kochi - Mattancherry Palace - Marine
Drive, Kochi - Munnar - Eravikulam National Park - Alleppey backwaters -
A small set of restaurants/cafes with clearly labelled sample
descriptions

Seed itinerary: - Day 1: Fort Kochi, local lunch, sunset walk - Day 2:
Mattancherry, local market, cultural activity - Day 3: Travel to
Munnar - Day 4: Tea gardens and nature - Day 5: Alleppey/backwaters -
Day 6: Return

Seed expenses: - Accommodation - Food - Transport - Activities

All seeded prices and details are illustrative demo content, not live
quotations.

### Demo walkthrough

1.  Sign in as trip owner.
2.  Open Kerala Escape.
3.  Invite a second user.
4.  Sign in as invitee in another session/device.
5.  Accept invitation.
6.  Add a place to the trip.
7.  Vote/comment from the second account.
8.  Add an expense.
9.  Confirm both accounts see updated shared state.
10. Open Memories and scan/select a few photos.
11. Generate or preview an AI itinerary suggestion.
12. Apply the suggestion and confirm it appears in the itinerary.

------------------------------------------------------------------------

## 8. Analytics and success criteria

Analytics are optional for the prototype. If included, use
privacy-conscious event names and avoid sending photo contents or
precise location history.

Suggested events: - `account_created` - `trip_created` -
`trip_invite_sent` - `trip_invite_accepted` - `itinerary_item_created` -
`itinerary_vote_cast` - `expense_created` - `ai_plan_generated` -
`ai_plan_applied` - `gallery_scan_started` - `memory_collection_created`

### Prototype success criteria

-   A user can complete the core demo without developer intervention
    after setup.
-   Two or more users can collaborate on one trip from separate
    sessions.
-   Trip capacity is enforced at five.
-   Core shared data persists after app restart.
-   No primary navigation tab is a dead end.
-   No primary CTA is non-functional.
-   App launches in Expo Go without unresolved native dependency errors.
-   TypeScript check and lint pass.
-   No uncaught errors during the demo walkthrough.

------------------------------------------------------------------------

## 9. Product decisions and assumptions

-   Mobile-first, Android and iOS through Expo.
-   Expo Go is the initial runtime constraint.
-   NativeWind provides Tailwind-style styling for React Native.
-   Supabase is the prototype backend.
-   INR is the default currency, but the data model supports ISO
    currency codes.
-   Five members maximum per trip, including owner.
-   Email/username lookup is sufficient for prototype friend discovery.
-   Friends must be registered users to accept an in-app invitation.
-   No payment processing.
-   Destination data is initially seeded and curated.
-   Gallery processing is opt-in.
-   AI actions require preview and user confirmation.
-   The product name is temporary.

------------------------------------------------------------------------

## 10. Definition of done

A feature is done only when: 1. The UI is implemented and visually
consistent. 2. TypeScript types are defined. 3. Validation exists. 4.
Database reads/writes are implemented. 5. Loading, empty and error
states exist. 6. Realtime behavior is implemented where required. 7. The
action is tested on Expo Go. 8. No dead controls remain. 9. The README
documents any required configuration. 10. The feature can be
demonstrated using the demo scenario.
