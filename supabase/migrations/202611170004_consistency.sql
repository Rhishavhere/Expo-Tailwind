begin;
create function public.vote_item(item_id uuid,vote_value integer) returns void language plpgsql security definer set search_path='' as $$
declare target uuid;
begin
 select trip_id into target from public.itinerary_items where id=item_id;
 if not public.is_member(target) then raise exception 'Trip membership required'; end if;
 insert into public.itinerary_votes(itinerary_item_id,trip_id,user_id,value) values(item_id,target,auth.uid(),vote_value)
 on conflict(itinerary_item_id,user_id) do update set value=excluded.value;
end $$;
create function public.move_item(item_id uuid,direction integer,expected timestamptz) returns void language plpgsql security definer set search_path='' as $$
declare current_item public.itinerary_items; ids uuid[]; position integer; neighbour uuid;
begin
 select * into current_item from public.itinerary_items where id=item_id;
 perform 1 from public.trips where id=current_item.trip_id for update;
 if not public.is_member(current_item.trip_id) then raise exception 'Trip membership required'; end if;
 select * into current_item from public.itinerary_items where id=item_id for update;
 if current_item.updated_at<>expected then raise exception 'Itinerary changed. Refresh first.'; end if;
 if direction not in (-1,1) then raise exception 'Invalid direction'; end if;
 select array_agg(id order by sort_order,id) into ids from public.itinerary_items where trip_id=current_item.trip_id and day_date=current_item.day_date;
 position := array_position(ids,item_id); neighbour := ids[position+direction];
 if neighbour is null then return; end if;
 ids[position] := neighbour; ids[position+direction] := item_id;
 update public.itinerary_items i set sort_order=x.ord from unnest(ids) with ordinality x(id,ord) where i.id=x.id;
end $$;
create function public.save_trip(input jsonb) returns void language plpgsql security definer set search_path='' as $$
declare current_trip public.trips;
begin
 select * into current_trip from public.trips where id=(input->>'id')::uuid for update;
 if not public.is_owner(current_trip.id) then raise exception 'Only the trip owner can edit'; end if;
 if current_trip.updated_at<>(input->>'updated_at')::timestamptz then raise exception 'Trip changed. Refresh first.'; end if;
 perform public.edit_trip_dates(current_trip.id,(input->>'start_date')::date,(input->>'end_date')::date);
 update public.trips set name=input->>'name',destination_id=(input->>'destination_id')::uuid,
 description=input->>'description',target_budget_minor=nullif(input->>'target_budget_minor','')::bigint,
 budget_scope=input->>'budget_scope' where id=current_trip.id;
end $$;
revoke all on function public.vote_item(uuid,integer),public.move_item(uuid,integer,timestamptz),public.save_trip(jsonb) from public;
grant execute on function public.vote_item(uuid,integer),public.move_item(uuid,integer,timestamptz),public.save_trip(jsonb) to authenticated;
-- Supabase Storage profile avatars stay public only when explicitly supplied as a URL.
-- Gallery collections are device-local in this prototype; no gallery objects are uploaded.
commit;
