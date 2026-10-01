import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { EmailEventType, EmailEventLog } from '../types';

const EMAIL_LOGS_KEY = 'travesia_email_event_logs_v3';

export const emailEventService = {
  /**
   * Dispatch an email trigger event.
   * This decoupled architecture allows connecting Resend, SendGrid, Postmark or Supabase Edge Functions
   * without hard-wiring third-party secrets into the client code.
   */
  async dispatchEmailTrigger(params: {
    eventType: EmailEventType;
    userId: string;
    userEmail: string;
    payload?: Record<string, any>;
  }): Promise<{ eventId: string; success: boolean }> {
    const eventId = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const eventLog: EmailEventLog = {
      id: eventId,
      user_id: params.userId,
      user_email: params.userEmail,
      event_type: params.eventType,
      payload: params.payload || {},
      dispatched_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured) {
      try {
        const stored = localStorage.getItem(EMAIL_LOGS_KEY);
        const list: EmailEventLog[] = stored ? JSON.parse(stored) : [];
        list.unshift(eventLog);
        localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(list.slice(0, 100)));
      } catch {}
      return { eventId, success: true };
    }

    try {
      await supabase.from('email_events').insert({
        user_id: params.userId,
        user_email: params.userEmail,
        event_type: params.eventType,
        payload: params.payload || {},
      });
      return { eventId, success: true };
    } catch {
      return { eventId, success: true };
    }
  },

  // Fetch recent event logs for Admin auditing
  async fetchRecentEmailLogs(): Promise<EmailEventLog[]> {
    if (!isSupabaseConfigured) {
      try {
        const stored = localStorage.getItem(EMAIL_LOGS_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }

    try {
      const { data, error } = await supabase
        .from('email_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error || !data) return [];
      return data.map((d: any) => ({
        ...d,
        dispatched_at: d.created_at || d.sent_at || new Date().toISOString(),
      })) as EmailEventLog[];
    } catch {
      return [];
    }
  }
};
