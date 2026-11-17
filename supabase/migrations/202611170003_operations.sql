begin;
create function public.create_trip_with_owner(input jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid; first_day date; last_day date;
begin
 if auth.uid() is null then raise exception 'Sign in first'; end if;
 first_day := (input->>'start_date')::date; last_day := (input->>'end_date')::date;
 insert into public.trips(created_by,name,destination_id,description,start_date,end_date,currency,target_budget_minor,budget_scope)
 values(auth.uid(),input->>'name',(input->>'destination_id')::uuid,coalesce(input->>'description',''),first_day,last_day,
 coalesce(input->>'currency','INR'),nullif(input->>'target_budget_minor','')::bigint,coalesce(input->>'budget_scope','per_person')) returning id into result;
 insert into public.trip_members(trip_id,user_id,role) values(result,auth.uid(),'owner');
 insert into public.itinerary_days select result,d::date from generate_series(first_day,last_day,'1 day'::interval) d;
 insert into public.trip_activity(trip_id,actor_id,summary) values(result,auth.uid(),'Started the trip');
 return result;
end $$;

create function public.edit_trip_dates(target_trip uuid, first_day date, last_day date) returns void language plpgsql security definer set search_path='' as $$
begin
 perform 1 from public.trips where id=target_trip for update;
 if not public.is_owner(target_trip) then raise exception 'Only the owner can change dates'; end if;
 if last_day<first_day or last_day-first_day>60 then raise exception 'Trip dates must span 1–61 days'; end if;
 if exists(select 1 from public.itinerary_items where trip_id=target_trip and day_date not between first_day and last_day) then
 raise exception 'Move or remove itinerary items outside the new dates first'; end if;
 insert into public.itinerary_days select target_trip,d::date from generate_series(first_day,last_day,'1 day'::interval) d on conflict do nothing;
 delete from public.itinerary_days where trip_id=target_trip and day_date not between first_day and last_day;
 update public.trips set start_date=first_day,end_date=last_day where id=target_trip;
end $$;

create function public.search_users(term text) returns setof public.profiles language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or length(trim(term))<3 then return; end if;
 return query select p.* from public.profiles p join auth.users u on u.id=p.id
 where p.id<>auth.uid() and (p.username=lower(trim(term)) or lower(u.email)=lower(trim(term))) limit 1;
end $$;

create function public.invite_to_trip(target_trip uuid,target_user uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid; capacity integer;
begin
 perform 1 from public.trips where id=target_trip for update;
 if not public.is_owner(target_trip) then raise exception 'Only the owner can invite'; end if;
 if exists(select 1 from public.trip_members where trip_id=target_trip and user_id=target_user) then raise exception 'Already a member'; end if;
 if exists(select 1 from public.trip_invitations where trip_id=target_trip and invitee_id=target_user and status='pending') then raise exception 'Invitation already pending'; end if;
 select (select count(*) from public.trip_members where trip_id=target_trip)+(select count(*) from public.trip_invitations where trip_id=target_trip and status='pending') into capacity;
 if capacity>=5 then raise exception 'This trip has five members or reserved invitations. Revoke an invitation to free a place.'; end if;
 insert into public.trip_invitations(trip_id,inviter_id,invitee_id) values(target_trip,auth.uid(),target_user) returning id into result;
 insert into public.trip_activity(trip_id,actor_id,summary) values(target_trip,auth.uid(),'Invited a friend');
 return result;
end $$;

create function public.respond_invitation(invitation_id uuid,accept boolean) returns void language plpgsql security definer set search_path='' as $$
declare inv public.trip_invitations;
begin
 select * into inv from public.trip_invitations where id=invitation_id;
 if inv.id is null or inv.invitee_id<>auth.uid() then raise exception 'Invitation unavailable'; end if;
 -- All membership mutations lock the trip first, then invitation, in the same order.
 perform 1 from public.trips where id=inv.trip_id and deleted_at is null for update;
 if not found then raise exception 'Trip unavailable'; end if;
 select * into inv from public.trip_invitations where id=invitation_id for update;
 if inv.status<>'pending' then raise exception 'Invitation already answered'; end if;
 if accept then
  if (select count(*) from public.trip_members where trip_id=inv.trip_id)>=5 then raise exception 'Trip capacity reached: five members maximum'; end if;
  insert into public.trip_members(trip_id,user_id,role) values(inv.trip_id,auth.uid(),'member');
  insert into public.trip_activity(trip_id,actor_id,summary) values(inv.trip_id,auth.uid(),'Joined the trip');
 end if;
 update public.trip_invitations set status=case when accept then 'accepted' else 'declined' end,responded_at=now() where id=inv.id;
end $$;

create function public.revoke_invitation(invitation_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare target uuid;
begin
 select trip_id into target from public.trip_invitations where id=invitation_id;
 perform 1 from public.trips where id=target for update;
 if not public.is_owner(target) then raise exception 'Only the owner can revoke invitations'; end if;
 update public.trip_invitations set status='revoked',responded_at=now() where id=invitation_id and status='pending';
 if not found then raise exception 'Invitation is no longer pending'; end if;
end $$;

create function public.remove_trip_member(target_trip uuid,target_user uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 perform 1 from public.trips where id=target_trip for update;
 if not public.is_member(target_trip) or (target_user<>auth.uid() and not public.is_owner(target_trip)) then raise exception 'Member permission required'; end if;
 if exists(select 1 from public.trips where id=target_trip and created_by=target_user) then raise exception 'Owner cannot leave; archive or delete the trip instead'; end if;
 delete from public.trip_members where trip_id=target_trip and user_id=target_user;
 insert into public.trip_activity(trip_id,actor_id,summary) values(target_trip,auth.uid(),'A member left the trip');
end $$;

create function public.save_expense(input jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare target uuid := (input->>'trip_id')::uuid; result uuid := nullif(input->>'id','')::uuid;
 amount bigint := (input->>'amount_minor')::bigint; payer uuid := (input->>'paid_by')::uuid;
 selected uuid[]; old public.expenses; trip_currency text; n integer;
begin
 perform 1 from public.trips where id=target for update;
 if not public.is_member(target) then raise exception 'Trip membership required'; end if;
 select currency into trip_currency from public.trips where id=target;
 if input->>'currency'<>trip_currency then raise exception 'Use the trip currency'; end if;
 if not exists(select 1 from public.trip_members where trip_id=target and user_id=payer) then raise exception 'Payer must be a member'; end if;
 select array_agg(distinct value::uuid order by value::uuid) into selected from jsonb_array_elements_text(input->'participants');
 n := cardinality(selected);
 if n is null or n<1 or n>5 then raise exception 'Select 1–5 split participants'; end if;
 if exists(select 1 from unnest(selected) u where not exists(select 1 from public.trip_members where trip_id=target and user_id=u)) then raise exception 'Split participants must be members'; end if;
 if result is not null then
  select * into old from public.expenses where id=result and trip_id=target for update;
  if old.id is null or (old.created_by<>auth.uid() and not public.is_owner(target)) then raise exception 'Only the expense creator or trip owner can edit'; end if;
  if old.updated_at<>(input->>'updated_at')::timestamptz then raise exception 'Expense changed. Refresh before editing.'; end if;
  update public.expenses set title=input->>'title',category=input->>'category',amount_minor=amount,paid_by=payer,expense_date=(input->>'expense_date')::date,note=coalesce(input->>'note','') where id=result;
  delete from public.expense_splits where expense_id=result;
 else
  insert into public.expenses(trip_id,title,category,amount_minor,currency,paid_by,expense_date,note,created_by)
  values(target,input->>'title',input->>'category',amount,trip_currency,payer,(input->>'expense_date')::date,coalesce(input->>'note',''),auth.uid()) returning id into result;
 end if;
 insert into public.expense_splits(expense_id,user_id,share_minor)
 select result,u,amount/n+case when ord<=amount%n then 1 else 0 end from unnest(selected) with ordinality as ids(u,ord);
 insert into public.trip_activity(trip_id,actor_id,summary) values(target,auth.uid(),'Updated trip expenses');
 return result;
end $$;

create function public.apply_itinerary(target_trip uuid,suggestions jsonb) returns void language plpgsql security definer set search_path='' as $$
declare suggestion jsonb; trip_currency text;
begin
 perform 1 from public.trips where id=target_trip for update;
 if not public.is_member(target_trip) then raise exception 'Trip membership required'; end if;
 if jsonb_typeof(suggestions)<>'array' or jsonb_array_length(suggestions)>30 then raise exception 'Invalid itinerary draft'; end if;
 select currency into trip_currency from public.trips where id=target_trip;
 for suggestion in select * from jsonb_array_elements(suggestions) loop
 insert into public.itinerary_items(trip_id,day_date,title,description,category,currency,estimated_cost_minor,created_by,sort_order)
 values(target_trip,(suggestion->>'day_date')::date,suggestion->>'title',coalesce(suggestion->>'description',''),coalesce(suggestion->>'category','activity'),trip_currency,coalesce((suggestion->>'estimated_cost_minor')::bigint,0),auth.uid(),
 coalesce((select max(sort_order)+1 from public.itinerary_items where trip_id=target_trip and day_date=(suggestion->>'day_date')::date),0));
 end loop;
end $$;

create function public.record_item_activity() returns trigger language plpgsql security definer set search_path='' as $$
begin insert into public.trip_activity(trip_id,actor_id,summary) values(new.trip_id,auth.uid(),'Added an itinerary idea'); return new; end $$;
create trigger new_item after insert on public.itinerary_items for each row execute function public.record_item_activity();
create policy historical_profiles on public.profiles for select to authenticated using(exists(
 select 1 from public.expenses e where public.is_member(e.trip_id) and (e.paid_by=profiles.id or exists(select 1 from public.expense_splits s where s.expense_id=e.id and s.user_id=profiles.id))
));
-- No anonymous execution of mutation or lookup functions.
revoke all on function public.is_member(uuid),public.is_owner(uuid),public.create_trip_with_owner(jsonb),public.edit_trip_dates(uuid,date,date),public.search_users(text),public.invite_to_trip(uuid,uuid),public.respond_invitation(uuid,boolean),public.revoke_invitation(uuid),public.remove_trip_member(uuid,uuid),public.save_expense(jsonb),public.apply_itinerary(uuid,jsonb),public.record_item_activity() from public;
grant execute on function public.is_member(uuid),public.is_owner(uuid),public.create_trip_with_owner(jsonb),public.edit_trip_dates(uuid,date,date),public.search_users(text),public.invite_to_trip(uuid,uuid),public.respond_invitation(uuid,boolean),public.revoke_invitation(uuid),public.remove_trip_member(uuid,uuid),public.save_expense(jsonb),public.apply_itinerary(uuid,jsonb) to authenticated;
-- Postgres Changes authorizes each row via RLS. Payloads only invalidate queries.
alter publication supabase_realtime add table public.trip_members,public.trip_invitations,public.itinerary_items,public.itinerary_votes,public.itinerary_comments,public.expenses,public.trip_activity,public.trips;
commit;
