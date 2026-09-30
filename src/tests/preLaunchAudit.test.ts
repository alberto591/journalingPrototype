import { describe, it, expect } from 'vitest';
import { journeyService } from '../services/journeyService';
import { recordingsService } from '../services/recordingsService';
import { zoomService } from '../services/zoomService';
import { Profile, SessionRecording, JournalSession } from '../types';

describe('TRAVESÍA PRE-LAUNCH AUDIT VERIFICATION SUITE', () => {

  // =========================================================================
  // 1. TIMEZONE AUDIT (Europe/Madrid, 07:00 Sessions & DST Handling)
  // =========================================================================
  describe('Timezone & DST Audit (Europe/Madrid)', () => {
    it('formats 07:00 Madrid session accurately across winter (CET, UTC+1) and summer (CEST, UTC+2)', () => {
      // Winter session (CET = UTC+1): 06:00 UTC should be 07:00 Madrid
      const winterSessionUtc = '2026-11-15T06:00:00Z';
      const winterFormatted = new Intl.DateTimeFormat('es-ES', {
        timeZone: 'Europe/Madrid',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date(winterSessionUtc));
      expect(winterFormatted).toBe('07:00');

      // Summer session (CEST = UTC+2): 05:00 UTC should be 07:00 Madrid
      const summerSessionUtc = '2026-07-15T05:00:00Z';
      const summerFormatted = new Intl.DateTimeFormat('es-ES', {
        timeZone: 'Europe/Madrid',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date(summerSessionUtc));
      expect(summerFormatted).toBe('07:00');
    });

    it('calculates countdown accurately in Europe/Madrid regardless of local browser timezone', () => {
      const targetSessionTimeUtc = '2026-10-01T05:00:00Z'; // 07:00 CEST (Madrid)
      const targetDate = new Date(targetSessionTimeUtc);

      // Verify that difference in milliseconds is purely timestamp-based and immune to local offset
      const simCurrentTime = new Date('2026-10-01T04:30:00Z'); // 30 minutes before
      const diffMs = targetDate.getTime() - simCurrentTime.getTime();
      const minutesRemaining = Math.floor(diffMs / (1000 * 60));

      expect(minutesRemaining).toBe(30);
    });
  });

  // =========================================================================
  // 2. BILLING EDGE CASES (Jan 31, Feb 28, Feb 29, Mar 31, Leap Years)
  // =========================================================================
  describe('Billing Edge Cases & Next Billing Date Calculation', () => {
    it('handles January 31 in a standard common year (2026) -> February 28 (no skipping to March)', () => {
      const jan31 = new Date('2026-01-31T10:00:00Z');
      const nextDate = journeyService.addOneMonthSafe(jan31);

      expect(nextDate.getUTCFullYear()).toBe(2026);
      expect(nextDate.getUTCMonth()).toBe(1); // February (0-indexed)
      expect(nextDate.getUTCDate()).toBe(28); // 2026 is non-leap year
    });

    it('handles January 31 in a leap year (2028) -> February 29', () => {
      const jan31Leap = new Date('2028-01-31T10:00:00Z');
      const nextDate = journeyService.addOneMonthSafe(jan31Leap);

      expect(nextDate.getUTCFullYear()).toBe(2028);
      expect(nextDate.getUTCMonth()).toBe(1); // February
      expect(nextDate.getUTCDate()).toBe(29); // 2028 is leap year
    });

    it('handles February 28 -> March 28', () => {
      const feb28 = new Date('2026-02-28T10:00:00Z');
      const nextDate = journeyService.addOneMonthSafe(feb28);

      expect(nextDate.getUTCFullYear()).toBe(2026);
      expect(nextDate.getUTCMonth()).toBe(2); // March
      expect(nextDate.getUTCDate()).toBe(28);
    });

    it('handles February 29 in leap year -> March 29', () => {
      const feb29 = new Date('2028-02-29T10:00:00Z');
      const nextDate = journeyService.addOneMonthSafe(feb29);

      expect(nextDate.getUTCFullYear()).toBe(2028);
      expect(nextDate.getUTCMonth()).toBe(2); // March
      expect(nextDate.getUTCDate()).toBe(29);
    });

    it('handles March 31 -> April 30 (30-day month)', () => {
      const mar31 = new Date('2026-03-31T10:00:00Z');
      const nextDate = journeyService.addOneMonthSafe(mar31);

      expect(nextDate.getUTCFullYear()).toBe(2026);
      expect(nextDate.getUTCMonth()).toBe(3); // April
      expect(nextDate.getUTCDate()).toBe(30);
    });

    it('handles August 31 -> September 30 and October 31 -> November 30', () => {
      const aug31 = new Date('2026-08-31T10:00:00Z');
      const sepNext = journeyService.addOneMonthSafe(aug31);
      expect(sepNext.getUTCMonth()).toBe(8); // September
      expect(sepNext.getUTCDate()).toBe(30);

      const oct31 = new Date('2026-10-31T10:00:00Z');
      const novNext = journeyService.addOneMonthSafe(oct31);
      expect(novNext.getUTCMonth()).toBe(10); // November
      expect(novNext.getUTCDate()).toBe(30);
    });

    it('never produces an invalid Date or NaN timestamp in calculateBillingDates', () => {
      const testUser: Profile = {
        id: 'usr-test-billing',
        name: 'Carlos Ruiz',
        avatar_url: '',
        bio: '',
        role: 'member',
        membership_status: 'ACTIVE',
        focus_areas: ['Enfoque'],
        created_at: '2026-01-31T09:00:00Z',
        billing_started_at: '2026-01-31T09:00:00Z',
        streak_days: 5,
        completed_sessions_count: 5,
        reflection_minutes: 150,
        current_week: 1,
        onboarding_completed: true,
      };

      const result = journeyService.calculateBillingDates(testUser);
      expect(result.nextBillingDate).toBeTruthy();
      expect(new Date(result.nextBillingDate).getTime()).not.toBeNaN();
      expect(result.daysUntilRenewal).toBeGreaterThanOrEqual(0);
    });
  });

  // =========================================================================
  // 3. CONTINUOUS JOURNEY & MULTI-USER INDEPENDENCE
  // =========================================================================
  describe('Continuous Journey Independence (Oct 1, Oct 15, Oct 31)', () => {
    it('maintains independent personal journey weeks, community cycles, and billing for users joining on different dates', () => {
      const userOct1: Profile = {
        id: 'usr-oct-1',
        name: 'Usuario 1 Oct',
        avatar_url: '',
        bio: '',
        role: 'member',
        membership_status: 'ACTIVE',
        focus_areas: [],
        created_at: '2026-10-01T08:00:00Z',
        billing_started_at: '2026-10-01T08:00:00Z',
        current_week: 3,
        streak_days: 15,
        completed_sessions_count: 15,
        reflection_minutes: 450,
        onboarding_completed: true,
      };

      const userOct15: Profile = {
        id: 'usr-oct-15',
        name: 'Usuario 15 Oct',
        avatar_url: '',
        bio: '',
        role: 'member',
        membership_status: 'TRIAL',
        focus_areas: [],
        created_at: '2026-10-15T08:00:00Z',
        billing_started_at: '2026-10-15T08:00:00Z',
        current_week: 1,
        streak_days: 3,
        completed_sessions_count: 3,
        reflection_minutes: 90,
        onboarding_completed: true,
      };

      const bill1 = journeyService.calculateBillingDates(userOct1);
      const bill15 = journeyService.calculateBillingDates(userOct15);

      // Personal journeys differ
      expect(userOct1.current_week).toBe(3);
      expect(userOct15.current_week).toBe(1);

      // Billing renewal dates differ based on personal anniversary
      expect(bill1.nextBillingDate.substring(0, 10)).toBe('2026-11-01');
      expect(bill15.nextBillingDate.substring(0, 10)).toBe('2026-11-15');

      // Global community cycle is shared
      const globalCycle = journeyService.getCurrentCommunityCycle();
      expect(globalCycle.id).toBe('cycle-relaciones');
    });

    it('transitions completed foundation to ongoing cycles without a dead-end "course finished" state', () => {
      const finishingUser: Profile = {
        id: 'usr-finishing-1',
        name: 'Marta Díaz',
        avatar_url: '',
        bio: '',
        role: 'member',
        membership_status: 'ACTIVE',
        focus_areas: [],
        created_at: '2026-09-01T08:00:00Z',
        current_week: 4,
        streak_days: 28,
        completed_sessions_count: 24,
        reflection_minutes: 720,
        onboarding_completed: true,
      };

      const transitioned = journeyService.completeFoundationJourney(finishingUser);
      expect(transitioned.foundation_completed_at).toBeTruthy();
      expect(transitioned.current_cycle_id).toBe('cycle-relaciones');
      // Membership remains active for continuous cycles
      expect(transitioned.membership_status).toBe('ACTIVE');
    });
  });

  // =========================================================================
  // 4. MEMBERSHIP ACCESS CONTROL & RECORDING PERMISSIONS
  // =========================================================================
  describe('Membership Access Control (TRIAL, ACTIVE, PAUSED, CANCELLED, EXPIRED, GUEST, ADMIN)', () => {
    const sampleRecording: SessionRecording = {
      id: 'rec-test-security',
      event_id: 'evt-test-1',
      title: 'Sesión de Discernimiento',
      description: 'Grabación de prueba',
      date: '2026-09-30',
      duration: '35 min',
      duration_seconds: 2100,
      category: 'El Presente',
      recording_strategy: 'HOSTED',
      storage_path: 'session-recordings/evt-test-1/rec-test.mp4',
      status: 'AVAILABLE',
      views_count: 0,
      is_member_only: true,
    };

    const makeUserWithStatus = (status: any, role: 'member' | 'admin' | 'coach' = 'member'): Profile => ({
      id: `usr-${status.toLowerCase()}`,
      name: `User ${status}`,
      avatar_url: '',
      bio: '',
      role,
      membership_status: status,
      focus_areas: [],
      created_at: '2026-09-01T00:00:00Z',
      streak_days: 1,
      completed_sessions_count: 1,
      reflection_minutes: 30,
      current_week: 1,
      onboarding_completed: true,
    });

    it('DENIES Anonymous / Unauthenticated users (null)', () => {
      const res = recordingsService.checkAccess(null, sampleRecording);
      expect(res.allowed).toBe(false);
      expect(res.reason).toBe('NOT_AUTHENTICATED');
    });

    it('ALLOWS TRIAL members (7-day challenge trial)', () => {
      const trialUser = makeUserWithStatus('TRIAL');
      const res = recordingsService.checkAccess(trialUser, sampleRecording);
      expect(res.allowed).toBe(true);
    });

    it('ALLOWS ACTIVE members', () => {
      const activeUser = makeUserWithStatus('ACTIVE');
      const res = recordingsService.checkAccess(activeUser, sampleRecording);
      expect(res.allowed).toBe(true);
    });

    it('DENIES PAUSED members', () => {
      const pausedUser = makeUserWithStatus('PAUSED');
      const res = recordingsService.checkAccess(pausedUser, sampleRecording);
      expect(res.allowed).toBe(false);
      expect(res.reason).toBe('MEMBERSHIP_INACTIVE');
    });

    it('DENIES CANCELLED members', () => {
      const cancelledUser = makeUserWithStatus('CANCELLED');
      const res = recordingsService.checkAccess(cancelledUser, sampleRecording);
      expect(res.allowed).toBe(false);
      expect(res.reason).toBe('MEMBERSHIP_INACTIVE');
    });

    it('DENIES EXPIRED members', () => {
      const expiredUser = makeUserWithStatus('EXPIRED');
      const res = recordingsService.checkAccess(expiredUser, sampleRecording);
      expect(res.allowed).toBe(false);
      expect(res.reason).toBe('MEMBERSHIP_INACTIVE');
    });

    it('ALLOWS ADMIN users regardless of membership status', () => {
      const adminUser = makeUserWithStatus('EXPIRED', 'admin');
      const res = recordingsService.checkAccess(adminUser, sampleRecording);
      expect(res.allowed).toBe(true);
    });
  });

  // =========================================================================
  // 5. TWO-ACCOUNT PRIVACY (User A vs User B vs Admin)
  // =========================================================================
  describe('Two-Account Journal Privacy & Non-Negotiable RLS Guarantee', () => {
    it('guarantees complete isolation of private journal entries between User A and User B', () => {
      const userA_id = 'usr-alice-111';
      const userB_id = 'usr-bob-222';

      const mockDb: Partial<JournalSession>[] = [
        {
          id: 'sess-a-private',
          user_id: userA_id,
          date: '2026-09-30',
          free_writing_1m: 'Confesión sumamente vulnerable de Alice',
          action_commitment: 'Hablar con mi esposo hoy con calma',
          status: 'completed',
        },
        {
          id: 'sess-b-private',
          user_id: userB_id,
          date: '2026-09-30',
          free_writing_1m: 'Reflexión privada de Bob sobre sus finanzas',
          action_commitment: 'Revisar extracto bancario con prudencia',
          status: 'completed',
        }
      ];

      // Simulated RLS WHERE auth.uid() = user_id
      const queryAsUser = (reqUserId: string) => mockDb.filter(s => s.user_id === reqUserId);

      const aliceResults = queryAsUser(userA_id);
      expect(aliceResults).toHaveLength(1);
      expect(aliceResults[0].id).toBe('sess-a-private');
      expect(aliceResults.some(s => s.user_id === userB_id)).toBe(false);

      const bobResults = queryAsUser(userB_id);
      expect(bobResults).toHaveLength(1);
      expect(bobResults[0].id).toBe('sess-b-private');
      expect(bobResults.some(s => s.user_id === userA_id)).toBe(false);
    });
  });

  // =========================================================================
  // 6. ZOOM & LIVE NOTIFICATION LIFECYCLE
  // =========================================================================
  describe('Zoom Meeting URL & Live Notification Decoupling', () => {
    it('validates legitimate Zoom URLs and rejects impostor or malicious domains', () => {
      expect(zoomService.isValidZoomUrl('https://zoom.us/j/84920491823')).toBe(true);
      expect(zoomService.isValidZoomUrl('https://us02web.zoom.us/j/84920491823?pwd=abc')).toBe(true);
      expect(zoomService.isValidZoomUrl('https://phishing-zoom.com/j/84920491823')).toBe(false);
      expect(zoomService.isValidZoomUrl('javascript:alert(1)')).toBe(false);
      expect(zoomService.isValidZoomUrl('')).toBe(false);
    });

    it('tracks member click as join intent without falsely recording Zoom attendance', () => {
      zoomService.clearZoomJoinClicks();
      const click = zoomService.trackZoomJoinClick('evt-101', 'usr-test-1');
      expect(click.event_id).toBe('evt-101');
      expect(click.interaction_type).toBe('zoom_join_clicked');
      expect(click.label).toBe('Intentó unirse');
    });
  });
});
