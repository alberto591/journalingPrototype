import React, { useState } from 'react';
import { useDataStore } from '../../lib/dataStore';
import { Book } from '../../types';
import { BookOpen, Search, Sparkles, CheckCircle2, ChevronRight, X } from 'lucide-react';

export const LibraryView: React.FC = () => {
  const { books } = useDataStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBookModal, setActiveBookModal] = useState<Book | null>(null);

  const categories = [
    'Todas',
    'Propósito',
    'Relaciones',
    'Espiritualidad',
    'Hábitos',
    'Disciplina',
    'Mentalidad',
    'Journaling',
    'Liderazgo'
  ];

  const filteredBooks = books.filter(b => {
    const matchesCategory = selectedCategory === 'Todas' || b.category === selectedCategory;
    const matchesQuery = 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="max-w-5xl mx-auto py-4 px-4 space-y-6 animate-fade-in">
      {/* Hero Header */}
      <div className="bg-stone-900 text-sand-50 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400 bg-stone-800/80 px-3 py-1 rounded-full border border-stone-700/60 inline-block mb-3">
            Biblioteca Seleccionada
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            Lecturas Esenciales para la Travesía
          </h1>
          <p className="text-sand-300 text-xs sm:text-sm mt-1 max-w-lg leading-relaxed">
            Libros formativos, clásicos del espíritu y tratados de disciplina desglosados en sus ideas maestras para nutrir tu diario matutino.
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="font-serif font-bold text-3xl text-amber-400">{books.length}</p>
          <p className="text-xs text-sand-400">Obras comentadas</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título, autor o palabras clave en resúmenes..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-sand-200 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 shadow-subtle"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-sand-100 text-stone-600 hover:bg-sand-200 hover:text-stone-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBooks.map(book => (
          <div
            key={book.id}
            className="travesia-card p-5 flex flex-col justify-between space-y-4 hover:border-sand-300 transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-sand-100 text-stone-700">
                  {book.category}
                </span>
                <span className="text-xs text-stone-400 font-medium">TRAVESÍA Recomienda</span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900 leading-snug">
                  {book.title}
                </h3>
                <p className="text-xs text-stone-500 font-medium">por {book.author}</p>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                {book.summary}
              </p>

              {/* Key Takeaways snippet */}
              <div className="p-3 rounded-xl bg-sand-50/70 border border-sand-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-bronze-700 block">
                  Idea Clave:
                </span>
                <p className="text-xs text-stone-700 italic">
                  "{book.key_takeaways[0]}"
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-sand-100 flex justify-end">
              <button
                onClick={() => setActiveBookModal(book)}
                className="text-xs font-semibold text-bronze-700 hover:text-bronze-900 flex items-center gap-1"
              >
                <span>Ver desglose y lecciones</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Book Detail Modal */}
      {activeBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-sand-200 space-y-5 animate-scale-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-bronze-700 tracking-wider">
                  {activeBookModal.category}
                </span>
                <h3 className="font-serif font-bold text-2xl text-stone-900 mt-1">
                  {activeBookModal.title}
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  Autor: {activeBookModal.author}
                </p>
              </div>
              <button
                onClick={() => setActiveBookModal(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-stone-700 leading-relaxed">
              <div>
                <h4 className="font-serif font-bold text-stone-900 text-sm mb-1">
                  Resumen de la Obra:
                </h4>
                <p>{activeBookModal.summary}</p>
              </div>

              <div>
                <h4 className="font-serif font-bold text-stone-900 text-sm mb-2">
                  Las 3 Lecciones Maestras para tu Diario:
                </h4>
                <div className="space-y-2">
                  {activeBookModal.key_takeaways.map((idea, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-sand-50 border border-sand-200 flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-sand-200 text-stone-800 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-stone-800 leading-snug">{idea}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-sand-200 flex justify-end">
              <button
                onClick={() => setActiveBookModal(null)}
                className="travesia-btn-primary text-xs py-2 px-5"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
