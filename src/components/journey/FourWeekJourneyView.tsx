import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDataStore } from '../../lib/dataStore';
import { LessonsView } from '../lessons/LessonsView';
import { 
  Sparkles, 
  CheckCircle, 
  Lock, 
  ArrowRight, 
  Calendar, 
  Compass, 
  Eye, 
  ShieldAlert, 
  Hammer, 
  Award, 
  BookOpen, 
  Milestone, 
  History, 
  Check, 
  ChevronRight, 
  Flame, 
  Clock, 
  Layers, 
  HeartHandshake,
  PenLine
} from 'lucide-react';

interface FourWeekJourneyViewProps {
  defaultTab?: 'foundation' | 'ongoing' | 'lessons' | 'history';
}

export const FourWeekJourneyView: React.FC<FourWeekJourneyViewProps> = ({ defaultTab }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { 
    currentUser, 
    updateCurrentUserProfile, 
    personalJourneyProgress, 
    ongoingCycles, 
    currentCommunityCycle, 
    currentGlobalCommunityWeek, 
    memberTimeline, 
    completeFoundation, 
    submitCycleReflection
  } = useDataStore();

  const isFoundationCompleted = Boolean(currentUser.foundation_completed_at);
  const paramTab = searchParams.get('tab') as 'foundation' | 'ongoing' | 'lessons' | 'history' | null;
  const [activeTab, setActiveTab] = useState<'foundation' | 'ongoing' | 'lessons' | 'history'>(
    defaultTab || paramTab || (isFoundationCompleted ? 'ongoing' : 'foundation')
  );

  const [selectedFoundationWeek, setSelectedFoundationWeek] = useState<number>(
    personalJourneyProgress?.current_week || currentUser.current_week || 1
  );
  const [selectedLessonId, setSelectedLessonId] = useState<string | undefined>(undefined);

  // Reflection form state for ongoing cycle completion
  const [reflection1, setReflection1] = useState('');
  const [reflection2, setReflection2] = useState('');
  const [reflection3, setReflection3] = useState('');
  const [reflection4, setReflection4] = useState('');
  const [reflectionSuccess, setReflectionSuccess] = useState(false);
  const [showReflectionModal, setShowReflectionModal] = useState(false);

  const currentActiveWeek = personalJourneyProgress?.current_week || currentUser.current_week || 1;
  const currentActiveDay = personalJourneyProgress?.current_day || 1;

  const FOUNDATION_WEEKS = [
    {
      number: 1,
      title: 'EL PRESENTE',
      tagline: 'Construyendo el cimiento de la práctica diaria',
      icon: Compass,
      focus: 'Aprender a parar, bajar el ritmo y habitar el ahora ante Dios.',
      lessonId: 'les-2-1',
      lessonTitle: 'El Presente: El mito de la falta de tiempo',
      topics: [
        'Frenar y Desacelerar: Salir del modo reactivo del mundo exterior',
        'Limpiar el Ruido Mental: Trasladar el desorden mental al papel blanco',
        'Escritura Honesta: Escribir sin intentar quedar bien contigo mismo',
        'Conciencia Emocional: Nombrar el dolor, la soledad y la ira sin anestesiarte',
        'Silencio Santo: Entrenar el músculo de estar en quietud sin pantallas',
        'Escucha Espiritual: Reconocer la voz y el discernimiento de Dios',
        'Acción Deliberada: Sellar cada amanecer con un paso tangible'
      ],
      exercises: [
        'Rutina del Despertador Analógico: Sacar el teléfono del dormitorio',
        'Los 3 ciclos respiratorios de anclaje cada mañana',
        'Vaciado mental de 10 minutos sin corregir puntuación'
      ]
    },
    {
      number: 2,
      title: 'LA VISIÓN',
      tagline: '¿Qué clase de vida estás realmente llamado a construir?',
      icon: Eye,
      focus: 'Diseñar el mapa de tu vida con sobriedad y propósito espiritual.',
      lessonId: 'les-4-1',
      lessonTitle: 'La Visión: Definir tu norte ante Dios y tu familia',
      topics: [
        'Vida Ideal Realista: El ejercicio del "martes normal" a 3 años vista',
        'Valores No Negociables: Principios que guían tus decisiones bajo presión',
        'Relaciones Primarias: Cómo honrar a tu cónyuge, hijos y amistades leales',
        'Vocación & Trabajo: Servir con excelencia sin idolatrar el estatus',
        'Salud & Vitalidad: El cuerpo como templo y herramienta de tu misión',
        'Espiritualidad Viva: Comunión diaria con Dios más allá de ritos vacíos',
        'Legado & Contribución: Qué fruto perdurable quedará cuando partas'
      ],
      exercises: [
        'Redactar la carta de tu visión personal a 3 años',
        'Definir los 5 estándares innegociables de tu hogar',
        'Auditoría de prioridades: ¿Tu calendario refleja tu visión?'
      ]
    },
    {
      number: 3,
      title: 'LOS OBSTÁCULOS',
      tagline: '¿Qué se interpone entre tú y la vida que buscas forjar?',
      icon: ShieldAlert,
      focus: 'Desmontar el autoengaño, la evasión y las trampas del ego.',
      lessonId: 'les-5-1',
      lessonTitle: 'Los Obstáculos: Nombrar las trampas del ego y autoboicot',
      topics: [
        'Miedo al Fracaso & Vergüenza: Cómo nos paraliza el qué dirán',
        'Patrones de Evasión: Las adicciones sutiles al trabajo, pantallas o comida',
        'Creencias Limitantes: Mentiras históricas heredadas que sigues creyendo',
        'Conflictos Inconclusos: El veneno del resentimiento y la falta de perdón',
        'La Zona de Confort: Cómo la comodidad mediocre mata la grandeza',
        'Autoboicot: Por qué saboteas las victorias cuando estás cerca de la meta'
      ],
      exercises: [
        'Mapeo de tus 3 mayores coartadas emocionales',
        'La lista de personas a quienes necesitas perdonar para desatarte',
        'Identificar el disparador ambiental que activa tus viejos hábitos'
      ]
    },
    {
      number: 4,
      title: 'EL TRABAJO',
      tagline: 'Lo que realmente requerirá de ti en la práctica',
      icon: Hammer,
      focus: 'Forjar el carácter mediante la disciplina, los límites y el coraje.',
      lessonId: 'les-6-1',
      lessonTitle: 'El Trabajo: La conversación difícil y el límite sagrado',
      topics: [
        'Límites Inquebrantables: Aprender a decir "no" sin culpa',
        'Conversaciones Difíciles: Decir la verdad con amor y firmeza',
        'Sacrificios Conscientes: Qué debes abandonar para que tu visión nazca',
        'Sistemas de Hábitos: Proteger las mañanas y ordenar las noches',
        'Rendición de Cuentas: Compartir el camino con hermanos de confianza',
        'Consistencia Inflexible: Actuar aun cuando no haya motivación emocional'
      ],
      exercises: [
        'Tener esa conversación difícil que llevas semanas postergando',
        'Pactar una reunión semanal de rendición de cuentas con un compañero',
        'Diseñar tu Regla de Vida Personal definitiva'
      ]
    }
  ];

  const currentFoundationWeekData = FOUNDATION_WEEKS[selectedFoundationWeek - 1] || FOUNDATION_WEEKS[0];

  const handleCompleteFoundation = () => {
    completeFoundation();
    setActiveTab('ongoing');
  };

  const handleSubmitReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCommunityCycle) return;
    submitCycleReflection(currentCommunityCycle.id, currentCommunityCycle.title, {
      discovered: reflection1,
      changed: reflection2,
      carrying_forward: reflection3,
      explore_next: reflection4
    });
    setReflectionSuccess(true);
    setTimeout(() => {
      setReflectionSuccess(false);
      setShowReflectionModal(false);
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 space-y-8 animate-fade-in">
      {/* Top Experience Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-sand-200 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {!isFoundationCompleted ? (
            <>
              <button
                onClick={() => setActiveTab('foundation')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'foundation'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-sand-100'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Primer Recorrido (4 Semanas)</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full font-bold">
                  Semana {currentActiveWeek}/4
                </span>
              </button>

              <button
                onClick={() => setActiveTab('ongoing')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'ongoing'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-sand-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Ciclos de la Comunidad</span>
                <span className="text-[10px] bg-sand-200 text-stone-700 px-1.5 py-0.2 rounded-full font-medium">En Vivo</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('ongoing')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'ongoing'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-sand-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Capítulos Continuos (Ciclos)</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded-full font-bold">En Vivo</span>
              </button>

              <button
                onClick={() => setActiveTab('foundation')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'foundation'
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-sand-100'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Primer Recorrido</span>
                <span className="text-[10px] bg-emerald-800 text-emerald-200 px-1.5 py-0.2 rounded-full">✓</span>
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab('lessons')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'lessons'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-sand-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Lecciones del Camino</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-sand-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Mi Recorrido</span>
          </button>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-stone-500 block">
            {isFoundationCompleted ? 'Membresía Continua Activa' : 'Etapa Formativa Inicial'}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: PRIMER RECORRIDO (FOUNDATION JOURNEY)                             */}
      {/* ========================================================================= */}
      {activeTab === 'foundation' && (
        <div className="space-y-6">
          {/* Hero Header */}
          <div className="bg-stone-900 text-sand-50 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-widest text-amber-400 bg-stone-800/80 px-3 py-1 rounded-full border border-stone-700/60 inline-flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Primer Recorrido · Foundation</span>
                </span>
                {isFoundationCompleted ? (
                  <span className="text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 px-3 py-1 rounded-full font-medium">
                    Primer recorrido completado
                  </span>
                ) : (
                  <span className="text-xs bg-amber-950/80 text-amber-300 border border-amber-700/50 px-3 py-1 rounded-full font-medium">
                    Semana {currentActiveWeek} de 4 · Día {currentActiveDay} de 7
                  </span>
                )}
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold">
                El Camino de 4 Semanas
              </h1>
              <p className="text-sand-300 text-xs sm:text-sm max-w-xl leading-relaxed">
                Tu primer recorrido personal. Cuatro semanas diseñadas para aprender a frenar el ruido, clarificar visión, derribar obstáculos y forjar la disciplina del trabajo diario.
              </p>

              {/* Requirement 11: Explanatory microcopy for new users */}
              <div className="p-3.5 rounded-2xl bg-stone-800/80 border border-stone-700/70 text-xs text-sand-300 flex items-start gap-2.5">
                <HeartHandshake className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">
                    "Tu recorrido comienza hoy. Mientras tanto, puedes participar en todo lo que está viviendo la comunidad."
                  </p>
                  <p className="text-stone-400 text-[11px] mt-0.5">
                    Tu proceso de 4 semanas es completamente tuyo. No tienes que esperar al primer día de mes ni sincronizarte con el calendario para empezar a transformar tu vida.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Week Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {FOUNDATION_WEEKS.map(w => {
              const isSelected = selectedFoundationWeek === w.number;
              const isCurrent = currentActiveWeek === w.number && !isFoundationCompleted;
              const isPast = isFoundationCompleted || w.number < currentActiveWeek;
              const isFuture = !isFoundationCompleted && w.number > currentActiveWeek;
              const Icon = w.icon;

              return (
                <button
                  key={w.number}
                  onClick={() => setSelectedFoundationWeek(w.number)}
                  className={`p-4 rounded-2xl border text-left transition-all relative ${
                    isSelected
                      ? 'border-stone-900 bg-stone-900 text-white shadow-md'
                      : 'border-sand-200 bg-white hover:bg-sand-100/70 text-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-stone-800 text-amber-400' : 'bg-sand-100 text-stone-600'
                    }`}>
                      Semana {w.number}
                    </span>
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-stone-400'}`} />
                  </div>
                  <p className="font-serif font-bold text-base leading-tight">
                    {w.title}
                  </p>
                  {isCurrent && (
                    <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-amber-500">
                      ● En curso (Día {currentActiveDay}/7)
                    </span>
                  )}
                  {isPast && (
                    <span className="inline-block mt-2 text-[10px] font-semibold text-emerald-600">
                      ✓ Completada
                    </span>
                  )}
                  {isFuture && (
                    <span className="inline-flex items-center gap-1 mt-2 text-[10px] text-stone-400">
                      <Lock className="w-2.5 h-2.5" /> Próxima
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Week Deep Dive Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-card space-y-6">
            <div className="border-b border-sand-200 pb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-bronze-700 uppercase tracking-wider">
                <span>Módulo de la Semana {currentFoundationWeekData.number}</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
                {currentFoundationWeekData.title}: {currentFoundationWeekData.tagline}
              </h2>
              <p className="text-sm text-stone-600 mt-1 leading-relaxed">
                {currentFoundationWeekData.focus}
              </p>
            </div>

            {/* Interactive Daily Practice Callout if this is the user's active week */}
            {selectedFoundationWeek === currentActiveWeek && !isFoundationCompleted && (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-300/80 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-xs uppercase font-bold tracking-wider text-amber-900">
                      Tu Práctica de Hoy · Día {currentActiveDay} de 7
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-stone-600">
                    Semana {currentActiveWeek}: {currentFoundationWeekData.title}
                  </span>
                </div>

                {/* 7 Days Visual Pills */}
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                    const isDayPast = dayNum < currentActiveDay;
                    const isDayToday = dayNum === currentActiveDay;
                    return (
                      <div
                        key={dayNum}
                        className={`p-2 rounded-xl text-center border transition-all ${
                          isDayToday
                            ? 'bg-stone-900 border-stone-900 text-white shadow-sm ring-2 ring-amber-400/70'
                            : isDayPast
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-white border-sand-200 text-stone-400'
                        }`}
                      >
                        <span className="block text-[10px] font-bold uppercase">
                          D{dayNum}
                        </span>
                        <span className="block text-xs font-semibold mt-0.5">
                          {isDayPast ? '✓' : isDayToday ? 'Hoy' : '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Day prompt / topic callout */}
                <div className="pt-2 border-t border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                      Eje del Día {currentActiveDay}
                    </span>
                    <p className="text-xs sm:text-sm font-serif font-bold text-stone-900">
                      {currentFoundationWeekData.topics[currentActiveDay - 1] || currentFoundationWeekData.topics[0]}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/journal/today')}
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-all flex-shrink-0"
                  >
                    <PenLine className="w-3.5 h-3.5" />
                    <span>Hacer la práctica de hoy en el Diario →</span>
                  </button>
                </div>
              </div>
            )}

            {/* Topics List */}
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900 mb-3">
                Ejes de Reflexión y Práctica
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentFoundationWeekData.topics.map((topic, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-sand-50/70 border border-sand-200 text-xs text-stone-800 flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-sand-200 text-stone-700 font-bold flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Exercises */}
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900 mb-3">
                Ejercicios Prácticos de la Semana
              </h3>
              <div className="space-y-2">
                {currentFoundationWeekData.exercises.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 text-xs text-stone-800 flex items-center justify-between"
                  >
                    <span className="font-medium text-stone-900">{ex}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-bronze-700 px-2 py-0.5 rounded bg-white border border-amber-200">
                      Ejercicio
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Connected Foundational Lesson */}
            <div className="p-4 rounded-2xl bg-sand-100/80 border border-sand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                    Lección Formativa de la Semana {currentFoundationWeekData.number}
                  </span>
                  <p className="font-serif font-bold text-stone-900 text-sm">
                    {currentFoundationWeekData.lessonTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedLessonId(currentFoundationWeekData.lessonId);
                  setActiveTab('lessons');
                }}
                className="px-4 py-2 rounded-xl bg-white hover:bg-stone-900 hover:text-white border border-sand-300 text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto flex-shrink-0 shadow-sm"
              >
                <span>Ver lección formativa</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* PROGRESSION / CULMINATION BLOCK */}
          {!isFoundationCompleted && currentActiveWeek < 4 ? (
            <div className="travesia-card p-6 sm:p-8 bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 text-white space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
                    Progreso de Tu Primer Recorrido
                  </span>
                </div>
                <span className="text-xs text-stone-400 font-mono">
                  {Math.round((((currentActiveWeek - 1) * 7 + currentActiveDay) / 28) * 100)}% completado
                </span>
              </div>

              <div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  "Estás forjando el cimiento de tu vida interior."
                </h3>
                <p className="text-stone-300 text-sm mt-2 font-serif italic leading-relaxed">
                  "No corras. Aprender a parar y escribir con honestidad ante Dios es el trabajo."
                </p>
                <p className="text-stone-400 text-xs mt-2 leading-relaxed">
                  Semana {currentActiveWeek} de 4 · Día {currentActiveDay} de 7. Al completar tus 4 semanas de preparación, desbloquearás la graduación y pasarás de lleno al ritmo continuo de los ciclos comunitarios.
                </p>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((((currentActiveWeek - 1) * 7 + currentActiveDay) / 28) * 100)}%` }}
                />
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => navigate('/journal/today')}
                  className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all"
                >
                  <PenLine className="w-4 h-4" />
                  <span>Continuar Práctica de Hoy en el Diario</span>
                </button>

                <button
                  onClick={() => setActiveTab('ongoing')}
                  className="px-6 py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-sand-100 font-semibold text-xs border border-stone-700 flex items-center gap-2 transition-all"
                >
                  <span>Ver Ciclo Global de la Comunidad</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="travesia-card p-6 sm:p-8 bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 text-white space-y-4">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-400" />
                <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
                  {isFoundationCompleted ? 'Primer Recorrido Completado' : 'Culminación del Primer Recorrido'}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                  "Has completado tu primer recorrido."
                </h3>
                <p className="text-stone-300 text-sm mt-2 font-serif italic leading-relaxed">
                  "Esto no era la meta. Era aprender a hacer el trabajo."
                </p>
                <p className="text-stone-400 text-xs mt-2 leading-relaxed">
                  Tu siguiente capítulo comienza ahora. La comunidad continúa cada mes explorando un eje vital diferente (Relaciones, Propósito, Disciplina, Coraje, Límites) mediante la práctica matutina y encuentros en vivo.
                </p>
              </div>

              <div className="pt-3 flex flex-wrap items-center gap-4">
                {!isFoundationCompleted ? (
                  <button
                    onClick={handleCompleteFoundation}
                    className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all"
                  >
                    <span>Empezar mi próximo capítulo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : currentUser?.membership_status === 'EXPIRED' ? (
                  <button
                    onClick={() => navigate('/membership?from=ongoing_cycles_expired')}
                    className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-all"
                  >
                    <span>CONTINUAR EN TRAVESÍA</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('ongoing')}
                    className="px-6 py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-sand-50 font-bold text-xs uppercase tracking-wider border border-stone-700 flex items-center gap-2 transition-all"
                  >
                    <span>Explorar el Ciclo Actual de la Comunidad ({currentCommunityCycle?.title})</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                <span className="text-[11px] text-stone-400">
                  Tu membresía activa te da acceso ininterrumpido a todos los ciclos continuos.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: CAPÍTULOS CONTINUOS (ONGOING MONTHLY CYCLES)                      */}
      {/* ========================================================================= */}
      {activeTab === 'ongoing' && (
        <div className="space-y-6">
          {/* Current Community Cycle Hero */}
          <div className="bg-stone-900 text-sand-50 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs uppercase font-bold tracking-widest text-amber-400 bg-stone-800/90 px-3 py-1 rounded-full border border-stone-700/60 inline-flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Ciclo Global de la Comunidad · Mes En Curso</span>
              </span>

              <span className="text-xs bg-stone-800 text-sand-300 px-3 py-1 rounded-full border border-stone-700">
                Semana Global {currentGlobalCommunityWeek} de 4
              </span>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-amber-300/90 font-semibold">
                Esta semana, la comunidad está explorando:
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold mt-1">
                Ciclo: {currentCommunityCycle?.title}
              </h1>
              <p className="text-sand-300 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
                {currentCommunityCycle?.description}
              </p>
            </div>

            {/* Daily Prompt Connection */}
            <div className="p-4 rounded-2xl bg-stone-800/80 border border-stone-700 text-xs text-sand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block mb-0.5">
                  Tema y Pregunta del Día
                </span>
                <p className="font-serif text-sm font-semibold text-white">
                  "¿Qué conversación estás evitando?"
                </p>
              </div>
              <a
                href="/journal"
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider text-center flex-shrink-0 transition-all"
              >
                Hacer el Trabajo de Hoy →
              </a>
            </div>
          </div>

          {/* 4 Weeks of the Current Ongoing Cycle */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-card space-y-6">
            <div className="border-b border-sand-200 pb-3">
              <h2 className="font-serif text-2xl font-bold text-stone-900">
                Itinerario de las 4 Semanas del Ciclo "{currentCommunityCycle?.title}"
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Cada semana abre un ángulo profundo del tema. Todos los miembros activos participan simultáneamente.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentCommunityCycle?.weeks.map((week) => {
                const isCurrentWeek = week.week_number === currentGlobalCommunityWeek;
                return (
                  <div
                    key={week.week_number}
                    className={`p-5 rounded-2xl border transition-all ${
                      isCurrentWeek
                        ? 'border-amber-400 bg-amber-50/40 shadow-sm'
                        : 'border-sand-200 bg-sand-50/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isCurrentWeek ? 'bg-amber-500 text-stone-950' : 'bg-sand-200 text-stone-700'
                      }`}>
                        Semana {week.week_number} {isCurrentWeek ? '· En Vivo' : ''}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-lg text-stone-900">
                      {week.title}
                    </h3>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {week.description || week.focus}
                    </p>
                    <div className="mt-3 pt-3 border-t border-sand-200/80 text-[11px] text-stone-700">
                      <span className="font-semibold text-stone-900">Pregunta rectora: </span>
                      <span className="italic">"{week.daily_prompt_example || week.prompt_focus}"</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* REQUIREMENT 13: CYCLE COMPLETION & REFLECTION */}
            <div className="pt-4 border-t border-sand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-serif font-bold text-base text-stone-900">
                  Cierre de Ciclo & Reflexión
                </h4>
                <p className="text-xs text-stone-600">
                  Al completar este capítulo, plasma las 4 preguntas de integración antes de pasar al siguiente.
                </p>
              </div>
              <button
                onClick={() => setShowReflectionModal(true)}
                className="travesia-btn-secondary text-xs py-2.5 px-4 whitespace-nowrap"
              >
                Completar Reflexión del Ciclo
              </button>
            </div>
          </div>

          {/* Catalog of Upcoming Cycles */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-xl text-stone-900">
                  Próximos Capítulos de la Comunidad
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                  La travesía nunca se detiene. Cada mes abordamos un territorio esencial del carácter y la vida interior.
                </p>
              </div>
              <span className="text-xs font-semibold text-stone-500 bg-sand-100 px-3 py-1 rounded-full">
                11 Ciclos Anuales
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
              {ongoingCycles.map((cycle, idx) => {
                const isActive = cycle.id === currentCommunityCycle?.id;
                return (
                  <div
                    key={cycle.id}
                    className={`p-3.5 rounded-2xl border text-left ${
                      isActive
                        ? 'border-amber-400 bg-amber-50/60 shadow-sm'
                        : 'border-sand-200 bg-sand-50/30'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                      <span>Ciclo {cycle.cycle_number}</span>
                      {isActive && <span className="text-amber-700 font-bold">Activo</span>}
                    </div>
                    <p className="font-serif font-bold text-sm text-stone-900">
                      {cycle.title}
                    </p>
                    <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">
                      {cycle.theme}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: MI RECORRIDO (MEMBER HISTORY TIMELINE - NO GAMIFICATION)          */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="bg-stone-900 text-sand-50 rounded-3xl p-6 sm:p-8 shadow-xl space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400 bg-stone-800/80 px-3 py-1 rounded-full border border-stone-700/60 inline-flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              <span>Memoria de Tu Caminar</span>
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold">
              Mi Recorrido
            </h1>
            <p className="text-sand-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Una línea de tiempo sobria de tu constancia. Sin puntos ni tablas de clasificación artificiales: solo el registro honesto de los capítulos que has recorrido.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-card space-y-6">
            <h2 className="font-serif text-xl font-bold text-stone-900 border-b border-sand-200 pb-3">
              Línea Temporal de Crecimiento
            </h2>

            <div className="space-y-4">
              {memberTimeline.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border flex items-start gap-4 transition-all ${
                    item.status === 'completed'
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : item.status === 'current'
                      ? 'border-amber-400 bg-amber-50/40 shadow-sm'
                      : 'border-sand-200 bg-sand-50/30 opacity-75'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 ${
                    item.status === 'completed'
                      ? 'bg-emerald-600 text-white'
                      : item.status === 'current'
                      ? 'bg-amber-500 text-stone-950 font-bold'
                      : 'bg-sand-200 text-stone-500'
                  }`}>
                    {item.status === 'completed' ? (
                      <Check className="w-4 h-4" />
                    ) : item.status === 'current' ? (
                      '▶'
                    ) : (
                      idx + 1
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-serif font-bold text-base text-stone-900">
                        {item.title}
                      </h3>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        item.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'current'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-sand-100 text-stone-500'
                      }`}>
                        {item.status === 'completed'
                          ? '✓ Completado'
                          : item.status === 'current'
                          ? 'En Curso'
                          : 'Próximo'}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {item.theme}
                    </p>

                    {item.completed_at && (
                      <span className="text-[11px] text-stone-400 block mt-2">
                        Completado el {new Date(item.completed_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: LECCIONES DEL CAMINO (SUBORDINATED FORMACIÓN)                     */}
      {/* ========================================================================= */}
      {activeTab === 'lessons' && (
        <div className="space-y-6">
          <LessonsView initialLessonId={selectedLessonId} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REFLEXIÓN DE FIN DE CICLO (4 PREGUNTAS CONTRACTUALES)               */}
      {/* ========================================================================= */}
      {showReflectionModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-sand-200 space-y-5 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="border-b border-sand-200 pb-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
                Cierre de Capítulo · {currentCommunityCycle?.title}
              </span>
              <h3 className="font-serif text-2xl font-bold text-stone-900 mt-1">
                "Has completado este capítulo."
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Tómate diez minutos para registrar lo vivido antes de iniciar el siguiente ciclo con la comunidad.
              </p>
            </div>

            <form onSubmit={handleSubmitReflection} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  1. ¿Qué has descubierto?
                </label>
                <textarea
                  value={reflection1}
                  onChange={(e) => setReflection1(e.target.value)}
                  rows={2}
                  required
                  placeholder="Revelaciones honestas sobre tus patrones o tu vida interior..."
                  className="w-full p-3 rounded-xl border border-sand-200 text-xs text-stone-900 focus:outline-none focus:border-stone-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  2. ¿Qué ha cambiado?
                </label>
                <textarea
                  value={reflection2}
                  onChange={(e) => setReflection2(e.target.value)}
                  rows={2}
                  required
                  placeholder="Acciones concretas, actitudes o decisiones tomadas..."
                  className="w-full p-3 rounded-xl border border-sand-200 text-xs text-stone-900 focus:outline-none focus:border-stone-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  3. ¿Qué quieres llevar contigo?
                </label>
                <textarea
                  value={reflection3}
                  onChange={(e) => setReflection3(e.target.value)}
                  rows={2}
                  required
                  placeholder="Un principio, un límite o un hábito que no estás dispuesto a soltar..."
                  className="w-full p-3 rounded-xl border border-sand-200 text-xs text-stone-900 focus:outline-none focus:border-stone-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  4. ¿Qué quieres explorar ahora?
                </label>
                <textarea
                  value={reflection4}
                  onChange={(e) => setReflection4(e.target.value)}
                  rows={2}
                  required
                  placeholder="Tu intención para el siguiente capítulo de la comunidad..."
                  className="w-full p-3 rounded-xl border border-sand-200 text-xs text-stone-900 focus:outline-none focus:border-stone-500"
                />
              </div>

              {reflectionSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Reflexión guardada en tu historia personal. Pasando al siguiente capítulo...</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReflectionModal(false)}
                  className="text-xs text-stone-600 hover:text-stone-900 px-4 py-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="travesia-btn-primary text-xs py-2 px-5"
                >
                  Guardar y Avanzar al Próximo Capítulo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
