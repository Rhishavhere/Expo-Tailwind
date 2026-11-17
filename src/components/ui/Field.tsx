import { Text, TextInput, View, type TextInputProps } from 'react-native';
type Props = TextInputProps & { label: string; error?: string };
export function Field({ label, error, ...props }: Props) {
  return <View className="gap-2"><Text className="text-sm font-semibold text-foreground">{label}</Text>
    <TextInput accessibilityLabel={label} placeholderTextColor="#626B64" className={`min-h-14 rounded-2xl border bg-surface px-4 py-3 text-base text-foreground ${error ? 'border-error' : 'border-border'}`} {...props} />
    {error && <Text accessibilityRole="alert" className="text-sm text-error">{error}</Text>}
  </View>;
}
