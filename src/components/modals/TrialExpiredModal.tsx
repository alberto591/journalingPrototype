import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDataStore } from '../../lib/dataStore';
import { analyticsService } from '../../services/analyticsService';
import { Compass, CheckCircle2, ShieldCheck, X, ArrowRight } from 'lucide-react';

const SESSION_DISMISSED_KEY = 'travesia_trial_expired_dismissed';

export const TrialExpiredModal: React.FC = () => {
  const { isAuthenticated, currentUser } = useDataStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const hasTrackedView = useRef(false);

  useEffect(() => {
    // Only show if:
    // 1. Authenticated
    // 2. membership_status === 'EXPIRED'
    // 3. Not currently on the membership pricing page
    // 4. Has not been dismissed in this browser session
    const isExpired = currentUser?.membership_status === 'EXPIRED';
    const isMembershipPage = location.pathname === '/membership';
    const isDismissed = typeof sessionStorage !== 'undefined' 
      ? sessionStorage.getItem(SESSION_DISMISSED_KEY) === 'true'
      : false;

    if (isAuthenticated && isExpired && !isMembershipPage && !isDismissed) {
      setIsOpen(true);
      if (!hasTrackedView.current) {
        hasTrackedView.current = true;
        analyticsService.track('trial_expired_modal_viewed', {
          source: location.pathname,
          days_in_platform: currentUser?.streak_days || 7,
        }, currentUser.id);
      }
    } else {
      setIsOpen(false);
    }
  }, [isAuthenticated, currentUser?.membership_status, currentUser?.id, currentUser?.streak_days, location.pathname]);

  if (!isOpen) {
    return null;
  }

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(SESSION_DISMISSED_KEY, 'true');
    } catch {}
    analyticsService.track('trial_expired_modal_dismissed', {
      source: location.pathname,
    }, currentUser?.id);
    setIsOpen(false);
  };

  const handleContinue = () => {
    try {
      sessionStorage.setItem(SESSION_DISMISSED_KEY, 'true');
    } catch {}
    analyticsService.track('trial_expired_modal_cta_clicked', {
      source: location.pathname,
      target: '/membership',
    }, currentUser?.id);
    setIsOpen(false);
    navigate('/membership?from=trial_expired');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-950/70 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trial-expired-title"
    >
      <div 
        className="w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-3xl border border-sand-200 shadow-2xl p-6 sm:p-8 space-y-6 relative animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-sand-100 hover:bg-sand-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Calm Icon & Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center flex-shrink-0">
            <Compass className="w-5 h-5 text-amber-800" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/80">
              Reto de 7 Días Completado
            </span>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1.5">
          <h2 id="trial-expired-title" className="font-serif font-bold text-2xl sm:text-3xl text-stone-900 leading-tight">
            Han terminado tus 7 días.
          </h2>
          <p className="text-sm font-serif italic text-amber-900/90 leading-snug">
            Ya has probado la práctica. Ahora puedes seguir haciéndola acompañado.
          </p>
        </div>

        {/* Narrative & Reassurance: What they keep vs What requires membership */}
        <div className="space-y-3 text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
          <p>
            Tu prueba gratuita ha terminado, pero <strong className="text-stone-900 font-semibold">tus diarios y reflexiones personales siguen siendo tuyos</strong> y permanecen guardados intactos en tu cuenta.
          </p>
          <p>
            Con una membresía activa vuelves a tener acceso a las sesiones en directo, las grabaciones, los nuevos ciclos y la comunidad.
          </p>
        </div>

        {/* What is included bullet summary */}
        <div className="p-4 rounded-2xl bg-sand-50/80 border border-sand-200 space-y-2 text-xs text-stone-700">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-stone-500 block mb-1">
            Lo que incluye la membresía
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Sesiones en directo (Zoom)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Hemeroteca de grabaciones</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Nuevos ciclos mensuales</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Comunidad de silencio</span>
            </div>
          </div>
        </div>

        {/* Pricing Notice */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-800 flex-shrink-0" />
            <span className="text-xs font-semibold text-amber-950 font-serif">
              Miembro fundador
            </span>
          </div>
          <span className="font-serif font-bold text-base text-stone-900">
            29 €<span className="text-xs font-normal text-stone-500"> / mes</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row-reverse items-center gap-3">
          <button
            onClick={handleContinue}
            className="w-full sm:flex-1 py-3 px-6 rounded-2xl bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span>CONTINUAR EN TRAVESÍA</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>

          <button
            onClick={handleDismiss}
            className="w-full sm:w-auto py-3 px-5 rounded-2xl text-xs font-semibold text-stone-500 hover:text-stone-800 hover:bg-sand-100 transition-colors"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
};
