import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../lib/dataStore';
import { PostComposer } from '../components/community/PostComposer';
import { PostCard } from '../components/community/PostCard';
import { 
  Sparkles, 
  PenLine, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Flame, 
  ArrowRight, 
  Video,
  Pin,
  TrendingUp,
  Filter
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentUser, 
    posts, 
    events, 
    nextUpcomingEvent,
    todayJournalSession, 
    toggleRegisterEvent 
  } = useDataStore();

  const [feedFilter, setFeedFilter] = useState<'all' | 'featured' | 'mine'>('all');

  const nextSession = nextUpcomingEvent || events.find(e => e.status === 'upcoming') || events[0];

  const filteredPosts = posts.filter(p => {
    if (feedFilter === 'featured') return p.is_featured || p.is_pinned;
    if (feedFilter === 'mine') return p.author_id === currentUser.id;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. FIRST PRIORITY: TU PRÁCTICA DE HOY */}
      <div className="bg-stone-900 text-sand-50 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-stone-800">
        <div className="relative z-10 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 font-mono">
                1. TU PRÁCTICA DE HOY
              </span>
              <span className="text-xs text-sand-400">
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-amber-400">
              <Flame className="w-3.5 h-3.5" />
              <span>Racha: <strong className="text-white">{currentUser.streak_days} días</strong></span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-sand-50 leading-tight">
                {todayJournalSession 
                  ? 'Has cumplido con tu quietud diaria' 
                  : 'Frena 25 minutos. Silencia el ruido y escucha.'}
              </h2>
              <p className="text-xs text-sand-300 leading-relaxed font-sans">
                {todayJournalSession 
                  ? `Compromiso sellado: "${todayJournalSession.action_commitment}"` 
                  : 'Los 5 Movimientos te esperan: Frenar, Descargar, Nombrar la Realidad, Escuchar y fijar Una Sola Acción.'}
              </p>
            </div>

            <div className="flex-shrink-0">
              {todayJournalSession ? (
                <button
                  onClick={() => navigate('/journal')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Ver mi reflexión de hoy</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate('/journal')}
                  className="w-full sm:w-auto travesia-btn-accent text-xs py-3.5 px-8 font-bold shadow-xl flex items-center justify-center gap-2 text-stone-950"
                >
                  <PenLine className="w-4 h-4" />
                  <span>Empezar práctica ahora →</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. SECOND PRIORITY: PRÓXIMA SESIÓN */}
      {nextSession && (
        <div className="travesia-card p-5 sm:p-6 bg-gradient-to-r from-sand-100/80 via-white to-sand-50/80 border-sand-300 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sand-200/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 shadow-xs">
                PRÓXIMA SESIÓN
              </span>
              <span className="text-xs text-stone-600 font-serif font-medium">
                {new Date(nextSession.date || Date.now()).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-700" />
                <span>{nextSession.time_display}</span>
              </span>
              <span className="text-[10px] font-mono font-semibold text-stone-500 bg-sand-200/80 px-2 py-0.5 rounded-full">
                {nextSession.duration_minutes} min
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900 leading-snug">
                {nextSession.title}
              </h3>
              <p className="text-xs text-stone-600">
                Facilitador: <strong className="text-stone-800">{nextSession.host_name}</strong> · {nextSession.attendees_count} compañeros inscritos
              </p>
              {nextSession.prompt && (
                <p className="text-[11px] text-amber-900 bg-amber-50/80 p-2 rounded-xl border border-amber-200/70 font-serif italic mt-1">
                  Enfoque: "{nextSession.prompt}"
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
              <button
                onClick={() => toggleRegisterEvent(nextSession.id)}
                className={`text-xs py-2 px-3.5 rounded-xl font-semibold transition-all ${
                  nextSession.user_is_registered
                    ? 'bg-sand-200 text-stone-800 hover:bg-sand-300'
                    : 'bg-stone-900 hover:bg-stone-800 text-white shadow-sm'
                }`}
              >
                {nextSession.user_is_registered ? 'Inscrito ✓' : 'Inscribirme'}
              </button>

              <button
                onClick={() => {
                  if (nextSession.meeting_url) {
                    window.open(nextSession.meeting_url, '_blank');
                  } else {
                    navigate('/events');
                  }
                }}
                className="travesia-btn-accent text-xs py-2.5 px-4 font-bold text-stone-950 flex items-center gap-1.5 shadow-sm"
              >
                <Video className="w-3.5 h-3.5 text-stone-950" />
                <span>Entrar a la sesión →</span>
              </button>

              {nextSession.recording_url && (
                <button
                  onClick={() => window.open(nextSession.recording_url, '_blank')}
                  className="travesia-btn-secondary text-xs py-2 px-3 flex items-center gap-1"
                >
                  <span>Ver grabación</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. THIRD PRIORITY: TU CAMINO (4-WEEK JOURNEY SNAPSHOT) */}
      <div className="travesia-card p-5 sm:p-6 bg-white border-sand-200 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sand-200 text-stone-700">
            3. TU CAMINO
          </span>
          <span className="text-xs font-mono font-bold text-amber-700">
            Semana {currentUser.current_week} de 4
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-serif font-bold text-lg text-stone-900">
              {currentUser.current_week === 1 && 'Semana 1: El Presente — Construyendo el hábito del silencio'}
              {currentUser.current_week === 2 && 'Semana 2: La Visión — Discerniendo la vida que estás forjando'}
              {currentUser.current_week === 3 && 'Semana 3: Los Obstáculos — Desmantelando el autoboicot'}
              {currentUser.current_week === 4 && 'Semana 4: El Trabajo — Ejecución serena y Mi Próximo Capítulo'}
            </h4>
            <p className="text-xs text-stone-500">
              Cada semana profundiza en una capa vital de tu examen personal.
            </p>
          </div>

          <button
            onClick={() => navigate('/journey')}
            className="travesia-btn-secondary text-xs py-2 px-4 flex items-center gap-1.5 flex-shrink-0"
          >
            <span>Ver lecciones de la semana →</span>
          </button>
        </div>

        {/* 4-step progress line */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          {[
            { w: 1, label: 'El Presente' },
            { w: 2, label: 'La Visión' },
            { w: 3, label: 'Los Obstáculos' },
            { w: 4, label: 'El Trabajo' }
          ].map(item => (
            <div key={item.w} className="space-y-1">
              <div
                className={`h-2 rounded-full transition-all ${
                  item.w < currentUser.current_week
                    ? 'bg-emerald-500'
                    : item.w === currentUser.current_week
                    ? 'bg-amber-500'
                    : 'bg-sand-200'
                }`}
              />
              <span className="text-[10px] text-stone-500 block truncate font-medium">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. FOURTH PRIORITY: COMUNIDAD */}
      <PostComposer />

      {/* 4. FEED HEADER & FILTERS */}
      <div className="flex items-center justify-between border-b border-sand-200 pb-3 pt-2">
        <h3 className="font-serif font-bold text-lg text-stone-900">
          Publicaciones Destacadas
        </h3>

        <div className="flex items-center gap-1 bg-sand-100 p-1 rounded-xl text-xs text-stone-600">
          <button
            onClick={() => setFeedFilter('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              feedFilter === 'all' ? 'bg-white text-stone-900 font-bold shadow-subtle' : 'hover:text-stone-900'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFeedFilter('featured')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              feedFilter === 'featured' ? 'bg-white text-stone-900 font-bold shadow-subtle' : 'hover:text-stone-900'
            }`}
          >
            Fijadas
          </button>
          <button
            onClick={() => setFeedFilter('mine')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              feedFilter === 'mine' ? 'bg-white text-stone-900 font-bold shadow-subtle' : 'hover:text-stone-900'
            }`}
          >
            Mis Aportes
          </button>
        </div>
      </div>

      {/* 5. POSTS FEED */}
      <div className="space-y-4">
        {filteredPosts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};
