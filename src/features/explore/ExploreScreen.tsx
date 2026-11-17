import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Screen } from '@/src/components/layout/Screen';
import { Field } from '@/src/components/ui/Field';
import { Chips } from '@/src/components/ui/Chips';
import { Photo } from '@/src/components/media/Photo';
import { QueryState } from '@/src/components/ui/QueryState';
import { Feedback } from '@/src/components/ui/Feedback';
import { useDestinations, usePlaces } from '@/src/hooks/useTravel';
import { useAuth } from '@/src/providers/AuthProvider';
export function ExploreScreen(){
 const destinations=useDestinations(),places=usePlaces(),{profile}=useAuth();
 const [search,setSearch]=useState(''),[category,setCategory]=useState('All');
 const filtered=useMemo(()=>destinations.data?.filter(d=>(category==='All'||d.tags.includes(category))&&[d.name,d.region,...d.tags].join(' ').toLowerCase().includes(search.toLowerCase())),[destinations.data,category,search]);
 const matchedPlaces=search.trim()?places.data?.filter(p=>[p.name,p.category,p.address].join(' ').toLowerCase().includes(search.toLowerCase())):[];
 return <Screen refreshControl={<RefreshControl refreshing={destinations.isRefetching||places.isRefetching} onRefresh={()=>{void destinations.refetch();void places.refetch();}} />}>
 <View className="flex-row items-center justify-between"><Text className="text-2xl font-black text-primary">wayfarer✳</Text><Pressable accessibilityRole="button" accessibilityLabel="Open your profile" onPress={()=>router.push('/(tabs)/profile')} className="min-h-12 min-w-12 items-center justify-center rounded-2xl bg-sage"><Text className="text-xl font-black text-primary">{(profile?.display_name??'Y').slice(0,1)}</Text></Pressable></View>
 <View className="gap-2"><Text className="text-sm text-muted">Hey {profile?.display_name??'traveller'}, collect moments.</Text><Text className="text-4xl font-black tracking-tight text-foreground">Your next{ '\n' }“we should go”.</Text></View>
 <Field label="Find your kind of somewhere" placeholder="Places, food, mountains…" value={search} onChangeText={setSearch} />
 <Chips values={['All','nature','food','culture','adventure','relaxation']} value={category} onChange={setCategory} />
 <QueryState loading={destinations.isPending||places.isPending} error={destinations.error||places.error} retry={()=>{void destinations.refetch();void places.refetch();}}>
 {!search&&<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:12}}>{destinations.data?.map(d=><Pressable accessibilityRole="button" accessibilityLabel={'Explore '+d.name} key={d.id} onPress={()=>router.push({pathname:'/destination/[destinationId]',params:{destinationId:d.id}})} className="w-20 items-center gap-2"><View className="h-20 w-20 overflow-hidden rounded-full border-2 border-primary p-1"><Photo uri={d.hero_image_url} height={68} /></View><Text className="text-xs font-semibold text-foreground">{d.name}</Text></Pressable>)}</ScrollView>}
 <View className="flex-row justify-between"><Text className="text-xl font-bold text-foreground">{search?'Found your vibe?':'Out of the group chat'}</Text><Text className="text-xs text-muted">Curated demo picks</Text></View>
 {!filtered?.length&&!matchedPlaces?.length&&<Feedback title="A little off the map." detail="Try a different search or choose All." />}
 {filtered?.map(d=><Pressable accessibilityRole="button" accessibilityLabel={'Discover '+d.name} key={d.id} onPress={()=>router.push({pathname:'/destination/[destinationId]',params:{destinationId:d.id}})} className="gap-3 pb-4 active:opacity-80"><View><Photo uri={d.hero_image_url} height={340}/><View className="absolute bottom-5 left-5 right-5 rounded-2xl bg-background p-4"><Text className="text-xs font-bold uppercase tracking-widest text-primary">{d.region} / {d.country}</Text><Text className="mt-1 text-3xl font-black text-foreground">{d.name} ↗</Text></View></View><Text className="text-base leading-6 text-muted" numberOfLines={2}>{d.description}</Text><Text className="text-xs font-semibold text-primary">{d.tags.join('  ·  ')}</Text></Pressable>)}
 {matchedPlaces?.map(p=><Pressable accessibilityRole="button" key={p.id} onPress={()=>router.push({pathname:'/place/[placeId]',params:{placeId:p.id}})} className="rounded-2xl border border-border bg-surface p-5"><Text className="text-lg font-bold text-foreground">{p.name} ↗</Text><Text className="text-muted">{p.category} · {p.address}</Text></Pressable>)}
 </QueryState>
 <Pressable accessibilityRole="button" onPress={()=>router.push('/assistant')} className="rounded-card bg-lime p-6 active:opacity-80"><Text className="text-xl font-black text-primary">A little help finding your way? ✳</Text><Text className="mt-2 leading-6 text-primary">Open your travel assistant ↗</Text></Pressable>
 </Screen>;
}
