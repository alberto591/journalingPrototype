import React, { useState } from 'react';
import { MessageSquareQuote, CheckCircle2, Heart, ArrowRight } from 'lucide-react';
import { feedbackService } from '../../services/feedbackService';
import { FeedbackMilestone } from '../../types';

interface FeedbackModalProps {
  userId: string;
  userName?: string;
  milestone: FeedbackMilestone;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  userId,
  userName,
  milestone,
  isOpen,
  onClose,
  onSubmitted,
}) => {
  const [mostUseful, setMostUseful] = useState<string>('');
  const [whatToChange, setWhatToChange] = useState<string>('');
  const [mindsetShift, setMindsetShift] = useState<string>('');
  const [wouldReturn, setWouldReturn] = useState<'yes' | 'maybe' | 'no'>('yes');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mostUseful || !mindsetShift) return;

    setIsSubmitting(true);
    await feedbackService.submitFeedback({
      userId,
      userName,
      dayMilestone: milestone,
      mostUseful,
      whatToChange,
      mindsetShift,
      wouldReturn,
    });
    setIsSubmitting(false);
    setIsDone(true);
    if (onSubmitted) onSubmitted();
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-sand-200 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-sand-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <MessageSquareQuote className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                Punto de Escucha · Hito Día {milestone}
              </span>
              <h3 className="font-serif font-bold text-lg text-stone-900">
                ¿Cómo está siendo tu experiencia?
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {isDone ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-serif font-bold text-lg text-stone-900">
              Gracias de corazón por tu sinceridad
            </h4>
            <p className="text-xs text-stone-600 max-w-xs mx-auto">
              Tus palabras ayudan a que TRAVESÍA siga siendo un santuario real de sobriedad y verdad.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-800 mb-1">
                1. ¿Qué te está resultando más útil de la práctica diaria?
              </label>
              <textarea
                rows={2}
                required
                value={mostUseful}
                onChange={e => setMostUseful(e.target.value)}
                placeholder="El silencio matutino, nombrar las emociones, la sala en directo..."
                className="travesia-input w-full"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-800 mb-1">
                2. ¿Qué cambiarías o qué te sobra?
              </label>
              <textarea
                rows={2}
                value={whatToChange}
                onChange={e => setWhatToChange(e.target.value)}
                placeholder="Cualquier fricción, duda técnica o aspecto que no encaja..."
                className="travesia-input w-full"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-800 mb-1">
                3. ¿Has notado algún cambio en cómo afrontas tus días?
              </label>
              <textarea
                rows={2}
                required
                value={mindsetShift}
                onChange={e => setMindsetShift(e.target.value)}
                placeholder="Mayor paz mental, menos reactividad con el móvil, claridad en una decisión..."
                className="travesia-input w-full"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-800 mb-1">
                4. ¿Volverías el próximo mes?
              </label>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { val: 'yes', label: 'Sí, seguro' },
                  { val: 'maybe', label: 'Quizás' },
                  { val: 'no', label: 'No' },
                ].map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setWouldReturn(opt.val as any)}
                    className={`py-2 px-3 rounded-xl font-semibold border text-center transition-all ${
                      wouldReturn === opt.val
                        ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                        : 'bg-sand-50 text-stone-700 border-sand-200 hover:bg-sand-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full travesia-btn-primary text-xs py-3 font-semibold shadow-md flex items-center justify-center gap-1.5"
              >
                <span>{isSubmitting ? 'Enviando...' : 'Enviar reflexiones'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
