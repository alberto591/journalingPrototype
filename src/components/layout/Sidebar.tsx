import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Flame, 
  Film, 
  Calendar, 
  PenLine, 
  Shield, 
  X,
  Sparkles,
  HelpCircle,
  Video
} from 'lucide-react';
import { useDataStore } from '../../lib/dataStore';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, todayJournalSession, liveEvent, recordings, members } = useDataStore();


  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
      isActive
        ? 'bg-sand-200/90 text-stone-900 font-semibold shadow-subtle'
        : 'text-stone-600 hover:text-stone-900 hover:bg-sand-100/80'
    }`;

  const channelItemClass = (slug: string) => {
    const isActive = location.pathname === `/community/${slug}`;
    return `flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
      isActive
        ? 'bg-sand-200/90 text-stone-900 font-semibold shadow-subtle'
        : 'text-stone-600 hover:text-stone-900 hover:bg-sand-100/60'
    }`;
  };

  return (
    <aside className="w-64 h-full flex flex-col bg-sand-50/80 border-r border-sand-200/80 text-stone-800 select-none">
      {/* Brand Header */}
      <div className="p-5 pb-3 border-b border-sand-200/60 flex items-center justify-between">
        <NavLink to="/dashboard" onClick={onCloseMobile} className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-stone-900 flex items-center justify-center text-sand-50 shadow-sm group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="9" stroke="#E7C8B6" strokeWidth="1.5" strokeDasharray="2 3" opacity="0.6"/>
              <path d="M16 7V25" stroke="#FAF4EF" strokeWidth="2" strokeLinecap="round"/>
              <path d="M10 16H22" stroke="#FAF4EF" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="16" cy="16" r="3" fill="#B66E43" />
            </svg>
          </div>
          <div>
            <span className="font-serif font-bold text-lg tracking-wider text-stone-950 block leading-tight">
              TRAVESÍA
            </span>
            <span className="text-[10px] text-stone-500 tracking-tight block">
              Frena · Escucha · Actúa
            </span>
          </div>
        </NavLink>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-sand-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Primary Journal CTA Button */}
      <div className="p-3">
        <button
          onClick={() => {
            navigate('/journal');
            if (onCloseMobile) onCloseMobile();
          }}
          className={`w-full py-2.5 px-3.5 rounded-xl font-medium text-xs flex items-center justify-between shadow-subtle transition-all duration-200 group ${
            todayJournalSession
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100'
              : 'bg-stone-900 hover:bg-stone-800 text-sand-50 active:scale-[0.98]'
          }`}
        >
          <div className="flex items-center gap-2">
            <PenLine className={`w-4 h-4 ${todayJournalSession ? 'text-emerald-600' : 'text-amber-400 group-hover:rotate-12 transition-transform'}`} />
            <span className="font-semibold">
              {todayJournalSession ? 'Práctica de hoy lista' : 'Sesión de Diario'}
            </span>
          </div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
            todayJournalSession ? 'bg-emerald-200/60 text-emerald-900' : 'bg-stone-800 text-sand-300'
          }`}>
            {currentUser.streak_days}d 🔥
          </span>
        </button>
      </div>

      {/* Nav Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
        {/* Core Section */}
        <div className="space-y-1">
          <NavLink to="/dashboard" onClick={onCloseMobile} className={navItemClass}>
            <Home className="w-4 h-4 text-stone-500" />
            <span>Inicio</span>
          </NavLink>
          <NavLink to="/community" onClick={onCloseMobile} className={navItemClass}>
            <Users className="w-4 h-4 text-stone-500" />
            <span>Comunidad</span>
          </NavLink>
          <NavLink to="/journey" onClick={onCloseMobile} className={navItemClass}>
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>El Camino de 4 Semanas</span>
          </NavLink>
          <NavLink to="/events" onClick={onCloseMobile} className={navItemClass}>
            <Video className="w-4 h-4 text-amber-700" />
            <span className="flex-1">Sesiones en Vivo & Archivo</span>
            {liveEvent ? (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
              </span>
            ) : (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-sand-200 text-stone-600 font-semibold">
                {recordings.length}
              </span>
            )}
          </NavLink>
        </div>

        {/* Canales */}
        <div>
          <div className="px-3 pb-1 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
            Canales
          </div>
          <div className="space-y-0.5">
            <NavLink to="/community/conversacion-principal" onClick={onCloseMobile} className={() => channelItemClass('conversacion-principal')}>
              <Flame className="w-4 h-4 text-amber-600" />
              <span className="truncate">Conversación principal</span>
            </NavLink>
            <NavLink to="/community/preguntas-soporte" onClick={onCloseMobile} className={() => channelItemClass('preguntas-soporte')}>
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span className="truncate">Preguntas & Soporte</span>
            </NavLink>
          </div>
        </div>

        {/* Compañeros / Miembros */}
        <div>
          <div className="px-3 pb-1 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
            Compañeros
          </div>
          <div className="space-y-0.5">
            <NavLink to="/members" onClick={onCloseMobile} className={navItemClass}>
              <Users className="w-4 h-4 text-stone-500" />
              <span className="flex-1">Directorio de miembros</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-sand-200 text-stone-600 font-semibold">
                {members.length}
              </span>
            </NavLink>
          </div>
        </div>

        {/* Admin Section (Conditionally highlighted) */}
        {currentUser.role === 'admin' && (
          <div className="pt-2 border-t border-sand-200/80">
            <div className="px-3 pb-1 text-[11px] font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              <span>Gestión Admin</span>
            </div>
            <div className="space-y-0.5">
              <NavLink to="/admin" onClick={onCloseMobile} className={navItemClass}>
                <Shield className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-amber-900">Panel de Control</span>
              </NavLink>
            </div>
          </div>
        )}
      </div>

      {/* Bottom User Card */}
      <div className="p-3 border-t border-sand-200/80 bg-sand-100/50">
        <NavLink
          to="/profile"
          onClick={onCloseMobile}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-sand-200/70 transition-colors group"
        >
          <img
            src={currentUser.avatar_url}
            alt={currentUser.name}
            className="w-9 h-9 rounded-full object-cover border border-sand-300 group-hover:border-bronze-400 transition-colors"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-stone-900 truncate">{currentUser.name}</p>
            <p className="text-[10px] text-stone-500 truncate capitalize">
              {currentUser.role === 'admin' ? 'Fundador' : 'Semana ' + currentUser.current_week + ' · ' + currentUser.streak_days + 'd racha'}
            </p>
          </div>
        </NavLink>
      </div>
    </aside>
  );
};
