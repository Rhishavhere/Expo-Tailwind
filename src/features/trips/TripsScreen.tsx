import { router } from 'expo-router';
import { Pressable, RefreshControl, Text, View } from 'react-native';
import { Screen } from '@/src/components/layout/Screen';
import { Heading } from '@/src/components/layout/Heading';
import { Button } from '@/src/components/ui/Button';
import { QueryState } from '@/src/components/ui/QueryState';
import { Feedback } from '@/src/components/ui/Feedback';
import { useTrips,useDestinations } from '@/src/hooks/useTravel';
import { tripStatus } from '@/src/services/travel';
export function TripsScreen(){
 const trips=useTrips(),destinations=useDestinations();
 return <Screen refreshControl={<RefreshControl refreshing={trips.isRefetching} onRefresh={()=>void trips.refetch()} />}><Heading title="Plans worth making." eyebrow="Your crew. Your next chapter." /><Button label="Start a trip ↗" onPress={()=>router.push('/trip/create')} />
 <QueryState loading={trips.isPending} error={trips.error} retry={()=>void trips.refetch()}>
 {!trips.data?.length&&<Feedback title="A blank page. A whole world." detail="Create your first trip and give the group chat something to get excited about." />}
 {['ongoing','upcoming','draft','completed','archived'].map(status=>{const group=trips.data?.filter(t=>tripStatus(t)===status);return group?.length?<View className="gap-3" key={status}><Text className="text-xs font-bold uppercase tracking-widest text-primary">{status}</Text>{group.map(t=><Pressable accessibilityRole="button" key={t.id} onPress={()=>router.push({pathname:'/trip/[tripId]',params:{tripId:t.id}})} className="gap-3 rounded-card border border-border bg-surface p-6 active:opacity-70"><Text className="text-2xl font-black text-foreground">{t.name} ↗</Text><Text className="text-muted">{destinations.data?.find(d=>d.id===t.destination_id)?.name??'Your next destination'}</Text><Text className="font-semibold text-primary">{t.start_date} → {t.end_date}</Text></Pressable>)}</View>:null;})}
 </QueryState></Screen>;
}
