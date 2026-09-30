import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw, ShieldCheck } from 'lucide-react';

interface HealthCheckStatus {
  status: 'HEALTHY' | 'DEGRADED' | 'CHECKING';
  timestamp: string;
  frontend: {
    status: 'UP';
    environment: string;
    version: string;
  };
  supabase: {
    configured: boolean;
    reachable: boolean | null;
    authOperational: boolean | null;
    databaseOperational: boolean | null;
    latencyMs?: number;
  };
  details: string;
}

export const HealthCheckPage: React.FC = () => {
  const [health, setHealth] = useState<HealthCheckStatus>({
    status: 'CHECKING',
    timestamp: new Date().toISOString(),
    frontend: {
      status: 'UP',
      environment: import.meta.env.MODE || 'production',
      version: '2.1.0',
    },
    supabase: {
      configured: isSupabaseConfigured,
      reachable: null,
      authOperational: null,
      databaseOperational: null,
    },
    details: 'Verificando componentes de infraestructura...',
  });

  const runCheck = async () => {
    setHealth((prev) => ({ ...prev, status: 'CHECKING', timestamp: new Date().toISOString() }));
    const startTime = performance.now();

    let reachable = false;
    let authOperational = false;
    let databaseOperational = false;

    if (!isSupabaseConfigured) {
      setHealth({
        status: 'DEGRADED',
        timestamp: new Date().toISOString(),
        frontend: {
          status: 'UP',
          environment: import.meta.env.MODE || 'development',
          version: '2.1.0',
        },
        supabase: {
          configured: false,
          reachable: false,
          authOperational: false,
          databaseOperational: false,
          latencyMs: 0,
        },
        details: 'Modo local sin claves Supabase activas (Operando con fallback seguro).',
      });
      return;
    }

    try {
      // 1. Check Auth service
      const authPromise = supabase.auth.getSession();
      
      // 2. Check Database connectivity via public pricing_plans table
      const dbPromise = supabase.from('pricing_plans').select('id').limit(1);

      const [authRes, dbRes] = await Promise.allSettled([authPromise, dbPromise]);

      if (authRes.status === 'fulfilled' && !authRes.value.error) {
        authOperational = true;
      }

      if (dbRes.status === 'fulfilled' && !dbRes.value.error) {
        databaseOperational = true;
      }

      reachable = authOperational || databaseOperational;
      const latencyMs = Math.round(performance.now() - startTime);

      const isAllHealthy = reachable && authOperational && databaseOperational;

      setHealth({
        status: isAllHealthy ? 'HEALTHY' : 'DEGRADED',
        timestamp: new Date().toISOString(),
        frontend: {
          status: 'UP',
          environment: import.meta.env.MODE || 'production',
          version: '2.1.0',
        },
        supabase: {
          configured: true,
          reachable,
          authOperational,
          databaseOperational,
          latencyMs,
        },
        details: isAllHealthy 
          ? 'Todos los servicios de producción operativos.' 
          : 'Uno o más servicios de datos presentan degradación.',
      });
    } catch (err: any) {
      setHealth({
        status: 'DEGRADED',
        timestamp: new Date().toISOString(),
        frontend: {
          status: 'UP',
          environment: import.meta.env.MODE || 'production',
          version: '2.1.0',
        },
        supabase: {
          configured: true,
          reachable: false,
          authOperational: false,
          databaseOperational: false,
          latencyMs: Math.round(performance.now() - startTime),
        },
        details: 'Error en la conexión con los servicios de backend.',
      });
    }
  };

  useEffect(() => {
    runCheck();
  }, []);

  return (
    <div className="min-h-screen bg-sand-50 p-6 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-sand-200 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-sand-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center text-sand-50">
              <ShieldCheck className="w-5 h-5 text-sand-200" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg text-stone-900">Estado del Sistema</h1>
              <p className="text-xs text-stone-500">TRAVESÍA Health Check</p>
            </div>
          </div>
          <button
            onClick={runCheck}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-sand-100 rounded-xl transition-colors"
            title="Volver a verificar"
          >
            <RefreshCw className={`w-4 h-4 ${health.status === 'CHECKING' ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Global Banner */}
        <div className={`p-4 rounded-2xl flex items-center gap-3 ${
          health.status === 'HEALTHY'
            ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
            : health.status === 'CHECKING'
            ? 'bg-amber-50 text-amber-900 border border-amber-200'
            : 'bg-rose-50 text-rose-900 border border-rose-200'
        }`}>
          {health.status === 'HEALTHY' ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          ) : health.status === 'CHECKING' ? (
            <RefreshCw className="w-6 h-6 text-amber-600 animate-spin flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-rose-600 flex-shrink-0" />
          )}
          <div>
            <div className="font-bold text-sm">
              {health.status === 'HEALTHY'
                ? 'SISTEMA OPERATIVO'
                : health.status === 'CHECKING'
                ? 'COMPROBANDO ESTADO...'
                : 'ESTADO DEGRADADO'}
            </div>
            <div className="text-xs opacity-90">{health.details}</div>
          </div>
        </div>

        {/* Breakdown Items */}
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-sand-50/80 border border-sand-100">
            <span className="font-medium text-stone-700">Frontend (Vercel)</span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" /> 200 OK
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-sand-50/80 border border-sand-100">
            <span className="font-medium text-stone-700">Supabase Auth</span>
            {health.supabase.authOperational ? (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> Operativo
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-stone-500">
                <XCircle className="w-3.5 h-3.5" /> Inactivo / Demo
              </span>
            )}
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-sand-50/80 border border-sand-100">
            <span className="font-medium text-stone-700">PostgreSQL (Base de Datos)</span>
            {health.supabase.databaseOperational ? (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> Conectado ({health.supabase.latencyMs}ms)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-stone-500">
                <XCircle className="w-3.5 h-3.5" /> Inactivo / Demo
              </span>
            )}
          </div>
        </div>

        {/* JSON Preview for Automated Monitors */}
        <div className="pt-2">
          <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1">
            Respuesta JSON (Monitoreo)
          </span>
          <pre className="p-3 bg-stone-900 text-stone-300 rounded-xl text-[10px] font-mono overflow-x-auto max-h-36">
            {JSON.stringify(health, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
