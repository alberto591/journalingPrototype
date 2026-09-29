import React, { useState } from 'react';
import { useDataStore } from '../../lib/dataStore';
import { Profile, Post } from '../../types';
import { Search, Users, MapPin, Calendar, Flame, Lock, X, MessageSquare } from 'lucide-react';

export const MembersView: React.FC = () => {
  const { members, posts } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.location && m.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
    m.focus_areas.some(fa => fa.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const memberPublicPosts = activeProfile 
    ? posts.filter(p => p.author_id === activeProfile.id)
    : [];

  return (
    <div className="max-w-5xl mx-auto py-4 px-4 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-stone-900 text-sand-50 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400 bg-stone-800/80 px-3 py-1 rounded-full border border-stone-700/60 inline-block mb-3">
            Círculo de Fraternidad
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            Directorio de Miembros
          </h1>
          <p className="text-sand-300 text-xs sm:text-sm mt-1 max-w-lg leading-relaxed">
            Hombres y mujeres en el camino del autodominio, el silencio consciente y la rendición de cuentas honesta.
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="font-serif font-bold text-3xl text-amber-400">{members.length}</p>
          <p className="text-xs text-sand-400">Hermanos en el camino</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por nombre, ciudad, vocación o área de enfoque..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-sand-200 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 shadow-subtle"
        />
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredMembers.map(member => (
          <div
            key={member.id}
            onClick={() => setActiveProfile(member)}
            className="travesia-card p-5 cursor-pointer hover:border-sand-300 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={member.avatar_url}
                  alt={member.name}
                  className="w-12 h-12 rounded-full object-cover border border-sand-300 flex-shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-serif font-bold text-sm text-stone-900 group-hover:text-bronze-700 transition-colors truncate">
                      {member.name}
                    </h3>
                  </div>
                  {member.role === 'admin' ? (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                      Fundador
                    </span>
                  ) : (
                    <span className="text-[10px] text-stone-400 font-medium">
                      Semana {member.current_week}
                    </span>
                  )}
                  {member.location && (
                    <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 text-stone-400 flex-shrink-0" />
                      <span>{member.location}</span>
                    </p>
                  )}
                </div>
              </div>

              <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                {member.bio || 'Miembro de la comunidad TRAVESÍA en busca de dirección y profundidad.'}
              </p>

              {member.focus_areas && member.focus_areas.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {member.focus_areas.map(fa => (
                    <span key={fa} className="text-[10px] px-2 py-0.5 rounded-full bg-sand-100 text-stone-600">
                      {fa}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-sand-100 flex items-center justify-between text-xs text-stone-500">
              <span className="flex items-center gap-1 text-amber-700 font-medium">
                <Flame className="w-3.5 h-3.5 text-amber-500" /> {member.streak_days}d racha
              </span>
              <span className="text-bronze-700 font-semibold group-hover:underline">
                Ver perfil →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Member Profile Modal (STRICTLY EXCLUDES PRIVATE JOURNALS) */}
      {activeProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-sand-200 space-y-6 animate-scale-up max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={activeProfile.avatar_url}
                  alt={activeProfile.name}
                  className="w-16 h-16 rounded-full object-cover border border-sand-300"
                />
                <div>
                  <h3 className="font-serif font-bold text-2xl text-stone-900">
                    {activeProfile.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-sand-100 text-stone-700 font-semibold capitalize">
                      {activeProfile.role === 'admin' ? 'Fundador / Guía' : 'Miembro'}
                    </span>
                    {activeProfile.location && (
                      <span className="text-xs text-stone-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-400" /> {activeProfile.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveProfile(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bio */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                Sobre él/ella:
              </h4>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-sand-50 p-4 rounded-2xl border border-sand-200">
                {activeProfile.bio || 'Miembro activo comprometido con la disciplina y el trabajo interior.'}
              </p>
            </div>

            {/* Focus areas */}
            {activeProfile.focus_areas && activeProfile.focus_areas.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                  Áreas prioritarias de enfoque:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeProfile.focus_areas.map(fa => (
                    <span key={fa} className="text-xs px-3 py-1 rounded-full bg-sand-100 text-stone-800 font-medium">
                      {fa}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Shield Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>
                <strong>Privacidad Garantizada:</strong> Por diseño ético, las reflexiones íntimas y el diario de los miembros son 100% privados y nunca son accesibles a terceros.
              </span>
            </div>

            {/* Member's Public Posts */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Aportes Públicos en Comunidad ({memberPublicPosts.length})</span>
              </h4>

              {memberPublicPosts.length === 0 ? (
                <p className="text-xs text-stone-400 italic">No tiene publicaciones públicas recientes.</p>
              ) : (
                <div className="space-y-2">
                  {memberPublicPosts.map(p => (
                    <div key={p.id} className="p-3 bg-sand-50 rounded-xl border border-sand-200 space-y-1">
                      {p.title && <p className="font-serif font-bold text-xs text-stone-900">{p.title}</p>}
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">{p.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveProfile(null)}
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
