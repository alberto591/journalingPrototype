import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../../lib/dataStore';
import { Video, ExternalLink, X, Radio, ArrowRight, Square } from 'lucide-react';

export const LiveSessionBanner: React.FC = () => {
  const navigate = useNavigate();
  const { liveEvent, currentUser, trackZoomJoinClick, endLiveSession } = useDataStore();
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isEnding, setIsEnding] = useState<boolean>(false);

  if (!liveEvent || isDismissed) {
    return null;
  }

  const zoomUrl = liveEvent.meeting_url || liveEvent.zoom_meeting_url;

  const handleJoinZoom = async () => {
    if (currentUser?.membership_status === 'EXPIRED') {
      navigate('/membership?from=live_banner_expired');
      return;
    }
    await trackZoomJoinClick(liveEvent.id);
    if (zoomUrl) {
      window.open(zoomUrl, '_blank', 'noopener,noreferrer');
    } else {
      navigate('/events');
    }
  };

  const handleEndDirect = async () => {
    if (window.confirm('¿Deseas marcar la sesión como finalizada en Travesía?\n\nRecuerda finalizar la reunión en la app de Zoom.')) {
      setIsEnding(true);
      try {
        await endLiveSession(liveEvent.id);
      } finally {
        setIsEnding(false);
      }
    }
  };

  return (
    <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/90 text-sand-50 border-b border-amber-600/40 shadow-lg px-4 py-2.5 sm:py-3 transition-all animate-fade-in relative z-40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        
        {/* Left: Live Indicator & Event Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-600/90 text-white font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-sm flex-shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <Radio className="w-3 h-3 hidden sm:inline" />
            <span>EN DIRECTO</span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-serif font-bold text-xs sm:text-sm text-amber-200 truncate">
                {liveEvent.title}
              </h2>
              <span className="hidden sm:inline text-sand-400 text-xs">•</span>
              <span className="text-[11px] text-sand-300 hidden sm:inline truncate">
                Guía: <strong className="text-white font-medium">{liveEvent.host_name}</strong>
              </span>
            </div>
            <p className="text-[10px] text-sand-400 sm:hidden truncate">
              {liveEvent.host_name} está en directo ahora en Zoom
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 self-end sm:self-center">
          <button
            onClick={() => navigate('/events')}
            className="text-xs text-sand-300 hover:text-white underline-offset-4 hover:underline px-2 py-1 font-medium transition-colors hidden md:inline-flex items-center gap-1"
          >
            <span>Ver detalles</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          {/* Admin Live Controls */}
          {currentUser.role === 'admin' && (
            <button
              onClick={handleEndDirect}
              disabled={isEnding}
              className="text-xs py-1.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Marcar como finalizada en Travesía (recuerda finalizar también en Zoom)"
            >
              <Square className="w-3 h-3 text-sand-300 fill-sand-300" />
              <span>{isEnding ? 'Finalizando...' : 'MARCAR COMO FINALIZADA'}</span>
            </button>
          )}

          {/* Enter Zoom CTA or Expired Conversion */}
          {currentUser.membership_status === 'EXPIRED' ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-sand-300 hidden sm:inline font-medium">Tu prueba ha terminado.</span>
              <button
                onClick={() => navigate('/membership?from=live_banner_expired')}
                className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs py-1.5 sm:py-2 px-3.5 sm:px-4 rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95"
              >
                <span>CONTINUAR EN TRAVESÍA</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleJoinZoom}
              className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs py-1.5 sm:py-2 px-3.5 sm:px-4 rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95 group"
            >
              <Video className="w-3.5 h-3.5 text-stone-950 fill-stone-950 group-hover:scale-110 transition-transform" />
              <span className="tracking-wide">ENTRAR EN ZOOM</span>
              <ExternalLink className="w-3 h-3 text-stone-800" />
            </button>
          )}

          {/* Dismiss button */}
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-sand-400 hover:text-white rounded-lg hover:bg-stone-800/80 transition-colors"
            aria-label="Cerrar aviso temporalmente"
            title="Cerrar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
