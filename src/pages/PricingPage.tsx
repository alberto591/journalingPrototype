import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Compass, 
  ShieldCheck, 
  HelpCircle,
  CreditCard,
  Building,
  Lock,
  Flame,
  Calendar,
  Clock,
  Users
} from 'lucide-react';
import { useDataStore } from '../lib/dataStore';
import { businessService, DEFAULT_BUSINESS_SETTINGS } from '../services/businessService';
import { analyticsService } from '../services/analyticsService';
import { BusinessSettings } from '../types';

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { members } = useDataStore();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_BUSINESS_SETTINGS);
  const [showManualTransferModal, setShowManualTransferModal] = useState<boolean>(false);

  useEffect(() => {
    businessService.getSettings().then(setSettings);
    analyticsService.track('membership_page_viewed', {});
  }, []);

  // Real database calculation: 20 - active_founders (never hardcoded)
  const activeFoundersCount = members.filter(m => m.membership_status === 'ACTIVE' || m.role === 'admin').length;
  const remainingPlaces = Math.max(1, (settings.limited_seats_count || 20) - activeFoundersCount);

  const monthlyPrice = settings.founding_membership_price_monthly;
  const standardPrice = settings.standard_membership_price_monthly;
  // Annual price with discount months
  const annualTotal = monthlyPrice * (12 - settings.annual_discount_months);
  const annualEquivalentMonthly = Math.round(annualTotal / 12);

  const handleCheckoutClick = async (tier: string) => {
    await analyticsService.track('checkout_started', {
      tier,
      billingCycle,
      price: billingCycle === 'annual' ? annualTotal : monthlyPrice,
    });
    // In Business Experiment Mode with manual payments, open payment instructions or register
    setShowManualTransferModal(true);
  };

  return (
    <div className="min-h-screen bg-sand-50 text-stone-900 font-sans selection:bg-amber-200">
      {/* Top Header */}
      <header className="bg-stone-950 border-b border-stone-800 text-sand-50 h-16 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Compass className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-serif font-bold text-base tracking-wider text-sand-50">TRAVESÍA</span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => navigate('/prueba')}
            className="text-sand-300 hover:text-white font-medium transition-colors"
          >
            Reto Gratuito 7 Días
          </button>
          <button
            onClick={() => navigate('/login')}
            className="travesia-btn-secondary text-xs py-1.5 px-3"
          >
            Entrar
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-12">
        {/* Title & Positioning */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700 bg-amber-100 px-3.5 py-1 rounded-full">
            Gimnasio de Claridad Personal
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 leading-tight">
            Una inversión diaria en sobriedad y discernimiento
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Menos que un café al día. Acceso completo a las sesiones en vivo de lunes a viernes, al diario con los 5 Movimientos, al currículo mensual y a una comunidad sin cinismo.
          </p>

          {/* Billing Toggle */}
          <div className="pt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`text-xs py-2 px-4 rounded-xl font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-sand-200 text-stone-600 hover:bg-sand-300'
              }`}
            >
              Facturación Mensual
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`text-xs py-2 px-4 rounded-xl font-semibold transition-all relative ${
                billingCycle === 'annual'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-sand-200 text-stone-600 hover:bg-sand-300'
              }`}
            >
              Anual (2 meses gratis)
              <span className="ml-1.5 text-[10px] font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded-full">
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-3xl mx-auto">
          {/* Card 1: Membresía Estándar (Referencia futura) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">
                  Acceso Estándar
                </span>
                <h3 className="font-serif font-bold text-xl text-stone-900 mt-1">
                  Membresía Ordinaria
                </h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="font-serif text-3xl font-bold text-stone-900">{standardPrice}€</span>
                  <span className="text-xs text-stone-500">/ mes</span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Precio regular una vez completada la cuota inicial de fundadores.
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-stone-600 border-t border-sand-100 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-stone-400 flex-shrink-0" />
                  <span>Sesiones en vivo lunes a viernes.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-stone-400 flex-shrink-0" />
                  <span>Diario guiado (5 Movimientos).</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-stone-400 flex-shrink-0" />
                  <span>Archivo de grabaciones matutinas.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-stone-400 flex-shrink-0" />
                  <span>Comunidad de discernimiento.</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/prueba')}
              className="w-full travesia-btn-secondary text-xs py-3 font-semibold"
            >
              Probar gratis 7 días primero
            </button>
          </div>

          {/* Card 2: Membresía Fundadora (Recomendada / Activa) */}
          <div className="bg-stone-950 text-sand-50 rounded-3xl p-6 sm:p-8 border-2 border-amber-500/60 shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden">
            {/* Dynamic Scarcity Tag: Calculated from 20 - active_founders */}
            <div className="absolute top-0 right-0 bg-amber-500 text-stone-950 text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-bl-2xl shadow-sm">
              Quedan {remainingPlaces} plazas
            </div>

            <div className="space-y-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                  <span>Lanzamiento Exclusivo</span>
                  <span>·</span>
                  <span className="text-amber-300">Pago manual durante la fase fundadora</span>
                </div>
                <h3 className="font-serif font-bold text-2xl text-white mt-1">
                  Miembro Fundador
                </h3>
                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="font-serif text-4xl sm:text-5xl font-bold text-amber-400">
                    {billingCycle === 'annual' ? annualEquivalentMonthly : monthlyPrice}€
                  </span>
                  <span className="text-xs text-sand-400">
                    / mes {billingCycle === 'annual' && `(${annualTotal}€/año)`}
                  </span>
                </div>
                <p className="text-[11px] text-sand-300 mt-1">
                  Precio congelado de 29€/mes de por vida para las primeras 20 plazas ({remainingPlaces} disponibles).
                </p>
              </div>

              <div className="space-y-2.5 text-xs text-sand-200 border-t border-stone-800 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Acceso ilimitado a todas las sesiones matutinas en vivo (L-V 07:00 AM).</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Herramienta privada de diario con respaldo persistente (5 Movimientos).</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Currículo mensual completo de 4 semanas y biblioteca de lecturas.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Canales de comunidad y archivo histórico de reflexiones.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Acompañamiento personal directo con el facilitador Alberto Calvo.</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleCheckoutClick('fundador')}
                className="w-full travesia-btn-accent text-sm py-3.5 font-bold shadow-lg text-stone-950 flex items-center justify-center gap-2"
              >
                <span>Asegurar mi plaza de fundador</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-[11px] text-center text-amber-400 font-medium">
                Pago manual durante la fase fundadora.
              </div>

              <button
                onClick={() => setShowManualTransferModal(true)}
                className="w-full text-[11px] text-center text-sand-400 hover:text-white underline"
              >
                Transferencia SEPA directa o solicitud de factura
              </button>
            </div>
          </div>
        </div>

        {/* Experiment Mode Notice */}
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 text-xs text-amber-950 flex items-start gap-3 max-w-2xl mx-auto shadow-sm">
          <Building className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-900">
              Pago manual durante la fase fundadora.
            </div>
            <p className="text-amber-800 leading-relaxed text-[11px]">
              Estamos validando la experiencia con nuestros primeros 10–20 miembros con acompañamiento cercano. Admitimos transferencias bancarias SEPA directas, bizum/manual y emisión de facturas para empresas o autónomos en España sin pasar por intermediarios automatizados.
            </p>
          </div>
        </div>

        {/* Guarantee and Security Notice */}
        <div className="border-t border-sand-200 pt-8 flex flex-wrap items-center justify-center gap-8 text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Garantía de reembolso de 14 días</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-stone-600" />
            <span>Cancelación libre en 1 clic</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-stone-600" />
            <span>Datos 100% confidenciales</span>
          </div>
        </div>
      </main>

      {/* Manual Transfer / Invoice Modal */}
      {showManualTransferModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-sand-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-sand-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Pago por Transferencia o Factura
              </h3>
              <button
                onClick={() => setShowManualTransferModal(false)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Para empresas, autónomos o miembros que prefieren transferencia bancaria SEPA directa sin tarjeta, escribe directamente a nuestro fundador para emitir tu factura y activar tu cuenta manualmente:
            </p>

            <div className="bg-sand-50 p-4 rounded-2xl border border-sand-200 space-y-1.5 text-xs font-mono">
              <div><strong>Email:</strong> alberto@travesia.app</div>
              <div><strong>Concepto:</strong> Membresía Fundadora TRAVESÍA</div>
              <div><strong>Importe:</strong> {monthlyPrice}€/mes o {annualTotal}€/año</div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setShowManualTransferModal(false);
                  navigate('/register');
                }}
                className="w-full travesia-btn-primary text-xs py-3 font-semibold"
              >
                Crear mi cuenta y solicitar activación →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
