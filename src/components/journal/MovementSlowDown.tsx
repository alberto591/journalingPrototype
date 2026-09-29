import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ArrowRight, Wind, Heart } from 'lucide-react';

interface MovementSlowDownProps {
  onComplete: () => void;
}

export const MovementSlowDown: React.FC<MovementSlowDownProps> = ({ onComplete }) => {
  // Phase 1: Guided Breathing (3 rounds: 4s inhale, 8s exhale = 12s per round = 36s total)
  // Phase 2: Silence & Prayer (60s countdown)
  const [phase, setPhase] = useState<'breathing' | 'silence'>('breathing');
  
  // Breathing states
  const [breathStage, setBreathStage] = useState<'inhala' | 'exhala'>('inhala');
  const [round, setRound] = useState(1);
  const [breathTimer, setBreathTimer] = useState(4);
  const [isBreathActive, setIsBreathActive] = useState(true);

  // Silence states
  const [silenceSeconds, setSilenceSeconds] = useState(60);
  const [isSilenceRunning, setIsSilenceRunning] = useState(true);

  // Guided breathing loop
  useEffect(() => {
    if (phase !== 'breathing' || !isBreathActive) return;

    const interval = setInterval(() => {
      setBreathTimer(prev => {
        if (prev > 1) return prev - 1;

        if (breathStage === 'inhala') {
          setBreathStage('exhala');
          return 8; // 8 seconds exhale
        } else {
          if (round >= 3) {
            // Move to silence phase
            setPhase('silence');
            return 0;
          }
          setRound(r => r + 1);
          setBreathStage('inhala');
          return 4; // 4 seconds inhale
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, breathStage, round, isBreathActive]);

  // Silence timer loop
  useEffect(() => {
    if (phase !== 'silence' || !isSilenceRunning) return;

    const interval = setInterval(() => {
      setSilenceSeconds(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, isSilenceRunning]);

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 animate-fade-in text-center">
      {/* Header Info */}
      <div className="mb-6">
        <span className="text-xs uppercase font-semibold tracking-wider text-bronze-700 bg-bronze-50 px-3 py-1 rounded-full border border-bronze-200">
          Movimiento 1 de 5 · Frenar
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 mt-3">
          Baja el ruido exterior. Habita el presente.
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-lg mx-auto">
          Sal del modo reactivo. Desconecta de la urgencia del mundo y prepara tu corazón para mirar con honestidad.
        </p>
      </div>

      {phase === 'breathing' ? (
        /* PHASE 1: VISUAL BREATHING EXERCISE */
        <div className="bg-white rounded-3xl p-8 border border-sand-200 shadow-card flex flex-col items-center justify-center min-h-[380px]">
          <div className="text-xs font-medium text-stone-500 mb-6 flex items-center gap-1.5">
            <Wind className="w-4 h-4 text-bronze-600" />
            <span>Respiración de anclaje (Ronda {round} de 3)</span>
          </div>

          {/* Visual Pulsing Breathing Sphere */}
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center mb-6">
            <div 
              className={`absolute inset-0 rounded-full bg-gradient-to-tr from-sand-200 via-bronze-100 to-amber-200/50 transition-all duration-[3000ms] ${
                breathStage === 'inhala' ? 'scale-125 opacity-90 shadow-xl' : 'scale-75 opacity-40 shadow-none'
              }`}
            />
            <div 
              className={`absolute inset-4 rounded-full bg-white/80 backdrop-blur-sm border border-sand-300 flex flex-col items-center justify-center transition-all duration-1000`}
            >
              <span className="text-xs uppercase tracking-widest font-bold text-bronze-700">
                {breathStage === 'inhala' ? 'INHALA' : 'EXHALA'}
              </span>
              <span className="font-serif text-4xl sm:text-5xl font-bold text-stone-900 mt-1">
                {breathTimer}s
              </span>
              <span className="text-[11px] text-stone-400 mt-0.5">
                {breathStage === 'inhala' ? 'Por la nariz' : 'Lento y suave'}
              </span>
            </div>
          </div>

          <p className="text-xs text-stone-500 max-w-sm italic">
            "Suelta la tensión en hombros y mandíbula mientras exhalas el aire."
          </p>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => setIsBreathActive(!isBreathActive)}
              className="travesia-btn-secondary text-xs py-1.5 px-3"
            >
              {isBreathActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isBreathActive ? 'Pausar' : 'Reanudar'}
            </button>
            <button
              onClick={() => setPhase('silence')}
              className="text-xs text-stone-500 hover:text-stone-800 underline px-2 py-1"
            >
              Saltar al silencio →
            </button>
          </div>
        </div>
      ) : (
        /* PHASE 2: SILENCE TIMER + ORIGINAL PRAYER */
        <div className="bg-white rounded-3xl p-8 border border-sand-200 shadow-card flex flex-col items-center justify-center min-h-[380px] animate-fade-in">
          <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
            1 Minuto de Silencio Santo
          </div>

          <div className="font-mono text-4xl sm:text-5xl font-bold text-stone-900 tracking-wider my-4">
            00:{silenceSeconds < 10 ? `0${silenceSeconds}` : silenceSeconds}
          </div>

          <p className="font-serif text-base sm:text-lg text-stone-800 italic max-w-md my-2">
            "Quédate aquí.<br />No necesitas resolver nada todavía."
          </p>

          {/* Original Spanish Prayer */}
          <div className="my-5 p-5 rounded-2xl bg-sand-50 border border-sand-200/80 max-w-md text-stone-700 text-xs sm:text-sm leading-relaxed text-left space-y-2">
            <div className="flex items-center gap-1.5 text-bronze-700 font-semibold text-xs mb-1">
              <Heart className="w-3.5 h-3.5" />
              <span>Oración de inicio:</span>
            </div>
            <p className="italic font-serif text-stone-800 text-sm">
              "Señor, aquí estoy.<br />
              Ayúdame a bajar el ruido,<br />
              a mirar con honestidad lo que llevo dentro<br />
              y a reconocer aquello que me estás mostrando hoy.<br />
              Dame claridad para escuchar y valentía para actuar."
            </p>
          </div>

          {/* Timer Controls & Next Action */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-3 w-full sm:w-auto">
            {silenceSeconds > 0 && (
              <button
                onClick={() => setIsSilenceRunning(!isSilenceRunning)}
                className="travesia-btn-secondary text-xs py-2 px-4 w-full sm:w-auto"
              >
                {isSilenceRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isSilenceRunning ? 'Pausar silencio' : 'Reanudar'}
              </button>
            )}

            <button
              onClick={onComplete}
              className="travesia-btn-primary w-full sm:w-auto py-2.5 px-6 font-semibold shadow-md flex items-center justify-center gap-2"
            >
              <span>CONTINUAR</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
