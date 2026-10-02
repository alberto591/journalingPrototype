import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../../lib/dataStore';
import { eventsService } from '../../services/eventsService';
import { EventItem, SessionRecording } from '../../types';
import { RecordingPlayerModal } from '../recordings/RecordingPlayerModal';
import { 
  Calendar, 
  Clock, 
  Video, 
  CheckCircle, 
  Users, 
  ExternalLink,
  PlayCircle,
  AlertCircle,
  Radio,
  ArrowRight,
  Film,
  Square
} from 'lucide-react';

export const EventsView: React.FC = () => {
  const navigate = useNavigate();
  const { 
    events, 
    recordings, 
    toggleRegisterEvent, 
    currentUser, 
    startLiveSession, 
    endLiveSession,
    trackZoomJoinClick 
  } = useDataStore();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [activePlaybackRecording, setActivePlaybackRecording] = useState<SessionRecording | null>(null);

  const isLive = (status?: string) => status === 'live' || status === 'LIVE';
  const isUpcoming = (status?: string) => 
    status === 'upcoming' || status === 'SCHEDULED' || isLive(status);
  const isPast = (status?: string) => 
    status === 'finished' || status === 'COMPLETED' || status === 'REPLAY_AVAILABLE';

  const hasRecording = (e: EventItem) => Boolean(
    e.recording_url || recordings.some(r => r.event_id === e.id || r.id === e.recording_id)
  );
  const upcomingEvents = events.filter(e => isUpcoming(e.status) && !hasRecording(e));
  const pastEvents = events.filter(e => isPast(e.status) || hasRecording(e));
  const displayedEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

  const currentLiveEvent = events.find(e => isLive(e.status));

  const handleAddToCalendar = (event: EventItem) => {
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.description);
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
    window.open(gcalUrl, '_blank', 'noopener,noreferrer');
  };

  const handleEnterZoom = async (event: EventItem) => {
    setInfoMessage(null);

    // Guard: Expired users cannot enter Zoom
    if (currentUser?.membership_status === 'EXPIRED') {
      navigate('/membership?from=events_zoom_expired');
      return;
    }

    // Track join click event in Supabase
    await trackZoomJoinClick(event.id);

    const zoomUrl = event.meeting_url || event.zoom_meeting_url;
    if (zoomUrl) {
      window.open(zoomUrl, '_blank', 'noopener,noreferrer');
    } else {
      setInfoMessage(`El enlace de Zoom para "${event.title}" estará disponible unos minutos antes del inicio.`);
      setTimeout(() => setInfoMessage(null), 5000);
    }
  };

  const handleStartLive = async (event: EventItem) => {
    const zoomUrl = event.meeting_url || event.zoom_meeting_url;
    if (!zoomUrl) {
      const inputUrl = window.prompt('Introduce la URL de la sala de Zoom para los miembros:', 'https://zoom.us/j/');
      if (!inputUrl) return;
      await startLiveSession(event.id, inputUrl);
    } else {
      await startLiveSession(event.id);
    }
    setInfoMessage(`Sesión marcada como en directo. Notificación de Zoom activa para los miembros.`);
    setTimeout(() => setInfoMessage(null), 6000);
  };

  const handleEndLive = async (event: EventItem) => {
    if (window.confirm(`¿Deseas marcar la sesión "${event.title}" como finalizada en Travesía?\n\nRecuerda finalizar la reunión en la aplicación de Zoom.`)) {
      await endLiveSession(event.id);
      setInfoMessage(`Sesión marcada como finalizada en Travesía. Ya puedes subir la grabación a la hemeroteca.`);
      setTimeout(() => setInfoMessage(null), 6000);
    }
  };

  const handleOpenRecording = (event: EventItem) => {
    // 1. Look for matching recording in recordings list
    const found = recordings.find(r => r.event_id === event.id || r.id === event.recording_id);
    if (found) {
      setActivePlaybackRecording(found);
      return;
    }

    // 2. If event has recording_url directly
    if (event.recording_url) {
      const syntheticRec: SessionRecording = {
        id: event.recording_id || `rec-${event.id}`,
        event_id: event.id,
        title: event.title,
        description: event.description,
        date: event.date ? event.date.split('T')[0] : '2026-09-28',
        duration: `${event.duration_minutes || 35} min`,
        duration_seconds: (event.duration_minutes || 35) * 60,
        category: (event.theme || 'El Presente') as any,
        storage_path: event.recording_storage_path || event.recording_url,
        video_url: event.recording_url,
        status: 'AVAILABLE',
        views_count: event.attendees_count || 24,
        is_member_only: true,
      };
      setActivePlaybackRecording(syntheticRec);
      return;
    }

    // Fallback: navigate to archive
    navigate('/archive');
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 space-y-6 animate-fade-in">
      {/* Notification Toast */}
      {infoMessage && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{infoMessage}</span>
          </div>
          <button 
            onClick={() => setInfoMessage(null)}
            className="text-amber-700 font-bold hover:text-amber-950 text-xs"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-stone-900 text-sand-50 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400 bg-stone-800/80 px-3 py-1 rounded-full border border-stone-700/60 inline-block">
              Sesiones Guiadas en Directo (Zoom)
            </span>
            {currentLiveEvent && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white font-mono text-xs font-bold uppercase tracking-wider animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span>En directo ahora</span>
              </span>
            )}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            Eventos y Práctica en Vivo
          </h1>
          <p className="text-sand-300 text-xs sm:text-sm mt-1 max-w-lg leading-relaxed">
            Escribir en soledad es transformador, pero escribir juntos en directo multiplica la disciplina y disuelve el aislamiento.
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-2 flex-shrink-0">
          {currentLiveEvent ? (
            <button
              onClick={() => handleEnterZoom(currentLiveEvent)}
              className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs py-3 px-6 rounded-2xl flex items-center gap-2 shadow-xl animate-pulse"
            >
              <Video className="w-4 h-4 fill-stone-950" />
              <span>ENTRAR EN ZOOM</span>
            </button>
          ) : upcomingEvents.length > 0 ? (
            <button
              onClick={() => handleEnterZoom(upcomingEvents[0])}
              className="travesia-btn-accent text-xs py-2.5 px-5 font-semibold flex items-center gap-2 shadow-lg"
            >
              <Video className="w-4 h-4" />
              <span>Entrar en Zoom</span>
            </button>
          ) : null}

          {/* Quick link to recordings library */}
          <button
            onClick={() => navigate('/archive')}
            className="text-xs text-sand-300 hover:text-white flex items-center gap-1.5 pt-1 transition-colors"
          >
            <Film className="w-3.5 h-3.5 text-amber-400" />
            <span>Ver grabaciones anteriores ({recordings.length})</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-sand-200 pb-2 gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'upcoming'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-sand-100'
            }`}
          >
            Próximas Sesiones ({upcomingEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'past'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-sand-100'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-amber-600" />
            <span>Sesiones Pasadas y Replays ({pastEvents.length})</span>
          </button>
        </div>

        <button
          onClick={() => navigate('/archive')}
          className="text-xs font-semibold text-amber-900 hover:text-amber-950 hidden sm:flex items-center gap-1"
        >
          <span>Ir a la Hemeroteca de Grabaciones</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Info Callout for Replays */}
      {activeTab === 'past' && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Film className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <p className="text-xs leading-relaxed">
              <strong>Hemeroteca de Grabaciones:</strong> Todas las sesiones guiadas matutinas quedan guardadas en video para que practiques a tu propio ritmo.
            </p>
          </div>
          <button
            onClick={() => navigate('/archive')}
            className="travesia-btn-primary text-xs py-1.5 px-3.5 whitespace-nowrap flex items-center gap-1 flex-shrink-0"
          >
            <span>Ver todo el Archivo</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-4">
        {displayedEvents.length === 0 ? (
          <div className="travesia-card p-10 text-center text-stone-500 bg-sand-50/50 border-dashed border-sand-300">
            <p className="font-serif font-bold text-base text-stone-800">
              {activeTab === 'upcoming' ? 'No hay sesiones programadas por el momento.' : 'No hay grabaciones en esta lista.'}
            </p>
            <p className="text-xs text-stone-500 mt-1">
              {activeTab === 'upcoming' 
                ? 'Las próximas fechas se publican aquí con su sala de Zoom.' 
                : 'Visita la hemeroteca para ver todas las grabaciones históricas.'}
            </p>
          </div>
        ) : (
          displayedEvents.map(event => {
            const eventIsLive = isLive(event.status);
            const hasRecording = Boolean(
              event.recording_url || 
              recordings.some(r => r.event_id === event.id || r.id === event.recording_id)
            );

            return (
              <div
                key={event.id}
                className={`travesia-card p-5 sm:p-6 transition-all duration-200 space-y-4 ${
                  eventIsLive 
                    ? 'border-rose-400 ring-2 ring-rose-500/20 bg-gradient-to-r from-rose-50/30 via-white to-amber-50/20' 
                    : 'hover:border-sand-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      {eventIsLive ? (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider animate-pulse">
                          <Radio className="w-3 h-3" />
                          <span>EN DIRECTO AHORA</span>
                        </span>
                      ) : (
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                          event.type === 'coaching'
                            ? 'bg-purple-100 text-purple-900 border border-purple-200'
                            : 'bg-sand-100 text-stone-700 border border-sand-200'
                        }`}>
                          {event.type === 'coaching' ? 'Mentoría Grupal (60m)' : 'Journaling Diario (35m)'}
                        </span>
                      )}

                      <span className="text-xs text-stone-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        {event.time_display}
                      </span>

                      {hasRecording && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          ✓ Grabación disponible
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif font-bold text-lg text-stone-900">
                      {event.title}
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-stone-500 pt-1">
                      <span>Facilitador: <strong className="text-stone-800">{event.host_name}</strong></span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-stone-400" />
                        {event.attendees_count} inscritos
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:items-end gap-2 flex-shrink-0">
                    {/* Admin Facilitator Controls: Explicit Zoom vs Travesía */}
                    {currentUser.role === 'admin' && (
                      <div className="pb-1.5 flex items-center gap-1.5 flex-wrap justify-end">
                        {event.meeting_url && (
                          <a
                            href={event.meeting_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs py-1.5 px-2.5 rounded-xl bg-sand-200 hover:bg-sand-300 text-stone-900 font-bold flex items-center gap-1 transition-colors border border-sand-300"
                            title="Abrir reunión en Zoom como anfitrión"
                          >
                            <Video className="w-3.5 h-3.5 text-blue-600" />
                            <span>ABRIR ZOOM</span>
                            <ExternalLink className="w-3 h-3 text-stone-500" />
                          </a>
                        )}

                        {eventIsLive ? (
                          <button
                            onClick={() => handleEndLive(event)}
                            className="text-xs py-1.5 px-3 rounded-xl bg-stone-900 text-stone-100 hover:bg-stone-800 font-bold flex items-center gap-1.5 border border-stone-700 shadow-sm"
                            title="Marcar la sesión como finalizada en Travesía"
                          >
                            <Square className="w-3 h-3 text-sand-300 fill-sand-300" />
                            <span>MARCAR COMO FINALIZADA</span>
                          </button>
                        ) : activeTab === 'upcoming' ? (
                          <button
                            onClick={() => handleStartLive(event)}
                            className="text-xs py-1.5 px-3 rounded-xl bg-rose-600 text-white hover:bg-rose-700 font-bold flex items-center gap-1.5 shadow-sm"
                            title="Marcar la sesión como en directo en Travesía"
                          >
                            <Radio className="w-3.5 h-3.5" />
                            <span>MARCAR COMO EN DIRECTO</span>
                          </button>
                        ) : null}
                      </div>
                    )}

                    {activeTab === 'upcoming' ? (
                      <>
                        {eventIsLive ? (
                          currentUser?.membership_status === 'EXPIRED' ? (
                            <button
                              onClick={() => navigate('/membership?from=events_live_expired')}
                              className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                            >
                              <span>CONTINUAR EN TRAVESÍA</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEnterZoom(event)}
                              className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                            >
                              <Video className="w-4 h-4 fill-stone-950" />
                              <span>ENTRAR EN ZOOM</span>
                            </button>
                          )
                        ) : (
                          <button
                            onClick={() => toggleRegisterEvent(event.id)}
                            className={`text-xs py-2 px-4 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-all ${
                              event.user_is_registered
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-200'
                                : 'bg-stone-900 hover:bg-stone-800 text-white shadow-sm'
                            }`}
                          >
                            {event.user_is_registered ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Inscrito (Cancelar)</span>
                              </>
                            ) : (
                              <span>Inscribirme a la sesión</span>
                            )}
                          </button>
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAddToCalendar(event)}
                            className="travesia-btn-ghost text-xs py-1 px-2.5 text-stone-500"
                            title="Añadir a Google Calendar"
                          >
                            <Calendar className="w-3.5 h-3.5 mr-1" />
                            <span>Calendario</span>
                          </button>

                          <button
                            onClick={() => handleEnterZoom(event)}
                            className="text-xs text-bronze-700 hover:text-bronze-900 font-semibold flex items-center gap-1 py-1 px-2"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Sala de Zoom</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col sm:items-end gap-2">
                        {hasRecording ? (
                          currentUser?.membership_status === 'EXPIRED' ? (
                            <button
                              onClick={() => navigate('/membership?from=events_recording_expired')}
                              className="travesia-btn-accent text-xs py-2 px-4 flex items-center gap-1.5 font-bold text-stone-950 shadow-sm"
                            >
                              <span>CONTINUAR EN TRAVESÍA</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenRecording(event)}
                              className="travesia-btn-accent text-xs py-2 px-4 flex items-center gap-1.5 font-bold text-stone-950 shadow-sm"
                            >
                              <PlayCircle className="w-4 h-4 text-stone-950" />
                              <span>VER REPLAY</span>
                            </button>
                          )
                        ) : (
                          <button
                            onClick={() => navigate('/archive')}
                            className="travesia-btn-secondary text-xs py-2 px-3 text-stone-600 flex items-center gap-1"
                          >
                            <span>Ver en Archivo</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Recording Player Modal */}
      <RecordingPlayerModal
        recording={activePlaybackRecording}
        isOpen={Boolean(activePlaybackRecording)}
        onClose={() => setActivePlaybackRecording(null)}
      />
    </div>
  );
};
