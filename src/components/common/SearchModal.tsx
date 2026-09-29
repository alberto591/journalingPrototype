import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  X, 
  MessageSquare, 
  Users, 
  BookOpen, 
  Calendar, 
  Film, 
  FileText,
  ArrowRight
} from 'lucide-react';
import { useDataStore } from '../../lib/dataStore';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { posts, members, lessons, events, books, recordings } = useDataStore();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { posts: [], members: [], lessons: [], events: [], books: [], recordings: [] };

    return {
      posts: posts.filter(p => 
        (p.title && p.title.toLowerCase().includes(q)) || 
        p.content.toLowerCase().includes(q)
      ).slice(0, 4),
      members: members.filter(m => 
        m.name.toLowerCase().includes(q) || 
        m.bio.toLowerCase().includes(q)
      ).slice(0, 4),
      lessons: lessons.filter(l => 
        l.title.toLowerCase().includes(q) || 
        l.content_markdown.toLowerCase().includes(q)
      ).slice(0, 4),
      events: events.filter(e => 
        e.title.toLowerCase().includes(q) || 
        e.description.toLowerCase().includes(q)
      ).slice(0, 3),
      books: books.filter(b => 
        b.title.toLowerCase().includes(q) || 
        b.author.toLowerCase().includes(q) ||
        b.summary.toLowerCase().includes(q)
      ).slice(0, 3),
      recordings: recordings.filter(r => 
        r.title.toLowerCase().includes(q) || 
        r.description.toLowerCase().includes(q)
      ).slice(0, 3),
    };
  }, [query, posts, members, lessons, events, books, recordings]);

  const totalResults = 
    results.posts.length + 
    results.members.length + 
    results.lessons.length + 
    results.events.length + 
    results.books.length + 
    results.recordings.length;

  if (!isOpen) return null;

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-sand-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-sand-200">
          <Search className="w-5 h-5 text-stone-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar publicaciones, reflexiones, miembros, lecciones, libros o eventos..."
            className="w-full bg-transparent text-stone-800 placeholder-stone-400 text-base focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-stone-400 hover:text-stone-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs text-stone-400 bg-sand-100 rounded border border-sand-200">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-4 space-y-6 flex-1">
          {query.trim() === '' ? (
            <div className="py-12 text-center text-stone-400 space-y-2">
              <p className="text-sm">Escribe una palabra clave para buscar en TRAVESÍA.</p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {['Ruido', 'Disciplina', 'Oración', 'Hábitos', 'Ansiedad', 'Visión'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="text-xs px-2.5 py-1 rounded-full bg-sand-100 text-stone-600 hover:bg-sand-200 hover:text-stone-900 transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center text-stone-500">
              <p className="text-sm">No encontramos resultados para "{query}".</p>
              <p className="text-xs text-stone-400 mt-1">Intenta con otro término o categoría.</p>
            </div>
          ) : (
            <>
              {/* Publicaciones */}
              {results.posts.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 px-2">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Publicaciones en Comunidad ({results.posts.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.posts.map(post => (
                      <button
                        key={post.id}
                        onClick={() => handleSelect(`/community`)}
                        className="w-full text-left p-3 rounded-xl hover:bg-sand-100/80 transition-colors flex items-start justify-between group"
                      >
                        <div className="pr-4">
                          <p className="text-sm font-medium text-stone-900 group-hover:text-bronze-600 line-clamp-1">
                            {post.title || post.content.substring(0, 60)}
                          </p>
                          <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                            {post.author.name} · {post.content}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Lecciones */}
              {results.lessons.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 px-2">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Lecciones del Camino ({results.lessons.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.lessons.map(lesson => (
                      <button
                        key={lesson.id}
                        onClick={() => handleSelect(`/lessons`)}
                        className="w-full text-left p-3 rounded-xl hover:bg-sand-100/80 transition-colors flex items-start justify-between group"
                      >
                        <div>
                          <p className="text-sm font-medium text-stone-900 group-hover:text-bronze-600">
                            {lesson.title}
                          </p>
                          <p className="text-xs text-stone-500 mt-0.5">
                            {lesson.module_title} · {lesson.duration_minutes} min
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Miembros */}
              {results.members.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 px-2">
                    <Users className="w-3.5 h-3.5" />
                    <span>Miembros ({results.members.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.members.map(member => (
                      <button
                        key={member.id}
                        onClick={() => handleSelect(`/members`)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-sand-100/80 transition-colors flex items-center gap-3 group"
                      >
                        <img 
                          src={member.avatar_url} 
                          alt={member.name} 
                          className="w-8 h-8 rounded-full object-cover border border-sand-200" 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-stone-900 group-hover:text-bronze-600 truncate">
                            {member.name}
                          </p>
                          <p className="text-xs text-stone-500 truncate">{member.bio || member.location}</p>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-sand-100 text-stone-600 capitalize">
                          {member.role === 'admin' ? 'Fundador' : 'Miembro'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Libros & Grabaciones */}
              {(results.books.length > 0 || results.recordings.length > 0) && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 px-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Biblioteca y Archivo ({results.books.length + results.recordings.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.books.map(b => (
                      <button
                        key={b.id}
                        onClick={() => handleSelect(`/library`)}
                        className="w-full text-left p-3 rounded-xl hover:bg-sand-100/80 transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <p className="text-sm font-medium text-stone-900 group-hover:text-bronze-600">
                            {b.title} <span className="text-stone-400 font-normal">por {b.author}</span>
                          </p>
                          <span className="text-xs text-stone-500">{b.category}</span>
                        </div>
                        <span className="text-xs text-bronze-700 font-medium">Libro</span>
                      </button>
                    ))}
                    {results.recordings.map(r => (
                      <button
                        key={r.id}
                        onClick={() => handleSelect(`/archive`)}
                        className="w-full text-left p-3 rounded-xl hover:bg-sand-100/80 transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <p className="text-sm font-medium text-stone-900 group-hover:text-bronze-600">
                            {r.title}
                          </p>
                          <span className="text-xs text-stone-500">{r.duration} · {r.category}</span>
                        </div>
                        <span className="text-xs text-stone-500 font-medium flex items-center gap-1">
                          <Film className="w-3 h-3" /> Grabación
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Eventos */}
              {results.events.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 px-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Eventos y Sesiones ({results.events.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.events.map(event => (
                      <button
                        key={event.id}
                        onClick={() => handleSelect(`/events`)}
                        className="w-full text-left p-3 rounded-xl hover:bg-sand-100/80 transition-colors flex items-start justify-between group"
                      >
                        <div>
                          <p className="text-sm font-medium text-stone-900 group-hover:text-bronze-600">
                            {event.title}
                          </p>
                          <p className="text-xs text-stone-500 mt-0.5">{event.time_display}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-3 border-t border-sand-200 bg-sand-50/50 flex justify-between items-center text-xs text-stone-400">
          <span>Usa <kbd className="px-1.5 py-0.5 bg-white border border-sand-200 rounded text-stone-600">↑</kbd> <kbd className="px-1.5 py-0.5 bg-white border border-sand-200 rounded text-stone-600">↓</kbd> para navegar</span>
          <button onClick={onClose} className="hover:text-stone-700">Cerrar</button>
        </div>
      </div>
    </div>
  );
};
