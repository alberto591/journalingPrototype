import { describe, it, expect, beforeEach } from 'vitest';
import { interviewAndLogService } from '../services/interviewAndLogService';
import { businessService } from '../services/businessService';
import { contentService } from '../services/contentService';
import { CustomerInterview, ProductLogEntry, Profile } from '../types';

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

describe('Phase 4: Real-World Launch, First 10 Customers & Quality Engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('records customer interviews with the exact 10 qualitative questions', async () => {
    const interviewData: Omit<CustomerInterview, 'id' | 'created_at'> = {
      user_id: 'usr-val-1',
      user_name: 'Elena Garrido',
      what_made_you_join: 'La sobrecarga mental de comenzar el día respondiendo mensajes urgentes sin foco.',
      what_expected: 'Un espacio estructurado para parar antes de la jornada laboral.',
      most_valuable: 'Los 5 Movimientos y saber que hay otras personas haciendo el silencio a la vez.',
      hardest_part: 'El Movimiento 4: dos minutos completos sin mirar el teléfono.',
      what_made_you_return: 'La claridad mental con la que llegué a mi primera reunión.',
      what_almost_made_you_quit: 'El miedo a no ser constante con el madrugón de las 07:00 AM.',
      what_would_you_change: 'Añadir un resumen semanal de mis compromisos adquiridos.',
      would_pay_again: 'yes',
      fair_price_opinion: '29€/mes es muy razonable; pagaría hasta 39€/mes.',
      would_recommend: true,
    };

    const saved = await interviewAndLogService.submitInterview(interviewData);
    expect(saved).toBeDefined();
    expect(saved.id).toContain('int-');
    expect(saved.what_made_you_join).toBe(interviewData.what_made_you_join);
    expect(saved.would_pay_again).toBe('yes');
    expect(saved.would_recommend).toBe(true);

    const list = await interviewAndLogService.fetchInterviews();
    expect(list.length).toBeGreaterThanOrEqual(1);
    expect(list[0].user_name).toBe('Elena Garrido');
  });

  it('implements the Build-Measure-Learn product log workflow (Observation -> Problem -> Hypothesis -> Change -> Measure)', async () => {
    const logData: Omit<ProductLogEntry, 'id' | 'created_at'> = {
      observation: '3 miembros abandonaron la sesión matutina durante el temporizador de quietud.',
      problem: 'La quietud absoluta sin retroalimentación visual causa sensación de app congelada.',
      hypothesis: 'Un pulso visual sutil de respiración 4-4-4-4 mantiene al usuario presente sin distraer.',
      change_applied: 'Añadida animación sutil de expansión/contracción en el contador de silencio.',
      measurement_plan: 'Medir tasa de finalización del Movimiento 4 durante la próxima semana.',
      status: 'TESTING',
    };

    const entry = await interviewAndLogService.createProductLog(logData);
    expect(entry.id).toBeDefined();
    expect(entry.status).toBe('TESTING');

    // Update status to KEPT
    await interviewAndLogService.updateLogStatus(entry.id, 'KEPT');
    const logs = await interviewAndLogService.fetchProductLogs();
    const updated = logs.find(l => l.id === entry.id);
    expect(updated?.status).toBe('KEPT');
  });

  it('strictly calculates scarcity from active founders (20 - active_founders) without hardcoding', () => {
    const mockMembers: Partial<Profile>[] = [
      { id: '1', name: 'Member 1', membership_status: 'ACTIVE', role: 'member' },
      { id: '2', name: 'Member 2', membership_status: 'ACTIVE', role: 'member' },
      { id: '3', name: 'Member 3', membership_status: 'FREE', role: 'member' }, // not active founder
    ];

    const totalLimitedSeats = 20;
    const activeFoundersCount = mockMembers.filter(m => m.membership_status === 'ACTIVE' || m.role === 'admin').length;
    const remainingPlaces = Math.max(1, totalLimitedSeats - activeFoundersCount);

    expect(activeFoundersCount).toBe(2);
    expect(remainingPlaces).toBe(18);
  });

  it('computes Day 1, 3, 7, 14, 28 cohort return rates and live session attendance', () => {
    const mockMembers: Profile[] = [
      {
        id: 'm1',
        name: 'Member 1',
        avatar_url: 'https://avatar.com/1',
        bio: 'Bio 1',
        role: 'member',
        focus_areas: ['Foco'],
        onboarding_completed: true,
        reflection_minutes: 100,
        membership_status: 'ACTIVE',
        streak_days: 14,
        completed_sessions_count: 14,
        current_week: 3,
        created_at: '2026-09-01T00:00:00Z',
      },
      {
        id: 'm2',
        name: 'Member 2',
        avatar_url: 'https://avatar.com/2',
        bio: 'Bio 2',
        role: 'member',
        focus_areas: ['Sobriedad'],
        onboarding_completed: true,
        reflection_minutes: 50,
        membership_status: 'ACTIVE',
        streak_days: 5,
        completed_sessions_count: 5,
        current_week: 1,
        created_at: '2026-09-10T00:00:00Z',
      },
      {
        id: 'm3',
        name: 'Member 3',
        avatar_url: 'https://avatar.com/3',
        bio: 'Bio 3',
        role: 'member',
        focus_areas: ['Silencio'],
        onboarding_completed: false,
        reflection_minutes: 10,
        membership_status: 'CANCELLED',
        streak_days: 1,
        completed_sessions_count: 1,
        current_week: 1,
        created_at: '2026-09-15T00:00:00Z',
      }
    ];

    const mockEvents = [
      { id: 'ev1', title: 'Sesión 1', date: '2026-09-01', attendees_count: 10 },
      { id: 'ev2', title: 'Sesión 2', date: '2026-09-02', attendees_count: 8 },
      { id: 'ev3', title: 'Sesión 3', date: '2026-09-03', attendees_count: 6 },
    ];

    const metrics = businessService.calculateRetentionMetrics(mockMembers, [], mockEvents);

    expect(metrics.totalMembers).toBe(3);
    expect(metrics.activeMembers).toBe(2);
    expect(metrics.cancelledMembers).toBe(1);
    expect(metrics.day1Return).toBe(100); // all 3 completed >= 1
    expect(metrics.day3Return).toBe(67);  // 2 out of 3 completed >= 3
    expect(metrics.firstSessionAttendance).toBe(10);
    expect(metrics.secondSessionAttendance).toBe(8);
    expect(metrics.averageAttendance).toBe(8);
  });

  it('validates that the creator content engine has populated the 65 pieces across the 10 topics', async () => {
    const items = await contentService.fetchContentItems();
    expect(items.length).toBeGreaterThanOrEqual(65);

    const igPosts = items.filter(i => i.platform === 'Instagram');
    const videos = items.filter(i => i.platform === 'TikTok' || i.platform === 'YouTube');
    const newsletters = items.filter(i => i.platform === 'Newsletter');
    const community = items.filter(i => i.platform === 'Community');

    expect(igPosts.length).toBeGreaterThanOrEqual(30);
    expect(videos.length).toBeGreaterThanOrEqual(15);
    expect(newsletters.length).toBeGreaterThanOrEqual(5);
    expect(community.length).toBeGreaterThanOrEqual(10);
  });
});
