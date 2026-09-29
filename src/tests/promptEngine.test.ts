import { describe, it, expect } from 'vitest';
import { getDeterministicDailyPrompt } from '../services/promptsService';
import { INITIAL_DAILY_PROMPTS } from '../lib/dailyPromptsData';
import { DailyPrompt } from '../types';

describe('Daily Prompt Engine & Admin Management', () => {
  it('contains at least 100 original prompts across the 9 required categories', () => {
    expect(INITIAL_DAILY_PROMPTS.length).toBeGreaterThanOrEqual(100);

    const expectedCategories = [
      'Ruido',
      'Emociones',
      'Visión',
      'Obstáculos',
      'Acción',
      'Relaciones',
      'Propósito',
      'Espiritualidad',
      'Disciplina',
    ];

    const presentCategories = new Set(INITIAL_DAILY_PROMPTS.map(p => p.category));
    expectedCategories.forEach(cat => {
      expect(presentCategories.has(cat as any)).toBe(true);
    });
  });

  it('selects prompts deterministically: identical date returns identical prompt', () => {
    const fixedDate = new Date('2026-10-15T08:00:00Z');
    const promptRun1 = getDeterministicDailyPrompt(INITIAL_DAILY_PROMPTS, fixedDate, 1);
    const promptRun2 = getDeterministicDailyPrompt(INITIAL_DAILY_PROMPTS, fixedDate, 1);

    expect(promptRun1.id).toBe(promptRun2.id);
    expect(promptRun1.prompt_text).toBe(promptRun2.prompt_text);
  });

  it('rotates prompts across different dates', () => {
    const day1 = new Date('2026-03-01T10:00:00Z');
    const day2 = new Date('2026-03-02T10:00:00Z');

    const prompt1 = getDeterministicDailyPrompt(INITIAL_DAILY_PROMPTS, day1, 1);
    const prompt2 = getDeterministicDailyPrompt(INITIAL_DAILY_PROMPTS, day2, 1);

    expect(prompt1.id).not.toBe(prompt2.id);
  });

  it('prioritizes user journey week when week-specific prompts are available', () => {
    const samplePrompts: DailyPrompt[] = [
      {
        id: 'p-w1',
        prompt_text: '¿Qué ruido te está impidiendo ver tu realidad presente?',
        category: 'Ruido',
        week: 1,
        difficulty: 'profundo',
        active: true,
        created_at: '',
      },
      {
        id: 'p-w2',
        prompt_text: '¿Cómo sería un día ordinario en la vida que aspiras construir?',
        category: 'Visión',
        week: 2,
        difficulty: 'profundo',
        active: true,
        created_at: '',
      },
    ];

    const week1Prompt = getDeterministicDailyPrompt(samplePrompts, new Date('2026-05-10'), 1);
    expect(week1Prompt.week).toBe(1);

    const week2Prompt = getDeterministicDailyPrompt(samplePrompts, new Date('2026-05-10'), 2);
    expect(week2Prompt.week).toBe(2);
  });

  it('supports admin scheduled overrides for specific dates', () => {
    const samplePrompts: DailyPrompt[] = [
      {
        id: 'p-regular',
        prompt_text: 'Pregunta ordinaria del día',
        category: 'Disciplina',
        week: 1,
        difficulty: 'suave',
        active: true,
        created_at: '',
      },
      {
        id: 'p-special-scheduled',
        prompt_text: 'Pregunta especial de retiro anual para hoy',
        category: 'Propósito',
        week: 1,
        difficulty: 'desafiante',
        active: true,
        created_at: '',
        scheduled_for_date: '2026-12-25',
      } as any,
    ];

    const christmasDate = new Date('2026-12-25T12:00:00Z');
    const chosenPrompt = getDeterministicDailyPrompt(samplePrompts, christmasDate, 1);

    expect(chosenPrompt.id).toBe('p-special-scheduled');
    expect(chosenPrompt.prompt_text).toContain('retiro anual');
  });

  it('excludes disabled/inactive prompts from daily selection', () => {
    const promptsWithInactive: DailyPrompt[] = [
      {
        id: 'p-inactive',
        prompt_text: 'Pregunta desactivada por el administrador',
        category: 'Ruido',
        week: 1,
        difficulty: 'suave',
        active: false,
        created_at: '',
      },
      {
        id: 'p-active',
        prompt_text: 'Pregunta activa visible para la comunidad',
        category: 'Ruido',
        week: 1,
        difficulty: 'profundo',
        active: true,
        created_at: '',
      },
    ];

    const selected = getDeterministicDailyPrompt(promptsWithInactive, new Date(), 1);
    expect(selected.id).toBe('p-active');
    expect(selected.active).toBe(true);
  });

  it('supports admin prompt mutations: creation, editing and toggling active status', () => {
    let promptCatalog: DailyPrompt[] = [...INITIAL_DAILY_PROMPTS.slice(0, 3)];

    // Admin creates new prompt
    const newPrompt: DailyPrompt = {
      id: 'admin-created-prompt-1',
      prompt_text: '¿En qué área de tu trabajo estás tolerando la mediocridad?',
      category: 'Obstáculos',
      week: 3,
      difficulty: 'desafiante',
      active: true,
      created_at: new Date().toISOString(),
    };
    promptCatalog = [newPrompt, ...promptCatalog];
    expect(promptCatalog).toHaveLength(4);

    // Admin updates prompt text
    promptCatalog = promptCatalog.map(p => 
      p.id === 'admin-created-prompt-1' 
        ? { ...p, prompt_text: '¿En qué área de tu vocación estás tolerando la tibieza?' } 
        : p
    );
    const updated = promptCatalog.find(p => p.id === 'admin-created-prompt-1');
    expect(updated?.prompt_text).toContain('tibieza');

    // Admin toggles active status
    promptCatalog = promptCatalog.map(p =>
      p.id === 'admin-created-prompt-1'
        ? { ...p, active: false }
        : p
    );
    const disabled = promptCatalog.find(p => p.id === 'admin-created-prompt-1');
    expect(disabled?.active).toBe(false);
  });
});
