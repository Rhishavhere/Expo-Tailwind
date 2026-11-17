import { useState } from 'react';
import { View } from 'react-native';
import { Field } from '@/src/components/ui/Field';
import { Button } from '@/src/components/ui/Button';
import { Chips } from '@/src/components/ui/Chips';
import { useAction } from '@/src/providers/FeedbackProvider';
import { travelRepository } from '@/src/repositories/travel-repository';
import { daysBetween,minor } from '@/src/services/travel';
import type { Item,Trip } from '@/src/types/database';
export function ItemForm({trip,item,onDone}:{trip:Trip;item?:Item;onDone:()=>void}){
 const action=useAction(),[title,setTitle]=useState(item?.title??''),[notes,setNotes]=useState(item?.description??''),[date,setDate]=useState(item?.day_date??trip.start_date),[category,setCategory]=useState(item?.category??'activity'),[start,setStart]=useState(item?.start_time?.slice(0,5)??''),[end,setEnd]=useState(item?.end_time?.slice(0,5)??''),[cost,setCost]=useState(item?.estimated_cost_minor?String(item.estimated_cost_minor/100):'');
 return <View className="gap-4 rounded-card border border-border bg-surface p-5">
 <Field label="What’s the plan?" value={title} onChangeText={setTitle} />
 <Chips values={daysBetween(trip.start_date,trip.end_date)} value={date} onChange={setDate} />
 <Chips values={['activity','food','nature','culture','transport','stay']} value={category} onChange={setCategory} />
 <Field label="Start time (optional) · HH:MM" value={start} onChangeText={setStart} placeholder="09:30" />
 <Field label="End time (optional) · HH:MM" value={end} onChangeText={setEnd} placeholder="11:30" />
 <Field label={'Estimated cost · '+trip.currency} value={cost} onChangeText={setCost} keyboardType="decimal-pad" />
 <Field label="Notes" value={notes} onChangeText={setNotes} multiline />
 <Button busy={action.busy} label={item?'Save changes':'Add to the day'} onPress={()=>void action.run(async()=>{await travelRepository.saveItem(trip,{title,description:notes,day_date:date,category,start_time:start||null,end_time:end||null,estimated_cost_minor:cost?minor(cost):0},item);onDone();},'Itinerary updated')} />
 <Button disabled={action.busy} secondary label="Cancel" onPress={onDone} />
 </View>;
}
