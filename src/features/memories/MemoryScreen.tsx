import { useState } from 'react';
import { router,useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Alert,Text,View } from 'react-native';
import { Screen } from '@/src/components/layout/Screen';
import { Heading } from '@/src/components/layout/Heading';
import { Button } from '@/src/components/ui/Button';
import { Field } from '@/src/components/ui/Field';
import { Chips } from '@/src/components/ui/Chips';
import { Photo } from '@/src/components/media/Photo';
import { QueryState } from '@/src/components/ui/QueryState';
import { Feedback } from '@/src/components/ui/Feedback';
import { useAuth } from '@/src/providers/AuthProvider';
import { useAction } from '@/src/providers/FeedbackProvider';
import { useTrips } from '@/src/hooks/useTravel';
import { memoryRepository,type LocalMemory } from './memory-repository';
function Editor({memory,user}:{memory:LocalMemory;user:string}){
 const trips=useTrips(),action=useAction(),[title,setTitle]=useState(memory.title),[location,setLocation]=useState(memory.location),[journal,setJournal]=useState(memory.journal),[tripId,setTripId]=useState(memory.tripId);
 return <><Field label="Name this memory" value={title} onChangeText={setTitle} /><Field label="Confirm or correct the location" value={location} onChangeText={setLocation} /><Field label="The story behind the photos" value={journal} onChangeText={setJournal} multiline /><Text className="font-bold text-foreground">Link to a trip (optional)</Text><QueryState loading={trips.isPending} error={trips.error} retry={()=>void trips.refetch()}><Chips values={['Personal',...(trips.data??[]).map(t=>t.name+' · '+t.id.slice(0,4))]} value={tripId?(trips.data?.find(t=>t.id===tripId)?.name??'Trip')+' · '+tripId.slice(0,4):'Personal'} onChange={v=>setTripId(v==='Personal'?null:trips.data!.find(t=>t.name+' · '+t.id.slice(0,4)===v)!.id)} /></QueryState><Button busy={action.busy} label="Save this chapter" onPress={()=>void action.run(()=>memoryRepository.save(user,{...memory,title,location,journal,tripId}),'Memory saved on this phone')} />
 {memory.photos.map(photo=><View className="gap-2" key={photo.id}><Photo uri={photo.uri} height={220} /><Text className="text-xs text-muted">{new Date(photo.capturedAt).toLocaleString()} · {photo.latitude===null?'No GPS metadata':photo.latitude.toFixed(3)+', '+photo.longitude?.toFixed(3)}</Text><Button secondary busy={action.busy} label="Remove from this collection" onPress={()=>Alert.alert('Remove photo reference?','The original photo will stay on your device.',[{text:'Cancel',style:'cancel'},{text:'Remove',onPress:()=>void action.run(()=>memoryRepository.save(user,{...memory,title,location,journal,tripId,photos:memory.photos.filter(p=>p.id!==photo.id)}),'Photo reference removed')}])} /></View>)}
 <Button secondary busy={action.busy} label="Delete this collection" onPress={()=>Alert.alert('Delete collection?','Original photos will stay on your device.',[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>void action.run(async()=>{await memoryRepository.remove(user,memory.id);router.replace('/(tabs)/memories');},'Collection deleted')}])} /></>;
}
export function MemoryScreen(){
 const {memoryId}=useLocalSearchParams<{memoryId:string}>(),{user}=useAuth(),query=useQuery({queryKey:['memories',user!.id],queryFn:()=>memoryRepository.list(user!.id)}),memory=query.data?.find(m=>m.id===memoryId);
 return <Screen><Heading back title="A moment, kept." eyebrow="Device-only collection" /><QueryState loading={query.isPending} error={query.error} retry={()=>void query.refetch()}>{memory?<Editor key={memory.id} memory={memory} user={user!.id}/>:<Feedback title="This memory isn’t on this device." detail="Photo collections are local to the phone and account that created them." />}</QueryState></Screen>;
}
