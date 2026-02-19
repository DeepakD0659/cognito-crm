import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Star, ArrowLeft, Send, X, CreditCard, Banknote, Smartphone, LogIn, Tag } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getCustomerMenu, getLoyaltyInfo } from '@/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import type { CustomerMenuItem, OrderItem, PaymentMethod, ItemModifier } from '@/types';

const Customer = () => {
  const { cart, addToCart, removeFromCart, clearCart, addOrder, addNotification, submitFeedback } = useAppStore();
  const menu = getCustomerMenu();
  const loyalty = getLoyaltyInfo();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [upsellItem, setUpsellItem] = useState<CustomerMenuItem | null>(null);
  const [upsellSuggestions, setUpsellSuggestions] = useState<CustomerMenuItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [shakeCart, setShakeCart] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [paymentStep, setPaymentStep] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [modifierDialogItem, setModifierDialogItem] = useState<CustomerMenuItem | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<ItemModifier[]>([]);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [lastOrderId, setLastOrderId] = useState('');
  const { toast } = useToast();

  const categories = ['All', ...Array.from(new Set(menu.map(m => m.category)))];
  const filtered = selectedCategory === 'All' ? menu : menu.filter(m => m.category === selectedCategory);
  const discount = promoApplied ? 0.1 : 0;
  const cartSubtotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const cartTotal = cartSubtotal * (1 - discount);
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  const handleAddItem = (item: CustomerMenuItem) => {
    if (item.availableModifiers && item.availableModifiers.length > 0) {
      setModifierDialogItem(item);
      setSelectedModifiers([]);
      return;
    }
    addToCart(item);
    triggerShake();
    checkUpsell(item);
  };

  const handleAddWithModifiers = () => {
    if (!modifierDialogItem) return;
    addToCart(modifierDialogItem);
    setModifierDialogItem(null);
    triggerShake();
    checkUpsell(modifierDialogItem);
  };

  const triggerShake = () => {
    setShakeCart(true);
    setTimeout(() => setShakeCart(false), 500);
  };

  const checkUpsell = (item: CustomerMenuItem) => {
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

  const handleCheckout = () => {
    if (!loggedIn) {
      setLoginDialogOpen(true);
      return;
    }
    setPaymentStep(true);
  };

  const handlePlaceOrder = () => {
    const orderId = `ord-${Date.now()}`;
    const orderItems: OrderItem[] = cart.map(c => ({
      id: c.id,
      name: c.name,
      price: c.price,
      quantity: c.quantity,
      category: c.category === 'Drinks' ? 'DRINK' as const : 'FOOD' as const,
    }));

    addOrder({
      id: orderId,
      tableId: 5,
      items: orderItems,
      status: 'PENDING',
      timestamp: new Date(),
      route: orderItems.some(i => i.category === 'DRINK') ? 'BOTH' : 'KITCHEN',
    });

    setLastOrderId(orderId);
    clearCart();
    setCartOpen(false);
    setPaymentStep(false);
    setPromoApplied(false);
    setPromoCode('');
    setFeedbackOpen(true);
    toast({ title: '🎉 Order Placed!', description: 'Your order is being prepared.' });
  };

  const handleFeedback = () => {
    setFeedbackOpen(false);
    const pointsAwarded = Math.round(cartSubtotal);

    submitFeedback({
      orderId: lastOrderId,
      rating,
      comment: feedbackComment || undefined,
      loyaltyPointsAwarded: pointsAwarded,
    });

    if (rating >= 4) {
      toast({ title: '🌟 Thank you!', description: `You earned ${pointsAwarded} loyalty points! Share your experience?` });
    } else {
      toast({ title: 'Thank you for your feedback', description: 'We will work to improve your experience.' });
    }
    setRating(0);
    setFeedbackComment('');
  };

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === 'mh10' || promoCode.toLowerCase() === 'welcome') {
      setPromoApplied(true);
      toast({ title: '🎉 Promo Applied!', description: '10% discount applied to your order.' });
    } else {
      toast({ title: 'Invalid code', description: 'Please try a valid promo code.', variant: 'destructive' });
    }
  };

  const loyaltyPct = (loyalty.points / loyalty.nextTierPoints) * 100;

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-xl border-b p-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-bold text-lg">MH <span className="text-primary">Cognition</span></h1>
          <div className="flex items-center gap-2">
            {!loggedIn && (
              <Button variant="ghost" size="icon" onClick={() => setLoginDialogOpen(true)}>
                <LogIn className="w-5 h-5" />
              </Button>
            )}
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
                  <SheetTitle>{paymentStep ? 'Payment' : 'Your Cart'}</SheetTitle>
                </SheetHeader>

                {paymentStep ? (
                  <div className="mt-4 space-y-4">
                    {/* Order summary */}
                    <div className="space-y-2">
                      {cart.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.name}</span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      {promoApplied && (
                        <div className="flex justify-between text-sm text-success">
                          <span>Promo (10%)</span>
                          <span>-${(cartSubtotal * 0.1).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold pt-2 border-t">
                        <span>Total</span>
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Promo Code */}
                    {!promoApplied && (
                      <div className="flex gap-2">
                        <Input placeholder="Promo code (try MH10)" value={promoCode} onChange={e => setPromoCode(e.target.value)} className="flex-1" />
                        <Button size="sm" variant="outline" onClick={handleApplyPromo}><Tag className="w-4 h-4" /></Button>
                      </div>
                    )}

                    {/* Payment Method */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Payment Method</p>
                      <div className="grid grid-cols-3 gap-2">
                        {([
                          { method: 'CASH' as PaymentMethod, icon: Banknote, label: 'Cash' },
                          { method: 'CARD' as PaymentMethod, icon: CreditCard, label: 'Card' },
                          { method: 'E_WALLET' as PaymentMethod, icon: Smartphone, label: 'E-Wallet' },
                        ]).map(({ method, icon: Icon, label }) => (
                          <Button
                            key={method}
                            variant={paymentMethod === method ? 'default' : 'outline'}
                            className="flex flex-col gap-1 h-auto py-3"
                            onClick={() => setPaymentMethod(method)}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-xs">{label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setPaymentStep(false)} className="flex-1">Back</Button>
                      <Button onClick={handlePlaceOrder} className="flex-1"><Send className="w-4 h-4 mr-1" /> Pay</Button>
                    </div>
                  </div>
                ) : (
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
                            <span>${cartSubtotal.toFixed(2)}</span>
                          </div>
                          <Button className="w-full" size="lg" onClick={handleCheckout}>
                            <Send className="w-4 h-4 mr-2" /> Checkout
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
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

      {/* Modifier Dialog */}
      <Dialog open={!!modifierDialogItem} onOpenChange={() => setModifierDialogItem(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Customize {modifierDialogItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {modifierDialogItem?.availableModifiers?.map(mod => (
              <label key={mod.id} className="flex items-center gap-3 p-3 rounded-lg bg-accent/50 cursor-pointer">
                <Checkbox
                  checked={selectedModifiers.some(m => m.id === mod.id)}
                  onCheckedChange={(checked) => {
                    setSelectedModifiers(prev =>
                      checked ? [...prev, mod] : prev.filter(m => m.id !== mod.id)
                    );
                  }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{mod.label}</p>
                </div>
                {mod.price > 0 && <span className="text-xs text-muted-foreground">+${mod.price.toFixed(2)}</span>}
              </label>
            ))}
          </div>
          <Button onClick={handleAddWithModifiers} className="w-full">
            <Plus className="w-4 h-4 mr-1" /> Add to Cart
          </Button>
        </DialogContent>
      </Dialog>

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
                <Button size="sm" variant="outline" onClick={() => { addToCart(s); triggerShake(); }}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-2" onClick={() => setUpsellItem(null)}>No thanks</Button>
        </DialogContent>
      </Dialog>

      {/* Login Dialog */}
      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle><LogIn className="w-5 h-5 inline mr-2" />Sign In</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Email" defaultValue="customer@mhcognition.com" />
            <Input placeholder="Password" type="password" defaultValue="••••••••" />
            <Button className="w-full" onClick={() => { setLoggedIn(true); setLoginDialogOpen(false); toast({ title: '✅ Signed In', description: 'Welcome back!' }); }}>
              Sign In
            </Button>
            <Button variant="ghost" className="w-full text-xs" onClick={() => { setLoggedIn(true); setLoginDialogOpen(false); }}>
              Continue as Guest
            </Button>
          </div>
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
          <Input placeholder="Any comments? (optional)" value={feedbackComment} onChange={e => setFeedbackComment(e.target.value)} />
          <Button onClick={handleFeedback} disabled={rating === 0} className="w-full">Submit Feedback</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customer;
