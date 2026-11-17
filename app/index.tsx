import { Redirect } from 'expo-router';
import { useAuth } from '@/src/providers/AuthProvider';
export default function Index(){return <Redirect href={useAuth().session?'/(tabs)/explore':'/(auth)/welcome'} />;}
