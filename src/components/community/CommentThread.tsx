import React, { useState } from 'react';
import { useDataStore } from '../../lib/dataStore';
import { Comment } from '../../types';
import { Heart, Send, CornerDownRight } from 'lucide-react';

interface CommentThreadProps {
  postId: string;
}

export const CommentThread: React.FC<CommentThreadProps> = ({ postId }) => {
  const { comments, currentUser, addComment } = useDataStore();
  const [commentText, setCommentText] = useState('');

  const postComments = comments.filter(c => c.post_id === postId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    addComment(postId, commentText);
    setCommentText('');
  };

  return (
    <div className="pt-4 border-t border-sand-100 space-y-4">
      {/* Existing Comments */}
      {postComments.length > 0 && (
        <div className="space-y-3">
          {postComments.map(comment => (
            <div key={comment.id} className="flex gap-3 text-xs text-stone-700 animate-fade-in">
              <img
                src={comment.author.avatar_url}
                alt={comment.author.name}
                className="w-7 h-7 rounded-full object-cover border border-sand-300 flex-shrink-0"
              />
              <div className="flex-1 bg-sand-50/70 p-3 rounded-2xl border border-sand-200/80">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-stone-900">{comment.author.name}</span>
                    {comment.author.role === 'admin' && (
                      <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                        Fundador
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-stone-400">
                    {new Date(comment.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p className="text-stone-700 leading-relaxed whitespace-pre-line text-xs">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Comment Input */}
      <form onSubmit={handleSubmit} className="flex gap-2.5 items-center pt-1">
        <img
          src={currentUser.avatar_url}
          alt={currentUser.name}
          className="w-7 h-7 rounded-full object-cover border border-sand-300 flex-shrink-0"
        />
        <div className="flex-1 relative">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Escribe una respuesta o palabra de ánimo..."
            className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-sand-100/60 border border-sand-200 focus:border-stone-400 focus:bg-white text-xs text-stone-800 placeholder-stone-400 focus:outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-stone-500 hover:text-stone-900 disabled:opacity-30"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
