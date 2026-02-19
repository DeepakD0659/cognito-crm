/** Typed publish/subscribe event bus for decoupling workflow flows */

export type EventType =
  | 'ORDER_PLACED'
  | 'ORDER_STATUS_CHANGED'
  | 'ORDER_SERVED'
  | 'INVENTORY_DEDUCTED'
  | 'LOW_STOCK_DETECTED'
  | 'PAYMENT_COMPLETED'
  | 'FEEDBACK_SUBMITTED'
  | 'SHIFT_CLOCKED_IN'
  | 'TABLE_STATUS_CHANGED';

export interface EventPayload {
  ORDER_PLACED: { orderId: string; tableId: number; items: { name: string; quantity: number }[] };
  ORDER_STATUS_CHANGED: { orderId: string; from: string; to: string };
  ORDER_SERVED: { orderId: string; items: { name: string; quantity: number }[] };
  INVENTORY_DEDUCTED: { items: { name: string; deducted: number; remaining: number }[] };
  LOW_STOCK_DETECTED: { itemId: string; itemName: string; stock: number; reorderPoint: number };
  PAYMENT_COMPLETED: { orderId: string; tableId: number; amount: number; method: string };
  FEEDBACK_SUBMITTED: { orderId: string; rating: number; comment?: string };
  SHIFT_CLOCKED_IN: { staffId: string; isLate: boolean };
  TABLE_STATUS_CHANGED: { tableId: number; from: string; to: string };
}

type Listener<T extends EventType> = (payload: EventPayload[T]) => void;

class EventBus {
  private listeners: Map<EventType, Set<Listener<any>>> = new Map();

  on<T extends EventType>(event: T, listener: Listener<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return () => this.off(event, listener);
  }

  off<T extends EventType>(event: T, listener: Listener<T>): void {
    this.listeners.get(event)?.delete(listener);
  }

  emit<T extends EventType>(event: T, payload: EventPayload[T]): void {
    this.listeners.get(event)?.forEach(listener => {
      try {
        listener(payload);
      } catch (err) {
        console.error(`[EventBus] Error in ${event} listener:`, err);
      }
    });
  }
}

export const eventBus = new EventBus();
