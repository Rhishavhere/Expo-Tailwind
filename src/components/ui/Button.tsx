import { ActivityIndicator, Pressable, Text } from 'react-native';
type Props = { label: string; onPress: () => void; busy?: boolean; disabled?: boolean; secondary?: boolean };
export function Button({ label, onPress, busy, disabled, secondary }: Props) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: disabled || busy, busy }} onPress={onPress} disabled={disabled || busy}
    className={`min-h-14 flex-row items-center justify-center gap-3 rounded-2xl px-5 py-4 active:opacity-70 ${secondary ? 'border border-border bg-surface' : 'bg-primary'} ${disabled || busy ? 'opacity-50' : ''}`}>
    {busy && <ActivityIndicator color={secondary ? '#245B4A' : '#FFFFFF'} />}
    <Text className={`text-base font-bold ${secondary ? 'text-foreground' : 'text-white'}`}>{label}</Text>
  </Pressable>;
}
