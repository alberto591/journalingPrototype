import { describe, it, expect } from 'vitest';
import { journeyService } from '../services/journeyService';
import { Profile } from '../types';

const createMockProfile = (partial: Partial<Profile>): Profile => ({
  id: 'test-user-id',
  name: 'Test Member',
  email: 'member@test.com',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  bio: 'Caminante en busca de quietud y trabajo.',
  role: 'member',
  focus_areas: ['Ruido Mental', 'Dirección'],
  created_at: '2026-09-01T08:00:00Z',
  streak_days: 1,
  completed_sessions_count: 1,
  reflection_minutes: 15,
  current_week: 1,
  onboarding_completed: true,
  membership_status: 'ACTIVE',
  ...partial,
});

describe('TRAVESÍA — Continuous Retention Journey Architecture', () => {
  // Test 1: User joining October 3 vs User joining October 17
  describe('Independent Journey & Billing Dates (Requirement 1, 7, 20)', () => {
    const userA_Oct3 = createMockProfile({
      id: 'user-a-oct-3',
      name: 'Alberto Octubre 3',
      email: 'usera@example.com',
      membership_status: 'ACTIVE',
      membership_started_at: '2026-10-03T08:00:00Z',
      journey_started_at: '2026-10-03T08:00:00Z',
      billing_started_at: '2026-10-03T08:00:00Z',
      created_at: '2026-10-03T08:00:00Z',
    });

    const userB_Oct17 = createMockProfile({
      id: 'user-b-oct-17',
      name: 'Bernardo Octubre 17',
      email: 'userb@example.com',
      membership_status: 'ACTIVE',
      membership_started_at: '2026-10-17T08:00:00Z',
      journey_started_at: '2026-10-17T08:00:00Z',
      billing_started_at: '2026-10-17T08:00:00Z',
      created_at: '2026-10-17T08:00:00Z',
    });

    it('calculates independent journey dates for User A and User B', () => {
      const progressA = journeyService.calculatePersonalFoundationProgress(userA_Oct3);
      const progressB = journeyService.calculatePersonalFoundationProgress(userB_Oct17);

      expect(progressA.journeyStartedAt).toBe('2026-10-03T08:00:00Z');
      expect(progressB.journeyStartedAt).toBe('2026-10-17T08:00:00Z');
      expect(progressA.journeyStartedAt).not.toEqual(progressB.journeyStartedAt);
    });

    it('calculates independent anniversary-based billing dates (never tied to 1st of month)', () => {
      const billingA = journeyService.calculateBillingDates(userA_Oct3);
      const billingB = journeyService.calculateBillingDates(userB_Oct17);

      const nextA = new Date(billingA.nextBillingDate);
      const nextB = new Date(billingB.nextBillingDate);

      // User A renews on day 3
      expect(nextA.getUTCDate()).toBe(3);
      // User B renews on day 17
      expect(nextB.getUTCDate()).toBe(17);

      // Neither is tied to the 1st of the month
      expect(nextA.getUTCDate()).not.toBe(1);
      expect(nextB.getUTCDate()).not.toBe(1);
    });

    it('both see the same global community cycle regardless of start date (Requirement 5 & 20)', () => {
      const globalCycle = journeyService.getCurrentCommunityCycle();
      expect(globalCycle).toBeDefined();
      expect(globalCycle.title).toBe('Relaciones');
      expect(globalCycle.status).toBe('active');
    });

    it('both have active membership access to today live session (Requirement 6 & 20)', () => {
      expect(journeyService.hasActiveMembership(userA_Oct3)).toBe(true);
      expect(journeyService.hasActiveMembership(userB_Oct17)).toBe(true);
    });
  });

  // Test 2: Foundation Completion & Transition to Ongoing Cycle (Requirement 2, 3, 10, 20)
  describe('Foundation Journey Completion & Transition into Ongoing Cycle', () => {
    const rawUser = createMockProfile({
      id: 'foundation-user-1',
      name: 'Carlos Caminante',
      email: 'carlos@example.com',
      current_week: 4,
      streak_days: 28,
      membership_status: 'ACTIVE',
      membership_started_at: '2026-09-01T08:00:00Z',
      journey_started_at: '2026-09-01T08:00:00Z',
      billing_started_at: '2026-09-01T08:00:00Z',
      created_at: '2026-09-01T08:00:00Z',
    });

    it('transitions user into ongoing experience upon foundation completion without terminating membership', () => {
      expect(rawUser.foundation_completed_at).toBeUndefined();

      const completedUser = journeyService.completeFoundationJourney(rawUser);

      // Sets foundation_completed_at
      expect(completedUser.foundation_completed_at).toBeDefined();
      // Membership stays active (not expired or cancelled)
      expect(completedUser.membership_status).toBe('ACTIVE');
      // Current cycle is assigned to active community cycle
      expect(completedUser.current_cycle_id).toBe('cycle-relaciones');
      expect(completedUser.current_cycle_week).toBe(journeyService.getCurrentGlobalCommunityWeek());
    });

    it('renders timeline with completed foundation and active ongoing cycle (Requirement 14)', () => {
      const completedUser = journeyService.completeFoundationJourney(rawUser);
      const timeline = journeyService.getMemberTimeline(completedUser);

      // Foundation item is marked completed
      const foundationItem = timeline.find(item => item.type === 'foundation');
      expect(foundationItem).toBeDefined();
      expect(foundationItem?.status).toBe('completed');
      expect(foundationItem?.completed_at).toBeDefined();

      // First ongoing cycle item is current
      const ongoingItem = timeline.find(item => item.id === 'cycle-relaciones');
      expect(ongoingItem).toBeDefined();
      expect(ongoingItem?.status).toBe('current');
    });
  });

  // Test 3: Cycle Completion, Reflection & Transition to Next Cycle (Requirement 13 & 20)
  describe('Cycle Completion & Transition to Next Cycle', () => {
    const continuingMember = createMockProfile({
      id: 'continuing-member-1',
      name: 'Elena Constante',
      email: 'elena@example.com',
      current_week: 4,
      streak_days: 60,
      membership_status: 'ACTIVE',
      foundation_completed_at: '2026-08-01T00:00:00Z',
      current_cycle_id: 'cycle-relaciones',
      current_cycle_week: 4,
      created_at: '2026-07-01T00:00:00Z',
    });

    it('records cycle reflection with all 4 contractual questions (Requirement 13)', () => {
      const reflection = journeyService.submitCycleReflection(
        continuingMember,
        'cycle-relaciones',
        'Relaciones',
        {
          discovered: 'Que la evasión del conflicto envenenaba mis mañanas.',
          changed: 'He hablado con transparencia con mi socio y mi esposa.',
          carrying_forward: 'La regla de oro de la conversación antes del ocaso.',
          explore_next: 'Ordenar mi vocación y trabajo sin sacrificar a los míos.'
        }
      );

      expect(reflection.id).toBeDefined();
      expect(reflection.user_id).toBe(continuingMember.id);
      expect(reflection.cycle_id).toBe('cycle-relaciones');
      expect(reflection.discovered).toContain('evasión');
      expect(reflection.changed).toContain('transparencia');
      expect(reflection.carrying_forward).toContain('regla de oro');
      expect(reflection.explore_next).toContain('vocación');
    });

    it('marks completed cycle as completed in the member timeline after reflection', () => {
      const timeline = journeyService.getMemberTimeline(continuingMember);
      const cycle1 = timeline.find(t => t.id === 'cycle-relaciones');
      expect(cycle1?.status).toBe('completed');
    });
  });

  // Test 4: Membership Access Control & Expired Protection (Requirement 20)
  describe('Membership Gating & Expired Status (Requirement 20)', () => {
    it('grants access to active and trial members', () => {
      const activeUser = createMockProfile({ membership_status: 'ACTIVE' });
      const trialUser = createMockProfile({ membership_status: 'TRIAL' });
      expect(journeyService.hasActiveMembership(activeUser)).toBe(true);
      expect(journeyService.hasActiveMembership(trialUser)).toBe(true);
    });

    it('denies access to expired, cancelled, or paused members', () => {
      const expiredUser = createMockProfile({ membership_status: 'EXPIRED' });
      const cancelledUser = createMockProfile({ membership_status: 'CANCELLED' });
      const pausedUser = createMockProfile({ membership_status: 'PAUSED' });

      expect(journeyService.hasActiveMembership(expiredUser)).toBe(false);
      expect(journeyService.hasActiveMembership(cancelledUser)).toBe(false);
      expect(journeyService.hasActiveMembership(pausedUser)).toBe(false);
    });
  });

  // Test 5: Continuous Retention Metrics Calculation (Requirement 17)
  describe('Continuous Retention Metrics (Requirement 17)', () => {
    it('calculates week 4 continuation rate and foundation completion accurately', () => {
      const sampleMembers: Profile[] = [
        createMockProfile({
          id: 'm1',
          name: 'Member 1',
          email: 'm1@test.com',
          current_week: 2,
          streak_days: 5,
          created_at: '2026-09-01T00:00:00Z',
        }),
        createMockProfile({
          id: 'm2',
          name: 'Member 2',
          email: 'm2@test.com',
          current_week: 4,
          streak_days: 28,
          foundation_completed_at: '2026-09-28T00:00:00Z',
          current_cycle_id: 'cycle-relaciones',
          created_at: '2026-09-01T00:00:00Z',
        }),
      ];

      const metrics = journeyService.calculateContinuousRetentionMetrics(sampleMembers, []);

      expect(metrics.total_members_analyzed).toBe(2);
      expect(metrics.foundation_completion_rate).toBe(50); // 1 of 2
      expect(metrics.continuation_after_week_4_rate).toBe(100); // 1 of 1 who reached week 4 transitioned
    });
  });
});
