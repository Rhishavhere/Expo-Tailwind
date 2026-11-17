import { useState } from 'react';
import { router,useLocalSearchParams } from 'expo-router';
import { Alert,RefreshControl,Text,View } from 'react-native';
import type { Profile } from '@/src/types/database';
import { Screen } from '@/src/components/layout/Screen';
import { Heading } from '@/src/components/layout/Heading';
import { Button } from '@/src/components/ui/Button';
import { Field } from '@/src/components/ui/Field';
import { QueryState } from '@/src/components/ui/QueryState';
import { useTrip } from '@/src/hooks/useTravel';
import { useAuth } from '@/src/providers/AuthProvider';
import { useAction } from '@/src/providers/FeedbackProvider';
import { travelRepository } from '@/src/repositories/travel-repository';
export function MembersScreen(){
 const {tripId}=useLocalSearchParams<{tripId:string}>(),query=useTrip(tripId),auth=useAuth(),action=useAction();
 const [search,setSearch]=useState(''),[results,setResults]=useState<Profile[]|null>(null),data=query.data,owner=data?.trip.created_by===auth.user?.id;
 function remove(user:string){Alert.alert(user===auth.user?.id?'Leave this trip?':'Remove this member?','They will lose access to the shared trip.',[{text:'Cancel',style:'cancel'},{text:'Confirm',style:'destructive',onPress:()=>void action.run(async()=>{await travelRepository.removeMember(tripId,user);if(user===auth.user?.id)router.replace('/(tabs)/trips');},'Membership updated')}]);}
 return <Screen refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={()=>void query.refetch()} />}><Heading back title="The good company." eyebrow="Five people. One great story." />
 <QueryState loading={query.isPending} error={query.error} retry={()=>void query.refetch()}>
 {data&&<><Text className="text-muted">{data.members.length}/5 members · {data.invitations.filter(i=>i.status==='pending').length} pending invitations</Text>
 {data.members.map(m=><View key={m.id} className="gap-3 rounded-2xl border border-border bg-surface p-5"><Text className="text-lg font-bold text-foreground">{data.profiles.find(p=>p.id===m.user_id)?.display_name??'Traveller'} · {m.role}</Text>{owner&&m.role!=='owner'&&<Button secondary busy={action.busy} label="Remove member" onPress={()=>remove(m.user_id)} />}</View>)}
 {owner?<><Field label="Find a friend by exact username or email" value={search} onChangeText={v=>{setSearch(v);setResults(null);}} autoCapitalize="none" />
 <Button label="Find my friend" busy={action.busy} disabled={search.trim().length<3} onPress={()=>void action.run(async()=>setResults(await travelRepository.searchUsers(search)))} />
 {results?.length===0&&<Text className="text-muted">No registered traveller matches. Check the exact username or email.</Text>}
 {results?.map(p=><View key={p.id} className="gap-3 rounded-card bg-sage p-5"><Text className="text-xl font-bold text-primary">{p.display_name} {p.username?'@'+p.username:''}</Text><Button busy={action.busy} label="Send trip invitation" onPress={()=>void action.run(()=>travelRepository.invite(tripId,p.id),'Invitation sent')} /></View>)}
 <Text className="text-xl font-bold text-foreground">Invitation history</Text>{data.invitations.map(inv=><View className="gap-3 rounded-2xl border border-border p-4" key={inv.id}><Text className="text-foreground">{inv.invitee_id.slice(0,8)}… · {inv.status}</Text>{inv.status==='pending'&&<Button secondary busy={action.busy} label="Revoke invitation" onPress={()=>void action.run(()=>travelRepository.revoke(inv.id),'Invitation revoked')} />}</View>)}
 </>:<Button secondary busy={action.busy} label="Leave this trip" onPress={()=>remove(auth.user!.id)} />}
 </>}
 </QueryState></Screen>;
}
