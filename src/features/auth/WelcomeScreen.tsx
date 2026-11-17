import { router } from 'expo-router';
import { Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { Screen } from '@/src/components/layout/Screen';
import { Button } from '@/src/components/ui/Button';
import { environment } from '@/src/lib/env';

function Postcard() {
  return <View accessible accessibilityLabel="An illustrated postcard of mountains and a sunset" className="overflow-hidden rounded-card bg-sage">
    <Svg width="100%" height={255} viewBox="0 0 360 255">
      <Rect width="360" height="255" fill="#DCE8DF" />
      <Circle cx="267" cy="63" r="35" fill="#D99B65" />
      <Path d="M0 185 L94 58 L183 185 L250 112 L360 207 L360 255 L0 255 Z" fill="#779C7F" />
      <Path d="M0 224 L111 126 L230 255 L360 179 L360 255 L0 255 Z" fill="#245B4A" />
      <Path d="M125 255 C285 181 124 193 221 144" stroke="#DEEF97" strokeWidth="10" fill="none" />
      <Path d="M45 47 L64 40 L54 55 M64 40 L67 60" stroke="#245B4A" strokeWidth="3" fill="none" />
    </Svg>
    <View className="absolute bottom-5 left-5 rounded-xl bg-background px-4 py-2"><Text className="font-bold text-primary">Take the scenic route ↗</Text></View>
  </View>;
}
export function WelcomeScreen() {
  return <Screen>
    <View className="flex-row items-center justify-between"><Text className="text-2xl font-black tracking-tight text-primary">wayfarer✳</Text><Text className="text-xs font-bold uppercase tracking-widest text-muted">Go somewhere.</Text></View>
    <Postcard />
    <View className="gap-3"><Text className="text-5xl font-black leading-tight tracking-tight text-foreground">Less group chat.{ '\n' }More going.</Text>
      <Text className="text-lg leading-7 text-muted">For the places you save, the friends you take, and the stories you bring back.</Text></View>
    <View className="mt-auto gap-3">
      {environment.success ? <><Button label="Find your next story ↗" onPress={() => router.push('/(auth)/sign-up')} /><Button secondary label="Already here? Sign in" onPress={() => router.push('/(auth)/sign-in')} /></>
      : <View className="gap-2 rounded-2xl border border-border bg-surface p-5"><Text className="font-bold text-foreground">Your next chapter starts here.</Text><Text className="leading-6 text-muted">Connect your Supabase project to enable accounts. Setup steps are in README.md. Restart Expo after adding your public project settings.</Text></View>}
      <Text className="text-center text-xs leading-5 text-muted">Plan together. Explore smarter. Remember everything.</Text>
    </View>
  </Screen>;
}
