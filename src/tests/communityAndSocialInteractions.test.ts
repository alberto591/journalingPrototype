import { describe, it, expect } from 'vitest';
import { Post, Comment, Profile } from '../types';

describe('Community Posts, Comments & Reactions Logic', () => {
  const author: Profile = {
    id: 'usr-author-1',
    name: 'Elena Gómez',
    avatar_url: '',
    bio: 'Explorando el silencio',
    role: 'member',
    focus_areas: ['Ruido', 'Disciplina'],
    created_at: '2026-09-01T00:00:00Z',
    streak_days: 10,
    completed_sessions_count: 20,
    reflection_minutes: 600,
    current_week: 2,
    onboarding_completed: true,
  };

  it('creates community post with mandatory channel and content', () => {
    const newPost: Post = {
      id: 'post-101',
      channel_id: 'ch-ruido',
      author_id: author.id,
      author,
      title: 'Cómo desactivar las notificaciones me devolvió 2 horas al día',
      content: 'Llevo 10 días aplicando el movimiento 1. El impacto en mi paz mental ha sido inmediato.',
      created_at: new Date().toISOString(),
      likes_count: 0,
      comments_count: 0,
      user_has_liked: false,
      user_has_bookmarked: false,
    };

    expect(newPost.title).toBeTruthy();
    expect(newPost.channel_id).toBe('ch-ruido');
    expect(newPost.author_id).toBe(author.id);
    expect(newPost.likes_count).toBe(0);
  });

  it('filters posts by pinned status and channel correctly', () => {
    const postList: Post[] = [
      {
        id: 'p-1',
        channel_id: 'ch-ruido',
        author_id: author.id,
        author,
        title: 'Post común en ruido',
        content: '',
        created_at: '',
        likes_count: 0,
        comments_count: 0,
        user_has_liked: false,
        user_has_bookmarked: false,
        is_pinned: false,
      },
      {
        id: 'p-2',
        channel_id: 'ch-ruido',
        author_id: author.id,
        author,
        title: 'Reglas fijadas del canal',
        content: '',
        created_at: '',
        likes_count: 5,
        comments_count: 2,
        user_has_liked: false,
        user_has_bookmarked: false,
        is_pinned: true,
      },
      {
        id: 'p-3',
        channel_id: 'ch-vision',
        author_id: author.id,
        author,
        title: 'Post en canal de visión',
        content: '',
        created_at: '',
        likes_count: 0,
        comments_count: 0,
        user_has_liked: false,
        user_has_bookmarked: false,
      },
    ];

    const ruidoPosts = postList.filter(p => p.channel_id === 'ch-ruido');
    expect(ruidoPosts).toHaveLength(2);

    const pinnedRuidoPosts = ruidoPosts.filter(p => p.is_pinned);
    expect(pinnedRuidoPosts).toHaveLength(1);
    expect(pinnedRuidoPosts[0].title).toBe('Reglas fijadas del canal');
  });

  it('adds comments to a post and links back to parent post correctly', () => {
    const post: Post = {
      id: 'post-with-comments',
      channel_id: 'ch-general',
      author_id: author.id,
      author,
      title: 'Pregunta sobre la escucha en oración',
      content: '¿Cómo manejáis la sensación de sequedad espiritual?',
      created_at: new Date().toISOString(),
      likes_count: 1,
      comments_count: 0,
      user_has_liked: false,
      user_has_bookmarked: false,
    };

    let commentList: Comment[] = [];

    const addComment = (targetPostId: string, content: string, user: Profile): Comment => {
      const comment: Comment = {
        id: `cmt-${Date.now()}`,
        post_id: targetPostId,
        author_id: user.id,
        author: user,
        content,
        created_at: new Date().toISOString(),
        likes_count: 0,
        user_has_liked: false,
      };
      commentList.push(comment);
      return comment;
    };

    const c1 = addComment(post.id, 'La sequedad es parte de la poda. Persevera en el hábito sin esperar euforia.', author);
    expect(c1.post_id).toBe('post-with-comments');
    expect(commentList).toHaveLength(1);

    // Filter comments for this post
    const postComments = commentList.filter(c => c.post_id === post.id);
    expect(postComments).toHaveLength(1);
    expect(postComments[0].content).toContain('La sequedad es parte de la poda');
  });

  it('toggles bookmarks for personal saving and quick reference', () => {
    let post: Post = {
      id: 'post-bookmarkable',
      channel_id: 'ch-general',
      author_id: author.id,
      author,
      title: 'Decálogo del trabajo bien hecho',
      content: 'Puntos clave para el discernimiento.',
      created_at: new Date().toISOString(),
      likes_count: 3,
      comments_count: 1,
      user_has_liked: false,
      user_has_bookmarked: false,
    };

    const toggleBookmark = (p: Post): Post => ({
      ...p,
      user_has_bookmarked: !p.user_has_bookmarked,
    });

    post = toggleBookmark(post);
    expect(post.user_has_bookmarked).toBe(true);

    post = toggleBookmark(post);
    expect(post.user_has_bookmarked).toBe(false);
  });
});
