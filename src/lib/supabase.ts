import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';
import { environment } from './env';
import type { Database } from '@/src/types/database';

export const supabase = environment.success ? createClient<Database>(environment.data.url, environment.data.key, {
  auth: { storage: AsyncStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, lock: processLock },
}) : null;
export function getSupabase() {
  if (!supabase) throw new Error('Connect a Supabase project to continue.');
  return supabase;
}
