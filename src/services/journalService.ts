import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { JournalSession, EmotionSelection } from '../types';

const DRAFT_KEY_PREFIX = 'travesia_journal_draft_';

/**
 * Pure function to calculate dynamic contiguous streak of days from session dates.
 * Dates format: YYYY-MM-DD
 */
export function calculateDynamicStreak(datesList: string[]): number {
  if (!datesList || datesList.length === 0) return 0;

  // Deduplicate and sort descending
  const uniqueDates = Array.from(new Set(datesList)).sort((a, b) => b.localeCompare(a));
  if (uniqueDates.length === 0) return 0;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const latestDate = uniqueDates[0];

  // If the user hasn't journaled today or yesterday, streak is broken (0)
  if (latestDate !== todayStr && latestDate !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  let expectedDate = new Date(latestDate);

  for (let i = 0; i < uniqueDates.length; i++) {
    const currentDate = uniqueDates[i];
    const expectedStr = expectedDate.toISOString().split('T')[0];

    if (currentDate === expectedStr) {
      streak += 1;
      // Step one day back
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export const journalService = {
  // Save or update an in-progress draft (so refreshing or closing the browser preserves progress)
  saveDraft(userId: string, draft: Partial<JournalSession> & { currentMovementStep?: number }): void {
    if (!userId) return;
    try {
      localStorage.setItem(`${DRAFT_KEY_PREFIX}${userId}`, JSON.stringify({
        ...draft,
        updated_at: new Date().toISOString()
      }));
    } catch {
      // ignore storage quota issues
    }
  },

  // Retrieve saved draft if exists
  getDraft(userId: string): (Partial<JournalSession> & { currentMovementStep?: number }) | null {
    if (!userId) return null;
    try {
      const saved = localStorage.getItem(`${DRAFT_KEY_PREFIX}${userId}`);
      if (!saved) return null;
      return JSON.parse(saved);
    } catch {
      return null;
    }
  },

  // Clear draft upon successful completion of session
  clearDraft(userId: string): void {
    if (!userId) return;
    try {
      localStorage.removeItem(`${DRAFT_KEY_PREFIX}${userId}`);
    } catch {}
  },

  // Fetch private sessions strictly for the authenticated user
  async fetchUserSessions(userId: string): Promise<{ sessions: JournalSession[]; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { sessions: [], error: null };
    }

    try {
      const { data, error } = await supabase
        .from('journal_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        return { sessions: [], error: error.message };
      }

      return { sessions: (data as JournalSession[]) || [], error: null };
    } catch (err: any) {
      return { sessions: [], error: err?.message || 'Error al obtener las sesiones de diario.' };
    }
  },

  // Save completed session to Supabase database (PROTECTED BY RLS)
  async saveCompletedSession(
    userId: string, 
    sessionData: Omit<JournalSession, 'id' | 'created_at' | 'user_id'>
  ): Promise<{ session: JournalSession | null; error: string | null }> {
    const todayStr = new Date().toISOString().split('T')[0];

    const newRecord: Omit<JournalSession, 'id' | 'created_at'> & { user_id: string } = {
      ...sessionData,
      user_id: userId,
      date: sessionData.date || todayStr,
      status: 'completed',
    };

    if (!isSupabaseConfigured) {
      // Local fallback with simulated UUID
      const localSession: JournalSession = {
        ...newRecord,
        id: `js-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      journalService.clearDraft(userId);
      return { session: localSession, error: null };
    }

    try {
      // Insert into journal_sessions table
      const { data, error } = await supabase
        .from('journal_sessions')
        .insert({
          user_id: userId,
          date: newRecord.date,
          breathing_completed: newRecord.breathing_completed,
          silence_duration_seconds: newRecord.silence_duration_seconds,
          free_writing_1m: newRecord.free_writing_1m,
          deep_writing_10m: newRecord.deep_writing_10m,
          focus_prompt_id: newRecord.focus_prompt_id,
          focus_prompt_text: newRecord.focus_prompt_text,
          focus_prompt_answer: newRecord.focus_prompt_answer,
          listening_notes: newRecord.listening_notes,
          listening_duration_seconds: newRecord.listening_duration_seconds,
          action_type: newRecord.action_type,
          action_commitment: newRecord.action_commitment,
          total_duration_minutes: newRecord.total_duration_minutes,
          status: 'completed',
        })
        .select()
        .single();

      if (error) {
        return { session: null, error: error.message };
      }

      // Also record commitment in action_commitments table
      if (newRecord.action_commitment) {
        await supabase
          .from('action_commitments')
          .insert({
            user_id: userId,
            session_id: data.id,
            action_type: newRecord.action_type,
            commitment_text: newRecord.action_commitment,
            status: 'pending',
            due_date: newRecord.date,
          });
      }

      // Clear draft once saved
      journalService.clearDraft(userId);

      return { session: data as JournalSession, error: null };
    } catch (err: any) {
      return { session: null, error: err?.message || 'Error al persistir la sesión en el servidor.' };
    }
  }
};
