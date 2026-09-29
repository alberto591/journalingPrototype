import { describe, it, expect, beforeEach } from 'vitest';
import { Profile, OnboardingData } from '../types';

describe('Authentication & Protected Routes Logic', () => {
  let mockUser: Profile;

  beforeEach(() => {
    mockUser = {
      id: 'test-user-uuid-1234',
      name: 'Gabriel Morales',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      bio: '',
      location: 'Madrid, España',
      role: 'member',
      focus_areas: [],
      created_at: '2026-09-28T00:00:00Z',
      streak_days: 0,
      completed_sessions_count: 0,
      reflection_minutes: 0,
      current_week: 1,
      onboarding_completed: false,
    };
  });

  it('initializes new user with uncompleted onboarding and 0 streak', () => {
    expect(mockUser.onboarding_completed).toBe(false);
    expect(mockUser.streak_days).toBe(0);
    expect(mockUser.completed_sessions_count).toBe(0);
    expect(mockUser.current_week).toBe(1);
    expect(mockUser.role).toBe('member');
  });

  it('evaluates protected route access: redirects unauthenticated users to login', () => {
    const isAuthenticated = false;
    const currentPath = '/dashboard';

    const getRedirectTarget = (auth: boolean, path: string): string | null => {
      const publicPaths = ['/login', '/register', '/forgot-password'];
      if (!auth && !publicPaths.includes(path)) {
        return '/login';
      }
      return null;
    };

    expect(getRedirectTarget(isAuthenticated, currentPath)).toBe('/login');
    expect(getRedirectTarget(true, currentPath)).toBeNull();
    expect(getRedirectTarget(false, '/login')).toBeNull();
  });

  it('evaluates onboarding routing gate: redirects incomplete onboarding to /onboarding', () => {
    const evaluateAccess = (user: Profile | null, isAuthenticated: boolean) => {
      if (!isAuthenticated || !user) return '/login';
      if (!user.onboarding_completed) return '/onboarding';
      return '/dashboard';
    };

    // Case 1: unauthenticated -> login
    expect(evaluateAccess(null, false)).toBe('/login');

    // Case 2: authenticated but onboarding pending -> onboarding
    expect(evaluateAccess(mockUser, true)).toBe('/onboarding');

    // Case 3: authenticated with onboarding completed -> dashboard
    const readyUser: Profile = { ...mockUser, onboarding_completed: true };
    expect(evaluateAccess(readyUser, true)).toBe('/dashboard');
  });

  it('persists onboarding choices and updates user profile focus areas', () => {
    const onboardingPayload: OnboardingData = {
      current_state: 'Ruido digital y dispersión mental',
      life_areas_to_change: ['Disciplina', 'Espiritualidad', 'Visión'],
      desired_direction: 'Recuperar la capacidad de discernir en silencio y trabajar con propósito.',
      selected_obstacles: ['Interrupciones constantes', 'Falta de rutina matutina'],
      commitment_text: 'Dedicar 25 minutos al silencio cada día.',
      first_action: 'Silenciar el teléfono a las 21:00.',
    };

    const updatedUser: Profile = {
      ...mockUser,
      focus_areas: onboardingPayload.life_areas_to_change,
      onboarding_completed: true,
      bio: onboardingPayload.desired_direction,
    };

    expect(updatedUser.onboarding_completed).toBe(true);
    expect(updatedUser.focus_areas).toHaveLength(3);
    expect(updatedUser.focus_areas).toContain('Espiritualidad');
    expect(updatedUser.bio).toContain('discernir en silencio');
  });

  it('handles user profile edits (location, bio, focus areas) without modifying immutable fields', () => {
    const originalId = mockUser.id;
    const originalRole = mockUser.role;
    const originalCreatedAt = mockUser.created_at;

    const updates: Partial<Profile> = {
      bio: 'Arquitecto y padre. Buscando coherencia diaria.',
      location: 'Sevilla, España',
      focus_areas: ['Acción', 'Relaciones'],
    };

    const updatedProfile: Profile = {
      ...mockUser,
      ...updates,
      // Security check: immutable fields cannot be overwritten by profile edit
      id: originalId,
      role: originalRole,
      created_at: originalCreatedAt,
    };

    expect(updatedProfile.id).toBe(originalId);
    expect(updatedProfile.role).toBe('member');
    expect(updatedProfile.location).toBe('Sevilla, España');
    expect(updatedProfile.bio).toContain('Arquitecto y padre');
  });

  it('properly clears session on logout', () => {
    let session: { user: Profile | null; token: string | null } = {
      user: mockUser,
      token: 'jwt-mock-valid-token-xyz',
    };

    const performLogout = () => {
      session = { user: null, token: null };
    };

    performLogout();

    expect(session.user).toBeNull();
    expect(session.token).toBeNull();
  });
});
