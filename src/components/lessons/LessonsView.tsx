import React, { useState } from 'react';
import { useDataStore } from '../../lib/dataStore';
import { Lesson } from '../../types';
import { MODULES_DATA } from '../../lib/seedData';
import { 
  CheckCircle, 
  Lock, 
  Play, 
  ArrowRight, 
  BookOpen, 
  Clock, 
  FileText, 
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const LessonsView: React.FC = () => {
  const { lessons, completeLesson } = useDataStore();
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(lessons[0]);
  const [reflectionAnswer, setReflectionAnswer] = useState('');
  const [savedReflection, setSavedReflection] = useState(false);

  const completedCount = lessons.filter(l => l.status === 'completed').length;
  const progressPercent = Math.round((completedCount / lessons.length) * 100);

  const handleCompleteCurrent = () => {
    completeLesson(selectedLesson.id);
    setSavedReflection(true);
    setTimeout(() => setSavedReflection(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto py-4 px-4 space-y-6 animate-fade-in">
      {/* Header & Course Progress */}
      <div className="bg-stone-900 text-sand-50 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400 bg-stone-800/80 px-3 py-1 rounded-full border border-stone-700/60 inline-block mb-3">
            Currículo Formativo Oficial
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            Lecciones de la Travesía
          </h1>
          <p className="text-sand-300 text-xs sm:text-sm mt-1 max-w-lg leading-relaxed">
            Formación estructurada para desmontar el ruido, reprogramar los hábitos matutinos y construir una vida bajo el señorío de Cristo.
          </p>
        </div>

        {/* Progress Card */}
        <div className="bg-stone-800/80 p-5 rounded-2xl border border-stone-700/60 min-w-[200px] space-y-2 flex-shrink-0">
          <div className="flex items-center justify-between text-xs text-sand-300">
            <span>Progreso Total</span>
            <span className="font-bold text-amber-400">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full bg-stone-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-sand-400 text-right">
            {completedCount} de {lessons.length} completadas
          </p>
        </div>
      </div>

      {/* Main Grid: Modules & Lessons Navigator (Left) + Active Lesson Reader (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Modules list (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-serif font-bold text-base text-stone-900 px-1">
            Los 7 Módulos de Formación
          </h3>

          <div className="space-y-3">
            {MODULES_DATA.map(mod => {
              const moduleLessons = lessons.filter(l => l.module_id === mod.id);
              return (
                <div key={mod.id} className="travesia-card p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-sm text-stone-900">
                      {mod.title}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-stone-400">
                      Semana {mod.week}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">{mod.description}</p>

                  <div className="space-y-1 pt-1">
                    {moduleLessons.length === 0 ? (
                      <p className="text-[11px] text-stone-400 italic">Próximamente disponible</p>
                    ) : (
                      moduleLessons.map(les => {
                        const isSelected = selectedLesson.id === les.id;
                        return (
                          <button
                            key={les.id}
                            onClick={() => setSelectedLesson(les)}
                            className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between text-xs ${
                              isSelected
                                ? 'bg-stone-900 text-white font-semibold shadow-sm'
                                : 'hover:bg-sand-100 text-stone-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              {les.status === 'completed' ? (
                                <CheckCircle className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-emerald-400' : 'text-emerald-600'}`} />
                              ) : les.status === 'locked' ? (
                                <Lock className="w-3.5 h-3.5 flex-shrink-0 text-stone-400" />
                              ) : (
                                <Play className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-amber-400' : 'text-stone-400'}`} />
                              )}
                              <span className="truncate">{les.title}</span>
                            </div>
                            <span className="text-[10px] opacity-70 flex-shrink-0">
                              {les.duration_minutes}m
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Lesson View (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="travesia-card p-6 sm:p-8 space-y-6">
            <div className="border-b border-sand-200 pb-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-bronze-700 uppercase tracking-wider">
                <span>{selectedLesson.module_title}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {selectedLesson.duration_minutes} minutos
                </span>
              </div>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-stone-900 mt-2 leading-snug">
                {selectedLesson.title}
              </h2>
            </div>

            {/* Video or Audio Card Placeholder */}
            <div className="aspect-video bg-sand-100 rounded-2xl border border-sand-200 flex flex-col items-center justify-center p-6 text-center text-stone-600">
              <div className="w-12 h-12 rounded-full bg-stone-900 text-amber-400 flex items-center justify-center shadow-md mb-2">
                <Play className="w-5 h-5 ml-0.5" />
              </div>
              <span className="font-serif font-semibold text-sm text-stone-800">
                Audio / Video Masterclass
              </span>
              <span className="text-xs text-stone-500 mt-0.5">
                {selectedLesson.duration_minutes} minutos de enseñanza guiada
              </span>
            </div>

            {/* Markdown Text Content */}
            <div className="prose prose-stone text-xs sm:text-sm leading-relaxed space-y-3 text-stone-700">
              {selectedLesson.content_markdown.split('\n\n').map((par, i) => (
                <p key={i}>{par}</p>
              ))}
            </div>

            {/* Practical Exercise Box */}
            {selectedLesson.exercise_instruction && (
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-bronze-800">
                  <Sparkles className="w-4 h-4 text-bronze-600" />
                  <span>Ejercicio Práctico Inmediato</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
                  {selectedLesson.exercise_instruction}
                </p>
              </div>
            )}

            {/* Reflection question & input */}
            {selectedLesson.reflection_question && (
              <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 space-y-2">
                <label className="block text-xs font-serif font-semibold text-stone-900">
                  Pregunta de Integración: "{selectedLesson.reflection_question}"
                </label>
                <textarea
                  value={reflectionAnswer}
                  onChange={(e) => setReflectionAnswer(e.target.value)}
                  placeholder="Escribe tu reflexión sobre esta lección..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-white border border-sand-200 text-stone-900 text-xs focus:outline-none resize-none"
                />
              </div>
            )}

            {/* Complete Action Button */}
            <div className="pt-4 border-t border-sand-200 flex items-center justify-between">
              {selectedLesson.status === 'completed' ? (
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <CheckCircle className="w-4 h-4" /> Lección completada
                </span>
              ) : (
                <button
                  onClick={handleCompleteCurrent}
                  className="travesia-btn-primary text-xs py-2.5 px-6 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Marcar como completada (+15m)</span>
                </button>
              )}

              {savedReflection && (
                <span className="text-xs text-emerald-600 font-medium animate-fade-in">
                  ✓ Progreso actualizado
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
