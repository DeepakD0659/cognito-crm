-- CRM schema for 11-flow implementation (Flows 1-11)
-- Contacts: Flow 1, 2, 4, 6
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  company text,
  source text DEFAULT 'sales',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Leads: Flow 1-4, 6
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  score numeric(5,2) DEFAULT 0,
  status text NOT NULL CHECK (status IN ('new', 'nurture', 'qualified', 'closed_won', 'closed_lost')),
  assigned_to uuid,
  stage text CHECK (stage IN ('discovery', 'proposal', 'negotiation')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Opportunities: Flow 1, 2, 4, 6
CREATE TABLE IF NOT EXISTS public.opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  stage text NOT NULL CHECK (stage IN ('pipeline', 'negotiation', 'closed_won', 'closed_lost')),
  value numeric(12,2) DEFAULT 0,
  closed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Inquiries: Flow 2
CREATE TABLE IF NOT EXISTS public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  details text NOT NULL,
  hot_lead boolean DEFAULT false,
  assigned_to uuid,
  status text NOT NULL CHECK (status IN ('new', 'assigned', 'qualified', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- KB articles: Flow 5 (known-issue solutions)
CREATE TABLE IF NOT EXISTS public.kb_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  keywords text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Support tickets: Flow 5
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  user_id uuid,
  subject text NOT NULL,
  description text NOT NULL,
  assigned_to uuid,
  status text NOT NULL CHECK (status IN ('open', 'diagnosing', 'resolved')),
  known_issue boolean DEFAULT false,
  kb_article_id uuid REFERENCES public.kb_articles(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Campaigns: Flow 6
CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  launched_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Campaign leads: Flow 6
CREATE TABLE IF NOT EXISTS public.campaign_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  criteria_met boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(campaign_id, lead_id)
);

-- Projects: Flow 7
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  scope text,
  status text NOT NULL CHECK (status IN ('planning', 'executing', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Project milestones: Flow 7
CREATE TABLE IF NOT EXISTS public.project_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  reached_at timestamptz,
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Feature requests: Flow 9
CREATE TABLE IF NOT EXISTS public.feature_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  requirements text,
  priority int DEFAULT 0,
  approved_for_dev boolean DEFAULT false,
  status text NOT NULL CHECK (status IN ('backlog', 'approved', 'in_progress', 'deployed', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Marketing assets: Flow 10
CREATE TABLE IF NOT EXISTS public.marketing_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  status text NOT NULL CHECK (status IN ('draft', 'review', 'published')),
  legal_approved boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User profiles: Flow 8 (auth.users id stored as uuid; no FK to auth schema in migration to avoid cross-schema dependency)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY,
  role text NOT NULL DEFAULT 'CUSTOMER',
  permissions jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for CRM tables
CREATE INDEX IF NOT EXISTS idx_leads_contact_id ON public.leads(contact_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_opportunities_lead_id ON public.opportunities(lead_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON public.opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_inquiries_contact_id ON public.inquiries(contact_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_contact_id ON public.support_tickets(contact_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON public.support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_campaign_leads_campaign_id ON public.campaign_leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_leads_lead_id ON public.campaign_leads(lead_id);
CREATE INDEX IF NOT EXISTS idx_project_milestones_project_id ON public.project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_feature_requests_status ON public.feature_requests(status);
CREATE INDEX IF NOT EXISTS idx_feature_requests_approved_for_dev ON public.feature_requests(approved_for_dev);
CREATE INDEX IF NOT EXISTS idx_marketing_assets_status ON public.marketing_assets(status);
CREATE INDEX IF NOT EXISTS idx_marketing_assets_legal_approved ON public.marketing_assets(legal_approved);

-- RLS for CRM tables (dev: anon full access; production should use authenticated policies)
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon full access contacts" ON public.contacts FOR ALL USING (true);
CREATE POLICY "Anon full access leads" ON public.leads FOR ALL USING (true);
CREATE POLICY "Anon full access opportunities" ON public.opportunities FOR ALL USING (true);
CREATE POLICY "Anon full access inquiries" ON public.inquiries FOR ALL USING (true);
CREATE POLICY "Anon full access kb_articles" ON public.kb_articles FOR ALL USING (true);
CREATE POLICY "Anon full access support_tickets" ON public.support_tickets FOR ALL USING (true);
CREATE POLICY "Anon full access campaigns" ON public.campaigns FOR ALL USING (true);
CREATE POLICY "Anon full access campaign_leads" ON public.campaign_leads FOR ALL USING (true);
CREATE POLICY "Anon full access projects" ON public.projects FOR ALL USING (true);
CREATE POLICY "Anon full access project_milestones" ON public.project_milestones FOR ALL USING (true);
CREATE POLICY "Anon full access feature_requests" ON public.feature_requests FOR ALL USING (true);
CREATE POLICY "Anon full access marketing_assets" ON public.marketing_assets FOR ALL USING (true);
CREATE POLICY "Anon full access user_profiles" ON public.user_profiles FOR ALL USING (true);
