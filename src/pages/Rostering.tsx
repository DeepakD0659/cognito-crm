import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Wand2, AlertTriangle, Check, Loader2, DollarSign } from 'lucide-react';
import { getStaff, getMockRoster, getPayrollSummary } from '@/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import WizardWrapper from '@/components/WizardWrapper';
import { useToast } from '@/hooks/use-toast';
import type { ShiftSlot } from '@/types';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SHIFTS = ['morning', 'afternoon', 'evening'] as const;

const Rostering = () => {
  const staff = getStaff();
  const [roster, setRoster] = useState<ShiftSlot[]>(getMockRoster());
  const payroll = getPayrollSummary();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [avoidOT, setAvoidOT] = useState(true);
  const [respectAvail, setRespectAvail] = useState(true);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiStep, setAiStep] = useState('');
  const [generatedRoster, setGeneratedRoster] = useState<ShiftSlot[]>([]);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const { toast } = useToast();

  const getSlot = (staffId: string, day: number) => roster.find(r => r.staffId === staffId && r.day === day);

  const runAI = () => {
    setAiProgress(0);
    setAiStep('Analyzing sales forecast...');
    const steps = [
      { pct: 30, label: 'Analyzing sales forecast...' },
      { pct: 60, label: 'Checking compliance...' },
      { pct: 90, label: 'Optimizing shifts...' },
      { pct: 100, label: 'Complete!' },
    ];
    let i = 0;
    const timer = setInterval(() => {
      if (i < steps.length) {
        setAiProgress(steps[i].pct);
        setAiStep(steps[i].label);
        i++;
      } else {
        clearInterval(timer);
        // Generate mock roster with a conflict
        const newRoster: ShiftSlot[] = [];
        staff.forEach(s => {
          s.availability.forEach((avail, day) => {
            if (avail && Math.random() > 0.4) {
              const shift = SHIFTS[Math.floor(Math.random() * 3)];
              newRoster.push({ staffId: s.id, day, shift });
            }
          });
        });
        // Add intentional conflict
        newRoster.push({ staffId: 'staff-4', day: 2, shift: 'evening', conflict: 'Deepak is double-booked on Wed' });
        setGeneratedRoster(newRoster);
        setConflicts(['Deepak Sharma is double-booked on Wednesday (Morning + Evening = 16hrs, exceeds limit)']);
      }
    }, 800);
  };

  const wizardSteps = [
    {
      title: 'Set Constraints',
      description: 'Configure AI scheduling preferences:',
      content: (
        <div className="space-y-4">
          <label className="flex items-center gap-3 p-3 rounded-lg bg-accent/50 cursor-pointer">
            <Checkbox checked={avoidOT} onCheckedChange={(v) => setAvoidOT(!!v)} />
            <div>
              <p className="text-sm font-medium">Avoid Overtime</p>
              <p className="text-xs text-muted-foreground">Keep shifts under 44hrs/week per employee</p>
            </div>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-lg bg-accent/50 cursor-pointer">
            <Checkbox checked={respectAvail} onCheckedChange={(v) => setRespectAvail(!!v)} />
            <div>
              <p className="text-sm font-medium">Respect Staff Availability</p>
              <p className="text-xs text-muted-foreground">Only schedule during available days</p>
            </div>
          </label>
        </div>
      ),
    },
    {
      title: 'AI Processing',
      description: 'Generating optimal schedule...',
      content: (
        <div className="py-8 space-y-6">
          <div className="text-center">
            <Loader2 className={`w-12 h-12 mx-auto mb-4 text-primary ${aiProgress < 100 ? 'animate-spin' : ''}`} />
            <p className="text-sm font-medium">{aiStep}</p>
          </div>
          <Progress value={aiProgress} className="h-3" />
          {aiProgress === 0 && (
            <Button onClick={runAI} className="w-full">
              <Wand2 className="w-4 h-4 mr-1" /> Start AI Scheduling
            </Button>
          )}
        </div>
      ),
      validate: () => aiProgress >= 100,
    },
    {
      title: 'Preview Schedule',
      content: (
        <div className="space-y-4">
          {conflicts.length > 0 && (
            <Card className="border-warning/50 bg-warning/5">
              <CardContent className="p-3">
                <p className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" /> Conflicts Detected
                </p>
                {conflicts.map((c, i) => (
                  <p key={i} className="text-xs text-muted-foreground mt-1">⚠️ {c}</p>
                ))}
              </CardContent>
            </Card>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left p-2">Staff</th>
                  {DAYS.map(d => <th key={d} className="p-2 text-center">{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {staff.map(s => (
                  <tr key={s.id} className="border-t">
                    <td className="p-2 font-medium whitespace-nowrap">{s.name}</td>
                    {DAYS.map((_, di) => {
                      const slots = generatedRoster.filter(r => r.staffId === s.id && r.day === di);
                      return (
                        <td key={di} className="p-1 text-center">
                          {slots.map((sl, si) => (
                            <Badge key={si} variant={sl.conflict ? 'destructive' : 'outline'} className="text-[9px] mr-0.5">
                              {sl.shift[0].toUpperCase()}
                            </Badge>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
    {
      title: 'Publish',
      content: (
        <div className="text-center py-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
            <div className="w-16 h-16 mx-auto rounded-full bg-success/20 flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-success" />
            </div>
          </motion.div>
          <h3 className="text-lg font-bold">Schedule Published!</h3>
          <p className="text-sm text-muted-foreground mt-2">Staff will be notified of their shifts.</p>
        </div>
      ),
    },
  ];

  const handleComplete = () => {
    setRoster(generatedRoster);
    setWizardOpen(false);
    setAiProgress(0);
    toast({ title: '📅 Schedule Published', description: 'All staff have been notified.' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> HR & Rostering
          </h1>
          <p className="text-sm text-muted-foreground">{staff.length} staff members</p>
        </div>
        <Button onClick={() => setWizardOpen(true)}>
          <Wand2 className="w-4 h-4 mr-1" /> Generate Schedule
        </Button>
      </div>

      <Tabs defaultValue="roster">
        <TabsList>
          <TabsTrigger value="roster">Weekly Roster</TabsTrigger>
          <TabsTrigger value="payroll">Payroll Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="roster" className="mt-4">
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Staff</th>
                    <th className="text-left p-3 font-medium text-xs">Role</th>
                    {DAYS.map(d => <th key={d} className="p-3 text-center font-medium">{d}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s, i) => (
                    <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b">
                      <td className="p-3 font-medium whitespace-nowrap">{s.name}</td>
                      <td className="p-3"><Badge variant="outline" className="text-[10px]">{s.role}</Badge></td>
                      {DAYS.map((_, di) => {
                        const slot = getSlot(s.id, di);
                        const available = s.availability[di];
                        return (
                          <td key={di} className="p-2 text-center">
                            {slot ? (
                              <Badge variant="default" className="text-[10px]">{slot.shift[0].toUpperCase()}</Badge>
                            ) : (
                              <span className={`text-[10px] ${available ? 'text-muted-foreground' : 'text-destructive/50'}`}>
                                {available ? '—' : '✕'}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="mt-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>OT</TableHead>
                  <TableHead>Base</TableHead>
                  <TableHead>OT Pay</TableHead>
                  <TableHead>EPF</TableHead>
                  <TableHead>SOCSO</TableHead>
                  <TableHead>Net Pay</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payroll.map(p => (
                  <TableRow key={p.staffId}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{p.role}</Badge></TableCell>
                    <TableCell>{p.hoursWorked}</TableCell>
                    <TableCell>{p.overtime > 0 ? <span className="text-warning">{p.overtime}h</span> : '0'}</TableCell>
                    <TableCell>${p.basePay}</TableCell>
                    <TableCell>${p.otPay}</TableCell>
                    <TableCell className="text-muted-foreground">${p.epf}</TableCell>
                    <TableCell className="text-muted-foreground">${p.socso}</TableCell>
                    <TableCell className="font-bold">${p.netPay}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
          <WizardWrapper
            title="AI Schedule Generator"
            steps={wizardSteps}
            onComplete={handleComplete}
            onCancel={() => { setWizardOpen(false); setAiProgress(0); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Rostering;
