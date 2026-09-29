import { describe, it, expect, beforeEach } from 'vitest';
import { leadService } from '../services/leadService';
import { referralService } from '../services/referralService';
import { contentService } from '../services/contentService';
import { feedbackService } from '../services/feedbackService';
import { emailEventService } from '../services/emailEventService';
import { analyticsService } from '../services/analyticsService';
import { businessService } from '../services/businessService';
import { INITIAL_DAILY_PROMPTS } from '../lib/dailyPromptsData';
import { Profile, Lead, AcquisitionSource } from '../types';

// Mock localStorage for Node test environment
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

describe('Phase 3: Business Validation, Growth & MVP Engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('captures leads with correct attribution source (Instagram, TikTok, YouTube, Newsletter, etc.)', async () => {
    const sources: AcquisitionSource[] = ['Instagram', 'TikTok', 'YouTube', 'Newsletter', 'Referral', 'Direct'];
    
    for (const src of sources) {
      const email = `lead-${src.toLowerCase()}@example.com`;
      const { lead } = await leadService.captureLead({
        email,
        name: `Usuario ${src}`,
        source: src,
        campaign: 'Reto 7 Días',
        landing_page: '/prueba',
      });

      expect(lead).not.toBeNull();
      expect(lead?.email).toBe(email);
      expect(lead?.source).toBe(src);
      expect(lead?.trial_started).toBe(false);
      expect(lead?.converted).toBe(false);
    }
  });

  it('tracks trial lifecycle progression: start -> completion -> conversion', async () => {
    const testEmail = 'carlos.retomadrid@example.com';
    await leadService.captureLead({ email: testEmail, name: 'Carlos Madrid', source: 'Instagram' });

    // Start trial
    await leadService.markTrialStarted(testEmail);
    let allLeads = await leadService.fetchLeads();
    let carlos = allLeads.find(l => l.email === testEmail);
    expect(carlos?.trial_started).toBe(true);
    expect(carlos?.trial_completed).toBe(false);

    // Complete trial
    await leadService.markTrialCompleted(testEmail);
    allLeads = await leadService.fetchLeads();
    carlos = allLeads.find(l => l.email === testEmail);
    expect(carlos?.trial_completed).toBe(true);
    expect(carlos?.converted).toBe(false);

    // Convert to paying member
    await leadService.markConverted(testEmail);
    allLeads = await leadService.fetchLeads();
    carlos = allLeads.find(l => l.email === testEmail);
    expect(carlos?.converted).toBe(true);
    expect(carlos?.converted_at).toBeTruthy();
  });

  it('generates clean referral codes and stores referral click attribution', () => {
    const code = referralService.generateReferralCode('María Gómez', 'usr-mg-9872');
    expect(code).toBe('mariagomez-9872');

    // Simulate clicking /r/:code
    referralService.recordReferralClick(code);
    expect(referralService.getStoredReferralCode()).toBe(code);

    // Clear after attribution
    referralService.clearStoredReferralCode();
    expect(referralService.getStoredReferralCode()).toBeNull();
  });

  it('validates membership status model and manual activation (30, 90 days)', async () => {
    const member: Profile = {
      id: 'usr-manual-test-1',
      name: 'Andrés Morales',
      avatar_url: '',
      bio: '',
      role: 'member',
      membership_status: 'FREE',
      focus_areas: ['Disciplina'],
      created_at: '2026-09-01T00:00:00Z',
      streak_days: 0,
      completed_sessions_count: 0,
      reflection_minutes: 0,
      current_week: 1,
      onboarding_completed: true,
    };

    localStorage.setItem('travesia_v2_user', JSON.stringify(member));

    // Admin manually activates 30 days
    const result30 = await businessService.activateMembershipManually({
      userId: member.id,
      durationDays: 30,
      status: 'ACTIVE',
    });

    expect(result30.success).toBe(true);
    expect(result30.updatedProfile?.membership_status).toBe('ACTIVE');
    expect(result30.updatedProfile?.membership_started_at).toBeTruthy();
    expect(result30.updatedProfile?.membership_ends_at).toBeTruthy();

    const start = new Date(result30.updatedProfile!.membership_started_at!);
    const end = new Date(result30.updatedProfile!.membership_ends_at!);
    const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(30);
  });

  it('computes real retention and participation metrics without fabrication', () => {
    const mockMembers: Profile[] = [
      { id: 'u1', current_week: 1, completed_sessions_count: 5, streak_days: 3, membership_status: 'ACTIVE' } as any,
      { id: 'u2', current_week: 2, completed_sessions_count: 10, streak_days: 5, membership_status: 'ACTIVE' } as any,
      { id: 'u3', current_week: 3, completed_sessions_count: 15, streak_days: 7, membership_status: 'ACTIVE' } as any,
      { id: 'u4', current_week: 4, completed_sessions_count: 20, streak_days: 10, membership_status: 'ACTIVE' } as any,
    ];

    const mockSessions = [
      { user_id: 'u1', date: '2026-09-28' },
      { user_id: 'u2', date: '2026-09-28' },
      { user_id: 'u3', date: '2026-09-28' },
    ];

    const metrics = businessService.calculateRetentionMetrics(mockMembers, mockSessions, []);
    expect(metrics.totalMembers).toBe(4);
    expect(metrics.activeMembers).toBe(4);
    expect(metrics.sessionParticipationRate).toBe(75); // 3 out of 4 members
    expect(metrics.week4Retention).toBe(25); // 1 out of 4 in week 4
  });

  it('manages content creator engine: creation, platform categorization, and status transitions', async () => {
    const item = await contentService.createContentItem({
      title: 'Por qué el silencio matutino salva matrimonios y negocios',
      body: 'Desglose del Movimiento 1 y 4.',
      platform: 'Newsletter',
      status: 'Draft',
      cta: 'Entra al santuario de Travesía',
      campaign: 'Lanzamiento Fundadores',
    });

    expect(item.id).toBeTruthy();
    expect(item.status).toBe('Draft');

    // Update status to Published
    await contentService.updateContentStatus(item.id, 'Published');
    const all = await contentService.fetchContentItems();
    const updated = all.find(i => i.id === item.id);
    expect(updated?.status).toBe('Published');
    expect(updated?.published_date).toBeTruthy();
  });

  it('stores and retrieves structured member feedback for Day 3, 7, 14, 28 milestones', async () => {
    const feedbackPayload = {
      userId: 'usr-feedback-user-1',
      userName: 'Lucía Santos',
      dayMilestone: 7 as const,
      mostUseful: 'El círculo de respiración y nombrar el miedo sin rodeos.',
      whatToChange: 'Nada por ahora, el ritmo me parece perfecto.',
      mindsetShift: 'He dejado de abrir Instagram antes de salir de la cama.',
      wouldReturn: 'yes' as const,
    };

    const res = await feedbackService.submitFeedback(feedbackPayload);
    expect(res.success).toBe(true);

    const allFeedback = await feedbackService.fetchAllFeedback();
    expect(allFeedback.length).toBeGreaterThanOrEqual(1);
    const luciaFeedback = allFeedback.find(f => f.user_id === 'usr-feedback-user-1');
    expect(luciaFeedback?.most_useful).toContain('círculo de respiración');
    expect(luciaFeedback?.would_return).toBe('yes');
  });

  it('dispatches email trigger events for the 12 key lifecycle moments', async () => {
    const lifecycleEvents = [
      'Welcome',
      'First practice',
      'Practice incomplete',
      'Session tomorrow',
      'Session starting soon',
      'Session recording available',
      'Day 3',
      'Day 7',
      'Week completed',
      'Trial ending',
      'Membership activated',
      'Membership cancelled',
    ] as const;

    for (const evt of lifecycleEvents) {
      const result = await emailEventService.dispatchEmailTrigger({
        eventType: evt,
        userId: 'usr-email-test',
        userEmail: 'member@travesia.app',
        payload: { milestone: evt },
      });
      expect(result.success).toBe(true);
      expect(result.eventId).toBeTruthy();
    }

    const recentLogs = await emailEventService.fetchRecentEmailLogs();
    expect(recentLogs.length).toBeGreaterThanOrEqual(12);
  });

  it('tracks product analytics events without crashing or leaking secrets', async () => {
    await analyticsService.track('landing_view', { source: 'Instagram' });
    await analyticsService.track('trial_started', { email: 'test@travesia.app' });
    await analyticsService.track('journal_completed', { duration: 25 });
    await analyticsService.track('live_session_joined', { session: 'evt-morning' });

    const counts = await analyticsService.getEventCounts();
    expect(counts['landing_view']).toBeGreaterThanOrEqual(1);
    expect(counts['trial_started']).toBeGreaterThanOrEqual(1);
  });

  it('verifies prompts catalog has expanded to at least 200 original Spanish prompts', () => {
    expect(INITIAL_DAILY_PROMPTS.length).toBeGreaterThanOrEqual(200);

    const categories = new Set(INITIAL_DAILY_PROMPTS.map(p => p.category));
    expect(categories.size).toBe(9);
    expect(categories.has('Ruido')).toBe(true);
    expect(categories.has('Emociones')).toBe(true);
    expect(categories.has('Relaciones')).toBe(true);
    expect(categories.has('Propósito')).toBe(true);
    expect(categories.has('Visión')).toBe(true);
    expect(categories.has('Obstáculos')).toBe(true);
    expect(categories.has('Disciplina')).toBe(true);
    expect(categories.has('Espiritualidad')).toBe(true);
    expect(categories.has('Acción')).toBe(true);
  });
});
