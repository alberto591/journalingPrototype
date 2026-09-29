import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { EventItem } from '../types';
import { DEMO_EVENTS } from '../data/demo/seedData';

export const eventsService = {
  // Fetch events list with real registration status for user
  async fetchEvents(userId?: string): Promise<{ events: EventItem[]; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { events: DEMO_EVENTS, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_attendees(user_id)
        `)
        .order('date', { ascending: true });

      if (error) {
        return { events: DEMO_EVENTS, error: error.message };
      }

      const formatted: EventItem[] = (data || []).map((e: any) => {
        const attendees = e.event_attendees || [];
        const isUserRegistered = userId 
          ? attendees.some((a: any) => a.user_id === userId)
          : false;

        return {
          id: e.id,
          title: e.title,
          date: e.date,
          time_display: e.date ? new Date(e.date).toLocaleDateString('es-ES', { 
            weekday: 'short', 
            hour: '2-digit', 
            minute: '2-digit' 
          }) : '07:00 AM',
          duration_minutes: e.duration_minutes || 35,
          type: e.type || 'standard',
          host_name: e.host_name || 'Alberto Calvo',
          host_avatar: e.host_avatar || '/alberto-calvo.png',
          description: e.description || '',
          meeting_url: e.meeting_url,
          recording_url: e.recording_url,
          status: e.status || 'upcoming',
          attendees_count: attendees.length,
          user_is_registered: isUserRegistered,
        };
      });

      return { events: formatted, error: null };
    } catch (err: any) {
      return { events: DEMO_EVENTS, error: err?.message || 'Error al obtener eventos.' };
    }
  },

  // Register for event
  async registerForEvent(eventId: string, userId: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { success: true, error: null };
    }

    try {
      const { error } = await supabase
        .from('event_attendees')
        .insert({
          event_id: eventId,
          user_id: userId,
        });

      return { success: !error, error: error ? error.message : null };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error al inscribirse al evento.' };
    }
  },

  // Cancel event registration
  async cancelRegistration(eventId: string, userId: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { success: true, error: null };
    }

    try {
      const { error } = await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      return { success: !error, error: error ? error.message : null };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error al cancelar inscripción.' };
    }
  },

  // Admin create event
  async createEvent(
    eventData: Omit<EventItem, 'id' | 'attendees_count' | 'user_is_registered'>
  ): Promise<{ event: EventItem | null; error: string | null }> {
    if (!isSupabaseConfigured) {
      const local: EventItem = {
        ...eventData,
        id: `evt-${Date.now()}`,
        attendees_count: 1,
        user_is_registered: true,
      };
      return { event: local, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: eventData.title,
          date: eventData.date,
          duration_minutes: eventData.duration_minutes,
          type: eventData.type,
          host_name: eventData.host_name,
          host_avatar: eventData.host_avatar,
          description: eventData.description,
          meeting_url: eventData.meeting_url,
          status: 'upcoming',
        })
        .select()
        .single();

      if (error) {
        return { event: null, error: error.message };
      }

      return {
        event: {
          ...data,
          attendees_count: 0,
          user_is_registered: false,
        } as EventItem,
        error: null,
      };
    } catch (err: any) {
      return { event: null, error: err?.message || 'Error al programar evento en el servidor.' };
    }
  }
};
