import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Post, Comment, Channel } from '../types';
import { DEMO_CHANNELS, DEMO_POSTS, DEMO_COMMENTS } from '../data/demo/seedData';

export const communityService = {
  // Fetch all channels
  async fetchChannels(): Promise<{ channels: Channel[]; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { channels: DEMO_CHANNELS, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .order('order_index', { ascending: true });

      if (error || !data || data.length === 0) {
        return { channels: DEMO_CHANNELS, error: error ? error.message : null };
      }

      return { channels: data as Channel[], error: null };
    } catch (err: any) {
      return { channels: DEMO_CHANNELS, error: err?.message || 'Error al obtener los canales.' };
    }
  },

  // Fetch posts (optionally filtered by channel)
  async fetchPosts(channelId?: string): Promise<{ posts: Post[]; error: string | null }> {
    if (!isSupabaseConfigured) {
      const filtered = channelId ? DEMO_POSTS.filter(p => p.channel_id === channelId) : DEMO_POSTS;
      return { posts: filtered, error: null };
    }

    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          author:profiles(*)
        `)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (channelId) {
        query = query.eq('channel_id', channelId);
      }

      const { data, error } = await query;
      if (error) {
        return { posts: [], error: error.message };
      }

      return { posts: (data as Post[]) || [], error: null };
    } catch (err: any) {
      return { posts: [], error: err?.message || 'Error al cargar las publicaciones.' };
    }
  },

  // Create post
  async createPost(
    authorId: string, 
    channelId: string, 
    title: string, 
    content: string, 
    tags: string[] = ['Reflexión']
  ): Promise<{ post: Post | null; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { post: null, error: 'No conectado a Supabase' };
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          channel_id: channelId,
          author_id: authorId,
          title: title.trim() || null,
          content: content.trim(),
          tags,
          likes_count: 0,
          comments_count: 0,
        })
        .select(`*, author:profiles(*)`)
        .single();

      if (error) {
        return { post: null, error: error.message };
      }

      return { post: data as Post, error: null };
    } catch (err: any) {
      return { post: null, error: err?.message || 'Error al publicar en el servidor.' };
    }
  },

  // Delete post (server-side RLS permits author or admin)
  async deletePost(postId: string): Promise<{ success: boolean; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { success: true, error: null };
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      return { success: !error, error: error ? error.message : null };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error al eliminar la publicación.' };
    }
  },

  // Toggle reaction / like
  async toggleLike(postId: string, userId: string): Promise<{ isLiked: boolean; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { isLiked: true, error: null };
    }

    try {
      // Check if user already liked
      const { data: existing } = await supabase
        .from('post_reactions')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('post_reactions')
          .delete()
          .eq('id', existing.id);

        return { isLiked: false, error: null };
      } else {
        await supabase
          .from('post_reactions')
          .insert({
            post_id: postId,
            user_id: userId,
            reaction_type: 'like',
          });

        return { isLiked: true, error: null };
      }
    } catch (err: any) {
      return { isLiked: false, error: err?.message || 'Error al registrar reacción.' };
    }
  },

  // Fetch comments for a post
  async fetchComments(postId: string): Promise<{ comments: Comment[]; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { comments: DEMO_COMMENTS.filter(c => c.post_id === postId), error: null };
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`*, author:profiles(*)`)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        return { comments: [], error: error.message };
      }

      return { comments: (data as Comment[]) || [], error: null };
    } catch (err: any) {
      return { comments: [], error: err?.message || 'Error al cargar comentarios.' };
    }
  },

  // Add comment
  async addComment(
    authorId: string, 
    postId: string, 
    content: string
  ): Promise<{ comment: Comment | null; error: string | null }> {
    if (!isSupabaseConfigured) {
      return { comment: null, error: 'No conectado a Supabase' };
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: authorId,
          content: content.trim(),
          likes_count: 0,
        })
        .select(`*, author:profiles(*)`)
        .single();

      if (error) {
        return { comment: null, error: error.message };
      }

      // Update comments_count in post
      try {
        await supabase.rpc('increment_post_comments', { post_id_arg: postId });
      } catch {
        // Non-blocking counter update
      }

      return { comment: data as Comment, error: null };
    } catch (err: any) {
      return { comment: null, error: err?.message || 'Error al publicar comentario.' };
    }
  }
};
