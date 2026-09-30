/**
 * ZOOM SERVICE ABSTRACTION — TRAVESÍA PHASE 4.5
 * 
 * ARCHITECTURE PRINCIPLE:
 * ZOOM = LIVE MEETING
 * TRAVESÍA = MEMBER EXPERIENCE + SESSION DIRECTORY + RECORDING LIBRARY
 * 
 * For the MVP, meetings are created by the admin in Zoom and the URL is pasted.
 * This service provides URL validation, future-ready API stubs, and webhook handling
 * without exposing Zoom credentials or secrets on the frontend.
 */

import { ZoomJoinClick } from '../types';

export interface ZoomMeetingParams {
  topic: string;
  startTime: string; // ISO string
  durationMinutes: number;
  agenda?: string;
  hostName?: string;
}

export interface ZoomMeetingResult {
  meetingId: string;
  joinUrl: string;
  hostUrl?: string;
}

export interface ZoomRecordingData {
  meetingId: string;
  recordingUrl?: string;
  downloadUrl?: string;
  durationSeconds?: number;
  fileSizeBytes?: number;
  status: 'PROCESSING' | 'AVAILABLE' | 'NOT_AVAILABLE';
}

export interface ZoomWebhookResult {
  handled: boolean;
  eventType: string;
  message?: string;
  extractedRecording?: ZoomRecordingData;
}

// Feature flag: by default false for MVP
const ZOOM_API_AUTOMATION_ENABLED = false;

// Memory fallback for Node/test environments
let inMemoryZoomClicks: ZoomJoinClick[] = [];

export const zoomService = {
  /**
   * Validate if a string is a legitimate Zoom meeting or join URL
   * Accepts:
   * - https://zoom.us/j/1234567890
   * - https://us02web.zoom.us/j/1234567890?pwd=...
   * - https://*.zoom.us/...
   * - https://*.zoomgov.com/...
   */
  isValidZoomUrl(url: string | null | undefined): boolean {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    if (!trimmed.startsWith('https://') && !trimmed.startsWith('http://')) {
      return false;
    }

    try {
      const parsed = new URL(trimmed);
      const hostname = parsed.hostname.toLowerCase();

      // Check legitimate Zoom hostnames
      const isZoomDomain = 
        hostname === 'zoom.us' ||
        hostname.endsWith('.zoom.us') ||
        hostname === 'zoomgov.com' ||
        hostname.endsWith('.zoomgov.com');

      if (!isZoomDomain) return false;

      // Must have meeting path or join structure (e.g. /j/, /my/, /s/, /w/)
      const pathname = parsed.pathname;
      return pathname.length > 2;
    } catch {
      return false;
    }
  },

  /**
   * Extract numeric meeting ID from a Zoom URL if present
   */
  extractMeetingId(url: string | null | undefined): string | null {
    if (!url) return null;
    const match = url.match(/\/j\/(\d+)/i) || url.match(/meetingId=(\d+)/i) || url.match(/\/w\/(\d+)/i);
    return match ? match[1] : null;
  },

  /**
   * Clean and normalize a Zoom meeting URL
   */
  normalizeZoomUrl(url: string): string {
    const trimmed = url.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return `https://${trimmed}`;
    }
    return trimmed;
  },

  /**
   * Reset in-memory tracked clicks (for testing)
   */
  clearZoomJoinClicks(): void {

    inMemoryZoomClicks = [];
    try {
      const storage = typeof localStorage !== 'undefined' 
        ? localStorage 
        : (typeof window !== 'undefined' && window.localStorage ? window.localStorage : null);
      storage?.removeItem('travesia_zoom_join_clicks');
    } catch {}
  },

  /**
   * Track member click on 'ENTRAR EN ZOOM'
   * Note: This tracks the join intent click and is explicitly NOT counted as attendance.
   */
  trackZoomJoinClick(eventId: string, userId: string): ZoomJoinClick {
    const click: ZoomJoinClick = {
      id: `zjc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      event_id: eventId,
      user_id: userId,
      clicked_at: new Date().toISOString(),
      interaction_type: 'zoom_join_clicked',
      label: 'Intentó unirse',
    };

    inMemoryZoomClicks.push(click);

    try {
      const storage = typeof localStorage !== 'undefined' 
        ? localStorage 
        : (typeof window !== 'undefined' && window.localStorage ? window.localStorage : null);
      if (storage) {
        const existing = storage.getItem('travesia_zoom_join_clicks');
        const list = existing ? JSON.parse(existing) : [];
        list.push(click);
        storage.setItem('travesia_zoom_join_clicks', JSON.stringify(list));
      }
    } catch {}

    return click;
  },

  getZoomJoinClicks(eventId?: string): ZoomJoinClick[] {
    try {
      const storage = typeof localStorage !== 'undefined' 
        ? localStorage 
        : (typeof window !== 'undefined' && window.localStorage ? window.localStorage : null);
      if (storage) {
        const existing = storage.getItem('travesia_zoom_join_clicks');
        if (existing) {
          const list: ZoomJoinClick[] = JSON.parse(existing);
          return eventId ? list.filter(c => c.event_id === eventId) : list;
        }
      }
    } catch {}
    return eventId ? inMemoryZoomClicks.filter(c => c.event_id === eventId) : [...inMemoryZoomClicks];
  },


  /**
   * FUTURE READY: Create Zoom meeting automatically via backend worker
   */
  async createZoomMeeting(params: ZoomMeetingParams): Promise<ZoomMeetingResult> {
    if (!ZOOM_API_AUTOMATION_ENABLED) {
      // In MVP: Manual workflow. If called in demo/test, return structured fallback
      const generatedId = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      return {
        meetingId: generatedId,
        joinUrl: `https://zoom.us/j/${generatedId}`,
        hostUrl: `https://zoom.us/s/${generatedId}`,
      };
    }

    // In production with Zoom Server-to-Server OAuth, call edge function
    throw new Error('Zoom API automation is disabled for MVP. Paste the Zoom link manually.');
  },

  /**
   * FUTURE READY: Update an existing Zoom meeting
   */
  async updateZoomMeeting(meetingId: string, params: Partial<ZoomMeetingParams>): Promise<boolean> {
    if (!ZOOM_API_AUTOMATION_ENABLED) {
      return true;
    }
    return true;
  },

  /**
   * FUTURE READY: Get recording information from Zoom Cloud
   */
  async getZoomRecording(meetingId: string): Promise<ZoomRecordingData | null> {
    if (!ZOOM_API_AUTOMATION_ENABLED) {
      return {
        meetingId,
        status: 'NOT_AVAILABLE',
      };
    }
    return null;
  },

  /**
   * FUTURE READY: Handle incoming Zoom Webhooks (e.g., recording.completed)
   */
  async handleZoomWebhook(eventPayload: { event: string; payload: any }): Promise<ZoomWebhookResult> {
    const { event, payload } = eventPayload;

    if (event === 'recording.completed') {
      const meetingId = payload?.object?.id?.toString() || '';
      const downloadUrl = payload?.object?.recording_files?.[0]?.download_url;
      const duration = payload?.object?.duration ? payload.object.duration * 60 : undefined;
      const fileSize = payload?.object?.total_size;

      return {
        handled: true,
        eventType: event,
        message: 'Grabación de Zoom completada y lista para asociar a la sesión.',
        extractedRecording: {
          meetingId,
          downloadUrl,
          durationSeconds: duration,
          fileSizeBytes: fileSize,
          status: 'AVAILABLE',
        },
      };
    }

    if (event === 'meeting.started') {
      return {
        handled: true,
        eventType: event,
        message: 'Sesión en Zoom ha comenzado (LIVE).',
      };
    }

    if (event === 'meeting.ended') {
      return {
        handled: true,
        eventType: event,
        message: 'Sesión en Zoom ha concluido (COMPLETED).',
      };
    }

    return {
      handled: false,
      eventType: event,
      message: 'Evento no procesado en MVP.',
    };
  },

  /**
   * System notification messages prepared for sessions
   */
  getSessionNotification(type: '24h_before' | '1h_before' | '15m_before' | 'recording_ready', sessionTitle: string) {
    switch (type) {
      case '24h_before':
        return {
          title: 'Sesión en directo mañana',
          message: 'Mañana tienes una sesión en directo.',
          meta: `Sesión: "${sessionTitle}"`,
        };
      case '1h_before':
        return {
          title: 'Sesión en 1 hora',
          message: 'La sesión empieza en 1 hora.',
          meta: `Sesión: "${sessionTitle}"`,
        };
      case '15m_before':
        return {
          title: 'Sesión en 15 minutos',
          message: 'La sesión empieza en 15 minutos.',
          meta: `Prepara tu cuaderno y entra en Zoom: "${sessionTitle}"`,
        };
      case 'recording_ready':
        return {
          title: 'Grabación disponible',
          message: 'La grabación de la sesión ya está disponible.',
          meta: `Ya puedes ver la repetición de "${sessionTitle}" en el Archivo.`,
        };
    }
  },
};
