import { Pressable, ScrollView, Text } from 'react-native';
export function Chips({values,value,onChange}:{values:string[];value:string;onChange:(value:string)=>void}) {
 return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8,paddingVertical:4}}>
 {values.map(v=><Pressable accessibilityRole="button" accessibilityState={{selected:v===value}} key={v} onPress={()=>onChange(v)} className={`min-h-12 justify-center rounded-2xl border px-4 active:opacity-70 ${v===value?'border-primary bg-primary':'border-border bg-surface'}`}><Text className={`font-semibold ${v===value?'text-white':'text-foreground'}`}>{v}</Text></Pressable>)}</ScrollView>;
}
