import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Compass, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  Users, 
  CheckCircle2, 
  Sparkles,
  HeartHandshake,
  PenTool,
  Coffee
} from 'lucide-react';

export const FounderPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-sand-50 text-stone-900 font-sans selection:bg-amber-200">
      {/* Top Header */}
      <header className="bg-stone-950 border-b border-stone-800 text-sand-50 h-16 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Compass className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-serif font-bold text-base tracking-wider text-sand-50">TRAVESÍA</span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => navigate('/prueba')}
            className="text-sand-300 hover:text-white font-medium transition-colors"
          >
            Reto Gratuito 7 Días
          </button>
          <button
            onClick={() => navigate('/membership')}
            className="travesia-btn-accent text-xs py-1.5 px-3.5 text-stone-950 font-bold"
          >
            Membresía Fundadora
          </button>
        </div>
      </header>

      {/* Hero & Identity */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-16">
        {/* Founder Bio Card */}
        <section className="space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5 text-amber-700" />
            <span>Perfil del Fundador & Facilitador</span>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="w-28 h-28 rounded-3xl overflow-hidden border-2 border-stone-800 shadow-xl bg-stone-900">
              <img
                src="/alberto-calvo.png"
                alt="Alberto Calvo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="font-serif font-bold text-3xl sm:text-4xl text-stone-900">
                Alberto Calvo
              </h1>
              <p className="text-xs font-mono font-bold uppercase tracking-widest text-stone-500 mt-1">
                Guía · Facilitador · Constructor · Participante
              </p>
            </div>
          </div>

          <blockquote className="font-serif italic text-lg sm:text-xl text-stone-800 leading-relaxed max-w-xl mx-auto border-y border-sand-200 py-6">
            "Estoy construyendo esta práctica junto a un grupo de personas que buscan mayor claridad y dirección sin dogmas ni atajos."
          </blockquote>
        </section>

        {/* The Reality: Why Travesía Exists */}
        <section className="bg-white rounded-3xl p-8 sm:p-10 border border-sand-200 shadow-card space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700">
              Honestidad de Partida
            </span>
            <h2 className="font-serif font-bold text-2xl text-stone-900">
              No soy terapeuta, psicólogo ni gurú.
            </h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
            <p>
              Durante años viví en la inercia que muchos conocemos: despertarme, revisar el teléfono antes de poner los pies en el suelo, responder urgencias de otros y terminar el día con la sensación aplastante de haber estado ocupadísimo sin haber avanzado en nada esencial.
            </p>
            <p>
              No necesitaba otro curso de productividad de 30 horas ni otra aplicación con notificaciones agresivas para convencerme de que meditara. Necesitaba <strong>un espacio sobrio</strong>, sin cinismo y con personas reales que se sentaran a la misma hora a hacer el trabajo de mirar hacia dentro.
            </p>
            <p>
              Por eso creé <strong>TRAVESÍA</strong>. No como una tarima para dar lecciones, sino como un gimnasio matutino de claridad personal. Yo no miro desde fuera: me siento a escribir contigo todas las mañanas.
            </p>
          </div>

          {/* Core Roles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-sand-100">
            <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 space-y-1.5">
              <div className="flex items-center gap-2 font-serif font-bold text-stone-900 text-sm">
                <Compass className="w-4 h-4 text-amber-600" />
                <span>Facilitador del Silencio</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Abro la sala virtual a las 08:00 AM (CET), introduzco la pregunta del día, sostengo el temporizador de quietud y modero el espacio con sobriedad.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 space-y-1.5">
              <div className="flex items-center gap-2 font-serif font-bold text-stone-900 text-sm">
                <PenTool className="w-4 h-4 text-amber-600" />
                <span>Practicante Activo</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Escribo mi propio diario al mismo tiempo que tú. Comparto mis vacilaciones y aprendizajes sin fingir tenerlo todo resuelto.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 space-y-1.5">
              <div className="flex items-center gap-2 font-serif font-bold text-stone-900 text-sm">
                <HeartHandshake className="w-4 h-4 text-amber-600" />
                <span>Acompañamiento Cercano</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Conozco el nombre, la situación y el avance de cada uno de los 20 miembros fundadores. Hacemos entrevistas 1-a-1 periódicas.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 space-y-1.5">
              <div className="flex items-center gap-2 font-serif font-bold text-stone-900 text-sm">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Guardián de la Privacidad</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Tus reflexiones personales están cifradas y aisladas por RLS. Nadie del equipo ni de la comunidad tiene acceso a tu diario íntimo.
              </p>
            </div>
          </div>
        </section>

        {/* What To Expect / What Not To Expect */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-stone-900 text-sand-50 rounded-3xl p-6 sm:p-8 border border-stone-800 space-y-4">
            <h3 className="font-serif font-bold text-lg text-white">
              Lo que sí encontrarás en Travesía
            </h3>
            <ul className="space-y-2.5 text-xs text-sand-200">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>30 minutos de estructura diaria guiada de lunes a viernes.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Los 5 Movimientos: Frenar, Limpiar, Sentir, Escuchar, Actuar.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Un compromiso innegociable antes de empezar la jornada laboral.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Personas que valoran la profundidad por encima de la apariencia.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 space-y-4">
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Lo que no encontrarás
            </h3>
            <ul className="space-y-2.5 text-xs text-stone-600">
              <li className="flex items-start gap-2">
                <span className="text-stone-400 font-bold">✕</span>
                <span>Promesas de transformación milagrosa en 48 horas.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-stone-400 font-bold">✕</span>
                <span>Sustituto de terapia médica, psiquiátrica o clínica.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-stone-400 font-bold">✕</span>
                <span>Pensamiento positivo tóxico que niega el dolor o la duda.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-stone-400 font-bold">✕</span>
                <span>Un gurú diciéndote qué debes hacer con tu vocación o matrimonio.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Next Steps CTA */}
        <section className="bg-sand-100 rounded-3xl p-8 sm:p-10 border border-sand-200 text-center space-y-6">
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="font-serif font-bold text-2xl text-stone-900">
              ¿Listo para empezar la práctica?
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Puedes probar primero los 7 días de forma completamente gratuita, o asegurar tu plaza como Miembro Fundador con precio congelado.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/prueba')}
              className="w-full sm:w-auto travesia-btn-secondary text-xs py-3.5 px-6 font-semibold"
            >
              Comenzar Reto Gratuito de 7 Días
            </button>
            <button
              onClick={() => navigate('/membership')}
              className="w-full sm:w-auto travesia-btn-accent text-xs py-3.5 px-8 font-bold text-stone-950 shadow-md flex items-center justify-center gap-2"
            >
              <span>Asegurar Plaza Fundadora (29€/mes)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-sand-200 py-8 text-center text-xs text-stone-500">
        <p>TRAVESÍA · «Frena el ruido. Encuentra dirección. Haz el trabajo.»</p>
        <p className="text-[11px] text-stone-400 mt-1">
          Práctica secular de discernimiento y sobriedad. No sustituye asesoramiento médico ni psicológico.
        </p>
      </footer>
    </div>
  );
};
