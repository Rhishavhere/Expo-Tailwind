import { useState } from 'react';
import { Pressable,Text,View } from 'react-native';
import { z } from 'zod';
import { Field } from '@/src/components/ui/Field';
import { Button } from '@/src/components/ui/Button';
import { Chips } from '@/src/components/ui/Chips';
import { useAction } from '@/src/providers/FeedbackProvider';
import { travelRepository,type TripData } from '@/src/repositories/travel-repository';
import { isoDate,minor } from '@/src/services/travel';
import type { Expense } from '@/src/types/database';
export function ExpenseForm({data,expense,user,onDone}:{data:TripData;expense?:Expense;user:string;onDone:()=>void}){
 const action=useAction(),[title,setTitle]=useState(expense?.title??''),[amount,setAmount]=useState(expense?String(expense.amount_minor/100):''),[payer,setPayer]=useState(expense?.paid_by??user),[date,setDate]=useState(expense?.expense_date??new Date().toISOString().slice(0,10)),[note,setNote]=useState(expense?.note??''),[category,setCategory]=useState(expense?.category??'food');
 const [participants,setParticipants]=useState(expense?data.splits.filter(s=>s.expense_id===expense.id).map(s=>s.user_id):data.members.map(m=>m.user_id));
 const name=(id:string)=>data.profiles.find(p=>p.id===id)?.display_name??id.slice(0,8);
 return <View className="gap-4 rounded-card border border-border bg-surface p-5">
 <Field label="What was it for?" value={title} onChangeText={setTitle} /><Field label={'Amount · '+data.trip.currency} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
 <Chips values={['food','stay','transport','activities','other']} value={category} onChange={setCategory} />
 <Text className="font-bold text-foreground">Paid by</Text><Chips values={data.members.map(m=>name(m.user_id)+' · '+m.user_id.slice(0,4))} value={name(payer)+' · '+payer.slice(0,4)} onChange={v=>setPayer(data.members.find(m=>name(m.user_id)+' · '+m.user_id.slice(0,4)===v)!.user_id)} />
 <Field label="Date · YYYY-MM-DD" value={date} onChangeText={setDate} /><Field label="Note (optional)" value={note} onChangeText={setNote} multiline />
 <Text className="font-bold text-foreground">Split equally between</Text>{data.members.map(m=><Pressable accessibilityRole="checkbox" accessibilityState={{checked:participants.includes(m.user_id)}} key={m.id} onPress={()=>setParticipants(list=>list.includes(m.user_id)?list.filter(id=>id!==m.user_id):[...list,m.user_id])} className="min-h-12 justify-center rounded-xl bg-sage px-4"><Text className="text-primary">{participants.includes(m.user_id)?'✓':'○'} {name(m.user_id)}</Text></Pressable>)}
 <Button label="Save shared expense" busy={action.busy} onPress={()=>void action.run(async()=>{
 const input=z.object({title:z.string().trim().min(1).max(120),amount_minor:z.number().int().positive().max(100000000000),paid_by:z.uuid(),expense_date:isoDate,note:z.string().max(2000),participants:z.array(z.uuid()).min(1).max(5)}).parse({title,amount_minor:minor(amount),paid_by:payer,expense_date:date,note,participants});
 await travelRepository.saveExpense({...input,trip_id:data.trip.id,category,currency:data.trip.currency,id:expense?.id,updated_at:expense?.updated_at});onDone();
 },'Expense saved')} /><Button secondary disabled={action.busy} label="Cancel" onPress={onDone} />
 </View>;
}
