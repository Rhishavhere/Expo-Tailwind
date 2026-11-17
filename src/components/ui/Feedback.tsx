import { ActivityIndicator, Text, View } from 'react-native';
import { Button } from './Button';
export function Feedback({ title, detail, retry, loading }: { title: string; detail?: string; retry?: () => void; loading?: boolean }) {
  return <View className="gap-4 rounded-card border border-border bg-surface p-6">
    {loading && <ActivityIndicator color="#245B4A" />}
    <Text className="text-xl font-bold text-foreground">{title}</Text>
    {detail && <Text accessibilityLiveRegion="polite" className="text-base leading-6 text-muted">{detail}</Text>}
    {retry && <Button secondary label="Try again" onPress={retry} />}
  </View>;
}
