-- ====================================================================
-- TRAVESÍA - Database Schema (PostgreSQL / Supabase)
-- "Frena el ruido. Encuentra dirección. Haz el trabajo."
-- Version: 2.0 (Production Verified & RLS Secured)
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  location TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'coach', 'admin')),
  focus_areas TEXT[] DEFAULT '{}',
  streak_days INTEGER DEFAULT 0,
  completed_sessions_count INTEGER DEFAULT 0,
  reflection_minutes INTEGER DEFAULT 0,
  current_week INTEGER DEFAULT 1 CHECK (current_week BETWEEN 1 AND 4),
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. COMMUNITIES
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  tagline TEXT,
  banner_url TEXT,
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COMMUNITY MEMBERS
CREATE TABLE IF NOT EXISTS community_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- 4. CHANNELS
CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT DEFAULT 'message-circle',
  is_locked BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, slug)
);

-- 5. POSTS
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
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

-- 6. COMMENTS
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. POST REACTIONS
CREATE TABLE IF NOT EXISTS post_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type TEXT DEFAULT 'like',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id, reaction_type)
);

-- 8. BOOKMARKS
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- 9. EVENTS
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 35,
  type TEXT DEFAULT 'standard' CHECK (type IN ('standard', 'coaching')),
  host_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  host_name TEXT NOT NULL DEFAULT 'Alberto Calvo',
  host_avatar TEXT,
  description TEXT,
  meeting_url TEXT,
  recording_url TEXT,
  capacity INTEGER DEFAULT 100,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'finished')),
  attendees_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. EVENT ATTENDEES
CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  attended BOOLEAN DEFAULT false,
  UNIQUE(event_id, user_id)
);

-- 11. LESSON SECTIONS
CREATE TABLE IF NOT EXISTS lesson_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. LESSONS
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID REFERENCES lesson_sections(id) ON DELETE CASCADE,
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

-- 13. LESSON PROGRESS
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'completed' CHECK (status IN ('available', 'in_progress', 'completed')),
  user_reflection TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- 14. DAILY PROMPTS
CREATE TABLE IF NOT EXISTS daily_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_text TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Ruido', 'Emociones', 'Visión', 'Obstáculos', 'Acción', 'Relaciones', 'Propósito', 'Espiritualidad', 'Disciplina')),
  week INTEGER DEFAULT 1 CHECK (week BETWEEN 1 AND 4),
  difficulty TEXT DEFAULT 'suave' CHECK (difficulty IN ('suave', 'profundo', 'desafiante')),
  active BOOLEAN DEFAULT true,
  scheduled_for_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. FOUR WEEK CYCLES
CREATE TABLE IF NOT EXISTS four_week_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cycle_number INTEGER NOT NULL,
  week_1_theme TEXT DEFAULT 'EL PRESENTE: Construir la práctica diaria',
  week_2_theme TEXT DEFAULT 'LA VISIÓN: Qué vida buscas construir',
  week_3_theme TEXT DEFAULT 'LOS OBSTÁCULOS: Qué se interpone en tu camino',
  week_4_theme TEXT DEFAULT 'EL TRABAJO: Lo que realmente requerirá de ti',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. CYCLE PROGRESS
CREATE TABLE IF NOT EXISTS cycle_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  cycle_id UUID REFERENCES four_week_cycles(id) ON DELETE CASCADE,
  current_week INTEGER DEFAULT 1 CHECK (current_week BETWEEN 1 AND 4),
  week_1_completed BOOLEAN DEFAULT false,
  week_2_completed BOOLEAN DEFAULT false,
  week_3_completed BOOLEAN DEFAULT false,
  week_4_completed BOOLEAN DEFAULT false,
  final_reflection TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, cycle_id)
);

-- 17. EMOTIONS (REFERENCE CATALOG)
CREATE TABLE IF NOT EXISTS emotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL CHECK (name IN ('DOLOR', 'SOLEDAD', 'TRISTEZA', 'IRA', 'MIEDO', 'VERGÜENZA', 'CULPA', 'ALEGRÍA')),
  prompt_question TEXT NOT NULL,
  description TEXT
);

-- 18. JOURNAL SESSIONS (STRICTLY PRIVATE - PROTECTED BY RLS)
CREATE TABLE IF NOT EXISTS journal_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  breathing_completed BOOLEAN DEFAULT false,
  silence_duration_seconds INTEGER DEFAULT 60,
  free_writing_1m TEXT,
  deep_writing_10m TEXT,
  focus_prompt_id UUID REFERENCES daily_prompts(id) ON DELETE SET NULL,
  focus_prompt_text TEXT,
  focus_prompt_answer TEXT,
  listening_notes TEXT,
  listening_duration_seconds INTEGER DEFAULT 90,
  action_type TEXT DEFAULT 'action' CHECK (action_type IN ('action', 'release')),
  action_commitment TEXT,
  total_duration_minutes INTEGER DEFAULT 30,
  status TEXT DEFAULT 'completed' CHECK (status IN ('draft', 'completed')),
  current_movement_step INTEGER DEFAULT 1 CHECK (current_movement_step BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. JOURNAL ENTRIES (SUB-ELEMENTS)
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES journal_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  movement_number INTEGER NOT NULL CHECK (movement_number BETWEEN 1 AND 5),
  movement_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. USER EMOTIONS (PER SESSION)
CREATE TABLE IF NOT EXISTS user_emotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES journal_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  emotion_category TEXT NOT NULL CHECK (emotion_category IN ('DOLOR', 'SOLEDAD', 'TRISTEZA', 'IRA', 'MIEDO', 'VERGÜENZA', 'CULPA', 'ALEGRÍA')),
  related_to TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. ACTION COMMITMENTS
CREATE TABLE IF NOT EXISTS action_commitments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES journal_sessions(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('action', 'release')),
  commitment_text TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'released')),
  due_date DATE DEFAULT CURRENT_DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. BOOKS
CREATE TABLE IF NOT EXISTS books (
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

-- 23. RESOURCES
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. SESSION RECORDINGS (ARCHIVE)
CREATE TABLE IF NOT EXISTS session_recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  duration TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Journaling', 'Visión', 'Obstáculos', 'Trabajo', 'Relaciones', 'Propósito', 'Espiritualidad')),
  description TEXT NOT NULL,
  video_url TEXT,
  thumbnail_url TEXT,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('comment', 'reply', 'mention', 'event', 'session', 'lesson', 'milestone')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. USER PREFERENCES
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  daily_reminder_enabled BOOLEAN DEFAULT true,
  daily_reminder_time TIME DEFAULT '07:00:00',
  session_reminder_enabled BOOLEAN DEFAULT true,
  community_notifications BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 27. ADMIN ROLES
CREATE TABLE IF NOT EXISTS admin_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  role_title TEXT NOT NULL DEFAULT 'Superadmin',
  permissions TEXT[] DEFAULT '{"all"}',
  assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- HELPER FUNCTIONS FOR SERVER-SIDE AUTHORIZATION
-- ====================================================================

-- Function to check if a user is an admin server-side
CREATE OR REPLACE FUNCTION is_admin(user_uid UUID)
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
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url, role, current_week, onboarding_completed)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
    'member',
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
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ====================================================================
-- INDEXES FOR PERFORMANCE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_posts_channel_id ON posts(channel_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_journal_sessions_user_date ON journal_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_journal_sessions_status ON journal_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_daily_prompts_category_week ON daily_prompts(category, week);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE four_week_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_emotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2. COMMUNITIES & CHANNELS
CREATE POLICY "Communities viewable by members"
  ON communities FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Channels viewable by members"
  ON channels FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage channels"
  ON channels FOR ALL USING (is_admin(auth.uid()));

-- 3. POSTS
CREATE POLICY "Posts viewable by authenticated users"
  ON posts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert own posts"
  ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE USING (auth.uid() = author_id OR is_admin(auth.uid()));
CREATE POLICY "Users and admins can delete posts"
  ON posts FOR DELETE USING (auth.uid() = author_id OR is_admin(auth.uid()));

-- 4. COMMENTS
CREATE POLICY "Comments viewable by authenticated users"
  ON comments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert own comments"
  ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users and admins can delete comments"
  ON comments FOR DELETE USING (auth.uid() = author_id OR is_admin(auth.uid()));

-- 5. REACTIONS & BOOKMARKS
CREATE POLICY "Reactions viewable by all"
  ON post_reactions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users manage own reactions"
  ON post_reactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own bookmarks"
  ON bookmarks FOR ALL USING (auth.uid() = user_id);

-- 6. STRICT PRIVACY (PROTECTED BY RLS): JOURNAL SESSIONS & ENTRIES
-- NO OTHER USER OR COMMUNITY MEMBER OR UNAUTHORIZED ROLE CAN SELECT/INSERT/UPDATE/DELETE
CREATE POLICY "Users can view own journal sessions"
  ON journal_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journal sessions"
  ON journal_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal sessions"
  ON journal_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal sessions"
  ON journal_sessions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own journal entries"
  ON journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journal entries"
  ON journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal entries"
  ON journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal entries"
  ON journal_entries FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own emotions"
  ON user_emotions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own emotions"
  ON user_emotions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own emotions"
  ON user_emotions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own emotions"
  ON user_emotions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own commitments"
  ON action_commitments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own commitments"
  ON action_commitments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own commitments"
  ON action_commitments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own commitments"
  ON action_commitments FOR DELETE USING (auth.uid() = user_id);

-- 7. EVENTS & ATTENDANCE
CREATE POLICY "Events viewable by authenticated users"
  ON events FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage events"
  ON events FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Event attendees manageable by own user"
  ON event_attendees FOR ALL USING (auth.uid() = user_id);

-- 8. LESSONS & PROGRESS
CREATE POLICY "Lesson sections viewable by authenticated users"
  ON lesson_sections FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage lesson sections"
  ON lesson_sections FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Lessons viewable by authenticated users"
  ON lessons FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage lessons"
  ON lessons FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Lesson progress manageable by own user"
  ON lesson_progress FOR ALL USING (auth.uid() = user_id);

-- 9. DAILY PROMPTS
CREATE POLICY "Daily prompts viewable by authenticated users"
  ON daily_prompts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage daily prompts"
  ON daily_prompts FOR ALL USING (is_admin(auth.uid()));

-- 10. FOUR-WEEK CYCLES & PROGRESS
CREATE POLICY "Four week cycles viewable by all"
  ON four_week_cycles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Cycle progress manageable by own user"
  ON cycle_progress FOR ALL USING (auth.uid() = user_id);

-- 11. BOOKS, RESOURCES & ARCHIVE
CREATE POLICY "Books viewable by authenticated users"
  ON books FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage books"
  ON books FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Resources viewable by authenticated users"
  ON resources FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage resources"
  ON resources FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Session recordings viewable by authenticated users"
  ON session_recordings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage session recordings"
  ON session_recordings FOR ALL USING (is_admin(auth.uid()));

-- 12. NOTIFICATIONS & PREFERENCES
CREATE POLICY "Notifications manageable by own user"
  ON notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Preferences manageable by own user"
  ON user_preferences FOR ALL USING (auth.uid() = user_id);

-- 13. ADMIN ROLES (SERVER-SIDE SECURED)
CREATE POLICY "Admin roles viewable only by admins"
  ON admin_roles FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admin roles manageable only by superadmins"
  ON admin_roles FOR ALL USING (is_admin(auth.uid()));

-- ====================================================================
-- PHASE 3: BUSINESS VALIDATION, LEADS, REFERRALS & CONTENT ENGINE
-- ====================================================================

-- 14. LEADS (ACQUISITION & FUNNEL TRACKING)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  name TEXT,
  source TEXT NOT NULL DEFAULT 'Direct',
  campaign TEXT,
  landing_page TEXT DEFAULT '/',
  trial_started BOOLEAN DEFAULT false,
  trial_completed BOOLEAN DEFAULT false,
  converted BOOLEAN DEFAULT false,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leads insertable by public/anyone" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Leads viewable only by admins" ON leads FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Leads updatable only by admins" ON leads FOR UPDATE USING (is_admin(auth.uid()));

-- 15. REFERRALS
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'converted')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Referrals readable by referrer or admin" ON referrals FOR SELECT USING (auth.uid() = referrer_user_id OR is_admin(auth.uid()));
CREATE POLICY "Referrals insertable by authenticated users" ON referrals FOR INSERT WITH CHECK (auth.uid() = referrer_user_id);

-- 16. CONTENT CREATOR ENGINE (EDITORIAL CALENDAR)
CREATE TABLE IF NOT EXISTS content_items (
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
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Content items manageable by admins only" ON content_items FOR ALL USING (is_admin(auth.uid()));

-- 17. FEEDBACK RESPONSES
CREATE TABLE IF NOT EXISTS feedback_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  day_milestone INTEGER NOT NULL CHECK (day_milestone IN (3, 7, 14, 28)),
  most_useful TEXT NOT NULL,
  what_to_change TEXT NOT NULL,
  mindset_shift TEXT NOT NULL,
  would_return TEXT NOT NULL CHECK (would_return IN ('yes', 'maybe', 'no')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE feedback_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Feedback insertable by own user" ON feedback_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Feedback viewable by own user and admin" ON feedback_responses FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

-- 18. EMAIL EVENT LOGS (ARCHITECTURE DISPATCHER)
CREATE TABLE IF NOT EXISTS email_event_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  dispatched_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE email_event_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Email event logs viewable by admins only" ON email_event_logs FOR SELECT USING (is_admin(auth.uid()));

-- 19. ANALYTICS EVENTS
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Analytics events insertable by all" ON analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Analytics events viewable by admins only" ON analytics_events FOR SELECT USING (is_admin(auth.uid()));

-- 20. BUSINESS SETTINGS
CREATE TABLE IF NOT EXISTS business_settings (
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
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business settings readable by all authenticated" ON business_settings FOR SELECT USING (true);
CREATE POLICY "Business settings updatable by admins only" ON business_settings FOR ALL USING (is_admin(auth.uid()));

