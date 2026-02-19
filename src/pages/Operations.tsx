import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, User, Clock, DollarSign, Receipt, SplitSquareVertical, Lock } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { FloorTable, PaymentMethod } from '@/types';

const Operations = () => {
  const { floorTables, activeOrders, orderingEnabled, toggleOrdering, removeOrder, updateTableStatus, lockTable, unlockTable, lockOrder, processPayment, lockedTables } = useAppStore();
  const [selectedTable, setSelectedTable] = useState<FloorTable | null>(null);
  const [billDialogOpen, setBillDialogOpen] = useState(false);
  const [splitMode, setSplitMode] = useState<'none' | 'even' | 'items'>('none');
  const [splitCount, setSplitCount] = useState(2);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { toast } = useToast();

  const getTableClasses = (table: FloorTable) => {
    const mins = table.occupiedSince ? Math.floor((Date.now() - table.occupiedSince.getTime()) / 60000) : 0;
    const locked = lockedTables.has(table.id);
    if (table.status === 'vacant') return 'table-cell-vacant';
    if (table.status === 'reserved') return 'table-cell-reserved';
    if (locked) return 'table-cell-occupied ring-2 ring-warning';
    if (table.status === 'occupied' && mins > 20) return 'table-cell-occupied blink-alert';
    return 'table-cell-occupied';
  };

  const getWaitTime = (table: FloorTable) => {
    if (!table.occupiedSince) return null;
    return Math.floor((Date.now() - table.occupiedSince.getTime()) / 60000);
  };

  const order = selectedTable?.orderId ? activeOrders.find(o => o.id === selectedTable.orderId) : null;
  const orderTotal = order ? order.items.reduce((s, i) => s + i.price * i.quantity, 0) : 0;
  const isTableLocked = selectedTable ? lockedTables.has(selectedTable.id) : false;

  const handleRequestBill = () => {
    if (!selectedTable || !order) return;
    lockTable(selectedTable.id);
    lockOrder(order.id);
    setBillDialogOpen(true);
    toast({ title: '🔒 Order Locked', description: 'No further modifications allowed.' });
  };

  const handleProcessPayment = () => {
    if (!order || !selectedTable) return;
    setPaymentProcessing(true);

    const splitDetails = splitMode === 'even'
      ? Array.from({ length: splitCount }, (_, i) => ({ guestIndex: i, amount: orderTotal / splitCount }))
      : undefined;

    processPayment({
      orderId: order.id,
      tableId: selectedTable.id,
      method: paymentMethod,
      amount: orderTotal,
      status: 'PROCESSING',
      splitDetails,
    });

    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        removeOrder(order.id);
        updateTableStatus(selectedTable.id, 'vacant');
        unlockTable(selectedTable.id);
        setBillDialogOpen(false);
        setSelectedTable(null);
        setPaymentSuccess(false);
        setSplitMode('none');
        toast({ title: '💰 Payment Complete', description: `Table ${selectedTable.id} is now vacant.` });
      }, 1500);
    }, 2000);
  };

  const handleCloseBill = (table: FloorTable) => {
    if (table.orderId) removeOrder(table.orderId);
    updateTableStatus(table.id, 'vacant');
    unlockTable(table.id);
    setSelectedTable(null);
    toast({ title: '💰 Bill Closed', description: `Table ${table.id} is now vacant.` });
  };

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
      <div className="flex gap-4 text-xs flex-wrap">
        {[
          { label: 'Vacant', cls: 'bg-success/20 border-success/50' },
          { label: 'Occupied', cls: 'bg-destructive/20 border-destructive/50' },
          { label: 'Reserved', cls: 'bg-warning/20 border-warning/50' },
          { label: 'Alert (>20m)', cls: 'bg-destructive/20 border-destructive/50 blink-alert' },
          { label: 'Locked (Billing)', cls: 'bg-destructive/20 border-destructive/50 ring-2 ring-warning' },
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
          const locked = lockedTables.has(table.id);
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
                  <div className="flex items-center justify-center gap-1">
                    <p className="font-bold text-lg">T{table.id}</p>
                    {locked && <Lock className="w-3 h-3 text-warning" />}
                  </div>
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
      <Sheet open={!!selectedTable && !billDialogOpen} onOpenChange={() => setSelectedTable(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Table {selectedTable?.id} Details</SheetTitle>
          </SheetHeader>
          {selectedTable && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="capitalize">{selectedTable.status}</Badge>
                <span>{selectedTable.seats} seats</span>
                {isTableLocked && <Badge variant="outline" className="text-warning border-warning"><Lock className="w-3 h-3 mr-1" />Locked</Badge>}
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
                    <span>${orderTotal.toFixed(2)}</span>
                  </div>
                  <Badge className="capitalize">{order.status}</Badge>
                  {order.locked && <Badge variant="outline" className="text-warning ml-1">Locked</Badge>}
                </div>
              )}

              {selectedTable.status === 'occupied' && !isTableLocked && (
                <div className="space-y-2">
                  <Button onClick={() => handleRequestBill()} className="w-full" variant="outline">
                    <Receipt className="w-4 h-4 mr-1" /> Request Bill
                  </Button>
                  <Button onClick={() => handleCloseBill(selectedTable)} className="w-full bg-success hover:bg-success/90 text-success-foreground">
                    <DollarSign className="w-4 h-4 mr-1" /> Quick Close
                  </Button>
                </div>
              )}

              {isTableLocked && (
                <Button onClick={() => setBillDialogOpen(true)} className="w-full">
                  <DollarSign className="w-4 h-4 mr-1" /> Process Payment
                </Button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Payment / Bill Dialog */}
      <Dialog open={billDialogOpen} onOpenChange={(open) => { if (!open && !paymentProcessing) { setBillDialogOpen(false); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {paymentSuccess ? '✅ Payment Successful' : paymentProcessing ? '⏳ Processing...' : `Bill — Table ${selectedTable?.id}`}
            </DialogTitle>
          </DialogHeader>

          {paymentSuccess ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-success/20 flex items-center justify-center mb-4">
                <DollarSign className="w-8 h-8 text-success" />
              </div>
              <p className="font-bold text-lg">Payment Complete!</p>
              <p className="text-sm text-muted-foreground mt-1">Table will be reset shortly...</p>
            </motion.div>
          ) : paymentProcessing ? (
            <div className="text-center py-8">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <DollarSign className="w-12 h-12 mx-auto text-primary" />
              </motion.div>
              <p className="text-sm text-muted-foreground mt-4">Processing payment...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Order summary */}
              {order && (
                <div className="space-y-2">
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-sm pt-2 border-t">
                    <span>Total</span>
                    <span>${orderTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Split Bill */}
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-1"><SplitSquareVertical className="w-4 h-4" /> Split Bill</p>
                <div className="flex gap-2">
                  {(['none', 'even'] as const).map(mode => (
                    <Button key={mode} size="sm" variant={splitMode === mode ? 'default' : 'outline'} onClick={() => setSplitMode(mode)} className="text-xs capitalize">
                      {mode === 'none' ? 'No Split' : 'Split Evenly'}
                    </Button>
                  ))}
                </div>
                {splitMode === 'even' && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs">Split between</span>
                    <Select value={splitCount.toString()} onValueChange={v => setSplitCount(Number(v))}>
                      <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[2, 3, 4, 5, 6].map(n => (
                          <SelectItem key={n} value={n.toString()}>{n} guests</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-muted-foreground">(${(orderTotal / splitCount).toFixed(2)} each)</span>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Payment Method</p>
                <div className="flex gap-2">
                  {(['CASH', 'CARD', 'E_WALLET'] as PaymentMethod[]).map(m => (
                    <Button key={m} size="sm" variant={paymentMethod === m ? 'default' : 'outline'} onClick={() => setPaymentMethod(m)} className="text-xs capitalize">
                      {m === 'E_WALLET' ? 'E-Wallet' : m.charAt(0) + m.slice(1).toLowerCase()}
                    </Button>
                  ))}
                </div>
              </div>

              <Button className="w-full" onClick={handleProcessPayment}>
                <DollarSign className="w-4 h-4 mr-1" /> Pay ${orderTotal.toFixed(2)}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Operations;
