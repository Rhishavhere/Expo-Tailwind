import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button } from '@/src/components/ui/Button';
import { Field } from '@/src/components/ui/Field';
import { Chips } from '@/src/components/ui/Chips';
import { useDestinations } from '@/src/hooks/useTravel';
import { QueryState } from '@/src/components/ui/QueryState';
import { tripSchema,minor } from '@/src/services/travel';
import { useAction } from '@/src/providers/FeedbackProvider';
import type { Trip } from '@/src/types/database';
import type { z } from 'zod';
export function TripForm({trip,destinationId,onSubmit}:{trip?:Trip;destinationId?:string;onSubmit:(input:z.infer<typeof tripSchema>)=>Promise<void>}){
 const destinations=useDestinations(),action=useAction();
 const [name,setName]=useState(trip?.name??''),[destination,setDestination]=useState(trip?.destination_id??destinationId??'');
 const [start,setStart]=useState(trip?.start_date??''),[end,setEnd]=useState(trip?.end_date??''),[description,setDescription]=useState(trip?.description??'');
 const [currency,setCurrency]=useState(trip?.currency??'INR'),[budget,setBudget]=useState(trip?.target_budget_minor!=null?String(trip.target_budget_minor/100):''),[scope,setScope]=useState(trip?.budget_scope??'per_person');
 return <View className="gap-5"><Field label="Give this chapter a name" value={name} onChangeText={setName} placeholder="The long-weekend escape" />
 <QueryState loading={destinations.isPending} error={destinations.error} retry={()=>void destinations.refetch()}><Text className="font-bold text-foreground">Destination</Text><Chips values={destinations.data?.map(d=>d.name)??[]} value={destinations.data?.find(d=>d.id===destination)?.name??''} onChange={v=>setDestination(destinations.data!.find(d=>d.name===v)!.id)} /></QueryState>
 <Field label="Start date · YYYY-MM-DD" value={start} onChangeText={setStart} autoCapitalize="none" placeholder="2026-12-12" />
 <Field label="End date · YYYY-MM-DD" value={end} onChangeText={setEnd} autoCapitalize="none" placeholder="2026-12-17" />
 <Field label="A note for your crew (optional)" value={description} onChangeText={setDescription} multiline />
 <Text className="font-bold text-foreground">Trip currency {trip?'· fixed after creation':''}</Text>{trip?<Text className="text-primary">{currency}</Text>:<Chips values={['INR','USD','EUR','GBP']} value={currency} onChange={setCurrency} />}
 <Field label="Target budget (optional)" value={budget} onChangeText={setBudget} keyboardType="decimal-pad" placeholder="15000" />
 <Chips values={['per_person','group_total']} value={scope} onChange={v=>setScope(v as 'per_person'|'group_total')} />
 <Button label={trip?'Save trip changes':'Make it a plan ↗'} busy={action.busy} onPress={()=>void action.run(async()=>{const input=tripSchema.parse({name,destination_id:destination,description,start_date:start,end_date:end,currency,target_budget_minor:budget?minor(budget):null,budget_scope:scope});await onSubmit(input);},trip?'Trip updated':'Trip created')} />
 </View>;
}
