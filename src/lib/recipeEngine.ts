/** Async recipe-based inventory deduction engine (Flow 4) */

import { eventBus } from './eventBus';
import { logAudit } from './auditLog';

/** Recipe map: menu item name -> list of ingredients with quantities */
export const recipeMap: Record<string, { inventoryName: string; qty: number }[]> = {
  'Truffle Burger': [
    { inventoryName: 'Beef Patty', qty: 1 },
    { inventoryName: 'Brioche Bun', qty: 1 },
    { inventoryName: 'Truffle Oil', qty: 0.1 },
    { inventoryName: 'Cheddar Cheese', qty: 0.1 },
    { inventoryName: 'Lettuce', qty: 0.2 },
  ],
  'Wagyu Steak': [
    { inventoryName: 'Wagyu Beef', qty: 0.3 },
  ],
  'Lobster Roll': [
    { inventoryName: 'Lobster Tail', qty: 1 },
    { inventoryName: 'Brioche Bun', qty: 1 },
  ],
  'Caesar Salad': [
    { inventoryName: 'Lettuce', qty: 1 },
    { inventoryName: 'Cheddar Cheese', qty: 0.05 },
  ],
  'Fish & Chips': [
    { inventoryName: 'French Fries', qty: 1 },
  ],
  'Fusion Tacos': [
    { inventoryName: 'Beef Patty', qty: 1 },
    { inventoryName: 'Lettuce', qty: 0.3 },
  ],
  'Matcha Latte': [
    { inventoryName: 'Matcha Powder', qty: 0.1 },
  ],
  'Craft Beer': [
    { inventoryName: 'Craft Beer', qty: 1 },
  ],
  'Loaded Fries': [
    { inventoryName: 'French Fries', qty: 1 },
    { inventoryName: 'Truffle Oil', qty: 0.05 },
    { inventoryName: 'Cheddar Cheese', qty: 0.05 },
  ],
  'Mushroom Soup': [],
};

export interface DeductionResult {
  itemName: string;
  deducted: number;
  remaining: number;
}

/** Process recipe deductions asynchronously — never blocks POS/KDS */
export function processRecipeDeductions(
  orderItems: { name: string; quantity: number }[],
  getInventory: () => { id: string; name: string; stock: number; reorderPoint: number }[],
  deductFn: (itemId: string, amount: number) => void,
  notifyFn: (msg: { type: 'warning' | 'alert'; title: string; message: string }) => void
): void {
  // Run asynchronously
  setTimeout(() => {
    const results: DeductionResult[] = [];
    const inventory = getInventory();

    for (const orderItem of orderItems) {
      const recipe = recipeMap[orderItem.name];
      if (!recipe) continue;

      for (const ingredient of recipe) {
        const invItem = inventory.find(i => i.name === ingredient.inventoryName);
        if (!invItem) continue;

        const totalDeduct = ingredient.qty * orderItem.quantity;
        const cappedDeduct = Math.min(totalDeduct, invItem.stock);

        if (cappedDeduct > 0) {
          deductFn(invItem.id, -cappedDeduct); // negative to subtract via restockItem pattern
          results.push({
            itemName: invItem.name,
            deducted: cappedDeduct,
            remaining: Math.max(0, invItem.stock - cappedDeduct),
          });
        }

        // Check reorder point
        const newStock = invItem.stock - cappedDeduct;
        if (newStock <= invItem.reorderPoint && invItem.stock > invItem.reorderPoint) {
          eventBus.emit('LOW_STOCK_DETECTED', {
            itemId: invItem.id,
            itemName: invItem.name,
            stock: newStock,
            reorderPoint: invItem.reorderPoint,
          });
          notifyFn({
            type: 'warning',
            title: '⚠️ Low Stock Alert',
            message: `${invItem.name} is below reorder point (${Math.round(newStock)} remaining)`,
          });
        }

        if (cappedDeduct < totalDeduct) {
          notifyFn({
            type: 'alert',
            title: '🚨 Insufficient Stock',
            message: `Not enough ${invItem.name} — needed ${totalDeduct}, only ${invItem.stock} available`,
          });
        }
      }
    }

    if (results.length > 0) {
      eventBus.emit('INVENTORY_DEDUCTED', { items: results.map(r => ({ name: r.itemName, deducted: r.deducted, remaining: r.remaining })) });
      logAudit({
        flowId: 'recipe-engine',
        action: 'INVENTORY_DEDUCTED',
        actor: 'system',
        metadata: { items: results },
      });
    }
  }, 300); // simulate async delay
}
