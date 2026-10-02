import React, { useState, useEffect, useRef } from 'react';
import { SessionRecording, Profile } from '../../types';
import { useDataStore } from '../../lib/dataStore';
import { recordingsService } from '../../services/recordingsService';
import { X, Lock, Loader2, PlayCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecordingPlayerModalProps {
  recording: SessionRecording | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RecordingPlayerModal: React.FC<RecordingPlayerModalProps> = ({
  recording,
  isOpen,
  onClose,
}) => {
  const { currentUser } = useDataStore();
  const [playableUrl, setPlayableUrl] = useState<string | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState<boolean>(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!isOpen || !recording) {
      setPlayableUrl(null);
      setAccessError(null);
      setMediaError(null);
      setIsLoadingUrl(false);
      return;
    }

    let isMounted = true;

    async function loadSecureUrl() {
      setIsLoadingUrl(true);
      setAccessError(null);
      setMediaError(null);
      setPlayableUrl(null);

      // 1. Strict access check (ACTIVE/TRIAL or ADMIN/COACH)
      const access = recordingsService.checkAccess(currentUser, recording);
      if (!access.allowed) {
        if (isMounted) {
          setAccessError(access.message);
          setIsLoadingUrl(false);
        }
        return;
      }

      // 2. Request temporary signed URL (Do NOT expose raw storage URL)
      try {
        if (currentUser?.id) {
          recordingsService.trackReplayEvent(recording!.id, currentUser.id, 'replay_opened');
        }

        const { playableUrl: url, error } = await recordingsService.getSecurePlayableUrl(
          currentUser,
          recording!
        );

        if (isMounted) {
          if (error || !url) {
            setMediaError(error || 'No se pudo generar el enlace seguro de reproducción.');
          } else {
            setPlayableUrl(url);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setMediaError('Error inesperado al preparar la reproducción.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingUrl(false);
        }
      }
    }

    loadSecureUrl();

    return () => {
      isMounted = false;
    };
  }, [isOpen, recording, currentUser]);

  if (!isOpen || !recording) return null;

  const handleVideoPlay = () => {
    if (recording && currentUser?.id) {
      recordingsService.trackReplayEvent(recording.id, currentUser.id, 'replay_started');
    }
  };

  const handleVideoEnded = () => {
    if (recording && currentUser?.id && videoRef.current) {
      const duration = Math.round(videoRef.current.duration || 0);
      recordingsService.trackReplayEvent(recording.id, currentUser.id, 'replay_completed', duration);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-stone-950 text-sand-50 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-stone-800 space-y-4 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono font-bold text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-800/80">
                {recording.category || 'Grabación de Sesión'}
              </span>
              {recording.duration && (
                <span className="text-xs text-stone-400 font-mono">
                  {recording.duration}
                </span>
              )}
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
              {recording.title}
            </h3>
            {recording.date && (
              <p className="text-xs text-stone-400 font-mono">
                Emitida el {recording.date}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-2 rounded-xl hover:bg-stone-800 transition-colors"
            title="Cerrar reproductor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Container */}
        <div className="aspect-video rounded-2xl bg-stone-900 border border-stone-800 flex flex-col items-center justify-center relative overflow-hidden">
          {isLoadingUrl ? (
            <div className="flex flex-col items-center gap-3 text-stone-400">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
              <span className="text-xs font-mono">Generando enlace seguro de reproducción...</span>
            </div>
          ) : accessError ? (
            <div className="p-6 text-center space-y-3 max-w-md">
              <div className="w-12 h-12 rounded-2xl bg-amber-950/60 text-amber-400 flex items-center justify-center mx-auto border border-amber-800">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-white text-base">Acceso Exclusivo</h4>
              <p className="text-xs text-stone-300 leading-relaxed font-sans">{accessError}</p>
              {!currentUser?.id ? (
                <Link
                  to="/login"
                  className="travesia-btn-accent text-xs py-2 px-5 inline-block font-semibold mt-2"
                >
                  Iniciar Sesión
                </Link>
              ) : (
                <Link
                  to="/membership"
                  className="travesia-btn-accent text-xs py-2 px-5 inline-block font-semibold mt-2"
                >
                  Activar Membresía
                </Link>
              )}
            </div>
          ) : mediaError ? (
            <div className="p-6 text-center space-y-3 max-w-md">
              <div className="w-12 h-12 rounded-2xl bg-rose-950/60 text-rose-400 flex items-center justify-center mx-auto border border-rose-800">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-white text-base">Grabación no disponible</h4>
              <p className="text-xs text-stone-300 leading-relaxed font-sans">{mediaError}</p>
              {currentUser?.role === 'admin' && (
                <div className="pt-2 space-y-2">
                  <p className="text-[11px] text-amber-400/90 leading-relaxed">
                    Eres administrador: Asegúrate de que el archivo existe en el bucket <code className="text-white font-mono">session-recordings</code> de Supabase.
                  </p>
                  <Link
                    to="/admin?tab=events"
                    onClick={onClose}
                    className="travesia-btn-secondary text-xs py-2 px-4 inline-block font-bold mt-1"
                  >
                    Gestionar en Panel Admin
                  </Link>
                </div>
              )}
            </div>
          ) : playableUrl ? (
            <video
              ref={videoRef}
              controls
              autoPlay
              controlsList="nodownload"
              onPlay={handleVideoPlay}
              onEnded={handleVideoEnded}
              src={playableUrl}
              poster={recording.thumbnail_url}
              className="w-full h-full object-contain rounded-2xl bg-black"
            />
          ) : (
            <div className="text-center p-6 text-stone-400 text-xs font-mono">
              Grabación no disponible actualmente.
            </div>
          )}
        </div>

        {/* Description & Close */}
        {recording.description && (
          <p className="text-xs text-stone-300 leading-relaxed max-h-24 overflow-y-auto">
            {recording.description}
          </p>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="travesia-btn-secondary text-xs bg-stone-800 border-stone-700 text-stone-200 hover:bg-stone-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
