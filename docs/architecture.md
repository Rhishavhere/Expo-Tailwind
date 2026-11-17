# Technical Architecture

## Project: Wayfarer --- Working Codename

**Document status:** Prototype architecture\
**Version:** 1.0\
**Last updated:** 17 November 2026\
**Runtime target:** Expo Go, Android and iOS\
**Implementation:** React Native + TypeScript + NativeWind + Supabase

------------------------------------------------------------------------

## 1. Architecture overview

### 1.1 Architectural goals

The architecture should be: - Simple enough for one developer and Codex
to build iteratively. - Strongly typed. - Easy to debug on a physical
phone through Expo Go. - Backend-connected for multi-user
collaboration. - Organized by feature/domain rather than by file type
alone. - Able to replace demo data with real backend data without
rewriting screens. - Explicit about loading, error, empty and success
states. - Conservative with native dependencies to preserve Expo Go
compatibility.

### 1.2 High-level system

``` text
┌─────────────────────────────────────────────────────────┐
│                 Expo React Native App                   │
│                                                         │
│  Expo Router / Screens                                  │
│          │                                              │
│  Feature UI + Shared Components                         │
│          │                                              │
│  Hooks / Use Cases / Domain Services                    │
│          │                                              │
│  Repositories ─────────────── Local Cache                │
│          │                                              │
│  Supabase Client                                        │
└──────────┼──────────────────────────────────────────────┘
           │ HTTPS / WebSocket
           ▼
┌─────────────────────────────────────────────────────────┐
│                       Supabase                           │
│                                                         │
│  Auth       PostgreSQL       Realtime       Storage      │
│                 │                                       │
│           SQL functions / RPC                            │
└─────────────────┼───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│                Optional AI backend                      │
│                                                         │
│  Edge Function / server endpoint                        │
│       │                                                 │
│  LLM provider                                            │
│       │                                                 │
│  Structured validated response                          │
└─────────────────────────────────────────────────────────┘
```

### 1.3 Core architectural rule

Screens must not contain direct Supabase query logic.

Use this flow:

`Screen → Hook → Use case/service → Repository → Supabase`

This keeps UI independent from data access and makes it possible to use
demo repositories during development.

------------------------------------------------------------------------

## 2. Technology decisions

### 2.1 Mobile foundation

-   Expo managed workflow.
-   React Native.
-   TypeScript strict mode.
-   Expo Router for file-based navigation.
-   NativeWind for Tailwind-style classes.
-   React Context only for small global concerns.
-   TanStack Query for server state and caching.
-   Zustand for small client-side UI state where needed.

**Expo Go compatibility warning:** Expo Go only contains a known set of
native modules. Before installing any dependency, check whether it is
included in the Expo SDK version being used. If a library requires
custom native code, do not add it to the Expo Go prototype without
replacing it with an Expo Go-compatible alternative. Expo recommends
development builds for more complete native functionality; this project
intentionally accepts Expo Go's limitations for the prototype.

### 2.2 Expo SDK version policy

Do not blindly install the newest Expo SDK just because it exists.

1.  Check the installed Expo Go version on the target phone.
2.  Select a compatible stable Expo SDK.
3.  Install Expo-managed packages using `npx expo install`.
4.  Check compatibility using `npx expo-doctor`.
5.  Verify NativeWind's compatibility with that SDK.
6.  Pin working package versions in the lockfile.
7.  Do not upgrade Expo SDK during feature implementation unless
    required.

At the time of this document, Expo SDK releases and Expo Go store
availability may be temporarily out of sync. The exact compatible SDK
should be selected when creating the project.

### 2.3 Styling

Use NativeWind, not web Tailwind CSS classes directly.

-   Use `className` on supported React Native components.
-   Keep design tokens in Tailwind config/theme.
-   Avoid arbitrary one-off values where a shared token exists.
-   Use `StyleSheet` for complex animated or dynamically computed styles
    where appropriate.
-   Do not mix multiple styling systems without a reason.

NativeWind installation and Babel/Metro configuration must follow the
guide for the exact selected NativeWind version.

### 2.4 Backend

Supabase provides: - Auth - PostgreSQL - Realtime - Storage - SQL
functions/RPC - Optional Edge Functions

Use Supabase as the source of truth for shared data.

### 2.5 Recommended libraries

Install only after checking compatibility with the selected Expo SDK.

Core: - `expo` - `expo-router` - `react` - `react-native` -
`typescript` - `nativewind` - `tailwindcss` - `@supabase/supabase-js` -
`@tanstack/react-query` - `zustand` - `zod` - `react-hook-form` -
`@hookform/resolvers` - `lucide-react-native`

Expo modules: - `expo-image` - `expo-image-picker` -
`expo-media-library` - `expo-location` - `expo-linking` -
`expo-constants` - `expo-device` - `expo-notifications` (if needed) -
`expo-secure-store` or AsyncStorage according to Supabase
session-storage setup - `expo-sqlite` if local persistence requirements
justify it

Potential UI utilities: - `react-native-safe-area-context` -
`react-native-screens` - `react-native-gesture-handler` -
`react-native-reanimated`

Do not add a package solely because it is popular. Confirm Expo Go
compatibility first.

------------------------------------------------------------------------

## 3. Repository and folder structure

Use a feature-oriented structure.

``` text
wayfarer/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── explore.tsx
│   │   ├── trips.tsx
│   │   ├── together.tsx
│   │   ├── memories.tsx
│   │   └── profile.tsx
│   ├── destination/
│   │   └── [destinationId].tsx
│   ├── place/
│   │   └── [placeId].tsx
│   ├── trip/
│   │   ├── create.tsx
│   │   └── [tripId]/
│   │       ├── index.tsx
│   │       ├── itinerary.tsx
│   │       ├── members.tsx
│   │       ├── budget.tsx
│   │       ├── discussion.tsx
│   │       ├── bookings.tsx
│   │       └── memories.tsx
│   ├── invite/
│   │   └── [token].tsx
│   ├── assistant.tsx
│   ├── memory/
│   │   └── [memoryId].tsx
│   └── settings.tsx
│
├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── feedback/
│   │   └── media/
│   ├── features/
│   │   ├── auth/
│   │   ├── profile/
│   │   ├── explore/
│   │   ├── destinations/
│   │   ├── places/
│   │   ├── trips/
│   │   ├── invitations/
│   │   ├── friends/
│   │   ├── itinerary/
│   │   ├── expenses/
│   │   ├── assistant/
│   │   └── memories/
│   ├── hooks/
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── query-client.ts
│   │   ├── env.ts
│   │   └── date.ts
│   ├── providers/
│   ├── repositories/
│   ├── services/
│   ├── store/
│   ├── types/
│   ├── constants/
│   └── utils/
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── functions/
│       └── generate-itinerary/
│
├── docs/
│   ├── product.md
│   └── architecture.md
│
├── .env.example
├── app.json
├── babel.config.js
├── metro.config.js
├── tailwind.config.js
├── global.css
├── tsconfig.json
├── package.json
└── README.md
```

### Folder rules

-   `app/` contains route files and route-level layouts only.
-   `features/` contains domain-specific UI, hooks, schemas and
    services.
-   `components/ui/` contains reusable primitives such as Button, Input,
    Avatar, Card, Badge, Modal and EmptyState.
-   `repositories/` contains data-access implementations.
-   `services/` contains orchestration and domain operations.
-   `lib/` contains configured external clients.
-   `types/` contains shared types only; feature-specific types should
    stay with their feature.
-   `supabase/migrations/` is the source of truth for database schema
    changes.

Avoid creating giant screen files. Split meaningful sections into
components.

------------------------------------------------------------------------

## 4. Data model

Use PostgreSQL UUID primary keys and timestamps (`timestamptz`). Store
money as integer minor units.

### 4.1 Entity relationship overview

``` text
auth.users
   │
   └── profiles
         │
         ├── friendships (optional prototype extension)
         ├── saved_places
         ├── trips (created_by)
         ├── trip_members ───── trips
         ├── trip_invitations ─ trips
         └── memories

trips
  ├── trip_members
  ├── trip_invitations
  ├── itinerary_days
  ├── itinerary_items
  │     ├── itinerary_votes
  │     └── itinerary_comments
  ├── expenses
  │     └── expense_splits
  ├── bookings
  ├── trip_activity
  └── trip_media

destinations
  └── places
       ├── saved_places
       └── itinerary_items (optional place_id)

memories
  └── memory_media
```

### 4.2 Tables

#### `profiles`

  Column             Type            Notes
  ------------------ --------------- -------------------------------
  id                 uuid PK         References auth.users.id
  username           text unique     Lowercase normalized username
  display_name       text            Required
  avatar_url         text nullable   Storage URL
  bio                text nullable   Optional
  interests          text\[\]        Food, nature, adventure, etc.
  default_currency   text            Default `INR`
  created_at         timestamptz     
  updated_at         timestamptz     

#### `destinations`

  Column             Type                        Notes
  ------------------ --------------------------- -------------------
  id                 uuid PK                     
  name               text                        
  slug               text unique                 
  country            text                        
  region             text nullable               State/region
  description        text                        
  hero_image_url     text nullable               
  best_time_text     text nullable               Curated text
  budget_min_minor   bigint nullable             Optional estimate
  budget_max_minor   bigint nullable             Optional estimate
  currency           text                        ISO currency code
  tags               text\[\]                    
  latitude           double precision nullable   
  longitude          double precision nullable   
  is_published       boolean                     
  created_at         timestamptz                 

#### `places`

  Column                 Type                        Notes
  ---------------------- --------------------------- ------------------------------------
  id                     uuid PK                     
  destination_id         uuid FK                     
  name                   text                        
  category               text                        attraction, restaurant, cafe, etc.
  description            text                        
  address                text nullable               
  image_url              text nullable               
  latitude               double precision nullable   
  longitude              double precision nullable   
  price_level            smallint nullable           1--4
  estimated_cost_minor   bigint nullable             
  currency               text nullable               
  tags                   text\[\]                    
  source_label           text nullable               e.g. curated demo content
  is_published           boolean                     
  created_at             timestamptz                 

#### `trips`

  -----------------------------------------------------------------------
  Column                  Type                    Notes
  ----------------------- ----------------------- -----------------------
  id                      uuid PK                 

  created_by              uuid FK profiles.id     Owner

  name                    text                    

  description             text nullable           

  start_date              date                    

  end_date                date                    

  currency                text                    Default INR

  target_budget_minor     bigint nullable         Per-person target or
                                                  total must be
                                                  explicitly specified

  budget_scope            text                    `per_person` or
                                                  `group_total`

  cover_image_url         text nullable           

  status                  text                    draft, upcoming,
                                                  ongoing, completed,
                                                  archived

  created_at              timestamptz             

  updated_at              timestamptz             

  deleted_at              timestamptz nullable    Soft delete
  -----------------------------------------------------------------------

#### `trip_members`

  Column       Type                  Notes
  ------------ --------------------- --------------
  id           uuid PK               
  trip_id      uuid FK               
  user_id      uuid FK profiles.id   
  role         text                  owner/member
  joined_at    timestamptz           
  created_at   timestamptz           

Unique constraint: `(trip_id, user_id)`.

The owner should also be a row in `trip_members`. This makes member
counts and access checks consistent.

#### `trip_invitations`

  Column         Type                   Notes
  -------------- ---------------------- --------------------------------------
  id             uuid PK                
  trip_id        uuid FK                
  inviter_id     uuid FK profiles.id    
  invitee_id     uuid FK profiles.id    
  status         text                   pending, accepted, declined, revoked
  token          text unique nullable   Optional deep-link token
  created_at     timestamptz            
  responded_at   timestamptz nullable   

Prevent duplicate pending invitations for the same trip/user pair.

#### `itinerary_days`

  Column       Type            Notes
  ------------ --------------- -------
  id           uuid PK         
  trip_id      uuid FK         
  day_date     date            
  title        text nullable   
  notes        text nullable   
  sort_order   integer         

Unique constraint: `(trip_id, day_date)`.

#### `itinerary_items`

  Column                 Type                        Notes
  ---------------------- --------------------------- -----------------------------
  id                     uuid PK                     
  trip_id                uuid FK                     
  day_id                 uuid FK itinerary_days.id   
  place_id               uuid FK nullable            
  title                  text                        
  description            text nullable               
  category               text                        
  start_time             time nullable               
  end_time               time nullable               
  estimated_cost_minor   bigint nullable             
  currency               text nullable               
  status                 text                        planned, completed, skipped
  sort_order             integer                     
  created_by             uuid FK profiles.id         
  updated_at             timestamptz                 
  created_at             timestamptz                 

#### `itinerary_votes`

  Column              Type                  Notes
  ------------------- --------------------- ----------
  id                  uuid PK               
  itinerary_item_id   uuid FK               
  user_id             uuid FK profiles.id   
  value               smallint              +1 or -1
  created_at          timestamptz           
  updated_at          timestamptz           

Unique constraint: `(itinerary_item_id, user_id)`.

#### `itinerary_comments`

  Column              Type                  Notes
  ------------------- --------------------- -------
  id                  uuid PK               
  itinerary_item_id   uuid FK nullable      
  trip_id             uuid FK               
  user_id             uuid FK profiles.id   
  body                text                  
  created_at          timestamptz           
  updated_at          timestamptz           

Use either item-level or trip-level comments. At least one target must
be present.

#### `expenses`

  -----------------------------------------------------------------------
  Column                  Type                    Notes
  ----------------------- ----------------------- -----------------------
  id                      uuid PK                 

  trip_id                 uuid FK                 

  title                   text                    

  category                text                    

  amount_minor            bigint                  Positive integer

  currency                text                    

  amount_base_minor       bigint nullable         Converted amount in
                                                  trip currency

  paid_by                 uuid FK profiles.id     

  expense_date            date                    

  note                    text nullable           

  created_by              uuid FK profiles.id     

  created_at              timestamptz             

  updated_at              timestamptz             
  -----------------------------------------------------------------------

#### `expense_splits`

  Column        Type                  Notes
  ------------- --------------------- --------------
  id            uuid PK               
  expense_id    uuid FK               
  user_id       uuid FK profiles.id   
  share_minor   bigint                Non-negative
  created_at    timestamptz           

Unique constraint: `(expense_id, user_id)`.

For each expense, sum of `share_minor` must equal the base expense
amount used for calculations.

#### `saved_places`

  Column            Type                               Notes
  ----------------- ---------------------------------- -------
  id                uuid PK                            
  user_id           uuid FK profiles.id                
  place_id          uuid FK places.id nullable         
  destination_id    uuid FK destinations.id nullable   
  collection_name   text nullable                      
  created_at        timestamptz                        

Exactly one of `place_id` or `destination_id` should be present.

#### `memories`

  Column           Type                        Notes
  ---------------- --------------------------- ---------------
  id               uuid PK                     
  owner_id         uuid FK profiles.id         
  trip_id          uuid FK nullable            
  title            text                        
  description      text nullable               
  location_label   text nullable               
  latitude         double precision nullable   
  longitude        double precision nullable   
  started_at       timestamptz nullable        
  ended_at         timestamptz nullable        
  visibility       text                        private, trip
  created_at       timestamptz                 

#### `memory_media`

  Column           Type                        Notes
  ---------------- --------------------------- ---------------------------------
  id               uuid PK                     
  memory_id        uuid FK memories.id         
  owner_id         uuid FK profiles.id         
  storage_path     text nullable               Null for device-only media
  local_asset_id   text nullable               Device media-library identifier
  thumbnail_path   text nullable               
  captured_at      timestamptz nullable        
  latitude         double precision nullable   
  longitude        double precision nullable   
  location_label   text nullable               
  created_at       timestamptz                 

Do not assume local asset IDs are globally stable across devices.

#### `trip_activity`

  -----------------------------------------------------------------------
  Column                  Type                    Notes
  ----------------------- ----------------------- -----------------------
  id                      uuid PK                 

  trip_id                 uuid FK                 

  actor_id                uuid FK profiles.id     

  event_type              text                    invite_sent,
                                                  member_joined,
                                                  item_added,
                                                  expense_added, etc.

  entity_id               uuid nullable           

  summary                 text                    Human-readable activity

  created_at              timestamptz             
  -----------------------------------------------------------------------

#### `bookings`

  Column                   Type                   Notes
  ------------------------ ---------------------- ----------------------------------
  id                       uuid PK                
  trip_id                  uuid FK                
  title                    text                   
  category                 text                   stay, transport, activity, other
  provider                 text nullable          
  confirmation_reference   text nullable          
  booking_url              text nullable          
  start_at                 timestamptz nullable   
  end_at                   timestamptz nullable   
  notes                    text nullable          
  created_by               uuid FK profiles.id    
  created_at               timestamptz            

------------------------------------------------------------------------

## 5. Critical database operations

### 5.1 Five-member limit

Do not enforce the limit only in React Native.

Create a PostgreSQL function/RPC such as:

`accept_trip_invitation(invitation_id uuid)`

The function must: 1. Verify authenticated user is the invitee. 2. Lock
the trip row (`SELECT ... FOR UPDATE`) to prevent simultaneous
over-capacity joins. 3. Confirm invitation is pending. 4. Confirm user
is not already a member. 5. Count current trip members. 6. Reject if
count is already five. 7. Insert membership. 8. Update invitation status
to accepted. 9. Insert trip activity. 10. Return the updated trip/member
result.

This transaction is important even for a small prototype because two
invitations could be accepted at almost the same time.

### 5.2 Create trip

Create trip and owner membership in one transaction. Prefer a database
RPC `create_trip_with_owner(...)` or a service operation that handles
rollback/cleanup.

### 5.3 Vote

Use upsert on `(itinerary_item_id, user_id)` so a user has one current
vote per item.

### 5.4 Expense creation

Create expense and all split rows transactionally. Validate that split
sum equals the expense amount. A database RPC is preferred to avoid
partially created expenses.

### 5.5 Reordering itinerary

Store integer `sort_order`. For the prototype, use move-up/move-down
actions or simple reorder operations. Avoid complicated collaborative
drag-and-drop conflict resolution.

------------------------------------------------------------------------

## 6. Authentication and session architecture

### Supabase client

Create one client in `src/lib/supabase.ts`.

-   Read URL and publishable/anon key from `EXPO_PUBLIC_` environment
    variables.
-   Use the supported React Native session storage adapter.
-   Add `react-native-url-polyfill/auto` if required by the selected
    Supabase setup.
-   Configure token auto-refresh based on React Native AppState as
    recommended by Supabase.
-   Never put a Supabase service-role key in the mobile app.

### Auth provider

Create an `AuthProvider` that exposes: - `session` - `user` -
`profile` - `isLoading` - `signIn` - `signUp` - `signOut` -
`refreshProfile`

Do not duplicate auth state in multiple Zustand stores.

### Profile creation

After sign-up: 1. Auth account is created. 2. Profile row is created by
a database trigger or explicit onboarding operation. 3. User completes
display name and username. 4. App enters authenticated tabs.

Handle the case where auth account exists but profile creation failed;
provide a retry/onboarding recovery path.

------------------------------------------------------------------------

## 7. Data access and state management

### 7.1 Server state

Use TanStack Query for: - Profile - Destinations - Places - Trips -
Members - Invitations - Itinerary - Expenses - Memories - Activity

Set query keys centrally.

Examples: - `['profile', userId]` - `['trips', userId]` -
`['trip', tripId]` - `['trip-members', tripId]` -
`['trip-invitations', userId]` - `['itinerary', tripId]` -
`['expenses', tripId]` - `['destination', destinationId]`

### 7.2 Client state

Use Zustand only for ephemeral state: - Active trip selection if
needed - Temporary itinerary draft - UI filters - Assistant
draft/session state - Onboarding progress

Do not store canonical trip data in Zustand.

### 7.3 Repository interfaces

Define feature repositories, for example:

``` ts
interface TripRepository {
  listForUser(userId: string): Promise<Trip[]>;
  getById(tripId: string): Promise<Trip | null>;
  create(input: CreateTripInput): Promise<Trip>;
  update(tripId: string, input: UpdateTripInput): Promise<Trip>;
  delete(tripId: string): Promise<void>;
}

interface InvitationRepository {
  searchUsers(query: string): Promise<ProfileSummary[]>;
  invite(tripId: string, inviteeId: string): Promise<TripInvitation>;
  listIncoming(userId: string): Promise<TripInvitation[]>;
  accept(invitationId: string): Promise<void>;
  decline(invitationId: string): Promise<void>;
}
```

Implement Supabase-backed repositories. A mock repository can be used
for isolated component development, but the demo path should use
Supabase.

### 7.4 Mutations

For each mutation: - Validate input with Zod. - Call repository. -
Invalidate or update relevant queries. - Show success/failure
feedback. - Avoid optimistic updates for high-impact operations such as
invitation acceptance and expense splitting until rollback behavior is
correct.

------------------------------------------------------------------------

## 8. Realtime collaboration

Use Supabase Realtime for shared trip changes.

### Channels

Use private channels scoped to a trip, e.g. `trip:<tripId>`.

Subscribe to relevant Postgres changes: - `trip_members` -
`itinerary_items` - `itinerary_votes` - `itinerary_comments` -
`expenses` - `trip_activity`

On events: - Invalidate the affected TanStack Query key. - Refetch
canonical state. - Do not trust the realtime payload as the only source
of truth. - Remove subscriptions on unmount or trip change. - Avoid
opening duplicate subscriptions for the same trip.

### Realtime UX

-   Show a small "Live" or syncing indicator only if useful.
-   Use optimistic local feedback for simple actions.
-   If a realtime connection drops, the app should still allow a manual
    refresh.
-   Do not block the whole screen while reconnecting.

------------------------------------------------------------------------

## 9. Friends and invitations: detailed flow

### User search

Prototype approach: - Exact username match. - Email match if permitted
by the configured backend. - Return only minimal profile information:
id, username, display name, avatar. - Debounce search. - Do not return
the current user.

### Send invitation

`invite_to_trip(trip_id, invitee_id)` should: - Verify caller is a trip
member with permission to invite (owner for initial prototype). - Verify
invitee exists. - Reject if invitee is already a member. - Reject if a
pending invitation already exists. - Reject if membership plus pending
invitations has reached capacity five. - Create pending invitation. -
Add activity event.

Counting pending invitations in the capacity check prevents the owner
from sending ten invitations when only four seats remain. When an invite
is declined/revoked, the slot becomes available.

### Accept invitation

Use the transaction described in section 5.1. Recheck actual membership
count at acceptance time.

### Invitation states

`pending → accepted | declined | revoked`

Do not allow transitions out of a terminal state without a new
invitation.

### Together screen data

-   Incoming pending invitations.
-   Trips where current user is a member.
-   Optional recent activity.
-   Search people action.

------------------------------------------------------------------------

## 10. AI service architecture

### 10.1 Request flow

``` text
Chat UI
  ↓
Assistant hook
  ↓
AI service
  ↓
Supabase Edge Function / server endpoint
  ↓
Load permitted trip context
  ↓
LLM provider
  ↓
Validate structured output with Zod
  ↓
Return response + proposed actions
  ↓
User reviews proposal
  ↓
Trip/itinerary repository executes confirmed actions
```

### 10.2 Never call the paid LLM provider directly from the mobile app

Provider API keys must stay on a server/Edge Function.

### 10.3 Suggested request

``` ts
type ItineraryGenerationRequest = {
  tripId: string;
  prompt: string;
  preferences?: string[];
  constraints?: {
    budgetRemainingMinor?: number;
    maxTravelMinutesPerDay?: number;
    pace?: "relaxed" | "balanced" | "packed";
  };
};
```

### 10.4 Suggested response

``` ts
type ItinerarySuggestion = {
  title: string;
  summary: string;
  days: Array<{
    date: string;
    items: Array<{
      title: string;
      description?: string;
      category: string;
      suggestedPlaceId?: string;
      startTime?: string;
      endTime?: string;
      estimatedCostMinor?: number;
      currency?: string;
      rationale?: string;
    }>;
  }>;
  warnings: string[];
};
```

Validate all fields and dates. Only allow suggested place IDs that exist
in the destination/place dataset or treat them as unverified text
suggestions.

### 10.5 AI action confirmation

The assistant may: - Answer a question. - Suggest a change. - Prepare a
structured draft.

It may not silently write itinerary changes. The UI must show: - What
will be added/removed/changed. - Which dates are affected. - Estimated
budget impact if known. - Confirm and Cancel actions.

### 10.6 No-key fallback

Implement a deterministic `DemoAssistantService`: - Recognize a small
number of intents such as "create a relaxed day", "add food stops",
"suggest nature places". - Return structured sample suggestions from
seeded data. - Clearly label responses as demo suggestions. - Keep the
chat and apply flow functional.

------------------------------------------------------------------------

## 11. Gallery and memory architecture

### 11.1 Permission

Use Expo-compatible media-library APIs for browsing/metadata access, or
image picker for explicit selection. Verify API support for the chosen
Expo SDK.

Request only the permission needed for the action. If the OS supports
limited photo access, respect it.

### 11.2 Scan pipeline

``` text
User taps Scan Photos
  ↓
Explain purpose and request permission
  ↓
Read permitted asset metadata in pages
  ↓
Extract creation date and EXIF coordinates
  ↓
Normalize metadata
  ↓
Group by date + geographic proximity
  ↓
Show reviewable location clusters
  ↓
User confirms/edits group
  ↓
Create local memory collection
  ↓
Optional explicit upload to shared trip album
```

### 11.3 Location clustering

Prototype heuristic: - Sort assets by captured timestamp. - Group assets
if they are within a configurable time window and geographic radius. -
Initial suggestion: same day and within approximately 1--3 km, adjusted
for city density. - If coordinates are absent, group by date only. - Do
not claim that a cluster is a trip until user confirms or the heuristic
has sufficient evidence.

### 11.4 Local vs remote media

-   Local gallery assets remain on device by default.
-   Store asset IDs and metadata locally where appropriate.
-   Shared trip albums require explicit selection and upload.
-   Store uploaded objects in Supabase Storage.
-   Save storage paths in `memory_media`.
-   Use thumbnails for grids.
-   Never delete original device media when removing an app reference.

### 11.5 Prototype limitations

-   Asset identifiers may change if media is moved or the OS changes.
-   Permission scope may be limited.
-   GPS metadata may be missing.
-   Background scanning is out of scope.
-   Visual landmark recognition is out of scope for MVP.
-   Do not upload photos merely because the user granted gallery
    permission.

------------------------------------------------------------------------

## 12. Maps and location

For the Expo Go prototype: - Prefer a map library explicitly compatible
with the selected Expo Go SDK. - If a native map dependency is not
available, use a static map preview or open a map URL externally. - Ask
for foreground location permission only when the user requests nearby
recommendations or current-location features. - Do not continuously
track location. - Use coordinates only when available and permitted. -
Keep location-based features optional.

Maps should support: - Destination/place pins. - Itinerary place
overview. - Nearby places (P1). - Memory photo clusters (P1).

Do not invent distance or travel time. Use a routing provider if
accurate routing is required.

------------------------------------------------------------------------

## 13. Offline and persistence strategy

Prototype offline behavior: - TanStack Query cache for previously loaded
server data. - AsyncStorage for lightweight preferences and selected UI
state. - Optional SQLite for durable local memory metadata if needed. -
Display cached trip data when offline. - Disable or queue mutations that
require a server if no offline queue is implemented. - Clearly show
"You're offline" and a retry action. - Never show a failed write as
successful.

Do not build a sophisticated multi-device offline conflict-resolution
system in the prototype.

------------------------------------------------------------------------

## 14. Error handling and observability

### Error categories

-   Auth/session errors
-   Network errors
-   Permission denied
-   Validation errors
-   Capacity/invitation errors
-   Realtime disconnects
-   AI provider errors
-   Media access errors

### UX requirements

-   Human-readable message.
-   Retry where appropriate.
-   Preserve form input after a failed request.
-   Log technical details in development only.
-   Do not expose raw SQL/provider errors to users.

### Development tools

-   TypeScript strict mode.
-   ESLint.
-   Prettier.
-   `npx expo-doctor`.
-   Supabase local CLI if useful.
-   React Query Devtools only if a compatible RN tool is selected.
-   Simple structured console logging in development.

------------------------------------------------------------------------

## 15. Environment configuration

Create `.env.example`:

``` env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
# Use the publishable key name supplied by the current Supabase project if applicable.

# AI secret must NOT use EXPO_PUBLIC_.
# Configure it only in Supabase Edge Function secrets or server environment.
```

Validate required public environment variables at app startup.

Never commit real `.env` values.

The Supabase service-role key and LLM provider key must never be bundled
in the app.

------------------------------------------------------------------------

## 16. Database migrations and seed data

All schema changes must be versioned in `supabase/migrations/`.

Suggested migration order: 1. Profiles and profile creation trigger. 2.
Destinations and places. 3. Trips and trip members. 4. Invitations and
transactional RPC functions. 5. Itinerary days/items/votes/comments. 6.
Expenses and splits. 7. Saved places. 8. Memories and media. 9. Bookings
and trip activity. 10. Indexes and access policies.

Seed: - A small destination set. - A curated set of places. - Demo trip
content. - Sample itinerary and expenses.

Do not use generated fake reviews or pretend live availability. Clearly
mark seeded data as illustrative.

------------------------------------------------------------------------

## 17. Testing strategy

### 17.1 Unit tests

Test: - Date range validation. - Currency formatting. - Equal expense
split and remainder distribution. - Balance calculation. - Trip status
calculation. - Itinerary sorting. - Gallery clustering. - AI response
schema validation. - Five-member capacity calculations.

### 17.2 Integration tests

Test with Supabase: - Profile creation. - Trip creation with owner
membership. - Invite user. - Accept/decline invitation. - Reject sixth
member. - Create/edit/delete itinerary item. - Vote upsert. - Add
expense and splits. - Query shared trip data.

### 17.3 Manual device tests

Use at least two separate user sessions: - Device/session A: owner. -
Device/session B: invitee.

Test realtime: - A invites B. - B sees invite. - B accepts. - A sees B
join. - B adds itinerary item. - A sees item. - A adds expense. - B sees
expense and updated budget.

### 17.4 Pre-demo checklist

-   [ ] App launches in Expo Go.
-   [ ] No SDK mismatch.
-   [ ] No unresolved native module errors.
-   [ ] Auth works.
-   [ ] Profile setup works.
-   [ ] Create trip works.
-   [ ] Invite works across accounts.
-   [ ] Accept/decline works.
-   [ ] Five-member cap works.
-   [ ] Itinerary updates persist.
-   [ ] Votes/comments work.
-   [ ] Expenses and splits balance.
-   [ ] Explore search works.
-   [ ] Saved places persist.
-   [ ] AI configured or demo fallback works.
-   [ ] Gallery permission denial is handled.
-   [ ] Gallery scan can create a collection.
-   [ ] Empty/error/loading states are present.
-   [ ] No dead buttons.
-   [ ] README setup is accurate.

------------------------------------------------------------------------

## 18. Codex implementation rules

These rules are important. Codex should follow them for every task.

1.  Read `product.md` and `architecture.md` before implementing a
    feature.
2.  Inspect the existing repository before changing files.
3.  Do not rewrite working architecture without a clear reason.
4.  Use TypeScript; avoid `any`. If unavoidable, explain why and isolate
    it.
5.  Use NativeWind classes for standard styling.
6.  Keep route files thin.
7.  Keep Supabase calls out of screen components.
8.  Use repositories and typed services.
9.  Validate all form and AI input with Zod.
10. Do not create fake functionality or placeholder buttons that appear
    functional.
11. Do not silently swallow errors.
12. Add loading, empty, error and success states.
13. Do not hard-code the current user.
14. Do not hard-code demo trip IDs in production code paths.
15. Keep demo seed data separate from application logic.
16. Use database transactions/RPC for capacity-sensitive and multi-row
    operations.
17. Use integer minor units for money.
18. Unsubscribe from realtime channels on cleanup.
19. Verify Expo Go compatibility before adding a native dependency.
20. Run TypeScript checks and Expo diagnostics after meaningful changes.
21. Do not expose service-role or AI provider secrets in client code.
22. Ask before introducing a new major library or changing the stack.
23. Update documentation when architecture or environment requirements
    change.
24. Prefer a complete, working vertical slice over many unfinished
    screens.

### Required completion report for each Codex task

At the end of each implementation task, report: - Files
created/changed. - Functionality implemented. - Database migrations
required. - Environment variables required. - Commands run. -
Tests/checks passed. - Known limitations. - Exact manual steps needed to
verify on Expo Go.

------------------------------------------------------------------------

## 19. Suggested implementation sequence

Build vertical slices in this order.

### Milestone 0 --- Project foundation

-   Create Expo TypeScript app.
-   Configure Expo Router.
-   Configure NativeWind.
-   Add theme tokens and reusable primitives.
-   Add Supabase client and environment validation.
-   Add AuthProvider and TanStack Query provider.
-   Verify launch in Expo Go.

**Exit condition:** app launches, navigation works, user can sign
in/out.

### Milestone 1 --- Explore and profile

-   Profile setup.
-   Seed destinations and places.
-   Explore screen.
-   Search and destination detail.
-   Save place.

**Exit condition:** users can browse and save real backend records.

### Milestone 2 --- Trip foundation

-   Create trip.
-   Trip list and detail.
-   Owner membership.
-   Edit dates/details.
-   Trip status and day generation.

**Exit condition:** a trip can be created and reopened after app
restart.

### Milestone 3 --- Friends and collaboration

-   User search.
-   Invitation creation.
-   Invitation inbox.
-   Accept/decline.
-   Five-member enforcement.
-   Realtime member list.

**Exit condition:** two accounts can join and see the same trip.

### Milestone 4 --- Itinerary

-   Add/edit/delete items.
-   Day grouping.
-   Votes and comments.
-   Realtime refresh.
-   Saved place to itinerary.

**Exit condition:** multiple users can collaborate on one itinerary.

### Milestone 5 --- Budget

-   Add expenses.
-   Equal splits.
-   Balance summary.
-   Expense editing/deletion.
-   Tests for arithmetic.

**Exit condition:** group balances reconcile to zero.

### Milestone 6 --- AI

-   Chat interface.
-   Edge Function or backend endpoint.
-   Structured itinerary schema.
-   Preview/apply workflow.
-   Demo fallback.

**Exit condition:** AI suggestion can be applied as real itinerary
items.

### Milestone 7 --- Memories

-   Gallery permission.
-   Metadata scan.
-   Date/location clustering.
-   Review and confirm.
-   Local memory collection.
-   Optional selected media upload.

**Exit condition:** a user can organize real device photos without
uploading their entire gallery.

### Milestone 8 --- Polish and demo

-   Loading/empty/error states.
-   Responsive layouts and safe areas.
-   Seed demo content.
-   Two-device test.
-   README and setup guide.
-   Full demo rehearsal.

------------------------------------------------------------------------

## 20. Initial project setup commands

The exact package versions must be selected based on the Expo Go version
installed on the demo device.

Example starting point:

``` bash
npx create-expo-app@latest wayfarer
cd wayfarer

# Use Expo's installer for packages with native compatibility requirements.
npx expo install expo-router expo-image expo-image-picker expo-media-library expo-location

# Add application dependencies.
npm install @supabase/supabase-js @tanstack/react-query zustand zod
npm install react-hook-form @hookform/resolvers lucide-react-native

# Add NativeWind using the installation guide for the selected Expo SDK.
# Do not blindly copy a configuration for a different SDK/NativeWind version.

# Start Expo.
npx expo start
```

After setup:

``` bash
npx expo-doctor
npx tsc --noEmit
```

Use `npx expo install --check` where supported by the selected SDK.

------------------------------------------------------------------------

## 21. Official references

Use these as the source of truth when implementing and upgrading
dependencies:

-   Expo documentation: https://docs.expo.dev/
-   Expo SDK reference: https://docs.expo.dev/versions/latest/
-   Expo Go limitations: https://docs.expo.dev/faq/
-   Expo and Supabase: https://docs.expo.dev/guides/using-supabase/
-   Supabase Expo quickstart:
    https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native
-   Supabase Realtime: https://supabase.com/docs/guides/realtime
-   NativeWind installation:
    https://www.nativewind.dev/docs/getting-started/installation
-   Expo Router: https://docs.expo.dev/router/introduction/

------------------------------------------------------------------------

## 22. Final architecture principles

The prototype should optimize for **clarity, demonstrable functionality
and iteration speed**.

Do not over-engineer for scale. Do not under-engineer the shared data
flows.

The most important technical flows are: 1. Authentication and user
identity. 2. Trip creation and membership. 3. Invitations and
five-member enforcement. 4. Realtime collaborative itinerary. 5. Expense
calculations. 6. Gallery permission and local organization. 7. AI
proposal and confirmed application.

If these flows work reliably and the interface feels cohesive, the
prototype will demonstrate the product's core promise.
