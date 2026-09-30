import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { EventItem } from '../types';
import { DEMO_EVENTS } from '../data/demo/seedData';

export const eventsService = {
  // Fetch events list with real registration status for user
  async fetchEvents(userId?: string): Promise<{ events: EventItem[]; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { events: [], error: null };
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
        return { events: [], error: error.message };
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
          }) : '08:00 AM',
          duration_minutes: e.duration_minutes || 35,
          type: e.type || 'standard',
          host_name: e.host_name || 'Alberto Calvo',
          host_avatar: e.host_avatar || '/alberto-calvo.png',
          description: e.description || '',
          theme: e.theme,
          meeting_url: e.meeting_url,
          recording_url: e.recording_url,
          recording_id: e.recording_id,
          status: e.status || 'upcoming',
          attendees_count: attendees.length,
          user_is_registered: isUserRegistered,
        };
      });

      return { events: formatted, error: null };
    } catch (err: any) {
      return { events: [], error: err?.message || 'Error al obtener eventos.' };
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
    },

  // Update event (Admin)
  async updateEvent(id: string, updates: Partial<EventItem>): Promise<{ event: EventItem | null; error: string | null }> {
    if (isSupabaseConfigured) {
      try {
        const payload: any = {};
        if (updates.title !== undefined) payload.title = updates.title;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.date !== undefined) payload.date = updates.date;
        if (updates.duration_minutes !== undefined) payload.duration_minutes = updates.duration_minutes;
        if (updates.host_name !== undefined) payload.host_name = updates.host_name;
        if (updates.meeting_url !== undefined || updates.zoom_meeting_url !== undefined) {
          payload.meeting_url = updates.zoom_meeting_url || updates.meeting_url;
          payload.zoom_meeting_url = updates.zoom_meeting_url || updates.meeting_url;
        }
        if (updates.theme !== undefined || updates.weekly_theme !== undefined) {
          payload.theme = updates.theme || updates.weekly_theme;
        }
        if (updates.recording_url !== undefined) payload.recording_url = updates.recording_url;

        const { data, error } = await supabase
          .from('events')
          .update(payload)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          return { event: null, error: error.message };
        }
        return { event: data as EventItem, error: null };
      } catch (err: any) {
        return { event: null, error: err?.message || 'Error al actualizar evento.' };
      }
    }
    return { event: updates as EventItem, error: null };
  },

  // Delete event (Admin)
  async deleteEvent(id: string): Promise<{ success: boolean; error: string | null }> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('events').delete().eq('id', id);
        return { success: !error, error: error ? error.message : null };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Error al eliminar evento.' };
      }
    }
    return { success: true, error: null };
  },

  // Track Zoom join button click (join_click, NOT attendance)
  async recordZoomJoinClick(eventId: string, userId: string): Promise<void> {
    if (!eventId || !userId) return;

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('event_attendees')
          .update({ joined_zoom_at: new Date().toISOString() })
          .eq('event_id', eventId)
          .eq('user_id', userId);

        // Track in analytics_events
        await supabase
          .from('analytics_events')
          .insert({
            user_id: userId,
            event_name: 'zoom_join_clicked',
            source: 'events_view',
            metadata: { event_id: eventId, interaction_type: 'zoom_join_clicked' },
          });
      } catch {
        // Non-blocking telemetry
      }
    }
  }
};
