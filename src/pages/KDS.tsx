import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Clock, GlassWater, Flame, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { eventBus } from '@/lib/eventBus';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const KDS = () => {
  const { activeOrders, updateOrderStatus, removeOrder, addNotification } = useAppStore();
  const [, setTick] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [flashingOrders, setFlashingOrders] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Timer tick every 30s to update colors
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  // Listen for new orders via event bus
  useEffect(() => {
    const unsub = eventBus.on('ORDER_PLACED', (payload) => {
      setFlashingOrders(prev => new Set(prev).add(payload.orderId));
      setTimeout(() => {
        setFlashingOrders(prev => {
          const next = new Set(prev);
          next.delete(payload.orderId);
          return next;
        });
      }, 3000);
    });
    return unsub;
  }, []);

  const getElapsedMinutes = (timestamp: Date) => Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);

  const getTimerColor = (mins: number) => {
    if (mins >= 20) return 'border-destructive bg-destructive/10';
    if (mins >= 10) return 'border-warning bg-warning/10';
    return 'border-success bg-success/10';
  };

  const getTimerBadge = (mins: number) => {
    if (mins >= 20) return 'destructive' as const;
    if (mins >= 10) return 'outline' as const;
    return 'default' as const;
  };

  const handleStatusChange = (orderId: string, newStatus: 'PREPARING' | 'READY' | 'SERVED') => {
    updateOrderStatus(orderId, newStatus);
    if (newStatus === 'READY') {
      const order = activeOrders.find(o => o.id === orderId);
      toast({ title: '🔔 Order Ready', description: `Table ${order?.tableId} order is ready for pickup.` });
      addNotification({ type: 'info', title: '🍽️ Order Ready', message: `Table ${order?.tableId} — order ready for serving` });
    }
    if (newStatus === 'SERVED') {
      toast({ title: '✅ Order Served', description: `Order marked as served.` });
    }
  };

  const handleBump = (orderId: string) => {
    removeOrder(orderId);
    toast({ title: '✅ Order Bumped', description: `Order ${orderId} removed from board.` });
  };

  const kitchenOrders = activeOrders.filter(o => o.route === 'KITCHEN' || o.route === 'BOTH');
  const barOrders = activeOrders.filter(o => o.route === 'BAR' || o.route === 'BOTH');

  const renderOrderCard = (order: typeof activeOrders[0], filterCategory: 'FOOD' | 'DRINK') => {
    const mins = getElapsedMinutes(order.timestamp);
    const items = order.items.filter(i => i.category === filterCategory);
    if (items.length === 0) return null;
    const isFlashing = flashingOrders.has(order.id);

    return (
      <motion.div
        key={`${filterCategory}-${order.id}`}
        layout
        initial={{ opacity: 0, scale: 0.8, x: 50 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.8, x: -100 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="min-w-[260px] flex-shrink-0"
      >
        <Card className={`border-2 transition-all ${getTimerColor(mins)} ${isFlashing ? 'ring-2 ring-success animate-pulse' : ''}`}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">Table {order.tableId}</span>
              <Badge variant={getTimerBadge(mins)}>
                <Clock className="w-3 h-3 mr-1" /> {mins}m
              </Badge>
            </div>

            <div className="flex items-center gap-1">
              <Badge className="capitalize text-[10px]">{order.status}</Badge>
              {order.waiter && <span className="text-[10px] text-muted-foreground">• {order.waiter}</span>}
            </div>

            <div className="space-y-1">
              {items.map(item => (
                <p key={item.id} className="text-sm">
                  <span className="font-medium">{item.quantity}x</span> {item.name}
                  {item.modifiers && item.modifiers.length > 0 && (
                    <span className="text-[10px] text-muted-foreground ml-1">
                      ({item.modifiers.map(m => m.label).join(', ')})
                    </span>
                  )}
                </p>
              ))}
            </div>

            {/* Chef state transition buttons */}
            <div className="flex gap-1.5">
              {order.status === 'PENDING' && (
                <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => handleStatusChange(order.id, 'PREPARING')}>
                  <Flame className="w-3 h-3 mr-1" /> Start Cooking
                </Button>
              )}
              {order.status === 'PREPARING' && (
                <Button size="sm" variant="outline" className="flex-1 text-xs border-success text-success" onClick={() => handleStatusChange(order.id, 'READY')}>
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Ready
                </Button>
              )}
              {order.status === 'READY' && (
                <>
                  <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => handleStatusChange(order.id, 'SERVED')}>
                    Served
                  </Button>
                  <Button size="sm" className="flex-1 text-xs" onClick={() => handleBump(order.id)}>
                    Bump ✓
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-primary" /> Kitchen Display
          </h1>
          <p className="text-sm text-muted-foreground">{activeOrders.length} active orders</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSoundEnabled(!soundEnabled)}>
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
        </Button>
      </div>

      {/* Kitchen Orders */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <ChefHat className="w-4 h-4" /> Kitchen
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          <AnimatePresence>
            {kitchenOrders.map(order => renderOrderCard(order, 'FOOD'))}
          </AnimatePresence>
          {kitchenOrders.filter(o => o.items.some(i => i.category === 'FOOD')).length === 0 && (
            <p className="text-muted-foreground text-sm py-8">No kitchen orders</p>
          )}
        </div>
      </div>

      {/* Bar Orders */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <GlassWater className="w-4 h-4" /> Bar
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          <AnimatePresence>
            {barOrders.map(order => renderOrderCard(order, 'DRINK'))}
          </AnimatePresence>
          {barOrders.filter(o => o.items.some(i => i.category === 'DRINK')).length === 0 && (
            <p className="text-muted-foreground text-sm py-8">No bar orders</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default KDS;
