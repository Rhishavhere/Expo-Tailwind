import { useState } from 'react';
import { router,useLocalSearchParams } from 'expo-router';
import { Alert,RefreshControl,Text,View } from 'react-native';
import { Screen } from '@/src/components/layout/Screen';
import { Heading } from '@/src/components/layout/Heading';
import { Button } from '@/src/components/ui/Button';
import { Chips } from '@/src/components/ui/Chips';
import { QueryState } from '@/src/components/ui/QueryState';
import { Feedback } from '@/src/components/ui/Feedback';
import { useTrip } from '@/src/hooks/useTravel';
import { useAuth } from '@/src/providers/AuthProvider';
import { useAction } from '@/src/providers/FeedbackProvider';
import { travelRepository } from '@/src/repositories/travel-repository';
import { daysBetween,money,sortItems } from '@/src/services/travel';
import { ItemForm } from './ItemForm';
import type { Item } from '@/src/types/database';
export function ItineraryScreen(){
 const {tripId}=useLocalSearchParams<{tripId:string}>(),query=useTrip(tripId),auth=useAuth(),action=useAction();
 const [selected,setSelected]=useState(''),[editor,setEditor]=useState<Item|'new'|null>(null),data=query.data;
 const day=selected||data?.trip.start_date||'';
 const items=sortItems(data?.items??[]).filter(i=>i.day_date===day);
 return <Screen refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={()=>void query.refetch()} />}><Heading back title="Leave room for a detour." eyebrow="The day-by-day" />
 <QueryState loading={query.isPending} error={query.error} retry={()=>void query.refetch()}>
 {data&&<><Chips values={daysBetween(data.trip.start_date,data.trip.end_date)} value={day} onChange={setSelected} /><Button label="Add an idea +" onPress={()=>setEditor('new')} />
 {editor&&<ItemForm key={editor==='new'?'new':editor.id} trip={data.trip} item={editor==='new'?undefined:editor} onDone={()=>setEditor(null)} />}
 {!items.length&&<Feedback title="An open day is a good day." detail="Add your first stop, save a place from Explore, or ask the assistant for a draft." />}
 {items.map((item,index)=>{const vote=data.votes.find(v=>v.itinerary_item_id===item.id&&v.user_id===auth.user?.id);const count=data.votes.filter(v=>v.itinerary_item_id===item.id).reduce((n,v)=>n+v.value,0);return <View key={item.id} className="gap-4 rounded-card border border-border bg-surface p-5"><Text className="text-xs font-bold uppercase text-primary">{item.start_time?.slice(0,5)??'Any time'} {item.end_time?'→ '+item.end_time.slice(0,5):''} · {item.category} · {item.status}</Text><Text className="text-2xl font-black text-foreground">{item.title}</Text><Text className="leading-6 text-muted">{item.description}</Text><Text className="text-sm text-primary">{money(item.estimated_cost_minor,item.currency)} estimated · {data.profiles.find(p=>p.id===item.created_by)?.display_name??'A traveller'}</Text>
 <View className="flex-row gap-2"><View className="flex-1"><Button secondary busy={action.busy} label={vote?.value===1?'Interested ✓':'Interested +'} onPress={()=>void action.run(()=>travelRepository.vote(item,1,vote?.id))} /></View><View className="flex-1"><Button secondary busy={action.busy} label={vote?.value===-1?'Pass ✓':'Pass −'} onPress={()=>void action.run(()=>travelRepository.vote(item,-1,vote?.id))} /></View></View><Text className="text-xs text-muted">Group vote: {count}</Text>
 <Chips values={['planned','completed','skipped']} value={item.status} onChange={status=>void action.run(()=>travelRepository.updateItem(item,{status}),'Status updated')} />
 <Button secondary label="Comments ↗" onPress={()=>router.push({pathname:'/trip/[tripId]/discussion',params:{tripId,itemId:item.id}})} />
 <View className="flex-row gap-2"><View className="flex-1"><Button secondary busy={action.busy} disabled={index===0} label="Move ↑" onPress={()=>void action.run(()=>travelRepository.moveItem(item,-1))} /></View><View className="flex-1"><Button secondary busy={action.busy} disabled={index===items.length-1} label="Move ↓" onPress={()=>void action.run(()=>travelRepository.moveItem(item,1))} /></View></View>
 <Button secondary label="Edit item" onPress={()=>setEditor(item)} /><Button secondary busy={action.busy} label="Remove item" onPress={()=>Alert.alert('Remove this stop?','Comments and votes for it will also be removed.',[{text:'Cancel',style:'cancel'},{text:'Remove',style:'destructive',onPress:()=>void action.run(()=>travelRepository.deleteItem(item.id),'Item removed')}])} />
 </View>;})}
 <Button secondary label="Find a little inspiration ✳" onPress={()=>router.push({pathname:'/assistant',params:{tripId}})} /></>}
 </QueryState></Screen>;
}
