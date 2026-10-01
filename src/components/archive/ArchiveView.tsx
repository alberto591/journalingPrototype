import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../../lib/dataStore';
import { SessionRecording } from '../../types';
import { RecordingPlayerModal } from '../recordings/RecordingPlayerModal';
import { MembershipAccessGate } from '../modals/MembershipAccessGate';
import { PlayCircle, Clock, Search, Film, Upload, Plus, ArrowRight } from 'lucide-react';

export const ArchiveView: React.FC = () => {
  const navigate = useNavigate();
  const { recordings, events, currentUser } = useDataStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRecordingModal, setActiveRecordingModal] = useState<SessionRecording | null>(null);
  const [showAccessGate, setShowAccessGate] = useState(false);
  const [selectedLockedRecording, setSelectedLockedRecording] = useState<SessionRecording | null>(null);

  const categories = [
    'Todas',
    'El Presente',
    'La Visión',
    'Los Obstáculos',
    'El Trabajo',
    'Relaciones',
    'Propósito',
    'Espiritualidad',
    'Journaling'
  ];

  // Combine direct recordings and any recorded events
  const allRecordings = React.useMemo(() => {
    const list = [...recordings];
    events.forEach(evt => {
      const alreadyIncluded = list.some(r => r.event_id === evt.id || r.id === evt.recording_id);
      if (!alreadyIncluded && (evt.recording_url || evt.recording_id)) {
        list.push({
          id: evt.recording_id || `rec-${evt.id}`,
          event_id: evt.id,
          title: evt.title,
          description: evt.description,
          date: evt.date ? evt.date.split('T')[0] : '2026-09-28',
          duration: `${evt.duration_minutes || 35} min`,
          duration_seconds: (evt.duration_minutes || 35) * 60,
          category: evt.theme || 'El Presente',
          storage_path: evt.recording_storage_path || evt.recording_url,
          video_url: evt.recording_url,
          thumbnail_url: evt.thumbnail_url || 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop&q=80',
          status: 'AVAILABLE',
          views_count: evt.attendees_count || 24,
          is_member_only: true,
        });
      }
    });
    return list;
  }, [recordings, events]);

  const filteredRecordings = allRecordings.filter(rec => {
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
            Hemeroteca de Sesiones en Directo
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            Grabaciones de Sesiones en Directo
          </h1>
          <p className="text-sand-300 text-xs sm:text-sm mt-1 max-w-lg leading-relaxed">
            Aquí tienes acceso a todas las sesiones de práctica matutina y mentorías en vivo grabadas para que practiques a tu propio ritmo.
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-3 flex-shrink-0">
          <div className="text-left sm:text-right">
            <p className="font-serif font-bold text-3xl text-amber-400">{allRecordings.length}</p>
            <p className="text-xs text-sand-400">Grabaciones disponibles</p>
          </div>
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => navigate('/admin?tab=events')}
              className="text-xs font-semibold py-2 px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 flex items-center gap-1.5 shadow-sm transition-all"
              title="Ir al panel de administración para subir o gestionar grabaciones"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Subir Grabación MP4</span>
            </button>
          )}
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

      {/* Recordings Grid / Empty State */}
      {filteredRecordings.length === 0 ? (
        <div className="travesia-card p-10 sm:p-14 text-center bg-sand-50/70 border border-dashed border-sand-300 rounded-3xl space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700">
            <Film className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="font-serif font-bold text-lg text-stone-900">
              {searchQuery || selectedCategory !== 'Todas' 
                ? 'No se encontraron grabaciones con esos filtros'
                : 'Aún no hay grabaciones en la hemeroteca'}
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              {searchQuery || selectedCategory !== 'Todas'
                ? 'Prueba a cambiar los términos de búsqueda o a seleccionar otra temática.'
                : 'Las grabaciones de las sesiones matutinas en directo se procesan y publican aquí tras finalizar cada encuentro para que los miembros practiquen a su propio ritmo.'}
            </p>
          </div>

          {currentUser?.role === 'admin' && (
            <div className="pt-2">
              <button
                onClick={() => navigate('/admin?tab=events')}
                className="travesia-btn-primary text-xs py-2.5 px-5 font-bold inline-flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Gestionar Sesiones y Subir MP4</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecordings.map(rec => (
          <div
            key={rec.id}
            className="travesia-card overflow-hidden flex flex-col justify-between group hover:border-sand-300 transition-all"
          >
            {/* Thumbnail */}
            <div 
              onClick={() => {
                if (currentUser?.membership_status === 'EXPIRED') {
                  setSelectedLockedRecording(rec);
                  setShowAccessGate(true);
                  return;
                }
                setActiveRecordingModal(rec);
              }}
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
                  currentUser?.membership_status === 'EXPIRED' ? (
                    <button
                      onClick={() => {
                        setSelectedLockedRecording(rec);
                        setShowAccessGate(true);
                      }}
                      className="travesia-btn-accent text-xs py-1.5 px-3 font-semibold text-stone-950 flex items-center gap-1 shadow-xs hover:brightness-105"
                      title="Grabación disponible para miembros"
                    >
                      <span>CONTINUAR EN TRAVESÍA</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveRecordingModal(rec)}
                      className="travesia-btn-accent text-xs py-1.5 px-3 font-semibold text-stone-950 flex items-center gap-1 shadow-xs hover:brightness-105"
                    >
                      <PlayCircle className="w-3.5 h-3.5 text-stone-950" />
                      <span>VER REPLAY</span>
                    </button>
                  )
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Video Modal Player (Native HTML5 Video with Signed URL) */}
      <RecordingPlayerModal
        recording={activeRecordingModal}
        isOpen={Boolean(activeRecordingModal)}
        onClose={() => setActiveRecordingModal(null)}
      />

      {/* Membership Access Gate for Expired Users */}
      <MembershipAccessGate
        isOpen={showAccessGate}
        onClose={() => setShowAccessGate(false)}
        featureTitle={selectedLockedRecording?.title}
        sourceContext="archive_recording"
      />
    </div>
  );
};

