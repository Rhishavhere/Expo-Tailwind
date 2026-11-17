-- Run migrations in filename order in a Supabase development project.
begin;
create table public.profiles (
 id uuid primary key references auth.users on delete cascade,
 username text unique check(username ~ '^[a-z0-9_]{3,24}$'),
 display_name text not null check(length(display_name) between 1 and 60),
 avatar_url text, bio text, interests text[] not null default '{}',
 default_currency text not null default 'INR' check(default_currency ~ '^[A-Z]{3}$'),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create function public.touch_updated_at() returns trigger language plpgsql set search_path='' as $$
begin new.updated_at = clock_timestamp(); return new; end $$;
create trigger profile_timestamp before update on public.profiles for each row execute function public.touch_updated_at();
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,display_name) values(new.id,left(coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'),''),'Traveller'),60));
 return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
create function public.ensure_profile() returns public.profiles language plpgsql security definer set search_path='' as $$
declare result public.profiles;
begin
 if auth.uid() is null then raise exception 'Sign in first'; end if;
 insert into public.profiles(id,display_name)
 select id,left(coalesce(nullif(trim(raw_user_meta_data->>'display_name'),''),'Traveller'),60) from auth.users where id=auth.uid()
 on conflict(id) do nothing;
 select * into result from public.profiles where id=auth.uid();
 return result;
end $$;
alter table public.profiles enable row level security;
create policy own_profile on public.profiles for select to authenticated using(id=auth.uid());
create policy edit_own_profile on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
revoke all on public.profiles from anon,authenticated;
grant select on public.profiles to authenticated;
grant update(username,display_name,avatar_url,bio,interests,default_currency) on public.profiles to authenticated;
revoke all on function public.handle_new_user(), public.ensure_profile() from public;
grant execute on function public.ensure_profile() to authenticated;
commit;
