import React, { useState, useEffect } from 'react';
import { Play, Pause, ArrowRight, RotateCw, Sparkles, Clock, Check } from 'lucide-react';
import { DailyPrompt } from '../../types';
import { useDataStore } from '../../lib/dataStore';

interface MovementClearNoiseProps {
  freeWriting: string;
  setFreeWriting: (text: string) => void;
  deepWriting: string;
  setDeepWriting: (text: string) => void;
  focusPrompt: DailyPrompt;
  setFocusPrompt: (prompt: DailyPrompt) => void;
  focusAnswer: string;
  setFocusAnswer: (text: string) => void;
  onComplete: () => void;
}

export const MovementClearNoise: React.FC<MovementClearNoiseProps> = ({
  freeWriting,
  setFreeWriting,
  deepWriting,
  setDeepWriting,
  focusPrompt,
  setFocusPrompt,
  focusAnswer,
  setFocusAnswer,
  onComplete,
}) => {
  const { dailyPrompts } = useDataStore();

  // Sub-stages: 1 = Escritura Libre (1m), 2 = Escritura Profunda (10m), 3 = Pregunta de Enfoque (3m)
  const [stage, setStage] = useState<1 | 2 | 3>(1);

  // Timers
  const [timer1, setTimer1] = useState(60); // 1 minute
  const [isTimer1Running, setIsTimer1Running] = useState(true);

  const [timer2, setTimer2] = useState(600); // 10 minutes
  const [isTimer2Running, setIsTimer2Running] = useState(true);

  // Timer 1 loop
  useEffect(() => {
    if (stage !== 1 || !isTimer1Running) return;
    const interval = setInterval(() => {
      setTimer1(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [stage, isTimer1Running]);

  // Timer 2 loop
  useEffect(() => {
    if (stage !== 2 || !isTimer2Running) return;
    const interval = setInterval(() => {
      setTimer2(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [stage, isTimer2Running]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleRandomizePrompt = () => {
    const active = dailyPrompts.filter(p => p.active && p.id !== focusPrompt.id);
    if (active.length > 0) {
      const random = active[Math.floor(Math.random() * active.length)];
      setFocusPrompt(random);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 animate-fade-in">
      {/* Header Info */}
      <div className="text-center mb-6">
        <span className="text-xs uppercase font-semibold tracking-wider text-bronze-700 bg-bronze-50 px-3 py-1 rounded-full border border-bronze-200">
          Movimiento 2 de 5 · Limpiar el Ruido
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 mt-2">
          Saca los pensamientos de la cabeza al papel.
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-lg mx-auto">
          No corrijas. No intentes redactar bonito. Permite que la mente se vacíe sin juicios previos.
        </p>

        {/* Stage Pills */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setStage(1)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              stage === 1
                ? 'bg-stone-900 text-white shadow-sm'
                : freeWriting.trim()
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-sand-100 text-stone-600 hover:bg-sand-200'
            }`}
          >
            1. Vaciado Libre (1 min)
          </button>
          <span className="text-stone-300">→</span>
          <button
            onClick={() => setStage(2)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              stage === 2
                ? 'bg-stone-900 text-white shadow-sm'
                : deepWriting.trim()
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-sand-100 text-stone-600 hover:bg-sand-200'
            }`}
          >
            2. Escritura Profunda (10 min)
          </button>
          <span className="text-stone-300">→</span>
          <button
            onClick={() => setStage(3)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              stage === 3
                ? 'bg-stone-900 text-white shadow-sm'
                : focusAnswer.trim()
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-sand-100 text-stone-600 hover:bg-sand-200'
            }`}
          >
            3. Pregunta de Enfoque
          </button>
        </div>
      </div>

      {/* STAGE 1: ESCRITURA LIBRE (1 MINUTO) */}
      {stage === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-card space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sand-100">
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Ejercicio 1: Escritura Libre
              </h3>
              <p className="text-xs text-stone-500 italic mt-0.5">
                "Escribe todo lo que aparezca en tu mente. No corrijas. No edites. No intentes hacerlo bien."
              </p>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className={`font-mono font-bold text-sm px-2.5 py-1 rounded-lg border ${
                timer1 === 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-sand-100 text-stone-800 border-sand-200'
              }`}>
                {formatTimer(timer1)}
              </span>
              <button
                onClick={() => setIsTimer1Running(!isTimer1Running)}
                className="p-1.5 rounded-lg border border-sand-200 hover:bg-sand-100 text-stone-600"
                title={isTimer1Running ? 'Pausar' : 'Reanudar'}
              >
                {isTimer1Running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <textarea
            value={freeWriting}
            onChange={(e) => setFreeWriting(e.target.value)}
            placeholder="Comienza a teclear sin filtros... pendientes, preocupaciones, sensaciones físicas, lo primero que venga..."
            rows={8}
            className="w-full p-4 rounded-2xl bg-sand-50/50 border border-sand-200 focus:border-stone-400 focus:bg-white text-stone-800 text-sm leading-relaxed resize-none focus:outline-none transition-all"
            autoFocus
          />

          <div className="flex items-center justify-between text-xs text-stone-400 pt-2">
            <span>{freeWriting.trim() ? `${freeWriting.trim().split(/\s+/).length} palabras` : '0 palabras'}</span>
            <button
              onClick={() => setStage(2)}
              className="travesia-btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <span>Continuar a Escritura Profunda</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: ESCRITURA PROFUNDA (10 MINUTOS) */}
      {stage === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-card space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sand-100">
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Ejercicio 2: Escritura Profunda
              </h3>
              <p className="text-xs text-stone-500 italic mt-0.5">
                "Continúa escribiendo sin detenerte. No te preocupes por la gramática. Deja que aparezca lo que tenga que aparecer."
              </p>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className={`font-mono font-bold text-sm px-2.5 py-1 rounded-lg border ${
                timer2 === 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-sand-100 text-stone-800 border-sand-200'
              }`}>
                {formatTimer(timer2)}
              </span>
              <button
                onClick={() => setIsTimer2Running(!isTimer2Running)}
                className="p-1.5 rounded-lg border border-sand-200 hover:bg-sand-100 text-stone-600"
                title={isTimer2Running ? 'Pausar' : 'Reanudar'}
              >
                {isTimer2Running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <textarea
            value={deepWriting}
            onChange={(e) => setDeepWriting(e.target.value)}
            placeholder="Profundiza: ¿Qué te está inquietando en verdad? ¿Qué pasó ayer? ¿Qué conversaciones pendientes siguen dando vueltas? Deja que la mano guíe al pensamiento..."
            rows={12}
            className="w-full p-4 rounded-2xl bg-sand-50/50 border border-sand-200 focus:border-stone-400 focus:bg-white text-stone-800 text-sm leading-relaxed resize-none focus:outline-none transition-all"
            autoFocus
          />

          <div className="flex items-center justify-between text-xs text-stone-400 pt-2">
            <span>{deepWriting.trim() ? `${deepWriting.trim().split(/\s+/).length} palabras` : '0 palabras'}</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStage(1)}
                className="text-stone-500 hover:text-stone-800 underline"
              >
                Volver
              </button>
              <button
                onClick={() => setStage(3)}
                className="travesia-btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
              >
                <span>Pregunta de Enfoque</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 3: PREGUNTA DE ENFOQUE */}
      {stage === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-card space-y-5 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-sand-100">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-bronze-700 bg-bronze-50 px-2.5 py-0.5 rounded-full border border-bronze-200">
                Pilar: {focusPrompt.category} · Semana {focusPrompt.week}
              </span>
              <h3 className="font-serif font-bold text-lg text-stone-900 mt-2">
                Ejercicio 3: Pregunta de Enfoque del Día
              </h3>
            </div>
            <button
              onClick={handleRandomizePrompt}
              className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 p-2 rounded-lg hover:bg-sand-100 transition-colors"
              title="Cambiar pregunta"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Otra pregunta</span>
            </button>
          </div>

          {/* Prompt Highlight Box */}
          <div className="p-5 rounded-2xl bg-sand-100/70 border border-sand-200 text-stone-900">
            <p className="font-serif text-lg sm:text-xl font-medium leading-relaxed italic text-stone-900">
              "{focusPrompt.prompt_text}"
            </p>
          </div>

          <textarea
            value={focusAnswer}
            onChange={(e) => setFocusAnswer(e.target.value)}
            placeholder="Responde con crudeza y franqueza... sin justificaciones diplomáticas..."
            rows={6}
            className="w-full p-4 rounded-2xl bg-sand-50/50 border border-sand-200 focus:border-stone-400 focus:bg-white text-stone-800 text-sm leading-relaxed resize-none focus:outline-none transition-all"
            autoFocus
          />

          <div className="flex items-center justify-between text-xs text-stone-400 pt-2">
            <button
              onClick={() => setStage(2)}
              className="text-stone-500 hover:text-stone-800 underline"
            >
              Volver a escritura profunda
            </button>
            <button
              onClick={onComplete}
              className="travesia-btn-primary text-xs py-2.5 px-5 flex items-center gap-2"
            >
              <span>PASAR AL MOVIMIENTO 3 (SENTIR)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
