import { useState } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Users as UsersIcon, ChefHat, AlertTriangle, Send, Minus, Plus } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useStaff, useCustomerMenu } from '@/hooks/useSupabaseData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { OrderItem } from '@/types';

const POS = () => {
  const { floorTables, inventory, addOrder, updateTableStatus } = useAppStore();
  const staff = useStaff().filter(s => s.role === 'Waiter');
  const menu = useCustomerMenu();

  const [selectedWaiter, setSelectedWaiter] = useState('');
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [guestCount, setGuestCount] = useState(2);
  const [orderItems, setOrderItems] = useState<Record<string, number>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { toast } = useToast();

  const vacantTables = floorTables.filter(t => t.status === 'vacant');

  const addItem = (itemId: string) => {
    setOrderItems(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const removeItem = (itemId: string) => {
    setOrderItems(prev => {
      const next = { ...prev };
      if (next[itemId] > 1) next[itemId]--;
      else delete next[itemId];
      return next;
    });
  };

  const itemCount = Object.values(orderItems).reduce((s, q) => s + q, 0);
  const total = Object.entries(orderItems).reduce((s, [id, qty]) => {
    const item = menu.find(m => m.id === id);
    return s + (item?.price || 0) * qty;
  }, 0);

  const getStockWarning = (itemName: string) => {
    const inv = inventory.find(i => i.name.toLowerCase().includes(itemName.toLowerCase().split(' ')[0]));
    return inv && inv.status !== 'OK' ? inv : null;
  };

  const handleFireKOT = () => {
    if (!selectedWaiter || !selectedTable || itemCount === 0) return;

    const items: OrderItem[] = Object.entries(orderItems).map(([id, qty]) => {
      const menuItem = menu.find(m => m.id === id)!;
      return {
        id: `oi-${Date.now()}-${id}`,
        name: menuItem.name,
        price: menuItem.price,
        quantity: qty,
        category: menuItem.category === 'Drinks' ? 'DRINK' as const : 'FOOD' as const,
      };
    });

    const hasDrinks = items.some(i => i.category === 'DRINK');
    const hasFood = items.some(i => i.category === 'FOOD');

    addOrder({
      id: `ord-${Date.now()}`,
      tableId: selectedTable,
      items,
      status: 'PENDING',
      timestamp: new Date(),
      waiter: staff.find(s => s.id === selectedWaiter)?.name,
      route: hasDrinks && hasFood ? 'BOTH' : hasDrinks ? 'BAR' : 'KITCHEN',
      guestCount,
    });

    toast({
      title: '🔥 KOT Fired!',
      description: `Order sent to ${hasFood ? 'Kitchen' : ''}${hasDrinks && hasFood ? ' & ' : ''}${hasDrinks ? 'Bar' : ''}`,
    });

    setOrderItems({});
    setSelectedTable(null);
    setConfirmOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Monitor className="w-6 h-6 text-primary" /> POS Terminal
        </h1>
        <p className="text-sm text-muted-foreground">Waiter order entry system</p>
      </div>

      {/* Setup Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Waiter</label>
          <Select value={selectedWaiter} onValueChange={setSelectedWaiter}>
            <SelectTrigger><SelectValue placeholder="Select waiter" /></SelectTrigger>
            <SelectContent>
              {staff.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Table</label>
          <Select value={selectedTable?.toString() || ''} onValueChange={v => setSelectedTable(Number(v))}>
            <SelectTrigger><SelectValue placeholder="Select table" /></SelectTrigger>
            <SelectContent>
              {vacantTables.map(t => (
                <SelectItem key={t.id} value={t.id.toString()}>Table {t.id} ({t.seats} seats)</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Guests</label>
          <Input type="number" min={1} max={20} value={guestCount} onChange={e => setGuestCount(Number(e.target.value))} />
        </div>
      </div>

      {/* Menu Grid */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Menu Items</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {menu.map((item, i) => {
            const qty = orderItems[item.id] || 0;
            const warning = getStockWarning(item.name);
            return (
              <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                <Card className={`cursor-pointer transition-all hover:scale-[1.02] ${qty > 0 ? 'ring-2 ring-primary' : ''}`}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.image} {item.name}</p>
                        <p className="text-xs text-muted-foreground">${item.price.toFixed(2)}</p>
                      </div>
                      {warning && (
                        <Badge variant="destructive" className="text-[9px]">
                          <AlertTriangle className="w-3 h-3 mr-0.5" />LOW
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      {qty > 0 ? (
                        <div className="flex items-center gap-2">
                          <Button size="icon" variant="outline" className="w-7 h-7" onClick={() => removeItem(item.id)}>
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-bold w-6 text-center">{qty}</span>
                          <Button size="icon" variant="outline" className="w-7 h-7" onClick={() => addItem(item.id)}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => addItem(item.id)}>
                          Add
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Order Summary Bar */}
      {itemCount > 0 && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky bottom-4 z-40"
        >
          <Card className="border-primary/50 bg-card shadow-xl">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-bold">{itemCount} items • ${total.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedTable ? `Table ${selectedTable}` : 'No table selected'} •
                  {selectedWaiter ? ` ${staff.find(s => s.id === selectedWaiter)?.name}` : ' No waiter'}
                </p>
              </div>
              <Button
                onClick={() => setConfirmOpen(true)}
                disabled={!selectedWaiter || !selectedTable}
                className="gap-1"
              >
                <Send className="w-4 h-4" /> Fire KOT
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm">Table {selectedTable} • {guestCount} guests</p>
            <p className="text-sm">Waiter: {staff.find(s => s.id === selectedWaiter)?.name}</p>
            <div className="border-t pt-2 space-y-1">
              {Object.entries(orderItems).map(([id, qty]) => {
                const item = menu.find(m => m.id === id);
                return item ? (
                  <div key={id} className="flex justify-between text-sm">
                    <span>{qty}x {item.name}</span>
                    <span>${(item.price * qty).toFixed(2)}</span>
                  </div>
                ) : null;
              })}
            </div>
            <div className="flex justify-between font-bold text-sm pt-2 border-t">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <Button className="w-full" onClick={handleFireKOT}>
            <ChefHat className="w-4 h-4 mr-1" /> Confirm & Fire KOT
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default POS;
