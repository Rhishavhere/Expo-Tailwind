import { getSupabase } from '@/src/lib/supabase';
import type { Database, Item, Profile, Trip } from '@/src/types/database';
import { tripSchema, itemSchema } from '@/src/services/travel';
import { z } from 'zod';
// Supabase returns null for successful commands with no representation; those callers ignore the result.
// SELECT/single/RPC readers only reach this branch with their successful representation.
function unwrap<T>({data,error}:{data:T;error:unknown}): NonNullable<T> { if(error) throw error; return data as NonNullable<T>; }
async function userId() { const {data,error}=await getSupabase().auth.getUser(); if(error) throw error; if(!data.user) throw new Error('Sign in first'); return data.user.id; }
export const travelRepository = {
  async destinations() { return unwrap(await getSupabase().from('destinations').select('*').order('name')); },
  async places() { return unwrap(await getSupabase().from('places').select('*').order('name')); },
  async trips() { return unwrap(await getSupabase().from('trips').select('*').is('deleted_at',null).order('start_date')); },
  async saved() { return unwrap(await getSupabase().from('saved_places').select('*').order('created_at',{ascending:false})); },
  async toggleSave(target:{place_id?:string;destination_id?:string},existingId?:string) {
    if(existingId) unwrap(await getSupabase().from('saved_places').delete().eq('id',existingId));
    else unwrap(await getSupabase().from('saved_places').insert({...target,user_id:await userId()}));
  },
  async createTrip(input: z.infer<typeof tripSchema>) { return unwrap(await getSupabase().rpc('create_trip_with_owner',{input:tripSchema.parse(input)})); },
  async editTrip(trip:Trip,updates:Partial<Trip>) { const rows=unwrap(await getSupabase().from('trips').update(updates).eq('id',trip.id).eq('updated_at',trip.updated_at).select()); if(!rows.length) throw new Error('Trip changed. Refresh before editing.'); },
  async editDates(id:string,start:string,end:string) { unwrap(await getSupabase().rpc('edit_trip_dates',{target_trip:id,first_day:start,last_day:end})); },
  async saveTrip(trip:Trip,input:z.infer<typeof tripSchema>) { unwrap(await getSupabase().rpc('save_trip',{input:{...tripSchema.parse(input),id:trip.id,updated_at:trip.updated_at}})); },
  async trip(id:string) {
    const db=getSupabase();
    const [trip,members,invitations,items,votes,comments,expenses,activity]=await Promise.all([
      db.from('trips').select('*').eq('id',id).single(), db.from('trip_members').select('*').eq('trip_id',id),
      db.from('trip_invitations').select('*').eq('trip_id',id).order('created_at',{ascending:false}),
      db.from('itinerary_items').select('*').eq('trip_id',id),db.from('itinerary_votes').select('*').eq('trip_id',id),
      db.from('itinerary_comments').select('*').eq('trip_id',id).order('created_at'),
      db.from('expenses').select('*').eq('trip_id',id).order('expense_date',{ascending:false}),
      db.from('trip_activity').select('*').eq('trip_id',id).order('created_at',{ascending:false}).limit(30),
    ]);
    const t=unwrap(trip),m=unwrap(members),e=unwrap(expenses),v=unwrap(votes),c=unwrap(comments),a=unwrap(activity),i=unwrap(items),inv=unwrap(invitations);
    const splits=e.length?unwrap(await db.from('expense_splits').select('*').in('expense_id',e.map(x=>x.id))):[];
    const ids=[...new Set([...m.map(x=>x.user_id),...e.map(x=>x.paid_by),...splits.map(x=>x.user_id),...c.map(x=>x.user_id)])];
    const profiles=ids.length?unwrap(await db.from('profiles').select('*').in('id',ids)):[];
    return {trip:t,members:m,invitations:inv,items:i,votes:v,comments:c,expenses:e,splits,activity:a,profiles};
  },
  async incoming() { return unwrap(await getSupabase().from('trip_invitations').select('*').eq('invitee_id',await userId()).order('created_at',{ascending:false})); },
  async searchUsers(term:string) { return unwrap(await getSupabase().rpc('search_users',{term:z.string().trim().min(3).max(254).parse(term)})); },
  async invite(trip:string,user:string) { return unwrap(await getSupabase().rpc('invite_to_trip',{target_trip:trip,target_user:user})); },
  async respond(id:string,accept:boolean) { unwrap(await getSupabase().rpc('respond_invitation',{invitation_id:id,accept})); },
  async revoke(id:string) { unwrap(await getSupabase().rpc('revoke_invitation',{invitation_id:id})); },
  async removeMember(trip:string,user:string) { unwrap(await getSupabase().rpc('remove_trip_member',{target_trip:trip,target_user:user})); },
  async saveItem(trip:Trip, input:z.infer<typeof itemSchema>, original?:Item,placeId?:string) {
    const parsed=itemSchema.parse(input);
    if(parsed.day_date<trip.start_date || parsed.day_date>trip.end_date) throw new Error('Choose a day within the trip dates.');
    if(original) { const rows=unwrap(await getSupabase().from('itinerary_items').update(parsed).eq('id',original.id).eq('updated_at',original.updated_at).select()); if(!rows.length) throw new Error('This item changed. Refresh before editing.'); }
    else unwrap(await getSupabase().from('itinerary_items').insert({...parsed,trip_id:trip.id,currency:trip.currency,created_by:await userId(),sort_order:Date.now()%2147483647,place_id:placeId??null}));
  },
  async updateItem(item:Item,updates:Partial<Item>) { const rows=unwrap(await getSupabase().from('itinerary_items').update(updates).eq('id',item.id).eq('updated_at',item.updated_at).select()); if(!rows.length) throw new Error('This item changed. Refresh first.'); },
  async deleteItem(id:string) { unwrap(await getSupabase().from('itinerary_items').delete().eq('id',id)); },
  async moveItem(item:Item,direction:number) { unwrap(await getSupabase().rpc('move_item',{item_id:item.id,direction,expected:item.updated_at})); },
  async vote(item:Item,value:number,existingId?:string) {
    unwrap(await getSupabase().rpc('vote_item',{item_id:item.id,vote_value:value}));
  },
  async comment(trip:string,body:string,item?:string) { unwrap(await getSupabase().from('itinerary_comments').insert({trip_id:trip,itinerary_item_id:item??null,user_id:await userId(),body:z.string().trim().min(1).max(2000).parse(body)})); },
  async saveExpense(input:Record<string,unknown>) { return unwrap(await getSupabase().rpc('save_expense',{input})); },
  async deleteExpense(id:string) { unwrap(await getSupabase().from('expenses').delete().eq('id',id)); },
  async updateProfile(input:Partial<Profile>) { const parsed=z.object({display_name:z.string().trim().min(2).max(60),username:z.string().regex(/^[a-z0-9_]{3,24}$/,'Username: 3–24 lowercase letters, numbers or underscores.'),bio:z.string().max(500),interests:z.array(z.string()).max(8),default_currency:z.enum(['INR','USD','EUR','GBP']),avatar_url:z.url().startsWith('https://').nullable()}).parse(input); unwrap(await getSupabase().from('profiles').update(parsed).eq('id',await userId())); },
};
export type TripData=Awaited<ReturnType<typeof travelRepository.trip>>;
export type FunctionName=keyof Database['public']['Functions'];
