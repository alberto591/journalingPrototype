import React, { useState } from 'react';
import { useDataStore } from '../../lib/dataStore';
import { EventItem } from '../../types';
import { 
  Calendar, 
  Clock, 
  Video, 
  CheckCircle, 
  Users, 
  ArrowRight, 
  ExternalLink,
  Plus,
  PlayCircle,
  X
} from 'lucide-react';

export const EventsView: React.FC = () => {
  const { events, toggleRegisterEvent, currentUser, addEvent } = useDataStore();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [liveRoomEvent, setLiveRoomEvent] = useState<EventItem | null>(null);

  const upcomingEvents = events.filter(e => e.status === 'upcoming' || e.status === 'live');
  const pastEvents = events.filter(e => e.status === 'finished');
  const displayedEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

  const handleAddToCalendar = (event: EventItem) => {
    // Generate simple Google Calendar URL
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.description);
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
    window.open(gcalUrl, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 space-y-6 animate-fade-in">
      {/* Hero Header */}
      <div className="bg-stone-900 text-sand-50 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400 bg-stone-800/80 px-3 py-1 rounded-full border border-stone-700/60 inline-block mb-3">
            Sesiones Guiadas en Directo
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            Eventos y Práctica en Vivo
          </h1>
          <p className="text-sand-300 text-xs sm:text-sm mt-1 max-w-lg leading-relaxed">
            Escribir en soledad es transformador, pero escribir juntos en directo multiplica la disciplina y disuelve el aislamiento.
          </p>
        </div>

        <div className="flex-shrink-0">
          <button
            onClick={() => setLiveRoomEvent(upcomingEvents[0] || events[0])}
            className="travesia-btn-accent text-xs py-2.5 px-5 font-semibold flex items-center gap-2 shadow-lg"
          >
            <Video className="w-4 h-4" />
            <span>Sala de Sesión en Directo</span>
          </button>
        </div>
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

                  {event.status === 'live' && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                      EN DIRECTO
                    </span>
                  )}

                  <span className="text-xs text-bronze-700 font-medium">
                    {event.time_display}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900">
                  {event.title}
                </h3>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {event.description}
                </p>

                {/* Host & Attendees */}
                <div className="flex items-center gap-3 pt-1 text-xs text-stone-500">
                  <div className="flex items-center gap-1.5">
                    <img
                      src={event.host_avatar}
                      alt={event.host_name}
                      className="w-5 h-5 rounded-full object-cover border border-sand-300"
                    />
                    <span className="font-medium text-stone-700">{event.host_name}</span>
                  </div>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-stone-400" />
                    {event.attendees_count} registrados
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
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
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
                        onClick={() => setLiveRoomEvent(event)}
                        className="text-xs text-bronze-700 hover:text-bronze-900 font-semibold flex items-center gap-1 py-1 px-2"
                      >
                        <span>Entrar a la sala →</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => setLiveRoomEvent(event)}
                    className="travesia-btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                  >
                    <PlayCircle className="w-4 h-4 text-amber-400" />
                    <span>Ver grabación</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Simulated Live Session Modal */}
      {liveRoomEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-950 text-sand-50 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-800 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                <span className="text-xs uppercase font-bold text-rose-400 tracking-wider">
                  Sala de Práctica en Vivo
                </span>
              </div>
              <button
                onClick={() => setLiveRoomEvent(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="font-serif text-2xl font-bold text-white">
                {liveRoomEvent.title}
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Guía: {liveRoomEvent.host_name} · Duración: {liveRoomEvent.duration_minutes} min
              </p>
            </div>

            {/* Video Placeholder Area */}
            <div className="relative aspect-video rounded-2xl bg-stone-900 border border-stone-800 flex flex-col items-center justify-center text-center p-6 overflow-hidden group">
              <div className="w-16 h-16 rounded-full bg-bronze-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform mb-3">
                <PlayCircle className="w-8 h-8" />
              </div>
              <p className="font-serif text-lg font-semibold text-stone-200">
                La transmisión en directo o grabación comenzará en breve
              </p>
              <p className="text-xs text-stone-400 max-w-sm mt-1">
                Prepara tu libreta, tu respiración y silencia toda notificación en tu entorno.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-400 pt-2">
              <span>{liveRoomEvent.attendees_count} hermanos conectados</span>
              <button
                onClick={() => setLiveRoomEvent(null)}
                className="travesia-btn-secondary text-xs text-stone-200 bg-stone-800 border-stone-700 hover:bg-stone-700"
              >
                Salir de la sala
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
