import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Lead, AcquisitionSource } from '../types';

const LEADS_STORAGE_KEY = 'travesia_leads_v3';

export const leadService = {
  // Capture a new lead from landing page or free trial registration
  async captureLead(params: {
    email: string;
    name?: string;
    source?: AcquisitionSource;
    campaign?: string;
    landing_page?: string;
  }): Promise<{ lead: Lead | null; error: string | null }> {
    const cleanEmail = params.email.trim().toLowerCase();
    const cleanSource: AcquisitionSource = params.source || 'Direct';

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      email: cleanEmail,
      name: params.name?.trim() || cleanEmail.split('@')[0],
      source: cleanSource,
      campaign: params.campaign || 'organic',
      landing_page: params.landing_page || '/',
      created_at: new Date().toISOString(),
      trial_started: false,
      trial_completed: false,
      converted: false,
    };

    if (!isSupabaseConfigured) {
      // Local development storage
      try {
        const stored = localStorage.getItem(LEADS_STORAGE_KEY);
        const leads: Lead[] = stored ? JSON.parse(stored) : [];
        const existingIdx = leads.findIndex(l => l.email === cleanEmail);
        if (existingIdx >= 0) {
          leads[existingIdx] = { ...leads[existingIdx], ...newLead };
        } else {
          leads.push(newLead);
        }
        localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
        return { lead: newLead, error: null };
      } catch (err: any) {
        return { lead: newLead, error: null };
      }
    }

    try {
      const { data, error } = await supabase
        .from('leads')
        .upsert(
          {
            email: cleanEmail,
            name: newLead.name,
            source: newLead.source,
            campaign: newLead.campaign,
            landing_page: newLead.landing_page,
            created_at: newLead.created_at,
          },
          { onConflict: 'email' }
        )
        .select()
        .single();

      if (error) {
        return { lead: null, error: error.message };
      }
      return { lead: data as Lead, error: null };
    } catch (err: any) {
      return { lead: null, error: err?.message || 'Error al guardar el lead.' };
    }
  },

  // Mark that this lead initiated the 7-day free trial
  async markTrialStarted(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    if (!isSupabaseConfigured) {
      try {
        const stored = localStorage.getItem(LEADS_STORAGE_KEY);
        if (stored) {
          const leads: Lead[] = JSON.parse(stored);
          const found = leads.find(l => l.email === cleanEmail);
          if (found) {
            found.trial_started = true;
            localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
          }
        }
      } catch {}
      return;
    }

    try {
      await supabase
        .from('leads')
        .update({ trial_started: true })
        .eq('email', cleanEmail);
    } catch {}
  },

  // Mark trial completed
  async markTrialCompleted(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    if (!isSupabaseConfigured) {
      try {
        const stored = localStorage.getItem(LEADS_STORAGE_KEY);
        if (stored) {
          const leads: Lead[] = JSON.parse(stored);
          const found = leads.find(l => l.email === cleanEmail);
          if (found) {
            found.trial_completed = true;
            localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
          }
        }
      } catch {}
      return;
    }

    try {
      await supabase
        .from('leads')
        .update({ trial_completed: true })
        .eq('email', cleanEmail);
    } catch {}
  },

  // Mark converted to paying member
  async markConverted(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    const now = new Date().toISOString();

    if (!isSupabaseConfigured) {
      try {
        const stored = localStorage.getItem(LEADS_STORAGE_KEY);
        if (stored) {
          const leads: Lead[] = JSON.parse(stored);
          const found = leads.find(l => l.email === cleanEmail);
          if (found) {
            found.converted = true;
            found.converted_at = now;
            localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
          }
        }
      } catch {}
      return;
    }

    try {
      await supabase
        .from('leads')
        .update({ converted: true, converted_at: now })
        .eq('email', cleanEmail);
    } catch {}
  },

  // Fetch all leads for admin metrics
  async fetchLeads(): Promise<Lead[]> {
    if (!isSupabaseConfigured) {
      try {
        const stored = localStorage.getItem(LEADS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }

    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return [];
      return data as Lead[];
    } catch {
      return [];
    }
  },
};
