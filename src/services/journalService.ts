/**
 * JOURNAL SERVICE — TRAVESÍA
 * 
 * Manages the 5 Movements of the Travesía Guided Practice:
 * 1. Desacelerar (Breathing, Silence & Gratitude)
 * 2. Descargar (Unfiltered brain dump)
 * 3. Nombrar la Realidad (Emotions, Vision & Identity)
 * 4. Escuchar (Silent stillness / prayer)
 * 5. Actuar (Concrete single action / release)
 * 
 * STRICT PRIVACY GUARANTEE:
 * Enforced via Row Level Security (RLS) in PostgreSQL.
 * User sessions and drafts are isolated to auth.uid().
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { JournalSession } from '../types';

const DRAFT_KEY_PREFIX = 'travesia_journal_draft_';

export const journalService = {
  // Save or update an in-progress draft (localStorage + Supabase journal_drafts table)
  async saveDraft(userId: string, draft: Partial<JournalSession> & { currentMovementStep?: number }): Promise<void> {
    if (!userId) return;
    try {
      localStorage.setItem(`${DRAFT_KEY_PREFIX}${userId}`, JSON.stringify({
        ...draft,
        updated_at: new Date().toISOString()
      }));
    } catch {
      // ignore local storage quota issues
    }

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('journal_drafts')
          .upsert({
            user_id: userId,
            current_movement_step: draft.currentMovementStep || 1,
            draft_payload: draft,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
      } catch {
        // Non-blocking draft sync
      }
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
  async clearDraft(userId: string): Promise<void> {
    if (!userId) return;
    try {
      localStorage.removeItem(`${DRAFT_KEY_PREFIX}${userId}`);
    } catch {}

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('journal_drafts')
          .delete()
          .eq('user_id', userId);
      } catch {
        // ignore draft deletion errors
      }
    }
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
      this.clearDraft(userId);
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
          gratitude_items: newRecord.gratitude_items || [],
          free_writing_1m: newRecord.free_writing_1m,
          deep_writing_10m: newRecord.deep_writing_10m,
          focus_prompt_id: newRecord.focus_prompt_id,
          focus_prompt_text: newRecord.focus_prompt_text,
          focus_prompt_answer: newRecord.focus_prompt_answer,
          vision_sentence: newRecord.vision_sentence,
          identity_words: newRecord.identity_words || [],
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
        return { session: null, error: `Ha ocurrido un problema al guardar tu sesión: ${error.message}. Inténtalo de nuevo.` };
      }

      // Also record commitment in action_commitments table
      if (newRecord.action_commitment && data?.id) {
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
      this.clearDraft(userId);

      return { session: data as JournalSession, error: null };
    } catch (err: any) {
      return { session: null, error: err?.message || 'Ha ocurrido un problema al guardar tu sesión. Inténtalo de nuevo.' };
    }
  }
};

/**
 * Pure utility function to calculate consecutive practice streak
 */
export function calculateDynamicStreak(dates: string[]): number {
  if (!dates || dates.length === 0) return 0;

  const uniqueSortedDates = Array.from(new Set(dates))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const mostRecentDate = new Date(uniqueSortedDates[0]);
  mostRecentDate.setHours(0, 0, 0, 0);

  // If most recent is neither today nor yesterday, streak is broken
  if (mostRecentDate.getTime() !== today.getTime() && mostRecentDate.getTime() !== yesterday.getTime()) {
    return 0;
  }

  let streak = 1;
  let currentDate = mostRecentDate;

  for (let i = 1; i < uniqueSortedDates.length; i++) {
    const prevDate = new Date(uniqueSortedDates[i]);
    prevDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
      currentDate = prevDate;
    } else if (diffDays === 0) {
      continue;
    } else {
      break;
    }
  }

  return streak;
}
