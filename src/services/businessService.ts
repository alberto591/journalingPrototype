import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { BusinessSettings, Profile, MembershipStatus } from '../types';

const SETTINGS_STORAGE_KEY = 'travesia_business_settings_v3';

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  business_experiment_mode: true,
  founding_membership_price_monthly: 29.00,
  standard_membership_price_monthly: 39.00,
  annual_discount_months: 2,
  limited_seats_count: 20,
  whatsapp_group_url: 'https://chat.whatsapp.com/sample-travesia-santuario',
  telegram_url: 'https://t.me/travesia_comunidad',
  discord_url: '',
};

export const businessService = {
  // Fetch current business settings
  async getSettings(): Promise<BusinessSettings> {
    if (!isSupabaseConfigured) {
      try {
        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : DEFAULT_BUSINESS_SETTINGS;
      } catch {
        return DEFAULT_BUSINESS_SETTINGS;
      }
    }

    try {
      const { data, error } = await supabase
        .from('business_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error || !data) return DEFAULT_BUSINESS_SETTINGS;
      return {
        business_experiment_mode: data.business_experiment_mode ?? true,
        founding_membership_price_monthly: Number(data.founding_membership_price_monthly) || 29,
        standard_membership_price_monthly: Number(data.standard_membership_price_monthly) || 39,
        annual_discount_months: data.annual_discount_months || 2,
        limited_seats_count: data.limited_seats_count || 20,
        whatsapp_group_url: data.whatsapp_group_url,
        telegram_url: data.telegram_url,
        discord_url: data.discord_url,
      };
    } catch {
      return DEFAULT_BUSINESS_SETTINGS;
    }
  },

  // Update business settings (Admin only)
  async updateSettings(settings: Partial<BusinessSettings>): Promise<BusinessSettings> {
    const current = await this.getSettings();
    const updated: BusinessSettings = { ...current, ...settings };

    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('business_settings')
          .upsert({
            id: '00000000-0000-0000-0000-000000000001',
            ...updated,
            updated_at: new Date().toISOString(),
          });
      } catch {}
    }

    return updated;
  },

  // Manual Membership Activation (for onboarding the first 10-20 founding members directly)
  async activateMembershipManually(params: {
    userId: string;
    durationDays: number; // 30, 90, or custom
    status?: MembershipStatus;
  }): Promise<{ success: boolean; error: string | null; updatedProfile?: Partial<Profile> }> {
    const now = new Date();
    const endsAt = new Date(now);
    endsAt.setDate(endsAt.getDate() + params.durationDays);

    const updates: Partial<Profile> = {
      membership_status: params.status || 'ACTIVE',
      membership_started_at: now.toISOString(),
      membership_ends_at: endsAt.toISOString(),
    };

    if (!isSupabaseConfigured) {
      // In local mode, update stored user if matching
      try {
        const stored = localStorage.getItem('travesia_v2_user');
        if (stored) {
          const user: Profile = JSON.parse(stored);
          if (user.id === params.userId) {
            const updatedUser = { ...user, ...updates };
            localStorage.setItem('travesia_v2_user', JSON.stringify(updatedUser));
          }
        }
      } catch {}
      return { success: true, error: null, updatedProfile: updates };
    }

    try {
      const { error } = await supabase.rpc('admin_activate_membership', {
        target_user_id: params.userId,
        new_status: params.status || 'ACTIVE',
        duration_days: params.durationDays || 30,
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, error: null, updatedProfile: updates };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error al activar membresía' };
    }
  },

  // Calculate real business & retention metrics from member and session data
  calculateRetentionMetrics(members: Profile[], sessions: any[], eventAttendees: any[]) {
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.membership_status === 'ACTIVE' || (!m.membership_status && m.completed_sessions_count > 0)).length;
    const trialMembers = members.filter(m => m.membership_status === 'TRIAL').length;

    // Attendance rate
    const totalSessionsRecorded = sessions.length;
    const membersWithSessions = new Set(sessions.map(s => s.user_id)).size;
    const sessionParticipationRate = totalMembers > 0 ? Math.round((membersWithSessions / totalMembers) * 100) : 0;

    // Week 1, 2, 4 distribution based on current_week
    const week1Count = members.filter(m => m.current_week === 1).length;
    const week2Count = members.filter(m => m.current_week === 2).length;
    const week3Count = members.filter(m => m.current_week === 3).length;
    const week4Count = members.filter(m => m.current_week >= 4).length;

    const week1Retention = totalMembers > 0 ? Math.round(((totalMembers - week1Count + members.filter(m => m.current_week === 1 && m.completed_sessions_count > 0).length) / totalMembers) * 100) : 100;
    const week2Retention = totalMembers > 0 ? Math.round(((week2Count + week3Count + week4Count) / totalMembers) * 100) : 0;
    const week4Retention = totalMembers > 0 ? Math.round((week4Count / totalMembers) * 100) : 0;

    // Cohort return metrics (Days 1, 3, 7, 14, 28)
    const day1Return = totalMembers > 0 ? Math.round((members.filter(m => m.completed_sessions_count >= 1).length / totalMembers) * 100) : 0;
    const day3Return = totalMembers > 0 ? Math.round((members.filter(m => m.completed_sessions_count >= 3 || m.streak_days >= 3).length / totalMembers) * 100) : 0;
    const day7Return = totalMembers > 0 ? Math.round((members.filter(m => m.current_week >= 2 || m.completed_sessions_count >= 5).length / totalMembers) * 100) : 0;
    const day14Return = totalMembers > 0 ? Math.round((members.filter(m => m.current_week >= 3 || m.completed_sessions_count >= 10).length / totalMembers) * 100) : 0;
    const day28Return = totalMembers > 0 ? Math.round((members.filter(m => m.current_week >= 4 || m.completed_sessions_count >= 20).length / totalMembers) * 100) : 0;

    // Live session attendance metrics
    const sortedEvents = [...(eventAttendees || [])].sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime());
    const firstSessionAttendance = sortedEvents[0]?.attendees_count || 0;
    const secondSessionAttendance = sortedEvents[1]?.attendees_count || 0;
    const thirdSessionAttendance = sortedEvents[2]?.attendees_count || 0;
    const totalEventAttendees = sortedEvents.reduce((acc, ev) => acc + (ev.attendees_count || 0), 0);
    const averageAttendance = sortedEvents.length > 0 ? Math.round((totalEventAttendees / sortedEvents.length) * 10) / 10 : 0;

    // Membership statuses
    const cancelledMembers = members.filter(m => m.membership_status === 'CANCELLED').length;
    const renewedMembers = members.filter(m => m.membership_status === 'ACTIVE' && (m.completed_sessions_count >= 20 || m.current_week >= 4)).length;

    return {
      totalMembers,
      activeMembers,
      trialMembers,
      cancelledMembers,
      renewedMembers,
      sessionParticipationRate,
      week1Retention: Math.min(100, Math.max(0, week1Retention)),
      week2Retention: Math.min(100, Math.max(0, week2Retention)),
      week4Retention: Math.min(100, Math.max(0, week4Retention)),
      day1Return,
      day3Return,
      day7Return,
      day14Return,
      day28Return,
      firstSessionAttendance,
      secondSessionAttendance,
      thirdSessionAttendance,
      averageAttendance,
      totalSessionsRecorded,
      eventAttendeesTotal: sortedEvents.length,
    };
  }
};
