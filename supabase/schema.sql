-- ====================================================================
-- TRAVESÍA - PRODUCTION DATABASE SCHEMA (POSTGRESQL / SUPABASE)
-- "Frena el ruido. Encuentra dirección. Haz el trabajo."
-- Canonical Production Schema v2.1
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CORE USERS & PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  location TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'coach', 'admin')),
  membership_status TEXT NOT NULL DEFAULT 'TRIAL' CHECK (membership_status IN ('TRIAL', 'ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED')),
  focus_areas TEXT[] DEFAULT '{}',
  streak_days INTEGER DEFAULT 0,
  completed_sessions_count INTEGER DEFAULT 0,
  reflection_minutes INTEGER DEFAULT 0,
  current_week INTEGER DEFAULT 1 CHECK (current_week BETWEEN 1 AND 4),
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRICING PLANS & MEMBERSHIPS
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

CREATE TABLE IF NOT EXISTS public.membership_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  membership_id UUID REFERENCES public.memberships(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COMMUNITY, CHANNELS, POSTS & INTERACTIONS
CREATE TABLE IF NOT EXISTS public.communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  tagline TEXT,
  banner_url TEXT,
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.community_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT DEFAULT 'message-circle',
  is_locked BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, slug)
);

CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.post_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction_type TEXT DEFAULT 'like',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id, reaction_type)
);

CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- 5. EVENTS & ATTENDANCE
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 35,
  type TEXT DEFAULT 'standard' CHECK (type IN ('standard', 'coaching', 'special')),
  host_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  host_name TEXT NOT NULL DEFAULT 'Alberto Calvo',
  host_avatar TEXT,
  theme TEXT,
  prompt TEXT,
  zoom_meeting_url TEXT,
  recording_url TEXT,
  capacity INTEGER DEFAULT 100,
  status TEXT DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED')),
  attendees_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.event_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  joined_zoom_at TIMESTAMPTZ,
  attended BOOLEAN DEFAULT false,
  replay_opened_at TIMESTAMPTZ,
  replay_completed_at TIMESTAMPTZ,
  UNIQUE(event_id, user_id)
);

-- 6. SESSION RECORDINGS (ARCHIVE METADATA)
CREATE TABLE IF NOT EXISTS public.session_recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  storage_path TEXT,
  file_size_bytes BIGINT,
  duration_seconds INTEGER DEFAULT 2100,
  thumbnail_path TEXT,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('NOT_AVAILABLE', 'PROCESSING', 'AVAILABLE', 'ERROR')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration TEXT NOT NULL DEFAULT '35 min',
  category TEXT NOT NULL DEFAULT 'El Presente',
  video_url TEXT,
  thumbnail_url TEXT,
  zoom_recording_url TEXT,
  recording_strategy TEXT NOT NULL DEFAULT 'HOSTED' CHECK (recording_strategy IN ('HOSTED', 'EXTERNAL')),
  external_url TEXT,
  views_count INTEGER DEFAULT 0,
  is_member_only BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. FORMACIÓN / LESSONS & CURRICULUM
CREATE TABLE IF NOT EXISTS public.lesson_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID REFERENCES public.lesson_sections(id) ON DELETE CASCADE,
  module_title TEXT NOT NULL,
  title TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 15,
  video_url TEXT,
  audio_url TEXT,
  content_markdown TEXT NOT NULL,
  exercise_instruction TEXT,
  reflection_question TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'completed' CHECK (status IN ('available', 'in_progress', 'completed')),
  user_reflection TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS public.daily_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_text TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Ruido', 'Emociones', 'Visión', 'Obstáculos', 'Acción', 'Relaciones', 'Propósito', 'Espiritualidad', 'Disciplina')),
  week INTEGER DEFAULT 1 CHECK (week BETWEEN 1 AND 4),
  difficulty TEXT DEFAULT 'suave' CHECK (difficulty IN ('suave', 'profundo', 'desafiante')),
  active BOOLEAN DEFAULT true,
  scheduled_for_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.four_week_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cycle_number INTEGER NOT NULL,
  week_1_theme TEXT DEFAULT 'EL PRESENTE: Construir la práctica diaria',
  week_2_theme TEXT DEFAULT 'LA VISIÓN: Qué vida buscas construir',
  week_3_theme TEXT DEFAULT 'LOS OBSTÁCULOS: Qué se interpone en tu camino',
  week_4_theme TEXT DEFAULT 'EL TRABAJO: Lo que realmente requerirá de ti',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cycle_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  cycle_id UUID REFERENCES public.four_week_cycles(id) ON DELETE CASCADE,
  current_week INTEGER DEFAULT 1 CHECK (current_week BETWEEN 1 AND 4),
  week_1_completed BOOLEAN DEFAULT false,
  week_2_completed BOOLEAN DEFAULT false,
  week_3_completed BOOLEAN DEFAULT false,
  week_4_completed BOOLEAN DEFAULT false,
  final_reflection TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, cycle_id)
);

-- 8. EMOTIONS (REFERENCE CATALOG)
CREATE TABLE IF NOT EXISTS public.emotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL CHECK (name IN ('DOLOR', 'SOLEDAD', 'TRISTEZA', 'IRA', 'MIEDO', 'VERGÜENZA', 'CULPA', 'ALEGRÍA')),
  prompt_question TEXT NOT NULL,
  description TEXT
);

-- 9. JOURNAL SESSIONS (STRICTLY PRIVATE - ENFORCED BY ROW LEVEL SECURITY)
CREATE TABLE IF NOT EXISTS public.journal_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  -- Movement 1: Desacelerar (Breathing, Silence, Gratitude)
  breathing_completed BOOLEAN DEFAULT false,
  silence_duration_seconds INTEGER DEFAULT 60,
  gratitude_items TEXT[] DEFAULT '{}',
  -- Movement 2: Descargar (Unfiltered brain dump)
  free_writing_1m TEXT,
  deep_writing_10m TEXT,
  focus_prompt_id UUID REFERENCES public.daily_prompts(id) ON DELETE SET NULL,
  focus_prompt_text TEXT,
  focus_prompt_answer TEXT,
  -- Movement 3: Nombrar la Realidad (Emotions, Vision, Identity)
  vision_sentence TEXT,
  identity_words TEXT[] DEFAULT '{}',
  -- Movement 4: Escuchar (Silent stillness / prayer)
  listening_notes TEXT,
  listening_duration_seconds INTEGER DEFAULT 90,
  -- Movement 5: Actuar (Concrete commitment / release)
  action_type TEXT DEFAULT 'action' CHECK (action_type IN ('action', 'release')),
  action_commitment TEXT,
  total_duration_minutes INTEGER DEFAULT 30,
  status TEXT DEFAULT 'completed' CHECK (status IN ('draft', 'completed')),
  current_movement_step INTEGER DEFAULT 1 CHECK (current_movement_step BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.journal_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  movement_number INTEGER NOT NULL CHECK (movement_number BETWEEN 1 AND 5),
  movement_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_emotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.journal_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emotion_category TEXT NOT NULL CHECK (emotion_category IN ('DOLOR', 'SOLEDAD', 'TRISTEZA', 'IRA', 'MIEDO', 'VERGÜENZA', 'CULPA', 'ALEGRÍA')),
  related_to TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.action_commitments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.journal_sessions(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('action', 'release')),
  commitment_text TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'released')),
  due_date DATE DEFAULT CURRENT_DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.journal_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  current_movement_step INTEGER DEFAULT 1 CHECK (current_movement_step BETWEEN 1 AND 5),
  draft_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. DAILY 7-DAY CHALLENGE PROGRESS
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

-- 11. BOOKS & RESOURCES
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Propósito', 'Relaciones', 'Espiritualidad', 'Hábitos', 'Disciplina', 'Mentalidad', 'Journaling', 'Liderazgo')),
  summary TEXT NOT NULL,
  key_takeaways TEXT[] DEFAULT '{}',
  cover_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. NOTIFICATIONS & PREFERENCES
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('comment', 'reply', 'mention', 'event', 'session', 'lesson', 'milestone', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  daily_reminder_enabled BOOLEAN DEFAULT true,
  daily_reminder_time TIME DEFAULT '07:00:00',
  session_reminder_enabled BOOLEAN DEFAULT true,
  community_notifications BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  role_title TEXT NOT NULL DEFAULT 'Superadmin',
  permissions TEXT[] DEFAULT '{"all"}',
  assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. BUSINESS, LEADS, REFERRALS, ANALYTICS & LOGS
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

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  source TEXT DEFAULT 'web',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- ====================================================================
-- FUNCTIONS, TRIGGERS & RLS
-- ====================================================================

CREATE OR REPLACE FUNCTION public.is_admin(user_uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_uid AND role = 'admin'
  ) OR EXISTS (
    SELECT 1 FROM public.admin_roles 
    WHERE user_id = user_uid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Insert Profile
  INSERT INTO public.profiles (
    id, 
    name, 
    email, 
    avatar_url, 
    role, 
    membership_status,
    current_week, 
    onboarding_completed
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
    'member',
    'TRIAL',
    1,
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    email = EXCLUDED.email;

  -- 2. Insert User Preferences
  BEGIN
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- 3. Create trial membership record safely
  BEGIN
    -- Ensure trial plan exists
    INSERT INTO public.pricing_plans (id, name, description, price_monthly, is_active)
    VALUES ('trial', 'Prueba de 7 Días', 'Acceso de prueba guiada', 0.00, true)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.memberships (user_id, plan_id, status, started_at, expires_at)
    VALUES (NEW.id, 'trial', 'TRIAL', NOW(), NOW() + INTERVAL '7 days')
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.four_week_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_emotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- 14. CONTINUOUS RETENTION JOURNEY & ONGOING CYCLES
-- ====================================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS journey_started_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS foundation_completed_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_cycle_id TEXT DEFAULT 'cycle-relaciones';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_cycle_week INTEGER DEFAULT 2;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS billing_started_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 month');

CREATE TABLE IF NOT EXISTS public.ongoing_cycles (
  id TEXT PRIMARY KEY,
  cycle_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  theme TEXT NOT NULL,
  description TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('active', 'upcoming', 'completed')),
  weeks JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cycle_reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cycle_id TEXT NOT NULL REFERENCES public.ongoing_cycles(id) ON DELETE CASCADE,
  cycle_title TEXT NOT NULL,
  discovered TEXT NOT NULL,
  changed TEXT NOT NULL,
  carrying_forward TEXT NOT NULL,
  explore_next TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ongoing_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_reflections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ongoing cycles viewable by everyone" ON public.ongoing_cycles;
CREATE POLICY "Ongoing cycles viewable by everyone"
  ON public.ongoing_cycles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins manage ongoing cycles" ON public.ongoing_cycles;
CREATE POLICY "Admins manage ongoing cycles"
  ON public.ongoing_cycles FOR ALL
  USING (auth.jwt()->>'role' = 'admin' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

DROP POLICY IF EXISTS "Users can view own reflections" ON public.cycle_reflections;
CREATE POLICY "Users can view own reflections"
  ON public.cycle_reflections FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own reflections" ON public.cycle_reflections;
CREATE POLICY "Users can insert own reflections"
  ON public.cycle_reflections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

