import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDataStore } from '../lib/dataStore';
import { PostComposer } from '../components/community/PostComposer';
import { PostCard } from '../components/community/PostCard';
import { 
  Flame, 
  HelpCircle,
  Users,
  MessageSquare
} from 'lucide-react';

export const CommunityPage: React.FC = () => {
  const { channel: channelSlug } = useParams<{ channel?: string }>();
  const { channels, posts } = useDataStore();
  const [filter, setFilter] = useState<'recent' | 'top'>('recent');

  // 2 distinct spaces for the community
  const primaryChannels = [
    {
      slug: 'conversacion-principal',
      name: 'Conversación principal',
      description: 'Reflexiones diarias, pedidos de oración y vida compartida en fraternidad.',
      icon_name: 'flame',
      id: channels.find(c => c.slug === 'conversacion-principal')?.id || 'ch-general',
    },
    {
      slug: 'preguntas-soporte',
      name: 'Preguntas & Soporte',
      description: 'Espacio para dudas metodológicas, preguntas sobre la práctica diaria y ayuda mutua.',
      icon_name: 'help-circle',
      id: channels.find(c => c.slug === 'preguntas-soporte')?.id || 'ch-support',
    }
  ];

  const activeChannelObj = primaryChannels.find(c => c.slug === channelSlug) || channels.find(c => c.slug === channelSlug);

  const channelPosts = posts.filter(p => {
    if (!channelSlug) return true;
    if (channelSlug === 'conversacion-principal') {
      const isSupport = p.channel_id === 'ch-support' || 
                        p.channel_id === primaryChannels[1].id ||
                        p.tags?.some(t => t.toLowerCase().includes('pregunta') || t.toLowerCase().includes('soporte'));
      return !isSupport;
    }
    if (channelSlug === 'preguntas-soporte') {
      const isSupport = p.channel_id === 'ch-support' || 
                        p.channel_id === primaryChannels[1].id ||
                        p.tags?.some(t => t.toLowerCase().includes('pregunta') || t.toLowerCase().includes('soporte'));
      return isSupport;
    }
    return p.channel_id === activeChannelObj?.id;
  }).sort((a, b) => {
    if (filter === 'top') return (b.likes_count + b.comments_count) - (a.likes_count + a.comments_count);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const getChannelIcon = (iconName: string) => {
    switch (iconName) {
      case 'flame': return <Flame className="w-5 h-5 text-amber-600" />;
      case 'help-circle': return <HelpCircle className="w-5 h-5 text-blue-600" />;
      default: return <MessageSquare className="w-5 h-5 text-stone-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Channel Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-sand-200 shadow-card space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sand-100 flex items-center justify-center flex-shrink-0">
            {activeChannelObj ? getChannelIcon(activeChannelObj.icon_name) : <Users className="w-6 h-6 text-stone-800" />}
          </div>
          <div>
            <h1 className="font-serif font-bold text-2xl text-stone-900">
              {activeChannelObj ? activeChannelObj.name : 'Toda la Comunidad TRAVESÍA'}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              {activeChannelObj ? activeChannelObj.description : 'Punto de encuentro común para todas las reflexiones, pedidos de oración y vida compartida.'}
            </p>
          </div>
        </div>

        {/* Quick channel tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-sand-100">
          <Link
            to="/community"
            className={`text-xs px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
              !channelSlug ? 'bg-stone-900 text-white font-semibold' : 'bg-sand-100 text-stone-600 hover:bg-sand-200'
            }`}
          >
            Todos los aportes
          </Link>
          {primaryChannels.map(ch => (
            <Link
              key={ch.slug}
              to={`/community/${ch.slug}`}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
                channelSlug === ch.slug ? 'bg-stone-900 text-white font-semibold' : 'bg-sand-100 text-stone-600 hover:bg-sand-200'
              }`}
            >
              {ch.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Post Composer targeted to this channel */}
      <PostComposer defaultChannelId={activeChannelObj?.id} />

      {/* Filter and sorting toolbar */}
      <div className="flex items-center justify-between border-b border-sand-200 pb-3">
        <span className="text-xs font-semibold text-stone-500">
          {channelPosts.length} aportes en esta sección
        </span>

        <div className="flex items-center gap-1 bg-sand-100 p-1 rounded-xl text-xs text-stone-600">
          <button
            onClick={() => setFilter('recent')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              filter === 'recent' ? 'bg-white text-stone-900 font-bold shadow-subtle' : 'hover:text-stone-900'
            }`}
          >
            Recientes
          </button>
          <button
            onClick={() => setFilter('top')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              filter === 'top' ? 'bg-white text-stone-900 font-bold shadow-subtle' : 'hover:text-stone-900'
            }`}
          >
            Más Comentados
          </button>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {channelPosts.length === 0 ? (
          <div className="travesia-card p-12 text-center text-stone-400">
            <p className="text-sm">Aún no hay publicaciones en este canal.</p>
            <p className="text-xs mt-1">Sé el primero en iniciar la conversación.</p>
          </div>
        ) : (
          channelPosts.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  );
};
