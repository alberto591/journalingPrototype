import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AnalyticsEventType, AnalyticsEvent } from '../types';

const ANALYTICS_STORAGE_KEY = 'travesia_analytics_events_v3';

export const analyticsService = {
  /**
   * Track high-intent product and business events.
   * Provides clean abstraction for PostHog, Mixpanel or Segment without code bloat.
   */
  async track(
    eventType: AnalyticsEventType,
    metadata: Record<string, any> = {},
    userId?: string
  ): Promise<void> {
    const event: AnalyticsEvent = {
      id: `an-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      event_type: eventType,
      user_id: userId,
      metadata,
      timestamp: new Date().toISOString(),
    };

    // Store locally for audit & testing
    try {
      const stored = localStorage.getItem(ANALYTICS_STORAGE_KEY);
      const list: AnalyticsEvent[] = stored ? JSON.parse(stored) : [];
      list.unshift(event);
      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(list.slice(0, 200)));
    } catch {}

    if (isSupabaseConfigured) {
      try {
        await supabase.from('analytics_events').insert({
          event_type: eventType,
          user_id: userId,
          metadata,
        });
      } catch {}
    }
  },

  // Get aggregated counts of product events for business dashboard
  async getEventCounts(): Promise<Record<AnalyticsEventType, number>> {
    const counts: Partial<Record<AnalyticsEventType, number>> = {};
    
    try {
      const stored = localStorage.getItem(ANALYTICS_STORAGE_KEY);
      const list: AnalyticsEvent[] = stored ? JSON.parse(stored) : [];
      for (const ev of list) {
        counts[ev.event_type] = (counts[ev.event_type] || 0) + 1;
      }
    } catch {}

    return counts as Record<AnalyticsEventType, number>;
  }
};
