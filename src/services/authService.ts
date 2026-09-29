import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile } from '../types';

export interface AuthState {
  user: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  error: string | null;
}

export const authService = {
  // Sign up with real email & password
  async signUp(email: string, password: string, name: string): Promise<{ user: Profile | null; error: string | null }> {
    if (!isSupabaseConfigured) {
      // In local dev without Supabase credentials, return helpful feedback or create local session
      return { 
        user: null, 
        error: 'Supabase no está configurado con claves activas. Operando en modo local.' 
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
          }
        }
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: 'No se pudo crear la cuenta de usuario.' };
      }

      // Profile row is automatically populated by database trigger handle_new_user()
      const profile: Profile = {
        id: data.user.id,
        name: name || data.user.email?.split('@')[0] || 'Miembro',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        bio: '',
        location: '',
        role: 'member',
        focus_areas: [],
        created_at: data.user.created_at,
        streak_days: 0,
        completed_sessions_count: 0,
        reflection_minutes: 0,
        current_week: 1,
        onboarding_completed: false,
      };

      return { user: profile, error: null };
    } catch (err: any) {
      return { user: null, error: err?.message || 'Error de conexión con el servicio de autenticación.' };
    }
  },

  // Sign in with real email & password
  async signIn(email: string, password: string): Promise<{ user: Profile | null; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { 
        user: null, 
        error: 'Supabase no está configurado. Utiliza el selector de perfiles de desarrollo o configura tus credenciales.' 
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: 'Usuario no encontrado.' };
      }

      // Fetch user profile from database
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileErr || !profileData) {
        // Fallback default profile if table row pending
        const fallbackProfile: Profile = {
          id: data.user.id,
          name: data.user.email?.split('@')[0] || 'Miembro',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          bio: '',
          role: 'member',
          focus_areas: [],
          created_at: data.user.created_at,
          streak_days: 0,
          completed_sessions_count: 0,
          reflection_minutes: 0,
          current_week: 1,
          onboarding_completed: false,
        };
        return { user: fallbackProfile, error: null };
      }

      return { user: profileData as Profile, error: null };
    } catch (err: any) {
      return { user: null, error: err?.message || 'Error al iniciar sesión.' };
    }
  },

  // Sign out
  async signOut(): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured) {
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signOut();
      return { error: error ? error.message : null };
    } catch (err: any) {
      return { error: err?.message || 'Error al cerrar sesión.' };
    }
  },

  // Reset password
  async resetPassword(email: string): Promise<{ error: string | null }> {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase no configurado en entorno local.' };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error: error ? error.message : null };
    } catch (err: any) {
      return { error: err?.message || 'Error al solicitar recuperación de contraseña.' };
    }
  }
};
