import { useQuery } from '@tanstack/react-query';
import {
  isSupabaseEnabled,
  fetchBranches,
  fetchStaff,
  fetchMenuItems,
  fetchSuppliers,
  fetchShiftSlots,
} from '@/lib/supabaseData';
import {
  branches,
  getStaff,
  getCustomerMenu,
  getSuppliers,
  getMockRoster,
} from '@/mockData';
import type { Branch, Staff, CustomerMenuItem, Supplier, ShiftSlot } from '@/types';

const STALE_TIME_MS = 5 * 60 * 1000; // 5 min — single read, real-time via store where applicable

export function useBranches(): Branch[] {
  const { data } = useQuery({
    queryKey: ['supabase', 'branches'],
    queryFn: fetchBranches,
    enabled: isSupabaseEnabled,
    staleTime: STALE_TIME_MS,
  });
  return isSupabaseEnabled ? (data ?? []) : branches;
}

export function useStaff(): Staff[] {
  const { data } = useQuery({
    queryKey: ['supabase', 'staff'],
    queryFn: fetchStaff,
    enabled: isSupabaseEnabled,
    staleTime: STALE_TIME_MS,
  });
  return isSupabaseEnabled ? (data ?? []) : getStaff();
}

export function useCustomerMenu(): CustomerMenuItem[] {
  const { data } = useQuery({
    queryKey: ['supabase', 'menu_items'],
    queryFn: fetchMenuItems,
    enabled: isSupabaseEnabled,
    staleTime: STALE_TIME_MS,
  });
  return isSupabaseEnabled ? (data ?? []) : getCustomerMenu();
}

export function useSuppliers(): Supplier[] {
  const { data } = useQuery({
    queryKey: ['supabase', 'suppliers'],
    queryFn: fetchSuppliers,
    enabled: isSupabaseEnabled,
    staleTime: STALE_TIME_MS,
  });
  return isSupabaseEnabled ? (data ?? []) : getSuppliers();
}

export function useShiftSlots(): ShiftSlot[] {
  const { data } = useQuery({
    queryKey: ['supabase', 'shift_slots'],
    queryFn: fetchShiftSlots,
    enabled: isSupabaseEnabled,
    staleTime: STALE_TIME_MS,
  });
  return isSupabaseEnabled ? (data ?? []) : getMockRoster();
}
