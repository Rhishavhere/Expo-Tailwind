import { createContext, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { AppState } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase';
import { keys } from '@/src/lib/query-client';
import { authRepository } from '@/src/repositories/auth-repository';
import type { Profile } from '@/src/types/database';

type Auth = {
  session: Session | null; user: Session['user'] | null; profile: Profile | undefined;
  isLoading: boolean; error: unknown; retry: () => void; refreshProfile: () => Promise<unknown>;
  signIn: typeof authRepository.signIn; signUp: typeof authRepository.signUp; signOut: typeof authRepository.signOut;
};
const Context = createContext<Auth | null>(null);
export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [attempt, setAttempt] = useState(0);
  const identity = useRef<string | undefined>(undefined);
  const cache = useQueryClient();
  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    const client = supabase;
    let mounted = true, observed = false;
    setLoading(true); setError(null);
    const update = (next: Session | null) => {
      if (!mounted) return;
      if (identity.current !== next?.user.id) { cache.clear(); identity.current = next?.user.id; }
      setSession(next); setLoading(false);
    };
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, next) => { observed = true; update(next); });
    client.auth.getSession().then(({ data, error: issue }) => {
      if (!mounted || observed) return;
      if (issue) { setError(issue); setLoading(false); } else update(data.session);
    }).catch(issue => { if (mounted) { setError(issue); setLoading(false); } });
    const sync = (state: string) => { if (state === 'active') client.auth.startAutoRefresh(); else client.auth.stopAutoRefresh(); };
    sync(AppState.currentState);
    const listener = AppState.addEventListener('change', sync);
    return () => { mounted = false; subscription.unsubscribe(); listener.remove(); client.auth.stopAutoRefresh(); };
  }, [attempt, cache]);
  const profile = useQuery({ queryKey: keys.profile(session?.user.id), queryFn: authRepository.profile, enabled: !!session });
  return <Context.Provider value={{ session, user: session?.user ?? null, profile: profile.data, isLoading, error,
    retry: () => setAttempt(v => v + 1), refreshProfile: profile.refetch,
    signIn: authRepository.signIn, signUp: authRepository.signUp, signOut: authRepository.signOut }}>{children}</Context.Provider>;
}
export function useAuth() { const value = useContext(Context); if (!value) throw new Error('AuthProvider is required'); return value; }
