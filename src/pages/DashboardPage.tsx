import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../lib/dataStore';
import { PostComposer } from '../components/community/PostComposer';
import { PostCard } from '../components/community/PostCard';
import { RecordingPlayerModal } from '../components/recordings/RecordingPlayerModal';
import { zoomService } from '../services/zoomService';
import { SessionRecording, EventItem } from '../types';
import { 
  Sparkles, 
  PenLine, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Flame, 
  ArrowRight, 
  Video,
  PlayCircle,
  Pin,
  TrendingUp,
  Filter,
  Users,
  AlertCircle,
  Film,
  Radio
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentUser, 
    posts, 
    events, 
    recordings,
    nextUpcomingEvent,
    liveEvent,
    todayJournalSession, 
    toggleRegisterEvent,
    trackZoomJoinClick,
    currentCommunityCycle,
    currentGlobalCommunityWeek,
    personalJourneyProgress
  } = useDataStore();

  const [feedFilter, setFeedFilter] = useState<'all' | 'featured' | 'mine'>('all');
  const [zoomError, setZoomError] = useState<string | null>(null);
  const [activePlaybackRecording, setActivePlaybackRecording] = useState<SessionRecording | null>(null);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState<boolean>(false);

  const nextSession = nextUpcomingEvent || events.find(e => e.status === 'upcoming') || events[0];

  const nextSessionRecording = React.useMemo(() => {
    if (!nextSession) return null;
    const found = recordings.find(
      r => r.event_id === nextSession.id || (nextSession.recording_id && r.id === nextSession.recording_id)
    );
    if (found) return found;
    if (nextSession.recording_url) {
      return {
        id: nextSession.recording_id || `rec-${nextSession.id}`,
        event_id: nextSession.id,
        title: nextSession.title,
        description: nextSession.description || '',
        date: nextSession.date,
        duration: `${nextSession.duration_minutes || 35} min`,
        duration_seconds: (nextSession.duration_minutes || 35) * 60,
        category: nextSession.theme || 'El Presente',
        recording_strategy: 'HOSTED',
        storage_path: nextSession.recording_url,
        thumbnail_url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop&q=80',
        status: 'AVAILABLE',
        uploaded_by: 'admin',
        uploaded_at: new Date().toISOString(),
        views_count: 0,
        is_member_only: true,
      } as SessionRecording;
    }
    return null;
  }, [nextSession, recordings]);

  const handleEnterZoom = async (eventItem: EventItem) => {
    setZoomError(null);

    // 0. Guard: Expired users cannot enter Zoom
    if (currentUser.membership_status === 'EXPIRED') {
      navigate('/membership?from=zoom_expired_attempt');
      return;
    }

    const zoomUrl = eventItem.meeting_url || eventItem.zoom_meeting_url;
    
    // 1. Validate that the URL is a valid Zoom URL
    if (!zoomService.isValidZoomUrl(zoomUrl)) {
      setZoomError('El enlace configurado no es una URL válida de Zoom. Contacta con el facilitador.');
      return;
    }

    // 2. Track zoom_join_clicked (Do NOT call this attendance)
    await trackZoomJoinClick(eventItem.id);

    // 3. Open Zoom in a new browser tab
    window.open(zoomUrl!, '_blank');
  };


  const filteredPosts = posts.filter(p => {
    if (feedFilter === 'featured') return p.is_featured || p.is_pinned;
    if (feedFilter === 'mine') return p.author_id === currentUser.id;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* LIVE EVENT CALLOUT (IF BROADCASTING) */}
      {liveEvent && (
        <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950 text-sand-50 rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-rose-500/70 relative overflow-hidden animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white font-mono text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-white" />
                  <Radio className="w-3.5 h-3.5" />
                  <span>EN DIRECTO</span>
                </span>
                <span className="text-xs text-amber-300 font-mono">Zoom Room Abierta</span>
              </div>
              <h2 className="font-serif font-bold text-2xl text-sand-50">
                {liveEvent.title}
              </h2>
              <p className="text-xs text-sand-300 leading-relaxed">
                Facilitado por <strong className="text-white">{liveEvent.host_name}</strong>. Únete ahora para la práctica matutina y discernimiento guiado en directo.
              </p>
            </div>

            <div className="flex-shrink-0">
              {currentUser.membership_status === 'EXPIRED' ? (
                <div className="flex flex-col sm:items-end gap-1.5">
                  <span className="text-xs text-amber-300 font-medium">Tu prueba ha terminado.</span>
                  <button
                    onClick={() => navigate('/membership?from=live_session_expired')}
                    className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs py-3 px-5 rounded-2xl flex items-center justify-center gap-1.5 shadow-xl transition-all"
                  >
                    <span>CONTINUAR EN TRAVESÍA</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleEnterZoom(liveEvent)}
                  className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition-all"
                >
                  <Video className="w-4 h-4 fill-stone-950" />
                  <span>ENTRAR EN ZOOM</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 1. FIRST PRIORITY: TU PRÁCTICA DE HOY / ESTADO EXPIRED */}
      <div className="bg-stone-900 text-sand-50 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-stone-800">
        <div className="relative z-10 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 font-mono">
                {currentUser.membership_status === 'EXPIRED' ? 'MEMBRESÍA' : '1. TU PRÁCTICA DE HOY'}
              </span>
              <span className="text-xs text-sand-400">
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-amber-400">
              <Flame className="w-3.5 h-3.5" />
              <span>Racha histórica: <strong className="text-white">{currentUser.streak_days} días</strong></span>
            </div>
          </div>

          {currentUser.membership_status === 'EXPIRED' ? (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-sand-50 leading-tight">
                  Tu prueba de 7 días ha terminado.
                </h2>
                <p className="text-xs text-sand-300 leading-relaxed font-sans">
                  Tu diario sigue aquí. Puedes retomarlo cuando quieras.
                </p>
                <p className="text-[11px] text-sand-400">
                  Activa tu membresía para recuperar el acceso a las sesiones en directo, las grabaciones, los nuevos ciclos y la comunidad.
                </p>
              </div>

              <div className="flex-shrink-0 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => navigate('/membership?from=dashboard_expired')}
                  className="w-full sm:w-auto travesia-btn-accent text-xs py-3.5 px-6 font-bold shadow-xl flex items-center justify-center gap-2 text-stone-950"
                >
                  <span>CONTINUAR EN TRAVESÍA</span>
                </button>
                <button
                  onClick={() => navigate('/journal')}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl text-xs font-semibold text-sand-300 hover:text-white hover:bg-stone-800 transition-colors"
                >
                  Ver mis diarios guardados
                </button>
              </div>
            </div>
          ) : (
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
          )}
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
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100/90 px-2.5 py-0.5 rounded-md font-mono border border-amber-200">
                  Tema: {nextSession.theme || nextSession.weekly_theme || 'El Presente'}
                </span>
              </div>
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
              {zoomError && (
                <div className="text-[11px] text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200 mt-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-rose-600" />
                  <span>{zoomError}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
              <button
                onClick={() => toggleRegisterEvent(nextSession.id)}
                className={`text-xs py-2.5 px-3.5 rounded-xl font-semibold transition-all ${
                  nextSession.user_is_registered
                    ? 'bg-sand-200 text-stone-800 hover:bg-sand-300'
                    : 'bg-stone-900 hover:bg-stone-800 text-white shadow-sm'
                }`}
              >
                {nextSession.user_is_registered ? 'Inscrito ✓' : 'Inscribirme'}
              </button>

              <button
                onClick={() => handleEnterZoom(nextSession)}
                className="travesia-btn-accent text-xs py-2.5 px-5 font-bold text-stone-950 flex items-center gap-2 shadow-sm hover:brightness-105"
              >
                <Video className="w-4 h-4 text-stone-950" />
                <span>ENTRAR EN ZOOM</span>
              </button>

              {nextSessionRecording && (
                <button
                  onClick={() => {
                    setActivePlaybackRecording(nextSessionRecording);
                    setIsPlayerModalOpen(true);
                  }}
                  className="travesia-btn-secondary text-xs py-2.5 px-3.5 flex items-center gap-1.5 font-semibold text-stone-800 hover:bg-sand-200"
                >
                  <PlayCircle className="w-4 h-4 text-amber-600" />
                  <span>VER GRABACIÓN</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REPLAY & RECORDINGS LIBRARY SHORTCUT */}
      <div className="travesia-card p-4 sm:p-5 bg-sand-100/70 border border-sand-300/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-sm text-stone-900">
              Hemeroteca de Grabaciones en Directo
            </h4>
            <p className="text-xs text-stone-500">
              ¿Te perdiste alguna sesión matutina o mentoría? Mira las grabaciones organizadas por temática.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/archive')}
          className="travesia-btn-secondary text-xs py-2 px-4 whitespace-nowrap flex items-center gap-1.5 self-start sm:self-center font-semibold text-stone-800 hover:bg-sand-200"
        >
          <span>Ver grabaciones ({recordings.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>


      {/* 3. THIRD PRIORITY: TU RECORRIDO vs TU PRÓXIMO CAPÍTULO */}
      {!personalJourneyProgress.isFoundationCompleted ? (
        <div className="travesia-card p-5 sm:p-6 bg-white border-sand-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-sand-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sand-200 text-stone-800">
                3. TU RECORRIDO · PRIMER RECORRIDO
              </span>
              <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Semana {personalJourneyProgress.personalWeek} de 4
              </span>
            </div>
            <span className="text-[11px] text-stone-400 font-mono">Día {personalJourneyProgress.daysSinceStart}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-lg text-stone-900">
                {personalJourneyProgress.personalWeek === 1 && 'Semana 1: El Presente — Construyendo el hábito del silencio'}
                {personalJourneyProgress.personalWeek === 2 && 'Semana 2: La Visión — Discerniendo la vida que estás forjando'}
                {personalJourneyProgress.personalWeek === 3 && 'Semana 3: Los Obstáculos — Desmantelando el autoboicot'}
                {personalJourneyProgress.personalWeek === 4 && 'Semana 4: El Trabajo — Ejecución serena y preparación al siguiente capítulo'}
              </h4>
              <p className="text-xs text-stone-500">
                Tu primer recorrido personal dura 4 semanas para aprender a hacer el trabajo con fidelidad.
              </p>
            </div>

            <button
              onClick={() => navigate('/journey')}
              className="travesia-btn-secondary text-xs py-2 px-4 flex items-center gap-1.5 flex-shrink-0"
            >
              <span>Ver mi módulo formativo →</span>
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
                    item.w < personalJourneyProgress.personalWeek
                      ? 'bg-emerald-500'
                      : item.w === personalJourneyProgress.personalWeek
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

          {/* Simultaneous Community Cycle Banner (Inclusivity & No-blocking) */}
          <div className="p-3.5 rounded-2xl bg-sand-50/80 border border-sand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-stone-700">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <div>
                <span className="font-semibold text-stone-900">En la comunidad: </span>
                <span className="text-stone-600">Ciclo {currentCommunityCycle.title} — Semana {currentGlobalCommunityWeek}</span>
              </div>
            </div>
            <p className="text-[11px] text-stone-500 italic">
              Tu recorrido comienza hoy. Mientras tanto, puedes participar en todo lo que está viviendo la comunidad.
            </p>
          </div>
        </div>
      ) : (
        /* Continuing Member View: TU PRÓXIMO CAPÍTULO */
        <div className="travesia-card p-5 sm:p-6 bg-gradient-to-r from-stone-900 via-stone-900 to-stone-950 text-white border-stone-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950">
                3. TU PRÓXIMO CAPÍTULO · TRAVESÍA CONTINUA
              </span>
              <span className="text-xs font-mono font-bold text-amber-300 bg-stone-800 px-2.5 py-0.5 rounded-full border border-stone-700">
                Semana {currentGlobalCommunityWeek} de 4
              </span>
            </div>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Primer Recorrido Completado
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <h4 className="font-serif font-bold text-xl text-sand-50">
                Ciclo: {currentCommunityCycle.title} — {currentCommunityCycle.theme}
              </h4>
              <p className="text-xs text-sand-300 leading-relaxed">
                {currentCommunityCycle.description}
              </p>
            </div>

            <button
              onClick={() => navigate('/journey')}
              className="travesia-btn-accent text-xs py-3 px-5 font-bold shadow-lg flex items-center gap-1.5 flex-shrink-0 text-stone-950"
            >
              <span>Explorar la práctica de hoy →</span>
            </button>
          </div>

          {/* 4 weeks of ongoing cycle */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-stone-800">
            {currentCommunityCycle.weeks.map(item => (
              <div key={item.week_number} className="space-y-1">
                <div
                  className={`h-2 rounded-full transition-all ${
                    item.week_number < currentGlobalCommunityWeek
                      ? 'bg-emerald-400'
                      : item.week_number === currentGlobalCommunityWeek
                      ? 'bg-amber-400'
                      : 'bg-stone-800'
                  }`}
                />
                <span className="text-[10px] text-sand-400 block truncate font-medium">
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="travesia-card p-8 text-center text-stone-500 bg-sand-50/50 border-dashed border-sand-300">
            <p className="font-serif text-stone-800 text-sm font-semibold mb-1">Aún no hay publicaciones en el muro</p>
            <p className="text-xs text-stone-500">Sé el primero en compartir una reflexión o discernimiento de tu práctica de hoy arriba.</p>
          </div>
        )}
      </div>

      {/* Recording Player Modal */}
      <RecordingPlayerModal
        recording={activePlaybackRecording}
        isOpen={isPlayerModalOpen}
        onClose={() => {
          setIsPlayerModalOpen(false);
          setActivePlaybackRecording(null);
        }}
      />
    </div>
  );
};

