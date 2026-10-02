import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  ArrowRight, 
  CheckCircle, 
  PenLine, 
  Video, 
  PlayCircle, 
  Film 
} from 'lucide-react';
import { useDataStore } from '../../lib/dataStore';
import { VideoPracticeModal } from '../journal/VideoPracticeModal';
import { RecordingPlayerModal } from '../recordings/RecordingPlayerModal';
import { EventItem, SessionRecording } from '../../types';

export const RightSidebar: React.FC = () => {
  const navigate = useNavigate();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeRecordingForPlayer, setActiveRecordingForPlayer] = useState<SessionRecording | null>(null);
  const { 
    currentUser, 
    events, 
    recordings, 
    nextUpcomingEvent, 
    todayJournalSession, 
    toggleRegisterEvent,
    trackZoomJoinClick
  } = useDataStore();

  const isLive = (status?: string) => status === 'live' || status === 'LIVE';
  const isUpcoming = (status?: string) => 
    status === 'upcoming' || status === 'SCHEDULED' || isLive(status);

  // Active or upcoming live session
  const upcomingSession = nextUpcomingEvent || events.find(e => isUpcoming(e.status));

  // Matched recording for upcoming/latest session
  const upcomingSessionRecording = React.useMemo(() => {
    if (!upcomingSession) return null;
    return recordings.find(r => 
      r.event_id === upcomingSession.id || 
      (upcomingSession.recording_id && r.id === upcomingSession.recording_id) ||
      (upcomingSession.recording_url && (r.storage_path === upcomingSession.recording_url || r.video_url === upcomingSession.recording_url)) ||
      (r.storage_path && r.storage_path.includes(upcomingSession.id))
    );
  }, [upcomingSession, recordings]);

  // Latest recording available from the archive
  const latestRecording = React.useMemo(() => {
    if (recordings.length === 0) return null;
    return recordings[0];
  }, [recordings]);

  const handleJoinZoom = async (event: EventItem) => {
    if (currentUser?.membership_status === 'EXPIRED') {
      navigate('/membership?from=events_zoom_expired');
      return;
    }
    await trackZoomJoinClick(event.id);
    const zoomUrl = event.meeting_url || event.zoom_meeting_url;
    if (zoomUrl) {
      window.open(zoomUrl, '_blank', 'noopener,noreferrer');
    } else {
      navigate('/events');
    }
  };

  return (
    <aside className="w-80 h-full flex flex-col p-4 space-y-4 overflow-y-auto select-none">
      {/* ========================================================================= */}
      {/* BLOQUE 1: TU PRÁCTICA DE HOY                                             */}
      {/* ========================================================================= */}
      <div className={`p-4 rounded-2xl border transition-all ${
        todayJournalSession
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
          : 'bg-white border-sand-200 shadow-card'
      }`}>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
            Tu Práctica de Hoy
          </span>
          {todayJournalSession ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full">
              <CheckCircle className="w-3.5 h-3.5" /> Completada
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100/90 px-2 py-0.5 rounded-full">
              <Clock className="w-3.5 h-3.5" /> Pendiente
            </span>
          )}
        </div>

        {todayJournalSession ? (
          <div className="space-y-2.5">
            <div className="bg-white/90 p-3 rounded-xl border border-emerald-100/80 text-xs">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide block mb-0.5">
                Compromiso del día:
              </span>
              <p className="text-stone-700 italic leading-relaxed">
                "{todayJournalSession.action_commitment || 'Práctica realizada con fidelidad.'}"
              </p>
            </div>
            <button
              onClick={() => navigate('/journal')}
              className="text-xs text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1 pt-0.5"
            >
              <span>Ver reflexión en el diario</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            <p className="text-xs text-stone-600 leading-relaxed">
              Dedica 25-30 minutos al silencio, vaciar el ruido mental y sellar tu compromiso para la jornada.
            </p>
            <button
              onClick={() => navigate('/journal/today')}
              className="travesia-btn-primary w-full text-xs py-2.5 shadow-sm flex items-center justify-center gap-1.5"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Escribir en el Diario</span>
            </button>
            <button
              type="button"
              onClick={() => setIsVideoModalOpen(true)}
              className="w-full py-2 px-3 rounded-xl border border-sand-300 text-stone-700 hover:bg-sand-100 hover:text-stone-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors bg-sand-50/50"
            >
              <Video className="w-3.5 h-3.5 text-amber-700" />
              <span>Práctica completada por video</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* BLOQUE 2: PRÓXIMA SESIÓN O GRABACIÓN RECIENTE                            */}
      {/* ========================================================================= */}
      {upcomingSession ? (
        <div className="travesia-card p-4 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              {isLive(upcomingSession.status) ? (
                <span className="flex items-center gap-1.5 text-rose-600 font-bold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                  </span>
                  En directo ahora
                </span>
              ) : (
                <>
                  <Calendar className="w-3.5 h-3.5 text-amber-700" />
                  <span>Próxima sesión en vivo</span>
                </>
              )}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sand-100 text-stone-600">
              {upcomingSession.duration_minutes || 35} min
            </span>
          </div>

          <div>
            <h4 className="font-serif font-bold text-sm text-stone-900 leading-snug line-clamp-2">
              {upcomingSession.title}
            </h4>
            <p className="text-xs text-amber-800 font-medium mt-1">
              {upcomingSession.time_display}
            </p>
          </div>

          {upcomingSession.host_name && (
            <div className="flex items-center gap-2 pt-0.5 text-xs text-stone-500">
              <img
                src={upcomingSession.host_avatar || '/alberto-calvo.png'}
                alt={upcomingSession.host_name}
                className="w-5 h-5 rounded-full object-cover border border-sand-300"
              />
              <span className="truncate">Guía: {upcomingSession.host_name}</span>
              {upcomingSession.attendees_count ? (
                <>
                  <span className="text-stone-300">·</span>
                  <span>{upcomingSession.attendees_count} inscritos</span>
                </>
              ) : null}
            </div>
          )}

          {/* Action button */}
          {upcomingSessionRecording ? (
            <button
              onClick={() => setActiveRecordingForPlayer(upcomingSessionRecording)}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 transition-all shadow-sm"
            >
              <PlayCircle className="w-4 h-4 text-stone-950" />
              <span>Ver Grabación en Directo</span>
            </button>
          ) : (
            <div className="space-y-1.5 pt-1">
              <button
                onClick={() => handleJoinZoom(upcomingSession)}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                  isLive(upcomingSession.status)
                    ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                    : upcomingSession.user_is_registered
                    ? 'bg-stone-900 hover:bg-stone-800 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>
                  {isLive(upcomingSession.status)
                    ? 'Entrar a Zoom en Vivo'
                    : upcomingSession.user_is_registered
                    ? 'Acceder a la sesión Zoom'
                    : 'Inscribirme al directo'}
                </span>
              </button>
              {!isLive(upcomingSession.status) && (
                <button
                  onClick={() => toggleRegisterEvent(upcomingSession.id)}
                  className="w-full text-center text-[11px] text-stone-500 hover:text-stone-800 font-medium py-1"
                >
                  {upcomingSession.user_is_registered ? 'Cancelar inscripción' : 'Recordarme por email'}
                </button>
              )}
            </div>
          )}

          <div className="pt-2 border-t border-sand-100 flex justify-between items-center">
            <button
              onClick={() => navigate('/events')}
              className="text-stone-500 hover:text-stone-800 font-medium flex items-center gap-1 text-[11px]"
            >
              <span>Ver todas las sesiones y grabaciones</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : latestRecording ? (
        <div className="travesia-card p-4 space-y-3 bg-gradient-to-br from-stone-900 to-stone-950 text-white border-stone-800 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5" />
              Grabación reciente
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-800 text-stone-300">
              {latestRecording.duration || '35 min'}
            </span>
          </div>

          <div>
            <h4 className="font-serif font-bold text-sm text-sand-50 line-clamp-1">
              {latestRecording.title}
            </h4>
            <p className="text-[11px] text-stone-400 line-clamp-2 mt-0.5">
              {latestRecording.description || 'Grabación de la práctica matutina y mentoría en vivo.'}
            </p>
          </div>

          <button
            onClick={() => setActiveRecordingForPlayer(latestRecording)}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 transition-all shadow-sm"
          >
            <PlayCircle className="w-4 h-4 text-stone-950" />
            <span>Reproducir Grabación</span>
          </button>

          <div className="pt-2 border-t border-stone-800 flex justify-between items-center">
            <button
              onClick={() => navigate('/events?tab=archive')}
              className="text-stone-400 hover:text-sand-200 font-medium flex items-center gap-1 text-[11px]"
            >
              <span>Hemeroteca completa ({recordings.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : null}

      {/* Video Practice Modal */}
      <VideoPracticeModal 
        isOpen={isVideoModalOpen} 
        onClose={() => setIsVideoModalOpen(false)} 
      />

      {/* Recording Player Modal */}
      {activeRecordingForPlayer && (
        <RecordingPlayerModal
          isOpen={Boolean(activeRecordingForPlayer)}
          recording={activeRecordingForPlayer}
          onClose={() => setActiveRecordingForPlayer(null)}
        />
      )}
    </aside>
  );
};
