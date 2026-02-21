import { useState, useEffect } from 'react';
import { getSession, onAuthStateChange, ensureUserProfile } from '@/lib/auth';
import type { UserProfile } from '@/types';
import type { Session, User } from '@supabase/supabase-js';

export interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

export function useAuth(): AuthState & { signOut: () => Promise<void> } {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const s = await getSession();
      if (cancelled) return;
      setSession(s);
      if (s?.user) {
        const p = await ensureUserProfile(s.user);
        if (!cancelled) setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    };

    init();

    const unsubscribe = onAuthStateChange((s) => {
      setSession(s);
      if (s?.user) {
        ensureUserProfile(s.user).then((p) => {
          if (!cancelled) setProfile(p);
        });
      } else {
        setProfile(null);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const { signOut: doSignOut } = await import('@/lib/auth');
    await doSignOut();
    setSession(null);
    setProfile(null);
  };

  return {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    signOut,
  };
}
