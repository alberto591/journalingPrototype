import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { referralService } from '../services/referralService';
import { analyticsService } from '../services/analyticsService';
import { Compass } from 'lucide-react';

export const ReferralHandlerPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) {
      // 1. Record referral click in localStorage and session
      referralService.recordReferralClick(code);
      // 2. Track analytics event
      analyticsService.track('landing_view', { source: 'Referral', referralCode: code });
    }

    // 3. Smoothly redirect to the free trial page with attribution
    const timer = setTimeout(() => {
      navigate('/prueba', { replace: true });
    }, 400);

    return () => clearTimeout(timer);
  }, [code, navigate]);

  return (
    <div className="min-h-screen bg-stone-950 text-sand-50 flex flex-col items-center justify-center p-4 space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center animate-pulse">
        <Compass className="w-6 h-6 text-amber-400" />
      </div>
      <p className="font-serif text-lg text-sand-100">
        Conectando invitación de miembro...
      </p>
      <p className="text-xs text-stone-400 font-mono">
        Código: {code}
      </p>
    </div>
  );
};
