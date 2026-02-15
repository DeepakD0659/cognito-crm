import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Clock, GlassWater } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const KDS = () => {
  const { activeOrders, updateOrderStatus, removeOrder } = useAppStore();
  const [, setTick] = useState(0);
  const { toast } = useToast();

  // Timer tick every 30s to update colors
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(interval);
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

  const handleBump = (orderId: string) => {
    removeOrder(orderId);
    toast({ title: '✅ Order Bumped', description: `Order ${orderId} marked complete.` });
  };

  // Separate kitchen and bar orders
  const kitchenOrders = activeOrders.filter(o => o.route === 'KITCHEN' || o.route === 'BOTH');
  const barOrders = activeOrders.filter(o => o.route === 'BAR' || o.route === 'BOTH');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-primary" /> Kitchen Display
          </h1>
          <p className="text-sm text-muted-foreground">{activeOrders.length} active orders</p>
        </div>
      </div>

      {/* Kitchen Orders */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <ChefHat className="w-4 h-4" /> Kitchen
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          <AnimatePresence>
            {kitchenOrders.map(order => {
              const mins = getElapsedMinutes(order.timestamp);
              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8, x: 50 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -100 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="min-w-[240px] flex-shrink-0"
                >
                  <Card className={`border-2 transition-all ${getTimerColor(mins)}`}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">Table {order.tableId}</span>
                        <Badge variant={getTimerBadge(mins)}>
                          <Clock className="w-3 h-3 mr-1" /> {mins}m
                        </Badge>
                      </div>
                      <Badge className="capitalize text-[10px]">{order.status}</Badge>
                      <div className="space-y-1">
                        {order.items.filter(i => i.category === 'FOOD').map(item => (
                          <p key={item.id} className="text-sm">
                            <span className="font-medium">{item.quantity}x</span> {item.name}
                          </p>
                        ))}
                      </div>
                      <Button size="sm" className="w-full" onClick={() => handleBump(order.id)}>
                        Bump ✓
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {kitchenOrders.length === 0 && (
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
            {barOrders.map(order => {
              const mins = getElapsedMinutes(order.timestamp);
              const drinks = order.items.filter(i => i.category === 'DRINK');
              if (drinks.length === 0) return null;
              return (
                <motion.div
                  key={`bar-${order.id}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, x: -100 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="min-w-[200px] flex-shrink-0"
                >
                  <Card className={`border-2 ${getTimerColor(mins)}`}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">Table {order.tableId}</span>
                        <Badge variant={getTimerBadge(mins)}>
                          <Clock className="w-3 h-3 mr-1" /> {mins}m
                        </Badge>
                      </div>
                      {drinks.map(item => (
                        <p key={item.id} className="text-sm">
                          <span className="font-medium">{item.quantity}x</span> {item.name}
                        </p>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
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
