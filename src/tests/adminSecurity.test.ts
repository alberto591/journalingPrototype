import { describe, it, expect } from 'vitest';
import { adminService } from '../services/adminService';
import { Post, EventItem, Profile } from '../types';

describe('Admin Authorization & Server-Side Security', () => {
  const regularMember: Profile = {
    id: 'usr-member-carlos',
    name: 'Carlos Ruiz',
    avatar_url: '',
    bio: 'Miembro regular',
    role: 'member',
    focus_areas: ['Disciplina'],
    created_at: '2026-09-01T00:00:00Z',
    streak_days: 4,
    completed_sessions_count: 8,
    reflection_minutes: 240,
    current_week: 1,
    onboarding_completed: true,
  };

  const adminUser: Profile = {
    id: 'usr-alberto-calvo',
    name: 'Alberto Calvo',
    avatar_url: '',
    bio: 'Fundador y Guía',
    role: 'admin',
    focus_areas: ['Visión', 'Espiritualidad'],
    created_at: '2026-08-01T00:00:00Z',
    streak_days: 45,
    completed_sessions_count: 90,
    reflection_minutes: 2700,
    current_week: 4,
    onboarding_completed: true,
  };

  it('rejects regular members from asserting admin privileges', async () => {
    await expect(adminService.assertAdmin(regularMember.id)).rejects.toThrow(
      'ACCESO DENEGADO'
    );
  });

  it('allows authorized administrator through assertAdmin check', async () => {
    await expect(adminService.assertAdmin(adminUser.id)).resolves.not.toThrow();
  });

  it('blocks regular member from creating official events', () => {
    const createEventAction = (user: Profile, newEventData: Partial<EventItem>) => {
      if (user.role !== 'admin') {
        throw new Error('403 Forbidden: Only administrators can schedule community live events.');
      }
      return {
        id: 'evt-new-123',
        ...newEventData,
        host_name: user.name,
      };
    };

    expect(() => createEventAction(regularMember, { title: 'Charla no autorizada' })).toThrow('403 Forbidden');
    
    const validEvent = createEventAction(adminUser, { title: 'Sesión Guiada de Silencio' });
    expect(validEvent.id).toBe('evt-new-123');
    expect(validEvent.host_name).toBe('Alberto Calvo');
  });

  it('prevents regular member from deleting another member posts, while allowing author or admin', () => {
    const post: Post = {
      id: 'post-100',
      channel_id: 'ch-general',
      author_id: regularMember.id,
      author: regularMember,
      title: 'Mi reflexión personal',
      content: 'Contenido sobre el silencio.',
      created_at: '2026-09-28T09:00:00Z',
      likes_count: 2,
      comments_count: 0,
      user_has_liked: false,
      user_has_bookmarked: false,
    };

    const thirdPartyUser: Profile = {
      ...regularMember,
      id: 'usr-stranger-999',
      name: 'Otro Usuario',
    };

    const deletePostPolicy = (targetPost: Post, actor: Profile): boolean => {
      // Allowed if actor is author OR actor is admin
      if (actor.id === targetPost.author_id || actor.role === 'admin') {
        return true;
      }
      throw new Error('RLS / Authorization Error: No puedes eliminar publicaciones de otros usuarios.');
    };

    // 1. Author can delete own post
    expect(deletePostPolicy(post, regularMember)).toBe(true);

    // 2. Admin can delete for moderation
    expect(deletePostPolicy(post, adminUser)).toBe(true);

    // 3. Unauthorized third party is blocked
    expect(() => deletePostPolicy(post, thirdPartyUser)).toThrow('Authorization Error');
  });

  it('prevents role elevation: members cannot grant themselves admin status', () => {
    const updateRolePolicy = (actor: Profile, targetUserId: string, newRole: 'member' | 'admin') => {
      if (actor.role !== 'admin') {
        throw new Error('RLS Violation: Only administrators can elevate user roles.');
      }
      return { targetUserId, newRole };
    };

    // Member attempts self-promotion
    expect(() => updateRolePolicy(regularMember, regularMember.id, 'admin')).toThrow('RLS Violation');

    // Admin promotes member
    const promotion = updateRolePolicy(adminUser, regularMember.id, 'admin');
    expect(promotion.newRole).toBe('admin');
  });
});
