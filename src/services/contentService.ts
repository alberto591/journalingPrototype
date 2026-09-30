import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ContentItem, ContentPlatform, ContentStatus } from '../types';

const CONTENT_STORAGE_KEY = 'travesia_content_items_v3';

const INITIAL_CONTENT_ITEMS: ContentItem[] = [
  {
    "id": "cnt-1",
    "title": "La trampa de revisar el móvil antes de salir de la cama",
    "body": "Tu cerebro pasa de ondas theta a pánico en 3 segundos. Cómo 5 minutos de silencio cambian todo tu día.",
    "platform": "Instagram",
    "status": "Ready",
    "cta": "Comenta RUIDO y te paso el ejercicio del Día 1.",
    "campaign": "Reto 7 Días",
    "created_at": "2026-09-28T10:00:00Z"
  },
  {
    "id": "cnt-2",
    "title": "No tienes falta de tiempo; tienes exceso de compromisos cobardes",
    "body": "Aprender a decir no sin explicaciones eternas es el primer paso hacia una agenda con alma.",
    "platform": "Instagram",
    "status": "Ready",
    "cta": "Escribe CLARIDAD y te envío el decálogo.",
    "campaign": "Lanzamiento Fundadores",
    "created_at": "2026-09-28T10:00:00Z"
  },
  {
    "id": "cnt-3",
    "title": "El cansancio que sientes no se cura durmiendo 10 horas",
    "body": "El cansancio existencial viene de vivir en contradicción con tus valores más profundos.",
    "platform": "Instagram",
    "status": "Ready",
    "cta": "Comenta SILENCIO para empezar a frenar.",
    "campaign": "Orgánico",
    "created_at": "2026-09-28T10:00:00Z"
  },
  {
    "id": "cnt-4",
    "title": "Por qué hacer listas de 20 tareas diarias es una forma de autoboicot",
    "body": "La dispersión te hace sentir ocupado mientras evitas la única decisión que de verdad importa.",
    "platform": "Instagram",
    "status": "Ready",
    "cta": "Escribe ACCIÓN y te muestro el Movimiento 5.",
    "campaign": "Reto 7 Días",
    "created_at": "2026-09-28T10:00:00Z"
  },
  {
    "id": "cnt-5",
    "title": "Lo que no nombras te gobierna",
    "body": "No estás \"estresado\". Tienes miedo a defraudar o ira por una injusticia no hablada. Aprende a nombrarlo.",
    "platform": "Instagram",
    "status": "Ready",
    "cta": "Comenta EMOCIÓN y te envío el catálogo.",
    "campaign": "Reto 7 Días",
    "created_at": "2026-09-28T10:00:00Z"
  },
  {
    "id": "cnt-6",
    "title": "La soledad del líder que nadie cuenta",
    "body": "Cuando todo el mundo espera respuestas de ti, ¿dónde vas tú a escuchar en silencio?",
    "platform": "Instagram",
    "status": "Ready",
    "cta": "Escribe SANTUARIO para conocer la sala en vivo.",
    "campaign": "Lanzamiento Fundadores",
    "created_at": "2026-09-28T10:00:00Z"
  },
  {
    "id": "cnt-7",
    "title": "¿Cuándo fue la última vez que pasaste 15 minutos sin un auricular en la oreja?",
    "body": "El ruido blanco nos anestesia para no escuchar el vacío. Prueba a caminar en silencio hoy.",
    "platform": "Instagram",
    "status": "Ready",
    "cta": "Comenta RUIDO para unirte al reto.",
    "campaign": "Orgánico",
    "created_at": "2026-09-28T10:00:00Z"
  },
  {
    "id": "cnt-8",
    "title": "El perfeccionismo es solo miedo con traje de gala",
    "body": "La excelencia sirve; el perfeccionismo paraliza. Haz hoy el trabajo imperfecto pero valiente.",
    "platform": "Instagram",
    "status": "Ready",
    "cta": "Escribe CLARIDAD por mensaje directo.",
    "campaign": "Orgánico",
    "created_at": "2026-09-28T10:00:00Z"
  },
  {
    "id": "cnt-9",
    "title": "El costo invisible de tolerar a personas que drenan tu paz",
    "body": "Poner límites no es falta de caridad; es mayordomía de tu energía vocacional.",
    "platform": "Instagram",
    "status": "Ready",
    "cta": "Comenta LÍMITES para ver la lección.",
    "campaign": "Lanzamiento Fundadores",
    "created_at": "2026-09-28T10:00:00Z"
  },
  {
    "id": "cnt-10",
    "title": "El poder del \"martes normal\" a 3 años vista",
    "body": "Deja de soñar con metas extravagantes. Diseña con precisión sensorial un martes ordinario con paz.",
    "platform": "Instagram",
    "status": "Ready",
    "cta": "Escribe VISIÓN para el ejercicio guiado.",
    "campaign": "Semana 2 Visión",
    "created_at": "2026-09-28T10:00:00Z"
  },
  {
    "id": "cnt-11",
    "title": "No necesitas otro libro de productividad. Necesitas frenar.",
    "body": "El conocimiento sin digestión se convierte en cinismo intelectual. Menos consumir, más actuar.",
    "platform": "Instagram",
    "status": "Ready",
    "cta": "Comenta FRENAR para empezar el reto.",
    "campaign": "Reto 7 Días",
    "created_at": "2026-09-28T10:00:00Z"
  },
  {
    "id": "cnt-12",
    "title": "La conversación que estás evitando está retrasando tu madurez",
    "body": "El conflicto limpio es la antesala de la intimidad y la verdad en tus relaciones.",
    "platform": "Instagram",
    "status": "Ready",
    "cta": "Escribe VERDAD y te envío la pauta.",
    "campaign": "Orgánico",
    "created_at": "2026-09-28T10:00:00Z"
  },
  {
    "id": "cnt-13",
    "title": "Por qué la fuerza de voluntad falla a las 18:00",
    "body": "La disciplina no es apretar los dientes; es diseñar un entorno donde lo bueno sea fácil y lo malo engorroso.",
    "platform": "Instagram",
    "status": "Ready",
    "cta": "Comenta HÁBITO para la guía.",
    "campaign": "Reto 7 Días",
    "created_at": "2026-09-28T10:00:00Z"
  },
  {
    "id": "cnt-14",
    "title": "El silencio como acto de rebeldía en la era de los algoritmos",
    "body": "Quieren tu atención para monetizarla. Recuperar tu silencio es recuperar tu soberanía.",
    "platform": "Instagram",
    "status": "Ready",
    "cta": "Escribe CLARIDAD y entra a la práctica.",
    "campaign": "Lanzamiento Fundadores",
    "created_at": "2026-09-28T10:00:00Z"
  },
  {
    "id": "cnt-15",
    "title": "Cómo distinguir la voz de tu ego de la voz de Dios",
    "body": "El ego grita, exige inmediatez y busca aplausos. La verdad susurra, pide obediencia y trae paz.",
    "platform": "Instagram",
    "status": "Ready",
    "cta": "Comenta ESCUCHA para el audio guiado.",
    "campaign": "Reto 7 Días",
    "created_at": "2026-09-28T10:00:00Z"
  },
  {
    "id": "cnt-16",
    "title": "¿Qué harías si nadie fuera a enterarse?",
    "body": "La verdadera vocación florece en lo oculto. Haz tu trabajo con excelencia para una audiencia de Uno.",
    "platform": "Instagram",
    "status": "Ready",
    "cta": "Escribe TRABAJO para unirte.",
    "campaign": "Orgánico",
    "created_at": "2026-09-28T10:00:00Z"
  },
  {
    "id": "cnt-17",
    "title": "El peligro de convertir tu sufrimiento en tu identidad",
    "body": "Aferrarte a la queja te libra de asumir la responsabilidad de construir tu siguiente capítulo.",
    "platform": "Instagram",
    "status": "Ready",
    "cta": "Comenta RESPONSABILIDAD.",
    "campaign": "Orgánico",
    "created_at": "2026-09-28T10:00:00Z"
  },
  {
    "id": "cnt-18",
    "title": "La regla de oro: Una sola acción antes del mediodía",
    "body": "Elige la tarea más difícil primero. Todo lo demás será cuesta abajo.",
    "platform": "Instagram",
    "status": "Ready",
    "cta": "Escribe ACCIÓN y pruébalo mañana.",
    "campaign": "Reto 7 Días",
    "created_at": "2026-09-28T10:00:00Z"
  },
  {
    "id": "cnt-19",
    "title": "La diferencia entre culpa sana y culpa destructiva",
    "body": "El remordimiento te hunde en el pasado; el arrepentimiento sincero te impulsa a enmendar el camino.",
    "platform": "Instagram",
    "status": "Ready",
    "cta": "Comenta PAZ para la reflexión.",
    "campaign": "Orgánico",
    "created_at": "2026-09-28T10:00:00Z"
  },
  {
    "id": "cnt-20",
    "title": "Desacelerar no es ser vago; es ser inteligente",
    "body": "Nadie toma buenas decisiones al galope. Frena 25 minutos para ver el mapa con claridad.",
    "platform": "Instagram",
    "status": "Ready",
    "cta": "Escribe FRENAR por privado.",
    "campaign": "Reto 7 Días",
    "created_at": "2026-09-28T10:00:00Z"
  },
  {
    "id": "cnt-21",
    "title": "Tu teléfono no debería dormir en tu mesilla de noche",
    "body": "El hábito más transformador: un despertador analógico de 10€ y el móvil fuera del dormitorio.",
    "platform": "Instagram",
    "status": "Ready",
    "cta": "Comenta NOCHE para el ritual de cierre.",
    "campaign": "Orgánico",
    "created_at": "2026-09-28T10:00:00Z"
  },
  {
    "id": "cnt-22",
    "title": "¿Qué le estás enseñando a tus hijos con tu nivel de prisa?",
    "body": "El estrés se contagia sin palabras. Regálales una presencia tranquila.",
    "platform": "Instagram",
    "status": "Ready",
    "cta": "Escribe PRESENCIA para la guía familiar.",
    "campaign": "Lanzamiento Fundadores",
    "created_at": "2026-09-28T10:00:00Z"
  },
  {
    "id": "cnt-23",
    "title": "El examen de conciencia no es para castigarte, es para liberarte",
    "body": "Una mirada lúcida al final del día te permite perdonar, corregir y dormir en paz.",
    "platform": "Instagram",
    "status": "Ready",
    "cta": "Comenta EXAMEN para la plantilla.",
    "campaign": "Orgánico",
    "created_at": "2026-09-28T10:00:00Z"
  },
  {
    "id": "cnt-24",
    "title": "Por qué nos da tanto miedo quedarnos a solas con nosotros mismos",
    "body": "El ruido es una tapadera para no mirar las preguntas esenciales que llevamos dentro.",
    "platform": "Instagram",
    "status": "Ready",
    "cta": "Escribe RUIDO y frena 7 días.",
    "campaign": "Reto 7 Días",
    "created_at": "2026-09-28T10:00:00Z"
  },
  {
    "id": "cnt-25",
    "title": "Un santuario matutino de 30 minutos",
    "body": "Cómo un grupo de profesionales y fundadores nos reunimos de lunes a viernes en silencio en directo.",
    "platform": "Instagram",
    "status": "Ready",
    "cta": "Comenta EN VIVO para entrar.",
    "campaign": "Lanzamiento Fundadores",
    "created_at": "2026-09-28T10:00:00Z"
  },
  {
    "id": "cnt-26",
    "title": "La trampa del consumo pasivo de podcasts de desarrollo personal",
    "body": "Escuchar a otros hablar de disciplina no te hace más disciplinado. Escribe en tu diario.",
    "platform": "Instagram",
    "status": "Ready",
    "cta": "Escribe DIARIO para empezar.",
    "campaign": "Orgánico",
    "created_at": "2026-09-28T10:00:00Z"
  },
  {
    "id": "cnt-27",
    "title": "Decir la verdad con amor: el arte de la confrontación serena",
    "body": "Callar por no molestar es cobardía disfrazada de empatía.",
    "platform": "Instagram",
    "status": "Ready",
    "cta": "Comenta VALOR y te envío las pautas.",
    "campaign": "Semana 4",
    "created_at": "2026-09-28T10:00:00Z"
  },
  {
    "id": "cnt-28",
    "title": "El mito de la motivación constante",
    "body": "Los profesionales se presentan cuando no tienen ganas. Los aficionados esperan a que baje la musa.",
    "platform": "Instagram",
    "status": "Ready",
    "cta": "Escribe RITUAL y únete al directo.",
    "campaign": "Reto 7 Días",
    "created_at": "2026-09-28T10:00:00Z"
  },
  {
    "id": "cnt-29",
    "title": "¿Qué precio estás dispuesto a pagar por tu visión?",
    "body": "Todo crecimiento exige una poda. Si no decides qué vas a cortar, la vida lo decidirá por ti.",
    "platform": "Instagram",
    "status": "Ready",
    "cta": "Comenta PODA para el ejercicio.",
    "campaign": "Lanzamiento Fundadores",
    "created_at": "2026-09-28T10:00:00Z"
  },
  {
    "id": "cnt-30",
    "title": "Tu próximo capítulo no se escribe solo",
    "body": "Al final de cada mes en Travesía consolidamos nuestro documento integrador de vida.",
    "platform": "Instagram",
    "status": "Ready",
    "cta": "Escribe CAPÍTULO y conoce Travesía.",
    "campaign": "Lanzamiento Fundadores",
    "created_at": "2026-09-28T10:00:00Z"
  },
  {
    "id": "cnt-31",
    "title": "Guion TikTok: 3 respiraciones para frenar un ataque de prisa",
    "body": "Hook visual: Pantalla parpadeando -> Cierra ojos -> 4s inspira, 4s retén, 4s exhala, 4s espera -> Sonrisa serena.",
    "platform": "TikTok",
    "status": "Ready",
    "cta": "Comenta RUIDO y te paso la práctica completa.",
    "campaign": "Reto 7 Días",
    "created_at": "2026-09-28T10:30:00Z"
  },
  {
    "id": "cnt-32",
    "title": "Guion Reels: Lo que hago a las 06:45 antes de mirar el móvil",
    "body": "Hook: \"Llevo 3 meses sin tocar la pantalla antes de las 07:30. Esto es lo que cambió en mi paz mental.\"",
    "platform": "TikTok",
    "status": "Ready",
    "cta": "Escribe MAÑANA y pruébalo gratis.",
    "campaign": "Reto 7 Días",
    "created_at": "2026-09-28T10:30:00Z"
  },
  {
    "id": "cnt-33",
    "title": "Guion Shorts: El error de las to-do lists infinitas",
    "body": "Hook: Tacho 19 tareas inútiles. Me quedo con una sola. \"Una sola acción bien elegida cambia tu día.\"",
    "platform": "TikTok",
    "status": "Ready",
    "cta": "Comenta ACCIÓN para el método.",
    "campaign": "Reto 7 Días",
    "created_at": "2026-09-28T10:30:00Z"
  },
  {
    "id": "cnt-34",
    "title": "Guion TikTok: Si te sientes perdido en tu carrera profesional, mira esto",
    "body": "Hook: Dibujo de brújula. \"¿Estás persiguiendo el aplauso ajeno o sirviendo a tu vocación real?\"",
    "platform": "TikTok",
    "status": "Ready",
    "cta": "Escribe BRÚJULA por DM.",
    "campaign": "Orgánico",
    "created_at": "2026-09-28T10:30:00Z"
  },
  {
    "id": "cnt-35",
    "title": "Guion Reels: Por qué 20 personas nos conectamos a las 07:00 en silencio",
    "body": "Hook: Grabación de pantalla de la sala en vivo con todo el mundo en silencio escribiendo.",
    "platform": "TikTok",
    "status": "Ready",
    "cta": "Comenta EN VIVO y te invito a una sesión.",
    "campaign": "Lanzamiento Fundadores",
    "created_at": "2026-09-28T10:30:00Z"
  },
  {
    "id": "cnt-36",
    "title": "Guion Shorts: 3 preguntas para hacerte cuando estés en bucle mental",
    "body": "1. ¿Es verdad o es una suposición? 2. ¿Depende de mí? 3. ¿Qué puedo hacer hoy?",
    "platform": "TikTok",
    "status": "Ready",
    "cta": "Escribe CLARIDAD.",
    "campaign": "Orgánico",
    "created_at": "2026-09-28T10:30:00Z"
  },
  {
    "id": "cnt-37",
    "title": "Guion TikTok: El verdadero motivo por el que procrastinas esa llamada",
    "body": "Hook: No es pereza. Es miedo al rechazo o a la incomodidad de la verdad.",
    "platform": "TikTok",
    "status": "Ready",
    "cta": "Comenta MIEDO para el audio.",
    "campaign": "Reto 7 Días",
    "created_at": "2026-09-28T10:30:00Z"
  },
  {
    "id": "cnt-38",
    "title": "Guion Reels: El despertador de 10 euros que salvó mis mañanas",
    "body": "Hook: Muestro reloj analógico simple. Adiós notificaciones al abrir los ojos.",
    "platform": "TikTok",
    "status": "Ready",
    "cta": "Escribe HÁBITO.",
    "campaign": "Orgánico",
    "created_at": "2026-09-28T10:30:00Z"
  },
  {
    "id": "cnt-39",
    "title": "Guion Shorts: Cómo nombrar lo que sientes en 60 segundos",
    "body": "Hook: Dolor, Soledad, Tristeza, Ira, Miedo, Vergüenza, Culpa, Alegría. Nombrar es sanar.",
    "platform": "TikTok",
    "status": "Ready",
    "cta": "Comenta EMOCIONES.",
    "campaign": "Reto 7 Días",
    "created_at": "2026-09-28T10:30:00Z"
  },
  {
    "id": "cnt-40",
    "title": "Guion TikTok: La mentira de \"no tengo tiempo para meditar o rezar\"",
    "body": "Hook: Pantalla de tiempo de uso de Instagram: 2h 45m. \"Tienes tiempo, pero lo regalas al algoritmo.\"",
    "platform": "TikTok",
    "status": "Ready",
    "cta": "Escribe TIEMPO.",
    "campaign": "Reto 7 Días",
    "created_at": "2026-09-28T10:30:00Z"
  },
  {
    "id": "cnt-41",
    "title": "Guion Reels: Mi regla innegociable de desconexión nocturna",
    "body": "Hook: A las 21:30 el router o el teléfono se apaga. Espacio sagrado de lectura y descanso.",
    "platform": "TikTok",
    "status": "Ready",
    "cta": "Comenta NOCHE.",
    "campaign": "Orgánico",
    "created_at": "2026-09-28T10:30:00Z"
  },
  {
    "id": "cnt-42",
    "title": "Guion Shorts: El gimnasio de claridad personal explicado en 45 segundos",
    "body": "Hook: No es una app de notas. Es presentarte cada día con otros para forjar carácter.",
    "platform": "TikTok",
    "status": "Ready",
    "cta": "Escribe GIMNASIO.",
    "campaign": "Lanzamiento Fundadores",
    "created_at": "2026-09-28T10:30:00Z"
  },
  {
    "id": "cnt-43",
    "title": "Guion TikTok: 1 pregunta para antes de acostarte hoy",
    "body": "\"¿Qué conversación tuviste hoy donde fuiste 100% sincero?\"",
    "platform": "TikTok",
    "status": "Ready",
    "cta": "Comenta VERDAD.",
    "campaign": "Orgánico",
    "created_at": "2026-09-28T10:30:00Z"
  },
  {
    "id": "cnt-44",
    "title": "Guion Reels: Cómo superar la parálisis del impostor",
    "body": "Hook: Recuerda de dónde vienes. Haz el trabajo con humildad y déjate de comparaciones.",
    "platform": "TikTok",
    "status": "Ready",
    "cta": "Escribe TRABAJO.",
    "campaign": "Lanzamiento Fundadores",
    "created_at": "2026-09-28T10:30:00Z"
  },
  {
    "id": "cnt-45",
    "title": "Guion Shorts: 5 minutos que te ahorran 5 horas de agobio",
    "body": "Hook: El poder de vaciar la mente en el papel antes de encender el ordenador.",
    "platform": "TikTok",
    "status": "Ready",
    "cta": "Comenta PAPEL y te paso la plantilla.",
    "campaign": "Reto 7 Días",
    "created_at": "2026-09-28T10:30:00Z"
  },
  {
    "id": "cnt-46",
    "title": "Newsletter #01: Por qué no necesitas más técnicas de productividad",
    "body": "No te falta disciplina; te sobra ruido. Carta abierta a profesionales saturados sobre el poder de una sola acción.",
    "platform": "Newsletter",
    "status": "Draft",
    "cta": "Inscríbete a los 7 días de práctica.",
    "campaign": "Newsletter",
    "created_at": "2026-09-28T11:00:00Z"
  },
  {
    "id": "cnt-47",
    "title": "Newsletter #02: El veneno del resentimiento silencioso",
    "body": "Cómo las cuentas pendientes con socios o familiares bloquean tu energía creadora.",
    "platform": "Newsletter",
    "status": "Draft",
    "cta": "Comienza el módulo de Los Obstáculos.",
    "campaign": "Newsletter",
    "created_at": "2026-09-28T11:00:00Z"
  },
  {
    "id": "cnt-48",
    "title": "Newsletter #03: El diseño de un martes normal a 3 años",
    "body": "Por qué la felicidad no está en eventos excepcionales, sino en la paz de tu rutina ordinaria.",
    "platform": "Newsletter",
    "status": "Draft",
    "cta": "Descarga el mapa de Visión.",
    "campaign": "Newsletter",
    "created_at": "2026-09-28T11:00:00Z"
  },
  {
    "id": "cnt-49",
    "title": "Newsletter #04: La mayordomía del cuerpo y el descanso",
    "body": "El agotamiento crónico como síntoma espiritual de desconfianza y necesidad de control.",
    "platform": "Newsletter",
    "status": "Draft",
    "cta": "Prueba la sesión matutina guiada.",
    "campaign": "Newsletter",
    "created_at": "2026-09-28T11:00:00Z"
  },
  {
    "id": "cnt-50",
    "title": "Newsletter #05: Mi Próximo Capítulo: cerrar ciclos con sobriedad",
    "body": "El ritual mensual de consolidación y balance para no vivir arrastrado por la inercia.",
    "platform": "Newsletter",
    "status": "Draft",
    "cta": "Únete a los miembros fundadores.",
    "campaign": "Newsletter",
    "created_at": "2026-09-28T11:00:00Z"
  },
  {
    "id": "cnt-51",
    "title": "Práctica Libre 1: Respiración diafragmática de 4 tiempos",
    "body": "Grabación de audio de 5 minutos con campanas tibetanas para detener la agitación.",
    "platform": "Community",
    "status": "Ready",
    "cta": "Haz la práctica en travesia.app/prueba.",
    "campaign": "Reto 7 Días",
    "created_at": "2026-09-28T11:30:00Z"
  },
  {
    "id": "cnt-52",
    "title": "Práctica Libre 2: El vaciado mental en 3 minutos",
    "body": "Plantilla de descarga sin filtros para desatascar la mente colapsada.",
    "platform": "Community",
    "status": "Ready",
    "cta": "Descarga el ejercicio guiado.",
    "campaign": "Reto 7 Días",
    "created_at": "2026-09-28T11:30:00Z"
  },
  {
    "id": "cnt-53",
    "title": "Práctica Libre 3: La auditoría de las 8 emociones básicas",
    "body": "Checklist para identificar si lo que sientes es dolor, ira, miedo o tristeza.",
    "platform": "Community",
    "status": "Ready",
    "cta": "Comenta EMOCIÓN para recibir el PDF.",
    "campaign": "Reto 7 Días",
    "created_at": "2026-09-28T11:30:00Z"
  },
  {
    "id": "cnt-54",
    "title": "Práctica Libre 4: Silencio guiado de 5 minutos",
    "body": "Temporizador contemplativo con guía vocal para entrenar la quietud matutina.",
    "platform": "Community",
    "status": "Ready",
    "cta": "Pruébalo en la app sin registro.",
    "campaign": "Reto 7 Días",
    "created_at": "2026-09-28T11:30:00Z"
  },
  {
    "id": "cnt-55",
    "title": "Práctica Libre 5: Hoja de compromiso de una sola acción",
    "body": "Formato ineludible para sellar tu única prioridad del día con hora y lugar.",
    "platform": "Community",
    "status": "Ready",
    "cta": "Escribe ACCIÓN para recibir la hoja.",
    "campaign": "Reto 7 Días",
    "created_at": "2026-09-28T11:30:00Z"
  },
  {
    "id": "cnt-56",
    "title": "Comunidad: ¿Cuál fue tu mayor distracción de esta semana?",
    "body": "Espacio para confesar honestamente dónde se nos fue la atención sin juzgarnos.",
    "platform": "Community",
    "status": "Published",
    "cta": "Comparte en el canal #el-ruido.",
    "campaign": "Comunidad",
    "created_at": "2026-09-28T12:00:00Z"
  },
  {
    "id": "cnt-57",
    "title": "Comunidad: Comparte tu única acción ineludible de hoy",
    "body": "Escribe tu compromiso con hora fijada para rendir cuentas a la sala.",
    "platform": "Community",
    "status": "Published",
    "cta": "Publica en #el-trabajo.",
    "campaign": "Comunidad",
    "created_at": "2026-09-28T12:00:00Z"
  },
  {
    "id": "cnt-58",
    "title": "Comunidad: ¿A qué conversación le estás teniendo miedo?",
    "body": "Miremos de frente la relación que requiere coraje y verdad esta semana.",
    "platform": "Community",
    "status": "Published",
    "cta": "Debate en #conversacion-principal.",
    "campaign": "Comunidad",
    "created_at": "2026-09-28T12:00:00Z"
  },
  {
    "id": "cnt-59",
    "title": "Comunidad: Un libro o texto que te devolvió la compostura",
    "body": "Comparte lecturas sobrias que hayan marcado tu camino espiritual o profesional.",
    "platform": "Community",
    "status": "Published",
    "cta": "Añádelo a #biblioteca.",
    "campaign": "Comunidad",
    "created_at": "2026-09-28T12:00:00Z"
  },
  {
    "id": "cnt-60",
    "title": "Comunidad: Celebración de una racha o un hábito protegido",
    "body": "Honremos los pequeños pasos consistentes dados en el silencio de la semana.",
    "platform": "Community",
    "status": "Published",
    "cta": "Celebra en el canal principal.",
    "campaign": "Comunidad",
    "created_at": "2026-09-28T12:00:00Z"
  },
  {
    "id": "cnt-61",
    "title": "Comunidad: ¿Cómo viviste el Movimiento 4 hoy?",
    "body": "Reflexiones sobre la escucha atenta y la oración en medio del silencio.",
    "platform": "Community",
    "status": "Published",
    "cta": "Comenta en #sesiones-de-diario.",
    "campaign": "Comunidad",
    "created_at": "2026-09-28T12:00:00Z"
  },
  {
    "id": "cnt-62",
    "title": "Comunidad: El obstáculo que derribaste en la Semana 3",
    "body": "Testimonios reales de superación del autoboicot y la postergación.",
    "platform": "Community",
    "status": "Published",
    "cta": "Publica en #los-obstaculos.",
    "campaign": "Comunidad",
    "created_at": "2026-09-28T12:00:00Z"
  },
  {
    "id": "cnt-63",
    "title": "Comunidad: Tu visión de un martes ordinario",
    "body": "Párrafos inspiradores sobre cómo visualizas tu jornada ideal de servicio y paz.",
    "platform": "Community",
    "status": "Published",
    "cta": "Canal #la-vision.",
    "campaign": "Comunidad",
    "created_at": "2026-09-28T12:00:00Z"
  },
  {
    "id": "cnt-64",
    "title": "Comunidad: Agradecimiento a un compañero de la sala",
    "body": "Dar gracias a quien te inspiró a conectarte a primera hora de la mañana.",
    "platform": "Community",
    "status": "Published",
    "cta": "Menciona a tu compañero.",
    "campaign": "Comunidad",
    "created_at": "2026-09-28T12:00:00Z"
  },
  {
    "id": "cnt-65",
    "title": "Comunidad: Síntesis de \"Mi Próximo Capítulo\"",
    "body": "Puntos clave del balance mensual para arrancar el siguiente ciclo con fuerza.",
    "platform": "Community",
    "status": "Published",
    "cta": "Comparte tu síntesis.",
    "campaign": "Comunidad",
    "created_at": "2026-09-28T12:00:00Z"
  }
];

export const contentService = {
  // Fetch editorial content items
  async fetchContentItems(): Promise<ContentItem[]> {
    if (!isSupabaseConfigured) {
      try {
        const stored = localStorage.getItem(CONTENT_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
        localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(INITIAL_CONTENT_ITEMS));
        return INITIAL_CONTENT_ITEMS;
      } catch {
        return INITIAL_CONTENT_ITEMS;
      }
    }

    try {
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return [];
      }
      return (data as ContentItem[]) || [];
    } catch {
      return [];
    }
  },

  // Create a new content piece
  async createContentItem(item: Omit<ContentItem, 'id' | 'created_at'>): Promise<ContentItem> {
    const newItem: ContentItem = {
      ...item,
      id: `cnt-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured) {
      try {
        const stored = localStorage.getItem(CONTENT_STORAGE_KEY);
        const list: ContentItem[] = stored ? JSON.parse(stored) : INITIAL_CONTENT_ITEMS;
        const updated = [newItem, ...list];
        localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return newItem;
    }

    try {
      const { data } = await supabase
        .from('content_items')
        .insert({
          title: item.title,
          body: item.body,
          platform: item.platform,
          status: item.status,
          scheduled_date: item.scheduled_date,
          cta: item.cta,
          campaign: item.campaign,
        })
        .select()
        .single();

      return (data as ContentItem) || newItem;
    } catch {
      return newItem;
    }
  },

  // Update content status (Idea -> Draft -> Ready -> Published)
  async updateContentStatus(id: string, status: ContentStatus): Promise<void> {
    const now = status === 'Published' ? new Date().toISOString() : undefined;

    if (!isSupabaseConfigured) {
      try {
        const stored = localStorage.getItem(CONTENT_STORAGE_KEY);
        if (stored) {
          const list: ContentItem[] = JSON.parse(stored);
          const found = list.find(i => i.id === id);
          if (found) {
            found.status = status;
            if (now) found.published_date = now;
            localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(list));
          }
        }
      } catch {}
      return;
    }

    try {
      await supabase
        .from('content_items')
        .update({
          status,
          ...(now ? { published_date: now } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    } catch {}
  },

  // Delete content item
  async deleteContentItem(id: string): Promise<void> {
    if (!isSupabaseConfigured) {
      try {
        const stored = localStorage.getItem(CONTENT_STORAGE_KEY);
        if (stored) {
          const list: ContentItem[] = JSON.parse(stored);
          const updated = list.filter(i => i.id !== id);
          localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(updated));
        }
      } catch {}
      return;
    }

    try {
      await supabase.from('content_items').delete().eq('id', id);
    } catch {}
  }
};
