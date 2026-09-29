import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  JournalSession 
} from '../../types';
import { 
  CheckCircle, 
  Wind, 
  Heart, 
  Sparkles, 
  Flame, 
  Share2, 
  Lock, 
  ArrowRight, 
  Calendar,
  Clock,
  Copy,
  Check
} from 'lucide-react';
import { useDataStore } from '../../lib/dataStore';

interface JournalSummaryViewProps {
  session: JournalSession;
  onNewSession?: () => void;
}

export const JournalSummaryView: React.FC<JournalSummaryViewProps> = ({ session, onNewSession }) => {
  const navigate = useNavigate();
  const { createPost, channels } = useDataStore();
  const [copied, setCopied] = useState(false);
  const [sharedToCommunity, setSharedToCommunity] = useState(false);

  const handleCopySummary = () => {
    const text = `TRAVESÍA — Mi Reflexión de Hoy (${session.date})
• Emociones reconocidas: ${session.emotions.map(e => e.category).join(', ')}
• Lo que escuché: ${session.listening_notes || 'Silencio y oración'}
• Mi compromiso: "${session.action_commitment}"`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareCommitment = () => {
    const journalChannel = channels.find(c => c.slug === 'sesiones-de-diario') || channels[0];
    const postTitle = `Compromiso de hoy (${new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })})`;
    const content = `Acabo de completar mi práctica diaria de los 5 Movimientos.

Emociones nombradas hoy: **${session.emotions.map(e => e.category).join(', ')}**
${session.listening_notes ? `\nLo que reconocí en el silencio:\n> "${session.listening_notes}"\n` : ''}
Mi compromiso para hoy:
🎯 **"${session.action_commitment}"**

Rumbo a la noche sin evasivas. ¡Que tengan un día fecundo!`;

    createPost(journalChannel.id, postTitle, content, ['PrácticaDiaria', 'Compromiso']);
    setSharedToCommunity(true);
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 animate-fade-in space-y-6">
      {/* Top Banner: Completion celebration */}
      <div className="bg-stone-900 text-sand-50 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Práctica diaria completada con éxito</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
            Tu reflexión de hoy
          </h2>
          <p className="text-sand-300 text-xs sm:text-sm mt-1 max-w-lg leading-relaxed">
            Has cumplido con los cinco movimientos. Has frenado el ruido, desnudado la mente, nombrado tus emociones, escuchado en quietud y definido tu rumbo.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-6 text-xs text-sand-300 border-t border-stone-800 pt-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-bronze-400" />
              {new Date(session.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-bronze-400" />
              {session.total_duration_minutes || 30} minutos en quietud
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <Lock className="w-4 h-4" />
              100% Privado y Seguro
            </span>
          </div>
        </div>
      </div>

      {/* 5-Movement Retrospective Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-card space-y-8">
        {/* 1. Cómo llegaste */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-400">
            <Wind className="w-4 h-4 text-bronze-600" />
            <span>1. Cómo llegaste · Frenar</span>
          </div>
          <div className="p-4 rounded-2xl bg-sand-50/60 border border-sand-200 text-sm text-stone-700 leading-relaxed">
            <p>
              Completaste los 3 ciclos de respiración profunda (4s inhalar / 8s exhalar) y sostuviste {session.silence_duration_seconds} segundos de silencio santo con la oración de apertura.
            </p>
          </div>
        </div>

        {/* 2. Qué estaba ocupando tu mente */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-400">
            <Flame className="w-4 h-4 text-amber-600" />
            <span>2. Qué estaba ocupando tu mente · Limpiar el ruido</span>
          </div>
          <div className="space-y-3">
            {session.free_writing_1m && (
              <div className="p-4 rounded-2xl bg-sand-50/60 border border-sand-200">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide block mb-1">
                  Vaciado libre (1 min)
                </span>
                <p className="text-xs sm:text-sm text-stone-700 italic leading-relaxed">
                  "{session.free_writing_1m}"
                </p>
              </div>
            )}

            {session.focus_prompt_text && (
              <div className="p-4 rounded-2xl bg-sand-50/60 border border-sand-200">
                <span className="text-[11px] font-semibold text-bronze-700 block mb-1">
                  Pregunta de enfoque: "{session.focus_prompt_text}"
                </span>
                <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
                  {session.focus_prompt_answer || 'Sin respuesta grabada'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Qué sentiste */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-400">
            <Heart className="w-4 h-4 text-rose-600" />
            <span>3. Qué sentiste · Nombrar emociones</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {session.emotions.map((emo, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-sand-50/60 border border-sand-200 space-y-1">
                <span className="font-serif font-bold text-sm text-stone-900 block">
                  {emo.category}
                </span>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {emo.related_to || 'Reconocida sin explicación adjunta'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Qué escuchaste */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-400">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>4. Qué escuchaste · Escucha espiritual</span>
          </div>
          <div className="p-4 rounded-2xl bg-sand-50/60 border border-sand-200">
            <p className="font-serif text-sm sm:text-base text-stone-900 italic leading-relaxed">
              "{session.listening_notes || 'Permanecí en silencio reposando delante de Dios.'}"
            </p>
          </div>
        </div>

        {/* 5. Qué vas a hacer (El Compromiso) */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-400">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>5. Qué vas a hacer · Tu Compromiso de hoy</span>
          </div>
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-emerald-800 tracking-wider">
                {session.action_type === 'action' ? 'Acción Concreta' : 'Algo que Soltar'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-semibold">
                Compromiso Activo
              </span>
            </div>
            <p className="font-serif text-base sm:text-lg font-bold text-stone-900">
              "{session.action_commitment}"
            </p>
          </div>
        </div>

        {/* Share & Actions Toolbar */}
        <div className="pt-4 border-t border-sand-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopySummary}
              className="travesia-btn-secondary text-xs py-2 px-3 flex-1 sm:flex-none flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar resumen'}</span>
            </button>

            {!sharedToCommunity ? (
              <button
                onClick={handleShareCommitment}
                className="travesia-btn-secondary text-xs py-2 px-3 flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-bronze-800 hover:text-bronze-900"
                title="Publicar tu compromiso en el canal de comunidad 'Sesiones de diario' para rendición de cuentas"
              >
                <Share2 className="w-3.5 h-3.5 text-bronze-600" />
                <span>Compartir compromiso en comunidad</span>
              </button>
            ) : (
              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1 px-3 py-2">
                <Check className="w-3.5 h-3.5" /> Compartido en Comunidad
              </span>
            )}
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="travesia-btn-primary text-xs py-2.5 px-6 w-full sm:w-auto flex items-center justify-center gap-1.5"
          >
            <span>Volver al Inicio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
