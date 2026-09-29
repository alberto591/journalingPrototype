import React, { useState } from 'react';
import { useDataStore } from '../../lib/dataStore';
import { JournalSession } from '../../types';
import { 
  Flame, 
  CheckCircle, 
  Clock, 
  Lock, 
  ChevronDown, 
  ChevronUp, 
  Calendar as CalendarIcon,
  ShieldCheck,
  Heart,
  Wind
} from 'lucide-react';

export const JournalHistoryView: React.FC = () => {
  const { 
    currentUser, 
    getPrivateJournalHistory, 
    computedStreakDays, 
    computedCompletedSessionsCount, 
    computedReflectionMinutes 
  } = useDataStore();
  const sessions = getPrivateJournalHistory();
  const [expandedId, setExpandedId] = useState<string | null>(sessions[0]?.id || null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 space-y-6 animate-fade-in">
      {/* Privacy Guarantee Header */}
      <div className="bg-stone-900 text-sand-50 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>PRIVADO · PROTEGIDO POR RLS</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold">
            Tu Archivo de Práctica Personal
          </h2>
          <p className="text-sand-300 text-xs sm:text-sm mt-1 max-w-lg leading-relaxed">
            Ningún otro miembro ni administrador de la comunidad puede acceder a tus escritos íntimos. Este espacio es tu confesionario y tu brújula ante Dios.
          </p>
        </div>

        {/* Stats Pills - Computed from real database sessions */}
        <div className="grid grid-cols-3 gap-3 bg-stone-800/80 p-4 rounded-2xl border border-stone-700/60 text-center flex-shrink-0">
          <div>
            <div className="flex items-center justify-center gap-1 text-amber-400 text-xs mb-0.5">
              <Flame className="w-3.5 h-3.5" />
              <span>Racha</span>
            </div>
            <p className="font-bold text-lg text-white">{computedStreakDays}d</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs mb-0.5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Sesiones</span>
            </div>
            <p className="font-bold text-lg text-white">{computedCompletedSessionsCount}</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-blue-400 text-xs mb-0.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Quietud</span>
            </div>
            <p className="font-bold text-lg text-white">
              {Math.floor(computedReflectionMinutes / 60)}h {computedReflectionMinutes % 60}m
            </p>
          </div>
        </div>
      </div>

      {/* Sessions Timeline List */}
      <div className="space-y-4">
        <h3 className="font-serif font-bold text-lg text-stone-900 px-1">
          Historial Cronológico de Sesiones ({sessions.length})
        </h3>

        {sessions.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-sand-200 text-stone-400">
            <p className="text-sm">Aún no has completado ninguna sesión de diario.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map(session => {
              const isExpanded = expandedId === session.id;
              const dateObj = new Date(session.date);
              const formattedDate = dateObj.toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              });

              return (
                <div 
                  key={session.id}
                  className="bg-white rounded-2xl border border-sand-200/90 shadow-card overflow-hidden transition-all duration-200 hover:border-sand-300"
                >
                  {/* Collapsed Header Bar */}
                  <button
                    onClick={() => toggleExpand(session.id)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-sand-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-sand-100 flex items-center justify-center text-stone-700 flex-shrink-0 font-serif font-bold text-sm">
                        {dateObj.getDate()}
                      </div>
                      <div className="truncate">
                        <p className="font-serif font-bold text-sm sm:text-base text-stone-900 capitalize truncate">
                          {formattedDate}
                        </p>
                        <p className="text-xs text-stone-500 truncate mt-0.5">
                          Compromiso: <span className="text-stone-800 font-medium">"{session.action_commitment}"</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <div className="hidden sm:flex items-center gap-1.5">
                        {session.emotions.slice(0, 2).map(e => (
                          <span key={e.category} className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sand-100 text-stone-700">
                            {e.category}
                          </span>
                        ))}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-stone-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-stone-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="p-5 pt-0 border-t border-sand-100 bg-sand-50/40 space-y-4 animate-fade-in text-sm text-stone-700">
                      {/* Emotions */}
                      <div className="space-y-1.5 pt-3">
                        <span className="text-xs uppercase font-bold tracking-wider text-stone-400 block">
                          Emociones Procesadas:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {session.emotions.map((emo, idx) => (
                            <div key={idx} className="p-3 bg-white rounded-xl border border-sand-200">
                              <span className="font-serif font-bold text-xs text-stone-900 block">
                                {emo.category}
                              </span>
                              <p className="text-xs text-stone-600 mt-0.5">{emo.related_to}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Deep writing snippet */}
                      {session.deep_writing_10m && (
                        <div className="space-y-1">
                          <span className="text-xs uppercase font-bold tracking-wider text-stone-400 block">
                            Extracto de Escritura Profunda:
                          </span>
                          <div className="p-3 bg-white rounded-xl border border-sand-200 text-xs text-stone-600 italic leading-relaxed">
                            "{session.deep_writing_10m}"
                          </div>
                        </div>
                      )}

                      {/* Spiritual listening */}
                      {session.listening_notes && (
                        <div className="space-y-1">
                          <span className="text-xs uppercase font-bold tracking-wider text-stone-400 block">
                            Discernimiento Espiritual:
                          </span>
                          <div className="p-3 bg-white rounded-xl border border-sand-200 font-serif text-xs text-stone-800 leading-relaxed">
                            "{session.listening_notes}"
                          </div>
                        </div>
                      )}

                      {/* Commitment */}
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                          Compromiso sellado:
                        </span>
                        <p className="font-serif font-bold text-sm text-emerald-950 mt-0.5">
                          "{session.action_commitment}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
