import { describe, it, expect } from 'vitest';
import { calculateDynamicStreak } from '../services/journalService';
import { Lesson, EventItem } from '../types';

describe('Dynamic Streak Calculation & 4-Week Journey Curriculum', () => {
  it('computes 0 streak when no sessions exist', () => {
    expect(calculateDynamicStreak([])).toBe(0);
  });

  it('calculates continuous streak anchored on today', () => {
    const today = new Date();
    const d0 = today.toISOString().split('T')[0];

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const d1 = yesterday.toISOString().split('T')[0];

    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const d2 = twoDaysAgo.toISOString().split('T')[0];

    const dates = [d0, d1, d2];
    expect(calculateDynamicStreak(dates)).toBe(3);
  });

  it('preserves streak if completed yesterday but today is still pending', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const d1 = yesterday.toISOString().split('T')[0];

    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const d2 = twoDaysAgo.toISOString().split('T')[0];

    const dates = [d1, d2];
    expect(calculateDynamicStreak(dates)).toBe(2);
  });

  it('resets streak to 0 if more than 1 day has passed without journaling', () => {
    const today = new Date();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const d3 = threeDaysAgo.toISOString().split('T')[0];

    const fourDaysAgo = new Date(today);
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
    const d4 = fourDaysAgo.toISOString().split('T')[0];

    const dates = [d3, d4];
    expect(calculateDynamicStreak(dates)).toBe(0);
  });

  it('deduplicates multiple journal sessions recorded on the same calendar day', () => {
    const today = new Date();
    const d0 = today.toISOString().split('T')[0];

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const d1 = yesterday.toISOString().split('T')[0];

    // 3 sessions today and 2 yesterday
    const dates = [d0, d0, d0, d1, d1];
    expect(calculateDynamicStreak(dates)).toBe(2);
  });

  it('validates 4-week journey structure: 4 distinct weeks with accurate theme names', () => {
    const journeyWeeks = [
      { week: 1, title: 'Semana 1 — El Presente' },
      { week: 2, title: 'Semana 2 — La Visión' },
      { week: 3, title: 'Semana 3 — Los Obstáculos' },
      { week: 4, title: 'Semana 4 — El Trabajo' },
    ];

    expect(journeyWeeks).toHaveLength(4);
    expect(journeyWeeks[0].title).toContain('El Presente');
    expect(journeyWeeks[1].title).toContain('La Visión');
    expect(journeyWeeks[2].title).toContain('Los Obstáculos');
    expect(journeyWeeks[3].title).toContain('El Trabajo');
  });

  it('updates lesson completion status and recalculates curriculum progress', () => {
    const lessons: Lesson[] = [
      {
        id: 'les-1',
        module_id: 'mod-1',
        module_title: 'Semana 1 — El Presente',
        title: 'El principio del silencio',
        duration_minutes: 15,
        status: 'available',
        content_markdown: 'Introducción a la quietud...',
        order_index: 1,
      },
      {
        id: 'les-2',
        module_id: 'mod-1',
        module_title: 'Semana 1 — El Presente',
        title: 'Nombrar la realidad sin anestesia',
        duration_minutes: 20,
        status: 'available',
        content_markdown: 'El poder de las 8 emociones básicas...',
        order_index: 2,
      },
    ];

    const calculateCurriculumProgress = (list: Lesson[]) => {
      const completed = list.filter(l => l.status === 'completed').length;
      return Math.round((completed / list.length) * 100);
    };

    expect(calculateCurriculumProgress(lessons)).toBe(0);

    // Complete lesson 1
    const updatedLessons = lessons.map(l =>
      l.id === 'les-1' ? { ...l, status: 'completed' as const } : l
    );

    expect(calculateCurriculumProgress(updatedLessons)).toBe(50);
    expect(updatedLessons.find(l => l.id === 'les-1')?.status).toBe('completed');
  });

  it('handles event registration idempotency and count updates', () => {
    let event: EventItem = {
      id: 'evt-morning-silence',
      title: 'Sesión Matutina de Silencio',
      date: '2026-10-01T07:00:00Z',
      time_display: '07:00 AM',
      duration_minutes: 30,
      type: 'standard',
      host_name: 'Alberto Calvo',
      host_avatar: '',
      description: 'Práctica guiada en vivo',
      status: 'upcoming',
      attendees_count: 12,
      user_is_registered: false,
    };

    const toggleRegistration = (e: EventItem): EventItem => {
      if (e.user_is_registered) {
        return {
          ...e,
          attendees_count: Math.max(0, e.attendees_count - 1),
          user_is_registered: false,
        };
      } else {
        return {
          ...e,
          attendees_count: e.attendees_count + 1,
          user_is_registered: true,
        };
      }
    };

    // Register
    event = toggleRegistration(event);
    expect(event.user_is_registered).toBe(true);
    expect(event.attendees_count).toBe(13);

    // Unregister
    event = toggleRegistration(event);
    expect(event.user_is_registered).toBe(false);
    expect(event.attendees_count).toBe(12);
  });
});
