begin;
create table public.destinations (
 id uuid primary key default gen_random_uuid(), name text not null, slug text unique not null,
 country text not null, region text not null, description text not null, hero_image_url text not null,
 best_time_text text not null, tips text not null, budget_min_minor bigint not null default 0,
 budget_max_minor bigint not null default 0, currency text not null default 'INR', tags text[] not null default '{}',
 latitude double precision not null, longitude double precision not null, is_published boolean not null default true,
 created_at timestamptz not null default now()
);
create table public.places (
 id uuid primary key default gen_random_uuid(), destination_id uuid not null references public.destinations,
 name text not null, category text not null, description text not null, address text not null,
 image_url text not null, latitude double precision, longitude double precision,
 estimated_cost_minor bigint not null default 0 check(estimated_cost_minor>=0), currency text not null default 'INR',
 tags text[] not null default '{}', source_label text not null default 'Illustrative curated demo content',
 is_published boolean not null default true, created_at timestamptz not null default now()
);
create table public.trips (
 id uuid primary key default gen_random_uuid(), created_by uuid not null references public.profiles,
 name text not null check(length(trim(name)) between 2 and 80), destination_id uuid not null references public.destinations,
 description text not null default '', start_date date not null, end_date date not null,
 currency text not null default 'INR' check(currency ~ '^[A-Z]{3}$'),
 target_budget_minor bigint check(target_budget_minor>=0),
 budget_scope text not null default 'per_person' check(budget_scope in ('per_person','group_total')),
 cover_image_url text, status text not null default 'upcoming' check(status in ('draft','upcoming','ongoing','completed','archived')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
 check(end_date>=start_date and end_date-start_date<=60)
);
create table public.trip_members (
 id uuid primary key default gen_random_uuid(), trip_id uuid not null references public.trips on delete cascade,
 user_id uuid not null references public.profiles, role text not null check(role in ('owner','member')),
 joined_at timestamptz not null default now(), unique(trip_id,user_id)
);
create unique index one_owner on public.trip_members(trip_id) where role='owner';
create table public.trip_invitations (
 id uuid primary key default gen_random_uuid(), trip_id uuid not null references public.trips on delete cascade,
 inviter_id uuid not null references public.profiles, invitee_id uuid not null references public.profiles,
 status text not null default 'pending' check(status in ('pending','accepted','declined','revoked')),
 token text not null unique default (replace(gen_random_uuid()::text,'-','') || replace(gen_random_uuid()::text,'-','')), created_at timestamptz not null default now(), responded_at timestamptz
);
create unique index one_pending_invite on public.trip_invitations(trip_id,invitee_id) where status='pending';
create table public.itinerary_days (
 trip_id uuid not null references public.trips on delete cascade, day_date date not null, primary key(trip_id,day_date)
);
create table public.itinerary_items (
 id uuid primary key default gen_random_uuid(), trip_id uuid not null references public.trips on delete cascade,
 day_date date not null, place_id uuid references public.places, title text not null check(length(trim(title)) between 1 and 120),
 description text not null default '', category text not null default 'activity', start_time time, end_time time,
 estimated_cost_minor bigint not null default 0 check(estimated_cost_minor>=0),
 currency text not null default 'INR', status text not null default 'planned' check(status in ('planned','completed','skipped')),
 sort_order integer not null default 0, created_by uuid not null references public.profiles,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(trip_id,day_date) references public.itinerary_days on delete cascade,
 unique(id,trip_id), check(end_time is null or start_time is null or end_time>=start_time)
);
create table public.itinerary_votes (
 id uuid primary key default gen_random_uuid(), itinerary_item_id uuid not null, trip_id uuid not null,
 user_id uuid not null references public.profiles, value smallint not null check(value in (-1,1)),
 unique(itinerary_item_id,user_id), foreign key(itinerary_item_id,trip_id) references public.itinerary_items(id,trip_id) on delete cascade
);
create table public.itinerary_comments (
 id uuid primary key default gen_random_uuid(), trip_id uuid not null references public.trips on delete cascade,
 itinerary_item_id uuid, user_id uuid not null references public.profiles,
 body text not null check(length(trim(body)) between 1 and 2000), created_at timestamptz not null default now(),
 foreign key(itinerary_item_id,trip_id) references public.itinerary_items(id,trip_id) on delete cascade
);
create table public.expenses (
 id uuid primary key default gen_random_uuid(), trip_id uuid not null references public.trips on delete cascade,
 title text not null check(length(trim(title)) between 1 and 120), category text not null,
 amount_minor bigint not null check(amount_minor>0 and amount_minor<=100000000000),
 currency text not null, paid_by uuid not null references public.profiles, expense_date date not null, note text not null default '',
 created_by uuid not null references public.profiles, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.expense_splits (
 expense_id uuid not null references public.expenses on delete cascade, user_id uuid not null references public.profiles,
 share_minor bigint not null check(share_minor>=0), primary key(expense_id,user_id)
);
create table public.saved_places (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles on delete cascade,
 place_id uuid references public.places on delete cascade, destination_id uuid references public.destinations on delete cascade,
 created_at timestamptz not null default now(), check(num_nonnulls(place_id,destination_id)=1),
 unique(user_id,place_id), unique(user_id,destination_id)
);
create table public.trip_activity (
 id uuid primary key default gen_random_uuid(), trip_id uuid not null references public.trips on delete cascade,
 actor_id uuid not null references public.profiles, summary text not null, created_at timestamptz not null default now()
);
create index members_user on public.trip_members(user_id);
create index incoming_invites on public.trip_invitations(invitee_id,status);
create index items_trip on public.itinerary_items(trip_id,day_date,sort_order);
create index comments_trip on public.itinerary_comments(trip_id,created_at);
create index expenses_trip on public.expenses(trip_id);
create index activity_trip on public.trip_activity(trip_id,created_at);
create trigger trip_timestamp before update on public.trips for each row execute function public.touch_updated_at();
create trigger item_timestamp before update on public.itinerary_items for each row execute function public.touch_updated_at();
create trigger expense_timestamp before update on public.expenses for each row execute function public.touch_updated_at();

create function public.is_member(target uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.trip_members m join public.trips t on t.id=m.trip_id where m.trip_id=target and m.user_id=auth.uid() and t.deleted_at is null);
$$;
create function public.is_owner(target uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.trips where id=target and created_by=auth.uid() and deleted_at is null);
$$;
-- All writes to immutable ownership fields are excluded from column grants below.
do $$ declare t text; begin
 foreach t in array array['destinations','places','trips','trip_members','trip_invitations','itinerary_days','itinerary_items','itinerary_votes','itinerary_comments','expenses','expense_splits','saved_places','trip_activity'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon, authenticated',t);
  execute format('grant select on public.%I to authenticated',t);
 end loop;
end $$;
create policy published_destinations on public.destinations for select to authenticated using(is_published);
create policy published_places on public.places for select to authenticated using(is_published);
create policy member_trips on public.trips for select to authenticated using(public.is_member(id));
create policy owner_edit on public.trips for update to authenticated using(public.is_owner(id)) with check(created_by=auth.uid());
grant update(name,description,target_budget_minor,budget_scope,status,deleted_at,cover_image_url) on public.trips to authenticated;
create policy member_members on public.trip_members for select to authenticated using(public.is_member(trip_id));
create policy invitation_read on public.trip_invitations for select to authenticated using(invitee_id=auth.uid() or public.is_member(trip_id));
create policy member_days on public.itinerary_days for select to authenticated using(public.is_member(trip_id));
create policy shared_profiles on public.profiles for select to authenticated using(exists(
 select 1 from public.trip_members a join public.trip_members b on b.trip_id=a.trip_id where a.user_id=auth.uid() and b.user_id=profiles.id
));
create policy member_items_read on public.itinerary_items for select to authenticated using(public.is_member(trip_id));
create policy member_items_add on public.itinerary_items for insert to authenticated with check(public.is_member(trip_id) and created_by=auth.uid());
create policy member_items_edit on public.itinerary_items for update to authenticated using(public.is_member(trip_id)) with check(public.is_member(trip_id));
create policy member_items_delete on public.itinerary_items for delete to authenticated using(public.is_member(trip_id));
grant insert on public.itinerary_items to authenticated;
grant update(day_date,place_id,title,description,category,start_time,end_time,estimated_cost_minor,status,sort_order) on public.itinerary_items to authenticated;
grant delete on public.itinerary_items to authenticated;
create policy member_votes_read on public.itinerary_votes for select to authenticated using(public.is_member(trip_id));
create policy own_votes_add on public.itinerary_votes for insert to authenticated with check(public.is_member(trip_id) and user_id=auth.uid());
create policy own_votes_edit on public.itinerary_votes for update to authenticated using(user_id=auth.uid() and public.is_member(trip_id)) with check(user_id=auth.uid() and public.is_member(trip_id));
grant insert on public.itinerary_votes to authenticated;
grant update(value) on public.itinerary_votes to authenticated;
create policy member_comments_read on public.itinerary_comments for select to authenticated using(public.is_member(trip_id));
create policy member_comments_add on public.itinerary_comments for insert to authenticated with check(public.is_member(trip_id) and user_id=auth.uid());
grant insert on public.itinerary_comments to authenticated;
create policy member_expenses on public.expenses for select to authenticated using(public.is_member(trip_id));
create policy delete_expenses on public.expenses for delete to authenticated using(public.is_member(trip_id) and (created_by=auth.uid() or public.is_owner(trip_id)));
grant delete on public.expenses to authenticated;
create policy member_splits on public.expense_splits for select to authenticated using(exists(select 1 from public.expenses e where e.id=expense_id and public.is_member(e.trip_id)));
create policy own_saved on public.saved_places for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant insert,delete on public.saved_places to authenticated;
create policy member_activity on public.trip_activity for select to authenticated using(public.is_member(trip_id));
commit;
