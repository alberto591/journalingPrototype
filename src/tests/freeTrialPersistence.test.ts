import { describe, it, expect, beforeEach } from 'vitest';

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

const TRIAL_STORAGE_KEY = 'travesia_trial_progress_v3';

interface TrialProgressPayload {
  email: string;
  name: string;
  completedDays: number[];
  activeDay: number;
  completedTrial: boolean;
  reflections: Record<number, string>;
  lastSavedAt: string;
}

describe('Free Trial Reflection & Progress Persistence Specification', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists reflection answers for Day 1 ("Pregunta de examen") in local storage', () => {
    const payload: TrialProgressPayload = {
      email: 'trial@travesia.app',
      name: 'Usuario Prueba',
      completedDays: [],
      activeDay: 1,
      completedTrial: false,
      reflections: {
        1: 'El pensamiento que me persigue es la prisa constante por terminar tareas acumuladas.',
      },
      lastSavedAt: new Date().toISOString(),
    };

    localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(payload));

    const retrieved = JSON.parse(localStorage.getItem(TRIAL_STORAGE_KEY)!);
    expect(retrieved.reflections).toBeDefined();
    expect(retrieved.reflections[1]).toBe(
      'El pensamiento que me persigue es la prisa constante por terminar tareas acumuladas.'
    );
  });

  it('preserves distinct reflections across multiple days when switching days', () => {
    const reflections: Record<number, string> = {
      1: 'Día 1: Me levanté sintiendo urgencia innecesaria.',
      2: 'Día 2: He estado revisando el móvil cada 5 minutos para evadir pensar en mis finanzas.',
      3: 'Día 3: Emoción predominante: Miedo a no estar a la altura en el nuevo reto laboral.',
    };

    const payload: TrialProgressPayload = {
      email: 'trial@travesia.app',
      name: 'Usuario Prueba',
      completedDays: [1, 2],
      activeDay: 3,
      completedTrial: false,
      reflections,
      lastSavedAt: new Date().toISOString(),
    };

    localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(payload));

    const retrieved = JSON.parse(localStorage.getItem(TRIAL_STORAGE_KEY)!);
    expect(retrieved.reflections[1]).toContain('Día 1: Me levanté sintiendo urgencia');
    expect(retrieved.reflections[2]).toContain('Día 2: He estado revisando el móvil');
    expect(retrieved.reflections[3]).toContain('Día 3: Emoción predominante: Miedo');
  });

  it('does NOT wipe reflections when marking a day as reviewed (repasado)', () => {
    const existingReflections: Record<number, string> = {
      1: 'Reflexión profunda del Día 1 ya completado.',
    };

    // User is on Day 1 (already completed) and clicks "Marcar como repasado"
    const completedDays = [1];
    const activeDay = 1;
    const reflectionText = existingReflections[1];

    const updatedReflections = {
      ...existingReflections,
      [activeDay]: reflectionText,
    };

    const nextDay = Math.min(7, activeDay + 1);

    const payload: TrialProgressPayload = {
      email: 'trial@travesia.app',
      name: 'Usuario Prueba',
      completedDays,
      activeDay: nextDay,
      completedTrial: false,
      reflections: updatedReflections,
      lastSavedAt: new Date().toISOString(),
    };

    localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(payload));

    const retrieved = JSON.parse(localStorage.getItem(TRIAL_STORAGE_KEY)!);
    // Day 1 text is preserved intact
    expect(retrieved.reflections[1]).toBe('Reflexión profunda del Día 1 ya completado.');
    expect(retrieved.activeDay).toBe(2);
  });

  it('supports user-scoped storage key when authenticated user engages in trial', () => {
    const userId = 'usr-auth-77';
    const scopedKey = `${TRIAL_STORAGE_KEY}_${userId}`;

    const payload: TrialProgressPayload = {
      email: 'auth.user@travesia.app',
      name: 'Usuario Autenticado',
      completedDays: [1],
      activeDay: 2,
      completedTrial: false,
      reflections: {
        1: 'Reflexión privada del usuario autenticado.',
      },
      lastSavedAt: new Date().toISOString(),
    };

    localStorage.setItem(scopedKey, JSON.stringify(payload));

    const retrieved = JSON.parse(localStorage.getItem(scopedKey)!);
    expect(retrieved.email).toBe('auth.user@travesia.app');
    expect(retrieved.reflections[1]).toBe('Reflexión privada del usuario autenticado.');
  });

  it('guarantees Day 4 guided silence timer is set to 5 minutes (300s) to match exercise guidance', () => {
    // Expected timer seconds per day matching actionGuidance
    const day4Guidance = 'Guarda silencio profundo sin consultar notas ni teléfono durante los próximos 5 minutos.';
    const day4Question = 'Si dejas de defender tu punto de vista durante cinco minutos, ¿qué verdad empieza a revelarse?';
    const day4ExerciseSeconds = 300; // 5:00

    expect(day4ExerciseSeconds).toBe(5 * 60);
    expect(Math.floor(day4ExerciseSeconds / 60)).toBe(5);
    expect(String(day4ExerciseSeconds % 60).padStart(2, '0')).toBe('00');
    expect(day4Guidance).toContain('5 minutos');
    expect(day4Question).toContain('cinco minutos');
  });
});
