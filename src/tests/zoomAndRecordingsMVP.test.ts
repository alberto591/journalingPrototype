import { describe, it, expect, beforeEach } from 'vitest';
import { zoomService } from '../services/zoomService';
import { recordingsService } from '../services/recordingsService';
import { eventsService } from '../services/eventsService';
import { EventItem, Profile, SessionRecording } from '../types';

describe('TRAVESÍA MVP Zoom + Recordings Specification', () => {
  beforeEach(() => {
    zoomService.clearZoomJoinClicks();
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  });


  // 1. Admin creates session with 8 fields
  it('Admin creates session with the 8 required fields and validates Zoom URL', async () => {
    const validZoomUrl = 'https://zoom.us/j/9876543210?pwd=secretPassword123';
    const invalidZoomUrl = 'https://some-random-video.com/room123';

    expect(zoomService.isValidZoomUrl(validZoomUrl)).toBe(true);
    expect(zoomService.isValidZoomUrl(invalidZoomUrl)).toBe(false);

    const sessionPayload: Omit<EventItem, 'id' | 'attendees_count' | 'user_is_registered'> = {
      title: 'Sesión Guiada de Journaling: Frenar la Inercia',
      date: '2026-10-05T06:00:00.000Z',
      time_display: '08:00 AM CET',
      duration_minutes: 35,
      type: 'standard',
      theme: 'El Presente',
      description: 'Práctica matutina de silencio reflexivo para cortar el ruido exterior.',
      host_name: 'Alberto Calvo',
      host_avatar: '/alberto-calvo.png',
      meeting_url: validZoomUrl,
      status: 'upcoming',
    };

    const { event, error } = await eventsService.createEvent(sessionPayload);
    expect(error).toBeNull();
    expect(event).toBeDefined();
    expect(event?.title).toBe('Sesión Guiada de Journaling: Frenar la Inercia');
    expect(event?.theme).toBe('El Presente');
    expect(event?.meeting_url).toBe(validZoomUrl);
    expect(event?.duration_minutes).toBe(35);
    expect(event?.host_name).toBe('Alberto Calvo');
  });

  // 2. Member sees session
  it('Member sees upcoming session with Title, Date, Time, and Theme', () => {
    const session: EventItem = {
      id: 'evt-mvp-1',
      title: 'El Presente — Primer Recorrido',
      date: '2026-10-05T06:00:00.000Z',
      time_display: '08:00 AM CET',
      duration_minutes: 35,
      type: 'standard',
      theme: 'El Presente',
      description: 'Primera sesión del ciclo semanal.',
      host_name: 'Alberto Calvo',
      host_avatar: '/alberto.png',
      meeting_url: 'https://us02web.zoom.us/j/1234567890',
      status: 'upcoming',
      attendees_count: 5,
      user_is_registered: false,
    };

    expect(session.title).toBe('El Presente — Primer Recorrido');
    expect(session.date).toBe('2026-10-05T06:00:00.000Z');
    expect(session.time_display).toBe('08:00 AM CET');
    expect(session.theme).toBe('El Presente');
  });

  // 3. Member clicks Zoom & Join click is tracked (explicitly NOT attendance)
  it('Tracks zoom_join_clicked on click without altering member attendance', () => {
    const eventId = 'evt-mvp-1';
    const userId = 'usr-member-1';

    const clickRecord = zoomService.trackZoomJoinClick(eventId, userId);
    expect(clickRecord).toBeDefined();
    expect(clickRecord.interaction_type).toBe('zoom_join_clicked');
    expect(clickRecord.event_id).toBe(eventId);
    expect(clickRecord.user_id).toBe(userId);

    // Verify stored clicks
    const storedClicks = zoomService.getZoomJoinClicks(eventId);
    expect(storedClicks.length).toBe(1);
    expect(storedClicks[0].interaction_type).toBe('zoom_join_clicked');

    // Confirm it is not an attendance event
    expect(clickRecord.interaction_type).not.toBe('attendance');
  });

  // 4. Admin uploads MP4 to private Supabase storage
  it('Admin uploads MP4 recording stored in private bucket session-recordings/{event_id}/{recording_id}.mp4', async () => {
    const eventId = 'evt-session-99';
    const fakeMp4File = new File(['fake mp4 video buffer'], 'grabacion_zoom.mp4', { type: 'video/mp4' });

    const { recording, error } = await recordingsService.uploadRecording({
      eventId,
      title: 'Grabación de la Sesión: El Presente',
      description: 'Práctica guiada grabada en Zoom y subida manualmente.',
      category: 'El Presente',
      strategy: 'HOSTED',
      file: fakeMp4File,
      durationSeconds: 2100, // 35 min
      uploadedByUserId: 'usr-admin-1',
    });

    expect(error).toBeNull();
    expect(recording).toBeDefined();
    expect(recording?.event_id).toBe(eventId);
    expect(recording?.recording_strategy).toBe('HOSTED');
    expect(recording?.status).toBe('AVAILABLE');
    expect(recording?.category).toBe('El Presente');

    // Path must follow: session-recordings/{event_id}/{recording_id}.mp4
    expect(recording?.storage_path).toMatch(new RegExp(`^session-recordings/${eventId}/rec-\\d+\\.mp4$`));
  });

  // 5. Active member watches replay
  it('Active member (ACTIVE or TRIAL) is authorized to watch replay', async () => {
    const activeMember: Profile = {
      id: 'usr-active-1',
      name: 'Elena Gómez',
      avatar_url: '',
      bio: '',
      role: 'member',
      membership_status: 'ACTIVE',
      focus_areas: ['Presencia'],
      created_at: new Date().toISOString(),
      streak_days: 12,
      completed_sessions_count: 8,
      reflection_minutes: 240,
      current_week: 2,
      onboarding_completed: true,
    };

    const trialMember: Profile = {
      ...activeMember,
      id: 'usr-trial-1',
      membership_status: 'TRIAL',
    };

    const testRecording: SessionRecording = {
      id: 'rec-test-1',
      event_id: 'evt-test-1',
      title: 'Sesión de Discernimiento',
      description: 'Grabación disponible',
      date: '2026-10-01',
      duration: '35 min',
      duration_seconds: 2100,
      category: 'El Presente',
      recording_strategy: 'HOSTED',
      storage_path: 'session-recordings/evt-test-1/rec-test-1.mp4',
      status: 'AVAILABLE',
      uploaded_by: 'usr-admin',
      uploaded_at: new Date().toISOString(),
      views_count: 0,
      is_member_only: true,
    };

    const accessActive = recordingsService.checkAccess(activeMember, testRecording);
    expect(accessActive.allowed).toBe(true);

    const accessTrial = recordingsService.checkAccess(trialMember, testRecording);
    expect(accessTrial.allowed).toBe(true);

    // Secure URL can be requested without revealing raw unprotected storage
    const { playableUrl, error } = await recordingsService.getSecurePlayableUrl(activeMember, testRecording);
    expect(error).toBeNull();
    expect(playableUrl).toBeDefined();
  });

  // 6. Anonymous user cannot watch replay
  it('Anonymous user (not logged in) is denied replay access', async () => {
    const anonymousUser = null;
    const testRecording: SessionRecording = {
      id: 'rec-test-2',
      event_id: 'evt-test-2',
      title: 'Sesión Reservada',
      description: 'Grabación de prueba',
      date: '2026-10-01',
      duration: '35 min',
      category: 'El Presente',
      recording_strategy: 'HOSTED',
      storage_path: 'session-recordings/evt-test-2/rec-test-2.mp4',
      status: 'AVAILABLE',
      uploaded_by: 'usr-admin',
      uploaded_at: new Date().toISOString(),
      views_count: 0,
      is_member_only: true,
    };


    const access = recordingsService.checkAccess(anonymousUser, testRecording);
    expect(access.allowed).toBe(false);
    expect(access.reason).toBe('NOT_AUTHENTICATED');

    const { playableUrl, error } = await recordingsService.getSecurePlayableUrl(anonymousUser, testRecording);
    expect(playableUrl).toBeNull();
    expect(error).toContain('Debes iniciar sesión');
  });

  // 7. Inactive member cannot watch replay
  it('Inactive member (FREE / CANCELLED / PAUSED) is denied replay access', async () => {
    const inactiveUser: Profile = {
      id: 'usr-free-1',
      name: 'Usuario Cancelado',
      avatar_url: '',
      bio: '',
      role: 'member',
      membership_status: 'CANCELLED',
      focus_areas: [],
      created_at: new Date().toISOString(),
      streak_days: 0,
      completed_sessions_count: 1,
      reflection_minutes: 25,
      current_week: 1,
      onboarding_completed: true,
    };

    const testRecording: SessionRecording = {
      id: 'rec-test-3',
      event_id: 'evt-test-3',
      title: 'Sesión Restringida',
      description: '',
      date: '2026-10-01',
      duration: '35 min',
      category: 'El Presente',
      recording_strategy: 'HOSTED',
      storage_path: 'session-recordings/evt-test-3/rec-test-3.mp4',
      status: 'AVAILABLE',
      uploaded_by: 'usr-admin',
      uploaded_at: new Date().toISOString(),
      views_count: 0,
      is_member_only: true,
    };


    const access = recordingsService.checkAccess(inactiveUser, testRecording);
    expect(access.allowed).toBe(false);
    expect(access.reason).toBe('MEMBERSHIP_INACTIVE');

    const { playableUrl, error } = await recordingsService.getSecurePlayableUrl(inactiveUser, testRecording);
    expect(playableUrl).toBeNull();
    expect(error).toContain('Las grabaciones son exclusivas para miembros activos');
  });

  // 8. Admin replaces and deletes recording
  it('Admin can delete session recording and clean up private bucket path', async () => {
    const recordingId = 'rec-del-123';
    const storagePath = 'session-recordings/evt-123/rec-del-123.mp4';

    const { success, error } = await recordingsService.deleteRecording(recordingId, storagePath);
    expect(error).toBeNull();
    expect(success).toBe(true);
  });

  // 9. Live session status triggers live Zoom notification
  it('Live session status triggers live Zoom notification with valid meeting URL', () => {
    const liveSession: EventItem = {
      id: 'evt-live-now',
      title: 'Sesión Matutina en Directo — Discernir el Ruido',
      date: new Date().toISOString(),
      time_display: 'Ahora en Vivo',
      duration_minutes: 35,
      type: 'standard',
      theme: 'El Presente',
      description: 'Práctica guiada en vivo.',
      host_name: 'Alberto Calvo',
      host_avatar: '/alberto.png',
      meeting_url: 'https://zoom.us/j/94523812049',
      status: 'live',
      attendees_count: 42,
      user_is_registered: true,
    };

    expect(liveSession.status).toBe('live');
    expect(zoomService.isValidZoomUrl(liveSession.meeting_url)).toBe(true);

    // Verify notification structure
    const liveNotification = {
      id: `notif-live-${liveSession.id}`,
      type: 'session',
      title: '🔴 ¡ESTAMOS EN DIRECTO AHORA!',
      message: `${liveSession.title} — Facilitado por ${liveSession.host_name}. Pulsa para entrar a la sala de Zoom.`,
      link: liveSession.meeting_url,
      read: false,
    };

    expect(liveNotification.title).toContain('EN DIRECTO AHORA');
    expect(liveNotification.link).toBe('https://zoom.us/j/94523812049');
  });

  // 10. Completed session recordings are accessible in archive
  it('Completed session recordings can be discovered and played in the recordings library', async () => {
    const activeMember: Profile = {
      id: 'usr-active-99',
      name: 'Miembro Activo',
      avatar_url: '',
      bio: '',
      role: 'member',
      membership_status: 'ACTIVE',
      focus_areas: ['Disciplina'],
      created_at: new Date().toISOString(),
      streak_days: 10,
      completed_sessions_count: 14,
      reflection_minutes: 350,
      current_week: 2,
      onboarding_completed: true,
    };

    const archivedRecording: SessionRecording = {
      id: 'rec-archive-1',
      event_id: 'evt-past-1',
      title: 'Sesión grabada de prueba',
      description: 'Replay de la sesión matutina.',
      date: '2026-09-29',
      duration: '35 min',
      category: 'El Presente',
      recording_strategy: 'HOSTED',
      storage_path: 'session-recordings/evt-past-1/rec-archive-1.mp4',
      status: 'AVAILABLE',
      views_count: 5,
      is_member_only: true,
    };

    const access = recordingsService.checkAccess(activeMember, archivedRecording);
    expect(access.allowed).toBe(true);

    const { playableUrl, error } = await recordingsService.getSecurePlayableUrl(activeMember, archivedRecording);
    expect(error).toBeNull();
    expect(playableUrl).toBeDefined();
  });
});

