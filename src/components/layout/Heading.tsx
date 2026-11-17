import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
export function Heading({title,eyebrow,back=false}:{title:string;eyebrow?:string;back?:boolean}) {
 return <View className="gap-2">{back&&<Pressable accessibilityRole="button" className="min-h-12 justify-center" onPress={()=>router.canGoBack()?router.back():router.replace('/(tabs)/explore')}><Text className="font-bold text-primary">← Back</Text></Pressable>}{eyebrow&&<Text className="text-xs font-bold uppercase tracking-widest text-primary">{eyebrow}</Text>}<Text className="text-4xl font-black tracking-tight text-foreground">{title}</Text></View>;
}
