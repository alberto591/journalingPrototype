import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, ArrowRight, Sparkles, AlertCircle, ArrowUpRight } from 'lucide-react';

interface MovementActProps {
  actionType: 'action' | 'release';
  setActionType: (type: 'action' | 'release') => void;
  actionCommitment: string;
  setActionCommitment: (text: string) => void;
  onSave: () => void;
  onBack: () => void;
  isSaving?: boolean;
}

export const MovementAct: React.FC<MovementActProps> = ({
  actionType,
  setActionType,
  actionCommitment,
  setActionCommitment,
  onSave,
  onBack,
  isSaving,
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleCommit = () => {
    if (!actionCommitment.trim()) {
      setError('Por favor define una acción o una renuncia concreta para el día de hoy.');
      return;
    }
    if (actionCommitment.trim().length < 8) {
      setError('Sé más específico: escribe una frase completa (ej: "Llamar a mi hermano a las 15:00").');
      return;
    }

    // Launch celebratory confetti for completing the 5 movements!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#B66E43', '#1C1917', '#E7C8B6', '#10B981']
      });
    } catch {
      // ignore
    }

    onSave();
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 animate-fade-in space-y-6">
      {/* Header Info */}
      <div className="text-center">
        <span className="text-xs uppercase font-semibold tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Movimiento 5 de 5 · Actuar
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 mt-2">
          De la reflexión al compromiso concreto.
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-lg mx-auto">
          La reflexión que no aterriza en el mundo real se disipa con el primer café. ¿Qué paso vas a dar en las próximas 24 horas?
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-card space-y-6">
        {/* Selection: Acción vs Algo que Soltar */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
            Elige el carácter de tu compromiso de hoy:
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => { setActionType('action'); setError(null); }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                actionType === 'action'
                  ? 'border-stone-900 bg-stone-900 text-white shadow-md'
                  : 'border-sand-200 bg-sand-50/50 hover:bg-sand-100 text-stone-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-serif font-bold text-base">
                  1. Acción deliberada
                </span>
                {actionType === 'action' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className={`text-xs ${actionType === 'action' ? 'text-sand-200' : 'text-stone-500'}`}>
                Un paso concreto que tú debes ejecutar hoy (llamada, límite, tarea difícil).
              </p>
            </button>

            <button
              type="button"
              onClick={() => { setActionType('release'); setError(null); }}
              className={`p-4 rounded-2xl border text-left transition-all ${
                actionType === 'release'
                  ? 'border-stone-900 bg-stone-900 text-white shadow-md'
                  : 'border-sand-200 bg-sand-50/50 hover:bg-sand-100 text-stone-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-serif font-bold text-base">
                  2. Algo que soltar
                </span>
                {actionType === 'release' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className={`text-xs ${actionType === 'release' ? 'text-sand-200' : 'text-stone-500'}`}>
                Una preocupación, control excesivo o rencor que decides entregar hoy a Dios.
              </p>
            </button>
          </div>
        </div>

        {/* Commitment Input Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-stone-700">
              {actionType === 'action' 
                ? '¿Cuál es una acción concreta y verificable que tomarás hoy?' 
                : '¿Qué peso, rencor o necesidad de control decides soltar hoy?'}
            </label>
            <span className="text-[11px] text-stone-400 italic">Obligatorio</span>
          </div>

          <textarea
            value={actionCommitment}
            onChange={(e) => { setActionCommitment(e.target.value); setError(null); }}
            placeholder={
              actionType === 'action'
                ? 'Ejemplo concreto: "Hoy a las 16:00 llamaré a mi hermano para pedirle disculpas", en lugar de "mejorar mis relaciones".'
                : 'Ejemplo concreto: "Hoy suelto la obsesión por el informe de la junta y no abriré el correo después de las 19:00."'
            }
            rows={4}
            className="w-full p-4 rounded-2xl bg-sand-50/50 border border-sand-200 focus:border-stone-400 focus:bg-white text-stone-900 text-sm leading-relaxed resize-none focus:outline-none transition-all"
            autoFocus
          />

          <div className="p-3 bg-sand-50 rounded-xl border border-sand-200 text-xs text-stone-600 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-bronze-600 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Criterio TRAVESÍA:</strong> Una buena acción diaria es aquella que al acostarte esta noche podrás decir con un rotundo sí o no si la cumpliste.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-sand-100">
          <button
            onClick={onBack}
            className="text-xs text-stone-500 hover:text-stone-800 underline"
          >
            Volver a Escuchar
          </button>

          <button
            onClick={handleCommit}
            disabled={isSaving}
            className="travesia-btn-primary w-full sm:w-auto py-3 px-8 text-sm font-semibold shadow-md flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{isSaving ? 'Guardando...' : 'GUARDAR MI COMPROMISO'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
