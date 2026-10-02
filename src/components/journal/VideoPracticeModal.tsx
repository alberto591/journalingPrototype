import React, { useState } from 'react';
import { Video, CheckCircle, X, Sparkles, Loader2 } from 'lucide-react';
import { useDataStore } from '../../lib/dataStore';

interface VideoPracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const VideoPracticeModal: React.FC<VideoPracticeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { saveJournalSession } = useDataStore();
  const [commitment, setCommitment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const finalCommitment = commitment.trim() || 'Práctica guiada completada por video';

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const result = await saveJournalSession({
        date: todayStr,
        breathing_completed: true,
        silence_duration_seconds: 300,
        gratitude_items: ['Sesión de práctica guiada en video'],
        free_writing_1m: 'Práctica realizada a través de sesión en video.',
        deep_writing_10m: 'Práctica realizada a través de sesión en video.',
        emotions: [{ category: 'ALEGRÍA', related_to: 'Práctica guiada en directo / video' }],
        listening_notes: 'Silencio y discernimiento realizados durante la sesión en video.',
        listening_duration_seconds: 300,
        vision_sentence: 'Completada a través de video',
        identity_words: 'Presencia',
        action_type: 'action',
        action_commitment: finalCommitment,
        total_duration_minutes: 30,
        status: 'completed',
      });

      if (result) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError('No se pudo guardar la sesión. Inténtalo de nuevo.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error inesperado al guardar la práctica.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-sand-200 relative animate-scale-up text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-sand-100 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Video className="w-4 h-4" />
          </div>
          <span className="text-xs uppercase font-bold tracking-wider text-bronze-700 bg-bronze-50 px-2.5 py-0.5 rounded-full border border-bronze-200">
            Práctica de Hoy
          </span>
        </div>

        <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 leading-tight">
          Práctica completada por video
        </h3>

        <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
          La práctica de hoy puede realizarse a través del formulario escrito o siguiendo la sesión guiada (en vivo o grabada). Si has completado la práctica en video, confírmalo aquí para registrar tu cumplimiento y actualizar tu racha diaria.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1.5">
              Tu compromiso o acción para hoy <span className="text-stone-400 font-normal">(opcional)</span>
            </label>
            <textarea
              value={commitment}
              onChange={(e) => setCommitment(e.target.value)}
              placeholder="Ej: Mantener la calma en la reunión de las 16:00 y no reaccionar impulsivamente..."
              rows={3}
              className="w-full p-3 rounded-2xl border border-sand-300 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 resize-none transition-all"
            />
            <p className="text-[11px] text-stone-500 mt-1">
              Si lo dejas en blanco, se guardará como <em>"Práctica guiada completada por video"</em>.
            </p>
          </div>

          {error && (
            <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-sand-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-sand-100 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto travesia-btn-primary py-2.5 px-5 text-xs font-bold flex items-center justify-center gap-2 shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Confirmar práctica por video</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
