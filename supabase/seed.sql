-- ====================================================================
-- TRAVESÍA - Database Seed Data (PostgreSQL / Supabase)
-- Canonical Production Prompt Catalog, Channels, Modules & Books
-- ====================================================================

-- 1. CHANNELS (Auto-generated UUIDs, idempotent insertion)
INSERT INTO channels (slug, name, description, icon_name, order_index)
SELECT v.slug, v.name, v.description, v.icon_name, v.order_index
FROM (VALUES
  ('conversacion-principal', 'Conversación principal', 'Punto de encuentro de la comunidad TRAVESÍA. Reflexiones compartidas, preguntas y fraternidad.', 'flame', 1),
  ('sesiones-de-diario', 'Sesiones de diario', 'Espacio para compartir compromisos del día, descubrimientos tras la práctica y rendición de cuentas.', 'check-circle-2', 2),
  ('empezar-aqui', 'Empezar aquí', 'Bienvenida para nuevos miembros, orientación metodológica, acuerdos de honor y guía de inicio.', 'compass', 3),
  ('el-ruido', 'El Ruido', 'Estrategias y reflexiones sobre cómo desacelerar, silenciar estímulos y proteger la atención.', 'waves', 4),
  ('la-vision', 'La Visión', 'Descubrimiento de propósito, vocación, alineación con la voluntad divina y legado familiar.', 'eye', 5),
  ('los-obstaculos', 'Los Obstáculos', 'Identificación honesta de patrones de evasión, orgullo, miedos no resueltos y mentiras internas.', 'shield-alert', 6),
  ('el-trabajo', 'El Trabajo', 'La forja diaria: disciplina, conversaciones difíciles, sacrificios necesarios y compromisos cumplidos.', 'hammer', 7),
  ('biblioteca', 'Biblioteca', 'Recomendaciones de lecturas esenciales, desgloses de libros fundamentales y notas de estudio.', 'book-open', 8),
  ('archivo', 'Archivo', 'Grabaciones de todas las sesiones guiadas en directo, mentorías grupales y talleres de formación.', 'film', 9)
) AS v(slug, name, description, icon_name, order_index)
WHERE NOT EXISTS (
  SELECT 1 FROM channels c WHERE c.slug = v.slug
);

-- 2. EMOTIONS CATALOG (Reference Catalog)
INSERT INTO emotions (name, prompt_question, description) VALUES
  ('DOLOR', '¿Qué herida o situación te está doliendo en este momento?', 'Sensación de herida, pérdida o quebranto físico o emocional.'),
  ('SOLEDAD', '¿En qué aspecto de tu camino te sientes incomprendido o desacompañado?', 'Aislamiento, sensación de no tener con quién compartir la carga.'),
  ('TRISTEZA', '¿Qué pérdida, desilusión o anhelo no cumplido está detrás de esta pesadumbre?', 'Pesar del alma, duelo, melancolía por lo que fue o pudo ser.'),
  ('IRA', '¿Qué sientes que ha sido injusto, fuera de lugar o una falta de respeto?', 'Fuego ante la transgresión, frustración o impotencia.'),
  ('MIEDO', '¿A qué desenlace le temes hoy y qué pasaría en el peor de los casos?', 'Incertidumbre ante la amenaza, anticipación del fracaso o daño.'),
  ('VERGÜENZA', '¿Qué juicio propio o ajeno te hace querer esconderte o no dar la cara?', 'Sensación de insuficiencia, deseo de ocultarse, temor al juicio.'),
  ('CULPA', '¿Qué estándar propio o ajeno sientes que has traicionado o incumplido?', 'Peso por una acción u omisión propia que causó daño.'),
  ('ALEGRÍA', '¿Qué regalo, fruto o momento de gracia puedes celebrar y agradecer con gratitud hoy?', 'Gozo sincero, plenitud, celebración del bien presente.')
ON CONFLICT (name) DO NOTHING;

-- 3. FOUR WEEK CYCLES
INSERT INTO four_week_cycles (cycle_number, week_1_theme, week_2_theme, week_3_theme, week_4_theme)
SELECT 1, 'EL PRESENTE: Construir la práctica diaria', 'LA VISIÓN: Qué vida buscas construir', 'LOS OBSTÁCULOS: Qué se interpone en tu camino', 'EL TRABAJO: Lo que realmente requerirá de ti'
WHERE NOT EXISTS (
  SELECT 1 FROM four_week_cycles WHERE cycle_number = 1
);

-- 4. CANONICAL PROMPTS SAMPLE
INSERT INTO daily_prompts (prompt_text, category, week, difficulty, active)
SELECT v.prompt_text, v.category, v.week, v.difficulty, v.active
FROM (VALUES
  ('¿Qué pensamiento recurrente has estado repitiendo en bucle durante las últimas 48 horas sin darte cuenta?', 'Ruido', 1, 'suave', true),
  ('¿Qué distracción externa estás usando deliberadamente para no quedarte a solas con tus pensamientos?', 'Ruido', 1, 'profundo', true),
  ('¿Qué conversación inconclusa sigue consumiendo batería en el fondo de tu mente?', 'Ruido', 1, 'suave', true),
  ('¿Qué emoción estás intentando enterrar o fingir que no existe para no parecer débil?', 'Emociones', 1, 'profundo', true),
  ('¿Dónde se aloja la tensión en tu cuerpo hoy: garganta, hombros, pecho o estómago?', 'Emociones', 1, 'suave', true),
  ('Si dentro de tres años tu vida fuera verdaderamente fecunda y en paz, ¿cómo empezaría un martes normal?', 'Visión', 2, 'suave', true),
  ('¿Qué clase de padre, cónyuge, hermano o amigo quieres ser recordado como dentro de 20 años?', 'Visión', 2, 'profundo', true),
  ('¿Cuál es la excusa más inteligente que te cuentas para justificar no avanzar?', 'Obstáculos', 3, 'desafiante', true),
  ('¿Qué herida o experiencia del pasado sigues utilizando como coartada en el presente?', 'Obstáculos', 3, 'desafiante', true),
  ('¿Cuál es la acción más pequeña, concreta e inmediata que puedes ejecutar en los próximos 60 minutos?', 'Acción', 4, 'suave', true),
  ('¿A quién le debes una disculpa sincera sin justificaciones ni excusas?', 'Relaciones', 2, 'desafiante', true),
  ('¿En qué actividad pierdes la noción del tiempo y sientes que estás sirviendo a algo mayor?', 'Propósito', 2, 'suave', true),
  ('Señor, ¿qué verdad sobre mi vida he estado intentando ocultarte a Ti y a mí mismo?', 'Espiritualidad', 1, 'profundo', true),
  ('¿En qué área de tu vida estás tratando de tener el control absoluto en vez de confiar en Dios?', 'Espiritualidad', 1, 'profundo', true),
  ('¿En qué área de tu vida sabes con exactitud qué hacer pero no lo estás ejecutando?', 'Disciplina', 4, 'desafiante', true)
) AS v(prompt_text, category, week, difficulty, active)
WHERE NOT EXISTS (
  SELECT 1 FROM daily_prompts dp WHERE dp.prompt_text = v.prompt_text
);
