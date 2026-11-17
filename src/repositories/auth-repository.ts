import { getSupabase } from '@/src/lib/supabase';
import { signInSchema, signUpSchema, type SignInInput, type SignUpInput } from '@/src/features/auth/schemas';
export const authRepository = {
  async signIn(input: SignInInput) { const values = signInSchema.parse(input); const { error } = await getSupabase().auth.signInWithPassword(values); if (error) throw error; },
  async signUp(input: SignUpInput) { const { email, password, displayName } = signUpSchema.parse(input); const { data, error } = await getSupabase().auth.signUp({ email, password, options: { data: { display_name: displayName } } }); if (error) throw error; return !!data.session; },
  async signOut() { const { error } = await getSupabase().auth.signOut(); if (error) throw error; },
  async profile() { const { data, error } = await getSupabase().rpc('ensure_profile', {}); if (error) throw error; return data; },
};
