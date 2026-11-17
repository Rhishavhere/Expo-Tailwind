import { router } from 'expo-router';
import { RefreshControl,Text,View } from 'react-native';
import { Screen } from '@/src/components/layout/Screen';
import { Heading } from '@/src/components/layout/Heading';
import { Button } from '@/src/components/ui/Button';
import { QueryState } from '@/src/components/ui/QueryState';
import { Feedback } from '@/src/components/ui/Feedback';
import { useIncoming,useTrips } from '@/src/hooks/useTravel';
import { useAction } from '@/src/providers/FeedbackProvider';
import { travelRepository } from '@/src/repositories/travel-repository';
export function TogetherScreen(){
 const incoming=useIncoming(),trips=useTrips(),action=useAction();
 return <Screen refreshControl={<RefreshControl refreshing={incoming.isRefetching||trips.isRefetching} onRefresh={()=>{void incoming.refetch();void trips.refetch();}} />}><Heading title="Better with your people." eyebrow="Together" />
 <QueryState loading={incoming.isPending||trips.isPending} error={incoming.error||trips.error} retry={()=>{void incoming.refetch();void trips.refetch();}}>
 <Text className="text-xl font-bold text-foreground">Your invitations</Text>
 {!incoming.data?.length&&<Feedback title="No invites just yet." detail="Ask a friend to find your exact username or email from their trip’s member page." />}
 {incoming.data?.map(inv=><View className="gap-3 rounded-card border border-border bg-surface p-5" key={inv.id}><Text className="text-lg font-bold text-foreground">An adventure with friends</Text><Text className="text-xs text-muted">{new Date(inv.created_at).toLocaleDateString()} · {inv.status}</Text>{inv.status==='pending'&&<><Button busy={action.busy} label="I’m in ↗" onPress={()=>void action.run(()=>travelRepository.respond(inv.id,true),'You joined the trip!')} /><Button secondary busy={action.busy} label="Not this time" onPress={()=>void action.run(()=>travelRepository.respond(inv.id,false),'Invitation declined')} /></>}</View>)}
 <Text className="text-xl font-bold text-foreground">Your shared plans</Text>
 {!trips.data?.length&&<Feedback title="Your crew starts with a plan." detail="Create a trip and invite up to four friends." />}
 {trips.data?.map(t=><Button secondary key={t.id} label={t.name+' ↗'} onPress={()=>router.push({pathname:'/trip/[tripId]',params:{tripId:t.id}})} />)}
 </QueryState></Screen>;
}
