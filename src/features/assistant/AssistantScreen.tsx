import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Alert,Pressable,Text,View } from 'react-native';
import { Screen } from '@/src/components/layout/Screen';
import { Heading } from '@/src/components/layout/Heading';
import { Button } from '@/src/components/ui/Button';
import { Field } from '@/src/components/ui/Field';
import { Chips } from '@/src/components/ui/Chips';
import { QueryState } from '@/src/components/ui/QueryState';
import { Feedback } from '@/src/components/ui/Feedback';
import { usePlaces,useTrips } from '@/src/hooks/useTravel';
import { useAction } from '@/src/providers/FeedbackProvider';
import { generateSuggestion,applySuggestion } from './assistant-service';
import type { Suggestion } from './schema';
import { money } from '@/src/services/travel';
export function AssistantScreen(){
 const {tripId}=useLocalSearchParams<{tripId?:string}>(),trips=useTrips(),places=usePlaces(),action=useAction();
 const [selected,setSelected]=useState(tripId??''),[prompt,setPrompt]=useState('Plan a relaxed day with food and nature stops.'),[demo,setDemo]=useState(true),[proposal,setProposal]=useState<Suggestion|null>(null),[applied,setApplied]=useState(false),[lastPrompt,setLastPrompt]=useState('');
 const trip=trips.data?.find(t=>t.id===selected);
 return <Screen><Heading back title="A little travel magic." eyebrow="Your assistant ✳" />
 <Text className="leading-6 text-muted">Start with an idea. Review a draft. You decide what makes it into the plan. AI connections use only OpenAI or Gemini, with keys kept on the server.</Text>
 <QueryState loading={trips.isPending||places.isPending} error={trips.error||places.error} retry={()=>{void trips.refetch();void places.refetch();}}>
 {!trips.data?.length?<Feedback title="Give this idea a trip." detail="Create a trip first so suggestions use your actual dates and destination." />:<>
 <Chips values={trips.data.map(t=>t.name+' · '+t.id.slice(0,4))} value={trip?trip.name+' · '+trip.id.slice(0,4):''} onChange={v=>{setSelected(trips.data!.find(t=>t.name+' · '+t.id.slice(0,4)===v)!.id);setProposal(null);}} />
 <Pressable accessibilityRole="switch" accessibilityState={{checked:demo}} className="min-h-14 justify-center rounded-2xl bg-sage p-4" onPress={()=>{setDemo(v=>!v);setProposal(null);}}><Text className="font-bold text-primary">{demo?'✓ Demo suggestions':'○ Connected AI'} · tap to switch</Text></Pressable>
 <Field label="What’s your kind of day?" value={prompt} onChangeText={setPrompt} multiline maxLength={1500} />
 <Button busy={action.busy} disabled={!trip||prompt.trim().length<3} label={demo?'Build a demo draft ✳':'Ask the travel assistant ✳'} onPress={()=>void action.run(async()=>{if(!trip)return;const draft=await generateSuggestion(trip,places.data??[],prompt,demo);setProposal(draft);setApplied(false);setLastPrompt(prompt);})} />
 {proposal&&trip&&<><View className="rounded-2xl bg-sage p-5"><Text className="text-xs font-bold text-primary">YOU</Text><Text className="mt-2 leading-6 text-foreground">{lastPrompt}</Text></View><View className="gap-3 rounded-card border border-border bg-surface p-5"><Text className="text-xs font-bold uppercase text-primary">{proposal.mode==='demo'?'Deterministic demo suggestions':'AI draft · review required'}</Text><Text className="text-2xl font-black text-foreground">{proposal.title}</Text><Text className="leading-6 text-muted">{proposal.summary}</Text>
 {proposal.items.map((item,i)=><View key={i} className="gap-1 border-t border-border py-3"><Text className="text-xs font-bold text-primary">{item.day_date} · {item.category}</Text><Text className="text-lg font-bold text-foreground">{item.title}</Text><Text className="leading-6 text-muted">{item.description}</Text><Text className="text-xs text-primary">{money(item.estimated_cost_minor,trip.currency)} estimated</Text></View>)}
 {proposal.warnings.map((warning,i)=><Text className="text-xs leading-5 text-muted" key={i}>• {warning}</Text>)}
 <Text className="font-bold text-primary">Adds {proposal.items.length} items · {money(proposal.items.reduce((n,i)=>n+i.estimated_cost_minor,0),trip.currency)} estimated total</Text>
 <Button busy={action.busy} disabled={applied} label={applied?'Applied to your itinerary ✓':'Review complete · add these stops'} onPress={()=>Alert.alert('Add this draft to '+trip.name+'?',proposal.items.length+' new itinerary items will be added on the dates shown. Nothing will be removed.',[{text:'Keep reviewing',style:'cancel'},{text:'Apply draft',onPress:()=>void action.run(async()=>{await applySuggestion(trip,proposal);setApplied(true);},'Draft added to the itinerary')}])} />
 <Button secondary label="Discard draft" onPress={()=>setProposal(null)} /></View></>}
 </>}
 </QueryState></Screen>;
}
