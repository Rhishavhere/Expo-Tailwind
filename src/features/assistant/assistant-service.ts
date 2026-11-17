import { z } from 'zod';
import { getSupabase } from '@/src/lib/supabase';
import type { Place,Trip } from '@/src/types/database';
import { daysBetween } from '@/src/services/travel';
import { suggestionSchema,type Suggestion } from './schema';
export function demoSuggestion(trip:Trip,places:Place[],prompt:string):Suggestion {
 const intent=/food|cafe|eat|lunch/i.test(prompt)?'food':/nature|relax|green/i.test(prompt)?'nature':'';
 const local=places.filter(p=>p.destination_id===trip.destination_id),matches=local.filter(p=>!intent||p.tags.includes(intent)||p.category===intent);
 const picks=(matches.length?matches:local).slice(0,6);
 if(!picks.length)throw new Error('No curated places are available for this destination.');
 const days=daysBetween(trip.start_date,trip.end_date).slice(0,3);
 return {...suggestionSchema.parse({title:'A little room to wander',summary:'A deterministic draft from curated demo places. Your prompt matched '+(intent||'a balanced day')+'. Review every stop before applying.',items:picks.map((p,i)=>({day_date:days[Math.min(Math.floor(i/2),days.length-1)],title:p.name,description:p.description,category:p.category,estimated_cost_minor:p.currency===trip.currency?p.estimated_cost_minor:0})),warnings:['Demo suggestions, not an AI-generated response.','Costs are estimates. Verify opening hours, transport and availability locally.']}),mode:'demo'};
}
export async function generateSuggestion(trip:Trip,places:Place[],rawPrompt:string,demo:boolean):Promise<Suggestion>{
 const prompt=z.string().trim().min(3).max(1500).parse(rawPrompt);
 if(demo)return demoSuggestion(trip,places,prompt);
 const {data,error}=await getSupabase().functions.invoke('generate-itinerary',{body:{tripId:trip.id,prompt}});
 if(error){
  // Missing deployment has a clear functional fallback; auth/network/provider failures stay visible.
  const status='context' in error && error.context instanceof Response?error.context.status:0;
  if(status===404)return demoSuggestion(trip,places,prompt);
  throw error;
 }
 const parsed=z.object({mode:z.enum(['demo','ai']),suggestion:suggestionSchema}).parse(data);
 if(parsed.suggestion.items.some(i=>i.day_date<trip.start_date||i.day_date>trip.end_date))throw new Error('Generated dates are outside this trip. Try again.');
 return {...parsed.suggestion,mode:parsed.mode};
}
export async function applySuggestion(trip:Trip,suggestion:Suggestion){
 const parsed=suggestionSchema.parse(suggestion);
 if(parsed.items.some(i=>i.day_date<trip.start_date||i.day_date>trip.end_date))throw new Error('Trip dates changed. Generate a fresh proposal.');
 const {error}=await getSupabase().rpc('apply_itinerary',{target_trip:trip.id,suggestions:parsed.items});
 if(error)throw error;
}
