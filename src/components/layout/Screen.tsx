import type { PropsWithChildren, ReactElement } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View, type RefreshControlProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
export function Screen({ children, refreshControl }: PropsWithChildren<{ refreshControl?: ReactElement<RefreshControlProps> }>) {
  return <SafeAreaView className="flex-1 bg-background" edges={['top','left','right']}>
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets refreshControl={refreshControl} contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
        <View className="mx-auto w-full max-w-xl flex-1 gap-6 px-6 pt-5">{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
