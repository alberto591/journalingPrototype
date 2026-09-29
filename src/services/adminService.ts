import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const adminService = {
  /**
   * Verify server-side whether a given user possesses an active admin role.
   * Queries Supabase admin_roles or checks profiles.role = 'admin'.
   */
  async verifyAdminAccess(userId: string): Promise<boolean> {
    if (!userId) return false;

    if (!isSupabaseConfigured) {
      // In local demo mode, only the explicit admin seed user has access
      return userId === 'usr-alberto-calvo' || userId === 'usr-david-serrano';
    }

    try {
      // Check admin_roles table
      const { data: adminRole } = await supabase
        .from('admin_roles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (adminRole) return true;

      // Check profiles role column
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      return profile?.role === 'admin';
    } catch {
      return false;
    }
  },

  /**
   * Guard function: throws if the current session user is not an authorized administrator.
   */
  async assertAdmin(userId: string): Promise<void> {
    const isAdmin = await adminService.verifyAdminAccess(userId);
    if (!isAdmin) {
      throw new Error('ACCESO DENEGADO: Se requieren privilegios de administrador para realizar esta operación.');
    }
  }
};
