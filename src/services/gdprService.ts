import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, JournalSession, NotificationItem, UserPreferences } from '../types';

export interface UserDataExport {
  exportDate: string;
  user: Partial<Profile>;
  journalSessions: JournalSession[];
  preferences?: UserPreferences | null;
  notifications: NotificationItem[];
}

export const gdprService = {
  /**
   * Export all persistent user data stored in Supabase for GDPR data portability
   */
  async exportUserData(userId: string): Promise<{ data: UserDataExport | null; error: string | null }> {
    if (!userId) {
      return { data: null, error: 'Identificador de usuario inválido.' };
    }

    if (!isSupabaseConfigured) {
      // In local mode, export from localStorage if available
      try {
        const userSaved = localStorage.getItem('travesia_v2_user');
        const journalsSaved = localStorage.getItem(`travesia_v2_journals_${userId}`);
        const user = userSaved ? JSON.parse(userSaved) : { id: userId };
        const journalSessions = journalsSaved ? JSON.parse(journalsSaved) : [];

        return {
          data: {
            exportDate: new Date().toISOString(),
            user,
            journalSessions,
            notifications: [],
          },
          error: null,
        };
      } catch (err: any) {
        return { data: null, error: 'Error al exportar datos locales.' };
      }
    }

    try {
      // Fetch profile
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileErr) {
        return { data: null, error: `Error al obtener el perfil: ${profileErr.message}` };
      }

      // Fetch private journal sessions (protected by RLS)
      const { data: sessions, error: sessionErr } = await supabase
        .from('journal_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (sessionErr) {
        return { data: null, error: `Error al obtener entradas de diario: ${sessionErr.message}` };
      }

      // Fetch preferences
      const { data: preferences } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      // Fetch notifications
      const { data: notifs } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId);

      const exportBundle: UserDataExport = {
        exportDate: new Date().toISOString(),
        user: profile as Profile,
        journalSessions: (sessions || []) as JournalSession[],
        preferences: preferences as UserPreferences,
        notifications: (notifs || []) as NotificationItem[],
      };

      return { data: exportBundle, error: null };
    } catch (err: any) {
      return { data: null, error: err?.message || 'Error inesperado durante la exportación de datos.' };
    }
  },

  /**
   * Request complete permanent account deletion (Right to be Forgotten)
   * This cascades and removes all profile and journal records via foreign key constraints
   */
  async requestAccountDeletion(userId: string): Promise<{ success: boolean; error: string | null }> {
    if (!userId) {
      return { success: false, error: 'Identificador de usuario inválido.' };
    }

    if (!isSupabaseConfigured) {
      localStorage.removeItem('travesia_v2_user');
      localStorage.removeItem(`travesia_v2_journals_${userId}`);
      return { success: true, error: null };
    }

    try {
      // Deleting user profile cascades to sessions, drafts, comments, etc.
      const { error: deleteErr } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (deleteErr) {
        return { success: false, error: deleteErr.message };
      }

      // Sign out current session
      await supabase.auth.signOut();

      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error al procesar la eliminación de cuenta.' };
    }
  },
};
