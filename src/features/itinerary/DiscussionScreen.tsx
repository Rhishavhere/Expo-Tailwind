import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { RefreshControl,Text,View } from 'react-native';
import { Screen } from '@/src/components/layout/Screen';
import { Heading } from '@/src/components/layout/Heading';
import { Field } from '@/src/components/ui/Field';
import { Button } from '@/src/components/ui/Button';
import { QueryState } from '@/src/components/ui/QueryState';
import { Feedback } from '@/src/components/ui/Feedback';
import { useTrip } from '@/src/hooks/useTravel';
import { useAction } from '@/src/providers/FeedbackProvider';
import { travelRepository } from '@/src/repositories/travel-repository';
export function DiscussionScreen(){
 const {tripId,itemId}=useLocalSearchParams<{tripId:string;itemId?:string}>(),query=useTrip(tripId),action=useAction(),[body,setBody]=useState('');
 const comments=query.data?.comments.filter(c=>itemId?c.itinerary_item_id===itemId:!c.itinerary_item_id);
 return <Screen refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={()=>void query.refetch()} />}><Heading back title={itemId?query.data?.items.find(i=>i.id===itemId)?.title??'Stop discussion':'The group chat, with a plan.'} eyebrow="Trip discussion" />
 <QueryState loading={query.isPending} error={query.error} retry={()=>void query.refetch()}>
 {!comments?.length&&<Feedback title="Be the first to say hey." detail="Suggestions, questions, food stops. Keep the conversation with the plan." />}
 {comments?.map(c=><View className="gap-2 rounded-2xl bg-surface p-5" key={c.id}><Text className="font-bold text-primary">{query.data?.profiles.find(p=>p.id===c.user_id)?.display_name??'A traveller'}</Text><Text className="text-base leading-6 text-foreground">{c.body}</Text><Text className="text-xs text-muted">{new Date(c.created_at).toLocaleString()}</Text></View>)}
 <Field label="Add to the conversation" value={body} onChangeText={setBody} multiline maxLength={2000} /><Button busy={action.busy} disabled={!body.trim()} label="Send to the crew ↗" onPress={()=>void action.run(async()=>{await travelRepository.comment(tripId,body,itemId);setBody('');},'Message sent')} />
 </QueryState></Screen>;
}
