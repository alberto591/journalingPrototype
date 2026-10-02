import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ArrowRight, Wind, Heart, Sparkles, Plus, X, Check } from 'lucide-react';

interface MovementSlowDownProps {
  gratitudeItems: string[];
  setGratitudeItems: (items: string[]) => void;
  onComplete: () => void;
}

export const MovementSlowDown: React.FC<MovementSlowDownProps> = ({
  gratitudeItems,
  setGratitudeItems,
  onComplete,
}) => {
  // Phase 1: Guided Breathing (3 rounds: 4s inhale, 8s exhale = 12s per round = 36s total)
  // Phase 2: Silence & Prayer (60s countdown)
  // Phase 3: Gratitude (4 items from last 24h)
  const [phase, setPhase] = useState<'breathing' | 'silence' | 'gratitude'>('breathing');

  // Breathing states
  const [breathStage, setBreathStage] = useState<'inhala' | 'exhala'>('inhala');
  const [round, setRound] = useState(1);
  const [breathTimer, setBreathTimer] = useState(4);
  const [isBreathActive, setIsBreathActive] = useState(true);

  // Silence states
  const [silenceSeconds, setSilenceSeconds] = useState(60);
  const [isSilenceRunning, setIsSilenceRunning] = useState(true);

  // Gratitude state — four input fields
  const [localItems, setLocalItems] = useState<string[]>(() =>
    gratitudeItems.length > 0 ? [...gratitudeItems] : ['', '', '', '']
  );

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

  const handleUpdateItem = (index: number, value: string) => {
    const updated = [...localItems];
    updated[index] = value;
    setLocalItems(updated);
  };

  const handleContinue = () => {
    const filled = localItems.map(s => s.trim()).filter(Boolean);
    setGratitudeItems(filled);
    onComplete();
  };

  const filledCount = localItems.filter(s => s.trim().length > 0).length;

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

        {/* Phase Stepper Pills */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {(['breathing', 'silence', 'gratitude'] as const).map((p, idx) => {
            const labels = ['Respiración', 'Silencio', 'Gratitud'];
            const isPast = (
              (phase === 'silence' && p === 'breathing') ||
              (phase === 'gratitude' && (p === 'breathing' || p === 'silence'))
            );
            const isCurrent = phase === p;
            return (
              <React.Fragment key={p}>
                <button
                  onClick={() => {
                    if (p === 'breathing' || (p === 'silence') || (p === 'gratitude' && phase !== 'breathing')) {
                      setPhase(p);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    isCurrent
                      ? 'bg-stone-900 text-white shadow-sm'
                      : isPast
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-sand-100 text-stone-500'
                  }`}
                >
                  {isPast ? <span className="inline-flex items-center gap-1"><Check className="w-3 h-3 stroke-[3]" /> {labels[idx]}</span> : labels[idx]}
                </button>
                {idx < 2 && <span className="text-stone-300 text-xs">→</span>}
              </React.Fragment>
            );
          })}
        </div>
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
      ) : phase === 'silence' ? (
        /* PHASE 2: SILENCE TIMER + PRAYER */
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

          {/* Prayer block matching the Holy Work email */}
          <div className="my-5 p-5 rounded-2xl bg-sand-50 border border-sand-200/80 max-w-md text-stone-700 text-xs sm:text-sm leading-relaxed text-left space-y-2">
            <div className="flex items-center gap-1.5 text-bronze-700 font-semibold text-xs mb-1">
              <Heart className="w-3.5 h-3.5" />
              <span>Oración de inicio:</span>
            </div>
            <p className="italic font-serif text-stone-800 text-sm">
              "Buenos días, Padre. Aquí estoy.<br />
              Un ser humano imperfecto haciendo lo mejor por buscarte hoy.<br />
              No estoy seguro de si todo lo que voy a escribir es verdad,<br />
              pero es la verdad de lo que estoy pensando y sintiendo,<br />
              y te lo entrego todo a Ti.<br />
              Redime lo que deba ser redimido<br />
              y amplifica lo que deba ser amplificado.<br />
              Te entrego este tiempo a Ti.<br />
              Por favor sé mi guía y maestro. Amén."
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
              onClick={() => setPhase('gratitude')}
              className="travesia-btn-primary w-full sm:w-auto py-2.5 px-6 font-semibold shadow-md flex items-center justify-center gap-2"
            >
              <span>CONTINUAR A GRATITUD</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* PHASE 3: GRATITUDE — 4 specific things from last 24h */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-card space-y-5 animate-fade-in text-left">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-bronze-700 mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Gratitud</span>
            </div>
            <h3 className="font-serif font-bold text-xl text-stone-900">
              4 cosas concretas de las últimas 24 horas por las que estás agradecido.
            </h3>
            <p className="text-xs text-stone-500 mt-1 italic">
              Sé específico. No genérico. "La conversación con mi hijo en el desayuno", no "mi familia".
            </p>
          </div>

          <div className="space-y-3">
            {localItems.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center text-xs font-bold mt-0.5">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={item}
                  onChange={e => handleUpdateItem(idx, e.target.value)}
                  placeholder={[
                    'Primera cosa específica por la que estás agradecido...',
                    'Segunda cosa específica por la que estás agradecido...',
                    'Tercera cosa específica por la que estás agradecido...',
                    'Cuarta cosa específica por la que estás agradecido...',
                  ][idx]}
                  className={`flex-1 p-3 rounded-xl border text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none transition-all ${
                    item.trim()
                      ? 'border-emerald-300 bg-emerald-50/40 focus:border-emerald-500'
                      : 'border-sand-200 bg-sand-50/50 focus:border-stone-400 focus:bg-white'
                  }`}
                />
                {item.trim() && (
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mt-1.5">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-sand-100">
            <button
              onClick={() => setPhase('silence')}
              className="text-xs text-stone-500 hover:text-stone-800 underline"
            >
              Volver al silencio
            </button>
            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-400">
                {filledCount}/4 completadas
              </span>
              <button
                onClick={handleContinue}
                disabled={filledCount === 0}
                className={`travesia-btn-primary text-xs py-2.5 px-5 flex items-center gap-2 ${filledCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span>CONTINUAR AL MOVIMIENTO 2</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
