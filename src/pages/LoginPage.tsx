import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDataStore } from '../lib/dataStore';
import { Compass, ArrowRight, Shield, UserCheck, Sparkles, Heart } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { switchUserRole } = useDataStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleDemoLogin = (role: 'member' | 'admin' | 'new') => {
    switchUserRole(role);
    if (role === 'new') {
      navigate('/onboarding');
    } else {
      navigate('/dashboard');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    switchUserRole('member');
    navigate('/dashboard');
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

        {/* Demo Fast Login Cards */}
        <div className="bg-sand-100/70 p-4 rounded-2xl border border-sand-200/90 space-y-2">
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block text-center">
            Acceso Rápido de Demostración
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

        {/* Traditional Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-sand-200 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Correo electrónico:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
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
                className="w-full p-3 rounded-xl bg-sand-50 border border-sand-200 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-stone-400"
              />
            </div>

            <button
              type="submit"
              className="travesia-btn-primary w-full py-3 text-sm font-semibold shadow-md flex items-center justify-center gap-2"
            >
              <span>Entrar a Travesía</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <span className="text-xs text-stone-500">
              ¿Aún no eres miembro?{' '}
              <button
                onClick={() => handleDemoLogin('new')}
                className="text-bronze-700 font-semibold underline hover:text-bronze-900"
              >
                Inicia tu orientación
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
