import React, { useState } from 'react';
import { EmotionCategory, EmotionSelection } from '../../types';
import { EMOTIONS_CATALOG } from '../../lib/dailyPromptsData';
import { ArrowRight, Check, AlertCircle } from 'lucide-react';

interface MovementFeelEmotionsProps {
  selectedEmotions: EmotionSelection[];
  setSelectedEmotions: (emotions: EmotionSelection[]) => void;
  onComplete: () => void;
  onBack: () => void;
}

export const MovementFeelEmotions: React.FC<MovementFeelEmotionsProps> = ({
  selectedEmotions,
  setSelectedEmotions,
  onComplete,
  onBack,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Toggle emotion category selection
  const handleToggleEmotion = (cat: EmotionCategory) => {
    setErrorMessage(null);
    const existing = selectedEmotions.find(e => e.category === cat);
    if (existing) {
      setSelectedEmotions(selectedEmotions.filter(e => e.category !== cat));
    } else {
      if (selectedEmotions.length >= 4) {
        setErrorMessage('Te recomendamos seleccionar como máximo 3 o 4 emociones para no dispersar tu atención.');
        return;
      }
      setSelectedEmotions([...selectedEmotions, { category: cat, related_to: '' }]);
    }
  };

  // Update related_to text for specific emotion
  const handleUpdateRelated = (cat: EmotionCategory, text: string) => {
    setSelectedEmotions(
      selectedEmotions.map(e => e.category === cat ? { ...e, related_to: text } : e)
    );
  };

  const handleProceed = () => {
    if (selectedEmotions.length === 0) {
      setErrorMessage('Por favor, selecciona al menos 1 o 2 emociones que sientas presentes hoy.');
      return;
    }
    // Check if at least one explanation has been provided
    const hasAnyContent = selectedEmotions.some(e => e.related_to.trim().length > 0);
    if (!hasAnyContent) {
      setErrorMessage('Por favor, escribe brevemente qué persona o situación despierta esta emoción antes de continuar.');
      return;
    }
    onComplete();
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 animate-fade-in space-y-6">
      {/* Header Info */}
      <div className="text-center">
        <span className="text-xs uppercase font-semibold tracking-wider text-bronze-700 bg-bronze-50 px-3 py-1 rounded-full border border-bronze-200">
          Movimiento 3 de 5 · Sentir lo que sientes
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-stone-900 mt-2">
          Nombra tus emociones. No intentes arreglarlas.
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-lg mx-auto">
          El objetivo aquí es la conciencia honesta, no la solución inmediata. Identifica lo que está vivo en tu cuerpo en este instante.
        </p>
      </div>

      {/* Emotion Selector Cards */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-card space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
            Paso 1: ¿Qué emociones están presentes hoy? (Selecciona de 1 a 3)
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {EMOTIONS_CATALOG.map(item => {
              const isSelected = selectedEmotions.some(e => e.category === item.category);
              return (
                <button
                  key={item.category}
                  type="button"
                  onClick={() => handleToggleEmotion(item.category)}
                  className={`p-3 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between min-h-[90px] relative ${
                    isSelected
                      ? 'border-stone-900 bg-stone-900 text-white shadow-md scale-[1.02]'
                      : 'border-sand-200 bg-sand-50/50 hover:bg-sand-100/70 text-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-serif font-bold text-sm tracking-wide">
                      {item.category}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-white text-stone-900 flex items-center justify-center text-xs font-bold">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] mt-2 line-clamp-2 leading-tight ${isSelected ? 'text-sand-200' : 'text-stone-500'}`}>
                    {item.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 2: Deep Exploration per Selected Emotion */}
        {selectedEmotions.length > 0 && (
          <div className="pt-4 border-t border-sand-200 space-y-4 animate-fade-in">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
              Paso 2: ¿Qué persona, situación o parte de tu vida está detrás de cada una?
            </label>

            <div className="space-y-4">
              {selectedEmotions.map(sel => {
                const info = EMOTIONS_CATALOG.find(c => c.category === sel.category)!;
                return (
                  <div key={sel.category} className="p-4 rounded-2xl bg-sand-50/60 border border-sand-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-sm text-stone-900">
                        {sel.category}
                      </span>
                      <span className="text-xs text-bronze-700 italic font-medium">
                        {info.prompt}
                      </span>
                    </div>
                    <textarea
                      value={sel.related_to}
                      onChange={(e) => handleUpdateRelated(sel.category, e.target.value)}
                      placeholder={`Escribe con honestidad: ¿Qué ocurrió? ¿Con quién? ¿Qué pensamiento te produce este sentimiento?`}
                      rows={3}
                      className="w-full p-3 rounded-xl bg-white border border-sand-200 focus:border-stone-400 text-stone-800 text-sm leading-relaxed resize-none focus:outline-none"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-sand-100">
          <button
            onClick={onBack}
            className="text-xs text-stone-500 hover:text-stone-800 underline"
          >
            Volver a Limpiar el Ruido
          </button>
          <button
            onClick={handleProceed}
            className="travesia-btn-primary text-xs py-2.5 px-5 flex items-center gap-2"
          >
            <span>PASAR AL MOVIMIENTO 4 (ESCUCHAR)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
