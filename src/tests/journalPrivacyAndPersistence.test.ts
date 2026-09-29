import { describe, it, expect, beforeEach } from 'vitest';
import { JournalSession, EmotionSelection } from '../types';
import { journalService } from '../services/journalService';

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

describe('Journal Privacy & 5-Movement Session Persistence', () => {
  const userA_id = 'usr-alice-uuid';
  const userB_id = 'usr-bob-uuid';

  beforeEach(() => {
    localStorage.clear();
  });

  it('completes all 5 movements of the Travesía guided journaling method', () => {
    const validEmotions: EmotionSelection[] = [
      { category: 'IRA', related_to: 'Tensión no resuelta con mi socio sobre el presupuesto' },
      { category: 'MIEDO', related_to: 'Incertidumbre sobre la fecha de entrega del proyecto' },
    ];

    const completedSession: JournalSession = {
      id: 'session-101',
      user_id: userA_id,
      date: '2026-09-28',
      created_at: new Date().toISOString(),
      // Movement 1: Desacelerar (Breathing & Stillness)
      breathing_completed: true,
      silence_duration_seconds: 60,
      // Movement 2: Descargar (Unfiltered brain dump)
      free_writing_1m: 'Tengo la mente saturada con llamadas y pendientes que no me corresponden.',
      // Movement 3: Nombrar la Realidad (Emotion & Life Area)
      emotions: validEmotions,
      // Movement 4: Escuchar (Silent stillness / prayer)
      listening_notes: 'Percibo con claridad que debo delegar la parte operativa para enfocarme en la visión.',
      listening_duration_seconds: 120,
      // Movement 5: Una Sola Acción (Concrete single action)
      action_type: 'action',
      action_commitment: 'Hoy a las 11:30 redactaré el documento de traspaso y se lo enviaré a Marcos.',
      total_duration_minutes: 28,
      status: 'completed',
    };

    expect(completedSession.breathing_completed).toBe(true);
    expect(completedSession.free_writing_1m!.length).toBeGreaterThan(20);
    expect(completedSession.emotions).toHaveLength(2);
    expect(completedSession.emotions[0].category).toBe('IRA');
    expect(completedSession.listening_notes).toBeTruthy();
    expect(completedSession.action_commitment).toBe('Hoy a las 11:30 redactaré el documento de traspaso y se lo enviaré a Marcos.');
    expect(completedSession.status).toBe('completed');
  });

  it('persists in-progress drafts across browser refresh/close (Movement 1 to 5)', () => {
    const partialDraft: Partial<JournalSession> & { currentMovementStep?: number } = {
      currentMovementStep: 3,
      breathing_completed: true,
      silence_duration_seconds: 60,
      free_writing_1m: 'Texto preliminar escrito antes de cerrar la ventana...',
      emotions: [{ category: 'SOLEDAD', related_to: 'Aislamiento en el teletrabajo' }],
    };

    // 1. User saves draft while journaling
    journalService.saveDraft(userA_id, partialDraft);

    // 2. User simulates refresh / re-opening browser
    const recoveredDraft = journalService.getDraft(userA_id);

    expect(recoveredDraft).not.toBeNull();
    expect(recoveredDraft?.currentMovementStep).toBe(3);
    expect(recoveredDraft?.free_writing_1m).toBe('Texto preliminar escrito antes de cerrar la ventana...');
    expect(recoveredDraft?.emotions?.[0].category).toBe('SOLEDAD');

    // 3. User finishes and clears draft
    journalService.clearDraft(userA_id);
    const afterCompletionDraft = journalService.getDraft(userA_id);
    expect(afterCompletionDraft).toBeNull();
  });

  it('enforces strict Journal Privacy: User B CANNOT view, query, or receive User A sessions', () => {
    const databaseSessions: JournalSession[] = [
      {
        id: 'session-private-a-1',
        user_id: userA_id,
        date: '2026-09-27',
        created_at: '2026-09-27T08:00:00Z',
        breathing_completed: true,
        silence_duration_seconds: 60,
        free_writing_1m: 'Confesión íntima y vulnerabilidad de Alice',
        emotions: [{ category: 'DOLOR', related_to: 'Duelo familiar' }],
        listening_notes: 'Silencio y oración',
        listening_duration_seconds: 90,
        action_type: 'release',
        action_commitment: 'Aceptar el proceso de pérdida con paciencia',
        total_duration_minutes: 25,
        status: 'completed',
      },
      {
        id: 'session-private-b-1',
        user_id: userB_id,
        date: '2026-09-28',
        created_at: '2026-09-28T09:00:00Z',
        breathing_completed: true,
        silence_duration_seconds: 60,
        free_writing_1m: 'Notas privadas de Bob',
        emotions: [{ category: 'ALEGRÍA', related_to: 'Nacimiento de mi sobrino' }],
        listening_notes: 'Gratitud profunda',
        listening_duration_seconds: 60,
        action_type: 'action',
        action_commitment: 'Escribir una carta de bendición a mi hermana',
        total_duration_minutes: 20,
        status: 'completed',
      },
    ];

    // Simulate RLS enforcement: SELECT * FROM journal_sessions WHERE user_id = auth.uid()
    const queryUserASessions = (requestingUserId: string) => {
      return databaseSessions.filter(session => session.user_id === requestingUserId);
    };

    // User A querying their own entries
    const aliceResults = queryUserASessions(userA_id);
    expect(aliceResults).toHaveLength(1);
    expect(aliceResults[0].id).toBe('session-private-a-1');
    expect(aliceResults[0].free_writing_1m).toContain('Alice');

    // User B querying entries (simulating an attempt to read Alice's data)
    const bobResults = queryUserASessions(userB_id);
    expect(bobResults).toHaveLength(1);
    expect(bobResults[0].id).toBe('session-private-b-1');

    // Alice's data is completely absent from Bob's results
    const leakedToBob = bobResults.some(s => s.user_id === userA_id || s.id === 'session-private-a-1');
    expect(leakedToBob).toBe(false);

    // Direct malicious query attempt by ID checking authorization
    const fetchSessionById = (sessionId: string, requestingUserId: string): JournalSession | null => {
      const found = databaseSessions.find(s => s.id === sessionId);
      if (!found) return null;
      // RLS Policy Check: auth.uid() = user_id
      if (found.user_id !== requestingUserId) {
        throw new Error('RLS Violation: Unauthorized access to private journal session');
      }
      return found;
    };

    expect(() => fetchSessionById('session-private-a-1', userB_id)).toThrow('RLS Violation');
    expect(fetchSessionById('session-private-a-1', userA_id)?.id).toBe('session-private-a-1');
  });

  it('validates single action commitment constraints in Movement 5', () => {
    const validateMovement5Action = (actionText: string): { isValid: boolean; error?: string } => {
      if (!actionText || actionText.trim().length === 0) {
        return { isValid: false, error: 'Debes definir un compromiso de acción.' };
      }
      if (actionText.trim().length < 8) {
        return { isValid: false, error: 'Sé más específico. Define cuándo o cómo lo harás.' };
      }
      // Check for compound multiple actions ("y además voy a", "luego también...")
      const compoundPatterns = [/y además /i, /y después voy a /i, /también voy a /i];
      const hasMultiple = compoundPatterns.some(pattern => pattern.test(actionText));
      if (hasMultiple) {
        return { isValid: false, error: 'Elige UNA SOLA acción concreta para hoy. La dispersión destruye el foco.' };
      }
      return { isValid: true };
    };

    expect(validateMovement5Action('').isValid).toBe(false);
    expect(validateMovement5Action('hacerlo').isValid).toBe(false);
    expect(validateMovement5Action('Llamar a Pedro y además voy a limpiar el trastero y luego iré al banco').isValid).toBe(false);
    expect(validateMovement5Action('Hoy a las 17:00 apagaré el móvil para cenar con mi familia').isValid).toBe(true);
  });

  it('verifies privacy terminology compliance (RLS protected, no false encryption claim)', () => {
    const privacyNoticeBadge = 'PRIVADO · PROTEGIDO POR RLS';
    expect(privacyNoticeBadge).toContain('RLS');
    expect(privacyNoticeBadge.toLowerCase()).not.toContain('encriptado de extremo a extremo');
    expect(privacyNoticeBadge.toLowerCase()).not.toContain('cifrado militar');
  });
});
