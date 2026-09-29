import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../../lib/dataStore';
import { OnboardingData } from '../../types';
import confetti from 'canvas-confetti';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Compass, 
  Sparkles, 
  Shield, 
  Target, 
  Flame,
  Check
} from 'lucide-react';

const LIFE_AREAS = [
  'Relaciones',
  'Propósito',
  'Trabajo',
  'Disciplina',
  'Emociones',
  'Familia',
  'Espiritualidad',
  'Confianza',
  'Salud',
  'Dirección'
];

const OBSTACLES = [
  'El ruido y la adicción al teléfono',
  'Miedo al fracaso o al juicio ajeno',
  'Falta de consistencia y disciplina',
  'Relaciones tóxicas o falta de límites',
  'Vergüenza o culpa por errores del pasado',
  'Procrastinación de conversaciones difíciles',
  'Orgullo y dificultad para pedir ayuda',
  'Cansancio crónico y desorden de sueño'
];

export const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const { saveOnboarding } = useDataStore();

  const [step, setStep] = useState<number>(1);

  // Form states
  const [currentState, setCurrentState] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [desiredDirection, setDesiredDirection] = useState('');
  const [selectedObstacles, setSelectedObstacles] = useState<string[]>([]);
  const [commitmentText, setCommitmentText] = useState('');
  const [firstAction, setFirstAction] = useState('');

  const toggleArea = (area: string) => {
    setSelectedAreas(prev => 
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const toggleObstacle = (obs: string) => {
    setSelectedObstacles(prev => 
      prev.includes(obs) ? prev.filter(o => o !== obs) : [...prev, obs]
    );
  };

  const handleFinishOnboarding = () => {
    const data: OnboardingData = {
      current_state: currentState,
      life_areas_to_change: selectedAreas,
      desired_direction: desiredDirection,
      selected_obstacles: selectedObstacles,
      commitment_text: commitmentText,
      first_action: firstAction,
      completed_at: new Date().toISOString(),
    };

    saveOnboarding(data);

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#B66E43', '#1C1917', '#E7C8B6', '#10B981']
      });
    } catch {}

    setStep(8); // Show "Tu Punto de Partida" summary
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 animate-fade-in">
      {/* Progress Line (Steps 1 to 7) */}
      {step <= 7 && (
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
            <span>Paso {step} de 7</span>
            <span>Inicio de tu Travesía</span>
          </div>
          <div className="h-1.5 w-full bg-sand-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-stone-900 transition-all duration-300 rounded-full"
              style={{ width: `${(step / 7) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* SCREEN 1: BIENVENIDA */}
      {step === 1 && (
        <div className="bg-white rounded-3xl p-8 border border-sand-200 shadow-card text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-stone-900 mx-auto flex items-center justify-center text-amber-400 shadow-md">
            <Compass className="w-8 h-8" />
          </div>

          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-950">
              Bienvenido a Travesía
            </h1>
            <p className="text-base sm:text-lg text-bronze-700 font-serif italic mt-2">
              "Frena el ruido. Encuentra dirección. Haz el trabajo."
            </p>
          </div>

          <div className="text-sm text-stone-600 space-y-3 leading-relaxed max-w-lg mx-auto text-left bg-sand-50 p-5 rounded-2xl border border-sand-200">
            <p>
              Estás entrando a un hogar digital privado. No es un curso más que acumularás en una pestaña olvidada.
            </p>
            <p>
              TRAVESÍA es un espacio sobrio para <strong>desacelerar la mente, mirar con honestidad lo que llevas dentro, escuchar la voz de Dios y ejecutar acciones diarias innegociables</strong>.
            </p>
            <p>
              En los próximos minutos definiremos tu <strong>Punto de Partida</strong> para enfocar tus primeras 4 semanas.
            </p>
          </div>

          <button
            onClick={() => setStep(2)}
            className="travesia-btn-primary w-full py-3.5 text-base font-semibold shadow-md flex items-center justify-center gap-2"
          >
            <span>COMENZAR MI ORIENTACIÓN</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* SCREEN 2: ¿DÓNDE ESTÁS HOY? */}
      {step === 2 && (
        <div className="bg-white rounded-3xl p-8 border border-sand-200 shadow-card space-y-6 animate-fade-in">
          <div>
            <span className="text-xs uppercase font-bold text-bronze-700 tracking-wider">
              Diagnóstico Inicial
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              ¿Dónde estás hoy?
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Sé completamente honesto. Nadie más verá esta respuesta. ¿Cómo describirías tu momento actual en cuanto a tu ritmo de vida, paz interior y dirección espiritual?
            </p>
          </div>

          <textarea
            value={currentState}
            onChange={(e) => setCurrentState(e.target.value)}
            placeholder="Siento que voy demasiado rápido... las jornadas se me van apagando fuegos... tengo tensión acumulada... me cuesta encontrar tiempo de silencio con Dios..."
            rows={6}
            className="w-full p-4 rounded-2xl bg-sand-50/50 border border-sand-200 focus:border-stone-400 focus:bg-white text-stone-900 text-sm leading-relaxed resize-none focus:outline-none"
            autoFocus
          />

          <div className="flex items-center justify-between pt-2">
            <button onClick={() => setStep(1)} className="text-xs text-stone-500 hover:text-stone-800 underline">
              Atrás
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!currentState.trim()}
              className="travesia-btn-primary text-xs py-2.5 px-6 flex items-center gap-2"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 3: ¿QUÉ QUIERES CAMBIAR? */}
      {step === 3 && (
        <div className="bg-white rounded-3xl p-8 border border-sand-200 shadow-card space-y-6 animate-fade-in">
          <div>
            <span className="text-xs uppercase font-bold text-bronze-700 tracking-wider">
              Áreas de Enfoque
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              ¿Qué áreas necesitas ordenar?
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Selecciona de 2 a 4 áreas prioritarias para este ciclo de 4 semanas.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {LIFE_AREAS.map(area => {
              const isSelected = selectedAreas.includes(area);
              return (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleArea(area)}
                  className={`p-3.5 rounded-xl border text-left font-medium text-xs sm:text-sm transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                      : 'border-sand-200 bg-sand-50/60 hover:bg-sand-100 text-stone-800'
                  }`}
                >
                  <span>{area}</span>
                  {isSelected && <Check className="w-4 h-4" />}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button onClick={() => setStep(2)} className="text-xs text-stone-500 hover:text-stone-800 underline">
              Atrás
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={selectedAreas.length === 0}
              className="travesia-btn-primary text-xs py-2.5 px-6 flex items-center gap-2"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 4: ¿HACIA DÓNDE QUIERES IR? */}
      {step === 4 && (
        <div className="bg-white rounded-3xl p-8 border border-sand-200 shadow-card space-y-6 animate-fade-in">
          <div>
            <span className="text-xs uppercase font-bold text-bronze-700 tracking-wider">
              La Visión Deseada
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              ¿Hacia dónde quieres ir?
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Si estas próximas 4 semanas fueran una victoria rotunda, ¿cómo se vería tu vida cotidiana y tu carácter?
            </p>
          </div>

          <textarea
            value={desiredDirection}
            onChange={(e) => setDesiredDirection(e.target.value)}
            placeholder="Me veo despertando sin mirar el móvil, dedicando 30 minutos de quietud con Dios, respondiendo a mi familia con mansedumbre y teniendo la valentía de poner límites claros en el trabajo..."
            rows={6}
            className="w-full p-4 rounded-2xl bg-sand-50/50 border border-sand-200 focus:border-stone-400 focus:bg-white text-stone-900 text-sm leading-relaxed resize-none focus:outline-none"
            autoFocus
          />

          <div className="flex items-center justify-between pt-2">
            <button onClick={() => setStep(3)} className="text-xs text-stone-500 hover:text-stone-800 underline">
              Atrás
            </button>
            <button
              onClick={() => setStep(5)}
              disabled={!desiredDirection.trim()}
              className="travesia-btn-primary text-xs py-2.5 px-6 flex items-center gap-2"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 5: ¿QUÉ PUEDE ESTAR FRENÁNDOTE? */}
      {step === 5 && (
        <div className="bg-white rounded-3xl p-8 border border-sand-200 shadow-card space-y-6 animate-fade-in">
          <div>
            <span className="text-xs uppercase font-bold text-bronze-700 tracking-wider">
              Reconocer el Boicot
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              ¿Qué puede estar frenándote?
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Identifica los obstáculos y justificaciones más recurrentes que en el pasado te hicieron abandonar.
            </p>
          </div>

          <div className="space-y-2">
            {OBSTACLES.map(obs => {
              const isSelected = selectedObstacles.includes(obs);
              return (
                <button
                  key={obs}
                  type="button"
                  onClick={() => toggleObstacle(obs)}
                  className={`w-full p-3 rounded-xl border text-left font-medium text-xs sm:text-sm transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                      : 'border-sand-200 bg-sand-50/60 hover:bg-sand-100 text-stone-800'
                  }`}
                >
                  <span>{obs}</span>
                  {isSelected && <Check className="w-4 h-4" />}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button onClick={() => setStep(4)} className="text-xs text-stone-500 hover:text-stone-800 underline">
              Atrás
            </button>
            <button
              onClick={() => setStep(6)}
              disabled={selectedObstacles.length === 0}
              className="travesia-btn-primary text-xs py-2.5 px-6 flex items-center gap-2"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 6: TU COMPROMISO */}
      {step === 6 && (
        <div className="bg-white rounded-3xl p-8 border border-sand-200 shadow-card space-y-6 animate-fade-in">
          <div>
            <span className="text-xs uppercase font-bold text-bronze-700 tracking-wider">
              Pacto Personal
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              Tu compromiso de honor
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Completa la declaración de compromiso que sostendrás durante las próximas 4 semanas:
            </p>
          </div>

          <div className="p-4 bg-sand-50 rounded-2xl border border-sand-200">
            <label className="block text-xs font-serif italic text-stone-800 mb-2">
              "Durante las próximas 4 semanas en TRAVESÍA me comprometo a..."
            </label>
            <textarea
              value={commitmentText}
              onChange={(e) => setCommitmentText(e.target.value)}
              placeholder="Hacer mi sesión de diario matutino cada día sin falta antes de revisar redes sociales, y presentarme a las sesiones con el corazón abierto..."
              rows={4}
              className="w-full p-3 rounded-xl bg-white border border-sand-200 text-stone-900 text-sm leading-relaxed resize-none focus:outline-none"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button onClick={() => setStep(5)} className="text-xs text-stone-500 hover:text-stone-800 underline">
              Atrás
            </button>
            <button
              onClick={() => setStep(7)}
              disabled={!commitmentText.trim()}
              className="travesia-btn-primary text-xs py-2.5 px-6 flex items-center gap-2"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 7: TU PRIMER PASO */}
      {step === 7 && (
        <div className="bg-white rounded-3xl p-8 border border-sand-200 shadow-card space-y-6 animate-fade-in">
          <div>
            <span className="text-xs uppercase font-bold text-emerald-800 tracking-wider">
              Acción Inmediata
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
              Tu primer paso
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Define una sola acción concreta que ejecutarás hoy mismo para sellar el inicio de tu travesía.
            </p>
          </div>

          <input
            type="text"
            value={firstAction}
            onChange={(e) => setFirstAction(e.target.value)}
            placeholder="Ejemplo: Comprar mi libreta de diario y programar la alarma 30 minutos antes."
            className="w-full p-4 rounded-2xl bg-sand-50/50 border border-sand-200 focus:border-stone-400 focus:bg-white text-stone-900 text-sm focus:outline-none"
            autoFocus
          />

          <div className="flex items-center justify-between pt-2">
            <button onClick={() => setStep(6)} className="text-xs text-stone-500 hover:text-stone-800 underline">
              Atrás
            </button>
            <button
              onClick={handleFinishOnboarding}
              disabled={!firstAction.trim()}
              className="travesia-btn-primary text-xs py-3 px-8 flex items-center gap-2 font-semibold shadow-md"
            >
              <span>CREAR MI PUNTO DE PARTIDA</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 8: TU PUNTO DE PARTIDA SUMMARY */}
      {step === 8 && (
        <div className="bg-white rounded-3xl p-8 border border-sand-200 shadow-card space-y-6 animate-scale-up">
          <div className="text-center pb-4 border-b border-sand-200">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Onboarding Completado</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-stone-900">
              TU PUNTO DE PARTIDA
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Tu mapa personal para las próximas 4 semanas en TRAVESÍA.
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            {/* Situación actual */}
            <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Situación Actual
              </span>
              <p className="text-stone-800 italic">"{currentState}"</p>
            </div>

            {/* Dirección */}
            <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                Dirección Deseada
              </span>
              <p className="text-stone-800">"{desiredDirection}"</p>
            </div>

            {/* Áreas de enfoque & Obstáculos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                  Áreas de Enfoque
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAreas.map(a => (
                    <span key={a} className="px-2 py-0.5 rounded-full bg-sand-200 text-stone-800 text-xs font-medium">
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                  Obstáculos Detectados
                </span>
                <ul className="list-disc pl-4 space-y-1 text-xs text-stone-600">
                  {selectedObstacles.map(o => (
                    <li key={o}>{o}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Compromiso & Primer paso */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
              <div>
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                  Compromiso de 4 Semanas:
                </span>
                <p className="font-serif font-bold text-stone-900 mt-0.5">
                  "{commitmentText}"
                </p>
              </div>
              <div className="pt-2 border-t border-amber-200/60">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Primer paso para hoy:
                </span>
                <p className="font-serif font-bold text-stone-900 mt-0.5">
                  "{firstAction}"
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-sand-200 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => navigate('/journal')}
              className="travesia-btn-primary w-full py-3 text-sm font-semibold shadow-md flex items-center justify-center gap-2"
            >
              <span>REALIZAR MI PRIMERA SESIÓN DE DIARIO</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="travesia-btn-secondary w-full sm:w-auto py-3 text-xs"
            >
              Ir al Inicio
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
