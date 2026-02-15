import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, Plus, Check, Loader2, Search } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getSuppliers } from '@/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import WizardWrapper from '@/components/WizardWrapper';
import { useToast } from '@/hooks/use-toast';

const Inventory = () => {
  const { inventory, restockItem } = useAppStore();
  const [search, setSearch] = useState('');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const { toast } = useToast();
  const suppliers = getSuppliers();

  const filtered = inventory.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  const lowStockItems = inventory.filter(i => i.status !== 'OK');

  const toggleItem = (id: string) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleWizardComplete = () => {
    selectedItems.forEach(id => restockItem(id, 50));
    setWizardOpen(false);
    setSelectedItems([]);
    setSelectedSupplier('');
    toast({ title: '📦 Purchase Order Sent', description: `${selectedItems.length} items reordered from supplier.` });
  };

  const wizardSteps = [
    {
      title: 'AI Suggested Items',
      description: 'Based on sales forecast, you need these items:',
      content: (
        <div className="space-y-2">
          {lowStockItems.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
              <Checkbox checked={selectedItems.includes(item.id)} onCheckedChange={() => toggleItem(item.id)} />
              <div className="flex-1">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">Stock: {item.stock} {item.unit} (Reorder: {item.reorderPoint})</p>
              </div>
              <Badge variant={item.status === 'CRITICAL' ? 'destructive' : 'outline'}>{item.status}</Badge>
            </div>
          ))}
        </div>
      ),
      validate: () => selectedItems.length > 0,
    },
    {
      title: 'Select Supplier',
      description: 'Choose a supplier for this order:',
      content: (
        <div className="space-y-2">
          {suppliers.map(sup => (
            <div
              key={sup.id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedSupplier === sup.id ? 'border-primary bg-primary/5' : 'hover:bg-accent/50'}`}
              onClick={() => setSelectedSupplier(sup.id)}
            >
              <p className="font-medium text-sm">{sup.name}</p>
              <p className="text-xs text-muted-foreground">Lead time: {sup.leadTime} • Rating: ⭐ {sup.rating}</p>
            </div>
          ))}
        </div>
      ),
      validate: () => !!selectedSupplier,
    },
    {
      title: 'Review Order',
      content: (
        <div className="space-y-3">
          <p className="text-sm font-medium">Order Summary</p>
          {selectedItems.map(id => {
            const item = inventory.find(i => i.id === id);
            return item ? (
              <div key={id} className="flex justify-between text-sm p-2 rounded bg-accent/50">
                <span>{item.name}</span>
                <span>+50 {item.unit}</span>
              </div>
            ) : null;
          })}
          <div className="pt-2 border-t text-sm">
            <p>Supplier: <span className="font-medium">{suppliers.find(s => s.id === selectedSupplier)?.name}</span></p>
          </div>
        </div>
      ),
    },
    {
      title: 'Order Confirmed',
      content: (
        <div className="text-center py-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
            <div className="w-16 h-16 mx-auto rounded-full bg-success/20 flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-success" />
            </div>
          </motion.div>
          <h3 className="text-lg font-bold">Purchase Order Sent!</h3>
          <p className="text-sm text-muted-foreground mt-2">Your order has been submitted successfully.</p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" /> Inventory
          </h1>
          <p className="text-sm text-muted-foreground">{lowStockItems.length} items need attention</p>
        </div>
        <Button onClick={() => { setSelectedItems(lowStockItems.map(i => i.id)); setWizardOpen(true); }}>
          <Plus className="w-4 h-4 mr-1" /> Create Purchase Order
        </Button>
      </div>

      {/* Smart Alerts */}
      {lowStockItems.length > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">{lowStockItems.length} items below reorder point</p>
              <p className="text-xs text-muted-foreground">{lowStockItems.filter(i => i.status === 'CRITICAL').length} critical</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search inventory..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Reorder Pt.</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item, i) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className={`border-b ${item.status !== 'OK' ? 'bg-destructive/5' : ''}`}
              >
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.stock}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>{item.reorderPoint}</TableCell>
                <TableCell className="text-xs">{item.expiryDate}</TableCell>
                <TableCell>
                  <Badge variant={item.status === 'CRITICAL' ? 'destructive' : item.status === 'LOW' ? 'outline' : 'default'}>
                    {item.status}
                  </Badge>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Restock Wizard Dialog */}
      <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
          <WizardWrapper
            title="Smart Restock Wizard"
            steps={wizardSteps}
            onComplete={handleWizardComplete}
            onCancel={() => setWizardOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
