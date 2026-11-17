import { router, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { Screen } from '@/src/components/layout/Screen';
import { Heading } from '@/src/components/layout/Heading';
import { Photo } from '@/src/components/media/Photo';
import { Button } from '@/src/components/ui/Button';
import { QueryState } from '@/src/components/ui/QueryState';
import { Feedback } from '@/src/components/ui/Feedback';
import { useDestinations,usePlaces,useSaved } from '@/src/hooks/useTravel';
import { travelRepository } from '@/src/repositories/travel-repository';
import { useAction } from '@/src/providers/FeedbackProvider';
import { money } from '@/src/services/travel';
export function DestinationScreen(){
 const {destinationId}=useLocalSearchParams<{destinationId:string}>(),destinations=useDestinations(),places=usePlaces(),saved=useSaved(),action=useAction();
 const d=destinations.data?.find(x=>x.id===destinationId),existing=saved.data?.find(x=>x.destination_id===destinationId);
 return <Screen><Heading title={d?.name??'Somewhere new'} back eyebrow="A new story awaits" />
 <QueryState loading={destinations.isPending||places.isPending||saved.isPending} error={destinations.error||places.error||saved.error} retry={()=>{void destinations.refetch();void places.refetch();void saved.refetch();}}>
 {d?<><Photo uri={d.hero_image_url}/><Text className="text-base leading-7 text-foreground">{d.description}</Text><Button busy={action.busy} label={existing?'Saved ✓ · tap to unsave':'Save for someday ♡'} onPress={()=>void action.run(()=>travelRepository.toggleSave({destination_id:d.id},existing?.id),existing?'Removed from saved places':'Saved for later')} />
 <Button secondary label="Plan a trip here ↗" onPress={()=>router.push({pathname:'/trip/create',params:{destinationId:d.id}})} />
 <View className="gap-4 rounded-card bg-sage p-6"><Text className="text-xl font-bold text-primary">The little things to know</Text><Text className="leading-6 text-foreground">When to go: {d.best_time_text}</Text><Text className="leading-6 text-foreground">{d.tips}</Text><Text className="font-semibold text-primary">Estimated daily budget: {money(d.budget_min_minor,d.currency)}–{money(d.budget_max_minor,d.currency)}</Text><Text className="text-xs text-muted">Illustrative curated demo information. Check local sources before travelling.</Text></View>
 <Text className="text-2xl font-black text-foreground">Make a day of it.</Text>
 {places.data?.filter(p=>p.destination_id===d.id).map(p=><View className="gap-3" key={p.id}><Photo uri={p.image_url} height={180}/><Button secondary label={p.name+' ↗'} onPress={()=>router.push({pathname:'/place/[placeId]',params:{placeId:p.id}})} /></View>)}
 </>:<Feedback title="This place isn’t on the map yet." detail="Head back and choose another destination." />}
 </QueryState></Screen>;
}
