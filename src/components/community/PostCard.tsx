import React, { useState } from 'react';
import { Post } from '../../types';
import { useDataStore } from '../../lib/dataStore';
import { CommentThread } from './CommentThread';
import { 
  Heart, 
  MessageSquare, 
  Bookmark, 
  Pin, 
  Share2, 
  MoreVertical, 
  Trash2,
  Check
} from 'lucide-react';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { 
    currentUser, 
    channels, 
    toggleLikePost, 
    toggleBookmarkPost, 
    deletePost 
  } = useDataStore();

  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const channel = channels.find(c => c.id === post.channel_id);
  const isAuthor = currentUser.id === post.author_id;
  const isAdmin = currentUser.role === 'admin';

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + `/posts/${post.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="travesia-card p-5 sm:p-6 space-y-4 transition-all">
      {/* Top Header: Channel badge + Pinned status + Author details + Options */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={post.author.avatar_url}
            alt={post.author.name}
            className="w-10 h-10 rounded-full object-cover border border-sand-300 flex-shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-stone-900 truncate">
                {post.author.name}
              </span>
              {post.author.role === 'admin' && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  Fundador
                </span>
              )}
              {channel && (
                <span className="text-[11px] text-stone-400 font-medium truncate">
                  en <span className="text-stone-700 font-medium">{channel.name}</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5">
              {new Date(post.created_at).toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'short', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>

        {/* Pinned pill & More menu */}
        <div className="flex items-center gap-1.5 flex-shrink-0 relative">
          {post.is_pinned && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              <Pin className="w-3 h-3 text-amber-700 rotate-45" />
              Fijado
            </span>
          )}

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-sand-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-sand-200 py-1.5 z-20 text-xs animate-scale-up">
                <button
                  onClick={handleShare}
                  className="w-full text-left px-3 py-2 hover:bg-sand-50 flex items-center gap-2 text-stone-700"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Enlace copiado' : 'Copiar enlace'}</span>
                </button>
                {(isAuthor || isAdmin) && (
                  <button
                    onClick={() => {
                      deletePost(post.id);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-600 border-t border-sand-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar publicación</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Title & Content */}
      <div className="space-y-2">
        {post.title && (
          <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-900 leading-snug">
            {post.title}
          </h3>
        )}
        <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line font-normal">
          {post.content}
        </p>
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {post.tags.map(t => (
            <span
              key={t}
              className="text-[11px] px-2 py-0.5 rounded-full bg-sand-100 text-stone-600 font-medium"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Actions footer: Like, Comments toggle, Bookmark, Share */}
      <div className="flex items-center justify-between pt-3 border-t border-sand-100 text-xs text-stone-500">
        <div className="flex items-center gap-4">
          {/* Like button */}
          <button
            onClick={() => toggleLikePost(post.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
              post.user_has_liked
                ? 'text-rose-600 font-semibold bg-rose-50'
                : 'hover:text-stone-900 hover:bg-sand-100'
            }`}
          >
            <Heart className={`w-4 h-4 ${post.user_has_liked ? 'fill-rose-600' : ''}`} />
            <span>{post.likes_count}</span>
          </button>

          {/* Comments toggle */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
              showComments ? 'bg-sand-100 text-stone-900 font-semibold' : 'hover:text-stone-900 hover:bg-sand-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{post.comments_count} {post.comments_count === 1 ? 'comentario' : 'comentarios'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Bookmark */}
          <button
            onClick={() => toggleBookmarkPost(post.id)}
            className={`p-1.5 rounded-lg transition-colors ${
              post.user_has_bookmarked
                ? 'text-amber-600 bg-amber-50'
                : 'hover:text-stone-900 hover:bg-sand-100'
            }`}
            title="Guardar en marcadores"
          >
            <Bookmark className={`w-4 h-4 ${post.user_has_bookmarked ? 'fill-amber-600' : ''}`} />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg hover:text-stone-900 hover:bg-sand-100 transition-colors"
            title="Compartir"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Comments Thread (Expanded) */}
      {showComments && <CommentThread postId={post.id} />}
    </article>
  );
};
