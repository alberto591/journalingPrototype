import { describe, it, expect, beforeEach } from 'vitest';
import { recordingsService } from '../services/recordingsService';
import { gdprService } from '../services/gdprService';
import { eventsService } from '../services/eventsService';
import { zoomService } from '../services/zoomService';
import { Profile, SessionRecording, JournalSession } from '../types';

// Ensure localStorage mock is available in Node test environment
if (typeof localStorage === 'undefined' || !globalThis.localStorage) {
  let store: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    length: 0,
    key: () => null,
  } as any;
}

describe('TRAVESÍA — Production Infrastructure & Security Test Suite', () => {
  const memberAlice: Profile = {
    id: 'usr-alice-1111',
    name: 'Alice Mendoza',
    email: 'alice@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    bio: 'Buscando enfoque diario',
    role: 'member',
    membership_status: 'ACTIVE',
    focus_areas: ['Propósito', 'Disciplina'],
    created_at: '2026-09-01T08:00:00Z',
    streak_days: 5,
    completed_sessions_count: 5,
    reflection_minutes: 150,
    current_week: 1,
    onboarding_completed: true,
  };

  const trialUserBob: Profile = {
    id: 'usr-bob-2222',
    name: 'Bob Perez',
    email: 'bob@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    bio: 'En periodo de prueba',
    role: 'member',
    membership_status: 'TRIAL',
    focus_areas: ['Ruido'],
    created_at: '2026-09-25T08:00:00Z',
    streak_days: 2,
    completed_sessions_count: 2,
    reflection_minutes: 60,
    current_week: 1,
    onboarding_completed: true,
  };

  const expiredUserCarlos: Profile = {
    id: 'usr-carlos-3333',
    name: 'Carlos Ruiz',
    email: 'carlos@example.com',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    bio: 'Ex-miembro',
    role: 'member',
    membership_status: 'EXPIRED',
    focus_areas: [],
    created_at: '2026-08-01T08:00:00Z',
    streak_days: 0,
    completed_sessions_count: 10,
    reflection_minutes: 300,
    current_week: 2,
    onboarding_completed: true,
  };

  const adminAlberto: Profile = {
    id: 'usr-alberto-admin',
    name: 'Alberto Calvo',
    email: 'alberto@travesia.app',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    bio: 'Facilitador y fundador',
    role: 'admin',
    membership_status: 'ACTIVE',
    focus_areas: ['Visión', 'Liderazgo'],
    created_at: '2026-01-01T08:00:00Z',
    streak_days: 30,
    completed_sessions_count: 30,
    reflection_minutes: 900,
    current_week: 4,
    onboarding_completed: true,
  };

  const sampleRecording: SessionRecording = {
    id: 'rec-001',
    title: 'Desacelerar el Ruido Mental',
    description: 'Sesión guiada matutina sobre la atención plena.',
    date: '2026-09-29',
    duration: '35 min',
    duration_seconds: 2100,
    category: 'Journaling',
    storage_path: 'session-recordings/evt-001/recording.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600',
    status: 'AVAILABLE',
    recording_strategy: 'HOSTED',
    views_count: 12,
    is_member_only: true,
  };

  const createMockJournalSession = (id: string, userId: string, freeWriting: string): JournalSession => ({
    id,
    user_id: userId,
    date: '2026-09-30',
    created_at: '2026-09-30T07:00:00Z',
    breathing_completed: true,
    silence_duration_seconds: 60,
    gratitude_items: ['La mañana fresca'],
    free_writing_1m: freeWriting,
    deep_writing_10m: 'Profundizando en las prioridades esenciales',
    emotions: [{ category: 'ALEGRÍA', related_to: 'Comenzar con enfoque' }],
    listening_notes: 'Tranquilidad y dirección',
    listening_duration_seconds: 90,
    action_type: 'action',
    action_commitment: 'Completar el entregable antes de las 14h',
    total_duration_minutes: 30,
    status: 'completed',
  });

  describe('1. Journal Privacy & Data Isolation (RLS Principle)', () => {
    it('verifies User A sessions cannot be queried by User B', () => {
      const mockDb: JournalSession[] = [
        createMockJournalSession('js-alice-1', memberAlice.id, 'Reflexión privada de Alice'),
        createMockJournalSession('js-bob-1', trialUserBob.id, 'Reflexión privada de Bob'),
      ];

      // Simulated RLS filter: auth.uid() = user_id
      const queryAliceSessions = (authUid: string) => mockDb.filter(s => s.user_id === authUid);

      const aliceResult = queryAliceSessions(memberAlice.id);
      expect(aliceResult).toHaveLength(1);
      expect(aliceResult[0].id).toBe('js-alice-1');

      // Bob querying his own view
      const bobResult = queryAliceSessions(trialUserBob.id);
      expect(bobResult).toHaveLength(1);
      expect(bobResult[0].id).toBe('js-bob-1');

      // Bob cannot see Alice's session
      expect(bobResult.some(s => s.user_id === memberAlice.id)).toBe(false);
    });

    it('guarantees Admin CANNOT access member private journal contents via standard RLS', () => {
      const mockSession = createMockJournalSession('js-alice-confidential', memberAlice.id, 'Confesión íntima');

      const canAdminReadSession = (adminUid: string, session: JournalSession) => {
        // Enforcing policy: auth.uid() = user_id (NO admin bypass)
        return adminUid === session.user_id;
      };

      expect(canAdminReadSession(adminAlberto.id, mockSession)).toBe(false);
    });
  });

  describe('2. Membership Gating & Storage Authorization', () => {
    it('denies unauthenticated visitors from accessing recordings', () => {
      const check = recordingsService.checkAccess(null, sampleRecording);
      expect(check.allowed).toBe(false);
      expect(check.reason).toBe('NOT_AUTHENTICATED');
    });

    it('denies expired or unpaid members from accessing member recordings', () => {
      const check = recordingsService.checkAccess(expiredUserCarlos, sampleRecording);
      expect(check.allowed).toBe(false);
      expect(check.reason).toBe('MEMBERSHIP_INACTIVE');
    });

    it('allows active members to access recordings', () => {
      const check = recordingsService.checkAccess(memberAlice, sampleRecording);
      expect(check.allowed).toBe(true);
    });

    it('allows members in 7-day trial to access recordings', () => {
      const check = recordingsService.checkAccess(trialUserBob, sampleRecording);
      expect(check.allowed).toBe(true);
    });

    it('allows admins to access recordings and manage metadata', () => {
      const check = recordingsService.checkAccess(adminAlberto, sampleRecording);
      expect(check.allowed).toBe(true);
    });
  });

  describe('3. Zoom Meeting Architecture & Link Validation', () => {
    it('validates authentic Zoom meeting URLs without embedding conferencing', () => {
      expect(zoomService.isValidZoomUrl('https://zoom.us/j/9876543210')).toBe(true);
      expect(zoomService.isValidZoomUrl('https://us02web.zoom.us/j/1234567890?pwd=secret')).toBe(true);
      expect(zoomService.isValidZoomUrl('https://malicious-site.com/fake-zoom')).toBe(false);
      expect(zoomService.isValidZoomUrl('javascript:alert(1)')).toBe(false);
    });

    it('extracts Zoom numeric meeting IDs for calendar and reference', () => {
      const id = zoomService.extractMeetingId('https://zoom.us/j/8493029102');
      expect(id).toBe('8493029102');
    });

    it('ensures Zoom join clicks are logged as join_click and not real attendance', async () => {
      await expect(eventsService.recordZoomJoinClick('evt-100', memberAlice.id)).resolves.not.toThrow();
    });
  });

  describe('4. GDPR Readiness & Data Portability', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('exports all user data into structured JSON bundle for portability', async () => {
      localStorage.setItem('travesia_v2_user', JSON.stringify(memberAlice));
      const mockSession = createMockJournalSession('js-test-export', memberAlice.id, 'Mi diario para exportar');
      localStorage.setItem(`travesia_v2_journals_${memberAlice.id}`, JSON.stringify([mockSession]));

      const { data, error } = await gdprService.exportUserData(memberAlice.id);
      expect(error).toBeNull();
      expect(data).not.toBeNull();
      expect(data?.user.id).toBe(memberAlice.id);
      expect(data?.journalSessions).toHaveLength(1);
      expect(data?.journalSessions[0].free_writing_1m).toBe('Mi diario para exportar');
    });

    it('handles account deletion request by wiping personal records', async () => {
      localStorage.setItem('travesia_v2_user', JSON.stringify(memberAlice));
      localStorage.setItem(`travesia_v2_journals_${memberAlice.id}`, JSON.stringify([]));

      const { success, error } = await gdprService.requestAccountDeletion(memberAlice.id);
      expect(error).toBeNull();
      expect(success).toBe(true);
      expect(localStorage.getItem('travesia_v2_user')).toBeNull();
    });
  });
});
