import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, User, Clock, DollarSign, X as XIcon } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import type { FloorTable } from '@/types';

const Operations = () => {
  const { floorTables, activeOrders, orderingEnabled, toggleOrdering, removeOrder, updateTableStatus } = useAppStore();
  const [selectedTable, setSelectedTable] = useState<FloorTable | null>(null);
  const { toast } = useToast();

  const getTableClasses = (table: FloorTable) => {
    const mins = table.occupiedSince ? Math.floor((Date.now() - table.occupiedSince.getTime()) / 60000) : 0;
    if (table.status === 'vacant') return 'table-cell-vacant';
    if (table.status === 'reserved') return 'table-cell-reserved';
    if (table.status === 'occupied' && mins > 20) return 'table-cell-occupied blink-alert';
    return 'table-cell-occupied';
  };

  const getWaitTime = (table: FloorTable) => {
    if (!table.occupiedSince) return null;
    return Math.floor((Date.now() - table.occupiedSince.getTime()) / 60000);
  };

  const handleCloseBill = (table: FloorTable) => {
    if (table.orderId) removeOrder(table.orderId);
    updateTableStatus(table.id, 'vacant');
    setSelectedTable(null);
    toast({ title: '💰 Bill Closed', description: `Table ${table.id} is now vacant.` });
  };

  const order = selectedTable?.orderId ? activeOrders.find(o => o.id === selectedTable.orderId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Floor Operations</h1>
          <p className="text-sm text-muted-foreground">Live table status & order management</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{orderingEnabled ? 'Ordering Open' : 'Ordering Closed'}</span>
          <Switch checked={orderingEnabled} onCheckedChange={toggleOrdering} />
          {orderingEnabled ? <Wifi className="w-4 h-4 text-success" /> : <WifiOff className="w-4 h-4 text-destructive" />}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs">
        {[
          { label: 'Vacant', cls: 'bg-success/20 border-success/50' },
          { label: 'Occupied', cls: 'bg-destructive/20 border-destructive/50' },
          { label: 'Reserved', cls: 'bg-warning/20 border-warning/50' },
          { label: 'Alert (>20m)', cls: 'bg-destructive/20 border-destructive/50 blink-alert' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded border-2 ${l.cls}`} />
            {l.label}
          </div>
        ))}
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {floorTables.map((table, i) => {
          const waitTime = getWaitTime(table);
          return (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card
                className={`cursor-pointer transition-all hover:scale-105 ${getTableClasses(table)}`}
                onClick={() => setSelectedTable(table)}
              >
                <CardContent className="p-4 text-center">
                  <p className="font-bold text-lg">T{table.id}</p>
                  <p className="text-xs mt-1">{table.seats} seats</p>
                  <Badge variant="outline" className="mt-2 text-[10px] capitalize">{table.status}</Badge>
                  {waitTime !== null && (
                    <p className="text-[10px] mt-1 flex items-center justify-center gap-0.5">
                      <Clock className="w-3 h-3" /> {waitTime}m
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Table Detail Sheet */}
      <Sheet open={!!selectedTable} onOpenChange={() => setSelectedTable(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Table {selectedTable?.id} Details</SheetTitle>
          </SheetHeader>
          {selectedTable && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="capitalize">{selectedTable.status}</Badge>
                <span>{selectedTable.seats} seats</span>
              </div>

              {selectedTable.waiter && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Assigned: <span className="font-medium">{selectedTable.waiter}</span>
                </div>
              )}

              {order && (
                <div className="space-y-3">
                  <p className="font-medium text-sm">Current Order</p>
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm p-2 rounded bg-accent/50">
                      <span>{item.quantity}x {item.name}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-sm pt-2 border-t">
                    <span>Total</span>
                    <span>${order.items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}</span>
                  </div>
                  <Badge className="capitalize">{order.status}</Badge>
                </div>
              )}

              {selectedTable.status === 'occupied' && (
                <Button onClick={() => handleCloseBill(selectedTable)} className="w-full bg-success hover:bg-success/90 text-success-foreground">
                  <DollarSign className="w-4 h-4 mr-1" /> Close Bill
                </Button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Operations;
