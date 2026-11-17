import { useState } from 'react';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Alert,Image,Pressable,RefreshControl,Text,View } from 'react-native';
import { Screen } from '@/src/components/layout/Screen';
import { Heading } from '@/src/components/layout/Heading';
import { Field } from '@/src/components/ui/Field';
import { Button } from '@/src/components/ui/Button';
import { Chips } from '@/src/components/ui/Chips';
import { QueryState } from '@/src/components/ui/QueryState';
import { useSaved,useDestinations,usePlaces } from '@/src/hooks/useTravel';
import { useAuth } from '@/src/providers/AuthProvider';
import { useAction } from '@/src/providers/FeedbackProvider';
import { authRepository } from '@/src/repositories/auth-repository';
import { travelRepository } from '@/src/repositories/travel-repository';
import { keys } from '@/src/lib/query-client';
import type { Profile } from '@/src/types/database';
function ProfileForm({profile,onDone}:{profile:Profile;onDone:()=>void}){
 const action=useAction(),[name,setName]=useState(profile.display_name),[username,setUsername]=useState(profile.username??''),[bio,setBio]=useState(profile.bio??''),[avatar,setAvatar]=useState(profile.avatar_url??''),[currency,setCurrency]=useState(profile.default_currency),[interests,setInterests]=useState(profile.interests);
 return <View className="gap-4"><Field label="Display name" value={name} onChangeText={setName} /><Field label="Username" value={username} onChangeText={v=>setUsername(v.toLowerCase())} autoCapitalize="none" /><Field label="Bio" value={bio} onChangeText={setBio} multiline /><Field label="Avatar image URL (optional, HTTPS)" value={avatar} onChangeText={setAvatar} autoCapitalize="none" /><Text className="font-bold text-foreground">Your kind of adventure</Text><View className="flex-row flex-wrap gap-2">{['food','nature','adventure','culture','photography','spirituality','nightlife','relaxation'].map(interest=><Pressable key={interest} accessibilityRole="checkbox" accessibilityState={{checked:interests.includes(interest)}} className={`min-h-12 justify-center rounded-xl px-4 ${interests.includes(interest)?'bg-primary':'bg-sage'}`} onPress={()=>setInterests(list=>list.includes(interest)?list.filter(i=>i!==interest):[...list,interest])}><Text className={interests.includes(interest)?'text-white':'text-primary'}>{interest}</Text></Pressable>)}</View><Text className="font-bold text-foreground">Default currency</Text><Chips values={['INR','USD','EUR','GBP']} value={currency} onChange={setCurrency} /><Button busy={action.busy} label="Save your profile" onPress={()=>void action.run(async()=>{await travelRepository.updateProfile({display_name:name,username,bio,avatar_url:avatar||null,interests,default_currency:currency});onDone();},'Profile saved')} /><Button secondary label="Close editor" onPress={onDone} /></View>;
}
export function ProfileScreen(){
 const auth=useAuth(),action=useAction(),[editing,setEditing]=useState(false);
 const profile=useQuery({queryKey:keys.profile(auth.user?.id),queryFn:authRepository.profile,enabled:!!auth.user}),saved=useSaved(),destinations=useDestinations(),places=usePlaces();
 return <Screen refreshControl={<RefreshControl refreshing={profile.isRefetching||saved.isRefetching} onRefresh={()=>{void profile.refetch();void saved.refetch();}} />}><Heading title="A little more you." eyebrow="Your traveller profile" />
 <QueryState loading={profile.isPending} error={profile.error} retry={()=>void profile.refetch()}>
 {profile.data&&<><View className="gap-3 rounded-card bg-primary p-6">{profile.data.avatar_url&&<Image source={{uri:profile.data.avatar_url}} accessibilityLabel="Your avatar" style={{width:72,height:72,borderRadius:24}} />}<Text className="text-3xl font-black text-white">{profile.data.display_name}</Text><Text className="text-white">{profile.data.username?'@'+profile.data.username:'Choose a username so friends can find you.'}</Text><Text className="text-white">{auth.user?.email}</Text><Text className="leading-6 text-white">{profile.data.bio||'A work in progress. A world to explore.'}</Text></View>
 <Button secondary label={editing?'Close editor':'Make it yours · edit profile'} onPress={()=>setEditing(v=>!v)} />
 {editing&&<ProfileForm key={profile.data.updated_at} profile={profile.data} onDone={()=>setEditing(false)} />}
 </>}
 </QueryState>
 <Text className="text-2xl font-black text-foreground">Saved for someday.</Text><QueryState loading={saved.isPending||destinations.isPending||places.isPending} error={saved.error||destinations.error||places.error} retry={()=>{void saved.refetch();void destinations.refetch();void places.refetch();}}>
 {!saved.data?.length&&<Text className="leading-6 text-muted">The places you save in Explore will find a home here.</Text>}{saved.data?.map(s=><Button secondary key={s.id} label={(s.place_id?places.data?.find(p=>p.id===s.place_id)?.name:destinations.data?.find(d=>d.id===s.destination_id)?.name)??'Saved place'} onPress={()=>s.place_id?router.push({pathname:'/place/[placeId]',params:{placeId:s.place_id}}):router.push({pathname:'/destination/[destinationId]',params:{destinationId:s.destination_id!}})} />)}
 </QueryState>
 <Text className="text-sm leading-6 text-muted">Photos stay on this phone. You can remove collections from Memories without deleting originals. Android controls Expo Go’s permissions; each gallery scan asks for access when needed. Location tracking is never enabled.</Text>
 <Button secondary label="Sign out" busy={action.busy} onPress={()=>Alert.alert('Sign out?','Your account and shared trips will be kept.',[{text:'Cancel',style:'cancel'},{text:'Sign out',onPress:()=>void action.run(auth.signOut,'Signed out')}])} />
 </Screen>;
}
