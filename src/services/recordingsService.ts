/**
 * RECORDINGS SERVICE — TRAVESÍA PHASE 4.5
 * 
 * Manages video recordings for live sessions:
 * - Option A: Hosted by TRAVESÍA (private bucket 'session-recordings/{event_id}/recording.mp4')
 * - Option B: External secure recording URL
 * - Access control verification for authenticated active members & admin
 * - Signed/protected URL generator
 * - Replay analytics tracking (replay_opened, replay_started, replay_completed)
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SessionRecording, Profile, ReplayTrackingEvent, ReplayAction } from '../types';

export interface UploadProgressCallback {
  (percentage: number, statusText: string): void;
}

export interface RecordingUploadPayload {
  eventId: string;
  title: string;
  description: string;
  category?: string;
  strategy: 'HOSTED' | 'EXTERNAL';
  file?: File;
  externalUrl?: string;
  zoomRecordingUrl?: string;
  durationSeconds?: number;
  uploadedByUserId: string;
}

export interface AccessCheckResult {
  allowed: boolean;
  reason?: 'NOT_AUTHENTICATED' | 'MEMBERSHIP_INACTIVE' | 'RECORDING_NOT_FOUND' | 'DENIED';
  message: string;
}

const STORAGE_BUCKET = 'session-recordings';

export const recordingsService = {
  /**
   * Fetch session recordings from Supabase session_recordings table
   */
  async fetchRecordings(): Promise<{ recordings: SessionRecording[]; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { recordings: [], error: null };
    }
    try {
      const { data, error } = await supabase
        .from('session_recordings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { recordings: [], error: error.message };
      }
      return { recordings: (data || []) as SessionRecording[], error: null };
    } catch (err: any) {
      return { recordings: [], error: err?.message || 'Error al obtener grabaciones.' };
    }
  },

  /**
   * Verify if a user is permitted to view a member recording
   * Rules:
   * 1. Unauthenticated (null user) => DENIED
   * 2. Admin / Coach => ALWAYS ALLOWED
   * 3. Member with ACTIVE or TRIAL status => ALLOWED
   * 4. Inactive member (FREE, PAUSED, CANCELLED) => DENIED
   */
  checkAccess(user: Profile | null | undefined, recording?: SessionRecording | null): AccessCheckResult {
    if (!user) {
      return {
        allowed: false,
        reason: 'NOT_AUTHENTICATED',
        message: 'Debes iniciar sesión con tu cuenta de TRAVESÍA para acceder a las grabaciones.',
      };
    }

    // Admins and coaches always have unrestricted access
    if (user.role === 'admin' || user.role === 'coach') {
      return {
        allowed: true,
        message: 'Acceso autorizado como equipo de facilitación.',
      };
    }

    // Active memberships or active 7-day trials have access
    const isMemberActive = user.membership_status === 'ACTIVE' || user.membership_status === 'TRIAL';

    if (isMemberActive) {
      return {
        allowed: true,
        message: 'Acceso autorizado para miembro activo.',
      };
    }

    return {
      allowed: false,
      reason: 'MEMBERSHIP_INACTIVE',
      message: 'Las grabaciones son exclusivas para miembros activos de TRAVESÍA. Reactiva tu suscripción para continuar.',
    };
  },

  /**
   * Get secure/signed video stream URL
   */
  async getSecurePlayableUrl(
    user: Profile | null | undefined,
    recording: SessionRecording
  ): Promise<{ playableUrl: string | null; error: string | null }> {
    const access = this.checkAccess(user, recording);
    if (!access.allowed) {
      return { playableUrl: null, error: access.message };
    }

    // If external URL strategy, return external URL directly
    if (recording.recording_strategy === 'EXTERNAL' && recording.external_url) {
      return { playableUrl: recording.external_url, error: null };
    }

    // If Supabase is configured and we have a storage path, generate a signed URL (expires in 2 hours)
    if (isSupabaseConfigured && recording.storage_path) {
      try {
        let cleanPath = recording.storage_path.trim();

        // 1. If already an HTTP/HTTPS URL, return directly
        if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
          return { playableUrl: cleanPath, error: null };
        }

        // 2. Strip leading bucket name or slashes
        // e.g. "session-recordings/evt-1/rec.mp4" -> "evt-1/rec.mp4"
        if (cleanPath.startsWith(`${STORAGE_BUCKET}/`)) {
          cleanPath = cleanPath.slice(STORAGE_BUCKET.length + 1);
        } else if (cleanPath.startsWith(`/${STORAGE_BUCKET}/`)) {
          cleanPath = cleanPath.slice(STORAGE_BUCKET.length + 2);
        }
        cleanPath = cleanPath.replace(/^\/+/, '');

        let { data, error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .createSignedUrl(cleanPath, 7200);

        // Fallback: If cleanPath failed, try with original storage_path in case it was stored differently
        if (error && cleanPath !== recording.storage_path) {
          const fallbackRes = await supabase.storage
            .from(STORAGE_BUCKET)
            .createSignedUrl(recording.storage_path, 7200);
          if (fallbackRes.data?.signedUrl) {
            data = fallbackRes.data;
            error = null;
          }
        }

        if (data?.signedUrl) {
          return { playableUrl: data.signedUrl, error: null };
        }

        // Fallback to direct video_url if available
        if (recording.video_url && (recording.video_url.startsWith('http://') || recording.video_url.startsWith('https://'))) {
          return { playableUrl: recording.video_url, error: null };
        }

        if (error) {
          return { playableUrl: null, error: error.message };
        }
      } catch (err: any) {
        if (recording.video_url && (recording.video_url.startsWith('http://') || recording.video_url.startsWith('https://'))) {
          return { playableUrl: recording.video_url, error: null };
        }
        return { playableUrl: null, error: err?.message || 'Error al generar enlace seguro de reproducción.' };
      }
    }

    // Fallback: return direct video_url or placeholder video for dev/demo
    const fallbackUrl = recording.video_url || recording.external_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    return { playableUrl: fallbackUrl, error: null };
  },

  /**
   * Upload video file (MP4, MOV, WEBM) or attach external URL
   */
  async uploadRecording(
    payload: RecordingUploadPayload,
    onProgress?: UploadProgressCallback
  ): Promise<{ recording: SessionRecording | null; error: string | null }> {
    const {
      eventId,
      title,
      description,
      category = 'El Presente',
      strategy,
      file,
      externalUrl,
      zoomRecordingUrl,
      durationSeconds = 2100, // 35 min default
      uploadedByUserId,
    } = payload;

    if (strategy === 'EXTERNAL') {
      if (!externalUrl || !externalUrl.trim()) {
        return { recording: null, error: 'Por favor, proporciona una URL externa válida para la grabación.' };
      }

      onProgress?.(100, 'Grabación externa vinculada.');

      const newRec: SessionRecording = {
        id: `rec-${eventId}-${Date.now()}`,
        event_id: eventId,
        title: title.trim(),
        description: description.trim(),
        date: new Date().toISOString().split('T')[0],
        duration: `${Math.floor(durationSeconds / 60)} min`,
        duration_seconds: durationSeconds,
        category,
        recording_strategy: 'EXTERNAL',
        external_url: externalUrl.trim(),
        video_url: externalUrl.trim(),
        zoom_recording_url: zoomRecordingUrl?.trim() || undefined,
        status: 'AVAILABLE',
        uploaded_by: uploadedByUserId,
        uploaded_at: new Date().toISOString(),
        views_count: 0,
        is_member_only: true,
      };

      return { recording: newRec, error: null };
    }

    // Strategy === 'HOSTED'
    if (!file) {
      return { recording: null, error: 'Debes seleccionar un archivo de vídeo (MP4, MOV o WEBM).' };
    }

    const validExtensions = ['mp4', 'mov', 'webm'];
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    if (!validExtensions.includes(fileExt)) {
      return { recording: null, error: 'Formato no soportado. Sube un archivo MP4, MOV o WEBM.' };
    }

    const recordingId = `rec-${Date.now()}`;
    const relativeStoragePath = `${eventId}/${recordingId}.${fileExt}`;
    const fullStoragePath = `session-recordings/${eventId}/${recordingId}.${fileExt}`;

    try {
      if (isSupabaseConfigured) {
        onProgress?.(25, 'Subiendo grabación al almacenamiento privado... 25%');
        
        let { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(relativeStoragePath, file, {
            upsert: true,
            contentType: file.type || 'video/mp4',
          });

        if (uploadError) {
          // If bucket does not exist, attempt to auto-create it
          const isBucketNotFound = 
            uploadError.message?.toLowerCase().includes('bucket not found') || 
            (uploadError as any)?.statusCode === 404 || 
            (uploadError as any)?.statusCode === '404';

          if (isBucketNotFound) {
            try {
              const { error: createErr } = await supabase.storage.createBucket(STORAGE_BUCKET, {
                public: false,
                fileSizeLimit: 5368709120, // 5GB
                allowedMimeTypes: ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska'],
              });

              if (!createErr) {
                // Retry upload now that bucket exists
                const retry = await supabase.storage
                  .from(STORAGE_BUCKET)
                  .upload(relativeStoragePath, file, {
                    upsert: true,
                    contentType: file.type || 'video/mp4',
                  });
                uploadError = retry.error;
              }
            } catch {
              // Ignore createBucket client error
            }
          }

          if (uploadError) {
            onProgress?.(0, 'Error en subida');
            if (uploadError.message?.toLowerCase().includes('bucket not found')) {
              return { 
                recording: null, 
                error: `El bucket de almacenamiento "${STORAGE_BUCKET}" aún no ha sido creado en tu proyecto de Supabase.\n\nPara crearlo en 30 segundos:\n1. Abre tu panel de Supabase → Storage\n2. Pulsa en "New bucket"\n3. Introduce de nombre exacto: session-recordings\n4. Deja la casilla "Public bucket" DESACTIVADA (debe ser privado)\n5. Guarda el bucket y vuelve a pulsar "SUBIR GRABACIÓN".` 
              };
            }
            return { recording: null, error: `Error al subir al bucket de almacenamiento: ${uploadError.message}` };
          }
        }

        onProgress?.(75, 'Grabación subida. Registrando metadatos en Supabase... 75%');

        // Store metadata in session_recordings table
        try {
          await supabase.from('session_recordings').insert({
            id: recordingId,
            event_id: eventId,
            title: title.trim(),
            description: description.trim(),
            storage_path: relativeStoragePath,
            file_size_bytes: file.size,
            duration_seconds: durationSeconds,
            duration: `${Math.floor(durationSeconds / 60)} min`,
            category,
            recording_strategy: 'HOSTED',
            status: 'AVAILABLE',
            uploaded_by: uploadedByUserId,
            is_member_only: true,
          });

          // Update event in Supabase
          await supabase.from('events').update({
            recording_url: relativeStoragePath,
          }).eq('id', eventId);
        } catch {
          // Table insert fallback for local/mock
        }
      } else {
        // Simulated progress for demo / local environment
        onProgress?.(20, 'Subiendo grabación... 20%');
        await new Promise(r => setTimeout(r, 200));
        onProgress?.(47, 'Subiendo grabación... 47%');
        await new Promise(r => setTimeout(r, 250));
        onProgress?.(85, 'Subiendo grabación... 85%');
        await new Promise(r => setTimeout(r, 200));
        onProgress?.(100, 'Subida al 100%. Procesando...');
        await new Promise(r => setTimeout(r, 300));
      }

      onProgress?.(100, 'Grabación disponible.');

      const newRec: SessionRecording = {
        id: recordingId,
        event_id: eventId,
        title: title.trim(),
        description: description.trim(),
        date: new Date().toISOString().split('T')[0],
        duration: `${Math.floor(durationSeconds / 60)} min`,
        duration_seconds: durationSeconds,
        file_size_bytes: file.size,
        category,
        recording_strategy: 'HOSTED',
        storage_path: fullStoragePath,
        thumbnail_url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop&q=80',
        video_url: typeof URL !== 'undefined' && URL.createObjectURL ? URL.createObjectURL(file) : undefined,
        zoom_recording_url: zoomRecordingUrl?.trim() || undefined,
        status: 'AVAILABLE',
        uploaded_by: uploadedByUserId,
        uploaded_at: new Date().toISOString(),
        views_count: 0,
        is_member_only: true,
      };

      return { recording: newRec, error: null };
    } catch (err: any) {
      return { recording: null, error: err?.message || 'Error inesperado durante la subida.' };
    }
  },

  /**
   * Delete a recording from private bucket and database metadata
   */
  async deleteRecording(recordingId: string, storagePath?: string): Promise<{ success: boolean; error: string | null }> {
    if (isSupabaseConfigured) {
      try {
        if (storagePath) {
          const cleanPath = storagePath.replace(/^session-recordings\//, '');
          await supabase.storage.from(STORAGE_BUCKET).remove([cleanPath]);
        }
        await supabase.from('session_recordings').delete().eq('id', recordingId);
      } catch (err: any) {
        return { success: false, error: err?.message || 'Error al eliminar grabación.' };
      }
    }
    return { success: true, error: null };
  },

  /**
   * Track member interaction with recordings (Replay Analytics)
   */
  trackReplayEvent(
    recordingId: string,
    userId: string,
    action: ReplayAction,
    durationSeconds?: number,
    eventId?: string
  ): ReplayTrackingEvent {
    const event: ReplayTrackingEvent = {
      id: `rt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      recording_id: recordingId,
      event_id: eventId,
      user_id: userId,
      action,
      watch_duration_seconds: durationSeconds,
      timestamp: new Date().toISOString(),
    };

    // Stored in localStorage for persistent analytics
    try {
      const existing = localStorage.getItem('travesia_replay_analytics');
      const list: ReplayTrackingEvent[] = existing ? JSON.parse(existing) : [];
      list.push(event);
      localStorage.setItem('travesia_replay_analytics', JSON.stringify(list));
    } catch {
      // safe fallback
    }

    return event;
  },

  /**
   * Get all tracked replay events
   */
  getTrackedReplays(): ReplayTrackingEvent[] {
    try {
      const existing = localStorage.getItem('travesia_replay_analytics');
      return existing ? JSON.parse(existing) : [];
    } catch {
      return [];
    }
  },
};
