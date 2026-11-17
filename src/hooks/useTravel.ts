import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { travelRepository } from '@/src/repositories/travel-repository';
import { keys } from '@/src/lib/query-client';
import { getSupabase } from '@/src/lib/supabase';
export const useDestinations=()=>useQuery({queryKey:keys.destinations,queryFn:travelRepository.destinations});
export const usePlaces=()=>useQuery({queryKey:keys.places,queryFn:travelRepository.places});
export const useTrips=()=>useQuery({queryKey:keys.trips,queryFn:travelRepository.trips});
export const useSaved=()=>useQuery({queryKey:keys.saved,queryFn:travelRepository.saved});
export const useIncoming=()=>useQuery({queryKey:keys.incoming,queryFn:travelRepository.incoming});
export function useTrip(id:string) {
 const cache=useQueryClient();
 useEffect(()=>{
  const db=getSupabase();let channel=db.channel('trip:'+id);
  for(const table of ['trips','trip_members','trip_invitations','itinerary_items','itinerary_votes','itinerary_comments','expenses','trip_activity']) {
   channel=channel.on('postgres_changes',{event:'*',schema:'public',table,filter:(table==='trips'?'id':'trip_id')+'=eq.'+id},()=>void cache.invalidateQueries({queryKey:keys.trip(id)}));
  }
  channel.subscribe(); return()=>{void db.removeChannel(channel);};
 },[id,cache]);
 return useQuery({queryKey:keys.trip(id),queryFn:()=>travelRepository.trip(id)});
}
export function useInvitationRealtime(user:string|undefined) {
 const cache=useQueryClient();
 useEffect(()=>{if(!user)return;const db=getSupabase();const channel=db.channel('inbox:'+user).on('postgres_changes',{event:'*',schema:'public',table:'trip_invitations',filter:'invitee_id=eq.'+user},()=>{void cache.invalidateQueries({queryKey:keys.incoming});void cache.invalidateQueries({queryKey:keys.trips});}).subscribe();return()=>{void db.removeChannel(channel);};},[user,cache]);
}
