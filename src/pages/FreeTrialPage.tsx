import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Play, 
  Compass, 
  Clock, 
  Calendar, 
  Flame, 
  RotateCcw,
  Volume2
} from 'lucide-react';
import { leadService } from '../services/leadService';
import { referralService } from '../services/referralService';
import { analyticsService } from '../services/analyticsService';
import { AcquisitionSource } from '../types';

interface TrialDay {
  dayNumber: number;
  title: string;
  theme: string;
  durationMinutes: number;
  description: string;
  promptQuestion: string;
  actionGuidance: string;
  nextDayExpectation: string;
}

const TRIAL_DAYS: TrialDay[] = [
  {
    dayNumber: 1,
    title: 'Día 1: Frenar',
    theme: 'Detener la inercia del piloto automático',
    durationMinutes: 5,
    description: 'Aprende a pausar la aceleración del sistema nervioso con respiración diafragmática 4-4-4-4 antes de mirar cualquier pantalla.',
    promptQuestion: '¿Qué pensamiento no solicitado ha estado persiguiéndote desde que te levantaste hoy?',
    actionGuidance: 'Permanece en silencio durante 2 minutos observando el ritmo de tu respiración sin juzgar lo que surge.',
    nextDayExpectation: 'Mañana en el Día 2: Aprenderás a vaciar el ruido mental acumulado en 3 minutos sin filtros.',
  },
  {
    dayNumber: 2,
    title: 'Día 2: Limpiar el Ruido',
    theme: 'Vaciado mental sin filtros',
    durationMinutes: 7,
    description: 'Escribe a mano o en el teclado todo lo que te preocupa, sin preocuparte por la gramática ni la elegancia.',
    promptQuestion: '¿Qué distracción externa estás usando deliberadamente para no quedarte a solas con tus pensamientos?',
    actionGuidance: 'Vuelca en el campo de texto durante 3 minutos todo lo que satura tu atención en este instante.',
    nextDayExpectation: 'Mañana en el Día 3: Localizarás en tu cuerpo cuál de las 8 emociones básicas está presente.',
  },
  {
    dayNumber: 3,
    title: 'Día 3: Sentir',
    theme: 'Nombrar la realidad emocional con precisión',
    durationMinutes: 10,
    description: 'Lo que no nombras te gobierna. Localiza cuál de las 8 emociones básicas está presente en tu cuerpo.',
    promptQuestion: '¿Cuál es la emoción predominante que llevas en el pecho o en el estómago mientras respiras ahora?',
    actionGuidance: 'Elige una sola emoción (Dolor, Soledad, Tristeza, Ira, Miedo, Vergüenza, Culpa o Alegría) y conéctala a un hecho concreto.',
    nextDayExpectation: 'Mañana en el Día 4: Entrarás en la quietud receptiva sin necesidad de defender ningún punto de vista.',
  },
  {
    dayNumber: 4,
    title: 'Día 4: Escuchar',
    theme: 'El arte de la quietud receptiva',
    durationMinutes: 10,
    description: 'Silencia la necesidad de resolverlo todo. Abre un espacio para escuchar la verdad sutil en oración o quietud.',
    promptQuestion: 'Si dejas de defender tu punto de vista durante cinco minutos, ¿qué verdad empieza a revelarse?',
    actionGuidance: 'Guarda silencio profundo sin consultar notas ni teléfono durante los próximos 5 minutos.',
    nextDayExpectation: 'Mañana en el Día 5: Traducirás la quietud en una sola acción obligatoria e innegociable con hora fijada.',
  },
  {
    dayNumber: 5,
    title: 'Día 5: Actuar',
    theme: 'Una sola acción obligatoria',
    durationMinutes: 10,
    description: 'La dispersión destruye el foco. Transforma la claridad de hoy en un único compromiso ineludible con hora fijada.',
    promptQuestion: '¿Cuál es la única acción que si la terminas hoy hará que todo lo demás sea más fácil?',
    actionGuidance: 'Redacta tu compromiso con formato: "Hoy a las [HORA] haré [ACCIÓN EXACTA]".',
    nextDayExpectation: 'Mañana en el Día 6: Proyectarás la sobriedad hacia tu visión y orden de vida para el próximo año.',
  },
  {
    dayNumber: 6,
    title: 'Día 6: Visión',
    theme: 'Discernir la vida que estás llamado a forjar',
    durationMinutes: 12,
    description: 'Mira más allá de las urgencias de la semana. ¿Qué orden y propósito quieres que gobiernen tu próximo año?',
    promptQuestion: '¿Qué aspecto de tu vocación estás tolerando que sabes en el fondo que debes cambiar?',
    actionGuidance: 'Visualiza un día ordinario dentro de dos años viviendo con sobriedad y escribe sus 3 rasgos fundamentales.',
    nextDayExpectation: 'Mañana en el Día 7: Integrarás los 5 Movimientos para consolidar tu nuevo estándar diario.',
  },
  {
    dayNumber: 7,
    title: 'Día 7: Integración',
    theme: 'Consolidación de tu hábito diario',
    durationMinutes: 15,
    description: 'Has experimentado los 5 Movimientos durante una semana. Este es tu nuevo estándar de vida personal.',
    promptQuestion: '¿Qué ha cambiado en tu nivel de serenidad y claridad al comenzar cada día en silencio?',
    actionGuidance: 'Revisa tus compromisos de la semana y decide si estás listo para sostener esta práctica junto a la comunidad.',
    nextDayExpectation: 'Has terminado tus 7 primeros días.',
  },
];

const TRIAL_STORAGE_KEY = 'travesia_trial_progress_v3';

export const FreeTrialPage: React.FC = () => {
  const navigate = useNavigate();

  // Registration step
  const [leadCaptured, setLeadCaptured] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [source, setSource] = useState<AcquisitionSource>('Direct');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Active trial state
  const [activeDay, setActiveDay] = useState<number>(1);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [reflectionText, setReflectionText] = useState<string>('');
  const [timerSeconds, setTimerSeconds] = useState<number>(120);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  // Load saved trial progress
  useEffect(() => {
    try {
      const stored = localStorage.getItem(TRIAL_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.email) {
          setEmail(data.email);
          setName(data.name || '');
          setLeadCaptured(true);
          setCompletedDays(data.completedDays || []);
          setActiveDay(data.activeDay || 1);
        }
      }
    } catch {}

    // Check for referral code
    const refCode = referralService.getStoredReferralCode();
    if (refCode) {
      setSource('Referral');
    }
  }, []);

  // Timer countdown effect
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => s - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  // Handle lead submission
  const handleStartTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setIsLoading(true);
    await leadService.captureLead({
      email,
      name,
      source,
      landing_page: '/prueba',
    });
    await leadService.markTrialStarted(email);
    await analyticsService.track('trial_started', { email, source });

    const initialProgress = {
      email,
      name,
      completedDays: [],
      activeDay: 1,
      startedAt: new Date().toISOString(),
    };
    localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(initialProgress));

    setIsLoading(false);
    setLeadCaptured(true);
  };

  // Complete current day
  const handleCompleteCurrentDay = async () => {
    const updatedCompleted = Array.from(new Set([...completedDays, activeDay]));
    setCompletedDays(updatedCompleted);

    await analyticsService.track('trial_day_completed', {
      email,
      day: activeDay,
    });

    const isLastDay = activeDay === 7;
    if (isLastDay) {
      await leadService.markTrialCompleted(email);
    }

    const nextDay = Math.min(7, activeDay + 1);
    setActiveDay(nextDay);
    setReflectionText('');
    setTimerSeconds(120);
    setTimerRunning(false);

    try {
      localStorage.setItem(
        TRIAL_STORAGE_KEY,
        JSON.stringify({
          email,
          name,
          completedDays: updatedCompleted,
          activeDay: nextDay,
          completedTrial: isLastDay,
        })
      );
    } catch {}
  };

  const currentTrial = TRIAL_DAYS[activeDay - 1];

  return (
    <div className="min-h-screen bg-sand-50 text-stone-900 font-sans selection:bg-amber-200">
      {/* Top Brand Bar */}
      <header className="bg-stone-950 border-b border-stone-800 text-sand-50 h-16 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Compass className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <span className="font-serif font-bold text-base tracking-wider text-sand-50">TRAVESÍA</span>
            <span className="hidden sm:inline text-xs text-amber-400 ml-2 font-mono">· Reto Gratuito de 7 Días</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => navigate('/membership')}
            className="text-sand-300 hover:text-white font-medium transition-colors"
          >
            Ver Membresía Completa
          </button>
          <button
            onClick={() => navigate('/login')}
            className="travesia-btn-secondary text-xs py-1.5 px-3"
          >
            Acceso Miembros
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-10">
        {!leadCaptured ? (
          /* STEP 1: LEAD CAPTURE FORM */
          <div className="max-w-md mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-sand-200 shadow-xl space-y-6">
            <div className="text-center space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                Acceso Inmediato y Gratuito
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                Tu Reto de 7 Días de Claridad
              </h1>
              <p className="text-xs text-stone-600 leading-relaxed">
                Experimenta los 5 Movimientos durante una semana completa. 10 minutos al día para frenar el ruido y volver a ti.
              </p>
            </div>

            <form onSubmit={handleStartTrial} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Tu nombre</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Gabriel Morales"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="travesia-input w-full"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Tu correo electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="travesia-input w-full"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">¿Cómo nos conociste?</label>
                <select
                  value={source}
                  onChange={e => setSource(e.target.value as AcquisitionSource)}
                  className="travesia-input w-full"
                >
                  <option value="Direct">Búsqueda Directa / Recomendación</option>
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Newsletter">Newsletter</option>
                  <option value="Referral">Enlace de un amigo</option>
                  <option value="Other">Otro canal</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full travesia-btn-accent text-sm py-3.5 font-bold shadow-md text-stone-950 flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Activando...' : 'Comenzar Día 1: Frenar →'}
                </button>
              </div>

              <p className="text-[11px] text-center text-stone-500">
                100% gratuito. Sin tarjeta de crédito. Tus datos están a salvo.
              </p>
            </form>
          </div>
        ) : (
          /* STEP 2: INTERACTIVE 7-DAY WORKFLOW */
          <div className="space-y-8">
            {/* Header progress overview */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sand-100 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700">
                    Tu Santuario Gratuito
                  </span>
                  <h2 className="font-serif font-bold text-xl text-stone-900">
                    Bienvenido, {name || email.split('@')[0]}
                  </h2>
                </div>

                <div className="text-xs text-stone-500">
                  Progreso: <strong className="text-stone-900">{completedDays.length} de 7 días</strong> completados
                </div>
              </div>

              {/* 7-Day Stepper */}
              <div className="grid grid-cols-7 gap-2 pt-2">
                {TRIAL_DAYS.map(day => {
                  const isCompleted = completedDays.includes(day.dayNumber);
                  const isCurrent = activeDay === day.dayNumber;

                  return (
                    <button
                      key={day.dayNumber}
                      onClick={() => setActiveDay(day.dayNumber)}
                      className={`p-2.5 rounded-2xl text-center border transition-all ${
                        isCurrent
                          ? 'bg-stone-900 text-white border-stone-900 shadow-md scale-105'
                          : isCompleted
                          ? 'bg-emerald-50 text-emerald-950 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-sand-50 text-stone-400 border-sand-200 hover:bg-sand-100'
                      }`}
                    >
                      <div className="text-[10px] font-mono font-bold">D{day.dayNumber}</div>
                      <div className="text-xs font-semibold truncate hidden sm:block">
                        {day.title.split(':')[1]?.trim() || day.title}
                      </div>
                      {isCompleted && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mx-auto mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Day Practice Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-sand-200 shadow-card space-y-8">
              <div className="space-y-2 border-b border-sand-100 pb-5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    {currentTrial.title}
                  </span>
                  <span className="text-xs text-stone-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {currentTrial.durationMinutes} minutos recomendados
                  </span>
                </div>
                <h3 className="font-serif font-bold text-2xl text-stone-900">
                  {currentTrial.theme}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed max-w-2xl">
                  {currentTrial.description}
                </p>
              </div>

              {/* Silence & breathing exercise timer */}
              <div className="bg-sand-50 rounded-2xl p-6 border border-sand-200 text-center space-y-4">
                <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                  Guía del ejercicio
                </span>
                <p className="font-serif italic text-base text-stone-800 max-w-lg mx-auto">
                  "{currentTrial.actionGuidance}"
                </p>

                <div className="flex items-center justify-center gap-4 pt-2">
                  <div className="font-mono text-2xl font-bold text-stone-900 bg-white px-4 py-2 rounded-xl border border-sand-300">
                    {Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')}
                  </div>
                  <button
                    onClick={() => setTimerRunning(!timerRunning)}
                    className="travesia-btn-secondary text-xs py-2 px-4 shadow-sm"
                  >
                    {timerRunning ? 'Pausar tiempo' : 'Iniciar silencio guiado'}
                  </button>
                  <button
                    onClick={() => {
                      setTimerRunning(false);
                      setTimerSeconds(120);
                    }}
                    className="p-2 text-stone-400 hover:text-stone-700 rounded-lg"
                    title="Reiniciar"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Reflection question & text area */}
              <div className="space-y-3">
                <label className="block font-serif font-semibold text-base text-stone-900">
                  Pregunta de examen: <span className="italic font-normal text-stone-700">{currentTrial.promptQuestion}</span>
                </label>
                <textarea
                  rows={4}
                  value={reflectionText}
                  onChange={e => setReflectionText(e.target.value)}
                  placeholder="Escribe tu reflexión con honestidad sin filtros. Nadie leerá este texto..."
                  className="travesia-input w-full text-xs font-serif leading-relaxed"
                />
              </div>

              {/* Next-Day Expectation & Completion State */}
              <div className="space-y-3 pt-2 border-t border-sand-100">
                {completedDays.includes(activeDay) && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Has completado la práctica del {currentTrial.title}.</span>
                  </div>
                )}

                {activeDay < 7 && (
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold uppercase text-[10px] tracking-wider text-amber-800 block">
                        Expectativa para mañana
                      </span>
                      <p className="text-amber-900 mt-0.5">
                        {currentTrial.nextDayExpectation}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-sand-100">
                <div className="text-xs text-stone-500 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-stone-400" />
                  <span>Tu práctica es 100% privada</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCompleteCurrentDay}
                    className="w-full sm:w-auto travesia-btn-primary text-xs py-3 px-6 shadow-md font-semibold flex items-center justify-center gap-2"
                  >
                    <span>{completedDays.includes(activeDay) ? 'Marcar como repasado' : 'Completar práctica de hoy'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Trial Completion / Exact Phase 4 Offer Card */}
            {(completedDays.includes(7) || activeDay === 7) && (
              <div className="bg-stone-950 text-sand-50 rounded-3xl p-8 sm:p-12 border-2 border-amber-500/50 shadow-2xl space-y-6 text-center sm:text-left">
                <div className="space-y-3">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 inline-block">
                    ¿Y AHORA QUÉ?
                  </span>
                  
                  <h3 className="font-serif font-bold text-2xl sm:text-3xl text-sand-50">
                    Has terminado tus 7 primeros días.
                  </h3>

                  <div className="space-y-1 text-sm sm:text-base font-serif text-sand-200 py-2">
                    <p>Puedes volver a hacerlo solo.</p>
                    <p className="text-amber-400 font-semibold">Pero también puedes hacerlo acompañado.</p>
                  </div>

                  <p className="text-xs text-sand-400 leading-relaxed max-w-xl">
                    Cada mañana a las 07:00 AM (CET) nos reunimos en directo para hacer este trabajo juntos. Sin ruido, sin dogmas, con una comunidad de personas sobrias que no quieren dispersar su vida.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                  <button
                    onClick={() => navigate('/membership')}
                    className="w-full sm:w-auto travesia-btn-accent text-sm py-4 px-8 font-bold shadow-xl text-stone-950 flex items-center justify-center gap-2"
                  >
                    <span>Entrar en Travesía</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full sm:w-auto text-xs text-sand-400 hover:text-white underline py-2"
                  >
                    Explorar el santuario
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
