import React, { useState } from 'react';
import { useDataStore } from '../../lib/dataStore';
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
  Award
} from 'lucide-react';

export const FourWeekJourneyView: React.FC = () => {
  const { currentUser, updateCurrentUserProfile } = useDataStore();
  const [selectedWeek, setSelectedWeek] = useState<number>(currentUser.current_week || 2);
  const [nextChapterText, setNextChapterText] = useState<string>(() => {
    try {
      return localStorage.getItem(`travesia_next_chapter_${currentUser.id}`) || '';
    } catch {
      return '';
    }
  });
  const [savedChapter, setSavedChapter] = useState(false);

  const WEEKS = [
    {
      number: 1,
      title: 'EL PRESENTE',
      tagline: 'Construyendo el cimiento de la práctica diaria',
      icon: Compass,
      focus: 'Aprender a parar, bajar el ritmo y habitar el ahora ante Dios.',
      topics: [
        'Slowing Down: Salir del modo reactivo del mundo exterior',
        'Clearing Mental Noise: Trasladar el desorden mental al papel blanco',
        'Honest Journaling: Escribir sin intentar quedar bien contigo mismo',
        'Emotional Awareness: Nombrar el dolor, la soledad y la ira sin anestesiarte',
        'Silence: Entrenar el músculo de estar en quietud sin pantallas',
        'Listening: Reconocer la voz y el discernimiento de Dios',
        'Action: Sellar cada amanecer con un paso tangible'
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

  const currentWeekData = WEEKS[selectedWeek - 1];

  const handleSaveNextChapter = () => {
    try {
      localStorage.setItem(`travesia_next_chapter_${currentUser.id}`, nextChapterText);
    } catch {}
    setSavedChapter(true);
    setTimeout(() => setSavedChapter(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div className="bg-stone-900 text-sand-50 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400 bg-stone-800/80 px-3 py-1 rounded-full border border-stone-700/60 inline-flex items-center gap-1.5 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Itinerario Formativo Principal</span>
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold">
            El Camino de 4 Semanas
          </h1>
          <p className="text-sand-300 text-xs sm:text-sm mt-2 max-w-xl leading-relaxed">
            Un ciclo recurrente de 28 días diseñado para forjar consistencia, clarificar visión, derribar obstáculos y ejecutar el trabajo necesario.
          </p>

          <div className="flex items-center gap-2 mt-4 text-xs text-sand-400">
            <span>Tu ubicación actual:</span>
            <span className="font-bold text-amber-400 bg-stone-800 px-2.5 py-1 rounded-lg border border-stone-700">
              Semana {currentUser.current_week}: {WEEKS[currentUser.current_week - 1].title}
            </span>
          </div>
        </div>
      </div>

      {/* Week Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {WEEKS.map(w => {
          const isSelected = selectedWeek === w.number;
          const isCurrent = currentUser.current_week === w.number;
          const Icon = w.icon;

          return (
            <button
              key={w.number}
              onClick={() => setSelectedWeek(w.number)}
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
                <span className="inline-block mt-2 text-[10px] font-semibold text-emerald-500">
                  ● En curso
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
            <span>Módulo de la Semana {currentWeekData.number}</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            {currentWeekData.title}: {currentWeekData.tagline}
          </h2>
          <p className="text-sm text-stone-600 mt-1 leading-relaxed">
            {currentWeekData.focus}
          </p>
        </div>

        {/* Topics List */}
        <div>
          <h3 className="font-serif font-bold text-base text-stone-900 mb-3">
            Ejes de Reflexión y Práctica
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {currentWeekData.topics.map((topic, idx) => (
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
            {currentWeekData.exercises.map((ex, idx) => (
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

        {/* Set as current week button */}
        <div className="pt-2 flex justify-end">
          {currentUser.current_week !== currentWeekData.number ? (
            <button
              onClick={() => updateCurrentUserProfile({ current_week: currentWeekData.number })}
              className="travesia-btn-secondary text-xs py-2 px-4"
            >
              Fijar Semana {currentWeekData.number} como mi foco actual
            </button>
          ) : (
            <span className="text-xs text-emerald-700 font-medium flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <CheckCircle className="w-4 h-4" /> Esta es tu semana activa
            </span>
          )}
        </div>
      </div>

      {/* FINAL DEL CICLO: MI PRÓXIMO CAPÍTULO */}
      <div className="travesia-card p-6 sm:p-8 bg-gradient-to-br from-sand-100/70 via-white to-sand-50 space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-bronze-600" />
          <h3 className="font-serif font-bold text-xl text-stone-900">
            Mi Próximo Capítulo
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Al culminar las 4 semanas, redacta aquí tu síntesis de madurez: ¿Qué ha cambiado en ti? ¿Qué convicciones te llevas? ¿Qué pacto renuevas ante Dios para el siguiente ciclo?
        </p>

        <textarea
          value={nextChapterText}
          onChange={(e) => setNextChapterText(e.target.value)}
          placeholder="Escribe tu resumen personal del ciclo de 4 semanas..."
          rows={4}
          className="w-full p-4 rounded-2xl bg-white border border-sand-200 focus:border-stone-400 text-stone-900 text-xs sm:text-sm leading-relaxed resize-none focus:outline-none"
        />

        <div className="flex items-center justify-between pt-1">
          {savedChapter ? (
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Resumen guardado en tu diario personal
            </span>
          ) : (
            <span className="text-xs text-stone-400">Actualizable al final de cada ciclo</span>
          )}

          <button
            onClick={handleSaveNextChapter}
            disabled={!nextChapterText.trim()}
            className="travesia-btn-primary text-xs py-2 px-5"
          >
            Guardar Mi Próximo Capítulo
          </button>
        </div>
      </div>
    </div>
  );
};
