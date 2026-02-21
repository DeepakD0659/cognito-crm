import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Users, MessageSquare, Target, HelpCircle, Megaphone, FolderKanban, Lightbulb, FileText,
  Plus, Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  fetchContacts,
  fetchLeads,
  fetchOpportunities,
  fetchInquiries,
  fetchSupportTickets,
  fetchKbArticles,
  fetchCampaigns,
  fetchProjects,
  fetchFeatureRequests,
  fetchMarketingAssets,
} from '@/lib/supabaseData';
import {
  getMockContacts,
  getMockLeads,
  getMockOpportunities,
  getMockInquiries,
  getMockSupportTickets,
  getMockKbArticles,
  getMockCampaigns,
  getMockProjects,
  getMockFeatureRequests,
  getMockMarketingAssets,
} from '@/mockData';
import {
  insertContact,
  insertLead,
  insertInquiry,
  insertSupportTicket,
  insertKbArticle,
  insertCampaign,
  insertProject,
  insertFeatureRequest,
  insertMarketingAsset,
  isSupabaseEnabled,
} from '@/lib/supabaseWrites';
import type { Contact, Lead, Inquiry, SupportTicket, KbArticle, Campaign, Project, FeatureRequest, MarketingAsset } from '@/types';

const CRM_MOCK_KEY = 'crm-fill-with-mock';

const CRM = () => {
  const queryClient = useQueryClient();
  const [addDialog, setAddDialog] = useState<string | null>(null);
  const [fillWithMock, setFillWithMock] = useState(() => {
    try {
      return localStorage.getItem(CRM_MOCK_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const useMock = fillWithMock;
  const canShowCrm = isSupabaseEnabled || useMock;

  const toggleMock = (checked: boolean) => {
    setFillWithMock(checked);
    try {
      localStorage.setItem(CRM_MOCK_KEY, String(checked));
    } catch {}
    queryClient.invalidateQueries({ queryKey: ['crm'] });
  };

  const { data: contacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['crm', 'contacts', useMock],
    queryFn: useMock ? async () => getMockContacts() : fetchContacts,
    enabled: canShowCrm,
  });
  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ['crm', 'leads', useMock],
    queryFn: useMock ? async () => getMockLeads() : fetchLeads,
    enabled: canShowCrm,
  });
  const { data: opportunities = [] } = useQuery({
    queryKey: ['crm', 'opportunities', useMock],
    queryFn: useMock ? async () => getMockOpportunities() : fetchOpportunities,
    enabled: canShowCrm,
  });
  const { data: inquiries = [] } = useQuery({
    queryKey: ['crm', 'inquiries', useMock],
    queryFn: useMock ? async () => getMockInquiries() : fetchInquiries,
    enabled: canShowCrm,
  });
  const { data: tickets = [] } = useQuery({
    queryKey: ['crm', 'support_tickets', useMock],
    queryFn: useMock ? async () => getMockSupportTickets() : fetchSupportTickets,
    enabled: canShowCrm,
  });
  const { data: kbArticles = [] } = useQuery({
    queryKey: ['crm', 'kb_articles', useMock],
    queryFn: useMock ? async () => getMockKbArticles() : fetchKbArticles,
    enabled: canShowCrm,
  });
  const { data: campaigns = [] } = useQuery({
    queryKey: ['crm', 'campaigns', useMock],
    queryFn: useMock ? async () => getMockCampaigns() : fetchCampaigns,
    enabled: canShowCrm,
  });
  const { data: projects = [] } = useQuery({
    queryKey: ['crm', 'projects', useMock],
    queryFn: useMock ? async () => getMockProjects() : fetchProjects,
    enabled: canShowCrm,
  });
  const { data: featureRequests = [] } = useQuery({
    queryKey: ['crm', 'feature_requests', useMock],
    queryFn: useMock ? async () => getMockFeatureRequests() : fetchFeatureRequests,
    enabled: canShowCrm,
  });
  const { data: marketingAssets = [] } = useQuery({
    queryKey: ['crm', 'marketing_assets', useMock],
    queryFn: useMock ? async () => getMockMarketingAssets() : fetchMarketingAssets,
    enabled: canShowCrm,
  });

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ['crm'] });
  };

  if (!canShowCrm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CRM</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Enable Supabase or turn on &quot;Fill with mock&quot; to use CRM (contacts, leads, opportunities, support, campaigns, projects, feature requests, marketing).</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">CRM</h1>
          <p className="text-muted-foreground text-sm">Flows 1–11: Contacts, Leads, Opportunities, Inquiries, Support, Campaigns, Projects, Feature Requests, Marketing</p>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="crm-mock-toggle"
            checked={fillWithMock}
            onCheckedChange={toggleMock}
          />
          <Label htmlFor="crm-mock-toggle" className="text-sm cursor-pointer whitespace-nowrap">
            Fill with mock
          </Label>
        </div>
      </div>
      <Tabs defaultValue="contacts" className="w-full">
        <TabsList className="flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="features">Feature Requests</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
        </TabsList>
        <TabsContent value="contacts" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Contacts (Flow 1, 11)</CardTitle>
              <Button size="sm" onClick={() => setAddDialog('contact')}><Plus className="w-4 h-4 mr-1" /> Add</Button>
            </CardHeader>
            <CardContent>
              {contactsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <Table>
                  <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Company</TableHead><TableHead>Source</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {contacts.map((c: Contact) => (
                      <TableRow key={c.id}><TableCell>{c.name}</TableCell><TableCell>{c.email}</TableCell><TableCell>{c.company}</TableCell><TableCell>{c.source}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="leads" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5" /> Leads (Flow 1, 4, 6)</CardTitle>
              <Button size="sm" onClick={() => setAddDialog('lead')}><Plus className="w-4 h-4 mr-1" /> Add</Button>
            </CardHeader>
            <CardContent>
              {leadsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <Table>
                  <TableHeader><TableRow><TableHead>Contact</TableHead><TableHead>Score</TableHead><TableHead>Status</TableHead><TableHead>Stage</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {leads.map((l: Lead) => (
                      <TableRow key={l.id}><TableCell>{l.contactId}</TableCell><TableCell>{l.score}</TableCell><TableCell>{l.status}</TableCell><TableCell>{l.stage ?? '-'}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="opportunities" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Target className="w-5 h-5" /> Opportunities (Flow 1, 2, 4, 6)</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Lead ID</TableHead><TableHead>Stage</TableHead><TableHead>Value</TableHead></TableRow></TableHeader>
                <TableBody>
                  {opportunities.map((o: { id: string; leadId: string; stage: string; value: number }) => (
                    <TableRow key={o.id}><TableCell>{o.leadId}</TableCell><TableCell>{o.stage}</TableCell><TableCell>{o.value}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="inquiries" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Inquiries (Flow 2)</CardTitle>
              <Button size="sm" onClick={() => setAddDialog('inquiry')}><Plus className="w-4 h-4 mr-1" /> Add</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Details</TableHead><TableHead>Hot</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {inquiries.map((i: Inquiry) => (
                    <TableRow key={i.id}><TableCell className="max-w-xs truncate">{i.details}</TableCell><TableCell>{i.hotLead ? 'Yes' : 'No'}</TableCell><TableCell>{i.status}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="support" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><HelpCircle className="w-5 h-5" /> Support (Flow 5)</CardTitle>
              <Button size="sm" onClick={() => setAddDialog('ticket')}><Plus className="w-4 h-4 mr-1" /> Add Ticket</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Status</TableHead><TableHead>Known issue</TableHead></TableRow></TableHeader>
                <TableBody>
                  {tickets.map((t: SupportTicket) => (
                    <TableRow key={t.id}><TableCell>{t.subject}</TableCell><TableCell>{t.status}</TableCell><TableCell>{t.knownIssue ? 'Yes' : 'No'}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>KB Articles</CardTitle>
              <Button size="sm" onClick={() => setAddDialog('kb')}><Plus className="w-4 h-4 mr-1" /> Add</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Title</TableHead></TableRow></TableHeader>
                <TableBody>
                  {kbArticles.map((k: KbArticle) => (
                    <TableRow key={k.id}><TableCell>{k.title}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="campaigns" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Megaphone className="w-5 h-5" /> Campaigns (Flow 6)</CardTitle>
              <Button size="sm" onClick={() => setAddDialog('campaign')}><Plus className="w-4 h-4 mr-1" /> Add</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Launched</TableHead></TableRow></TableHeader>
                <TableBody>
                  {campaigns.map((c: Campaign) => (
                    <TableRow key={c.id}><TableCell>{c.name}</TableCell><TableCell>{c.launchedAt ? new Date(c.launchedAt).toLocaleDateString() : '-'}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="projects" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><FolderKanban className="w-5 h-5" /> Projects (Flow 7)</CardTitle>
              <Button size="sm" onClick={() => setAddDialog('project')}><Plus className="w-4 h-4 mr-1" /> Add</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead><TableHead>Scope</TableHead></TableRow></TableHeader>
                <TableBody>
                  {projects.map((p: Project) => (
                    <TableRow key={p.id}><TableCell>{p.name}</TableCell><TableCell>{p.status}</TableCell><TableCell className="max-w-xs truncate">{p.scope ?? '-'}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="features" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Lightbulb className="w-5 h-5" /> Feature Requests (Flow 9)</CardTitle>
              <Button size="sm" onClick={() => setAddDialog('feature')}><Plus className="w-4 h-4 mr-1" /> Add</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead>Approved</TableHead></TableRow></TableHeader>
                <TableBody>
                  {featureRequests.map((f: FeatureRequest) => (
                    <TableRow key={f.id}><TableCell>{f.title}</TableCell><TableCell>{f.status}</TableCell><TableCell>{f.approvedForDev ? 'Yes' : 'No'}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="marketing" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> Marketing Assets (Flow 10)</CardTitle>
              <Button size="sm" onClick={() => setAddDialog('marketing')}><Plus className="w-4 h-4 mr-1" /> Add</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead>Legal approved</TableHead></TableRow></TableHeader>
                <TableBody>
                  {marketingAssets.map((m: MarketingAsset) => (
                    <TableRow key={m.id}><TableCell>{m.title}</TableCell><TableCell>{m.status}</TableCell><TableCell>{m.legalApproved ? 'Yes' : 'No'}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add dialogs: simple forms that call insert and refetch */}
      <AddContactDialog open={addDialog === 'contact'} onClose={() => setAddDialog(null)} onSuccess={() => { refetch(); setAddDialog(null); }} />
      <AddLeadDialog open={addDialog === 'lead'} onClose={() => setAddDialog(null)} onSuccess={() => { refetch(); setAddDialog(null); }} contacts={contacts} />
      <AddInquiryDialog open={addDialog === 'inquiry'} onClose={() => setAddDialog(null)} onSuccess={() => { refetch(); setAddDialog(null); }} />
      <AddTicketDialog open={addDialog === 'ticket'} onClose={() => setAddDialog(null)} onSuccess={() => { refetch(); setAddDialog(null); }} />
      <AddKbDialog open={addDialog === 'kb'} onClose={() => setAddDialog(null)} onSuccess={() => { refetch(); setAddDialog(null); }} />
      <AddCampaignDialog open={addDialog === 'campaign'} onClose={() => setAddDialog(null)} onSuccess={() => { refetch(); setAddDialog(null); }} />
      <AddProjectDialog open={addDialog === 'project'} onClose={() => setAddDialog(null)} onSuccess={() => { refetch(); setAddDialog(null); }} />
      <AddFeatureDialog open={addDialog === 'feature'} onClose={() => setAddDialog(null)} onSuccess={() => { refetch(); setAddDialog(null); }} />
      <AddMarketingDialog open={addDialog === 'marketing'} onClose={() => setAddDialog(null)} onSuccess={() => { refetch(); setAddDialog(null); }} />
    </div>
  );
};

function AddContactDialog({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [phone, setPhone] = useState(''); const [company, setCompany] = useState(''); const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    const ok = await insertContact({ name, email: email || undefined, phone: phone || undefined, company: company || undefined, source: 'crm' });
    setLoading(false);
    if (ok) { setName(''); setEmail(''); setPhone(''); setCompany(''); onSuccess(); }
  };
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent><DialogHeader><DialogTitle>Add Contact (Flow 11: Data Input)</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" /></div>
          <div className="grid gap-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" /></div>
          <div className="grid gap-2"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" /></div>
          <div className="grid gap-2"><Label>Company</Label><Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={handle} disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddLeadDialog({ open, onClose, onSuccess, contacts }: { open: boolean; onClose: () => void; onSuccess: () => void; contacts: Contact[] }) {
  const [contactId, setContactId] = useState(''); const [score, setScore] = useState(0); const [loading, setLoading] = useState(false);
  const handle = async () => {
    if (!contactId) return;
    setLoading(true);
    const ok = await insertLead({ id: crypto.randomUUID(), contactId, score, status: 'new' });
    setLoading(false);
    if (ok) { setContactId(''); setScore(0); onSuccess(); }
  };
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent><DialogHeader><DialogTitle>Add Lead (Flow 4)</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2"><Label>Contact</Label>
            <select className="border rounded px-3 py-2" value={contactId} onChange={(e) => setContactId(e.target.value)}>
              <option value="">Select contact</option>
              {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid gap-2"><Label>Score</Label><Input type="number" value={score} onChange={(e) => setScore(Number(e.target.value))} /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={handle} disabled={loading || !contactId}>{loading ? 'Saving…' : 'Save'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddInquiryDialog({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [details, setDetails] = useState(''); const [hotLead, setHotLead] = useState(false); const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    const ok = await insertInquiry({ id: crypto.randomUUID(), details, hotLead, status: 'new' });
    setLoading(false);
    if (ok) { setDetails(''); setHotLead(false); onSuccess(); }
  };
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent><DialogHeader><DialogTitle>Add Inquiry (Flow 2)</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2"><Label>Details</Label><Textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Inquiry details" /></div>
          <div className="flex items-center gap-2"><input type="checkbox" checked={hotLead} onChange={(e) => setHotLead(e.target.checked)} /><Label>Hot lead</Label></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={handle} disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddTicketDialog({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [subject, setSubject] = useState(''); const [description, setDescription] = useState(''); const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    const ok = await insertSupportTicket({ id: crypto.randomUUID(), subject, description, status: 'open', knownIssue: false });
    setLoading(false);
    if (ok) { setSubject(''); setDescription(''); onSuccess(); }
  };
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent><DialogHeader><DialogTitle>Add Support Ticket (Flow 5)</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2"><Label>Subject</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" /></div>
          <div className="grid gap-2"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={handle} disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddKbDialog({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [title, setTitle] = useState(''); const [content, setContent] = useState(''); const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    const ok = await insertKbArticle({ id: crypto.randomUUID(), title, content, keywords: [] });
    setLoading(false);
    if (ok) { setTitle(''); setContent(''); onSuccess(); }
  };
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent><DialogHeader><DialogTitle>Add KB Article (Flow 5)</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" /></div>
          <div className="grid gap-2"><Label>Content</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content" /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={handle} disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddCampaignDialog({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState(''); const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    const ok = await insertCampaign({ id: crypto.randomUUID(), name });
    setLoading(false);
    if (ok) { setName(''); onSuccess(); }
  };
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent><DialogHeader><DialogTitle>Add Campaign (Flow 6)</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Campaign name" /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={handle} disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddProjectDialog({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState(''); const [scope, setScope] = useState(''); const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    const ok = await insertProject({ id: crypto.randomUUID(), name, scope: scope || undefined, status: 'planning' });
    setLoading(false);
    if (ok) { setName(''); setScope(''); onSuccess(); }
  };
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent><DialogHeader><DialogTitle>Add Project (Flow 7)</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" /></div>
          <div className="grid gap-2"><Label>Scope</Label><Textarea value={scope} onChange={(e) => setScope(e.target.value)} placeholder="Scope" /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={handle} disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddFeatureDialog({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [title, setTitle] = useState(''); const [requirements, setRequirements] = useState(''); const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    const ok = await insertFeatureRequest({ id: crypto.randomUUID(), title, requirements: requirements || undefined, priority: 0, approvedForDev: false, status: 'backlog' });
    setLoading(false);
    if (ok) { setTitle(''); setRequirements(''); onSuccess(); }
  };
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent><DialogHeader><DialogTitle>Add Feature Request (Flow 9)</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" /></div>
          <div className="grid gap-2"><Label>Requirements</Label><Textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder="Requirements" /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={handle} disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddMarketingDialog({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [title, setTitle] = useState(''); const [content, setContent] = useState(''); const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    const ok = await insertMarketingAsset({ id: crypto.randomUUID(), title, content: content || undefined, status: 'draft', legalApproved: false });
    setLoading(false);
    if (ok) { setTitle(''); setContent(''); onSuccess(); }
  };
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent><DialogHeader><DialogTitle>Add Marketing Asset (Flow 10)</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" /></div>
          <div className="grid gap-2"><Label>Content</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content" /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={handle} disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CRM;
