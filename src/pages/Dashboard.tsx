import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, Users, Utensils, Brain, Sparkles, Check, Loader2
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getKPIData, getSalesData, getMenuItems, getAIRecommendations } from '@/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { selectedBranch } = useAppStore();
  const kpi = getKPIData(selectedBranch);
  const salesData = getSalesData(selectedBranch);
  const menuItems = getMenuItems();
  const [recommendations, setRecommendations] = useState(getAIRecommendations());
  const [aiExpanded, setAiExpanded] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const { toast } = useToast();

  const kpiCards = [
    { label: 'Total Sales', value: `$${kpi.totalSales.toLocaleString()}`, trend: kpi.salesTrend, icon: DollarSign, color: 'text-primary' },
    { label: 'Labor Cost', value: `${kpi.laborCostPct}%`, trend: -2.1, icon: Users, color: 'text-chart-4' },
    { label: 'Food Cost', value: `${kpi.foodCostPct}%`, trend: -1.5, icon: Utensils, color: 'text-warning' },
    { label: 'Net Profit', value: `$${kpi.netProfit.toLocaleString()}`, trend: kpi.salesTrend * 0.8, icon: TrendingUp, color: 'text-success' },
  ];

  const handleApply = (id: string) => {
    setApplyingId(id);
    setTimeout(() => {
      setApplyingId(null);
      setRecommendations(r => r.map(rec => rec.id === id ? { ...rec, applied: true } : rec));
      toast({
        title: '✨ Recommendation Applied',
        description: 'Changes have been applied successfully.',
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Executive Dashboard</h1>
          <p className="text-sm text-muted-foreground">Real-time overview • One Platform. Total Control.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="kpi-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                  <Badge variant={card.trend > 0 ? 'default' : 'destructive'} className="text-[10px]">
                    {card.trend > 0 ? '+' : ''}{card.trend.toFixed(1)}%
                  </Badge>
                </div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* AI Brain Widget */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card
          className="cursor-pointer border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 transition-all"
          onClick={() => setAiExpanded(!aiExpanded)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="pulse-glow p-2 rounded-lg bg-primary/20">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              AI Predictive Insights
              <Sparkles className="w-4 h-4 text-primary ml-auto" />
            </CardTitle>
          </CardHeader>
          <motion.div
            animate={{ height: aiExpanded ? 'auto' : 0 }}
            initial={{ height: 0 }}
            className="overflow-hidden"
          >
            <CardContent className="pt-2 space-y-3">
              {recommendations.map(rec => (
                <div key={rec.id} className="p-3 rounded-lg bg-card border flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{rec.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                    <Badge variant="outline" className="mt-2 text-[10px]">{rec.impact}</Badge>
                  </div>
                  {rec.applied ? (
                    <Badge className="bg-success text-success-foreground"><Check className="w-3 h-3 mr-1" />Applied</Badge>
                  ) : (
                    <Button size="sm" onClick={(e) => { e.stopPropagation(); handleApply(rec.id); }} disabled={applyingId === rec.id}>
                      {applyingId === rec.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Apply'}
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </motion.div>
          {!aiExpanded && (
            <CardContent className="pt-0 pb-3">
              <p className="text-xs text-muted-foreground">Click to view {recommendations.filter(r => !r.applied).length} recommendations</p>
            </CardContent>
          )}
        </Card>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sales vs Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                  <Legend />
                  <Line type="monotone" dataKey="actual" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} name="Actual" />
                  <Line type="monotone" dataKey="forecast" stroke="hsl(var(--chart-4))" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Forecast" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Menu Engineering</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={menuItems}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                  <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
