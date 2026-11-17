import { useState } from 'react';
import { router,useLocalSearchParams } from 'expo-router';
import { Alert,RefreshControl,Text,View } from 'react-native';
import { Screen } from '@/src/components/layout/Screen';
import { Heading } from '@/src/components/layout/Heading';
import { Button } from '@/src/components/ui/Button';
import { QueryState } from '@/src/components/ui/QueryState';
import { useTrip } from '@/src/hooks/useTravel';
import { useAuth } from '@/src/providers/AuthProvider';
import { useAction } from '@/src/providers/FeedbackProvider';
import { travelRepository } from '@/src/repositories/travel-repository';
import { money,tripStatus } from '@/src/services/travel';
import { TripForm } from './TripForm';
export function TripScreen(){
 const {tripId}=useLocalSearchParams<{tripId:string}>(),query=useTrip(tripId),auth=useAuth(),action=useAction(),[editing,setEditing]=useState(false);
 const data=query.data,t=data?.trip;
 return <Screen refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={()=>void query.refetch()} />}><Heading back title={t?.name??'Your next chapter'} eyebrow={t?tripStatus(t):'Your trip'} />
 <QueryState loading={query.isPending} error={query.error} retry={()=>void query.refetch()}>
 {t&&data&&<><View className="gap-3 rounded-card bg-primary p-6"><Text className="text-2xl font-black text-white">{t.start_date} →{ '\n' }{t.end_date}</Text><Text className="text-base text-white">{data.members.length}/5 friends · {t.currency}</Text>{t.target_budget_minor!=null&&<Text className="text-white">{money(t.target_budget_minor,t.currency)} · {t.budget_scope.replace('_',' ')}</Text>}<Text className="leading-6 text-white">{t.description||'Good people. A new place. Room for a little spontaneity.'}</Text></View>
 <Button label="The day-by-day plan ↗" onPress={()=>router.push({pathname:'/trip/[tripId]/itinerary',params:{tripId}})} />
 <Button secondary label="Your crew & invitations" onPress={()=>router.push({pathname:'/trip/[tripId]/members',params:{tripId}})} />
 <Button secondary label="Budget & shared expenses" onPress={()=>router.push({pathname:'/trip/[tripId]/budget',params:{tripId}})} />
 <Button secondary label="Trip discussion" onPress={()=>router.push({pathname:'/trip/[tripId]/discussion',params:{tripId}})} />
 <Button secondary label="Ask the travel assistant ✳" onPress={()=>router.push({pathname:'/assistant',params:{tripId}})} />
 {t.created_by===auth.user?.id&&<><Button secondary label={editing?'Close editor':'Edit trip'} onPress={()=>setEditing(v=>!v)} />
 {editing&&<TripForm key={t.updated_at} trip={t} onSubmit={async input=>{
 await travelRepository.saveTrip(t,input);
 setEditing(false);
 }} />}
 <Button secondary busy={action.busy} label={t.status==='archived'?'Restore trip':'Archive trip'} onPress={()=>Alert.alert(t.status==='archived'?'Restore this trip?':'Archive this trip?','Your shared records will be kept.',[{text:'Cancel',style:'cancel'},{text:'Confirm',onPress:()=>void action.run(()=>travelRepository.editTrip(t,{status:t.status==='archived'?'upcoming':'archived'}),'Trip updated')}])} />
 <Button secondary busy={action.busy} label="Delete trip" onPress={()=>Alert.alert('Delete this trip?','It will disappear for all members. Records are soft-deleted and retained in the database.',[{text:'Keep trip',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>void action.run(async()=>{await travelRepository.editTrip(t,{deleted_at:new Date().toISOString()});router.replace('/(tabs)/trips');},'Trip deleted')}])} /></>}
 <Text className="text-xl font-bold text-foreground">The latest from your crew</Text>
 {data.activity.map(a=><View key={a.id} className="gap-1 border-b border-border py-3"><Text className="text-foreground">{data.profiles.find(p=>p.id===a.actor_id)?.display_name??'A traveller'} · {a.summary}</Text><Text className="text-xs text-muted">{new Date(a.created_at).toLocaleString()}</Text></View>)}
 </>}
 </QueryState></Screen>;
}
