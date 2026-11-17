import '@/global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/src/lib/query-client';
import { AuthProvider, useAuth } from '@/src/providers/AuthProvider';
import { FeedbackProvider } from '@/src/providers/FeedbackProvider';
import { Feedback } from '@/src/components/ui/Feedback';
import { Screen } from '@/src/components/layout/Screen';
import { colors } from '@/src/constants/theme';

function Navigation() {
 const { session, isLoading, error, retry }=useAuth();
 if(isLoading) return <Screen><Feedback title="Getting your story ready…" loading /></Screen>;
 if(error) return <Screen><Feedback title="Couldn’t restore your session." retry={retry} /></Screen>;
 return <Stack screenOptions={{headerShown:false,contentStyle:{backgroundColor:colors.background}}}>
   <Stack.Screen name="index" />
   <Stack.Protected guard={!session}><Stack.Screen name="(auth)" /></Stack.Protected>
   <Stack.Protected guard={!!session}>
     <Stack.Screen name="(tabs)" />
     <Stack.Screen name="destination/[destinationId]" />
     <Stack.Screen name="place/[placeId]" />
     <Stack.Screen name="trip/create" />
     <Stack.Screen name="trip/[tripId]" />
     <Stack.Screen name="assistant" />
     <Stack.Screen name="memory/[memoryId]" />
   </Stack.Protected>
 </Stack>;
}
export default function RootLayout() {
 return <SafeAreaProvider><QueryClientProvider client={queryClient}><AuthProvider><FeedbackProvider><Navigation /><StatusBar style="dark" /></FeedbackProvider></AuthProvider></QueryClientProvider></SafeAreaProvider>;
}
