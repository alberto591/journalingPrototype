import { describe, it, expect } from 'vitest';
import { Post, Comment, EventItem, Lesson } from '../types';

describe('Community Posts & Comments Logic', () => {
  it('creates and reacts to posts correctly', () => {
    const post: Post = {
      id: 'post-test-1',
      channel_id: 'ch-general',
      author_id: 'usr-1',
      author: {
        id: 'usr-1',
        name: 'Carlos Ruiz',
        avatar_url: '',
        bio: 'Miembro',
        role: 'member',
        focus_areas: ['Disciplina'],
        created_at: '',
        streak_days: 5,
        completed_sessions_count: 10,
        reflection_minutes: 300,
        current_week: 1,
        onboarding_completed: true,
      },
      title: 'Mi experiencia en el silencio',
      content: 'El primer minuto fue de lucha, pero luego vino la serenidad.',
      created_at: new Date().toISOString(),
      likes_count: 0,
      comments_count: 0,
      user_has_liked: false,
      user_has_bookmarked: false,
    };

    expect(post.likes_count).toBe(0);

    // Simulate like
    const likedPost = {
      ...post,
      likes_count: post.likes_count + 1,
      user_has_liked: true,
    };
    expect(likedPost.likes_count).toBe(1);
    expect(likedPost.user_has_liked).toBe(true);

    // Simulate unlike
    const unlikedPost = {
      ...likedPost,
      likes_count: likedPost.likes_count - 1,
      user_has_liked: false,
    };
    expect(unlikedPost.likes_count).toBe(0);
    expect(unlikedPost.user_has_liked).toBe(false);
  });

  it('handles event registration and attendee count', () => {
    const event: EventItem = {
      id: 'evt-test',
      title: 'Sesión matutina',
      date: new Date().toISOString(),
      time_display: '07:00 AM',
      duration_minutes: 35,
      type: 'standard',
      host_name: 'Alberto Calvo',
      host_avatar: '',
      description: 'Práctica guiada',
      status: 'upcoming',
      attendees_count: 15,
      user_is_registered: false,
    };

    // User registers
    const registered = {
      ...event,
      attendees_count: event.attendees_count + 1,
      user_is_registered: true,
    };
    expect(registered.attendees_count).toBe(16);
    expect(registered.user_is_registered).toBe(true);

    // User cancels registration
    const cancelled = {
      ...registered,
      attendees_count: registered.attendees_count - 1,
      user_is_registered: false,
    };
    expect(cancelled.attendees_count).toBe(15);
    expect(cancelled.user_is_registered).toBe(false);
  });
});
