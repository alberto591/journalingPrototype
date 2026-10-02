import React, { useState } from 'react';
import { useDataStore } from '../../lib/dataStore';
import { PenLine, Send, Tag, ChevronDown, Check } from 'lucide-react';

interface PostComposerProps {
  defaultChannelId?: string;
  onPostCreated?: () => void;
}

export const PostComposer: React.FC<PostComposerProps> = ({ defaultChannelId, onPostCreated }) => {
  const { currentUser, channels, createPost } = useDataStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const primaryChannels = channels.filter(c => 
    c.slug === 'conversacion-principal' || c.slug === 'preguntas-soporte'
  );
  const selectChannels = primaryChannels.length > 0 ? primaryChannels : channels.slice(0, 2);
  const [selectedChannelId, setSelectedChannelId] = useState(defaultChannelId || selectChannels[0]?.id || 'ch-general');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTag, setSelectedTag] = useState('Reflexión');

  const availableTags = ['Reflexión', 'PrácticaDiaria', 'LaVisión', 'LosObstáculos', 'ElTrabajo', 'Victoria', 'Pregunta'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    createPost(selectedChannelId, title, content, [selectedTag]);
    setTitle('');
    setContent('');
    setIsOpen(false);
    if (onPostCreated) onPostCreated();
  };

  return (
    <div className="travesia-card p-4 transition-all">
      {!isOpen ? (
        <div 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img
            src={currentUser.avatar_url}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover border border-sand-300 flex-shrink-0"
          />
          <div className="flex-1 bg-sand-100/70 hover:bg-sand-100 border border-sand-200/80 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-500 transition-colors">
            ¿Qué estás pensando o descubriendo hoy, {currentUser.name.split(' ')[0]}?
          </div>
          <button className="hidden sm:inline-flex travesia-btn-primary text-xs py-2 px-3 flex-shrink-0">
            <PenLine className="w-3.5 h-3.5 mr-1" />
            Publicar
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 animate-fade-in">
          {/* Header controls: Channel selector + Tags */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-sand-100">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-stone-500">Canal:</label>
              <select
                value={selectedChannelId}
                onChange={(e) => setSelectedChannelId(e.target.value)}
                className="text-xs font-semibold bg-sand-100 border border-sand-200 rounded-lg px-2.5 py-1 text-stone-800 focus:outline-none"
              >
                {selectChannels.map(ch => (
                  <option key={ch.id} value={ch.id}>
                    {ch.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`text-[11px] px-2 py-0.5 rounded-full transition-colors whitespace-nowrap ${
                    selectedTag === tag 
                      ? 'bg-stone-900 text-white font-medium' 
                      : 'bg-sand-100 text-stone-600 hover:bg-sand-200'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título o resumen del aporte (opcional)..."
            className="w-full text-base font-serif font-bold text-stone-900 placeholder-stone-400 bg-transparent border-none focus:outline-none px-1"
            autoFocus
          />

          {/* Content */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Comparte una victoria, una lección aprendida, tu compromiso o una pregunta honesta para la hermandad..."
            rows={4}
            className="w-full text-xs sm:text-sm text-stone-800 placeholder-stone-400 bg-sand-50/50 p-3 rounded-xl border border-sand-200 focus:border-stone-400 focus:bg-white resize-none focus:outline-none"
            required
          />

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs text-stone-500 hover:text-stone-800 underline"
            >
              Cancelar
            </button>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={!content.trim()}
                className="travesia-btn-primary text-xs py-2 px-5 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publicar en la Comunidad</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
