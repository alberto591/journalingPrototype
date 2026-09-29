import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CustomerInterview, ProductLogEntry } from '../types';

const INTERVIEWS_KEY = 'travesia_customer_interviews_v4';
const PRODUCT_LOG_KEY = 'travesia_product_dev_log_v4';

const INITIAL_PRODUCT_LOGS: ProductLogEntry[] = [
  {
    id: 'log-1',
    observation: 'Los primeros 3 miembros mostraron dificultad para mantener el silencio de 2 minutos en el Movimiento 4 sin cerrar la app.',
    problem: 'La quietud absoluta sin guía sonora causa ansiedad de "tiempo muerto" en personas con sobreestimulación digital.',
    hypothesis: 'Añadir un contador visual sutil con guía de respiración 4-4 reduce la tasa de abandono del Movimiento 4.',
    change_applied: 'Incorporada animación armónica de respiración durante el tiempo de quietud.',
    measurement_plan: 'Monitorear la tasa de finalización del Movimiento 4 en las próximas 2 semanas.',
    status: 'KEPT',
    created_at: '2026-09-28T09:00:00Z',
  },
  {
    id: 'log-2',
    observation: '2 miembros fundadores solicitaron pagar mediante transferencia bancaria porque sus tarjetas corporativas requerían aprobación manual.',
    problem: 'Forzar pasarela con tarjeta única puede bloquear a autónomos y empresas en España.',
    hypothesis: 'Ofrecer opción explícita de transferencia bancaria y factura manual acelera la conversión de los primeros 10 clientes.',
    change_applied: 'Añadido modal de pago por transferencia y solicitud de factura en la página de precios.',
    measurement_plan: 'Registrar conversiones originadas por solicitud manual frente a tarjeta.',
    status: 'TESTING',
    created_at: '2026-09-28T14:00:00Z',
  }
];

export const interviewAndLogService = {
  // 1. CUSTOMER INTERVIEWS
  async submitInterview(interview: Omit<CustomerInterview, 'id' | 'created_at'>): Promise<CustomerInterview> {
    const newInterview: CustomerInterview = {
      ...interview,
      id: `int-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured) {
      try {
        const stored = localStorage.getItem(INTERVIEWS_KEY);
        const list: CustomerInterview[] = stored ? JSON.parse(stored) : [];
        list.unshift(newInterview);
        localStorage.setItem(INTERVIEWS_KEY, JSON.stringify(list));
      } catch {}
      return newInterview;
    }

    try {
      const { data } = await supabase
        .from('customer_interviews')
        .insert(newInterview)
        .select()
        .single();
      return (data as CustomerInterview) || newInterview;
    } catch {
      return newInterview;
    }
  },

  async fetchInterviews(): Promise<CustomerInterview[]> {
    if (!isSupabaseConfigured) {
      try {
        const stored = localStorage.getItem(INTERVIEWS_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }

    try {
      const { data, error } = await supabase
        .from('customer_interviews')
        .select('*')
        .order('created_at', { ascending: false });
      if (error || !data) return [];
      return data as CustomerInterview[];
    } catch {
      return [];
    }
  },

  // 2. PRODUCT DEVELOPMENT LOG (OBSERVATION -> PROBLEM -> HYPOTHESIS -> CHANGE -> MEASURE)
  async fetchProductLogs(): Promise<ProductLogEntry[]> {
    if (!isSupabaseConfigured) {
      try {
        const stored = localStorage.getItem(PRODUCT_LOG_KEY);
        if (stored) return JSON.parse(stored);
        localStorage.setItem(PRODUCT_LOG_KEY, JSON.stringify(INITIAL_PRODUCT_LOGS));
        return INITIAL_PRODUCT_LOGS;
      } catch {
        return INITIAL_PRODUCT_LOGS;
      }
    }

    try {
      const { data, error } = await supabase
        .from('product_logs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error || !data || data.length === 0) return INITIAL_PRODUCT_LOGS;
      return data as ProductLogEntry[];
    } catch {
      return INITIAL_PRODUCT_LOGS;
    }
  },

  async createProductLog(entry: Omit<ProductLogEntry, 'id' | 'created_at'>): Promise<ProductLogEntry> {
    const newEntry: ProductLogEntry = {
      ...entry,
      id: `plog-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured) {
      try {
        const stored = localStorage.getItem(PRODUCT_LOG_KEY);
        const list: ProductLogEntry[] = stored ? JSON.parse(stored) : INITIAL_PRODUCT_LOGS;
        const updated = [newEntry, ...list];
        localStorage.setItem(PRODUCT_LOG_KEY, JSON.stringify(updated));
      } catch {}
      return newEntry;
    }

    try {
      const { data } = await supabase
        .from('product_logs')
        .insert(newEntry)
        .select()
        .single();
      return (data as ProductLogEntry) || newEntry;
    } catch {
      return newEntry;
    }
  },

  async updateLogStatus(id: string, status: ProductLogEntry['status']): Promise<void> {
    if (!isSupabaseConfigured) {
      try {
        const stored = localStorage.getItem(PRODUCT_LOG_KEY);
        if (stored) {
          const list: ProductLogEntry[] = JSON.parse(stored);
          const found = list.find(l => l.id === id);
          if (found) {
            found.status = status;
            localStorage.setItem(PRODUCT_LOG_KEY, JSON.stringify(list));
          }
        }
      } catch {}
      return;
    }

    try {
      await supabase.from('product_logs').update({ status }).eq('id', id);
    } catch {}
  }
};
