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
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim() || trimmedEmail.split('@')[0];

    if (!isSupabaseConfigured) {
      // In local mode without remote Supabase keys, create real local user
      const localId = `usr-${Date.now()}`;
      const profile: Profile = {
        id: localId,
        name: trimmedName,
        email: trimmedEmail,
        avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        bio: '',
        location: '',
        role: trimmedEmail.includes('admin') || trimmedEmail.includes('alberto') ? 'admin' : 'member',
        membership_status: 'ACTIVE',
        focus_areas: [],
        created_at: new Date().toISOString(),
        streak_days: 0,
        completed_sessions_count: 0,
        reflection_minutes: 0,
        current_week: 1,
        onboarding_completed: false,
      };

      try {
        localStorage.setItem('travesia_v2_user', JSON.stringify(profile));
      } catch {}

      return { user: profile, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            name: trimmedName,
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
        name: trimmedName,
        email: trimmedEmail,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        bio: '',
        location: '',
        role: 'member',
        membership_status: 'TRIAL',
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
    const trimmedEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured) {
      const saved = localStorage.getItem('travesia_v2_user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && (parsed.email === trimmedEmail || !parsed.email)) {
            return { user: parsed, error: null };
          }
        } catch {}
      }

      // If user not saved yet, create profile for this email
      const profile: Profile = {
        id: `usr-${Date.now()}`,
        name: trimmedEmail.split('@')[0],
        email: trimmedEmail,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        bio: '',
        location: '',
        role: trimmedEmail.includes('admin') || trimmedEmail.includes('alberto') ? 'admin' : 'member',
        membership_status: 'ACTIVE',
        focus_areas: [],
        created_at: new Date().toISOString(),
        streak_days: 0,
        completed_sessions_count: 0,
        reflection_minutes: 0,
        current_week: 1,
        onboarding_completed: true,
      };
      try {
        localStorage.setItem('travesia_v2_user', JSON.stringify(profile));
      } catch {}
      return { user: profile, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
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
        // Even in fallback, check if user is admin
        let isAdmin = false;
        try {
          const { data: adminRecord } = await supabase
            .from('admin_roles')
            .select('id')
            .eq('user_id', data.user.id)
            .maybeSingle();
          if (adminRecord) isAdmin = true;
        } catch {}

        const fallbackProfile: Profile = {
          id: data.user.id,
          name: trimmedEmail.split('@')[0],
          email: trimmedEmail,
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          bio: '',
          role: isAdmin ? 'admin' : 'member',
          membership_status: isAdmin ? 'ACTIVE' : 'TRIAL',
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

      // Check admin_roles table as well
      const resolvedProfile = profileData as Profile;
      try {
        const { data: adminRecord } = await supabase
          .from('admin_roles')
          .select('id')
          .eq('user_id', data.user.id)
          .maybeSingle();
        if (adminRecord) {
          resolvedProfile.role = 'admin';
        }
      } catch {}

      return { user: resolvedProfile, error: null };
    } catch (err: any) {
      return { user: null, error: err?.message || 'Error al iniciar sesión.' };
    }
  },

  // Sign out
  async signOut(): Promise<{ error: string | null }> {
    try {
      localStorage.removeItem('travesia_v2_user');
    } catch {}

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
