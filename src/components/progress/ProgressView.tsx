import React from 'react';
import { useDataStore } from '../../lib/dataStore';
import { 
  Flame, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  Calendar, 
  BookOpen, 
  Video, 
  TrendingUp, 
  Award,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProgressView: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, lessons, events, getPrivateJournalHistory } = useDataStore();
  const sessions = getPrivateJournalHistory();

  const completedLessons = lessons.filter(l => l.status === 'completed').length;
  const registeredEvents = events.filter(e => e.user_is_registered).length;

  // Streak percentage calculation based on standard 30-day goal
  const streakGoal = 30;
  const streakPercent = Math.min(100, Math.round((currentUser.streak_days / streakGoal) * 100));

  // 4-Week Journey percentage
  const journeyPercent = Math.round((currentUser.current_week / 4) * 100);

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 space-y-6 animate-fade-in">
      {/* Hero Header */}
      <div className="bg-stone-900 text-sand-50 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400 bg-stone-800/80 px-3 py-1 rounded-full border border-stone-700/60 inline-block mb-3">
            Consistencia y Crecimiento
          </span>
          <h1 className="font-serif text-3xl font-bold">
            Mi Progreso en la Travesía
          </h1>
          <p className="text-sand-300 text-xs sm:text-sm mt-1 max-w-lg leading-relaxed">
            "No te elevas al nivel de tus metas; caes al nivel de tus sistemas." Observa la evidencia de tu disciplina diaria.
          </p>
        </div>

        {/* Circular Progress Ring */}
        <div className="flex items-center gap-4 bg-stone-800/80 p-4 rounded-2xl border border-stone-700/60 flex-shrink-0">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-stone-700"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-amber-400"
                strokeDasharray={`${streakPercent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-mono font-bold text-sm text-white">
              {currentUser.streak_days}d
            </span>
          </div>

          <div>
            <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Racha Activa</p>
            <p className="text-xs text-sand-300 font-medium">{streakPercent}% hacia la meta de 30d</p>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="travesia-card p-4 space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Racha Actual</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <p className="font-serif font-bold text-2xl text-stone-900">
            {currentUser.streak_days} <span className="text-xs text-stone-500 font-normal">días</span>
          </p>
          <p className="text-[11px] text-emerald-600 font-medium">Ininterrumpida</p>
        </div>

        {/* Metric 2 */}
        <div className="travesia-card p-4 space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Sesiones de Diario</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="font-serif font-bold text-2xl text-stone-900">
            {currentUser.completed_sessions_count}
          </p>
          <p className="text-[11px] text-stone-500">Prácticas completas</p>
        </div>

        {/* Metric 3 */}
        <div className="travesia-card p-4 space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Tiempo en Quietud</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <p className="font-serif font-bold text-2xl text-stone-900">
            {Math.floor(currentUser.reflection_minutes / 60)}h {currentUser.reflection_minutes % 60}m
          </p>
          <p className="text-[11px] text-stone-500">Silencio y discernimiento</p>
        </div>

        {/* Metric 4 */}
        <div className="travesia-card p-4 space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Lecciones</span>
            <BookOpen className="w-4 h-4 text-purple-500" />
          </div>
          <p className="font-serif font-bold text-2xl text-stone-900">
            {completedLessons} <span className="text-xs text-stone-500 font-normal">de {lessons.length}</span>
          </p>
          <p className="text-[11px] text-stone-500">Formación avanzada</p>
        </div>
      </div>

      {/* Visual Weekly Progression & Current Movement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Completion Bar */}
        <div className="travesia-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-serif font-bold text-base text-stone-900">
              El Camino de 4 Semanas
            </span>
            <span className="text-xs font-bold text-bronze-700 bg-sand-100 px-2 py-0.5 rounded-full">
              Semana {currentUser.current_week} de 4
            </span>
          </div>

          <div className="space-y-3">
            {[
              { w: 1, name: 'Semana 1: El Presente', status: currentUser.current_week > 1 ? 'completed' : 'active' },
              { w: 2, name: 'Semana 2: La Visión', status: currentUser.current_week > 2 ? 'completed' : currentUser.current_week === 2 ? 'active' : 'pending' },
              { w: 3, name: 'Semana 3: Los Obstáculos', status: currentUser.current_week > 3 ? 'completed' : currentUser.current_week === 3 ? 'active' : 'pending' },
              { w: 4, name: 'Semana 4: El Trabajo', status: currentUser.current_week >= 4 ? 'active' : 'pending' },
            ].map(item => (
              <div key={item.w} className="flex items-center justify-between p-3 rounded-xl bg-sand-50 border border-sand-200 text-xs">
                <span className="font-medium text-stone-800">{item.name}</span>
                {item.status === 'completed' && (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Cumplida
                  </span>
                )}
                {item.status === 'active' && (
                  <span className="text-bronze-700 font-bold flex items-center gap-1">
                    ● En curso
                  </span>
                )}
                {item.status === 'pending' && (
                  <span className="text-stone-400">Pendiente</span>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/journey')}
            className="text-xs text-bronze-700 hover:text-bronze-900 font-semibold flex items-center gap-1"
          >
            <span>Ver detalles del currículo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 5 Movements Mastery Status */}
        <div className="travesia-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-serif font-bold text-base text-stone-900">
              Anatomía de tu Práctica Diaria
            </span>
            <span className="text-xs text-stone-500 font-medium">5 Movimientos</span>
          </div>

          <div className="space-y-2.5 text-xs text-stone-700">
            <div className="p-2.5 rounded-xl bg-sand-50 border border-sand-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-900">1. Frenar (Slow Down)</span>
                <p className="text-[11px] text-stone-500">Respiración 4s/8s y 1m de silencio santo</p>
              </div>
              <span className="text-emerald-600 font-bold">100% hábito</span>
            </div>

            <div className="p-2.5 rounded-xl bg-sand-50 border border-sand-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-900">2. Limpiar el Ruido</span>
                <p className="text-[11px] text-stone-500">Vaciado mental + 10m de escritura profunda</p>
              </div>
              <span className="text-emerald-600 font-bold">100% hábito</span>
            </div>

            <div className="p-2.5 rounded-xl bg-sand-50 border border-sand-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-900">3. Sentir lo que sientes</span>
                <p className="text-[11px] text-stone-500">Nombramiento de las 8 emociones primarias</p>
              </div>
              <span className="text-emerald-600 font-bold">100% hábito</span>
            </div>

            <div className="p-2.5 rounded-xl bg-sand-50 border border-sand-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-900">4. Escuchar</span>
                <p className="text-[11px] text-stone-500">90s de quietud y discernimiento ante Dios</p>
              </div>
              <span className="text-emerald-600 font-bold">100% hábito</span>
            </div>

            <div className="p-2.5 rounded-xl bg-sand-50 border border-sand-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-900">5. Actuar</span>
                <p className="text-[11px] text-stone-500">1 acción concreta o algo que soltar</p>
              </div>
              <span className="text-emerald-600 font-bold">100% hábito</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
