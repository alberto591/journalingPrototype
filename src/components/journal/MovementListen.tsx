import React, { useState, useEffect } from 'react';
import { Play, Pause, ArrowRight, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface MovementListenProps {
  listeningNotes: string;
  setListeningNotes: (text: string) => void;
  onComplete: () => void;
  onBack: () => void;
}

export const MovementListen: React.FC<MovementListenProps> = ({
  listeningNotes,
  setListeningNotes,
  onComplete,
  onBack,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(90); // 90 seconds
  const [isRunning, setIsRunning] = useState(true);
  const [ambientSound, setAmbientSound] = useState(false);

  // 90s countdown timer
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 animate-fade-in space-y-6">
      {/* Header Info */}
      <div className="text-center">
        <span className="text-xs uppercase font-semibold tracking-wider text-bronze-700 bg-bronze-50 px-3 py-1 rounded-full border border-bronze-200">
          Movimiento 4 de 5 · Escuchar
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 mt-2">
          Ahora no intentes resolverlo.
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-lg mx-auto">
          Pasa del análisis mental a la quietud y escucha espiritual. Pon tus escritos en las manos de Dios y atiende lo que surja en el silencio.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-card space-y-6">
        {/* Stillness & Silence Timer Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-sand-50/80 border border-sand-200 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-900 text-amber-400 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                Tiempo de Escucha en Silencio
              </p>
              <p className="text-[11px] text-stone-500">
                {secondsLeft > 0 ? 'Respira despacio y permite que las palabras reposen' : 'Tiempo de silencio completado'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-2xl font-bold text-stone-900 tracking-wider">
              {formatTimer(secondsLeft)}
            </span>
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="p-1.5 rounded-lg border border-sand-200 hover:bg-sand-200/60 text-stone-700"
              title={isRunning ? 'Pausar' : 'Reanudar'}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Central Reflective Prompt */}
        <div className="p-6 rounded-2xl bg-sand-100/60 border border-sand-200 text-center space-y-2">
          <p className="text-xs uppercase font-bold tracking-widest text-bronze-700">
            Pregunta de Escucha Espiritual
          </p>
          <p className="font-serif text-xl sm:text-2xl font-medium text-stone-900 leading-snug">
            "Después de todo lo que has escrito hoy,<br />
            ¿qué crees que Dios quiere mostrarte?"
          </p>
          <p className="text-xs text-stone-500 italic pt-1">
            Escribe sin forzar una interpretación teológica perfecta. Deja que hable la convicción más profunda de tu corazón.
          </p>
        </div>

        {/* Reflection Notes Textarea */}
        <div>
          <label className="block text-xs font-semibold text-stone-500 mb-1.5">
            Tus impresiones, verdades reconocidas o palabra interior:
          </label>
          <textarea
            value={listeningNotes}
            onChange={(e) => setListeningNotes(e.target.value)}
            placeholder="Siento que Dios me está llamando a soltar... me doy cuenta de que he estado actuando por miedo a... la verdad que necesito aceptar es..."
            rows={7}
            className="w-full p-4 rounded-2xl bg-sand-50/50 border border-sand-200 focus:border-stone-400 focus:bg-white text-stone-800 text-sm leading-relaxed resize-none focus:outline-none transition-all"
            autoFocus
          />
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-sand-100">
          <button
            onClick={onBack}
            className="text-xs text-stone-500 hover:text-stone-800 underline"
          >
            Volver a Sentir
          </button>
          <button
            onClick={onComplete}
            className="travesia-btn-primary text-xs py-2.5 px-5 flex items-center gap-2"
          >
            <span>PASAR AL MOVIMIENTO 5 (ACTUAR)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
