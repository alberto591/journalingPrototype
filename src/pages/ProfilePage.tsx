import React, { useState, useRef } from 'react';
import { useDataStore } from '../lib/dataStore';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  User, 
  MapPin, 
  Bell, 
  CheckCircle, 
  Shield, 
  Save, 
  Camera,
  Flame,
  Clock,
  Upload
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, updateCurrentUserProfile } = useDataStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio);
  const [location, setLocation] = useState(currentUser.location || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar_url);
  const [focusAreasText, setFocusAreasText] = useState(currentUser.focus_areas.join(', '));
  const [isUploading, setIsUploading] = useState(false);

  // Preferences
  const [dailyReminder, setDailyReminder] = useState(true);
  const [sessionReminder, setSessionReminder] = useState(true);
  const [communityNotifs, setCommunityNotifs] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5MB.');
      return;
    }

    setIsUploading(true);

    try {
      // 1. If Supabase is configured, attempt upload to profile-images storage bucket
      if (isSupabaseConfigured && currentUser.id) {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const filePath = `${currentUser.id}/avatar_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(filePath, file, { upsert: true });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('profile-images')
            .getPublicUrl(filePath);

          setAvatarUrl(publicUrl);
          await updateCurrentUserProfile({ avatar_url: publicUrl });
          setSavedSuccess(true);
          setTimeout(() => setSavedSuccess(false), 2500);
          setIsUploading(false);
          return;
        }
      }

      // 2. High-performance fallback: FileReader base64 Data URL (works offline & local)
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setAvatarUrl(dataUrl);
          await updateCurrentUserProfile({ avatar_url: dataUrl });
          setSavedSuccess(true);
          setTimeout(() => setSavedSuccess(false), 2500);
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error al actualizar avatar:', err);
      setIsUploading(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const areas = focusAreasText.split(',').map(s => s.trim()).filter(Boolean);
    updateCurrentUserProfile({
      name,
      bio,
      location,
      avatar_url: avatarUrl,
      focus_areas: areas,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto py-4 px-4 space-y-6 animate-fade-in">
      {/* Header Profile Card */}
      <div className="bg-stone-900 text-sand-50 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="flex flex-col items-center sm:items-start gap-2 flex-shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarFileChange}
            accept="image/png, image/jpeg, image/webp, image/gif"
            className="hidden"
          />
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative group cursor-pointer"
            title="Haz clic para seleccionar una foto de perfil"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-400/80 shadow-md transition-transform group-hover:scale-[1.02]"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-stone-800 border-2 border-amber-400/80 shadow-md flex items-center justify-center text-3xl font-bold text-amber-400">
                {name ? name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div className="absolute inset-0 bg-stone-950/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all">
              <Camera className="w-6 h-6 text-amber-400 mb-1" />
              <span className="text-[10px] text-white font-medium">Cambiar</span>
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-stone-950/80 rounded-2xl flex items-center justify-center">
                <span className="text-xs text-amber-400 font-semibold animate-pulse">Subiendo...</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-[11px] font-medium text-amber-400 hover:text-amber-300 underline underline-offset-2 flex items-center gap-1 mt-0.5 cursor-pointer"
          >
            <Camera className="w-3 h-3" />
            <span>Cambiar foto</span>
          </button>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="font-serif font-bold text-2xl text-white">{name}</h1>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-stone-800 text-amber-400 border border-stone-700 self-center sm:self-auto">
              {currentUser.role === 'admin' ? 'Fundador' : `Semana ${currentUser.current_week}`}
            </span>
          </div>

          <p className="text-xs text-sand-300 max-w-md">{bio || 'Miembro de Travesía'}</p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-3 text-xs text-sand-400">
            <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <Flame className="w-3.5 h-3.5" /> {currentUser.streak_days} días de racha
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <CheckCircle className="w-3.5 h-3.5" /> {currentUser.completed_sessions_count} sesiones
            </span>
            <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
              <Clock className="w-3.5 h-3.5" /> {Math.floor(currentUser.reflection_minutes / 60)}h {currentUser.reflection_minutes % 60}m
            </span>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="travesia-card p-6 sm:p-8 space-y-6">
        <h3 className="font-serif font-bold text-lg text-stone-900 pb-2 border-b border-sand-200">
          Información del Miembro
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Nombre Completo:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-sand-50 border border-sand-200 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-stone-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Ciudad / Ubicación:</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Madrid, España"
              className="w-full p-2.5 rounded-xl bg-sand-50 border border-sand-200 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-stone-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">Bio pública (visión o propósito):</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full p-3 rounded-xl bg-sand-50 border border-sand-200 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-stone-400 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">
            Áreas de Enfoque (separadas por coma):
          </label>
          <input
            type="text"
            value={focusAreasText}
            onChange={(e) => setFocusAreasText(e.target.value)}
            placeholder="Disciplina, Espiritualidad, Familia, Propósito"
            className="w-full p-2.5 rounded-xl bg-sand-50 border border-sand-200 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-stone-400"
          />
        </div>

        {/* Preferences Section */}
        <div className="pt-4 border-t border-sand-200 space-y-3">
          <h4 className="font-serif font-bold text-base text-stone-900">
            Ajustes de Notificaciones y Recordatorios
          </h4>

          <div className="space-y-2">
            <label className="flex items-center justify-between p-3 rounded-xl bg-sand-50 border border-sand-200 cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-stone-900">Recordatorio Diario de Journaling</p>
                <p className="text-[11px] text-stone-500">Aviso matutino para iniciar tus 5 movimientos a las 08:00 AM (CET)</p>
              </div>
              <input
                type="checkbox"
                checked={dailyReminder}
                onChange={(e) => setDailyReminder(e.target.checked)}
                className="w-4 h-4 text-stone-900 rounded focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-sand-50 border border-sand-200 cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-stone-900">Avisos de Sesiones en Directo</p>
                <p className="text-[11px] text-stone-500">Notificación 30 minutos antes del inicio de cada transmisión</p>
              </div>
              <input
                type="checkbox"
                checked={sessionReminder}
                onChange={(e) => setSessionReminder(e.target.checked)}
                className="w-4 h-4 text-stone-900 rounded focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-sand-50 border border-sand-200 cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-stone-900">Respuestas y Menciones de la Comunidad</p>
                <p className="text-[11px] text-stone-500">Cuando otro hermano comenta tus aportes</p>
              </div>
              <input
                type="checkbox"
                checked={communityNotifs}
                onChange={(e) => setCommunityNotifs(e.target.checked)}
                className="w-4 h-4 text-stone-900 rounded focus:ring-0"
              />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 animate-fade-in">
              <CheckCircle className="w-4 h-4" /> Perfil y preferencias guardados correctamente
            </span>
          ) : <span />}

          <button
            type="submit"
            className="travesia-btn-primary text-xs py-2.5 px-6 flex items-center gap-2"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Guardar Cambios</span>
          </button>
        </div>
      </form>
    </div>
  );
};
