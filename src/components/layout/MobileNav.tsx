import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, PenLine, Calendar, User } from 'lucide-react';
import { useDataStore } from '../../lib/dataStore';

export const MobileNav: React.FC = () => {
  const { todayJournalSession, liveEvent } = useDataStore();

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center flex-1 py-2 text-[10px] font-medium transition-all ${
      isActive ? 'text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-600'
    }`;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-sand-50/95 backdrop-blur-md border-t border-sand-200/80 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <NavLink to="/dashboard" className={navItemClass}>
          <Home className="w-5 h-5 mb-0.5" />
          <span>Inicio</span>
        </NavLink>

        <NavLink to="/community" className={navItemClass}>
          <Users className="w-5 h-5 mb-0.5" />
          <span>Comunidad</span>
        </NavLink>

        {/* Central Prominent Journal Button */}
        <NavLink
          to="/journal"
          className="flex flex-col items-center justify-center -mt-4 px-3"
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-transform active:scale-95 ${
            todayJournalSession 
              ? 'bg-emerald-600 text-white' 
              : 'bg-stone-900 text-amber-400'
          }`}>
            <PenLine className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold text-stone-900 mt-1">
            Diario
          </span>
        </NavLink>

        <NavLink to="/events" className={navItemClass}>
          <div className="relative">
            <Calendar className="w-5 h-5 mb-0.5" />
            {liveEvent && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-600 ring-2 ring-white animate-pulse" />
            )}
          </div>
          <span className={liveEvent ? 'text-rose-600 font-bold' : ''}>
            {liveEvent ? 'En Directo' : 'Eventos'}
          </span>
        </NavLink>

        <NavLink to="/profile" className={navItemClass}>
          <User className="w-5 h-5 mb-0.5" />
          <span>Perfil</span>
        </NavLink>
      </div>
    </nav>
  );
};
