import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, ArrowRight, Sparkles, AlertCircle, Eye, User } from 'lucide-react';

interface MovementActProps {
  // Vision & Identity (new — from Holy Work email)
  visionSentence: string;
  setVisionSentence: (text: string) => void;
  identityWords: string;
  setIdentityWords: (text: string) => void;
  // Action / Release (existing)
  actionType: 'action' | 'release';
  setActionType: (type: 'action' | 'release') => void;
  actionCommitment: string;
  setActionCommitment: (text: string) => void;
  onSave: () => void;
  onBack: () => void;
  isSaving?: boolean;
}

type Stage = 'vision' | 'identity' | 'action';

export const MovementAct: React.FC<MovementActProps> = ({
  visionSentence,
  setVisionSentence,
  identityWords,
  setIdentityWords,
  actionType,
  setActionType,
  actionCommitment,
  setActionCommitment,
  onSave,
  onBack,
  isSaving,
}) => {
  const [stage, setStage] = useState<Stage>('vision');
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

  const stageDefs: { key: Stage; label: string }[] = [
    { key: 'vision', label: 'Visión' },
    { key: 'identity', label: 'Identidad' },
    { key: 'action', label: 'Compromiso' },
  ];

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 animate-fade-in space-y-6">
      {/* Header */}
      <div className="text-center">
        <span className="text-xs uppercase font-semibold tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Movimiento 5 de 5 · Actuar
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 mt-2">
          De la reflexión al compromiso concreto.
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-lg mx-auto">
          Ancla tu acción en la visión de quién estás llamado a ser.
        </p>

        {/* Sub-step pills */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {stageDefs.map((s, idx) => {
            const isPast = stageDefs.findIndex(x => x.key === stage) > idx;
            const isCurrent = stage === s.key;
            return (
              <React.Fragment key={s.key}>
                <button
                  onClick={() => setStage(s.key)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    isCurrent
                      ? 'bg-stone-900 text-white shadow-sm'
                      : isPast
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-sand-100 text-stone-500'
                  }`}
                >
                  {s.label}
                </button>
                {idx < stageDefs.length - 1 && <span className="text-stone-300 text-xs">→</span>}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* STAGE 1: VISION */}
      {stage === 'vision' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-card space-y-5 animate-fade-in">
          <div className="flex items-center gap-2 pb-3 border-b border-sand-100">
            <div className="w-9 h-9 rounded-full bg-stone-900 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900">
                Tu Visión — El almuerzo en 3 meses
              </h3>
              <p className="text-[11px] text-stone-500 italic">
                Vuelve a leer y escribe esa frase de visión. Recuerda adónde vas.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-sm text-amber-900 leading-relaxed italic font-serif">
            "Si dentro de 3 meses alguien te invitara a un almuerzo y te preguntara cómo te fue, ¿qué historia querrías contarle?"
          </div>

          <textarea
            value={visionSentence}
            onChange={e => setVisionSentence(e.target.value)}
            placeholder="Escribe tu frase de visión aquí... 'En 3 meses, cuando alguien me invite a almorzar, voy a decirle que...'"
            rows={4}
            className="w-full p-4 rounded-2xl bg-sand-50/50 border border-sand-200 focus:border-stone-400 focus:bg-white text-stone-800 text-sm leading-relaxed resize-none focus:outline-none transition-all"
            autoFocus
          />

          <div className="flex items-center justify-between pt-2 border-t border-sand-100">
            <button
              onClick={onBack}
              className="text-xs text-stone-500 hover:text-stone-800 underline"
            >
              Volver a Escuchar
            </button>
            <button
              onClick={() => setStage('identity')}
              className="travesia-btn-primary text-xs py-2.5 px-5 flex items-center gap-2"
            >
              <span>CONTINUAR A IDENTIDAD</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: IDENTITY WORDS */}
      {stage === 'identity' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-card space-y-5 animate-fade-in">
          <div className="flex items-center gap-2 pb-3 border-b border-sand-100">
            <div className="w-9 h-9 rounded-full bg-stone-900 text-amber-400 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900">
                Tu(s) Palabra(s) de Identidad
              </h3>
              <p className="text-[11px] text-stone-500 italic">
                ¿Quién tienes que convertirte para moverte hacia esa visión?
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Tu visión de hoy:</p>
            {visionSentence.trim() ? (
              <p className="font-serif text-sm text-stone-800 italic leading-relaxed">
                "{visionSentence}"
              </p>
            ) : (
              <p className="text-xs text-stone-400 italic">No escribiste tu visión aún.</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 block">
              ¿Cuál es la palabra (o palabras) que describen en quién debes convertirte para vivir esa visión?
            </label>
            <p className="text-xs text-stone-500 italic">
              Ejemplos: "Presente · Disciplinado", "Valiente", "Hombre de palabra", "Fiel · Generoso".
            </p>
            <input
              type="text"
              value={identityWords}
              onChange={e => setIdentityWords(e.target.value)}
              placeholder="Escribe tu(s) palabra(s) de identidad..."
              className="w-full p-3.5 rounded-xl border border-sand-200 bg-sand-50/50 focus:border-stone-400 focus:bg-white text-stone-900 text-sm focus:outline-none transition-all"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-sand-100">
            <button
              onClick={() => setStage('vision')}
              className="text-xs text-stone-500 hover:text-stone-800 underline"
            >
              Volver a Visión
            </button>
            <button
              onClick={() => setStage('action')}
              className="travesia-btn-primary text-xs py-2.5 px-5 flex items-center gap-2"
            >
              <span>CONTINUAR AL COMPROMISO</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: ACTION / RELEASE (original logic preserved) */}
      {stage === 'action' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-card space-y-6 animate-fade-in">
          {/* Identity reminder strip */}
          {(identityWords.trim() || visionSentence.trim()) && (
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                {identityWords.trim() && (
                  <p className="text-xs font-bold text-stone-900 tracking-wide">
                    Identidad: "{identityWords}"
                  </p>
                )}
                {visionSentence.trim() && (
                  <p className="text-[11px] text-stone-500 italic line-clamp-2">
                    Visión: "{visionSentence}"
                  </p>
                )}
              </div>
            </div>
          )}

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
              onChange={e => { setActionCommitment(e.target.value); setError(null); }}
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
              onClick={() => setStage('identity')}
              className="text-xs text-stone-500 hover:text-stone-800 underline"
            >
              Volver a Identidad
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
      )}
    </div>
  );
};
