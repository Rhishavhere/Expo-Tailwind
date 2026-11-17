import { useState } from 'react';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Alert,Text,View } from 'react-native';
import { Screen } from '@/src/components/layout/Screen';
import { Heading } from '@/src/components/layout/Heading';
import { Button } from '@/src/components/ui/Button';
import { Feedback } from '@/src/components/ui/Feedback';
import { QueryState } from '@/src/components/ui/QueryState';
import { useAuth } from '@/src/providers/AuthProvider';
import { useAction } from '@/src/providers/FeedbackProvider';
import { memoryRepository } from './memory-repository';
import { pickPhotos,scanNextPage } from './gallery-service';
import { clusterPhotos } from './clustering';
export function MemoriesScreen(){
 const {user}=useAuth(),action=useAction(),[intro,setIntro]=useState(false);
 const memories=useQuery({queryKey:['memories',user!.id],queryFn:()=>memoryRepository.list(user!.id)});
 const scan=useQuery({queryKey:['scan',user!.id],queryFn:()=>memoryRepository.scanState(user!.id)});
 async function pick(){const photos=await pickPhotos();if(!photos.length)return;await memoryRepository.saveScan(user!.id,{photos:[...(scan.data?.photos??[]),...photos],done:true});}
 return <Screen><Heading title="You had to be there." eyebrow="Memories / kept on your phone" />
 <Text className="text-base leading-7 text-muted">A home for the blurry sunsets, the snack stops, and your favourite people.</Text>
 <View className="gap-4 rounded-card bg-sage p-6"><Text className="text-xl font-bold text-primary">Your camera roll. Your call.</Text><Text className="leading-6 text-foreground">We read only photos you allow. Nothing is uploaded. GPS may be missing or hidden by Android; you can name a location yourself. Selecting photos can use today’s date when capture metadata is unavailable.</Text>
 <Button busy={action.busy} label="Choose a few photos" onPress={()=>void action.run(pick,'Photos ready to review')} />
 <Button secondary busy={action.busy} label={scan.data?.cursor&&!scan.data.done?'Continue metadata scan':'Scan permitted photo metadata'} onPress={()=>{if(!intro){setIntro(true);Alert.alert('Organize photos on this device?','We scan 40 permitted photos at a time, reading date and available GPS. Nothing is uploaded. Expo Go may restrict library access; photo selection remains available.',[{text:'Cancel',style:'cancel'},{text:'Scan',onPress:()=>void action.run(async()=>{const result=await scanNextPage(user!.id);if(result.skipped)action.notify(result.skipped+' inaccessible photos skipped. You can retry a fresh scan.');},'Metadata scan saved')}]);}else void action.run(()=>scanNextPage(user!.id),'Scan progress saved');}} />
 </View>
 <QueryState loading={memories.isPending||scan.isPending} error={memories.error||scan.error} retry={()=>{void memories.refetch();void scan.refetch();}}>
 {!!scan.data?.photos.length&&<><Text className="text-xl font-bold text-foreground">Review your finds</Text>{clusterPhotos(scan.data.photos).map(group=><View className="gap-2 rounded-2xl border border-border p-5" key={group.key}><Text className="font-bold text-foreground">{group.date} · {group.photos.length} photos</Text><Text className="text-muted">{group.latitude===null?'Unknown location':'Approximate GPS cluster · confirm location'}</Text><Button secondary busy={action.busy} label="Review & name this collection" onPress={()=>void action.run(async()=>{const id=Date.now().toString(36)+Math.random().toString(36).slice(2);await memoryRepository.save(user!.id,{id,title:'A day worth keeping',location:group.latitude===null?'Unknown location':group.latitude.toFixed(3)+', '+group.longitude?.toFixed(3),tripId:null,journal:'',photos:group.photos,createdAt:new Date().toISOString()});await memoryRepository.saveScan(user!.id,{...scan.data!,photos:scan.data!.photos.filter(p=>!group.photos.some(g=>g.id===p.id))});router.push({pathname:'/memory/[memoryId]',params:{memoryId:id}});})} /></View>)}
 <Button secondary busy={action.busy} label="Clear scan metadata / start fresh" onPress={()=>Alert.alert('Clear scan metadata?','Saved collections and original photos stay on the phone.',[{text:'Cancel',style:'cancel'},{text:'Clear',onPress:()=>void action.run(()=>memoryRepository.clearScan(user!.id),'Scan metadata cleared')}])} /></>}
 <Text className="text-2xl font-black text-foreground">Your little time capsules</Text>
 {!memories.data?.length&&<Feedback title="The good bits go here." detail="Choose photos, review a group, and give the memory a name." />}
 {memories.data?.map(m=><Button key={m.id} secondary label={m.title+' · '+m.photos.length+' photos ↗'} onPress={()=>router.push({pathname:'/memory/[memoryId]',params:{memoryId:m.id}})} />)}
 </QueryState></Screen>;
}
