import React, { useState } from 'react';
import { useDataStore } from '../../lib/dataStore';
import { SessionRecording } from '../../types';
import { Film, PlayCircle, Clock, Calendar, Search, X } from 'lucide-react';

export const ArchiveView: React.FC = () => {
  const { recordings } = useDataStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRecordingModal, setActiveRecordingModal] = useState<SessionRecording | null>(null);

  const categories = [
    'Todas',
    'Journaling',
    'Visión',
    'Obstáculos',
    'Trabajo',
    'Relaciones',
    'Propósito',
    'Espiritualidad'
  ];

  const filteredRecordings = recordings.filter(rec => {
    const matchesCategory = selectedCategory === 'Todas' || rec.category === selectedCategory;
    const matchesQuery = 
      rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="max-w-5xl mx-auto py-4 px-4 space-y-6 animate-fade-in">
      {/* Hero Header */}
      <div className="bg-stone-900 text-sand-50 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400 bg-stone-800/80 px-3 py-1 rounded-full border border-stone-700/60 inline-block mb-3">
            Hemeroteca de Sesiones
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            Archivo de Grabaciones
          </h1>
          <p className="text-sand-300 text-xs sm:text-sm mt-1 max-w-lg leading-relaxed">
            Todas las sesiones guiadas matutinas y mentorías de los lunes grabadas en audio y video para que nunca te quedes atrás en el camino.
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="font-serif font-bold text-3xl text-amber-400">{recordings.length}</p>
          <p className="text-xs text-sand-400">Sesiones disponibles</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por temática, palabra clave o descripción de la sesión..."
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

      {/* Recordings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecordings.map(rec => (
          <div
            key={rec.id}
            className="travesia-card overflow-hidden flex flex-col justify-between group hover:border-sand-300 transition-all"
          >
            {/* Thumbnail */}
            <div 
              onClick={() => setActiveRecordingModal(rec)}
              className="relative aspect-video bg-stone-900 cursor-pointer overflow-hidden"
            >
              <img
                src={rec.thumbnail_url}
                alt={rec.title}
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-stone-900/30 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-stone-900/80 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <PlayCircle className="w-6 h-6 text-amber-400" />
                </div>
              </div>
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-sm text-white text-[10px] font-mono font-medium">
                {rec.duration}
              </span>
            </div>

            {/* Info */}
            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                  <span className="font-semibold uppercase tracking-wider text-bronze-700">
                    {rec.category}
                  </span>
                  <span>{new Date(rec.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                </div>

                <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 line-clamp-2 leading-snug group-hover:text-bronze-700 transition-colors">
                  {rec.title}
                </h3>

                <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                  {rec.description}
                </p>
              </div>

              <div className="pt-3 border-t border-sand-100 flex items-center justify-between">
                <span className="text-[11px] text-stone-400">{rec.views_count} visualizaciones</span>
                <button
                  onClick={() => setActiveRecordingModal(rec)}
                  className="text-xs font-semibold text-stone-900 hover:text-bronze-700 flex items-center gap-1"
                >
                  <span>Ver sesión</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal Player */}
      {activeRecordingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-950 text-sand-50 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-800 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  {activeRecordingModal.category} · {activeRecordingModal.duration}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mt-0.5">
                  {activeRecordingModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveRecordingModal(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Box */}
            <div className="aspect-video rounded-2xl bg-stone-900 border border-stone-800 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden">
              <img
                src={activeRecordingModal.thumbnail_url}
                alt={activeRecordingModal.title}
                className="absolute inset-0 w-full h-full object-cover opacity-40"
              />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full bg-bronze-600 text-white flex items-center justify-center shadow-lg mx-auto mb-2 cursor-pointer hover:scale-110 transition-transform">
                  <PlayCircle className="w-8 h-8" />
                </div>
                <p className="font-serif font-bold text-white text-base">
                  Reproduciendo grabación completa
                </p>
                <p className="text-xs text-stone-400 mt-1 max-w-md">
                  {activeRecordingModal.description}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveRecordingModal(null)}
                className="travesia-btn-secondary text-xs bg-stone-800 border-stone-700 text-stone-200 hover:bg-stone-700"
              >
                Cerrar reproductor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
