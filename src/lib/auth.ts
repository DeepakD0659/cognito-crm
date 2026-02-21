/**
 * Supabase Auth helpers for Flow 8 (Login / Auth).
 * Authenticate credentials, check user permissions via user_profiles, grant access.
 */

import { supabase, isSupabaseEnabled } from '@/lib/supabase';
import { fetchUserProfile } from '@/lib/supabaseData';
import { upsertUserProfile } from '@/lib/supabaseWrites';
import type { UserProfile } from '@/types';
import type { Session, User } from '@supabase/supabase-js';

export { isSupabaseEnabled };

export async function getSession(): Promise<Session | null> {
  if (!isSupabaseEnabled || !supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function signInWithPassword(email: string, password: string): Promise<{ error: Error | null }> {
  if (!isSupabaseEnabled || !supabase) return { error: new Error('Auth not configured') };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error ?? null };
}

export async function signUp(email: string, password: string, opts?: { name?: string }): Promise<{ error: Error | null }> {
  if (!isSupabaseEnabled || !supabase) return { error: new Error('Auth not configured') };
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: opts?.name ? { data: { full_name: opts.name } } : undefined,
  });
  return { error: error ?? null };
}

export async function signOut(): Promise<void> {
  if (!isSupabaseEnabled || !supabase) return;
  await supabase.auth.signOut();
}

export function onAuthStateChange(callback: (session: Session | null) => void): () => void {
  if (!isSupabaseEnabled || !supabase) return () => {};
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => subscription.unsubscribe();
}

/** Ensure user_profiles row exists for the current user (create with default role if not). */
export async function ensureUserProfile(user: User): Promise<UserProfile | null> {
  const existing = await fetchUserProfile(user.id);
  if (existing) return existing;
  const profile: UserProfile = {
    id: user.id,
    role: 'CUSTOMER',
    permissions: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const ok = await upsertUserProfile(profile);
  return ok ? profile : null;
}
