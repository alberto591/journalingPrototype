-- ====================================================================
-- TRAVESÍA MIGRATION 002: MEMBERSHIPS, BUSINESS, LEADS, ANALYTICS
-- ====================================================================

-- 1. PRICING PLANS
CREATE TABLE IF NOT EXISTS public.pricing_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly NUMERIC(10, 2) NOT NULL,
  price_annual NUMERIC(10, 2),
  features TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Plans
INSERT INTO public.pricing_plans (id, name, description, price_monthly, price_annual, features, is_active)
VALUES 
  ('trial', 'Prueba de 7 Días', 'Acceso completo a la experiencia guiada de 7 días', 0.00, 0.00, ARRAY['7 días de reto guiado', 'Acceso a sesiones en vivo', 'Comunidad de silencio'], true),
  ('founding', 'Miembro Fundador', 'Tarifa protegida de por vida para los primeros 20 miembros', 29.00, 290.00, ARRAY['Precio protegido de por vida', 'Acceso diario a directos Zoom', 'Archivo completo de grabaciones', 'Comunidad y directos'], true),
  ('standard', 'Membresía Mensual', 'Acceso completo mensual a Travesía', 39.00, 390.00, ARRAY['Acceso diario a directos Zoom', 'Archivo completo de grabaciones', 'Comunidad y biblioteca'], true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_monthly = EXCLUDED.price_monthly,
  price_annual = EXCLUDED.price_annual;

-- 2. MEMBERSHIPS
CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES public.pricing_plans(id) DEFAULT 'founding',
  status TEXT NOT NULL DEFAULT 'TRIAL' CHECK (status IN ('TRIAL', 'ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. MEMBERSHIP EVENTS LOG
CREATE TABLE IF NOT EXISTS public.membership_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  membership_id UUID REFERENCES public.memberships(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- e.g. 'trial_started', 'activated', 'renewed', 'paused', 'cancelled', 'expired'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. LEADS (ACQUISITION & FUNNEL TRACKING)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  name TEXT,
  source TEXT NOT NULL DEFAULT 'Direct' CHECK (source IN ('Instagram', 'TikTok', 'YouTube', 'Newsletter', 'Referral', 'Direct', 'Other')),
  campaign TEXT,
  landing_page TEXT DEFAULT '/',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  trial_started BOOLEAN DEFAULT false,
  trial_completed BOOLEAN DEFAULT false,
  converted BOOLEAN DEFAULT false,
  converted_at TIMESTAMPTZ
);

-- 5. REFERRALS (ATTRIBUTION)
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_code TEXT NOT NULL,
  referrer_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'converted')),
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. DAILY CHALLENGE (7-DAY CHALLENGE PROGRESS)
CREATE TABLE IF NOT EXISTS public.daily_challenge_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  day INTEGER NOT NULL CHECK (day BETWEEN 1 AND 7),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  prompt TEXT NOT NULL,
  reflection TEXT,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'skipped')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, day)
);

-- 7. JOURNAL DRAFTS (IN-PROGRESS PERSISTENCE)
CREATE TABLE IF NOT EXISTS public.journal_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  current_movement_step INTEGER DEFAULT 1 CHECK (current_movement_step BETWEEN 1 AND 5),
  draft_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CUSTOMER INTERVIEWS (QUALITATIVE VALIDATION)
CREATE TABLE IF NOT EXISTS public.customer_interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  interviewer_name TEXT NOT NULL,
  interviewee_name TEXT NOT NULL,
  interviewee_email TEXT,
  notes TEXT NOT NULL,
  insights TEXT[] DEFAULT '{}',
  conducted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. FEEDBACK RESPONSES (MILESTONE FEEDBACK)
CREATE TABLE IF NOT EXISTS public.feedback_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_milestone INTEGER NOT NULL CHECK (day_milestone IN (3, 7, 14, 28)),
  most_useful TEXT NOT NULL,
  what_to_change TEXT NOT NULL,
  mindset_shift TEXT NOT NULL,
  would_return TEXT NOT NULL CHECK (would_return IN ('yes', 'maybe', 'no')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. CONTENT ITEMS (EDITORIAL ENGINE)
CREATE TABLE IF NOT EXISTS public.content_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('Instagram', 'TikTok', 'YouTube', 'Newsletter', 'Community')),
  status TEXT NOT NULL DEFAULT 'Idea' CHECK (status IN ('Idea', 'Draft', 'Ready', 'Published')),
  scheduled_date DATE,
  published_date TIMESTAMPTZ,
  cta TEXT,
  campaign TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ANALYTICS EVENTS (PRODUCT ANALYTICS)
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  source TEXT DEFAULT 'web',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. EMAIL EVENTS (LIFECYCLE LOGS)
CREATE TABLE IF NOT EXISTS public.email_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'event_created' CHECK (status IN ('event_created', 'sent', 'delivered', 'failed')),
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ
);

-- 13. BUSINESS SETTINGS
CREATE TABLE IF NOT EXISTS public.business_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_experiment_mode BOOLEAN DEFAULT true,
  founding_membership_price_monthly NUMERIC(10, 2) DEFAULT 29.00,
  standard_membership_price_monthly NUMERIC(10, 2) DEFAULT 39.00,
  annual_discount_months INTEGER DEFAULT 2,
  limited_seats_count INTEGER DEFAULT 20,
  whatsapp_group_url TEXT,
  telegram_url TEXT,
  discord_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_memberships_user_status ON public.memberships(user_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_events_user ON public.email_events(user_id, event_type);
