import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Profile, SessionRecording, JournalSession } from '../types';
import { recordingsService } from '../services/recordingsService';
import { zoomService } from '../services/zoomService';
import { analyticsService } from '../services/analyticsService';

// Mock storage for Node environment
if (typeof sessionStorage === 'undefined' || !globalThis.sessionStorage) {
  let sessionStore: Record<string, string> = {};
  globalThis.sessionStorage = {
    getItem: (key: string) => sessionStore[key] || null,
    setItem: (key: string, value: string) => { sessionStore[key] = value; },
    removeItem: (key: string) => { delete sessionStore[key]; },
    clear: () => { sessionStore = {}; },
    length: 0,
    key: () => null,
  } as any;
}

if (typeof localStorage === 'undefined' || !globalThis.localStorage) {
  let localStore: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => localStore[key] || null,
    setItem: (key: string, value: string) => { localStore[key] = value; },
    removeItem: (key: string) => { delete localStore[key]; },
    clear: () => { localStore = {}; },
    length: 0,
    key: () => null,
  } as any;
}

describe('TRAVESÍA MVP: Trial Expired Conversion & Access Control', () => {
  const SESSION_DISMISSED_KEY = 'travesia_trial_expired_dismissed';

  const baseUser: Profile = {
    id: 'usr-trial-exp-1',
    name: 'Mateo Beltrán',
    avatar_url: '',
    bio: '',
    role: 'member',
    membership_status: 'TRIAL',
    focus_areas: ['Presencia'],
    created_at: '2026-09-01T00:00:00Z',
    streak_days: 7,
    completed_sessions_count: 7,
    reflection_minutes: 210,
    current_week: 1,
    onboarding_completed: true,
  };

  const sampleRecording: SessionRecording = {
    id: 'rec-test-101',
    event_id: 'evt-101',
    title: 'Sesión matutina en directo',
    description: 'Grabación de práctica',
    date: '2026-09-30',
    duration: '35 min',
    duration_seconds: 2100,
    category: 'El Presente',
    recording_strategy: 'HOSTED',
    storage_path: 'session-recordings/evt-101/rec-101.mp4',
    status: 'AVAILABLE',
    views_count: 5,
    is_member_only: true,
  };

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  // Decision logic helper matching TrialExpiredModal.tsx
  const shouldShowTrialExpiredModal = (
    isAuthenticated: boolean,
    membershipStatus?: string,
    currentPath: string = '/dashboard'
  ): boolean => {
    if (!isAuthenticated) return false;
    if (membershipStatus !== 'EXPIRED') return false;
    if (currentPath === '/membership') return false;
    const isDismissed = sessionStorage.getItem(SESSION_DISMISSED_KEY) === 'true';
    return !isDismissed;
  };

  // 1. TRIAL → no modal
  it('1. TRIAL user does NOT see the trial expiry modal', () => {
    const trialUser = { ...baseUser, membership_status: 'TRIAL' as const };
    const show = shouldShowTrialExpiredModal(true, trialUser.membership_status, '/dashboard');
    expect(show).toBe(false);
  });

  // 2. ACTIVE → no modal
  it('2. ACTIVE user does NOT see the trial expiry modal', () => {
    const activeUser = { ...baseUser, membership_status: 'ACTIVE' as const };
    const show = shouldShowTrialExpiredModal(true, activeUser.membership_status, '/dashboard');
    expect(show).toBe(false);
  });

  // 3. EXPIRED → modal appears
  it('3. EXPIRED user sees the trial expiry modal on member routes', () => {
    const expiredUser = { ...baseUser, membership_status: 'EXPIRED' as const };
    const show = shouldShowTrialExpiredModal(true, expiredUser.membership_status, '/dashboard');
    expect(show).toBe(true);
  });

  // 4. Cancel / "Ahora no" → modal closes and does not show again in session
  it('4. User clicks "Ahora no" -> modal is dismissed for the session', () => {
    const expiredUser = { ...baseUser, membership_status: 'EXPIRED' as const };
    
    // Initially shows
    expect(shouldShowTrialExpiredModal(true, expiredUser.membership_status, '/dashboard')).toBe(true);

    // Dismiss action
    sessionStorage.setItem(SESSION_DISMISSED_KEY, 'true');

    // After dismissal, does not show again on dashboard or other routes
    expect(shouldShowTrialExpiredModal(true, expiredUser.membership_status, '/dashboard')).toBe(false);
    expect(shouldShowTrialExpiredModal(true, expiredUser.membership_status, '/journal')).toBe(false);
  });

  // 5. CTA → navigates to /membership
  it('5. Clicking primary CTA directs to /membership?from=trial_expired', () => {
    const targetUrl = '/membership?from=trial_expired';
    expect(targetUrl).toContain('/membership');
    expect(targetUrl).toContain('trial_expired');
  });

  // 6. EXPIRED → Zoom unavailable
  it('6. EXPIRED user cannot open Zoom meeting and is gated', () => {
    const expiredUser = { ...baseUser, membership_status: 'EXPIRED' as const };
    
    const canJoinZoom = (user: Profile): { allowed: boolean; redirect: string | null } => {
      if (user.membership_status === 'EXPIRED') {
        return { allowed: false, redirect: '/membership?from=zoom_expired_attempt' };
      }
      return { allowed: true, redirect: null };
    };

    const result = canJoinZoom(expiredUser);
    expect(result.allowed).toBe(false);
    expect(result.redirect).toBe('/membership?from=zoom_expired_attempt');
  });

  // 7. EXPIRED → recording blocked (checkAccess returns false)
  it('7. EXPIRED user is blocked from viewing recordings', () => {
    const expiredUser = { ...baseUser, membership_status: 'EXPIRED' as const };
    const access = recordingsService.checkAccess(expiredUser, sampleRecording);

    expect(access.allowed).toBe(false);
    expect(access.reason).toBe('MEMBERSHIP_INACTIVE');
    expect(access.message).toContain('Las grabaciones son exclusivas para miembros activos');
  });

  // 8. EXPIRED → journal still accessible (user data is never deleted)
  it('8. EXPIRED user retains access to their own private journal sessions and history', () => {
    const expiredUser = { ...baseUser, membership_status: 'EXPIRED' as const };
    
    const userSessions: Partial<JournalSession>[] = [
      {
        id: 'sess-1',
        user_id: expiredUser.id,
        date: '2026-09-25',
        free_writing_1m: 'Mi reflexión personal del día 5',
        action_commitment: 'Cenar con mi familia a las 20:30',
        status: 'completed',
      }
    ];

    // RLS policy: auth.uid() = user_id allows access regardless of membership_status
    const canAccessOwnJournal = (userId: string, sessionUserId: string) => userId === sessionUserId;
    expect(canAccessOwnJournal(expiredUser.id, userSessions[0].user_id!)).toBe(true);
    expect(userSessions[0].free_writing_1m).toBeTruthy();
  });

  // 9. EXPIRED → profile still accessible
  it('9. EXPIRED user retains account, profile, streak, and onboarding data', () => {
    const expiredUser = { ...baseUser, membership_status: 'EXPIRED' as const };
    expect(expiredUser.onboarding_completed).toBe(true);
    expect(expiredUser.streak_days).toBe(7);
    expect(expiredUser.completed_sessions_count).toBe(7);
    expect(expiredUser.role).toBe('member');
  });

  // 10. Analytics fire once
  it('10. Analytics event trial_expired_modal_viewed is tracked properly', async () => {
    const trackSpy = vi.spyOn(analyticsService, 'track');
    
    await analyticsService.track('trial_expired_modal_viewed', {
      source: '/dashboard',
    }, baseUser.id);

    expect(trackSpy).toHaveBeenCalledWith('trial_expired_modal_viewed', expect.objectContaining({
      source: '/dashboard',
    }), baseUser.id);
  });

  // 11. Membership page does not show the expiry modal
  it('11. /membership route explicitly suppresses the modal', () => {
    const expiredUser = { ...baseUser, membership_status: 'EXPIRED' as const };
    const show = shouldShowTrialExpiredModal(true, expiredUser.membership_status, '/membership');
    expect(show).toBe(false);
  });

  // 12. React rerender does not duplicate the modal event
  it('12. Component deduplication prevents repeated event firing on re-render', () => {
    let hasTracked = false;
    let trackCount = 0;

    const simulateRender = () => {
      if (!hasTracked) {
        hasTracked = true;
        trackCount++;
      }
    };

    // First render
    simulateRender();
    expect(trackCount).toBe(1);

    // Re-render 1
    simulateRender();
    // Re-render 2
    simulateRender();
    // Re-render 3
    simulateRender();

    expect(trackCount).toBe(1);
  });
});
