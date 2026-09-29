import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DailyPrompt } from '../types';
import { INITIAL_DAILY_PROMPTS } from '../lib/dailyPromptsData';

/**
 * Deterministic selection of the daily prompt:
 * Uses day of year and active prompts pool to ensure all members get the same prompt
 * for the day or week, while supporting admin scheduled overrides.
 */
export function getDeterministicDailyPrompt(
  prompts: DailyPrompt[], 
  targetDate: Date = new Date(),
  userWeek: number = 1
): DailyPrompt {
  if (!prompts || prompts.length === 0) {
    return INITIAL_DAILY_PROMPTS[0];
  }

  const activePrompts = prompts.filter(p => p.active);
  if (activePrompts.length === 0) {
    return prompts[0];
  }

  // Check if there is an explicit admin scheduled prompt for today's date
  const targetDateStr = targetDate.toISOString().split('T')[0];
  const scheduledPrompt = activePrompts.find(
    (p: any) => p.scheduled_for_date === targetDateStr
  );
  if (scheduledPrompt) {
    return scheduledPrompt;
  }

  // Calculate day of the year (0 to 365)
  const startOfYear = new Date(targetDate.getFullYear(), 0, 0);
  const diff = targetDate.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Prefer prompts matching user's current week if available
  const weekPrompts = activePrompts.filter(p => p.week === userWeek);
  const candidatePool = weekPrompts.length > 0 ? weekPrompts : activePrompts;

  return candidatePool[dayOfYear % candidatePool.length];
}

export const promptsService = {
  // Fetch prompts from database or fallback to canonical catalog
  async fetchPrompts(): Promise<{ prompts: DailyPrompt[]; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { prompts: INITIAL_DAILY_PROMPTS, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('daily_prompts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { prompts: INITIAL_DAILY_PROMPTS, error: error.message };
      }

      if (!data || data.length === 0) {
        return { prompts: INITIAL_DAILY_PROMPTS, error: null };
      }

      return { prompts: data as DailyPrompt[], error: null };
    } catch (err: any) {
      return { prompts: INITIAL_DAILY_PROMPTS, error: err?.message || 'Error al obtener preguntas de diario.' };
    }
  },

  // Admin create new prompt
  async createPrompt(
    promptData: Omit<DailyPrompt, 'id' | 'created_at'>
  ): Promise<{ prompt: DailyPrompt | null; error: string | null }> {
    if (!isSupabaseConfigured) {
      const localPrompt: DailyPrompt = {
        ...promptData,
        id: `prompt-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      return { prompt: localPrompt, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('daily_prompts')
        .insert({
          prompt_text: promptData.prompt_text,
          category: promptData.category,
          week: promptData.week,
          difficulty: promptData.difficulty,
          active: promptData.active,
        })
        .select()
        .single();

      if (error) {
        return { prompt: null, error: error.message };
      }

      return { prompt: data as DailyPrompt, error: null };
    } catch (err: any) {
      return { prompt: null, error: err?.message || 'Error al crear el prompt en el servidor.' };
    }
  },

  // Admin toggle prompt active
  async togglePromptActive(
    promptId: string, 
    active: boolean
  ): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { success: true, error: null };
    }

    try {
      const { error } = await supabase
        .from('daily_prompts')
        .update({ active })
        .eq('id', promptId);

      return { success: !error, error: error ? error.message : null };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error al actualizar el prompt.' };
    }
  }
};
