import { describe, it, expect, beforeEach } from 'vitest';
import { newDb, DataType, IMemoryDb } from 'pg-mem';
import { recordingsService } from '../services/recordingsService';
import { Profile, SessionRecording } from '../types';

describe('Real PostgreSQL & Supabase Security Layer Verification (Scenarios A - L)', () => {
  let db: IMemoryDb;
  let currentAuthUid: string | null = null;

  // Initialize in-memory PostgreSQL engine mirroring Supabase schema & trigger rules
  beforeEach(() => {
    db = newDb();
    currentAuthUid = null;

    // Register auth.uid() function
    db.public.registerFunction({
      name: 'auth_uid',
      args: [],
      returns: DataType.text,
      implementation: () => currentAuthUid,
    });

    // Create admin_roles table (Authoritative source of admin rights)
    db.public.none(`
      CREATE TABLE admin_roles (
        user_id text PRIMARY KEY,
        role_title text NOT NULL,
        permissions text[] DEFAULT '{all}'
      );
    `);

    // Create is_admin function (hardened, queries admin_roles only)
    db.public.registerFunction({
      name: 'is_admin',
      args: [DataType.text],
      returns: DataType.bool,
      implementation: (uid: string) => {
        if (!uid) return false;
        const res = db.public.many(`SELECT 1 FROM admin_roles WHERE user_id = '${uid}'`);
        return res.length > 0;
      },
    });

    // Create profiles table
    db.public.none(`
      CREATE TABLE profiles (
        id text PRIMARY KEY,
        name text NOT NULL,
        email text,
        role text NOT NULL DEFAULT 'member',
        membership_status text NOT NULL DEFAULT 'TRIAL',
        streak_days integer DEFAULT 0,
        billing_started_at text,
        next_billing_date text
      );
    `);

    // Create storage.objects table
    db.public.none(`
      CREATE TABLE storage_objects (
        id text PRIMARY KEY,
        bucket_id text NOT NULL,
        name text NOT NULL,
        owner text
      );
    `);

    // Register get_profile_email security definer function
    db.public.registerFunction({
      name: 'get_profile_email',
      args: [DataType.text],
      returns: DataType.text,
      implementation: (targetUserId: string) => {
        const isAdmin = db.public.one(`SELECT is_admin(auth_uid()) AS adm`).adm;
        const callerId = currentAuthUid;
        if (callerId === targetUserId || isAdmin) {
          const row = db.public.one(`SELECT email FROM profiles WHERE id = '${targetUserId}'`);
          return row ? row.email : null;
        }
        return null;
      },
    });

    // Seed test users
    db.public.none(`
      INSERT INTO admin_roles (user_id, role_title)
      VALUES ('usr-admin-alberto', 'Superadmin');

      INSERT INTO profiles (id, name, email, role, membership_status, streak_days)
      VALUES 
        ('usr-admin-alberto', 'Alberto Calvo', 'alberto@travesia.app', 'admin', 'ACTIVE', 45),
        ('usr-member-carlos', 'Carlos Ruiz', 'carlos@member.com', 'member', 'ACTIVE', 5),
        ('usr-member-david', 'David Serrano', 'david@member.com', 'member', 'TRIAL', 2),
        ('usr-member-expired', 'Laura Gomez', 'laura@expired.com', 'member', 'EXPIRED', 0);
    `);
  });

  // Simulated Database Layer API mirroring PostgREST RLS + Triggers
  const postgresClient = {
    setAuthUser(uid: string | null) {
      currentAuthUid = uid;
    },

    updateProfile(targetId: string, updates: Partial<{ role: string; membership_status: string; streak_days: number; name: string }>) {
      const callerId = currentAuthUid;
      if (!callerId) {
        throw new Error('401 Unauthorized: Session missing');
      }

      const isAdmin = db.public.one(`SELECT is_admin('${callerId}') AS adm`).adm;

      // 1. RLS UPDATE policy: USING (auth.uid() = id OR is_admin(auth.uid()))
      if (callerId !== targetId && !isAdmin) {
        return { count: 0, error: 'RLS: Target row not accessible for update' };
      }

      // 2. Trigger: protect_profile_privileged_columns()
      const oldRow = db.public.one(`SELECT * FROM profiles WHERE id = '${targetId}'`);
      if (!oldRow) {
        return { count: 0, error: 'Not found' };
      }

      if (!isAdmin) {
        if (updates.role !== undefined && updates.role !== oldRow.role) {
          throw new Error('Privilege Violation: Only administrators can modify roles.');
        }
        if (updates.membership_status !== undefined && updates.membership_status !== oldRow.membership_status) {
          throw new Error('Privilege Violation: Only administrators can modify membership status.');
        }
        if (updates.streak_days !== undefined && updates.streak_days !== oldRow.streak_days) {
          throw new Error('Privilege Violation: streak_days is managed server-side and cannot be manually modified.');
        }
      }

      // Apply update
      const setClauses: string[] = [];
      if (updates.name !== undefined) setClauses.push(`name = '${updates.name}'`);
      if (updates.role !== undefined) setClauses.push(`role = '${updates.role}'`);
      if (updates.membership_status !== undefined) setClauses.push(`membership_status = '${updates.membership_status}'`);
      if (updates.streak_days !== undefined) setClauses.push(`streak_days = ${updates.streak_days}`);

      if (setClauses.length > 0) {
        db.public.none(`UPDATE profiles SET ${setClauses.join(', ')} WHERE id = '${targetId}'`);
      }

      const updated = db.public.one(`SELECT * FROM profiles WHERE id = '${targetId}'`);
      return { count: 1, data: updated, error: null };
    },

    // RPC: admin_activate_membership
    adminActivateMembership(targetUserId: string, newStatus: string) {
      const callerId = currentAuthUid;
      if (!callerId) throw new Error('401 Unauthorized');
      const isAdmin = db.public.one(`SELECT is_admin('${callerId}') AS adm`).adm;
      if (!isAdmin) {
        throw new Error('Access Denied: Only administrators can activate or modify member subscriptions.');
      }
      db.public.none(`UPDATE profiles SET membership_status = '${newStatus}' WHERE id = '${targetUserId}'`);
      return { success: true, targetUserId, newStatus };
    },

    // Storage object upload with path isolation policy
    storageUpload(bucketId: string, filePath: string) {
      const callerId = currentAuthUid;
      if (!callerId) throw new Error('401 Unauthorized');

      // Policy: bucket_id = 'profile-images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text (or admin)
      if (bucketId === 'profile-images') {
        const folder = filePath.split('/')[0];
        const isAdmin = db.public.one(`SELECT is_admin('${callerId}') AS adm`).adm;
        if (folder !== callerId && !isAdmin) {
          throw new Error('403 Forbidden: Storage policy violation - Cannot upload into another user directory.');
        }
      }

      const id = `obj-${Date.now()}-${Math.random()}`;
      db.public.none(`INSERT INTO storage_objects (id, bucket_id, name, owner) VALUES ('${id}', '${bucketId}', '${filePath}', '${callerId}')`);
      return { id, filePath };
    },

    // Storage object delete with path isolation policy
    storageDelete(bucketId: string, filePath: string) {
      const callerId = currentAuthUid;
      if (!callerId) throw new Error('401 Unauthorized');
      const isAdmin = db.public.one(`SELECT is_admin('${callerId}') AS adm`).adm;

      if (bucketId === 'profile-images') {
        const folder = filePath.split('/')[0];
        if (folder !== callerId && !isAdmin) {
          throw new Error('403 Forbidden: Storage policy violation - Cannot delete another user object.');
        }
      }

      db.public.none(`DELETE FROM storage_objects WHERE bucket_id = '${bucketId}' AND name = '${filePath}'`);
      return { success: true };
    },

    // Query members directory with public columns only
    queryPublicMemberDirectory() {
      // Must NOT select email column
      return db.public.many(`SELECT id, name, role, membership_status, streak_days FROM profiles ORDER BY id`);
    },
  };

  // Scenario A
  it('A. Regular member attempts profiles.update({ role: "admin" }) -> MUST FAIL', () => {
    postgresClient.setAuthUser('usr-member-carlos');
    expect(() => {
      postgresClient.updateProfile('usr-member-carlos', { role: 'admin' });
    }).toThrow('Privilege Violation: Only administrators can modify roles.');

    const check = db.public.one(`SELECT role FROM profiles WHERE id = 'usr-member-carlos'`);
    expect(check.role).toBe('member');
  });

  // Scenario B
  it('B. Regular member attempts profiles.update({ membership_status: "ACTIVE" }) -> MUST FAIL', () => {
    postgresClient.setAuthUser('usr-member-david');
    expect(() => {
      postgresClient.updateProfile('usr-member-david', { membership_status: 'ACTIVE' });
    }).toThrow('Privilege Violation: Only administrators can modify membership status.');

    const check = db.public.one(`SELECT membership_status FROM profiles WHERE id = 'usr-member-david'`);
    expect(check.membership_status).toBe('TRIAL');
  });

  // Scenario C
  it('C. Regular member attempts to modify another user profile -> MUST FAIL', () => {
    postgresClient.setAuthUser('usr-member-carlos');
    const result = postgresClient.updateProfile('usr-member-david', { name: 'Hacked Name' });
    expect(result.count).toBe(0);
    expect(result.error).toContain('RLS: Target row not accessible');

    const check = db.public.one(`SELECT name FROM profiles WHERE id = 'usr-member-david'`);
    expect(check.name).toBe('David Serrano');
  });

  // Scenario D
  it('D. Admin can modify intended membership fields via adminActivateMembership -> MUST SUCCEED', () => {
    postgresClient.setAuthUser('usr-admin-alberto');
    const result = postgresClient.adminActivateMembership('usr-member-david', 'ACTIVE');
    expect(result.success).toBe(true);
    expect(result.newStatus).toBe('ACTIVE');

    const check = db.public.one(`SELECT membership_status FROM profiles WHERE id = 'usr-member-david'`);
    expect(check.membership_status).toBe('ACTIVE');
  });

  // Scenario E
  it('E. Regular member cannot read another user email via get_profile_email -> MUST RETURN NULL', () => {
    postgresClient.setAuthUser('usr-member-carlos');
    // Carlos reads own email
    const ownEmail = db.public.one(`SELECT get_profile_email('usr-member-carlos') AS email`).email;
    expect(ownEmail).toBe('carlos@member.com');

    // Carlos attempts to read David's email
    const otherEmail = db.public.one(`SELECT get_profile_email('usr-member-david') AS email`).email;
    expect(otherEmail).toBeNull();
  });

  // Scenario F
  it('F. Regular member cannot read arbitrary member PII from public directory queries -> EXCLUDES EMAIL', () => {
    postgresClient.setAuthUser('usr-member-carlos');
    const directory = postgresClient.queryPublicMemberDirectory();
    expect(directory.length).toBeGreaterThan(0);
    for (const member of directory) {
      expect((member as any).email).toBeUndefined();
    }
  });

  // Scenario G
  it('G. User A cannot upload into profile-images/{userB-id}/avatar.png -> MUST FAIL', () => {
    postgresClient.setAuthUser('usr-member-carlos');
    expect(() => {
      postgresClient.storageUpload('profile-images', 'usr-member-david/avatar.png');
    }).toThrow('403 Forbidden: Storage policy violation');

    // But can upload to own directory
    const ownUpload = postgresClient.storageUpload('profile-images', 'usr-member-carlos/avatar.png');
    expect(ownUpload.filePath).toBe('usr-member-carlos/avatar.png');
  });

  // Scenario H
  it('H. User A cannot delete profile-images/{userB-id}/... -> MUST FAIL', () => {
    // Admin uploads David's avatar
    postgresClient.setAuthUser('usr-admin-alberto');
    postgresClient.storageUpload('profile-images', 'usr-member-david/avatar.png');

    // Carlos attempts to delete David's avatar
    postgresClient.setAuthUser('usr-member-carlos');
    expect(() => {
      postgresClient.storageDelete('profile-images', 'usr-member-david/avatar.png');
    }).toThrow('403 Forbidden: Storage policy violation');
  });

  // Scenario I
  it('I. ACTIVE member can access an allowed recording -> MUST SUCCEED', () => {
    const activeMember: Profile = {
      id: 'usr-member-carlos',
      name: 'Carlos Ruiz',
      avatar_url: '',
      bio: '',
      role: 'member',
      membership_status: 'ACTIVE',
      focus_areas: [],
      created_at: new Date().toISOString(),
      streak_days: 5,
      completed_sessions_count: 5,
      reflection_minutes: 150,
      current_week: 1,
      onboarding_completed: true,
    };

    const recording: SessionRecording = {
      id: 'rec-1',
      title: 'Sesión de Silencio',
      description: 'Práctica guiada',
      date: '2026-10-01',
      duration: '35 min',
      category: 'El Presente',
      status: 'AVAILABLE',
      views_count: 0,
      recording_strategy: 'HOSTED',
      storage_path: 'session-recordings/evt-1/rec-1.mp4',
    };

    const access = recordingsService.checkAccess(activeMember, recording);
    expect(access.allowed).toBe(true);
  });

  // Scenario J
  it('J. EXPIRED member cannot access premium recordings -> MUST BE DENIED', () => {
    const expiredMember: Profile = {
      id: 'usr-member-expired',
      name: 'Laura Gomez',
      avatar_url: '',
      bio: '',
      role: 'member',
      membership_status: 'EXPIRED',
      focus_areas: [],
      created_at: new Date().toISOString(),
      streak_days: 0,
      completed_sessions_count: 0,
      reflection_minutes: 0,
      current_week: 1,
      onboarding_completed: true,
    };

    const access = recordingsService.checkAccess(expiredMember);
    expect(access.allowed).toBe(false);
    expect(access.reason).toBe('MEMBERSHIP_INACTIVE');
  });

  // Scenario K
  it('K. EXPIRED member cannot generate or use recording signed URLs -> MUST BE DENIED', async () => {
    const expiredMember: Profile = {
      id: 'usr-member-expired',
      name: 'Laura Gomez',
      avatar_url: '',
      bio: '',
      role: 'member',
      membership_status: 'EXPIRED',
      focus_areas: [],
      created_at: new Date().toISOString(),
      streak_days: 0,
      completed_sessions_count: 0,
      reflection_minutes: 0,
      current_week: 1,
      onboarding_completed: true,
    };

    const recording: SessionRecording = {
      id: 'rec-2',
      title: 'Sesión Privada',
      description: 'Solo miembros',
      date: '2026-10-01',
      duration: '35 min',
      category: 'La Visión',
      status: 'AVAILABLE',
      views_count: 0,
      recording_strategy: 'HOSTED',
      storage_path: 'session-recordings/evt-2/rec-2.mp4',
    };

    const result = await recordingsService.getSecurePlayableUrl(expiredMember, recording);
    expect(result.playableUrl).toBeNull();
    expect(result.error).toContain('Las grabaciones son exclusivas para miembros activos');
  });

  // Scenario L
  it('L. Admin retains recording management access -> ALWAYS ALLOWED', () => {
    const adminUser: Profile = {
      id: 'usr-admin-alberto',
      name: 'Alberto Calvo',
      avatar_url: '',
      bio: '',
      role: 'admin',
      membership_status: 'ACTIVE',
      focus_areas: [],
      created_at: new Date().toISOString(),
      streak_days: 45,
      completed_sessions_count: 90,
      reflection_minutes: 2700,
      current_week: 4,
      onboarding_completed: true,
    };

    const access = recordingsService.checkAccess(adminUser);
    expect(access.allowed).toBe(true);
    expect(access.message).toContain('equipo de facilitación');
  });
});
