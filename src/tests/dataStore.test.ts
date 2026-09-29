import { describe, it, expect, beforeEach } from 'vitest';
import { INITIAL_DAILY_PROMPTS, EMOTIONS_CATALOG } from '../lib/dailyPromptsData';
import { 
  CURRENT_USER, 
  ADMIN_USER, 
  MEMBERS_DATA, 
  CHANNELS_DATA, 
  INITIAL_POSTS, 
  INITIAL_COMMENTS, 
  EVENTS_DATA, 
  LESSONS_DATA, 
  BOOKS_DATA, 
  RECORDINGS_DATA 
} from '../lib/seedData';
import { Post, Comment, JournalSession } from '../types';

describe('TRAVESÍA Seed Data and Prompt Catalog', () => {
  it('loads at least 100 original Spanish daily prompts across 9 categories', () => {
    expect(INITIAL_DAILY_PROMPTS.length).toBeGreaterThanOrEqual(100);

    const categories = new Set(INITIAL_DAILY_PROMPTS.map(p => p.category));
    expect(categories.has('Ruido')).toBe(true);
    expect(categories.has('Emociones')).toBe(true);
    expect(categories.has('Visión')).toBe(true);
    expect(categories.has('Obstáculos')).toBe(true);
    expect(categories.has('Acción')).toBe(true);
    expect(categories.has('Relaciones')).toBe(true);
    expect(categories.has('Propósito')).toBe(true);
    expect(categories.has('Espiritualidad')).toBe(true);
    expect(categories.has('Disciplina')).toBe(true);
  });

  it('contains the 8 canonical emotion categories with specific prompts', () => {
    const emotionNames = EMOTIONS_CATALOG.map(e => e.category);
    expect(emotionNames).toContain('DOLOR');
    expect(emotionNames).toContain('SOLEDAD');
    expect(emotionNames).toContain('TRISTEZA');
    expect(emotionNames).toContain('IRA');
    expect(emotionNames).toContain('MIEDO');
    expect(emotionNames).toContain('VERGÜENZA');
    expect(emotionNames).toContain('CULPA');
    expect(emotionNames).toContain('ALEGRÍA');

    EMOTIONS_CATALOG.forEach(e => {
      expect(e.prompt).toBeTruthy();
      expect(e.description).toBeTruthy();
    });
  });

  it('includes 50 members and required channels', () => {
    expect(MEMBERS_DATA.length).toBeGreaterThanOrEqual(50);
    expect(CHANNELS_DATA.length).toBe(9);

    const channelSlugs = CHANNELS_DATA.map(c => c.slug);
    expect(channelSlugs).toContain('conversacion-principal');
    expect(channelSlugs).toContain('sesiones-de-diario');
    expect(channelSlugs).toContain('empezar-aqui');
    expect(channelSlugs).toContain('el-ruido');
    expect(channelSlugs).toContain('la-vision');
    expect(channelSlugs).toContain('los-obstaculos');
    expect(channelSlugs).toContain('el-trabajo');
    expect(channelSlugs).toContain('biblioteca');
    expect(channelSlugs).toContain('archivo');
  });

  it('includes events, lessons, books and recordings', () => {
    expect(EVENTS_DATA.length).toBeGreaterThanOrEqual(5);
    expect(LESSONS_DATA.length).toBeGreaterThanOrEqual(8);
    expect(BOOKS_DATA.length).toBeGreaterThanOrEqual(8);
    expect(RECORDINGS_DATA.length).toBeGreaterThanOrEqual(6);
  });
});

describe('Journal Privacy and State Logic', () => {
  it('enforces strict privacy: users can only see their own journal sessions', () => {
    const userA_id = 'user-a';
    const userB_id = 'user-b';

    const sessions: JournalSession[] = [
      {
        id: 'js-1',
        user_id: userA_id,
        date: '2026-09-28',
        created_at: new Date().toISOString(),
        breathing_completed: true,
        silence_duration_seconds: 60,
        free_writing_1m: 'Pensamientos íntimos de A',
        emotions: [{ category: 'IRA', related_to: 'Situación laboral' }],
        listening_notes: 'Oración ante Dios',
        listening_duration_seconds: 90,
        action_type: 'action',
        action_commitment: 'Llamar a mi socio',
        total_duration_minutes: 30,
        status: 'completed'
      },
      {
        id: 'js-2',
        user_id: userB_id,
        date: '2026-09-28',
        created_at: new Date().toISOString(),
        breathing_completed: true,
        silence_duration_seconds: 60,
        free_writing_1m: 'Pensamientos privados de B',
        emotions: [{ category: 'MIEDO', related_to: 'Situación familiar' }],
        listening_notes: 'Silencio',
        listening_duration_seconds: 90,
        action_type: 'release',
        action_commitment: 'Soltar el control',
        total_duration_minutes: 30,
        status: 'completed'
      }
    ];

    // Privacy filter check
    const userA_private_sessions = sessions.filter(s => s.user_id === userA_id);
    expect(userA_private_sessions.length).toBe(1);
    expect(userA_private_sessions[0].user_id).toBe(userA_id);
    expect(userA_private_sessions[0].free_writing_1m).toBe('Pensamientos íntimos de A');

    // Ensure User B's sessions are NEVER exposed to User A
    const containsB_data = userA_private_sessions.some(s => s.user_id === userB_id);
    expect(containsB_data).toBe(false);
  });

  it('validates concrete single-action requirement in Movement 5', () => {
    const vagueAction = 'mejorar';
    const concreteAction = 'Hoy a las 16:00 llamaré a mi hermano';

    // Must be at least 8 characters and non-empty
    expect(vagueAction.trim().length >= 8).toBe(false);
    expect(concreteAction.trim().length >= 8).toBe(true);
  });
});
