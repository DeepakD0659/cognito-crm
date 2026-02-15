import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Star, ArrowLeft, Send, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getCustomerMenu, getLoyaltyInfo } from '@/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import type { CustomerMenuItem, OrderItem } from '@/types';

const Customer = () => {
  const { cart, addToCart, removeFromCart, clearCart, addOrder, addNotification } = useAppStore();
  const menu = getCustomerMenu();
  const loyalty = getLoyaltyInfo();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [upsellItem, setUpsellItem] = useState<CustomerMenuItem | null>(null);
  const [upsellSuggestions, setUpsellSuggestions] = useState<CustomerMenuItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [shakeCart, setShakeCart] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const { toast } = useToast();

  const categories = ['All', ...Array.from(new Set(menu.map(m => m.category)))];
  const filtered = selectedCategory === 'All' ? menu : menu.filter(m => m.category === selectedCategory);
  const cartTotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  const handleAddItem = (item: CustomerMenuItem) => {
    addToCart(item);
    setShakeCart(true);
    setTimeout(() => setShakeCart(false), 500);

    // Check for upsells
    if (item.upsellItems && item.upsellItems.length > 0) {
      const suggestions = item.upsellItems
        .map(id => menu.find(m => m.id === id))
        .filter(Boolean) as CustomerMenuItem[];
      if (suggestions.length > 0) {
        setUpsellItem(item);
        setUpsellSuggestions(suggestions);
      }
    }
  };

  const handlePlaceOrder = () => {
    const orderItems: OrderItem[] = cart.map(c => ({
      id: c.id,
      name: c.name,
      price: c.price,
      quantity: c.quantity,
      category: c.category === 'Drinks' ? 'DRINK' as const : 'FOOD' as const,
    }));

    addOrder({
      id: `ord-${Date.now()}`,
      tableId: 5,
      items: orderItems,
      status: 'PENDING',
      timestamp: new Date(),
      route: orderItems.some(i => i.category === 'DRINK') ? 'BOTH' : 'KITCHEN',
    });

    clearCart();
    setCartOpen(false);
    setFeedbackOpen(true);
    toast({ title: '🎉 Order Placed!', description: 'Your order is being prepared.' });
  };

  const handleFeedback = () => {
    setFeedbackOpen(false);
    if (rating <= 2) {
      addNotification({
        type: 'alert',
        title: '⚠️ Low Customer Rating',
        message: `Customer rated ${rating}/5 stars. Manager attention needed.`,
      });
    }
    toast({ title: 'Thank you!', description: 'Your feedback has been recorded.' });
    setRating(0);
  };

  const loyaltyPct = (loyalty.points / loyalty.nextTierPoints) * 100;

  return (
    <div className="dark min-h-screen bg-background max-w-md mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-xl border-b p-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-bold text-lg">MH <span className="text-primary">Cognition</span></h1>
          <Sheet open={cartOpen} onOpenChange={setCartOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className={`relative ${shakeCart ? 'animate-shake' : ''}`}>
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-bold"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Your Cart</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-3 flex-1">
                {cart.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">Cart is empty</p>
                ) : (
                  <>
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="icon" variant="outline" className="w-7 h-7" onClick={() => removeFromCart(item.id)}>
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <Button size="icon" variant="outline" className="w-7 h-7" onClick={() => addToCart(item)}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t space-y-3">
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>
                      <Button className="w-full" size="lg" onClick={handlePlaceOrder}>
                        <Send className="w-4 h-4 mr-2" /> Place Order
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Loyalty */}
      <div className="p-4">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Badge className="bg-primary/20 text-primary text-xs">{loyalty.tier} Member</Badge>
              <span className="text-xs text-muted-foreground">{loyalty.points}/{loyalty.nextTierPoints} pts</span>
            </div>
            <Progress value={loyaltyPct} className="h-2" />
            <p className="text-[10px] text-muted-foreground mt-1">{loyalty.nextTierPoints - loyalty.points} points to next tier</p>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <div className="px-4 flex gap-2 overflow-x-auto pb-3">
        {categories.map(cat => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            size="sm"
            className="whitespace-nowrap text-xs"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-2 gap-3 p-4">
        {filtered.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="overflow-hidden hover:scale-[1.02] transition-transform cursor-pointer" onClick={() => handleAddItem(item)}>
              <div className="h-24 bg-accent/30 flex items-center justify-center text-4xl">{item.image}</div>
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium leading-tight">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-sm">${item.price.toFixed(2)}</span>
                  {item.popular && <Badge variant="outline" className="text-[9px]">Popular</Badge>}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Upsell Dialog */}
      <Dialog open={!!upsellItem} onOpenChange={() => setUpsellItem(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Make it even better? 🎉</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">You're adding {upsellItem?.name}. How about:</p>
          <div className="space-y-2 mt-2">
            {upsellSuggestions.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{s.image}</span>
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">+${s.price.toFixed(2)}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => { addToCart(s); setShakeCart(true); setTimeout(() => setShakeCart(false), 500); }}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-2" onClick={() => setUpsellItem(null)}>No thanks</Button>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Rate your experience</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center gap-2 py-4">
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} onClick={() => setRating(s)} className="transition-transform hover:scale-110">
                <Star className={`w-8 h-8 ${s <= rating ? 'text-warning fill-warning' : 'text-muted-foreground'}`} />
              </button>
            ))}
          </div>
          <Button onClick={handleFeedback} disabled={rating === 0} className="w-full">Submit Feedback</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customer;
