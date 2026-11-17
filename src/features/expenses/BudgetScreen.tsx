import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Alert,RefreshControl,Text,View } from 'react-native';
import { Screen } from '@/src/components/layout/Screen';
import { Heading } from '@/src/components/layout/Heading';
import { Button } from '@/src/components/ui/Button';
import { QueryState } from '@/src/components/ui/QueryState';
import { Feedback } from '@/src/components/ui/Feedback';
import { useTrip } from '@/src/hooks/useTravel';
import { useAuth } from '@/src/providers/AuthProvider';
import { useAction } from '@/src/providers/FeedbackProvider';
import { travelRepository } from '@/src/repositories/travel-repository';
import { balances,money,settlements } from '@/src/services/travel';
import { ExpenseForm } from './ExpenseForm';
import type { Expense } from '@/src/types/database';
export function BudgetScreen(){
 const {tripId}=useLocalSearchParams<{tripId:string}>(),query=useTrip(tripId),auth=useAuth(),action=useAction(),[editor,setEditor]=useState<Expense|'new'|null>(null),data=query.data;
 const name=(id:string)=>data?.profiles.find(p=>p.id===id)?.display_name??'Former member';
 const balance=data?balances(data.expenses,data.splits):{},total=data?.expenses.reduce((n,e)=>n+e.amount_minor,0)??0;
 const budget=data?.trip.target_budget_minor!=null?data.trip.target_budget_minor*(data.trip.budget_scope==='per_person'?data.members.length:1):null;
 return <Screen refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={()=>void query.refetch()} />}><Heading back title="Good times. Fair shares." eyebrow="Trip budget" />
 <QueryState loading={query.isPending} error={query.error} retry={()=>void query.refetch()}>
 {data&&<><View className="gap-3 rounded-card bg-primary p-6"><Text className="text-sm text-white">The group has spent</Text><Text className="text-4xl font-black text-white">{money(total,data.trip.currency)}</Text><Text className="text-white">{budget!=null?money(budget-total,data.trip.currency)+' remaining of '+money(budget,data.trip.currency):'No target budget set'}</Text></View>
 <Button label="Add an expense +" onPress={()=>setEditor('new')} />
 {editor&&<ExpenseForm key={editor==='new'?'new':editor.id} data={data} user={auth.user!.id} expense={editor==='new'?undefined:editor} onDone={()=>setEditor(null)} />}
 {!data.expenses.length&&<Feedback title="Start with the first chai." detail="Add an expense and choose who shares it. We’ll keep the splits exact." />}
 {data.expenses.map(e=><View className="gap-3 rounded-card border border-border bg-surface p-5" key={e.id}><Text className="text-xl font-bold text-foreground">{e.title} · {money(e.amount_minor,e.currency)}</Text><Text className="text-muted">{name(e.paid_by)} paid · {e.expense_date} · {e.category}</Text>{e.note&&<Text className="text-muted">{e.note}</Text>}{data.splits.filter(s=>s.expense_id===e.id).map(s=><Text className="text-sm text-primary" key={s.user_id}>{name(s.user_id)}: {money(s.share_minor,e.currency)}</Text>)}{(e.created_by===auth.user?.id||data.trip.created_by===auth.user?.id)&&<><Button secondary label="Edit expense" onPress={()=>setEditor(e)} /><Button secondary busy={action.busy} label="Delete expense" onPress={()=>Alert.alert('Delete this expense?','All its shares will be removed and balances recalculated.',[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>void action.run(()=>travelRepository.deleteExpense(e.id),'Expense removed')}])} /></>}</View>)}
 <Text className="text-2xl font-black text-foreground">Everyone, squared up.</Text>
 {Object.entries(balance).map(([id,n])=><View className="gap-1 rounded-2xl bg-sage p-4" key={id}><Text className="font-bold text-primary">{name(id)} · {n>=0?'gets back':'owes'} {money(Math.abs(n),data.trip.currency)}</Text><Text className="text-xs text-muted">Paid {money(data.expenses.filter(e=>e.paid_by===id).reduce((a,e)=>a+e.amount_minor,0),data.trip.currency)} · share {money(data.splits.filter(s=>s.user_id===id).reduce((a,s)=>a+s.share_minor,0),data.trip.currency)}</Text></View>)}
 {settlements(balance).map((s,i)=><Text className="leading-6 text-foreground" key={i}>{name(s.from)} → {name(s.to)}: {money(s.amount,data.trip.currency)}</Text>)}
 <Text className="text-xs leading-5 text-muted">Settlement suggestions only. No money moves through Wayfarer. Remainder minor units are assigned in stable user-ID order.</Text>
 </>}
 </QueryState></Screen>;
}
