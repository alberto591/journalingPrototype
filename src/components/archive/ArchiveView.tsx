import React, { useState } from 'react';
import { useDataStore } from '../../lib/dataStore';
import { SessionRecording } from '../../types';
import { RecordingPlayerModal } from '../recordings/RecordingPlayerModal';
import { PlayCircle, Clock, Search } from 'lucide-react';


export const ArchiveView: React.FC = () => {
  const { recordings, currentUser } = useDataStore();
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
            Todas las sesiones guiadas matutinas y mentorías grabadas en video protegido por RLS para que nunca te quedes atrás en el camino.
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
              <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-stone-950/10 transition-colors flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-stone-900/80 text-sand-50 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <PlayCircle className="w-6 h-6 text-amber-400" />
                </div>
              </div>
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-stone-900/90 text-stone-200 text-[10px] font-mono">
                {rec.duration}
              </span>
            </div>

            {/* Info */}
            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-[10px] text-stone-500 mb-1">
                  <span className="font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                    Tema: {rec.category || 'General'}
                  </span>
                  <span className="font-mono">{rec.date}</span>
                </div>

                <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 line-clamp-2 leading-snug group-hover:text-amber-800 transition-colors">
                  {rec.title}
                </h3>

                <div className="flex items-center gap-2 text-[11px] text-stone-500 font-mono">
                  <Clock className="w-3 h-3 text-stone-400" />
                  <span>Duración: {rec.duration || `${Math.floor((rec.duration_seconds || 2100) / 60)} min`}</span>
                </div>

                {rec.description && (
                  <p className="text-xs text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                    {rec.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-sand-100 flex items-center justify-between">
                <span className="text-[11px] text-stone-400">{rec.views_count} reproducciones</span>
                {(rec.storage_path || rec.video_url || rec.external_url) ? (
                  <button
                    onClick={() => setActiveRecordingModal(rec)}
                    className="travesia-btn-accent text-xs py-1.5 px-3 font-semibold text-stone-950 flex items-center gap-1 shadow-xs hover:brightness-105"
                  >
                    <PlayCircle className="w-3.5 h-3.5 text-stone-950" />
                    <span>VER GRABACIÓN</span>
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal Player (Native HTML5 Video with Signed URL) */}
      <RecordingPlayerModal
        recording={activeRecordingModal}
        isOpen={Boolean(activeRecordingModal)}
        onClose={() => setActiveRecordingModal(null)}
      />
    </div>
  );
};

