import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Linking, Text } from 'react-native';
import { Screen } from '@/src/components/layout/Screen';
import { Heading } from '@/src/components/layout/Heading';
import { Photo } from '@/src/components/media/Photo';
import { Button } from '@/src/components/ui/Button';
import { Chips } from '@/src/components/ui/Chips';
import { QueryState } from '@/src/components/ui/QueryState';
import { Feedback } from '@/src/components/ui/Feedback';
import { usePlaces,useSaved,useTrips } from '@/src/hooks/useTravel';
import { travelRepository } from '@/src/repositories/travel-repository';
import { useAction } from '@/src/providers/FeedbackProvider';
import { money,daysBetween as days } from '@/src/services/travel';
export function PlaceScreen(){
 const {placeId}=useLocalSearchParams<{placeId:string}>(),places=usePlaces(),saved=useSaved(),trips=useTrips(),action=useAction(),[selected,setSelected]=useState(''),[day,setDay]=useState('');
 const p=places.data?.find(x=>x.id===placeId),existing=saved.data?.find(x=>x.place_id===placeId),trip=trips.data?.find(t=>t.id===selected);
 return <Screen><Heading title={p?.name??'A good find'} back />
 <QueryState loading={places.isPending||saved.isPending||trips.isPending} error={places.error||saved.error||trips.error} retry={()=>{void places.refetch();void saved.refetch();void trips.refetch();}}>
 {p?<><Photo uri={p.image_url}/><Text className="text-xs font-bold uppercase text-primary">{p.category} · {p.tags.join(' / ')}</Text><Text className="text-base leading-7 text-foreground">{p.description}</Text><Text className="text-muted">{p.address}</Text><Text className="font-bold text-primary">{money(p.estimated_cost_minor,p.currency)} estimated</Text><Text className="text-xs text-muted">{p.source_label}</Text>
 <Button busy={action.busy} label={existing?'Saved ✓ · tap to unsave':'Save this spot ♡'} onPress={()=>void action.run(()=>travelRepository.toggleSave({place_id:p.id},existing?.id),'Saved list updated')} />
 <Button secondary label="Open in maps ↗" onPress={()=>void action.run(()=>Linking.openURL('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(p.latitude!=null&&p.longitude!=null?p.latitude+','+p.longitude:p.name+' '+p.address)))} />
 <Text className="text-xl font-bold text-foreground">Bring it into the plan.</Text>
 {!trips.data?.length?<Feedback title="Your first trip is waiting." detail="Create a trip in the Trips tab, then add this place to its itinerary." />:<>
 <Chips values={trips.data.map(t=>t.name+' · '+t.id.slice(0,4))} value={trip?trip.name+' · '+trip.id.slice(0,4):''} onChange={v=>{setSelected(trips.data!.find(t=>t.name+' · '+t.id.slice(0,4)===v)!.id);setDay('');}} />
 {trip&&<><Chips values={days(trip.start_date,trip.end_date)} value={day} onChange={setDay} /><Button busy={action.busy} disabled={!day} label="Add to itinerary" onPress={()=>void action.run(()=>travelRepository.saveItem(trip,{title:p.name,description:p.description,category:p.category,day_date:day,start_time:null,end_time:null,estimated_cost_minor:trip.currency===p.currency?p.estimated_cost_minor:0},undefined,p.id),'Added to the itinerary')} />{trip.currency!==p.currency&&<Text className="text-sm text-muted">Different currency: added without a cost estimate.</Text>}</>}
 </>}
 </>:<Feedback title="This spot is unavailable." />}
 </QueryState></Screen>;
}
