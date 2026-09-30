import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../../lib/dataStore';
import { analyticsService } from '../../services/analyticsService';
import { Lock, ArrowRight, X, ShieldCheck } from 'lucide-react';

interface MembershipAccessGateProps {
  isOpen: boolean;
  onClose: () => void;
  featureTitle?: string;
  sourceContext?: string;
}

export const MembershipAccessGate: React.FC<MembershipAccessGateProps> = ({
  isOpen,
  onClose,
  featureTitle,
  sourceContext = 'recording',
}) => {
  const navigate = useNavigate();
  const { currentUser } = useDataStore();
  const hasTrackedView = useRef(false);

  useEffect(() => {
    if (isOpen && !hasTrackedView.current) {
      hasTrackedView.current = true;
      analyticsService.track('expired_content_gate_viewed', {
        source_context: sourceContext,
        feature_title: featureTitle,
      }, currentUser?.id);
    }
    if (!isOpen) {
      hasTrackedView.current = false;
    }
  }, [isOpen, sourceContext, featureTitle, currentUser?.id]);

  if (!isOpen) return null;

  const handleContinue = () => {
    analyticsService.track('expired_content_gate_cta_clicked', {
      source_context: sourceContext,
      feature_title: featureTitle,
    }, currentUser?.id);
    onClose();
    navigate('/membership?from=access_gate');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-950/70 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="w-full max-w-md bg-white rounded-3xl border border-sand-200 shadow-2xl p-6 sm:p-8 space-y-6 relative animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-sand-100 hover:bg-sand-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Lock Icon */}
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center">
          <Lock className="w-6 h-6 text-amber-800" />
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1">
          <h3 className="font-serif font-bold text-2xl text-stone-900 leading-tight">
            Tus 7 días han terminado.
          </h3>
          <p className="text-xs uppercase tracking-wider font-bold text-bronze-700 font-mono">
            Este contenido forma parte de la membresía de Travesía.
          </p>
        </div>

        {featureTitle && (
          <div className="p-3 bg-sand-50 rounded-xl border border-sand-200 text-xs text-stone-700 font-medium">
            Elemento reservado: <strong className="text-stone-900 font-semibold">{featureTitle}</strong>
          </div>
        )}

        <div className="text-xs sm:text-sm text-stone-600 leading-relaxed space-y-2">
          <p>
            Tus diarios y reflexiones personales siguen a salvo en tu cuenta. Para acceder a las grabaciones en vídeo, unirte a las sesiones en directo o continuar con los capítulos mensuales, activa tu membresía fundadora.
          </p>
        </div>

        {/* Founding price badge */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-200">
          <span className="text-xs font-semibold text-amber-950 flex items-center gap-1.5 font-serif">
            <ShieldCheck className="w-4 h-4 text-amber-800" />
            Membresía fundadora
          </span>
          <span className="font-serif font-bold text-sm text-stone-900">
            29 € / mes
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row-reverse items-center gap-2 pt-2">
          <button
            onClick={handleContinue}
            className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span>CONTINUAR EN TRAVESÍA</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
};
