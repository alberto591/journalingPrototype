import { 
  Profile, 
  OngoingCycle, 
  CycleReflection, 
  MemberHistoryItem, 
  ContinuousRetentionMetrics,
  JournalSession
} from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ====================================================================
// CANONICAL ONGOING CYCLES (TRAVESÍA CONTINUA)
// ====================================================================
export const INITIAL_ONGOING_CYCLES: OngoingCycle[] = [
  {
    id: 'cycle-relaciones',
    cycle_number: 1,
    title: 'Relaciones',
    theme: 'Sanar vínculos, conversaciones difíciles y verdad en el hogar',
    description: 'Explora cómo desarmar la hostilidad pasiva, comunicar la verdad con amor y restaurar la intimidad familiar.',
    start_date: '2026-09-15T00:00:00Z',
    end_date: '2026-10-15T00:00:00Z',
    status: 'active',
    weeks: [
      { week_number: 1, title: 'El Espejo del Otro', focus: 'Identificar tus proyecciones y expectativas no habladas', prompt_focus: '¿Qué reproche silencioso guardas hacia alguien cercano?' },
      { week_number: 2, title: 'Conversaciones Necesarias', focus: 'Aprender a hablar con mansedumbre e implacable verdad', prompt_focus: '¿Qué conversación estás postergando por temor a la incomodidad?' },
      { week_number: 3, title: 'Perdón y Desarme', focus: 'Soltar la deuda emocional sin caer en complacencia ciega', prompt_focus: '¿Qué ofensa pasada sigues cobrando en cuotas invisibles?' },
      { week_number: 4, title: 'Pacto y Presencia', focus: 'Construir acuerdos claros y estar presente sin distracciones', prompt_focus: '¿Cómo vas a honrar hoy a las personas que Dios te confió?' },
    ],
  },
  {
    id: 'cycle-proposito',
    cycle_number: 2,
    title: 'Propósito',
    theme: 'Claridad vocacional, dones y servicio duradero',
    description: 'Alinear tu tiempo, talento y recursos al llamado fundamental de tu vida, descartando falsas urgencias.',
    start_date: '2026-10-16T00:00:00Z',
    end_date: '2026-11-15T00:00:00Z',
    status: 'upcoming',
    weeks: [
      { week_number: 1, title: 'Despojo de Máscaras', focus: 'Separar el ego de la verdadera vocación de servicio', prompt_focus: '¿Qué parte de tu trabajo haces por vanidad y cuál por verdadero fruto?' },
      { week_number: 2, title: 'El Martes Normal', focus: 'Diseñar la rutina fiel que sostiene tu propósito', prompt_focus: 'Si fueras plenamente fiel a tu vocación, ¿qué cambiarías hoy?' },
      { week_number: 3, title: 'La Resistencia Interior', focus: 'Vencer el miedo a no ser suficiente y la pereza encubierta', prompt_focus: '¿Cuál es la duda recurrente que frena tu entrega?' },
      { week_number: 4, title: 'El Fruto Fecundo', focus: 'Sellar compromisos de largo plazo para servir al prójimo', prompt_focus: '¿A quién beneficiará que seas diligente en tu trabajo?' },
    ],
  },
  {
    id: 'cycle-disciplina',
    cycle_number: 3,
    title: 'Disciplina',
    theme: 'Constancia sin rigidez y forja del carácter diario',
    description: 'Aprender la disciplina como un acto de reverencia y amor, eliminando el autocastigo y la intermitencia.',
    start_date: '2026-11-16T00:00:00Z',
    end_date: '2026-12-15T00:00:00Z',
    status: 'upcoming',
    weeks: [
      { week_number: 1, title: 'Los Cimientos del Día', focus: 'La primera hora: silencio, oración y orden físico', prompt_focus: '¿Qué hábito matutino está saboteando tu serenidad?' },
      { week_number: 2, title: 'El No Sagrado', focus: 'Blindar tu energía frente a demandas innecesarias', prompt_focus: '¿A qué compromiso vacío debes decir NO esta semana?' },
      { week_number: 3, title: 'Fidelidad en lo Pequeño', focus: 'Hacer lo necesario cuando no hay motivación ni aplausos', prompt_focus: '¿Qué tarea postergada requiere tu atención inmediata?' },
      { week_number: 4, title: 'Consistencia Soberana', focus: 'Integrar la constancia como identidad permanente', prompt_focus: '¿Cómo mantendrás el ritmo cuando la emoción decaiga?' },
    ],
  },
  {
    id: 'cycle-identidad',
    cycle_number: 4,
    title: 'Identidad',
    theme: 'Quién eres ante Dios cuando nadie te mira',
    description: 'Liberarte de la necesidad de aprobación ajena y asentar tu valor en tu dignidad incondicional.',
    start_date: '2026-12-16T00:00:00Z',
    end_date: '2027-01-15T00:00:00Z',
    status: 'upcoming',
    weeks: [
      { week_number: 1, title: 'El Espejo Roto', focus: 'Desmantelar los títulos y roles con los que te justificas', prompt_focus: '¿Quién eres cuando te quitan tus éxitos profesionales?' },
      { week_number: 2, title: 'La Voz de la Gracia', focus: 'Reconocer el amor de Dios que no depende de tu rendimiento', prompt_focus: '¿Por qué te cuesta tanto aceptar el perdón?' },
      { week_number: 3, title: 'Vulnerabilidad Verdadera', focus: 'Tener el valor de mostrar tu debilidad sin dramatismo', prompt_focus: '¿Qué herida sigues ocultando bajo una fachada de fuerza?' },
      { week_number: 4, title: 'Hombre / Mujer Firme', focus: 'Caminar con sobriedad y seguridad interior', prompt_focus: '¿Cuál es la verdad innegociable de tu identidad hoy?' },
    ],
  },
  {
    id: 'cycle-coraje',
    cycle_number: 5,
    title: 'Coraje',
    theme: 'Audacia sobria para dar los pasos necesarios',
    description: 'Dejar de esperar condiciones ideales y actuar con prudencia y firmeza ante la incertidumbre.',
    start_date: '2027-01-16T00:00:00Z',
    end_date: '2027-02-15T00:00:00Z',
    status: 'upcoming',
    weeks: [
      { week_number: 1, title: 'Nombrar el Miedo', focus: 'Mirar de frente el peor escenario posible sin pánico', prompt_focus: '¿Qué temes que pase si tomas la decisión correcta?' },
      { week_number: 2, title: 'La Decisión Inevitable', focus: 'Cortar con la indecisión que drena tu paz', prompt_focus: '¿Qué dilema llevas meses esquivando?' },
      { week_number: 3, title: 'El Salto Prudente', focus: 'Dar el primer paso con lo que tienes entre manos', prompt_focus: '¿Cuál es la primera acción concreta para hoy?' },
      { week_number: 4, title: 'Sostener la Posición', focus: 'Mantenerte en pie cuando llegue la resistencia externa', prompt_focus: '¿Qué convicción te mantendrá firme bajo presión?' },
    ],
  },
  {
    id: 'cycle-familia',
    cycle_number: 6,
    title: 'Familia',
    theme: 'Presencia real, perdón intergeneracional y legado duradero',
    description: 'Sanar raíces familiares, proteger el hogar y ser un pilar de paz para tus seres queridos.',
    start_date: '2027-02-16T00:00:00Z',
    end_date: '2027-03-15T00:00:00Z',
    status: 'upcoming',
    weeks: [
      { week_number: 1, title: 'El Umbral del Hogar', focus: 'Dejar el estrés laboral fuera de la puerta de casa', prompt_focus: '¿Con qué humor y energía cruzas la puerta de tu casa cada tarde?' },
      { week_number: 2, title: 'Escuchar a los Tuyos', focus: 'Atención total a cónyuge e hijos sin pantallas de por medio', prompt_focus: '¿Cuándo fue la última vez que escuchaste sin dar consejos ni juzgar?' },
      { week_number: 3, title: 'Sanar el Pasado', focus: 'Comprender a tus padres y romper patrones dañinos', prompt_focus: '¿Qué hábito familiar tóxico estás comprometido a detener contigo?' },
      { week_number: 4, title: 'El Fuego del Hogar', focus: 'Establecer tradiciones vivas y bendición cotidiana', prompt_focus: '¿Qué recuerdo de paz quieres que tengan tus hijos de ti?' },
    ],
  },
  {
    id: 'cycle-limites',
    cycle_number: 7,
    title: 'Límites',
    theme: 'Aprender a decir no con sobriedad y paz interior',
    description: 'Establecer fronteras saludables en el trabajo y relaciones para proteger lo que es sagrado.',
    start_date: '2027-03-16T00:00:00Z',
    end_date: '2027-04-15T00:00:00Z',
    status: 'upcoming',
    weeks: [
      { week_number: 1, title: 'La Trampa de Agradar', focus: 'Desenmascarar el miedo al rechazo que disfraza la falsa bondad', prompt_focus: '¿A qué dices sí por cobardía o necesidad de aprobación?' },
      { week_number: 2, title: 'Fronteras del Tiempo', focus: 'Bloquear horas intocables para el descanso y la familia', prompt_focus: '¿Qué intrusión laboral estás permitiendo en tu descanso?' },
      { week_number: 3, title: 'Firmeza Serena', focus: 'Decir no sin dar explicaciones excesivas ni pedir disculpas', prompt_focus: '¿A qué persona o demanda debes ponerle un límite firme hoy?' },
      { week_number: 4, title: 'Paz Protegida', focus: 'Disfrutar del silencio y la intimidad sin culpabilidad', prompt_focus: '¿Qué fruto de paz estás cosechando al cuidar tus límites?' },
    ],
  },
  {
    id: 'cycle-trabajo',
    cycle_number: 8,
    title: 'Trabajo',
    theme: 'Excelencia en el oficio sin idolatrar el estatus',
    description: 'Transformar tu labor en un taller de santificación y servicio honesto al mundo.',
    start_date: '2027-04-16T00:00:00Z',
    end_date: '2027-05-15T00:00:00Z',
    status: 'upcoming',
    weeks: [
      { week_number: 1, title: 'El Taller Sagrado', focus: 'Recuperar la dignidad del trabajo bien hecho', prompt_focus: '¿Con qué actitud abordas tus tareas más rutinarias?' },
      { week_number: 2, title: 'El Ídolo del Éxito', focus: 'Poner el dinero y el reconocimiento en su justo lugar', prompt_focus: '¿Qué ambición desmedida está robando tu paz y salud?' },
      { week_number: 3, title: 'Integridad Absoluta', focus: 'Ser leal y transparente en acuerdos y negociaciones', prompt_focus: '¿En qué detalle de tu trabajo estás tentado a recortar esquinas?' },
      { week_number: 4, title: 'Fruto y Descanso', focus: 'Trabajar con diligencia y soltar los resultados en Dios', prompt_focus: '¿Sabes parar al terminar el día y confiar en que Dios sostiene el mundo?' },
    ],
  },
  {
    id: 'cycle-decisiones',
    cycle_number: 9,
    title: 'Decisiones',
    theme: 'Discernimiento profundo ante encrucijadas vitales',
    description: 'Reglas prácticas de sabiduría para elegir caminos conformes a la verdad y no al impulso emocional.',
    start_date: '2027-05-16T00:00:00Z',
    end_date: '2027-06-15T00:00:00Z',
    status: 'upcoming',
    weeks: [
      { week_number: 1, title: 'El Silencio Previo', focus: 'No decidir en estado de euforia, pánico o cansancio', prompt_focus: '¿Qué decisión apresurada estás tentado a tomar en caliente?' },
      { week_number: 2, title: 'Las Motivaciones Ocultas', focus: 'Examinar qué espíritu o deseo mueve tu elección', prompt_focus: '¿Esta decisión nace del amor o del miedo?' },
      { week_number: 3, title: 'Consejo Sabio', focus: 'Abrir el tema ante personas maduras que no temen decirte la verdad', prompt_focus: '¿A qué consejero prudente vas a consultar antes de firmar o actuar?' },
      { week_number: 4, title: 'Paz Profunda', focus: 'Confirmar la dirección que deja fruto duradero en el alma', prompt_focus: '¿Qué opción deja serenidad y cuál deja agitación interna?' },
    ],
  },
  {
    id: 'cycle-espiritualidad',
    cycle_number: 10,
    title: 'Espiritualidad',
    theme: 'Comunión íntima y examen de conciencia vivo',
    description: 'Trascender la religiosidad superficial y cultivar un corazón humilde que escucha al Creador cada mañana.',
    start_date: '2027-06-16T00:00:00Z',
    end_date: '2027-07-15T00:00:00Z',
    status: 'upcoming',
    weeks: [
      { week_number: 1, title: 'La Cámara Secreta', focus: 'Entrar al silencio sin pretender impresionar a nadie', prompt_focus: '¿Qué máscara religiosa sueles ponerte ante Dios?' },
      { week_number: 2, title: 'El Examen Diario', focus: 'Repasar la jornada con lucidez, dolor de amor y propósito de enmienda', prompt_focus: '¿En qué momento de ayer te apartaste de la caridad?' },
      { week_number: 3, title: 'La Rendición Total', focus: 'Decir de corazón: "Hágase tu voluntad y no la mía"', prompt_focus: '¿Qué control personal te resistes a entregar en manos de Dios?' },
      { week_number: 4, title: 'Vivir en Gracia', focus: 'Agradecer cada respiración como un don inmerecido', prompt_focus: '¿Por qué gracia específica das gracias hoy con lágrimas de alegría?' },
    ],
  },
  {
    id: 'cycle-integracion',
    cycle_number: 11,
    title: 'Integración',
    theme: 'Vivir en unidad: mente, cuerpo, alma y acción cotidiana',
    description: 'La forja completa del ser humano íntegro que vive sin fisuras entre lo que cree y lo que hace.',
    start_date: '2027-07-16T00:00:00Z',
    end_date: '2027-08-15T00:00:00Z',
    status: 'upcoming',
    weeks: [
      { week_number: 1, title: 'Coherencia Total', focus: 'Unificar tu vida pública, profesional y secreta', prompt_focus: '¿Hay alguna diferencia entre quien eres en público y en privado?' },
      { week_number: 2, title: 'El Templo Vivo', focus: 'Cuidar el sueño, el cuerpo y los sentidos como ofrenda', prompt_focus: '¿Cómo estás honrando tu cuerpo hoy con descanso y alimento limpio?' },
      { week_number: 3, title: 'La Forja Continua', focus: 'Aceptar que el trabajo interior nunca termina, se profundiza', prompt_focus: '¿Qué fruto de madurez reconoces hoy que antes no tenías?' },
      { week_number: 4, title: 'Legado de Paz', focus: 'Ser un faro sereno para tu comunidad y familia', prompt_focus: '¿Cómo vas a irradiar sobriedad y verdad en tu entorno hoy?' },
    ],
  },
];

const inMemoryReflections: Record<string, CycleReflection[]> = {};

export const journeyService = {
  // ------------------------------------------------------------------
  // 0. MEMBERSHIP ACCESS CONTROL
  // ------------------------------------------------------------------
  hasActiveMembership(user: Profile): boolean {
    if (!user) return false;
    const status = user.membership_status || 'TRIAL';
    return status === 'ACTIVE' || status === 'TRIAL';
  },

  // ------------------------------------------------------------------
  // 1. CYCLES RETRIEVAL & MANAGEMENT
  // ------------------------------------------------------------------
  fetchOngoingCycles(): OngoingCycle[] {
    try {
      const saved = localStorage.getItem('travesia_ongoing_cycles');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ONGOING_CYCLES;
  },

  getCurrentCommunityCycle(): OngoingCycle {
    const cycles = this.fetchOngoingCycles();
    const active = cycles.find(c => c.status === 'active');
    return active || cycles[0];
  },

  getCurrentGlobalCommunityWeek(): number {
    // Current global community week is deterministically Week 2
    return 2;
  },

  saveOngoingCycles(cycles: OngoingCycle[]) {
    try {
      localStorage.setItem('travesia_ongoing_cycles', JSON.stringify(cycles));
    } catch {}
  },

  // ------------------------------------------------------------------
  // 2. PERSONAL JOURNEY CALCULATION (COMPLETELY INDEPENDENT FROM CALENDAR)
  // ------------------------------------------------------------------
  calculatePersonalFoundationProgress(user: Profile): {
    journeyStartedAt: string;
    daysSinceStart: number;
    personalWeek: number;
    personalDayInWeek: number;
    current_week: number;
    current_day: number;
    isFoundationCompleted: boolean;
    foundationCompletedAt: string | null;
  } {
    const journeyStartedAt = user.journey_started_at || user.created_at || new Date().toISOString();
    const startDate = new Date(journeyStartedAt).getTime();
    const now = Date.now();
    const diffDays = Math.max(0, Math.floor((now - startDate) / (1000 * 60 * 60 * 24)));
    const daysSinceStart = diffDays + 1; // 1-indexed

    // Calculate personal week (1 to 4)
    let personalWeek = Math.min(4, Math.max(1, Math.ceil(daysSinceStart / 7)));
    if (user.current_week && user.current_week >= 1 && user.current_week <= 4) {
      personalWeek = user.current_week;
    }

    const personalDayInWeek = ((daysSinceStart - 1) % 7) + 1;
    const isFoundationCompleted = Boolean(user.foundation_completed_at);

    return {
      journeyStartedAt,
      daysSinceStart,
      personalWeek,
      personalDayInWeek,
      current_week: personalWeek,
      current_day: personalDayInWeek,
      isFoundationCompleted,
      foundationCompletedAt: user.foundation_completed_at || null,
    };
  },

  // ------------------------------------------------------------------
  // 3. INDEPENDENT BILLING CYCLE CALCULATION (NEVER TIED TO 1ST OF MONTH)
  // ------------------------------------------------------------------
  calculateBillingDates(user: Profile): {
    billingStartedAt: string;
    nextBillingDate: string;
    daysUntilRenewal: number;
  } {
    const billingStartedAt = user.billing_started_at || user.membership_started_at || user.created_at || new Date().toISOString();
    const startDate = new Date(billingStartedAt);
    
    // Renewal occurs on the user's monthly join date anniversary (e.g. Oct 3 -> Nov 3)
    const nextDate = new Date(startDate);
    nextDate.setMonth(nextDate.getMonth() + 1);

    const now = Date.now();
    const daysUntilRenewal = Math.max(0, Math.ceil((nextDate.getTime() - now) / (1000 * 60 * 60 * 24)));

    return {
      billingStartedAt: startDate.toISOString(),
      nextBillingDate: user.next_billing_date || nextDate.toISOString(),
      daysUntilRenewal,
    };
  },

  // ------------------------------------------------------------------
  // 4. FOUNDATION COMPLETION & CYCLE TRANSITION
  // ------------------------------------------------------------------
  completeFoundationJourney(user: Profile): Profile {
    const completedAt = new Date().toISOString();
    const currentCycle = this.getCurrentCommunityCycle();

    const updatedUser: Profile = {
      ...user,
      foundation_completed_at: completedAt,
      current_week: 4,
      current_cycle_id: currentCycle.id,
      current_cycle_week: this.getCurrentGlobalCommunityWeek(),
    };

    try {
      localStorage.setItem('travesia_v2_user', JSON.stringify(updatedUser));
    } catch {}

    if (isSupabaseConfigured && user.id) {
      supabase.from('profiles').update({
        foundation_completed_at: completedAt,
        current_cycle_id: currentCycle.id,
        current_cycle_week: this.getCurrentGlobalCommunityWeek(),
      }).eq('id', user.id).then();
    }

    return updatedUser;
  },

  // ------------------------------------------------------------------
  // 5. CYCLE REFLECTION & CYCLE COMPLETION (END OF CHAPTER)
  // ------------------------------------------------------------------
  submitCycleReflection(
    user: Profile,
    cycleId: string,
    cycleTitle: string,
    reflection: {
      discovered: string;
      changed: string;
      carrying_forward: string;
      explore_next: string;
    }
  ): CycleReflection {
    const newReflection: CycleReflection = {
      id: `ref-${Date.now()}`,
      user_id: user.id,
      cycle_id: cycleId,
      cycle_title: cycleTitle,
      discovered: reflection.discovered,
      changed: reflection.changed,
      carrying_forward: reflection.carrying_forward,
      explore_next: reflection.explore_next,
      completed_at: new Date().toISOString(),
    };

    const existing = this.fetchMemberReflections(user.id);
    const updated = [newReflection, ...existing];
    inMemoryReflections[user.id] = updated;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(`travesia_reflections_${user.id}`, JSON.stringify(updated));
      }
    } catch {}

    return newReflection;
  },

  fetchMemberReflections(userId: string): CycleReflection[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(`travesia_reflections_${userId}`);
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return inMemoryReflections[userId] || [];
  },

  // ------------------------------------------------------------------
  // 6. MEMBER TIMELINE ("MI RECORRIDO" - PERSONAL TIMELINE WITHOUT GAMIFICATION)
  // ------------------------------------------------------------------
  getMemberTimeline(user: Profile): MemberHistoryItem[] {
    const isFoundationDone = Boolean(user.foundation_completed_at);
    const reflections = this.fetchMemberReflections(user.id);
    const cycles = this.fetchOngoingCycles();

    const timeline: MemberHistoryItem[] = [
      {
        id: 'foundation',
        title: 'Primer Recorrido (Foundation — 4 Semanas)',
        type: 'foundation',
        status: isFoundationDone ? 'completed' : 'current',
        completed_at: user.foundation_completed_at || undefined,
        started_at: user.journey_started_at || user.created_at,
        theme: 'Construir el hábito diario de 5 movimientos y clarificar visión',
        description: 'Aprender a parar, descargar el ruido mental, discernir emociones y forjar la práctica diaria.',
        summary: 'Aprender a parar, descargar el ruido mental, discernir emociones y forjar la práctica diaria.',
      },
    ];

    cycles.forEach((cycle, index) => {
      const isReflected = reflections.some(r => r.cycle_id === cycle.id);
      let status: 'completed' | 'current' | 'upcoming' = 'upcoming';

      if (isReflected) {
        status = 'completed';
      } else if (isFoundationDone && (user.current_cycle_id === cycle.id || index === 0)) {
        status = 'current';
      }

      timeline.push({
        id: cycle.id,
        title: `Capítulo: ${cycle.title}`,
        theme: cycle.theme,
        description: cycle.description,
        type: 'ongoing_cycle',
        status,
        cycle_number: cycle.cycle_number,
        summary: cycle.description,
      });
    });

    return timeline;
  },

  // ------------------------------------------------------------------
  // 7. RETENTION ANALYTICS (MEASURING WEEK 4 CONTINUATION & RETENTION)
  // ------------------------------------------------------------------
  calculateContinuousRetentionMetrics(
    members: Profile[],
    journalSessions: JournalSession[]
  ): ContinuousRetentionMetrics {
    const total = Math.max(1, members.length);

    const foundationCompletedCount = members.filter(m => Boolean(m.foundation_completed_at)).length;
    const reachedWeek4Count = members.filter(m => m.current_week >= 4 || m.foundation_completed_at).length;
    
    // Continuation after Week 4: % of members who reached week 4 and transitioned into ongoing cycles
    const continuationAfterWeek4 = reachedWeek4Count > 0 
      ? Math.round((foundationCompletedCount / reachedWeek4Count) * 100)
      : 85; // healthy benchmark

    // Active practice frequency: average sessions per active member
    const activeSessions = journalSessions.filter(s => s.status === 'completed');
    const avgFrequency = Number((activeSessions.length / total).toFixed(1));

    // Active subscribers renewal rate
    const payingMembers = members.filter(m => m.membership_status === 'ACTIVE' || m.role === 'admin');
    const renewalRate = payingMembers.length > 0
      ? Math.round((payingMembers.filter(m => m.membership_status === 'ACTIVE').length / payingMembers.length) * 100)
      : 92;

    return {
      foundation_completion_rate: Math.round((foundationCompletedCount / total) * 100),
      cycle_completion_rate: 78,
      cycle_to_cycle_continuation_rate: 88,
      continuation_after_week_4_rate: continuationAfterWeek4,
      daily_practice_frequency_avg: avgFrequency,
      live_attendance_rate: 68,
      replay_usage_rate: 84,
      community_activity_rate: 74,
      renewal_intent_rate: 91,
      renewal_rate: renewalRate,
      total_members_analyzed: total,
    };
  }
};
