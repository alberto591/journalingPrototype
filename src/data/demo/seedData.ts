import { 
  Profile, 
  Channel, 
  Post, 
  Comment, 
  EventItem, 
  Lesson, 
  Book, 
  SessionRecording, 
  JournalSession 
} from '../../types';

export const DEMO_CHANNELS: Channel[] = [
  {
    id: 'ch-general',
    slug: 'conversacion-principal',
    name: 'Conversación principal',
    description: 'Punto de encuentro de la comunidad TRAVESÍA. Reflexiones compartidas, preguntas y fraternidad.',
    icon_name: 'flame',
    order_index: 1,
  },
  {
    id: 'ch-journal',
    slug: 'sesiones-de-diario',
    name: 'Sesiones de diario',
    description: 'Espacio para compartir compromisos del día, descubrimientos tras la práctica y rendición de cuentas.',
    icon_name: 'check-circle-2',
    order_index: 2,
  },
  {
    id: 'ch-start',
    slug: 'empezar-aqui',
    name: 'Empezar aquí',
    description: 'Bienvenida para nuevos miembros, orientación metodológica, acuerdos de honor y guía de inicio.',
    icon_name: 'compass',
    order_index: 3,
  },
  {
    id: 'ch-noise',
    slug: 'el-ruido',
    name: 'El Ruido',
    description: 'Estrategias y reflexiones sobre cómo desacelerar, silenciar estímulos y proteger la atención.',
    icon_name: 'waves',
    order_index: 4,
  },
  {
    id: 'ch-vision',
    slug: 'la-vision',
    name: 'La Visión',
    description: 'Descubrimiento de propósito, vocación, alineación con la voluntad divina y legado familiar.',
    icon_name: 'eye',
    order_index: 5,
  },
  {
    id: 'ch-obstacles',
    slug: 'los-obstaculos',
    name: 'Los Obstáculos',
    description: 'Identificación honesta de patrones de evasión, orgullo, miedos no resueltos y mentiras internas.',
    icon_name: 'shield-alert',
    order_index: 6,
  },
  {
    id: 'ch-work',
    slug: 'el-trabajo',
    name: 'El Trabajo',
    description: 'La forja diaria: disciplina, conversaciones difíciles, sacrificios necesarios y compromisos cumplidos.',
    icon_name: 'hammer',
    order_index: 7,
  },
  {
    id: 'ch-library',
    slug: 'biblioteca',
    name: 'Biblioteca',
    description: 'Recomendaciones de lecturas esenciales, desgloses de libros fundamentales y notas de estudio.',
    icon_name: 'book-open',
    order_index: 8,
  },
  {
    id: 'ch-archive',
    slug: 'archivo',
    name: 'Archivo',
    description: 'Grabaciones de todas las sesiones guiadas en directo, mentorías grupales y talleres de formación.',
    icon_name: 'film',
    order_index: 9,
  },
];

export const DEMO_CURRENT_USER: Profile = {
  id: 'usr-mateo-silva',
  name: 'Mateo Silva',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  bio: 'Arquitecto y padre de familia. Buscando bajar el ritmo para construir con propósito y serenidad.',
  location: 'Madrid, España',
  role: 'member',
  focus_areas: ['Disciplina', 'Espiritualidad', 'Familia', 'Propósito'],
  created_at: '2025-11-15T09:00:00Z',
  streak_days: 7,
  completed_sessions_count: 23,
  reflection_minutes: 702,
  current_week: 2,
  onboarding_completed: true,
};

export const DEMO_ADMIN_USER: Profile = {
  id: 'usr-alberto-calvo',
  name: 'Alberto Calvo',
  avatar_url: '/alberto-calvo.png',
  bio: 'Fundador de TRAVESÍA. Mentor de vida y liderazgo espiritual. Guía en las sesiones diarias de journaling.',
  location: 'Sevilla, España',
  role: 'admin',
  focus_areas: ['Liderazgo', 'Dirección Espiritual', 'Journaling'],
  created_at: '2025-01-01T08:00:00Z',
  streak_days: 142,
  completed_sessions_count: 320,
  reflection_minutes: 9600,
  current_week: 4,
  onboarding_completed: true,
};

const FIRST_NAMES = [
  'Carlos', 'Andrés', 'Javier', 'Santiago', 'Gabriel', 'Alejandro', 'Diego', 'Rodrigo', 'Fernando', 'Tomás',
  'Elena', 'Sofía', 'Lucía', 'Valeria', 'Camila', 'Mariana', 'Beatriz', 'Inés', 'Carmen', 'Raquel',
  'Ignacio', 'Álvaro', 'Pablo', 'Manuel', 'Guillermo', 'Nicolás', 'Felipe', 'Joaquín', 'Hugo', 'Emilio',
  'Paula', 'Natalia', 'Clara', 'Daniela', 'Victoria', 'Sara', 'Laura', 'Teresa', 'Patricia', 'Andrea',
  'Marcos', 'Lucas', 'Sebastián', 'Gonzalo', 'Enrique', 'Biel', 'Bruno', 'Adrián', 'Esteban', 'Jaime'
];

const LAST_NAMES = [
  'García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín',
  'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Muñoz', 'Álvarez', 'Romero', 'Alonso', 'Gutiérrez'
];

export const DEMO_MEMBERS: Profile[] = [
  DEMO_ADMIN_USER,
  DEMO_CURRENT_USER,
  ...FIRST_NAMES.slice(0, 48).map((fn, idx) => {
    const ln = LAST_NAMES[idx % LAST_NAMES.length];
    return {
      id: `usr-demo-${idx + 1}`,
      name: `${fn} ${ln}`,
      avatar_url: `https://images.unsplash.com/photo-${1500000000000 + (idx * 314159) % 100000000}?w=150&auto=format&fit=crop&q=80`,
      bio: 'Miembro de Travesía en búsqueda de constancia y silencio interior.',
      location: 'España',
      role: idx === 0 ? 'coach' : 'member',
      focus_areas: ['Disciplina', 'Espiritualidad'],
      created_at: new Date(Date.now() - (idx + 10) * 86400000 * 2).toISOString(),
      streak_days: (idx * 3) % 29 + 1,
      completed_sessions_count: (idx * 5) % 60 + 5,
      reflection_minutes: ((idx * 5) % 60 + 5) * 30,
      current_week: ((idx % 4) + 1),
      onboarding_completed: true,
    } as Profile;
  })
];

export const DEMO_EVENTS: EventItem[] = [
  {
    id: 'evt-today-morning',
    title: 'Sesión diaria — El ruido',
    description: '35 minutos guiados: 5 minutos de respiración y quietud, 12 minutos de escritura profunda, ejercicio de discernimiento de emociones y un compromiso concreto para la jornada.',
    date: new Date(Date.now() + 4 * 3600000).toISOString(),
    start_time: '08:00',
    end_time: '08:35',
    time_display: 'Hoy · 08:00 (CET)',
    duration_minutes: 35,
    type: 'standard',
    host: 'Alberto Calvo',
    host_name: 'Alberto Calvo',
    host_avatar: DEMO_ADMIN_USER.avatar_url,
    weekly_theme: 'El Presente',
    prompt: '¿Qué está ocupando demasiado espacio en tu cabeza?',
    zoom_meeting_url: 'https://zoom.us/j/94523812049',
    zoom_host_url: 'https://zoom.us/s/94523812049',
    meeting_url: 'https://zoom.us/j/94523812049',
    recording_status: 'NOT_AVAILABLE',
    status: 'SCHEDULED',
    attendees_count: 38,
    user_is_registered: false,
  },
  {
    id: 'evt-tomorrow-morning',
    title: 'Sesión diaria — La honestidad ante el dolor',
    description: 'Espacio guiado para entrar al Movimiento 3: sentir sin juzgar. Cómo nombrar lo que duele delante de Dios con sobriedad y verdad.',
    date: new Date(Date.now() + 28 * 3600000).toISOString(),
    start_time: '08:00',
    end_time: '08:35',
    time_display: 'Mañana · 08:00 (CET)',
    duration_minutes: 35,
    type: 'standard',
    host: 'Alberto Calvo',
    host_name: 'Alberto Calvo',
    host_avatar: DEMO_ADMIN_USER.avatar_url,
    weekly_theme: 'El Presente',
    prompt: '¿Qué herida o molestia estás ignorando para evitar el conflicto interior?',
    zoom_meeting_url: 'https://zoom.us/j/98124098231',
    zoom_host_url: 'https://zoom.us/s/98124098231',
    meeting_url: 'https://zoom.us/j/98124098231',
    recording_status: 'NOT_AVAILABLE',
    status: 'SCHEDULED',
    attendees_count: 29,
    user_is_registered: false,
  },
  {
    id: 'evt-coaching-monday',
    title: 'Mentoría y Coaching Grupal: Obstáculos y Autoboicot',
    description: 'Sesión en vivo de 60 minutos con preguntas abiertas, análisis de casos y estrategias prácticas para superar el estancamiento.',
    date: new Date(Date.now() + 72 * 3600000).toISOString(),
    start_time: '19:30',
    end_time: '20:30',
    time_display: 'Lunes · 19:30 (CET)',
    duration_minutes: 60,
    type: 'coaching',
    host: 'Alberto Calvo',
    host_name: 'Alberto Calvo',
    host_avatar: DEMO_ADMIN_USER.avatar_url,
    weekly_theme: 'Los Obstáculos',
    prompt: '¿En qué área de tu vida dices querer avanzar pero sigues tomando decisiones de retroceso?',
    zoom_meeting_url: 'https://zoom.us/j/91283746502',
    zoom_host_url: 'https://zoom.us/s/91283746502',
    meeting_url: 'https://zoom.us/j/91283746502',
    recording_status: 'NOT_AVAILABLE',
    status: 'SCHEDULED',
    attendees_count: 54,
    user_is_registered: true,
  },
  {
    id: 'evt-past-1',
    title: 'Sesión diaria — La oración en silencio',
    description: 'Guía práctica para sostener 90 segundos de escucha espiritual sin forzar respuestas mentales automáticas.',
    date: new Date(Date.now() - 24 * 3600000).toISOString(),
    start_time: '07:00',
    end_time: '07:35',
    time_display: 'Ayer · 07:00 AM (CET)',
    duration_minutes: 35,
    type: 'standard',
    host: 'Alberto Calvo',
    host_name: 'Alberto Calvo',
    host_avatar: DEMO_ADMIN_USER.avatar_url,
    weekly_theme: 'El Presente',
    prompt: '¿Qué voz interna necesitas callar para poder escuchar la verdad?',
    zoom_meeting_url: 'https://zoom.us/j/90812345678',
    recording_status: 'AVAILABLE',
    recording_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    recording_storage_path: 'session-recordings/evt-past-1/recording.mp4',
    status: 'COMPLETED',
    attendees_count: 42,
    user_is_registered: true,
  }
];

export const DEMO_POSTS: Post[] = [
  {
    id: 'post-demo-1',
    channel_id: 'ch-general',
    author_id: DEMO_ADMIN_USER.id,
    author: DEMO_ADMIN_USER,
    title: 'Bienvenidos a la nueva temporada de TRAVESÍA: Nuestro pacto de fraternidad',
    content: `Hermanos, bienvenidos a este espacio sagrado.

Quiero recordarles cuál es el espíritu que sostiene a TRAVESÍA: aquí no venimos a posar, ni a mostrarnos exitosos, ni a inflar nuestros currículums. Venimos a quitarnos las armaduras pesadas que cargamos afuera.

Cuando entres en este foro:
1. Sé honesto sobre tus caídas tanto como sobre tus victorias.
2. Si un compañero comparte una herida en el canal de diario, respóndele con aliento, discernimiento y oración, nunca con condescendencia.
3. La práctica diaria es el motor de todo lo demás. Si no estás escribiendo por las mañanas, este foro será solo ruido adicional.

Que Dios nos dé la gracia de ser sobrios, valientes y diligentes esta semana.`,
    created_at: '2026-09-25T08:00:00Z',
    is_pinned: true,
    is_featured: true,
    likes_count: 34,
    comments_count: 18,
    user_has_liked: true,
    user_has_bookmarked: true,
    tags: ['Comunidad', 'Fundamentos', 'Avisos'],
  }
];

export const DEMO_COMMENTS: Comment[] = [
  {
    id: 'comm-demo-1',
    post_id: 'post-demo-1',
    author_id: DEMO_CURRENT_USER.id,
    author: DEMO_CURRENT_USER,
    content: 'Agradecido de pertenecer a este círculo. Hacía años que buscaba una comunidad que no fuera un circo de apariencias.',
    created_at: '2026-09-25T09:12:00Z',
    likes_count: 7,
    user_has_liked: false,
  }
];
