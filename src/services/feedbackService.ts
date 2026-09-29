import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { FeedbackResponse, FeedbackMilestone } from '../types';

const FEEDBACK_STORAGE_KEY = 'travesia_feedback_responses_v3';

export const feedbackService = {
  // Submit feedback response
  async submitFeedback(params: {
    userId: string;
    userName?: string;
    dayMilestone: FeedbackMilestone;
    mostUseful: string;
    whatToChange: string;
    mindsetShift: string;
    wouldReturn: 'yes' | 'maybe' | 'no';
  }): Promise<{ success: boolean; error: string | null }> {
    const newFeedback: FeedbackResponse = {
      id: `fb-${Date.now()}`,
      user_id: params.userId,
      user_name: params.userName || 'Miembro',
      day_milestone: params.dayMilestone,
      most_useful: params.mostUseful.trim(),
      what_to_change: params.whatToChange.trim(),
      mindset_shift: params.mindsetShift.trim(),
      would_return: params.wouldReturn,
      created_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured) {
      try {
        const stored = localStorage.getItem(FEEDBACK_STORAGE_KEY);
        const list: FeedbackResponse[] = stored ? JSON.parse(stored) : [];
        list.push(newFeedback);
        localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(list));
        return { success: true, error: null };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Error guardando feedback' };
      }
    }

    try {
      const { error } = await supabase.from('feedback_responses').insert({
        user_id: params.userId,
        day_milestone: params.dayMilestone,
        most_useful: newFeedback.most_useful,
        what_to_change: newFeedback.what_to_change,
        mindset_shift: newFeedback.mindset_shift,
        would_return: newFeedback.would_return,
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error guardando feedback' };
    }
  },

  // Fetch all feedback responses for Admin analysis
  async fetchAllFeedback(): Promise<FeedbackResponse[]> {
    if (!isSupabaseConfigured) {
      try {
        const stored = localStorage.getItem(FEEDBACK_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }

    try {
      const { data, error } = await supabase
        .from('feedback_responses')
        .select(`*, user:profiles(name)`)
        .order('created_at', { ascending: false });

      if (error) return [];
      return data.map((d: any) => ({
        ...d,
        user_name: d.user?.name || 'Miembro',
      })) as FeedbackResponse[];
    } catch {
      return [];
    }
  }
};
