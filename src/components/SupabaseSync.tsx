import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
  isSupabaseEnabled,
  subscribeOrders,
  subscribeFloorTables,
  subscribeInventory,
  subscribeNotifications,
  subscribePurchaseOrders,
  subscribeClockRecords,
} from '@/lib/supabaseData';

/**
 * When Supabase is enabled: one-time fetch + real-time subscriptions per table.
 * Updates the store on each change so UI stays in sync with minimal reads.
 */
export default function SupabaseSync() {
  useEffect(() => {
    if (!isSupabaseEnabled) return;

    const { hydrateInventory, hydrateActiveOrders, hydrateFloorTables, hydrateNotifications, hydratePurchaseOrders, hydrateClockRecords } = useAppStore.getState();

    const unsubOrders = subscribeOrders(orders => hydrateActiveOrders(orders));
    const unsubTables = subscribeFloorTables(tables => hydrateFloorTables(tables));
    const unsubInventory = subscribeInventory(items => hydrateInventory(items));
    const unsubNotifications = subscribeNotifications(list => hydrateNotifications(list));
    const unsubPO = subscribePurchaseOrders(list => hydratePurchaseOrders(list));
    const unsubClock = subscribeClockRecords(list => hydrateClockRecords(list));

    return () => {
      unsubOrders();
      unsubTables();
      unsubInventory();
      unsubNotifications();
      unsubPO();
      unsubClock();
    };
  }, []);

  return null;
}
