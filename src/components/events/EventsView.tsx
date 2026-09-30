import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../../lib/dataStore';
import { eventsService } from '../../services/eventsService';
import { EventItem } from '../../types';
import { 
  Calendar, 
  Clock, 
  Video, 
  CheckCircle, 
  Users, 
  ExternalLink,
  PlayCircle,
  AlertCircle
} from 'lucide-react';

export const EventsView: React.FC = () => {
  const navigate = useNavigate();
  const { events, toggleRegisterEvent, currentUser } = useDataStore();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const upcomingEvents = events.filter(e => e.status === 'upcoming' || e.status === 'live');
  const pastEvents = events.filter(e => e.status === 'finished');
  const displayedEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

  const handleAddToCalendar = (event: EventItem) => {
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.description);
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
    window.open(gcalUrl, '_blank', 'noopener,noreferrer');
  };

  const handleEnterZoom = async (event: EventItem) => {
    setInfoMessage(null);

    // Track join click event in Supabase (join_click, NOT attendance)
    if (currentUser?.id) {
      await eventsService.recordZoomJoinClick(event.id, currentUser.id);
    }

    if (event.meeting_url) {
      window.open(event.meeting_url, '_blank', 'noopener,noreferrer');
    } else {
      setInfoMessage(`El enlace de Zoom para "${event.title}" estará disponible 10 minutos antes del inicio de la sesión.`);
      setTimeout(() => setInfoMessage(null), 5000);
    }
  };

  const handleOpenRecording = (event: EventItem) => {
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
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400 bg-stone-800/80 px-3 py-1 rounded-full border border-stone-700/60 inline-block mb-3">
            Sesiones Guiadas en Directo (Zoom)
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            Eventos y Práctica en Vivo
          </h1>
          <p className="text-sand-300 text-xs sm:text-sm mt-1 max-w-lg leading-relaxed">
            Escribir en soledad es transformador, pero escribir juntos en directo multiplica la disciplina y disuelve el aislamiento.
          </p>
        </div>

        {upcomingEvents.length > 0 && (
          <div className="flex-shrink-0">
            <button
              onClick={() => handleEnterZoom(upcomingEvents[0])}
              className="travesia-btn-accent text-xs py-2.5 px-5 font-semibold flex items-center gap-2 shadow-lg"
            >
              <Video className="w-4 h-4" />
              <span>Entrar en Zoom</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-sand-200 pb-2">
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
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'past'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'text-stone-600 hover:text-stone-900 hover:bg-sand-100'
          }`}
        >
          Sesiones Pasadas y Replays ({pastEvents.length})
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {displayedEvents.map(event => (
          <div
            key={event.id}
            className="travesia-card p-5 sm:p-6 transition-all duration-200 hover:border-sand-300 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                    event.type === 'coaching'
                      ? 'bg-purple-100 text-purple-900 border border-purple-200'
                      : 'bg-sand-100 text-stone-700 border border-sand-200'
                  }`}>
                    {event.type === 'coaching' ? 'Mentoría Grupal (60m)' : 'Journaling Diario (35m)'}
                  </span>
                  <span className="text-xs text-stone-500 flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    {event.time_display}
                  </span>
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
                {activeTab === 'upcoming' ? (
                  <>
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
                        <span>Entrar en Zoom</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => handleOpenRecording(event)}
                    className="travesia-btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                  >
                    <PlayCircle className="w-4 h-4 text-amber-400" />
                    <span>Ver grabación en Archivo</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
