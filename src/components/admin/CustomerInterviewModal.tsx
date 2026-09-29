import React, { useState } from 'react';
import { CustomerInterview, Profile } from '../../types';
import { interviewAndLogService } from '../../services/interviewAndLogService';
import { CheckCircle2, MessageSquare, X, Star } from 'lucide-react';

interface Props {
  member: Profile | null;
  onClose: () => void;
  onSaved: (interview: CustomerInterview) => void;
}

export const CustomerInterviewModal: React.FC<Props> = ({ member, onClose, onSaved }) => {
  const [whatMadeYouJoin, setWhatMadeYouJoin] = useState('');
  const [whatExpected, setWhatExpected] = useState('');
  const [mostValuable, setMostValuable] = useState('');
  const [hardestPart, setHardestPart] = useState('');
  const [whatMadeYouReturn, setWhatMadeYouReturn] = useState('');
  const [whatAlmostMadeYouQuit, setWhatAlmostMadeYouQuit] = useState('');
  const [whatWouldYouChange, setWhatWouldYouChange] = useState('');
  const [wouldPayAgain, setWouldPayAgain] = useState<'yes' | 'maybe' | 'no'>('yes');
  const [fairPriceOpinion, setFairPriceOpinion] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const interview = await interviewAndLogService.submitInterview({
        user_id: member.id,
        user_name: member.name,
        what_made_you_join: whatMadeYouJoin,
        what_expected: whatExpected,
        most_valuable: mostValuable,
        hardest_part: hardestPart,
        what_made_you_return: whatMadeYouReturn,
        what_almost_made_you_quit: whatAlmostMadeYouQuit,
        what_would_you_change: whatWouldYouChange,
        would_pay_again: wouldPayAgain,
        fair_price_opinion: fairPriceOpinion,
        would_recommend: wouldRecommend,
      });

      onSaved(interview);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-sand-200 shadow-2xl space-y-6 my-8">
        <div className="flex items-center justify-between border-b border-sand-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700">
                Entrevista Cualitativa de Validación
              </span>
              <h3 className="font-serif font-bold text-xl text-stone-900">
                Feedback de {member.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <p className="text-stone-600 leading-relaxed text-[11px] bg-sand-50 p-3 rounded-xl border border-sand-200">
            Este cuestionario recoge la verdad cruda de los primeros 10 miembros para ajustar el producto a comportamientos reales, no a hipótesis teóricas.
          </p>

          <div className="space-y-1">
            <label className="block font-semibold text-stone-800">
              1. ¿Qué te hizo apuntarte?
            </label>
            <textarea
              required
              rows={2}
              value={whatMadeYouJoin}
              onChange={e => setWhatMadeYouJoin(e.target.value)}
              placeholder="Ej. El agotamiento mental de no tener foco por las mañanas..."
              className="travesia-input w-full font-serif"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-stone-800">
              2. ¿Qué esperabas encontrar?
            </label>
            <textarea
              required
              rows={2}
              value={whatExpected}
              onChange={e => setWhatExpected(e.target.value)}
              placeholder="Ej. Esperaba una serie de videos grabados o un curso de productividad..."
              className="travesia-input w-full font-serif"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-stone-800">
              3. ¿Qué fue lo más valioso?
            </label>
            <textarea
              required
              rows={2}
              value={mostValuable}
              onChange={e => setMostValuable(e.target.value)}
              placeholder="Ej. La sesión en vivo de las 07:00 AM y el compromiso de escribir con otros..."
              className="travesia-input w-full font-serif"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-stone-800">
              4. ¿Qué parte te costó más?
            </label>
            <textarea
              required
              rows={2}
              value={hardestPart}
              onChange={e => setHardestPart(e.target.value)}
              placeholder="Ej. El Movimiento 4: mantener 2 minutos de silencio sin mirar el móvil..."
              className="travesia-input w-full font-serif"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-stone-800">
              5. ¿Qué te hizo volver?
            </label>
            <textarea
              required
              rows={2}
              value={whatMadeYouReturn}
              onChange={e => setWhatMadeYouReturn(e.target.value)}
              placeholder="Ej. La sensación de sobriedad y serenidad al iniciar el trabajo..."
              className="travesia-input w-full font-serif"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-stone-800">
              6. ¿Qué casi hizo que abandonaras?
            </label>
            <textarea
              required
              rows={2}
              value={whatAlmostMadeYouQuit}
              onChange={e => setWhatAlmostMadeYouQuit(e.target.value)}
              placeholder="Ej. El día que no pude asistir en vivo a las 07:00 AM..."
              className="travesia-input w-full font-serif"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-stone-800">
              7. ¿Qué cambiarías?
            </label>
            <textarea
              required
              rows={2}
              value={whatWouldYouChange}
              onChange={e => setWhatWouldYouChange(e.target.value)}
              placeholder="Ej. Permitir exportar mis notas en Markdown o recordatorio 15 min antes..."
              className="travesia-input w-full font-serif"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label className="block font-semibold text-stone-800">
                8. ¿Pagarías de nuevo el próximo mes?
              </label>
              <select
                value={wouldPayAgain}
                onChange={e => setWouldPayAgain(e.target.value as any)}
                className="travesia-input w-full"
              >
                <option value="yes">Sí, sin dudarlo</option>
                <option value="maybe">Quizás, según el horario</option>
                <option value="no">No por ahora</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-stone-800">
                9. ¿Qué precio sentirías justo?
              </label>
              <input
                type="text"
                required
                value={fairPriceOpinion}
                onChange={e => setFairPriceOpinion(e.target.value)}
                placeholder="Ej. 29€/mes está perfecto / 35€/mes"
                className="travesia-input w-full"
              />
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-800">
              <input
                type="checkbox"
                checked={wouldRecommend}
                onChange={e => setWouldRecommend(e.target.checked)}
                className="rounded border-sand-300 text-amber-600 focus:ring-amber-500"
              />
              <span>10. ¿Recomendarías Travesía a un amigo o colega? (Yes/No)</span>
            </label>
          </div>

          <div className="pt-4 border-t border-sand-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="travesia-btn-secondary text-xs py-2.5 px-4"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="travesia-btn-primary text-xs py-2.5 px-6 font-bold shadow-md flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Guardando...' : 'Guardar Entrevista de Validación'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
