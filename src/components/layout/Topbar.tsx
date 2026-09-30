import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  ChevronRight, 
  CheckCheck, 
  LogOut,
  Menu,
  Video
} from 'lucide-react';
import { useDataStore } from '../../lib/dataStore';
import { SearchModal } from '../common/SearchModal';

interface TopbarProps {
  onOpenMobileSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    currentUser, 
    signOut, 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    liveEvent,
    trackZoomJoinClick
  } = useDataStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Breadcrumbs generator
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path.startsWith('/community')) {
      return [
        { label: 'Inicio', path: '/dashboard' },
        { label: 'Comunidad', path: '/community' },
        { label: 'Travesía' },
      ];
    }
    if (path.startsWith('/journal')) {
      return [
        { label: 'Inicio', path: '/dashboard' },
        { label: 'Diario Guiado', path: '/journal' },
      ];
    }
    if (path.startsWith('/journey')) {
      return [
        { label: 'Inicio', path: '/dashboard' },
        { label: 'El Camino de 4 Semanas', path: '/journey' },
      ];
    }
    if (path.startsWith('/events')) {
      return [
        { label: 'Inicio', path: '/dashboard' },
        { label: 'Eventos y Directos', path: '/events' },
      ];
    }
    if (path.startsWith('/lessons')) {
      return [
        { label: 'Inicio', path: '/dashboard' },
        { label: 'Formación', path: '/lessons' },
      ];
    }
    if (path.startsWith('/library')) {
      return [
        { label: 'Inicio', path: '/dashboard' },
        { label: 'Biblioteca', path: '/library' },
      ];
    }
    if (path.startsWith('/archive')) {
      return [
        { label: 'Inicio', path: '/dashboard' },
        { label: 'Archivo de Sesiones', path: '/archive' },
      ];
    }
    if (path.startsWith('/progress')) {
      return [
        { label: 'Inicio', path: '/dashboard' },
        { label: 'Mi Progreso', path: '/progress' },
      ];
    }
    if (path.startsWith('/admin')) {
      return [
        { label: 'Inicio', path: '/dashboard' },
        { label: 'Administración', path: '/admin' },
      ];
    }
    return [
      { label: 'Inicio', path: '/dashboard' },
      { label: 'Panel Principal' }
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <>
      <header className="sticky top-0 z-30 bg-sand-50/90 backdrop-blur-md border-b border-sand-200/80 px-4 sm:px-6 py-3 transition-all">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
          {/* Left: Mobile hamburger + Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenMobileSidebar}
              className="lg:hidden p-2 -ml-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-sand-200/60"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>

            <nav className="flex items-center gap-1.5 text-xs text-stone-500 font-medium overflow-x-auto py-1">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.label}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />}
                  {crumb.path ? (
                    <Link
                      to={crumb.path}
                      className="hover:text-stone-900 transition-colors whitespace-nowrap"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-stone-900 font-semibold whitespace-nowrap">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Center: Search trigger bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-white border border-sand-200 hover:border-sand-300 text-stone-400 text-xs shadow-subtle hover:shadow transition-all"
            >
              <span className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                <span className="truncate">Buscar publicaciones, reflexiones o miembros...</span>
              </span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] text-stone-400 bg-sand-100 rounded border border-sand-200">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Live pill + Search icon (mobile) + Notifications + Avatar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Indicator Pill (if live) */}
            {liveEvent && (
              <button
                onClick={async () => {
                  await trackZoomJoinClick(liveEvent.id);
                  const zoom = liveEvent.meeting_url || liveEvent.zoom_meeting_url;
                  if (zoom) window.open(zoom, '_blank', 'noopener,noreferrer');
                  else navigate('/events');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-mono text-[11px] font-bold shadow-sm transition-all animate-pulse"
                title="Sesión en directo en curso: Pulsa para entrar a Zoom"
              >
                <span className="w-2 h-2 rounded-full bg-white" />
                <span className="hidden sm:inline">EN DIRECTO</span>
                <Video className="w-3.5 h-3.5 ml-0.5" />
              </button>
            )}

            {/* Mobile Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-2 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-sand-200/60"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications Menu */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-sand-200/60 transition-colors"
                aria-label="Notificaciones"
              >
                <Bell className="w-4 h-4" />
                {(unreadCount > 0 || liveEvent) && (
                  <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ring-2 ring-white animate-pulse ${liveEvent ? 'bg-rose-600' : 'bg-bronze-600'}`} />
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-sand-200 py-3 z-40 animate-scale-up">
                  <div className="px-4 pb-2 border-b border-sand-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-serif font-semibold text-sm text-stone-900">Notificaciones</h4>
                      <p className="text-[11px] text-stone-500">{unreadCount} pendientes</p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-xs text-bronze-700 hover:text-bronze-800 font-medium flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Marcar leídas
                      </button>
                    )}
                  </div>

                  {/* Pinned Live Session Card inside Notifications */}
                  {liveEvent && (
                    <div className="p-3.5 bg-gradient-to-r from-amber-50 to-rose-50/60 border-b border-amber-200/80">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                        </span>
                        <span className="text-[10px] font-mono font-bold uppercase text-rose-700 tracking-wider">
                          EN DIRECTO
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-stone-900 leading-snug">{liveEvent.title}</p>
                      <p className="text-[11px] text-stone-600 mt-0.5">Facilitador: {liveEvent.host_name}</p>
                      {currentUser?.membership_status === 'EXPIRED' ? (
                        <button
                          onClick={() => {
                            navigate('/membership?from=notification_live_expired');
                            setIsNotificationsOpen(false);
                          }}
                          className="mt-2.5 w-full py-1.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                        >
                          <span>CONTINUAR EN TRAVESÍA</span>
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            await trackZoomJoinClick(liveEvent.id);
                            const zoom = liveEvent.meeting_url || liveEvent.zoom_meeting_url;
                            if (zoom) window.open(zoom, '_blank', 'noopener,noreferrer');
                            else navigate('/events');
                            setIsNotificationsOpen(false);
                          }}
                          className="mt-2.5 w-full py-1.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>ENTRAR EN ZOOM</span>
                        </button>
                      )}
                    </div>
                  )}

                  <div className="max-h-80 overflow-y-auto divide-y divide-sand-100">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-stone-400">
                        No tienes notificaciones
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={async () => {
                            markNotificationAsRead(n.id);
                            if (n.link) {
                              if (n.link.startsWith('http')) {
                                if (liveEvent) await trackZoomJoinClick(liveEvent.id);
                                window.open(n.link, '_blank', 'noopener,noreferrer');
                              } else {
                                navigate(n.link);
                              }
                            }
                            setIsNotificationsOpen(false);
                          }}
                          className={`p-3.5 hover:bg-sand-50 transition-colors cursor-pointer flex gap-3 items-start ${!n.read ? 'bg-amber-50/30' : ''}`}
                        >
                          <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${!n.read ? 'bg-bronze-600' : 'bg-transparent'}`} />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-stone-900 leading-snug">{n.title}</p>
                            <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{n.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar / Menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-sand-200/60 transition-colors"
              >
                {currentUser.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border border-sand-300"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-sand-200 border border-sand-300 flex items-center justify-center text-xs font-semibold text-stone-700">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-sand-200 py-2 z-40 text-xs animate-scale-up">
                  <div className="px-4 py-2 border-b border-sand-100">
                    <p className="font-semibold text-stone-900 truncate">{currentUser.name || 'Usuario'}</p>
                    <p className="text-stone-500 text-[11px] truncate">{currentUser.email || currentUser.bio || 'Miembro de Travesía'}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="w-full text-left px-4 py-2 hover:bg-sand-100 block text-stone-700"
                    >
                      Mi Perfil
                    </Link>
                    <Link
                      to="/progress"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="w-full text-left px-4 py-2 hover:bg-sand-100 block text-stone-700"
                    >
                      Mi Progreso & Práctica
                    </Link>
                    {currentUser.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="w-full text-left px-4 py-2 hover:bg-amber-50 text-amber-900 font-medium block"
                      >
                        Panel de Administración
                      </Link>
                    )}
                  </div>
                  <div className="border-t border-sand-100 pt-1">
                    <button
                      onClick={async () => {
                        setIsProfileMenuOpen(false);
                        await signOut();
                        navigate('/login');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-700 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
