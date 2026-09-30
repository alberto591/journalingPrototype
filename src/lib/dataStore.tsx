import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Profile, 
  Channel, 
  Post, 
  Comment, 
  EventItem, 
  Lesson, 
  Book, 
  SessionRecording, 
  JournalSession, 
  DailyPrompt,
  NotificationItem,
  OnboardingData,
  OngoingCycle,
  CycleReflection,
  MemberHistoryItem,
  ContinuousRetentionMetrics
} from '../types';
import { 
  DEMO_CURRENT_USER, 
  DEMO_ADMIN_USER, 
  DEMO_MEMBERS, 
  DEMO_CHANNELS, 
  DEMO_POSTS, 
  DEMO_COMMENTS, 
  DEMO_EVENTS 
} from '../data/demo/seedData';
import { INITIAL_DAILY_PROMPTS } from './dailyPromptsData';
import { LESSONS_DATA, BOOKS_DATA, RECORDINGS_DATA } from './seedData';
import { isSupabaseConfigured, supabase } from './supabase';
import { authService } from '../services/authService';
import { journalService, calculateDynamicStreak } from '../services/journalService';
import { communityService } from '../services/communityService';
import { eventsService } from '../services/eventsService';
import { promptsService, getDeterministicDailyPrompt } from '../services/promptsService';
import { adminService } from '../services/adminService';
import { journeyService, INITIAL_ONGOING_CYCLES } from '../services/journeyService';
import { recordingsService } from '../services/recordingsService';
import { zoomService } from '../services/zoomService';

interface DataStoreContextType {
  currentUser: Profile;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  error: string | null;

  // Real Auth Methods
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error: string | null }>;

  // Dev Demo Switcher (Only active when not using live Supabase credentials)
  switchUserRole: (role: 'member' | 'admin' | 'new') => void;
  updateCurrentUserProfile: (updates: Partial<Profile>) => Promise<void>;
  
  // Channels & Posts
  channels: Channel[];
  posts: Post[];
  comments: Comment[];
  createPost: (channelId: string, title: string, content: string, tags?: string[]) => Promise<Post | null>;
  addComment: (postId: string, content: string) => Promise<Comment | null>;
  toggleLikePost: (postId: string) => Promise<void>;
  toggleBookmarkPost: (postId: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;

  // Events
  events: EventItem[];
  nextUpcomingEvent: EventItem | null;
  toggleRegisterEvent: (eventId: string) => Promise<void>;
  addEvent: (event: Omit<EventItem, 'id' | 'attendees_count' | 'user_is_registered'>) => Promise<void>;
  updateEvent: (eventId: string, updates: Partial<EventItem>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  trackZoomJoinClick: (eventId: string) => Promise<void>;

  // Lessons
  lessons: Lesson[];
  completeLesson: (lessonId: string) => void;

  // Library & Archive
  books: Book[];
  recordings: SessionRecording[];
  uploadSessionRecording: (eventId: string, file: File, title?: string, description?: string, durationSeconds?: number) => Promise<{ recording: SessionRecording | null; error: string | null }>;
  deleteSessionRecording: (recordingId: string, storagePath?: string, eventId?: string) => Promise<{ success: boolean; error: string | null }>;


  // Prompts & Daily Practice
  dailyPrompts: DailyPrompt[];
  todayPrompt: DailyPrompt;
  addDailyPrompt: (prompt: Omit<DailyPrompt, 'id' | 'created_at'>) => Promise<void>;
  toggleDailyPromptActive: (promptId: string) => Promise<void>;

  // Journal (STRICTLY PRIVATE - PROTECTED BY RLS)
  journalSessions: JournalSession[];
  saveJournalSession: (session: Omit<JournalSession, 'id' | 'created_at' | 'user_id'>) => Promise<JournalSession | null>;
  todayJournalSession: JournalSession | null;
  journalDraft: (Partial<JournalSession> & { currentMovementStep?: number }) | null;
  saveJournalDraft: (draft: Partial<JournalSession> & { currentMovementStep?: number }) => void;
  getPrivateJournalHistory: () => JournalSession[];

  // Dynamic Real Statistics
  computedStreakDays: number;
  computedCompletedSessionsCount: number;
  computedReflectionMinutes: number;

  // Members
  members: Profile[];

  // Notifications
  notifications: NotificationItem[];
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;

  // Continuous Retention Journey & Ongoing Cycles
  ongoingCycles: OngoingCycle[];
  currentCommunityCycle: OngoingCycle;
  currentGlobalCommunityWeek: number;
  personalJourneyProgress: {
    journeyStartedAt: string;
    daysSinceStart: number;
    personalWeek: number;
    personalDayInWeek: number;
    current_week: number;
    current_day: number;
    isFoundationCompleted: boolean;
    foundationCompletedAt: string | null;
  };
  billingCycle: {
    billingStartedAt: string;
    nextBillingDate: string;
    daysUntilRenewal: number;
  };
  memberTimeline: MemberHistoryItem[];
  continuousRetentionMetrics: ContinuousRetentionMetrics;
  completeFoundation: () => Promise<void>;
  submitCycleReflection: (cycleId: string, cycleTitle: string, reflection: { discovered: string; changed: string; carrying_forward: string; explore_next: string }) => Promise<void>;
  addOngoingCycle: (cycle: OngoingCycle) => Promise<void>;
  updateOngoingCycle: (id: string, updates: Partial<OngoingCycle>) => Promise<void>;

  // Onboarding
  onboardingData: OnboardingData | null;
  saveOnboarding: (data: OnboardingData) => void;
}

const DataStoreContext = createContext<DataStoreContextType | null>(null);

const STORAGE_KEY_PREFIX = 'travesia_v2_';

const DEFAULT_EMPTY_USER: Profile = {
  id: '',
  name: 'Miembro',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  bio: '',
  role: 'member',
  membership_status: 'TRIAL',
  focus_areas: [],
  created_at: new Date().toISOString(),
  streak_days: 0,
  completed_sessions_count: 0,
  reflection_minutes: 0,
  current_week: 1,
  onboarding_completed: false,
  journey_started_at: new Date().toISOString(),
  foundation_completed_at: null,
  current_cycle_id: 'cycle-relaciones',
  current_cycle_week: 2,
  current_day: 1,
  billing_started_at: new Date().toISOString(),
  next_billing_date: new Date(Date.now() + 30 * 24 * 3600000).toISOString(),
};

export const DataStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isDemoMode = !isSupabaseConfigured;

  // 1. Current User state (Only load real user if saved, never default to demo Mateo Silva)
  const [currentUser, setCurrentUser] = useState<Profile>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}user`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.id !== DEMO_CURRENT_USER.id && parsed.name !== 'Mateo Silva') {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_EMPTY_USER;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}user`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Boolean(parsed && parsed.id && parsed.id !== DEMO_CURRENT_USER.id && parsed.name !== 'Mateo Silva');
      }
    } catch {}
    return false;
  });

  // 2. Data states: Clean real storage without fake mock posts/comments
  const [members, setMembers] = useState<Profile[]>([]);
  const [channels, setChannels] = useState<Channel[]>(DEMO_CHANNELS); // Channel categories
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}posts`);
    return saved ? JSON.parse(saved) : [];
  });
  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}comments`);
    return saved ? JSON.parse(saved) : [];
  });
  const [events, setEvents] = useState<EventItem[]>(() => {
    if (isSupabaseConfigured) {
      try {
        const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}events`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.some(e => e.id === 'evt-1')) {
            return [];
          }
          return parsed;
        }
      } catch {}
      return [];
    }
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}events`);
    return saved ? JSON.parse(saved) : DEMO_EVENTS;
  });
  const [lessons, setLessons] = useState<Lesson[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}lessons`);
    return saved ? JSON.parse(saved) : LESSONS_DATA;
  });
  const [books] = useState<Book[]>(BOOKS_DATA);
  const [recordings, setRecordings] = useState<SessionRecording[]>(() => {
    if (isSupabaseConfigured) {
      try {
        const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}recordings`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.some(r => r.id === 'rec-1')) {
            return [];
          }
          return parsed;
        }
      } catch {}
      return [];
    }
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}recordings`);
      return saved ? JSON.parse(saved) : RECORDINGS_DATA;
    } catch {
      return RECORDINGS_DATA;
    }
  });

  const [dailyPrompts, setDailyPrompts] = useState<DailyPrompt[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}prompts`);
    return saved ? JSON.parse(saved) : INITIAL_DAILY_PROMPTS;
  });

  // Private Journal Sessions (Zero mock data: only user's own actual sessions)
  const [userJournalSessions, setUserJournalSessions] = useState<JournalSession[]>(() => {
    if (!currentUser.id) return [];
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}journals_${currentUser.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Journal Draft
  const [journalDraft, setJournalDraft] = useState<(Partial<JournalSession> & { currentMovementStep?: number }) | null>(() => {
    return currentUser.id ? journalService.getDraft(currentUser.id) : null;
  });

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Onboarding
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}onboarding`);
    return saved ? JSON.parse(saved) : null;
  });

  // Listen to auth state changes from Supabase
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        let userProfile = profile ? (profile as Profile) : null;
        try {
          const { data: adminRecord } = await supabase
            .from('admin_roles')
            .select('id')
            .eq('user_id', session.user.id)
            .maybeSingle();
          if (adminRecord) {
            userProfile = userProfile ? { ...userProfile, role: 'admin' } : null;
          }
        } catch {}

        if (userProfile) {
          setCurrentUser(userProfile);
        } else {
          // If profile could not be loaded via RLS, still update role if in admin_roles
          try {
            const { data: adminRecord } = await supabase
              .from('admin_roles')
              .select('id')
              .eq('user_id', session.user.id)
              .maybeSingle();
            if (adminRecord) {
              setCurrentUser(prev => ({ ...prev, role: 'admin', membership_status: 'ACTIVE' }));
            }
          } catch {}
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load initial data from Supabase if configured, or use local state
  useEffect(() => {
    async function loadInitial() {
      setIsLoading(true);
      if (isSupabaseConfigured) {
        try {
          // Check Supabase session via getUser()
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user) {
            setIsAuthenticated(true);
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userData.user.id)
              .maybeSingle();

            let userProfile = profile ? (profile as Profile) : null;
            try {
              const { data: adminRecord } = await supabase
                .from('admin_roles')
                .select('id')
                .eq('user_id', userData.user.id)
                .maybeSingle();
              if (adminRecord) {
                userProfile = userProfile ? { ...userProfile, role: 'admin' } : null;
              }
            } catch {}

            if (userProfile) {
              setCurrentUser(userProfile);
            } else {
              try {
                const { data: adminRecord } = await supabase
                  .from('admin_roles')
                  .select('id')
                  .eq('user_id', userData.user.id)
                  .maybeSingle();
                if (adminRecord) {
                  setCurrentUser(prev => ({ ...prev, role: 'admin', membership_status: 'ACTIVE' }));
                }
              } catch {}
            }
          } else {
            setIsAuthenticated(false);
          }

          // Fetch real channels, posts, prompts, events, recordings, and registered members
          const [chRes, pRes, prRes, evRes, recRes, membersRes] = await Promise.all([
            communityService.fetchChannels(),
            communityService.fetchPosts(),
            promptsService.fetchPrompts(),
            eventsService.fetchEvents(currentUser.id),
            recordingsService.fetchRecordings(),
            supabase.from('profiles').select('*').order('created_at', { ascending: false }),
          ]);

          if (chRes.channels) setChannels(chRes.channels);
          if (pRes.posts) setPosts(pRes.posts);
          if (prRes.prompts && prRes.prompts.length > 0) setDailyPrompts(prRes.prompts);
          if (evRes.events) setEvents(evRes.events);
          if (recRes.recordings) setRecordings(recRes.recordings);
          if (membersRes.data) setMembers(membersRes.data as Profile[]);

          // Fetch real private journal sessions for user
          if (currentUser.id) {
            const { sessions } = await journalService.fetchUserSessions(currentUser.id);
            if (sessions.length > 0) setUserJournalSessions(sessions);
          }
        } catch (err: any) {
          setError(err?.message || 'Error al conectar con la base de datos.');
        }
      }
      setIsLoading(false);
    }

    loadInitial();
  }, [currentUser.id]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}user`, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}posts`, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}events`, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}recordings`, JSON.stringify(recordings));
  }, [recordings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}journals_${currentUser.id}`, JSON.stringify(userJournalSessions));
  }, [userJournalSessions, currentUser.id]);


  // -------------------------------------------------------------
  // REAL DYNAMIC STATISTICS COMPUTATION
  // -------------------------------------------------------------
  const sessionDates = useMemo(() => {
    return userJournalSessions.map(s => s.date);
  }, [userJournalSessions]);

  const computedStreakDays = useMemo(() => {
    return calculateDynamicStreak(sessionDates);
  }, [sessionDates]);

  const computedCompletedSessionsCount = useMemo(() => {
    return userJournalSessions.filter(s => s.status === 'completed').length;
  }, [userJournalSessions]);

  const computedReflectionMinutes = useMemo(() => {
    const sessionMins = userJournalSessions.reduce((acc, s) => acc + (s.total_duration_minutes || 30), 0);
    const lessonMins = lessons.filter(l => l.status === 'completed').reduce((acc, l) => acc + (l.duration_minutes || 15), 0);
    return sessionMins + lessonMins;
  }, [userJournalSessions, lessons]);

  // Today's Journal Session
  const todayStr = new Date().toISOString().split('T')[0];
  const todayJournalSession = useMemo(() => {
    return userJournalSessions.find(s => s.date === todayStr && s.status === 'completed') || null;
  }, [userJournalSessions, todayStr]);

  // Next upcoming event calculated dynamically
  const nextUpcomingEvent = useMemo(() => {
    const now = new Date().getTime();
    const upcoming = events
      .filter(e => e.status === 'upcoming' || e.status === 'live')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return upcoming[0] || null;
  }, [events]);

  // Deterministic Today's Daily Prompt based on day of year & active week
  const todayPrompt = useMemo(() => {
    return getDeterministicDailyPrompt(dailyPrompts, new Date(), currentUser.current_week);
  }, [dailyPrompts, currentUser.current_week]);

  // -------------------------------------------------------------
  // CONTINUOUS RETENTION JOURNEY & ONGOING CYCLES
  // -------------------------------------------------------------
  const [ongoingCycles, setOngoingCycles] = useState<OngoingCycle[]>(() => {
    return journeyService.fetchOngoingCycles();
  });

  const currentCommunityCycle = useMemo(() => {
    return ongoingCycles.find(c => c.status === 'active') || ongoingCycles[0] || INITIAL_ONGOING_CYCLES[0];
  }, [ongoingCycles]);

  const currentGlobalCommunityWeek = 2;

  const personalJourneyProgress = useMemo(() => {
    return journeyService.calculatePersonalFoundationProgress(currentUser);
  }, [currentUser]);

  const billingCycle = useMemo(() => {
    return journeyService.calculateBillingDates(currentUser);
  }, [currentUser]);

  const memberTimeline = useMemo(() => {
    return journeyService.getMemberTimeline(currentUser);
  }, [currentUser, ongoingCycles]);

  const continuousRetentionMetrics = useMemo(() => {
    return journeyService.calculateContinuousRetentionMetrics(members, userJournalSessions);
  }, [members, userJournalSessions]);

  const completeFoundation = async () => {
    const updated = journeyService.completeFoundationJourney(currentUser);
    setCurrentUser(updated);
  };

  const submitCycleReflection = async (
    cycleId: string,
    cycleTitle: string,
    reflection: { discovered: string; changed: string; carrying_forward: string; explore_next: string }
  ) => {
    journeyService.submitCycleReflection(currentUser, cycleId, cycleTitle, reflection);
    setCurrentUser(prev => ({ ...prev }));
  };

  const addOngoingCycle = async (newCycle: OngoingCycle) => {
    const updated = [...ongoingCycles, newCycle];
    setOngoingCycles(updated);
    journeyService.saveOngoingCycles(updated);
  };

  const updateOngoingCycle = async (id: string, updates: Partial<OngoingCycle>) => {
    const updated = ongoingCycles.map(c => c.id === id ? { ...c, ...updates } : c);
    setOngoingCycles(updated);
    journeyService.saveOngoingCycles(updated);
  };

  // -------------------------------------------------------------
  // REAL AUTH METHODS
  // -------------------------------------------------------------
  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    const { user, error } = await authService.signUp(email, password, name);
    setIsLoading(false);
    if (error) {
      return { success: false, error };
    }
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      return { success: true, error: null };
    }
    return { success: false, error: 'No se pudo crear el usuario.' };
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const { user, error } = await authService.signIn(email, password);
    setIsLoading(false);
    if (error) {
      return { success: false, error };
    }
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      return { success: true, error: null };
    }
    return { success: false, error: 'Credenciales inválidas.' };
  };

  const signOut = async () => {
    await authService.signOut();
    setIsAuthenticated(false);
    setCurrentUser(DEFAULT_EMPTY_USER);
    try {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}user`);
    } catch {}
  };

  const resetPassword = async (email: string) => {
    const { error } = await authService.resetPassword(email);
    return { success: !error, error };
  };

  // Dev Demo Switcher
  const switchUserRole = (role: 'member' | 'admin' | 'new') => {
    if (role === 'admin') {
      setCurrentUser(DEMO_ADMIN_USER);
    } else if (role === 'new') {
      const newUser: Profile = {
        id: 'usr-nuevo-' + Date.now(),
        name: 'Nuevo Miembro',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        bio: 'Iniciando mi primera semana en TRAVESÍA.',
        location: 'España',
        role: 'member',
        focus_areas: ['Propósito', 'Disciplina'],
        created_at: new Date().toISOString(),
        streak_days: 0,
        completed_sessions_count: 0,
        reflection_minutes: 0,
        current_week: 1,
        onboarding_completed: false,
      };
      setCurrentUser(newUser);
    } else {
      setCurrentUser(DEMO_CURRENT_USER);
    }
  };

  const updateCurrentUserProfile = async (updates: Partial<Profile>) => {
    setCurrentUser(prev => ({ ...prev, ...updates }));
    if (isSupabaseConfigured) {
      await supabase
        .from('profiles')
        .update(updates)
        .eq('id', currentUser.id);
    }
  };

  // -------------------------------------------------------------
  // COMMUNITY METHODS
  // -------------------------------------------------------------
  const createPost = async (channelId: string, title: string, content: string, tags?: string[]) => {
    if (isSupabaseConfigured) {
      const { post, error: pErr } = await communityService.createPost(currentUser.id, channelId, title, content, tags);
      if (post) {
        setPosts(prev => [post, ...prev]);
        return post;
      }
    }

    // Local / fallback
    const newPost: Post = {
      id: `post-${Date.now()}`,
      channel_id: channelId,
      author_id: currentUser.id,
      author: currentUser,
      title: title.trim() || undefined,
      content,
      created_at: new Date().toISOString(),
      likes_count: 0,
      comments_count: 0,
      user_has_liked: false,
      user_has_bookmarked: false,
      tags: tags || ['Reflexión'],
    };
    setPosts(prev => [newPost, ...prev]);
    return newPost;
  };

  const addComment = async (postId: string, content: string) => {
    if (isSupabaseConfigured) {
      const { comment } = await communityService.addComment(currentUser.id, postId, content);
      if (comment) {
        setComments(prev => [...prev, comment]);
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p));
        return comment;
      }
    }

    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      post_id: postId,
      author_id: currentUser.id,
      author: currentUser,
      content,
      created_at: new Date().toISOString(),
      likes_count: 0,
      user_has_liked: false,
    };
    setComments(prev => [...prev, newComment]);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p));
    return newComment;
  };

  const toggleLikePost = async (postId: string) => {
    if (isSupabaseConfigured) {
      await communityService.toggleLike(postId, currentUser.id);
    }
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const isLiked = p.user_has_liked;
      return {
        ...p,
        user_has_liked: !isLiked,
        likes_count: isLiked ? Math.max(0, p.likes_count - 1) : p.likes_count + 1,
      };
    }));
  };

  const toggleBookmarkPost = async (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        user_has_bookmarked: !p.user_has_bookmarked,
      };
    }));
  };

  const deletePost = async (postId: string) => {
    if (isSupabaseConfigured) {
      await communityService.deletePost(postId);
    }
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  // -------------------------------------------------------------
  // EVENTS METHODS
  // -------------------------------------------------------------
  const toggleRegisterEvent = async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    if (isSupabaseConfigured) {
      if (event.user_is_registered) {
        await eventsService.cancelRegistration(eventId, currentUser.id);
      } else {
        await eventsService.registerForEvent(eventId, currentUser.id);
      }
    }

    setEvents(prev => prev.map(e => {
      if (e.id !== eventId) return e;
      const isReg = e.user_is_registered;
      return {
        ...e,
        user_is_registered: !isReg,
        attendees_count: isReg ? Math.max(0, e.attendees_count - 1) : e.attendees_count + 1,
      };
    }));
  };

  const addEvent = async (eventData: Omit<EventItem, 'id' | 'attendees_count' | 'user_is_registered'>) => {
    // Verify server-side admin privilege
    await adminService.assertAdmin(currentUser.id);

    if (isSupabaseConfigured) {
      const { event } = await eventsService.createEvent(eventData);
      if (event) {
        setEvents(prev => [event, ...prev]);
        return;
      }
    }

    const newEvent: EventItem = {
      ...eventData,
      id: `evt-${Date.now()}`,
      attendees_count: 1,
      user_is_registered: true,
    };
    setEvents(prev => [newEvent, ...prev]);
  };

  const updateEvent = async (eventId: string, updates: Partial<EventItem>) => {
    await adminService.assertAdmin(currentUser.id);
    if (isSupabaseConfigured) {
      await eventsService.updateEvent(eventId, updates);
    }
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, ...updates } : e));
  };

  const deleteEvent = async (eventId: string) => {
    await adminService.assertAdmin(currentUser.id);
    if (isSupabaseConfigured) {
      await eventsService.deleteEvent(eventId);
    }
    setEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const trackZoomJoinClick = async (eventId: string) => {
    zoomService.trackZoomJoinClick(eventId, currentUser.id || 'anonymous');
    if (currentUser.id) {
      await eventsService.recordZoomJoinClick(eventId, currentUser.id);
    }
  };

  const uploadSessionRecording = async (
    eventId: string,
    file: File,
    title?: string,
    description?: string,
    durationSeconds?: number
  ) => {
    await adminService.assertAdmin(currentUser.id);
    const targetEvent = events.find(e => e.id === eventId);
    const recTitle = title || (targetEvent ? targetEvent.title : 'Sesión en Directo');
    const recDesc = description || (targetEvent ? targetEvent.description : '');
    const recDuration = durationSeconds || (targetEvent ? (targetEvent.duration_minutes || 35) * 60 : 2100);

    const res = await recordingsService.uploadRecording({
      eventId,
      title: recTitle,
      description: recDesc,
      category: targetEvent?.theme || 'El Presente',
      strategy: 'HOSTED',
      file,
      durationSeconds: recDuration,
      uploadedByUserId: currentUser.id,
    });

    if (res.recording) {
      setRecordings(prev => [res.recording!, ...prev.filter(r => r.event_id !== eventId)]);
      setEvents(prev => prev.map(e => e.id === eventId ? {
        ...e,
        recording_id: res.recording!.id,
        recording_url: res.recording!.storage_path,
      } : e));
    }

    return res;
  };

  const deleteSessionRecording = async (recordingId: string, storagePath?: string, eventId?: string) => {
    await adminService.assertAdmin(currentUser.id);
    const res = await recordingsService.deleteRecording(recordingId, storagePath);
    if (res.success) {
      setRecordings(prev => prev.filter(r => r.id !== recordingId));
      if (eventId) {
        setEvents(prev => prev.map(e => e.id === eventId ? {
          ...e,
          recording_id: undefined,
          recording_url: undefined,
        } : e));
      }
    }
    return res;
  };


  // -------------------------------------------------------------
  // LESSONS
  // -------------------------------------------------------------
  const completeLesson = (lessonId: string) => {
    setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, status: 'completed' } : l));
  };

  // -------------------------------------------------------------
  // PROMPTS METHODS
  // -------------------------------------------------------------
  const addDailyPrompt = async (promptData: Omit<DailyPrompt, 'id' | 'created_at'>) => {
    await adminService.assertAdmin(currentUser.id);

    if (isSupabaseConfigured) {
      const { prompt } = await promptsService.createPrompt(promptData);
      if (prompt) {
        setDailyPrompts(prev => [prompt, ...prev]);
        return;
      }
    }

    const newP: DailyPrompt = {
      ...promptData,
      id: `prompt-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setDailyPrompts(prev => [newP, ...prev]);
  };

  const toggleDailyPromptActive = async (promptId: string) => {
    await adminService.assertAdmin(currentUser.id);
    const target = dailyPrompts.find(p => p.id === promptId);
    if (!target) return;

    if (isSupabaseConfigured) {
      await promptsService.togglePromptActive(promptId, !target.active);
    }

    setDailyPrompts(prev => prev.map(p => p.id === promptId ? { ...p, active: !p.active } : p));
  };

  // -------------------------------------------------------------
  // JOURNAL SESSIONS (STRICTLY PRIVATE - PROTECTED BY RLS)
  // -------------------------------------------------------------
  const saveJournalDraft = (draft: Partial<JournalSession> & { currentMovementStep?: number }) => {
    setJournalDraft(draft);
    journalService.saveDraft(currentUser.id, draft);
  };

  const saveJournalSession = async (sessionData: Omit<JournalSession, 'id' | 'created_at' | 'user_id'>) => {
    const { session } = await journalService.saveCompletedSession(currentUser.id, sessionData);

    if (session) {
      setUserJournalSessions(prev => {
        const filtered = prev.filter(s => s.date !== session.date);
        return [session, ...filtered];
      });

      // Clear draft
      setJournalDraft(null);
      journalService.clearDraft(currentUser.id);

      return session;
    }
    return null;
  };

  const getPrivateJournalHistory = () => {
    // STRICT PRIVACY: Returns only current authenticated user's records
    return userJournalSessions.filter(s => s.user_id === currentUser.id);
  };

  // -------------------------------------------------------------
  // NOTIFICATIONS & ONBOARDING
  // -------------------------------------------------------------
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const saveOnboarding = (data: OnboardingData) => {
    setOnboardingData(data);
    localStorage.setItem(`${STORAGE_KEY_PREFIX}onboarding`, JSON.stringify(data));
    setCurrentUser(prev => ({
      ...prev,
      onboarding_completed: true,
      focus_areas: data.life_areas_to_change.slice(0, 4),
    }));
    if (isSupabaseConfigured) {
      supabase.from('profiles').update({
        onboarding_completed: true,
        focus_areas: data.life_areas_to_change.slice(0, 4),
      }).eq('id', currentUser.id);
    }
  };

  const effectiveUser = useMemo(() => ({
    ...currentUser,
    streak_days: computedStreakDays,
    completed_sessions_count: computedCompletedSessionsCount,
    reflection_minutes: computedReflectionMinutes,
  }), [currentUser, computedStreakDays, computedCompletedSessionsCount, computedReflectionMinutes]);

  return (
    <DataStoreContext.Provider
      value={{
        currentUser: effectiveUser,
        isAuthenticated,
        isLoading,
        isDemoMode,
        error,
        signUp,
        signIn,
        signOut,
        resetPassword,
        switchUserRole,
        updateCurrentUserProfile,
        channels,
        posts,
        comments,
        createPost,
        addComment,
        toggleLikePost,
        toggleBookmarkPost,
        deletePost,
        events,
        nextUpcomingEvent,
        toggleRegisterEvent,
        addEvent,
        updateEvent,
        deleteEvent,
        trackZoomJoinClick,
        lessons,
        completeLesson,
        books,
        recordings,
        uploadSessionRecording,
        deleteSessionRecording,

        dailyPrompts,
        todayPrompt,
        addDailyPrompt,
        toggleDailyPromptActive,
        journalSessions: userJournalSessions,
        saveJournalSession,
        todayJournalSession,
        journalDraft,
        saveJournalDraft,
        getPrivateJournalHistory,
        computedStreakDays,
        computedCompletedSessionsCount,
        computedReflectionMinutes,
        members,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        onboardingData,
        saveOnboarding,
        ongoingCycles,
        currentCommunityCycle,
        currentGlobalCommunityWeek,
        personalJourneyProgress,
        billingCycle,
        memberTimeline,
        continuousRetentionMetrics,
        completeFoundation,
        submitCycleReflection,
        addOngoingCycle,
        updateOngoingCycle,
      }}
    >
      {children}
    </DataStoreContext.Provider>
  );
};

export const useDataStore = () => {
  const context = useContext(DataStoreContext);
  if (!context) {
    throw new Error('useDataStore must be used within a DataStoreProvider');
  }
  return context;
};
