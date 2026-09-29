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
} from '../types';

export const CHANNELS_DATA: Channel[] = [
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

export const CURRENT_USER: Profile = {
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
  reflection_minutes: 702, // 11h 42m
  current_week: 2,
  onboarding_completed: true,
};

export const ADMIN_USER: Profile = {
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

// 50 Sample Spanish members
const FIRST_NAMES = [
  'Carlos', 'Andrés', 'Javier', 'Santiago', 'Gabriel', 'Alejandro', 'Diego', 'Rodrigo', 'Fernando', 'Tomás',
  'Elena', 'Sofía', 'Lucía', 'Valeria', 'Camila', 'Mariana', 'Beatriz', 'Inés', 'Carmen', 'Raquel',
  'Ignacio', 'Álvaro', 'Pablo', 'Manuel', 'Guillermo', 'Nicolás', 'Felipe', 'Joaquín', 'Hugo', 'Emilio',
  'Paula', 'Natalia', 'Clara', 'Daniela', 'Victoria', 'Sara', 'Laura', 'Teresa', 'Patricia', 'Andrea',
  'Marcos', 'Lucas', 'Sebastián', 'Gonzalo', 'Enrique', 'Biel', 'Bruno', 'Adrián', 'Esteban', 'Jaime'
];

const LAST_NAMES = [
  'García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín',
  'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Muñoz', 'Álvarez', 'Romero', 'Alonso', 'Gutiérrez',
  'Navarro', 'Torres', 'Domínguez', 'Vázquez', 'Ramos', 'Gil', 'Ramírez', 'Serrano', 'Blanco', 'Molina',
  'Morales', 'Suárez', 'Ortega', 'Delgado', 'Castro', 'Ortiz', 'Rubio', 'Marín', 'Sanz', 'Núñez',
  'Iglesias', 'Medina', 'Garrido', 'Cortés', 'Castillo', 'Santos', 'Lozano', 'Guerrero', 'Cano', 'Prieto'
];

const CITIES = [
  'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Bilbao', 'Bogotá', 'Medellín', 'Ciudad de México',
  'Santiago de Chile', 'Buenos Aires', 'Lima', 'Montevideo', 'San José', 'Guatemala', 'Quito', 'Salamanca', 'Granada', 'Toledo'
];

const BIOS = [
  'Emprendedor aprendiendo a soltar la obsesión por el control y buscando la paz de Dios.',
  'Padre de 3 hijos. El diario matutino me ha devuelto la claridad mental que creía perdida.',
  'Médico especialista. Necesitaba un espacio de quietud para no quemarme en el hospital.',
  'Ingeniero de software enfocado en forjar hábitos firmes y una mente sobria.',
  'Profesor de secundaria. Buscando ser un testimonio de paciencia y autenticidad para mis alumnos.',
  'Empresario en transición de carrera hacia proyectos de mayor impacto social y espiritual.',
  'En mi tercera semana de la Travesía. Asombrado de cómo 30 minutos de silencio cambian todo el día.'
];

export const MEMBERS_DATA: Profile[] = [
  ADMIN_USER,
  CURRENT_USER,
  ...FIRST_NAMES.slice(0, 48).map((fn, idx) => {
    const ln = LAST_NAMES[idx % LAST_NAMES.length];
    const city = CITIES[idx % CITIES.length];
    const bio = BIOS[idx % BIOS.length];
    return {
      id: `usr-member-${idx + 1}`,
      name: `${fn} ${ln}`,
      avatar_url: `https://images.unsplash.com/photo-${1500000000000 + (idx * 314159) % 100000000}?w=150&auto=format&fit=crop&q=80`,
      bio,
      location: `${city}`,
      role: idx === 0 ? 'coach' : 'member',
      focus_areas: ['Disciplina', 'Espiritualidad', 'Relaciones'].slice(0, (idx % 3) + 1),
      created_at: new Date(Date.now() - (idx + 10) * 86400000 * 2).toISOString(),
      streak_days: (idx * 3) % 29 + 1,
      completed_sessions_count: (idx * 5) % 60 + 5,
      reflection_minutes: ((idx * 5) % 60 + 5) * 30,
      current_week: ((idx % 4) + 1),
      onboarding_completed: true,
    } as Profile;
  })
];

// Events: Daily Live Sessions & Coaching
export const EVENTS_DATA: EventItem[] = [
  {
    id: 'evt-today-morning',
    title: 'Sesión diaria de journaling — Enfoque: Bajar el ruido',
    date: new Date(Date.now() + 4 * 3600000).toISOString(), // in 4 hours
    time_display: 'Hoy · 07:00 AM (CET)',
    duration_minutes: 35,
    type: 'standard',
    host_name: 'Alberto Calvo',
    host_avatar: ADMIN_USER.avatar_url,
    description: '35 minutos guiados: 5 minutos de respiración y quietud, 12 minutos de escritura profunda, ejercicio de discernimiento de emociones y un compromiso concreto para la jornada.',
    meeting_url: 'https://meet.google.com/travesia-diaria',
    status: 'upcoming',
    attendees_count: 38,
    user_is_registered: true,
  },
  {
    id: 'evt-tomorrow-morning',
    title: 'Sesión diaria de journaling — Enfoque: La honestidad ante el dolor',
    date: new Date(Date.now() + 28 * 3600000).toISOString(),
    time_display: 'Mañana · 07:00 AM (CET)',
    duration_minutes: 35,
    type: 'standard',
    host_name: 'Alberto Calvo',
    host_avatar: ADMIN_USER.avatar_url,
    description: 'Espacio guiado para entrar al Movimiento 3: sentir sin juzgar. Cómo nombrar lo que duele delante del Señor.',
    meeting_url: 'https://meet.google.com/travesia-diaria',
    status: 'upcoming',
    attendees_count: 29,
    user_is_registered: false,
  },
  {
    id: 'evt-coaching-monday',
    title: 'Mentoría y Coaching Grupal de Lunes: Obstáculos y Autoboicot',
    date: new Date(Date.now() + 72 * 3600000).toISOString(),
    time_display: 'Lunes · 19:30 (CET)',
    duration_minutes: 60,
    type: 'coaching',
    host_name: 'Alberto Calvo & Coach Carlos',
    host_avatar: ADMIN_USER.avatar_url,
    description: 'Sesión en vivo de 60 minutos con preguntas abiertas, análisis de casos y estrategias prácticas para superar el estancamiento.',
    meeting_url: 'https://meet.google.com/travesia-mentoria',
    status: 'upcoming',
    attendees_count: 54,
    user_is_registered: true,
  },
  {
    id: 'evt-past-1',
    title: 'Sesión diaria de journaling — La oración en silencio',
    date: new Date(Date.now() - 24 * 3600000).toISOString(),
    time_display: 'Ayer · 07:00 AM (CET)',
    duration_minutes: 35,
    type: 'standard',
    host_name: 'Alberto Calvo',
    host_avatar: ADMIN_USER.avatar_url,
    description: 'Guía práctica para sostener 90 segundos de escucha espiritual sin forzar respuestas mentales automáticas.',
    recording_url: 'https://archive.travesia.club/sesion-20260927',
    status: 'finished',
    attendees_count: 42,
    user_is_registered: true,
  },
  {
    id: 'evt-past-2',
    title: 'Taller Especial: Cómo diseñar tu regla de vida personal',
    date: new Date(Date.now() - 72 * 3600000).toISOString(),
    time_display: 'Viernes pasado · 18:00 (CET)',
    duration_minutes: 50,
    type: 'coaching',
    host_name: 'Alberto Calvo',
    host_avatar: ADMIN_USER.avatar_url,
    description: 'Estructuración de límites familiares, tiempo con Dios y no negociables de salud.',
    recording_url: 'https://archive.travesia.club/taller-regla-de-vida',
    status: 'finished',
    attendees_count: 67,
    user_is_registered: true,
  }
];

// Courses / Curriculum (7 modules, 50 lessons)
export const MODULES_DATA = [
  { id: 'mod-1', title: '1. Empezar Aquí', description: 'Fundamentos de la práctica y acuerdos de honor', week: 1 },
  { id: 'mod-2', title: '2. El Presente', description: 'Aprender a parar, bajar el ritmo y habitar el ahora', week: 1 },
  { id: 'mod-3', title: '3. El Ruido', description: 'Desintoxicación de estímulos y rescate de la atención', week: 1 },
  { id: 'mod-4', title: '4. La Visión', description: 'Qué vida estás llamado a construir ante Dios', week: 2 },
  { id: 'mod-5', title: '5. Los Obstáculos', description: 'Desmontar el autoengaño, la evasión y el miedo', week: 3 },
  { id: 'mod-6', title: '6. El Trabajo', description: 'Disciplina, límites, conversaciones difíciles y ejecución', week: 4 },
  { id: 'mod-7', title: '7. Integración', description: 'Sostener la travesía en el tiempo sin desfallecer', week: 4 },
];

export const LESSONS_DATA: Lesson[] = [
  {
    id: 'les-1-1',
    module_id: 'mod-1',
    module_title: '1. Empezar Aquí',
    title: 'Bienvenido a la Travesía: La regla de la honestidad radical',
    duration_minutes: 12,
    status: 'completed',
    content_markdown: `### Bienvenido a tu casa digital de quietud y trabajo interior.

TRAVESÍA no es una plataforma de contenido pasivo. Si viniste a acumular información teórica sin ensuciarte las manos en la página en blanco, te sentirás frustrado.

Aquí practicamos una regla no negociable: **la honestidad radical ante Dios y ante uno mismo**.
No escribes para impresionar a un lector imaginario. Escribes para sacar la niebla de tu cabeza y colocarla frente a tus ojos.

> *"Frena el ruido. Encuentra dirección. Haz el trabajo."*

#### Los 3 pilares indispensables:
1. **La consistencia vence a la inspiración**: 30 minutos imperfectos todos los días valen más que dos horas de inspiración una vez al mes.
2. **No edites mientras escribes**: La mente crítica intentará corregirte. Permite que la verdad cruda salga primero.
3. **Todo termina en una acción o en una entrega**: La reflexión que no toca la tierra es mero entretenimiento intelectual.`,
    exercise_instruction: 'Dedica 5 minutos a escribir en tu cuaderno: ¿Por qué decidí entrar en Travesía hoy y qué precio estoy pagando si sigo viviendo con el mismo nivel de ruido?',
    reflection_question: '¿Qué resistencia inicial estás experimentando ante la idea de quedarte en silencio cada mañana?',
    order_index: 1,
  },
  {
    id: 'les-1-2',
    module_id: 'mod-1',
    module_title: '1. Empezar Aquí',
    title: 'Los Cinco Movimientos del Diario TRAVESÍA',
    duration_minutes: 18,
    status: 'completed',
    content_markdown: `### La anatomía de la sesión diaria

Cada mañana seguirás un itinerario probado de 5 movimientos:

1. **Frenar (Slow Down)**: Salir del modo reactivo del teléfono y regular el sistema nervioso con respiración profunda (4s inhalar, 8s exhalar) y un minuto de silencio santo.
2. **Limpiar el Ruido (Clear the Noise)**: Vaciado cerebral acelerado de 1 minuto + 10 minutos de escritura continua ininterrumpida + pregunta de enfoque del día.
3. **Sentir lo que sientes (Feel)**: Nombramiento quirúrgico de emociones (Dolor, Soledad, Tristeza, Ira, Miedo, Vergüenza, Culpa, Alegría). Sin juzgarlas.
4. **Escuchar (Listen)**: 90 segundos de escucha interior ante Dios: *¿Qué me estás mostrando hoy, Señor?*
5. **Actuar (Act)**: Un compromiso ineludible o una renuncia consciente para las próximas 24 horas.`,
    exercise_instruction: 'Configura una alarma 40 minutos antes de tu hora habitual para que tu sesión de diario ocurra antes de revisar WhatsApp o correos.',
    reflection_question: '¿Cuál de los cinco movimientos intuyes que te costará más abrazar?',
    order_index: 2,
  },
  {
    id: 'les-2-1',
    module_id: 'mod-2',
    module_title: '2. El Presente',
    title: 'El mito de la falta de tiempo vs. el secuestro de la atención',
    duration_minutes: 15,
    status: 'completed',
    content_markdown: `Nadie carece de 30 minutos al día. Lo que carecemos es de soberanía sobre nuestra atención.

Cuando abres el teléfono nada más despertar, entregas las llaves de tu estado de ánimo a extraños, noticias alarmistas y urgencias ajenas. Entras al día en modo presa, huyendo de fuegos.

El diario es tu trinchera. Es el único momento del día donde tú no reaccionas al mundo, sino que compareces ante el Creador con el corazón en la mano.`,
    exercise_instruction: 'Calcula tu tiempo de pantalla promedio de la última semana y anótalo sin juzgarte.',
    reflection_question: '¿A cambio de qué entretenimiento efímero estás vendiendo tu serenidad matutina?',
    order_index: 3,
  },
  {
    id: 'les-2-2',
    module_id: 'mod-2',
    module_title: '2. El Presente',
    title: 'Aprender a habitar el cuerpo: Tensión, postura y respiración',
    duration_minutes: 14,
    status: 'in_progress',
    content_markdown: `La desconexión espiritual suele empezar como una desconexión corporal. Vivimos como cerebros andantes con dolor de cuello y mandíbula apretada.

La exhalación prolongada (el doble del tiempo de la inhalación) activa inmediatamente el nervio vago y le comunica al sistema nervioso que no hay ningún león persiguiéndote en esta habitación.`,
    exercise_instruction: 'Haz 3 ciclos de 4s inhalar / 8s exhalar antes de continuar la lectura.',
    reflection_question: '¿Qué parte de tu cuerpo te está advirtiendo hoy que vas demasiado rápido?',
    order_index: 4,
  },
  {
    id: 'les-3-1',
    module_id: 'mod-3',
    module_title: '3. El Ruido',
    title: 'Identificar tus tres mayores amplificadores de distracción',
    duration_minutes: 20,
    status: 'available',
    content_markdown: `El ruido no es solo sonoro: es visual, relacional y mental. Hay personas ruidosas que llenan tu cabeza de veneno sin aportar una sola solución; hay notificaciones superfluas que fragmentan tu capacidad de pensar en profundidad.`,
    exercise_instruction: 'Desactiva todas las notificaciones push en tu móvil excepto llamadas de emergencia de familiares.',
    reflection_question: '¿A qué persona o medio de comunicación necesitas ponerle sordina esta semana?',
    order_index: 5,
  },
  {
    id: 'les-4-1',
    module_id: 'mod-4',
    module_title: '4. La Visión',
    title: 'Definir tu norte: El hombre que quieres ser ante Dios y tu familia',
    duration_minutes: 22,
    status: 'available',
    content_markdown: `Una vida sin visión clara es vulnerable a cualquier viento cultural. En esta lección delinearemos las 5 áreas maestras: carácter espiritual, relaciones íntimas, vocación/trabajo, salud corporal y servicio generoso.`,
    exercise_instruction: 'Escribe en 5 líneas cómo quieres que tus hijos o seres más cercanos te describan cuando ya no estés.',
    reflection_question: '¿Tus acciones de las últimas dos semanas concuerdan con esa descripción?',
    order_index: 6,
  },
  {
    id: 'les-5-1',
    module_id: 'mod-5',
    module_title: '5. Los Obstáculos',
    title: 'Nombrar las trampas del ego: Evasión, justificación y victimismo',
    duration_minutes: 18,
    status: 'locked',
    content_markdown: `El obstáculo más grande rara vez está afuera en la economía o en tu jefe. El obstáculo es el diálogo interno que te convence de que tú eres una excepción a las leyes de la siembra y la cosecha.`,
    exercise_instruction: 'Enumera las 3 excusas que más repites cuando dejas una tarea difícil sin terminar.',
    reflection_question: '¿Qué beneficio oculto obtienes al mantenerte en el papel de víctima?',
    order_index: 7,
  },
  {
    id: 'les-6-1',
    module_id: 'mod-6',
    module_title: '6. El Trabajo',
    title: 'El arte de la conversación difícil y el límite sagrado',
    duration_minutes: 25,
    status: 'locked',
    content_markdown: `La paz verdadera no es la ausencia de conflicto, sino la presencia de la justicia y la verdad. Aprenderás a decir "no" con serenidad y a tener las charlas que has evitado por meses.`,
    exercise_instruction: 'Redacta el borrador del mensaje para esa conversación que vienes posponiendo.',
    reflection_question: '¿Cuánto te está costando mantener una paz artificial?',
    order_index: 8,
  }
];

// 20 Books in Library
export const BOOKS_DATA: Book[] = [
  {
    id: 'bk-1',
    title: 'El Silencio en la Era del Ruido',
    author: 'Erling Kagge',
    category: 'Mentalidad',
    summary: 'Una profunda exploración de cómo el silencio exterior e interior es la clave para reconectar con el asombro y la cordura en un mundo hiperconectado.',
    key_takeaways: [
      'El silencio no es la ausencia de sonido, sino la presencia de uno mismo.',
      'Cerrar la puerta a las interrupciones es el mayor acto de autodeterminación moderno.',
      'En la quietud encontramos respuestas que el ruido jamás podrá darnos.'
    ],
    cover_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80',
    order_index: 1,
  },
  {
    id: 'bk-2',
    title: 'Hábitos Atómicos',
    author: 'James Clear',
    category: 'Hábitos',
    summary: 'Guía práctica y definitiva sobre cómo las mejoras marginales del 1% diario transforman radicalmente la trayectoria del carácter y los resultados.',
    key_takeaways: [
      'No te elevas al nivel de tus metas; caes al nivel de tus sistemas.',
      'El cambio de hábitos duradero es un cambio de identidad, no de resultados.',
      'Hazlo obvio, hazlo atractivo, hazlo sencillo y hazlo satisfactorio.'
    ],
    cover_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&auto=format&fit=crop&q=80',
    order_index: 2,
  },
  {
    id: 'bk-3',
    title: 'Práctica de la Presencia de Dios',
    author: 'Hermano Lorenzo',
    category: 'Espiritualidad',
    summary: 'Cartas y conversaciones de un monje del siglo XVII que convirtió la rutina en la cocina del convento en un santuario constante de comunión divina.',
    key_takeaways: [
      'Dios está tan presente en el fregar de los platos como en el altar más solemne.',
      'El corazón puede conversar con el Creador en cualquier segundo de la faena.',
      'La simplicidad de intención elimina la ansiedad espiritual.'
    ],
    cover_url: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=300&auto=format&fit=crop&q=80',
    order_index: 3,
  },
  {
    id: 'bk-4',
    title: 'Trabajo Enfocado (Deep Work)',
    author: 'Cal Newport',
    category: 'Disciplina',
    summary: 'Reglas para el éxito concentrado en un mundo saturado de distracciones y tareas superficiales que diluyen el ingenio humano.',
    key_takeaways: [
      'La habilidad de realizar trabajo profundo es cada vez más escasa y valiosa.',
      'La multitarea es una ilusión neurológica que fragmenta la memoria de trabajo.',
      'Estructurar rituales rígidos de aislamiento protege los proyectos que de verdad importan.'
    ],
    cover_url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=300&auto=format&fit=crop&q=80',
    order_index: 4,
  },
  {
    id: 'bk-5',
    title: 'El Hombre en Busca de Sentido',
    author: 'Viktor Frankl',
    category: 'Propósito',
    summary: 'La inmortal lección de psiquiatría y dignidad humana surgida en los campos de concentración: al hombre se le puede arrebatar todo excepto la última libertad, su actitud.',
    key_takeaways: [
      'Quien tiene un porqué para vivir puede soportar casi cualquier cómo.',
      'El sufrimiento deja de ser sufrimiento en el instante en que encuentra un sentido.',
      'Nuestra responsabilidad última es dar una respuesta digna a la vida.'
    ],
    cover_url: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=300&auto=format&fit=crop&q=80',
    order_index: 5,
  },
  {
    id: 'bk-6',
    title: 'Meditationes',
    author: 'Marco Aurelio',
    category: 'Mentalidad',
    summary: 'El diario privado del emperador romano recordándose cada amanecer la sobriedad, la transitoriedad de la vanagloria y el deber hacia los semejantes.',
    key_takeaways: [
      'Tienes poder sobre tu mente, no sobre los acontecimientos exteriores; comprende esto y hallarás fuerza.',
      'No pierdas más tiempo discutiendo lo que debe ser un hombre bueno; sé uno.',
      'La mañana debe iniciar recordando que encontrarás personas ingratas, pero tu deber es la nobleza.'
    ],
    cover_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&auto=format&fit=crop&q=80',
    order_index: 6,
  },
  {
    id: 'bk-7',
    title: 'Liderazgo Espiritual',
    author: 'J. Oswald Sanders',
    category: 'Liderazgo',
    summary: 'Principios bíblicos indispensables sobre la autoridad moral, el costo del servicio sacrificial y la humildad en la conducción de vidas.',
    key_takeaways: [
      'El verdadero liderazgo espiritual no se mide por seguidores, sino por cuántos son conducidos a Dios.',
      'El líder debe estar dispuesto a soportar la soledad de la cumbre sin amargura.',
      'El autodominio es el primer prerrequisito de la influencia duradera.'
    ],
    cover_url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&auto=format&fit=crop&q=80',
    order_index: 7,
  },
  {
    id: 'bk-8',
    title: 'Los 5 Lenguajes del Amor',
    author: 'Gary Chapman',
    category: 'Relaciones',
    summary: 'Cómo entender y comunicarse en la lengua afectiva que el cónyuge o los hijos realmente perciben y valoran para edificar vínculos irrompibles.',
    key_takeaways: [
      'Amar es una decisión diaria que a menudo exige aprender un idioma emocional que no nos es natural.',
      'El tanque emocional vacío es la causa número uno de los conflictos matrimoniales.',
      'Palabras de afirmación, tiempo de calidad, regalos, actos de servicio y contacto físico.'
    ],
    cover_url: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=300&auto=format&fit=crop&q=80',
    order_index: 8,
  }
];

// 8 Session Recordings (Archive Replay Library)
export const RECORDINGS_DATA: SessionRecording[] = [
  {
    id: 'rec-1',
    event_id: 'evt-past-1',
    title: 'Sesión diaria — El ruido y la quietud matutina',
    date: '2026-09-27',
    duration: '35 min',
    duration_seconds: 2100,
    file_size_bytes: 345000000,
    category: 'El Presente',
    description: 'Movimiento por movimiento: desglosamos cómo nombrar el ruido mental en la página para que pierda su poder de distracción.',
    thumbnail_url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop&q=80',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    storage_path: 'session-recordings/evt-past-1/recording.mp4',
    status: 'AVAILABLE',
    recording_strategy: 'HOSTED',
    uploaded_by: 'usr-admin-alberto',
    uploaded_at: '2026-09-27T08:00:00Z',
    views_count: 89,
    is_member_only: true,
  },
  {
    id: 'rec-2',
    event_id: 'evt-past-vision',
    title: 'Mentoría Especial: Diseñar tu Visión a 3 Años con Criterio Sobrio',
    date: '2026-09-24',
    duration: '52 min',
    duration_seconds: 3120,
    file_size_bytes: 512000000,
    category: 'La Visión',
    description: 'Alberto Calvo explica el ejercicio del "martes normal" y cómo evitar los castillos en el aire en la planificación personal.',
    thumbnail_url: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&auto=format&fit=crop&q=80',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    storage_path: 'session-recordings/evt-past-vision/recording.mp4',
    status: 'AVAILABLE',
    recording_strategy: 'HOSTED',
    uploaded_by: 'usr-admin-alberto',
    uploaded_at: '2026-09-24T20:30:00Z',
    views_count: 142,
    is_member_only: true,
  },
  {
    id: 'rec-3',
    event_id: 'evt-past-espiritualidad',
    title: 'Desmontando la Culpa: La diferencia entre remordimiento y arrepentimiento',
    date: '2026-09-20',
    duration: '36 min',
    duration_seconds: 2160,
    file_size_bytes: 350000000,
    category: 'Espiritualidad',
    description: 'El remordimiento te encierra en la vergüenza; el arrepentimiento bíblico te levanta y te impulsa a enmendar el camino con acción.',
    thumbnail_url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&auto=format&fit=crop&q=80',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    storage_path: 'session-recordings/evt-past-espiritualidad/recording.mp4',
    status: 'AVAILABLE',
    recording_strategy: 'HOSTED',
    uploaded_by: 'usr-admin-alberto',
    uploaded_at: '2026-09-20T08:00:00Z',
    views_count: 110,
    is_member_only: true,
  },
  {
    id: 'rec-4',
    event_id: 'evt-past-relaciones',
    title: 'Conversaciones Incómodas: Cómo hablar con tu cónyuge sin herir',
    date: '2026-09-17',
    duration: '48 min',
    duration_seconds: 2880,
    file_size_bytes: 470000000,
    category: 'Relaciones',
    description: 'Marco práctico para plantear límites necesarios sin caer en reproches históricos que destruyen el diálogo.',
    thumbnail_url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&auto=format&fit=crop&q=80',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    storage_path: 'session-recordings/evt-past-relaciones/recording.mp4',
    status: 'AVAILABLE',
    recording_strategy: 'HOSTED',
    uploaded_by: 'usr-admin-alberto',
    uploaded_at: '2026-09-17T20:30:00Z',
    views_count: 175,
    is_member_only: true,
  },
  {
    id: 'rec-5',
    event_id: 'evt-past-obstaculos',
    title: 'La Trampa de la Aprobación: Por qué intentas complacer a todos',
    date: '2026-09-13',
    duration: '41 min',
    duration_seconds: 2460,
    file_size_bytes: 400000000,
    category: 'Los Obstáculos',
    description: 'Análisis del miedo al rechazo como raíz de la sobrecarga de compromisos estériles en la agenda del hombre.',
    thumbnail_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    storage_path: 'session-recordings/evt-past-obstaculos/recording.mp4',
    status: 'AVAILABLE',
    recording_strategy: 'HOSTED',
    uploaded_by: 'usr-admin-alberto',
    uploaded_at: '2026-09-13T08:00:00Z',
    views_count: 133,
    is_member_only: true,
  },
  {
    id: 'rec-6',
    event_id: 'evt-past-trabajo',
    title: 'Forjar Hábitos en Temporadas de Tormenta: Cuando todo falla',
    date: '2026-09-10',
    duration: '38 min',
    duration_seconds: 2280,
    file_size_bytes: 380000000,
    category: 'El Trabajo',
    description: 'Cómo sostener la práctica de los 5 movimientos incluso cuando estás de viaje, con hijos enfermos o bajo estrés laboral agudo.',
    thumbnail_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    storage_path: 'session-recordings/evt-past-trabajo/recording.mp4',
    status: 'AVAILABLE',
    recording_strategy: 'HOSTED',
    uploaded_by: 'usr-admin-alberto',
    uploaded_at: '2026-09-10T08:00:00Z',
    views_count: 98,
    is_member_only: true,
  },
  {
    id: 'rec-7',
    event_id: 'evt-past-proposito',
    title: 'Discernir la Vocación: El cruce entre necesidad, don y llamado',
    date: '2026-09-06',
    duration: '45 min',
    duration_seconds: 2700,
    file_size_bytes: 440000000,
    category: 'Propósito',
    description: 'Una sesión profunda para desentrañar lo que realmente importa frente a las demandas y expectativas ajenas.',
    thumbnail_url: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=600&auto=format&fit=crop&q=80',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    storage_path: 'session-recordings/evt-past-proposito/recording.mp4',
    status: 'AVAILABLE',
    recording_strategy: 'HOSTED',
    uploaded_by: 'usr-admin-alberto',
    uploaded_at: '2026-09-06T08:00:00Z',
    views_count: 164,
    is_member_only: true,
  }
];

// Sample Community Posts
export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    channel_id: 'ch-general',
    author_id: ADMIN_USER.id,
    author: ADMIN_USER,
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
  },
  {
    id: 'post-2',
    channel_id: 'ch-journal',
    author_id: CURRENT_USER.id,
    author: CURRENT_USER,
    title: 'Día 7 completado: El momento en que la ira se desnudó en la página',
    content: `Hoy en el Movimiento 3 seleccioné **IRA** y **MIEDO**.
Llevaba dos semanas con una tensión terrible en la mandíbula y pensando que era simplemente estrés de trabajo con la constructora.

Al responder la pregunta: *"¿Qué sientes que ha sido injusto?"*, me di cuenta de que no era el cliente. Era el resentimiento acumulado contra mi socio por no asumir su parte del compromiso financiero hace tres meses. Lo había estado tapando para "mantener la paz".

En el Movimiento 4, en el silencio, sentí con claridad: *"No estás manteniendo la paz, estás alimentando la cobardía."*

Mi compromiso de hoy: **Tener la conversación cara a cara a las 16:00 y hablar con claridad sin perder el amor.** Deseenme firmeza.`,
    created_at: '2026-09-28T07:45:00Z',
    likes_count: 22,
    comments_count: 8,
    user_has_liked: false,
    user_has_bookmarked: false,
    tags: ['PrácticaDiaria', 'Honestidad', 'Acción'],
  },
  {
    id: 'post-3',
    channel_id: 'ch-noise',
    author_id: 'usr-member-1',
    author: MEMBERS_DATA[2],
    title: 'Apagué el móvil a las 21:00 durante 5 días seguidos: Esto fue lo que pasó',
    content: `Tenía el vicio de acostarme scrolleando Twitter o YouTube hasta medianoche. Me despertaba aturdido y sin ganas de vivir.
Decidí comprar un despertador analógico de 10 euros y dejar el teléfono cargando en la cocina a las 21:00 en punto.

Las primeras dos noches sentí una abstinencia ridícula: me picaban los dedos por mirar si había entrado un mensaje. Pero anoche dormí 8 horas profundas por primera vez en meses. Esta mañana el ejercicio de respiración del Movimiento 1 no fue una lucha contra la taquicardia; fue un verdadero oasis. Recomiendo este experimento a cualquiera que sienta la mente deshilachada.`,
    created_at: '2026-09-27T14:20:00Z',
    likes_count: 19,
    comments_count: 5,
    user_has_liked: true,
    user_has_bookmarked: false,
    tags: ['Hábitos', 'ElRuido', 'Descanso'],
  }
];

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'comm-1',
    post_id: 'post-2',
    author_id: ADMIN_USER.id,
    author: ADMIN_USER,
    content: 'Brutal discernimiento, Mateo. Esa frase: "No estás manteniendo la paz, estás alimentando la cobardía" es exactamente la voz de la verdad que desenmascara la falsa diplomacia. Ora antes de entrar a esa reunión. Recuerda: manso con la persona, implacable con el problema.',
    created_at: '2026-09-28T08:10:00Z',
    likes_count: 11,
    user_has_liked: true,
  },
  {
    id: 'comm-2',
    post_id: 'post-2',
    author_id: 'usr-member-2',
    author: MEMBERS_DATA[3],
    content: 'Hermano, me veo totalmente reflejado en tu experiencia. Pasé por lo mismo el año pasado. El diario te salva de explotar 6 meses tarde con veneno. Estaremos orando por esa conversación de las 16:00.',
    created_at: '2026-09-28T08:35:00Z',
    likes_count: 6,
    user_has_liked: false,
  },
  {
    id: 'comm-3',
    post_id: 'post-1',
    author_id: CURRENT_USER.id,
    author: CURRENT_USER,
    content: 'Agradecido de pertenecer a este círculo. Hacía años que buscaba una comunidad que no fuera un circo de apariencias.',
    created_at: '2026-09-25T09:12:00Z',
    likes_count: 7,
    user_has_liked: false,
  }
];

// Sample Completed Journal Session for Current User (Private)
export const SAMPLE_USER_JOURNAL_SESSIONS: JournalSession[] = [
  {
    id: 'js-today',
    user_id: CURRENT_USER.id,
    date: new Date().toISOString().split('T')[0],
    created_at: new Date(Date.now() - 3600000).toISOString(),
    breathing_completed: true,
    silence_duration_seconds: 60,
    free_writing_1m: 'Mucha fatiga acumulada en la nuca. Pensando en el pago a proveedores y la conversación con Luis. Todo parece agolparse a primera hora.',
    deep_writing_10m: 'He notado que cuando no tengo el control del calendario me vuelvo irritable con los niños. Ayer le hablé con aspereza a Marcos solo porque derramó el vaso de leche. La verdad es que el vaso de leche no importaba nada: importaba que yo venía con el corazón cargado de miedo por los plazos de entrega. No quiero ser el padre que descarga su debilidad en sus hijos.',
    focus_prompt_id: 'prompt-o-6',
    focus_prompt_text: '¿Qué conversación difícil estás evitando porque temes el rechazo o el conflicto?',
    focus_prompt_answer: 'La charla con Luis sobre la sociedad. Llevo 3 meses acumulando reproches silenciosos.',
    emotions: [
      {
        category: 'IRA',
        related_to: 'La falta de compromiso financiero de mi socio Luis con la constructora.'
      },
      {
        category: 'MIEDO',
        related_to: 'Temor a que la empresa quiebre o que perdamos la amistad de 15 años.'
      }
    ],
    listening_notes: 'En el silencio de 90 segundos vino una convicción rotunda: La verdad dicha con gracia salva más amistades que el silencio diplomático. Dios no me llamó a ser cobarde.',
    listening_duration_seconds: 90,
    action_type: 'action',
    action_commitment: 'Reunirme con Luis a las 16:00 y poner las cuentas sobre la mesa sin gritos ni evasivas.',
    total_duration_minutes: 32,
    status: 'completed'
  },
  {
    id: 'js-yesterday',
    user_id: CURRENT_USER.id,
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 86400000).toISOString(),
    breathing_completed: true,
    silence_duration_seconds: 60,
    free_writing_1m: 'Domingo por la tarde tranquilo pero con esa pesadez en el pecho del lunes por venir.',
    deep_writing_10m: 'Agradecido por el tiempo de paseo con mi esposa. Nos reímos como hacía tiempo. Necesito proteger estos espacios en mi agenda con cerrojo.',
    focus_prompt_id: 'prompt-p-9',
    focus_prompt_text: '¿Qué estás sembrando hoy que dará fruto cuando ya no estés aquí?',
    focus_prompt_answer: 'La memoria de un hogar pacífico y seguro para mis tres hijos.',
    emotions: [
      {
        category: 'ALEGRÍA',
        related_to: 'La tarde de risas con Elena en el parque.'
      }
    ],
    listening_notes: 'Dios me recordaba: "Tu trabajo es importante, pero tu familia es tu primer ministerio."',
    listening_duration_seconds: 90,
    action_type: 'action',
    action_commitment: 'Apagar el ordenador a las 18:30 para cenar con la familia sin mirar el teléfono.',
    total_duration_minutes: 28,
    status: 'completed'
  }
];
