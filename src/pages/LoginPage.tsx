import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useDataStore } from '../lib/dataStore';
import { isSupabaseConfigured } from '../lib/supabase';
import { ArrowRight, Shield, UserCheck, Sparkles, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/dashboard';

  const { switchUserRole, signIn, signUp } = useDataStore();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleDemoLogin = (role: 'member' | 'admin' | 'new') => {
    switchUserRole(role);
    if (role === 'new') {
      navigate('/onboarding');
    } else {
      navigate(redirectTo);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!email || !password) {
      setAuthError('Por favor introduce tu correo y contraseña.');
      return;
    }

    if (isSupabaseConfigured) {
      setIsSubmitting(true);
      try {
        if (isRegistering) {
          const res = await signUp(email, password, name || email.split('@')[0]);
          if (!res.success) {
            setAuthError(res.error || 'Error al registrar la cuenta.');
            setIsSubmitting(false);
            return;
          }
          navigate('/onboarding');
        } else {
          const res = await signIn(email, password);
          if (!res.success) {
            setAuthError(res.error || 'Error al iniciar sesión.');
            setIsSubmitting(false);
            return;
          }
          navigate(redirectTo);
        }
      } catch (err: any) {
        setAuthError(err?.message || 'Error inesperado durante la autenticación.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Local development fallback
      switchUserRole('member');
      navigate(redirectTo);
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-stone-900 mx-auto flex items-center justify-center text-sand-50 shadow-md">
            <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="9" stroke="#E7C8B6" strokeWidth="1.5" strokeDasharray="2 3" opacity="0.6"/>
              <path d="M16 7V25" stroke="#FAF4EF" strokeWidth="2" strokeLinecap="round"/>
              <path d="M10 16H22" stroke="#FAF4EF" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="16" cy="16" r="3" fill="#B66E43" />
            </svg>
          </div>
          <h1 className="font-serif font-bold text-3xl text-stone-950 tracking-wider">
            TRAVESÍA
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 font-serif italic">
            "Frena el ruido. Encuentra dirección. Haz el trabajo."
          </p>
        </div>

        {/* Demo Fast Login Cards (Visible only when in development / without Supabase credentials) */}
        {!isSupabaseConfigured && (
          <div className="bg-sand-100/70 p-4 rounded-2xl border border-sand-200/90 space-y-2">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block text-center">
              Modo Demostración Local
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('member')}
                className="p-2.5 rounded-xl bg-white hover:bg-sand-200/60 border border-sand-200 text-left transition-all text-xs"
              >
                <div className="flex items-center gap-1.5 font-bold text-stone-900">
                  <UserCheck className="w-3.5 h-3.5 text-stone-600" />
                  <span>Mateo Silva</span>
                </div>
                <p className="text-[10px] text-stone-500 mt-0.5">Miembro (Racha 7d)</p>
              </button>

              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="p-2.5 rounded-xl bg-white hover:bg-sand-200/60 border border-sand-200 text-left transition-all text-xs"
              >
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  <span>Alberto Calvo</span>
                </div>
                <p className="text-[10px] text-stone-500 mt-0.5">Fundador (Admin)</p>
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleDemoLogin('new')}
              className="w-full py-2 px-3 rounded-xl bg-bronze-50 hover:bg-bronze-100 border border-bronze-200 text-bronze-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Probar nuevo miembro (Onboarding completo)</span>
            </button>
          </div>
        )}

        {/* Traditional Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-sand-200 space-y-4">
          <div className="flex border-b border-sand-100 pb-3">
            <button
              type="button"
              onClick={() => { setIsRegistering(false); setAuthError(null); }}
              className={`flex-1 pb-2 text-xs font-semibold text-center transition-colors border-b-2 ${
                !isRegistering ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setIsRegistering(true); setAuthError(null); }}
              className={`flex-1 pb-2 text-xs font-semibold text-center transition-colors border-b-2 ${
                isRegistering ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  Tu nombre:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alberto Calvo"
                  required
                  className="w-full p-3 rounded-xl bg-sand-50 border border-sand-200 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-stone-400"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Correo electrónico:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                className="w-full p-3 rounded-xl bg-sand-50 border border-sand-200 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-stone-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Contraseña:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full p-3 rounded-xl bg-sand-50 border border-sand-200 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-stone-400"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="travesia-btn-primary w-full py-3 text-sm font-semibold shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Procesando...' : isRegistering ? 'Crear mi cuenta' : 'Entrar a Travesía'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <span className="text-xs text-stone-500">
              {isRegistering ? '¿Ya tienes cuenta activa? ' : '¿Aún no eres miembro? '}
              <button
                type="button"
                onClick={() => { setIsRegistering(!isRegistering); setAuthError(null); }}
                className="text-bronze-700 font-semibold underline hover:text-bronze-900"
              >
                {isRegistering ? 'Inicia sesión' : 'Inicia tu orientación'}
              </button>
            </span>
          </div>

          <div className="pt-2 text-center text-[10px] text-stone-400 space-x-2">
            <Link to="/privacy" className="hover:underline">Privacidad</Link>
            <span>•</span>
            <Link to="/terms" className="hover:underline">Términos</Link>
            <span>•</span>
            <Link to="/health" className="hover:underline">Estado</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
