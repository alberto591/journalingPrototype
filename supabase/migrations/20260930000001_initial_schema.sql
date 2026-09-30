-- ====================================================================
-- TRAVESÍA MIGRATION 001: INITIAL BASELINE SCHEMA
-- ====================================================================
-- PostgreSQL schema for TRAVESÍA production
-- Version: 2.1 (Production Baseline)
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. PROFILES
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

-- 3. COMMUNITIES
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

-- 4. COMMUNITY MEMBERS
CREATE TABLE IF NOT EXISTS public.community_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- 5. CHANNELS
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

-- 6. POSTS
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

-- 7. COMMENTS
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

-- 8. POST REACTIONS
CREATE TABLE IF NOT EXISTS public.post_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction_type TEXT DEFAULT 'like',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id, reaction_type)
);

-- 9. BOOKMARKS
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- 10. EVENTS
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

-- 11. EVENT ATTENDEES (SEPARATE TRACKING: REGISTERED, JOIN CLICK, ATTENDED)
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

-- 12. LESSON SECTIONS
CREATE TABLE IF NOT EXISTS public.lesson_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. LESSONS
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

-- 14. LESSON PROGRESS
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'completed' CHECK (status IN ('available', 'in_progress', 'completed')),
  user_reflection TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- 15. DAILY PROMPTS
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

-- 16. FOUR WEEK CYCLES (JOURNEY CYCLES)
CREATE TABLE IF NOT EXISTS public.four_week_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cycle_number INTEGER NOT NULL,
  week_1_theme TEXT DEFAULT 'EL PRESENTE: Construir la práctica diaria',
  week_2_theme TEXT DEFAULT 'LA VISIÓN: Qué vida buscas construir',
  week_3_theme TEXT DEFAULT 'LOS OBSTÁCULOS: Qué se interpone en tu camino',
  week_4_theme TEXT DEFAULT 'EL TRABAJO: Lo que realmente requerirá de ti',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. CYCLE PROGRESS (JOURNEY PROGRESS)
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

-- 18. EMOTIONS (REFERENCE CATALOG)
CREATE TABLE IF NOT EXISTS public.emotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL CHECK (name IN ('DOLOR', 'SOLEDAD', 'TRISTEZA', 'IRA', 'MIEDO', 'VERGÜENZA', 'CULPA', 'ALEGRÍA')),
  prompt_question TEXT NOT NULL,
  description TEXT
);

-- 19. JOURNAL SESSIONS (STRICTLY PRIVATE - ENFORCED BY ROW LEVEL SECURITY)
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

-- 20. JOURNAL ENTRIES (SUB-ELEMENTS)
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.journal_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  movement_number INTEGER NOT NULL CHECK (movement_number BETWEEN 1 AND 5),
  movement_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. USER EMOTIONS (PER SESSION)
CREATE TABLE IF NOT EXISTS public.user_emotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.journal_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emotion_category TEXT NOT NULL CHECK (emotion_category IN ('DOLOR', 'SOLEDAD', 'TRISTEZA', 'IRA', 'MIEDO', 'VERGÜENZA', 'CULPA', 'ALEGRÍA')),
  related_to TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. ACTION COMMITMENTS
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

-- 23. BOOKS
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

-- 24. RESOURCES
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. NOTIFICATIONS
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

-- 26. USER PREFERENCES
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

-- 27. ADMIN ROLES (SERVER-SIDE SECURED)
CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  role_title TEXT NOT NULL DEFAULT 'Superadmin',
  permissions TEXT[] DEFAULT '{"all"}',
  assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- HELPER FUNCTIONS FOR SERVER-SIDE AUTHORIZATION & TRIGGERS
-- ====================================================================

-- Function to check if a user is an admin server-side
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

-- Function to automatically handle new user registration in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
  );

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_posts_channel_id ON public.posts(channel_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON public.events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_journal_sessions_user_date ON public.journal_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_journal_sessions_status ON public.journal_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read);
