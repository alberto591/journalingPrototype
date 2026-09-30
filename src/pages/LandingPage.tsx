import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Users, 
  ShieldCheck, 
  Compass, 
  Flame, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  Heart,
  HelpCircle,
  Lock
} from 'lucide-react';
import { useDataStore } from '../lib/dataStore';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, members } = useDataStore();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Scarcity calculated strictly from real database members (20 - active_founders)
  const activeFoundersCount = members.filter(m => m.membership_status === 'ACTIVE' || m.role === 'admin').length;
  const remainingPlaces = Math.max(1, 20 - activeFoundersCount);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 text-stone-900 font-sans selection:bg-amber-200 overflow-x-hidden">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-stone-950/90 backdrop-blur-md border-b border-stone-800 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Compass className="w-4 h-4 text-amber-400" />
            </div>
            <span className="font-serif font-bold text-lg text-sand-50 tracking-wider">
              TRAVESÍA
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-sand-300">
            <button onClick={() => scrollToSection('problema')} className="hover:text-amber-400 transition-colors">
              El Problema
            </button>
            <button onClick={() => scrollToSection('el-ritual')} className="hover:text-amber-400 transition-colors">
              El Ritual Diario
            </button>
            <button onClick={() => scrollToSection('movimientos')} className="hover:text-amber-400 transition-colors">
              Los 5 Movimientos
            </button>
            <button onClick={() => scrollToSection('sesiones-en-vivo')} className="hover:text-amber-400 transition-colors">
              Sesiones en Directo
            </button>
            <button onClick={() => scrollToSection('membresia')} className="hover:text-amber-400 transition-colors">
              Membresía
            </button>
            <button onClick={() => navigate('/fundador')} className="hover:text-amber-400 transition-colors">
              El Fundador
            </button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-amber-400 transition-colors">
              Preguntas
            </button>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="travesia-btn-accent text-xs py-2 px-4 shadow-md font-semibold"
              >
                Ir a mi Santuario →
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="text-xs font-semibold text-sand-300 hover:text-white px-2 py-1 transition-colors"
                >
                  Entrar
                </button>
                <button
                  onClick={() => navigate('/prueba')}
                  className="travesia-btn-accent text-xs py-2 px-4 shadow-md font-semibold"
                >
                  Probar 7 días gratis
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative bg-stone-950 text-sand-50 pt-20 pb-24 sm:pt-28 sm:pb-32 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-900 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-wide animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Un gimnasio de claridad personal y discernimiento diario</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-sand-50 leading-[1.1]">
            Frena el ruido.<br />
            Encuentra dirección.<br />
            <span className="text-amber-400">Haz el trabajo.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-sand-300 leading-relaxed font-normal">
            Un espacio para parar cada día, escuchar lo que realmente está pasando dentro de ti y convertir claridad en acción. 
            30 minutos cada mañana, de lunes a viernes, en comunidad guiada en directo.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/prueba')}
              className="w-full sm:w-auto travesia-btn-accent text-sm py-3.5 px-8 font-semibold shadow-xl flex items-center justify-center gap-2 text-stone-950"
            >
              <span>Probar gratis 7 días</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollToSection('el-ritual')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-xs font-semibold text-sand-300 hover:text-white bg-stone-900/80 hover:bg-stone-800 border border-stone-800 transition-all flex items-center justify-center gap-2"
            >
              <span>Ver cómo funciona</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Trust markers */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-sand-400 border-t border-stone-800/80">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Sin tarjeta de crédito requerida</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Práctica guiada en español</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Diario 100% privado</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION 1: EL PROBLEMA */}
      <section id="problema" className="py-20 sm:py-28 bg-white border-b border-sand-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-[11px] font-bold tracking-widest text-amber-700 uppercase">
              El Punto de Partida
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
              Tu cabeza no necesita más ruido.<br />Necesita espacio.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-sand-50 border border-sand-200 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 font-serif font-bold text-lg">
                1
              </div>
              <h3 className="font-serif font-bold text-lg text-stone-900">Saturación Constante</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Empiezas el día respondiendo a las urgencias de los demás. Tu atención se fractura en cientos de notificaciones antes de que hayas podido pensar por ti mismo.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-sand-50 border border-sand-200 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 font-serif font-bold text-lg">
                2
              </div>
              <h3 className="font-serif font-bold text-lg text-stone-900">Desconexión Interna</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Pasas semanas en piloto automático. Sabes que algo no está bien en tu trabajo o relaciones, pero el ritmo vertiginoso te impide pararte a mirar la raíz.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-sand-50 border border-sand-200 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 font-serif font-bold text-lg">
                3
              </div>
              <h3 className="font-serif font-bold text-lg text-stone-900">Parálisis por Dispersión</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Terminas el día exhausto habiendo hecho mil cosas secundarias, mientras la única decisión trascendente sigue postergada una semana más.
              </p>
            </div>
          </div>

          <div className="bg-stone-900 text-sand-50 rounded-3xl p-8 sm:p-10 text-center space-y-4">
            <h4 className="font-serif text-xl sm:text-2xl font-bold">
              Menos consumir. Más escuchar. Más actuar.
            </h4>
            <p className="text-xs sm:text-sm text-sand-300 max-w-xl mx-auto leading-relaxed">
              No necesitas otra app para acumular notas que nadie lee. Necesitas un rito diario innegociable donde el silencio precede a la claridad, y la claridad se cristaliza en una sola acción obligatoria.
            </p>
          </div>
        </div>
      </section>

      {/* 4. SECTION 2: EL RITUAL DIARIO */}
      <section id="el-ritual" className="py-20 sm:py-28 bg-sand-100/70 border-b border-sand-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-[11px] font-bold tracking-widest text-amber-700 uppercase">
              La Práctica Central
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
              30 minutos. Cada mañana.<br />Para volver a ti.
            </h2>
            <p className="text-sm text-stone-600 max-w-xl mx-auto">
              De lunes a viernes, a primera hora. Nos reunimos en silencio guiado. Sin cámaras obligatorias, sin charlas vacías.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sand-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                  Estructura Diaria Inquebrantable
                </span>
                <h3 className="font-serif text-2xl font-bold text-stone-900">
                  Una sola pregunta. Una revelación. Una acción.
                </h3>
              </div>

              <div className="space-y-4 text-xs text-stone-700">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <strong className="text-stone-900">Frenar y silenciar (5m):</strong> Respiración diafragmática para bajar el cortisol y anclar la mente en el presente.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <strong className="text-stone-900">Pregunta catalizadora del día (10m):</strong> Diseñada para traspasar tus justificaciones intelectuales y llegar a la verdad.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <strong className="text-stone-900">Escucha atenta y oración (5m):</strong> Espacio de quietud receptiva sin prisas de ejecución.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <strong className="text-stone-900">El compromiso ineludible (10m):</strong> Redactar con hora exacta tu única acción prioritaria de la jornada.
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate('/prueba')}
                  className="travesia-btn-primary text-xs py-3 px-6 shadow-sm"
                >
                  Experimentar el ritual hoy →
                </button>
              </div>
            </div>

            <div className="bg-stone-950 text-sand-50 rounded-3xl p-6 sm:p-8 space-y-6 border border-stone-800 shadow-xl">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                  SESIÓN EN DIRECTO · 07:00 AM
                </span>
                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> En vivo
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-xs text-sand-400">Pregunta del día:</span>
                <p className="font-serif italic text-lg sm:text-xl text-sand-100 leading-snug">
                  "¿Qué conversación estás evitando porque temes que cambie la relación?"
                </p>
              </div>

              <div className="bg-stone-900 rounded-2xl p-4 border border-stone-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-stone-400 text-[11px]">
                  <span>Compromiso de acción:</span>
                  <span className="text-amber-400 font-mono">11:30 AM</span>
                </div>
                <p className="text-sand-200 font-serif">
                  "Llamaré a mi socio y pondré sobre la mesa los números reales del trimestre sin rodeos."
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-sand-400 pt-2 border-t border-stone-800">
                <span>Guía: Alberto Calvo</span>
                <span className="text-stone-500 font-mono">30 min de silencio activo</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION 3: LOS 5 MOVIMIENTOS */}
      <section id="movimientos" className="py-20 sm:py-28 bg-white border-b border-sand-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-[11px] font-bold tracking-widest text-amber-700 uppercase">
              La Metodología
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
              Los 5 Movimientos de TRAVESÍA
            </h2>
            <p className="text-sm text-stone-600 max-w-xl mx-auto">
              Un flujo riguroso que transforma el caos mental en convicción serena.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-5 rounded-3xl bg-sand-50 border border-sand-200 space-y-3">
              <span className="text-xs font-mono font-bold text-amber-700">M1</span>
              <h3 className="font-serif font-bold text-stone-900 text-base">Frenar</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Silencio absoluto y respiración consciente para detener la inercia del piloto automático.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-sand-50 border border-sand-200 space-y-3">
              <span className="text-xs font-mono font-bold text-amber-700">M2</span>
              <h3 className="font-serif font-bold text-stone-900 text-base">Descargar</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Volcado mental sin filtros. Sacar de tu cabeza el fardo antes de que te agote.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-sand-50 border border-sand-200 space-y-3">
              <span className="text-xs font-mono font-bold text-amber-700">M3</span>
              <h3 className="font-serif font-bold text-stone-900 text-base">Nombrar</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Identificar las 8 emociones básicas con exactitud quirúrgica. Lo que no se nombra, te gobierna.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-sand-50 border border-sand-200 space-y-3">
              <span className="text-xs font-mono font-bold text-amber-700">M4</span>
              <h3 className="font-serif font-bold text-stone-900 text-base">Escuchar</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Quietud profunda y oración receptiva. Discernir la voz sutil de Dios en medio del estrépito.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-stone-900 text-sand-50 border border-stone-800 space-y-3 shadow-md">
              <span className="text-xs font-mono font-bold text-amber-400">M5</span>
              <h3 className="font-serif font-bold text-white text-base">Una Acción</h3>
              <p className="text-xs text-sand-300 leading-relaxed">
                Sin listas infinitas. Una sola decisión ineludible que mueve la aguja hoy mismo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION 4: SESIONES EN VIVO */}
      <section id="sesiones-en-vivo" className="py-20 sm:py-28 bg-stone-950 text-sand-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-[11px] font-bold tracking-widest text-amber-400 uppercase">
              La Sala Compartida
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-sand-50">
              El poder de presentarte con otros
            </h2>
            <p className="text-sm text-sand-300 max-w-xl mx-auto">
              Hacerlo solo es fácil de abandonar. Conectarte con una sala llena de personas en silencio crea una gravedad que sostiene tu disciplina.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-3">
              <Calendar className="w-6 h-6 text-amber-400" />
              <h3 className="font-serif font-bold text-lg text-white">Lunes a Viernes</h3>
              <p className="text-xs text-sand-400 leading-relaxed">
                Dos horarios en directo (07:00 AM y 20:00 PM CET) para adaptarse a tus responsabilidades familiares y laborales.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-3">
              <Clock className="w-6 h-6 text-amber-400" />
              <h3 className="font-serif font-bold text-lg text-white">Archivo de Grabaciones</h3>
              <p className="text-xs text-sand-400 leading-relaxed">
                Si un imprevisto te impide estar en directo, la práctica queda grabada en alta fidelidad para que no rompas tu racha.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-3">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
              <h3 className="font-serif font-bold text-lg text-white">Espacio Seguro y Sobrio</h3>
              <p className="text-xs text-sand-400 leading-relaxed">
                Cero postureo. No hay que dar explicaciones a nadie. Escribes para ti y rindes cuentas a tu propia conciencia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SECTION 5: COMUNIDAD */}
      <section className="py-20 sm:py-28 bg-white border-b border-sand-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10 text-center">
          <span className="text-[11px] font-bold tracking-widest text-amber-700 uppercase">
            Compañeros de Camino
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Una comunidad hispanohablante<br />que comparte tu anhelo de sobriedad
          </h2>
          <p className="text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
            Fundadores, profesionales, médicos, arquitectos, padres y madres de familia que han decidido no dejarse arrastrar por el cinismo ni por el ruido de las redes.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-left">
            <div className="p-6 rounded-3xl bg-sand-50 border border-sand-200 space-y-3">
              <p className="text-xs text-stone-700 italic font-serif leading-relaxed">
                "Por primera vez en 10 años, mis mañanas no empiezan con pánico al calendario. 30 minutos de silencio me devuelven la compostura."
              </p>
              <div className="text-[11px] text-stone-500 font-semibold">
                — Elena M., Arquitecta y Socia
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-sand-50 border border-sand-200 space-y-3">
              <p className="text-xs text-stone-700 italic font-serif leading-relaxed">
                "El Movimiento 5 me salvó de la parálisis. Dejé de hacer listas de 20 tareas para enfocarme en la única que mueve el negocio."
              </p>
              <div className="text-[11px] text-stone-500 font-semibold">
                — Javier R., Fundador Tecnológico
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-sand-50 border border-sand-200 space-y-3">
              <p className="text-xs text-stone-700 italic font-serif leading-relaxed">
                "No es otra app más. Es una cita obligatoria con la verdad de mi corazón antes de exponerme al mundo exterior."
              </p>
              <div className="text-[11px] text-stone-500 font-semibold">
                — Sofía V., Cirujana y Madre
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. SECTION 6: EL CAMINO DE 4 SEMANAS */}
      <section className="py-20 sm:py-28 bg-sand-100/60 border-b border-sand-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-[11px] font-bold tracking-widest text-amber-700 uppercase">
              Progresión del Miembro
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
              El Ciclo de Transformación de 4 Semanas
            </h2>
            <p className="text-sm text-stone-600 max-w-xl mx-auto">
              Cada mes recorres un currículo guiado que renueva tus cimientos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-sand-200 space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-stone-500">Semana 1</span>
              <h3 className="font-serif font-bold text-lg text-stone-900">El Presente</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Instalar el hábito del silencio matutino y limpiar el polvo acumulado en la mente.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-sand-200 space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-stone-500">Semana 2</span>
              <h3 className="font-serif font-bold text-lg text-stone-900">La Visión</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Discernir qué vida estás llamado a forjar con tus talentos sin pedir disculpas.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-sand-200 space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-stone-500">Semana 3</span>
              <h3 className="font-serif font-bold text-lg text-stone-900">Los Obstáculos</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Identificar y derribar las trampas del autoboicot, la distracción y el resentimiento.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-sand-200 space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-stone-500">Semana 4</span>
              <h3 className="font-serif font-bold text-lg text-stone-900">El Trabajo</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Ejecución serena, compromisos ineludibles y consolidación del documento "Mi Próximo Capítulo".
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. SECTION 7: PRICING / MEMBRESÍA */}
      <section id="membresia" className="py-20 sm:py-28 bg-white border-b border-sand-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-[11px] font-bold tracking-widest text-amber-700 uppercase">
              Inversión en Claridad
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
              Haz de tu claridad una prioridad innegociable
            </h2>
            <p className="text-sm text-stone-600 max-w-xl mx-auto">
              Menos que el coste de un café al día. Acceso completo al gimnasio de claridad personal.
            </p>
          </div>

          <div className="max-w-lg mx-auto bg-sand-50 rounded-3xl p-8 sm:p-10 border-2 border-amber-500/40 shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-500 text-stone-950 text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-bl-2xl shadow-sm">
              Quedan {remainingPlaces} plazas
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
                <span>Plaza Fundadora</span>
                <span>·</span>
                <span>Pago manual fase inicial</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-serif text-4xl sm:text-5xl font-bold text-stone-900">29€</span>
                <span className="text-xs text-stone-500">/ mes (facturación mensual)</span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Precio congelado de por vida para las primeras 20 plazas ({remainingPlaces} disponibles). O 290€/año (ahorra 2 meses).
              </p>
            </div>

            <div className="space-y-3 text-xs text-stone-700 border-t border-b border-sand-200 py-6">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Sesiones guiadas diarias en directo (lunes a viernes).</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Herramienta de diario guiado con los 5 Movimientos (100% privada).</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Archivo completo de grabaciones para hacer la sesión a tu ritmo.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Comunidad exclusiva de discernimiento y canales temáticos.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Currículo de 4 semanas y biblioteca de lecturas esenciales.</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => navigate('/prueba')}
                className="w-full travesia-btn-accent text-sm py-3.5 font-bold shadow-lg text-stone-950 flex items-center justify-center gap-2"
              >
                <span>Comenzar prueba gratuita de 7 días</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-center text-stone-500">
                Pruébalo durante una semana completa sin compromiso antes de decidir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. SECTION 8: FAQ */}
      <section id="faq" className="py-20 sm:py-28 bg-sand-50 border-b border-sand-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-3">
            <span className="text-[11px] font-bold tracking-widest text-amber-700 uppercase">
              Preguntas Frecuentes
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
              Todo lo que necesitas saber
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: '¿Tengo que encender la cámara o hablar durante las sesiones?',
                a: 'Rotundamente no. Las sesiones son un santuario de silencio guiado. Puedes entrar en pijama o desde tu despacho. El guía modera y marca los tiempos; tú escribes en tu diario privado sin exponerte.',
              },
              {
                q: '¿Qué pasa si mi horario no coincide con el directo?',
                a: 'Todas las sesiones matutinas quedan procesadas y disponibles en tu Archivo Privado al término del directo. Muchos miembros hacen la práctica a las 06:00 AM o durante el mediodía con la grabación.',
              },
              {
                q: '¿Mis entradas de diario son leídas por el guía o la comunidad?',
                a: 'Nunca. Tu diario está blindado técnicamente con Row Level Security a nivel de base de datos. Ningún otro usuario ni administrador tiene acceso a tus textos íntimos.',
              },
              {
                q: '¿Puedo cancelar en cualquier momento?',
                a: 'Sí, con un solo clic desde tu perfil. Sin llamadas, sin trucos ni periodos de permanencia.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-sand-200 overflow-hidden transition-all shadow-subtle"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-serif font-bold text-base text-stone-900"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-stone-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-stone-500 flex-shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-stone-600 leading-relaxed border-t border-sand-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. FINAL CTA */}
      <section className="py-20 sm:py-28 bg-stone-950 text-sand-50 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6 relative z-10">
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
            Tu práctica comienza mañana
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold leading-tight">
            Frena el ruido.<br />
            Tu vocación te está esperando.
          </h2>
          <p className="text-xs sm:text-sm text-sand-300 max-w-lg mx-auto leading-relaxed">
            Dedícate los primeros 30 minutos de tu día antes de que el mundo te robe la atención. Entra en los 7 días de prueba gratuita ahora mismo.
          </p>
          <div className="pt-4">
            <button
              onClick={() => navigate('/prueba')}
              className="travesia-btn-accent text-sm py-4 px-10 font-bold shadow-2xl text-stone-950 inline-flex items-center gap-2"
            >
              <span>Comenzar experiencia gratuita</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-stone-900 text-sand-400 text-xs py-10 border-t border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400" />
            <span className="font-serif font-bold text-white tracking-wider">TRAVESÍA</span>
            <span className="text-stone-500">· Santuario de Claridad Personal</span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <button onClick={() => navigate('/fundador')} className="hover:text-white transition-colors">
              El Fundador
            </button>
            <button onClick={() => navigate('/membership')} className="hover:text-white transition-colors">
              Membresía
            </button>
            <button onClick={() => navigate('/prueba')} className="hover:text-white transition-colors">
              Reto 7 Días
            </button>
            <button onClick={() => navigate('/login')} className="hover:text-white transition-colors">
              Acceso Miembros
            </button>
          </div>

          <div className="text-[11px] text-stone-500">
            © 2026 TRAVESÍA. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};
