import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/src/providers/AuthProvider';
import { useInvitationRealtime } from '@/src/hooks/useTravel';
import { colors } from '@/src/constants/theme';
export default function TabsLayout(){
 const insets=useSafeAreaInsets();useInvitationRealtime(useAuth().user?.id);
 return <Tabs screenOptions={{headerShown:false,tabBarActiveTintColor:colors.primary,tabBarInactiveTintColor:colors.muted,tabBarStyle:{backgroundColor:colors.background,borderTopColor:colors.border,height:64+insets.bottom,paddingBottom:insets.bottom+8,paddingTop:8},tabBarLabelStyle:{fontSize:10,fontWeight:'700'}}}>
 {([{name:'explore',title:'Explore',icon:'compass-outline'},{name:'trips',title:'Trips',icon:'map-outline'},{name:'together',title:'Together',icon:'people-outline'},{name:'memories',title:'Memories',icon:'images-outline'},{name:'profile',title:'Profile',icon:'person-outline'}] as const).map(tab=><Tabs.Screen key={tab.name} name={tab.name} options={{title:tab.title,tabBarIcon:({color,size})=><Ionicons name={tab.icon} size={size} color={color} />}} />)}
 </Tabs>;
}
