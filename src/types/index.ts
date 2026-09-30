export type UserRole = 'member' | 'coach' | 'admin';

export type MembershipStatus = 'FREE' | 'TRIAL' | 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';

export interface Profile {
  id: string;
  name: string;
  email?: string;
  avatar_url: string;
  bio: string;
  location?: string;
  role: UserRole;
  focus_areas: string[];
  created_at: string;
  streak_days: number;
  completed_sessions_count: number;
  reflection_minutes: number;
  current_week: number; // 1 to 4 in the 4-week cycle
  onboarding_completed: boolean;

  // Phase 3: Real Membership & Business Model
  membership_status?: MembershipStatus;
  membership_started_at?: string;
  membership_ends_at?: string;
  trial_started_at?: string;
  trial_ends_at?: string;
  referral_code?: string;
  referred_by_code?: string;
  acquisition_source?: AcquisitionSource;

  // Stripe Architecture Preparation
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_status?: string;
  price_id?: string;
  current_period_start?: string;
  current_period_end?: string;
}

export interface Channel {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon_name: string;
  is_locked?: boolean;
  order_index: number;
}

export interface Post {
  id: string;
  channel_id: string;
  author_id: string;
  author: Profile;
  title?: string;
  content: string;
  created_at: string;
  updated_at?: string;
  is_pinned?: boolean;
  is_featured?: boolean;
  likes_count: number;
  comments_count: number;
  user_has_liked?: boolean;
  user_has_bookmarked?: boolean;
  tags?: string[];
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  author: Profile;
  content: string;
  created_at: string;
  likes_count: number;
  user_has_liked?: boolean;
  parent_id?: string | null;
}

export type EmotionCategory = 
  | 'DOLOR'
  | 'SOLEDAD'
  | 'TRISTEZA'
  | 'IRA'
  | 'MIEDO'
  | 'VERGÜENZA'
  | 'CULPA'
  | 'ALEGRÍA';

export interface EmotionSelection {
  category: EmotionCategory;
  related_to: string; // What person, situation or part of life is behind this
}

export interface JournalSession {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  created_at: string;
  // Movement 1: Frenar (Slow Down)
  breathing_completed: boolean;
  silence_duration_seconds: number;
  gratitude_items?: string[]; // 4 specific things from the last 24h (from Holy Work email)
  // Movement 2: Limpiar el ruido
  free_writing_1m?: string;
  deep_writing_10m?: string;
  focus_prompt_id?: string;
  focus_prompt_text?: string;
  focus_prompt_answer?: string;
  // Movement 3: Sentir lo que sientes
  emotions: EmotionSelection[];
  // Movement 4: Escuchar
  listening_notes?: string;
  listening_duration_seconds: number;
  // Movement 5: Actuar (Act)
  vision_sentence?: string;   // 3-month vision re-read (from Holy Work email)
  identity_words?: string;    // Identity word(s) to become (from Holy Work email)
  action_type: 'action' | 'release'; // 'Acción' or 'Algo que soltar'
  action_commitment: string;
  // Metadata
  total_duration_minutes: number;
  status: 'completed' | 'draft';
}

export interface DailyPrompt {
  id: string;
  prompt_text: string;
  category: 'Ruido' | 'Emociones' | 'Visión' | 'Obstáculos' | 'Acción' | 'Relaciones' | 'Propósito' | 'Espiritualidad' | 'Disciplina';
  week: number; // 1 to 4
  difficulty: 'suave' | 'profundo' | 'desafiante';
  active: boolean;
  created_at: string;
}

export type LiveSessionStatus = 
  | 'SCHEDULED' 
  | 'LIVE' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'REPLAY_AVAILABLE';

export type EventStatus = LiveSessionStatus | 'upcoming' | 'live' | 'finished';

export type EventType = 'standard' | 'coaching'; // standard 35m, coaching 45-60m

export type RecordingStatus = 
  | 'NOT_AVAILABLE' 
  | 'PROCESSING' 
  | 'AVAILABLE' 
  | 'No grabada' 
  | 'Subiendo' 
  | 'Disponible' 
  | 'Error';

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string; // ISO or YYYY-MM-DD
  start_time?: string;
  end_time?: string;
  time_display: string;
  duration_minutes: number;
  type: EventType;
  host?: string;
  host_name: string;
  host_avatar: string;
  weekly_theme?: string;
  prompt?: string;
  zoom_meeting_url?: string;
  zoom_host_url?: string;
  meeting_url?: string; // Backwards compatible alias
  recording_status?: RecordingStatus;
  recording_url?: string;
  recording_storage_path?: string;
  thumbnail_url?: string;
  status: EventStatus;
  attendees_count: number;
  user_is_registered?: boolean;
}

export interface Lesson {
  id: string;
  module_id: string;
  module_title: string;
  title: string;
  duration_minutes: number;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  video_url?: string;
  audio_url?: string;
  content_markdown: string;
  exercise_instruction?: string;
  reflection_question?: string;
  order_index: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: 'Propósito' | 'Relaciones' | 'Espiritualidad' | 'Hábitos' | 'Disciplina' | 'Mentalidad' | 'Journaling' | 'Liderazgo';
  summary: string;
  key_takeaways: string[];
  cover_url?: string;
  order_index: number;
}

export type RecordingStrategy = 'HOSTED' | 'EXTERNAL';

export interface SessionRecording {
  id: string;
  event_id?: string;
  title: string;
  description: string;
  date: string;
  duration: string;
  duration_seconds?: number;
  file_size_bytes?: number;
  category: 'Todas' | 'El Presente' | 'La Visión' | 'Los Obstáculos' | 'El Trabajo' | 'Relaciones' | 'Propósito' | 'Espiritualidad' | 'Journaling' | string;
  storage_path?: string;
  thumbnail_path?: string;
  thumbnail_url?: string;
  video_url?: string;
  uploaded_by?: string;
  uploaded_at?: string;
  status: RecordingStatus;
  zoom_recording_url?: string;
  recording_strategy?: RecordingStrategy;
  external_url?: string;
  views_count: number;
  is_member_only?: boolean;
}

export interface ZoomJoinClick {
  id: string;
  event_id: string;
  user_id: string;
  clicked_at: string;
  interaction_type: 'zoom_join_clicked' | 'join_click';
  label: 'Intentó unirse';
}

export type ReplayAction = 'replay_opened' | 'replay_started' | 'replay_completed';

export interface ReplayTrackingEvent {
  id: string;
  recording_id: string;
  event_id?: string;
  user_id: string;
  action: ReplayAction;
  watch_duration_seconds?: number;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  type: 'comment' | 'reply' | 'mention' | 'event' | 'session' | 'lesson' | 'milestone';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}

export interface OnboardingData {
  current_state: string;
  life_areas_to_change: string[];
  desired_direction: string;
  selected_obstacles: string[];
  commitment_text: string;
  first_action: string;
  completed_at?: string;
}

// -------------------------------------------------------------
// PHASE 3: BUSINESS VALIDATION & GROWTH TYPES
// -------------------------------------------------------------

export type AcquisitionSource = 
  | 'Instagram'
  | 'TikTok'
  | 'YouTube'
  | 'Newsletter'
  | 'Referral'
  | 'Direct'
  | 'Other';

export interface Lead {
  id: string;
  email: string;
  name: string;
  source: AcquisitionSource;
  campaign?: string;
  landing_page: string;
  created_at: string;
  trial_started?: boolean;
  trial_completed?: boolean;
  converted?: boolean;
  converted_at?: string;
}

export interface Referral {
  id: string;
  referrer_user_id: string;
  referred_user_id?: string;
  referral_code: string;
  status: 'pending' | 'converted';
  created_at: string;
}

export type ContentPlatform = 'Instagram' | 'TikTok' | 'YouTube' | 'Newsletter' | 'Community';
export type ContentStatus = 'Idea' | 'Draft' | 'Ready' | 'Published';

export interface ContentItem {
  id: string;
  title: string;
  body: string;
  platform: ContentPlatform;
  status: ContentStatus;
  scheduled_date?: string;
  published_date?: string;
  cta?: string;
  campaign?: string;
  created_at: string;
}

export type FeedbackMilestone = 3 | 7 | 14 | 28;

export interface FeedbackResponse {
  id: string;
  user_id: string;
  user_name?: string;
  day_milestone: FeedbackMilestone;
  most_useful: string;
  what_to_change: string;
  mindset_shift: string;
  would_return: 'yes' | 'maybe' | 'no';
  created_at: string;
}

export type AttendanceStatus = 
  | 'REGISTERED' 
  | 'JOIN_CLICKED' 
  | 'ATTENDED' 
  | 'REPLAY_WATCHED' 
  | 'registered' 
  | 'joined' 
  | 'completed' 
  | 'missed';

export interface AttendanceRecord {
  id: string;
  event_id: string;
  user_id: string;
  status: AttendanceStatus;
  joined_at?: string;
  created_at: string;
}

export interface BusinessSettings {
  business_experiment_mode: boolean;
  founding_membership_price_monthly: number;
  standard_membership_price_monthly: number;
  annual_discount_months: number;
  limited_seats_count: number;
  whatsapp_group_url?: string;
  telegram_url?: string;
  discord_url?: string;
}

export type EmailEventType = 
  | 'Welcome'
  | 'First practice'
  | 'Practice incomplete'
  | 'Session tomorrow'
  | 'Session starting soon'
  | 'Session recording available'
  | 'Day 3'
  | 'Day 7'
  | 'Week completed'
  | 'Trial ending'
  | 'Membership activated'
  | 'Membership cancelled';

export interface EmailEventLog {
  id: string;
  user_id: string;
  user_email: string;
  event_type: EmailEventType;
  payload: Record<string, any>;
  dispatched_at: string;
}

export type AnalyticsEventType =
  | 'landing_view'
  | 'signup_started'
  | 'signup_completed'
  | 'trial_started'
  | 'trial_day_completed'
  | 'onboarding_completed'
  | 'journal_started'
  | 'journal_completed'
  | 'live_session_viewed'
  | 'live_session_joined'
  | 'lesson_completed'
  | 'community_post_created'
  | 'community_comment_created'
  | 'membership_page_viewed'
  | 'checkout_started'
  | 'subscription_started'
  | 'subscription_cancelled';

export interface AnalyticsEvent {
  id: string;
  event_type: AnalyticsEventType;
  user_id?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

// -------------------------------------------------------------
// PHASE 4: CUSTOMER INTERVIEWS & PRODUCT LOG TYPES
// -------------------------------------------------------------

export interface CustomerInterview {
  id: string;
  user_id: string;
  user_name: string;
  what_made_you_join: string;
  what_expected: string;
  most_valuable: string;
  hardest_part: string;
  what_made_you_return: string;
  what_almost_made_you_quit: string;
  what_would_you_change: string;
  would_pay_again: 'yes' | 'maybe' | 'no';
  fair_price_opinion: string;
  would_recommend: boolean;
  created_at: string;
}

export interface ProductLogEntry {
  id: string;
  observation: string;
  problem: string;
  hypothesis: string;
  change_applied: string;
  measurement_plan: string;
  status: 'OBSERVED' | 'TESTING' | 'KEPT' | 'REMOVED';
  created_at: string;
}

export interface UserPreferences {
  id?: string;
  user_id: string;
  daily_reminder_enabled: boolean;
  daily_reminder_time: string;
  session_reminder_enabled: boolean;
  community_notifications: boolean;
  email_notifications: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MembershipRecord {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'TRIAL' | 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';
  started_at: string;
  expires_at?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  created_at: string;
  updated_at: string;
}



