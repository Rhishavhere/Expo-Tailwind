import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Screen } from '@/src/components/layout/Screen';
import { Button } from '@/src/components/ui/Button';
import { Field } from '@/src/components/ui/Field';
import { useAuth } from '@/src/providers/AuthProvider';
import { message } from '@/src/lib/errors';
import { signInSchema, signUpSchema } from './schemas';
export function AuthScreen({ signUp = false }: { signUp?: boolean }) {
  const auth = useAuth();
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [displayName, setName] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [confirmation, setConfirmation] = useState(false);
  const [issues, setIssues] = useState<Record<string,string>>({});
  async function submit() {
    const parsed = (signUp ? signUpSchema : signInSchema).safeParse({ email: email.trim(), password, displayName });
    setError(''); setIssues({});
    if (!parsed.success) { setIssues(Object.fromEntries(parsed.error.issues.map(i => [String(i.path[0]), i.message]))); return; }
    setBusy(true);
    try { if (signUp) { const active = await auth.signUp({ email: email.trim(), password, displayName }); if (!active) setConfirmation(true); } else await auth.signIn({ email: email.trim(), password }); }
    catch (e) { setError(message(e)); } finally { setBusy(false); }
  }
  return <Screen>
    <Pressable accessibilityRole="button" onPress={() => router.replace('/(auth)/welcome')} className="min-h-12 justify-center"><Text className="font-bold text-primary">← Back to the good stuff</Text></Pressable>
    <View className="gap-3"><Text className="text-sm font-bold uppercase tracking-widest text-primary">wayfarer / your people, your places</Text>
      <Text className="text-4xl font-black tracking-tight text-foreground">{confirmation ? 'Check your inbox.' : signUp ? 'Big plans start\nwith a little hello.' : 'Hey, you.\nWhere to next?'}</Text>
      <Text className="text-base leading-6 text-muted">{confirmation ? 'Confirm your email using the link from Supabase, then come back here to sign in.' : signUp ? 'Make an account. Bring your favourite people along.' : 'Sign in and pick up your next chapter.'}</Text>
    </View>
    {confirmation ? <Button label="Go to sign in" onPress={() => router.replace('/(auth)/sign-in')} /> : <View className="gap-5">
      {signUp && <Field label="What should we call you?" value={displayName} onChangeText={setName} autoComplete="name" maxLength={60} error={issues.displayName} editable={!busy} />}
      <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" error={issues.email} editable={!busy} />
      <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoComplete={signUp ? 'new-password' : 'current-password'} error={issues.password} editable={!busy} onSubmitEditing={() => void submit()} returnKeyType="go" />
      {error !== '' && <Text accessibilityRole="alert" className="text-base text-error">{error}</Text>}
      <Button busy={busy} label={signUp ? 'Let’s go ↗' : 'Sign in ↗'} onPress={() => void submit()} />
      <Button secondary disabled={busy} label={signUp ? 'Have an account? Sign in' : 'New here? Create an account'} onPress={() => router.replace(signUp ? '/(auth)/sign-in' : '/(auth)/sign-up')} />
    </View>}
  </Screen>;
}
