import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  MessageSquare, 
  Shield, 
  Calendar, 
  Clock, 
  ArrowRight, 
  CheckCircle, 
  PenLine,
  Flame,
  Award
} from 'lucide-react';
import { useDataStore } from '../../lib/dataStore';

export const RightSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentUser, 
    members, 
    posts, 
    events, 
    nextUpcomingEvent,
    todayJournalSession, 
    toggleRegisterEvent 
  } = useDataStore();

  const nextSession = nextUpcomingEvent || events.find(e => e.status === 'upcoming') || events[0];
  const adminCount = members.filter(m => m.role === 'admin').length;

  return (
    <aside className="w-80 h-full flex flex-col p-4 space-y-4 overflow-y-auto select-none">
      {/* 1. Community Brand Card & Stats */}
      <div className="travesia-card p-4 space-y-3 bg-gradient-to-b from-white to-sand-50/60">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-serif font-bold text-stone-900 tracking-wide">TRAVESÍA</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sand-200 text-stone-700">
              Comunidad
            </span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Espacio privado para desacelerar, silenciar el ruido, escuchar la voz de Dios y tomar acción diaria deliberada.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-sand-200/80 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-stone-500 text-[10px] mb-0.5">
              <Users className="w-3 h-3" />
              <span>Miembros</span>
            </div>
            <p className="font-bold text-sm text-stone-900">{members.length}</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-stone-500 text-[10px] mb-0.5">
              <MessageSquare className="w-3 h-3" />
              <span>Aportes</span>
            </div>
            <p className="font-bold text-sm text-stone-900">{posts.length}+</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-stone-500 text-[10px] mb-0.5">
              <Shield className="w-3 h-3" />
              <span>Guías</span>
            </div>
            <p className="font-bold text-sm text-stone-900">{adminCount}</p>
          </div>
        </div>

        <div className="text-[11px] text-stone-500 flex items-center justify-between">
          <span>Ciclo en curso</span>
          <span className="font-semibold text-stone-800">Septiembre — Octubre</span>
        </div>
      </div>

      {/* 2. Today's Practice Immediate Status */}
      <div className={`p-4 rounded-2xl border transition-all ${
        todayJournalSession
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
          : 'bg-white border-sand-200 shadow-card'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
              Práctica de Hoy
            </span>
          </div>
          {todayJournalSession ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              <CheckCircle className="w-3 h-3" /> Completada
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              <Clock className="w-3 h-3" /> Pendiente
            </span>
          )}
        </div>

        {todayJournalSession ? (
          <div className="space-y-2">
            <p className="text-xs text-stone-600 line-clamp-2">
              <strong className="text-stone-800">Compromiso:</strong> "{todayJournalSession.action_commitment}"
            </p>
            <button
              onClick={() => navigate('/journal')}
              className="text-xs text-emerald-800 hover:text-emerald-900 font-medium underline flex items-center gap-1"
            >
              Ver reflexión completa <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-stone-600">
              Aún no has completado los 5 movimientos de hoy. Tómate 25-30 minutos para desacelerar y escribir.
            </p>
            <button
              onClick={() => navigate('/journal')}
              className="travesia-btn-primary w-full text-xs py-2 shadow-sm"
            >
              <PenLine className="w-3.5 h-3.5 mr-1" />
              Comenzar práctica ahora
            </button>
          </div>
        )}
      </div>

      {/* 3. Upcoming Guided Live Session */}
      {nextSession && (
        <div className="travesia-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-bronze-600" />
              Próxima sesión
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
              {nextSession.duration_minutes} min
            </span>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-sm text-stone-900 leading-snug">
              {nextSession.title}
            </h4>
            <p className="text-xs text-bronze-700 font-medium mt-1">
              {nextSession.time_display}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1 text-xs text-stone-500">
            <img
              src={nextSession.host_avatar}
              alt={nextSession.host_name}
              className="w-5 h-5 rounded-full object-cover border border-sand-300"
            />
            <span className="truncate">Guía: {nextSession.host_name}</span>
            <span className="text-stone-300">·</span>
            <span>{nextSession.attendees_count} inscritos</span>
          </div>

          <button
            onClick={() => toggleRegisterEvent(nextSession.id)}
            className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              nextSession.user_is_registered
                ? 'bg-sand-100 hover:bg-sand-200 text-stone-800 border border-sand-300'
                : 'bg-stone-900 hover:bg-stone-800 text-white'
            }`}
          >
            {nextSession.user_is_registered ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Registrado · Entrar en la sesión →
              </>
            ) : (
              <>
                Inscribirme a la sesión →
              </>
            )}
          </button>
        </div>
      )}

      {/* 4. Current 4-Week Journey Progress Card */}
      <div className="travesia-card p-4 space-y-3 bg-white">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
            El Camino de 4 Semanas
          </span>
          <span className="text-[10px] font-mono font-bold text-bronze-700">
            Semana {currentUser.current_week} de 4
          </span>
        </div>

        <div>
          <h4 className="font-serif font-semibold text-sm text-stone-900">
            {currentUser.current_week === 1 && 'Semana 1: El Presente'}
            {currentUser.current_week === 2 && 'Semana 2: La Visión'}
            {currentUser.current_week === 3 && 'Semana 3: Los Obstáculos'}
            {currentUser.current_week === 4 && 'Semana 4: El Trabajo'}
          </h4>
          <p className="text-xs text-stone-500 mt-0.5">
            {currentUser.current_week === 1 && 'Construyendo el cimiento de la práctica diaria.'}
            {currentUser.current_week === 2 && 'Discerniendo la vida que estás llamado a forjar.'}
            {currentUser.current_week === 3 && 'Identificando y derribando patrones de autoboicot.'}
            {currentUser.current_week === 4 && 'Tomando decisiones difíciles y compromisos ineludibles.'}
          </p>
        </div>

        {/* 4-step progress line */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {[1, 2, 3, 4].map(w => (
            <div
              key={w}
              className={`h-1.5 rounded-full ${
                w < currentUser.current_week
                  ? 'bg-emerald-500'
                  : w === currentUser.current_week
                  ? 'bg-bronze-600'
                  : 'bg-sand-200'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => navigate('/journey')}
          className="text-xs font-semibold text-stone-700 hover:text-stone-900 flex items-center gap-1 pt-1"
        >
          Ver currículo completo <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* 5. Personal Metrics Quick Snapshot */}
      <div className="travesia-card p-4 space-y-2">
        <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
          Tu Consistencia
        </span>
        <div className="flex items-center justify-between text-xs">
          <span className="text-stone-600 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" /> Racha activa:
          </span>
          <span className="font-bold text-stone-900">{currentUser.streak_days} días</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-stone-600 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Sesiones completas:
          </span>
          <span className="font-bold text-stone-900">{currentUser.completed_sessions_count}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-stone-600 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-500" /> Tiempo en quietud:
          </span>
          <span className="font-bold text-stone-900">
            {Math.floor(currentUser.reflection_minutes / 60)}h {currentUser.reflection_minutes % 60}m
          </span>
        </div>
      </div>
    </aside>
  );
};
