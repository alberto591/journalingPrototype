-- ====================================================================
-- TRAVESÍA - Database Seed Data (PostgreSQL / Supabase)
-- Canonical Production Prompt Catalog, Channels, Modules & Books
-- ====================================================================

-- 0. PRICING PLANS (Mandatory for handle_new_user signup trigger)
INSERT INTO public.pricing_plans (id, name, description, price_monthly, price_annual, features, is_active)
VALUES 
  ('trial', 'Prueba de 7 Días', 'Acceso completo a la experiencia guiada de 7 días', 0.00, 0.00, ARRAY['7 días de reto guiado', 'Acceso a sesiones en vivo', 'Comunidad de silencio'], true),
  ('founding', 'Miembro Fundador', 'Tarifa protegida de por vida para los primeros 20 miembros', 29.00, 290.00, ARRAY['Precio protegido de por vida', 'Acceso diario a directos Zoom', 'Archivo completo de grabaciones', 'Comunidad y directos'], true),
  ('standard', 'Membresía Mensual', 'Acceso completo mensual a Travesía', 39.00, 390.00, ARRAY['Acceso diario a directos Zoom', 'Archivo completo de grabaciones', 'Comunidad y biblioteca'], true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_monthly = EXCLUDED.price_monthly,
  price_annual = EXCLUDED.price_annual;

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

-- 5. READ POLICIES (Allow both authenticated and public visitors to read public catalog items)
DO $$
BEGIN
  -- Channels read policy
  DROP POLICY IF EXISTS "Channels viewable by everyone" ON public.channels;
  CREATE POLICY "Channels viewable by everyone" ON public.channels FOR SELECT USING (true);

  -- Pricing plans read policy
  DROP POLICY IF EXISTS "Pricing plans viewable by everyone" ON public.pricing_plans;
  CREATE POLICY "Pricing plans viewable by everyone" ON public.pricing_plans FOR SELECT USING (true);

  -- Emotions read policy
  DROP POLICY IF EXISTS "Emotions viewable by everyone" ON public.emotions;
  CREATE POLICY "Emotions viewable by everyone" ON public.emotions FOR SELECT USING (true);

  -- Daily prompts read policy
  DROP POLICY IF EXISTS "Daily prompts viewable by everyone" ON public.daily_prompts;
  CREATE POLICY "Daily prompts viewable by everyone" ON public.daily_prompts FOR SELECT USING (true);

  -- Four week cycles read policy
  DROP POLICY IF EXISTS "Four week cycles viewable by everyone" ON public.four_week_cycles;
  CREATE POLICY "Four week cycles viewable by everyone" ON public.four_week_cycles FOR SELECT USING (true);
END $$;

-- ====================================================================
-- SEED 6: INITIAL ONGOING CYCLES (TRAVESÍA CONTINUA)
-- ====================================================================
INSERT INTO public.ongoing_cycles (id, cycle_number, title, theme, description, start_date, end_date, status, weeks)
VALUES
  (
    'cycle-relaciones',
    1,
    'Relaciones',
    'Sanar vínculos, conversaciones difíciles y verdad en el hogar',
    'Explora cómo desarmar la hostilidad pasiva, comunicar la verdad con amor y restaurar la intimidad familiar.',
    '2026-09-15T00:00:00Z',
    '2026-10-15T00:00:00Z',
    'active',
    '[
      {"week_number": 1, "title": "El Espejo del Otro", "focus": "Identificar tus proyecciones y expectativas no habladas", "prompt_focus": "¿Qué reproche silencioso guardas hacia alguien cercano?"},
      {"week_number": 2, "title": "Conversaciones Necesarias", "focus": "Aprender a hablar con mansedumbre e implacable verdad", "prompt_focus": "¿Qué conversación estás postergando por temor a la incomodidad?"},
      {"week_number": 3, "title": "Perdón y Desarme", "focus": "Soltar la deuda emocional sin caer en complacencia ciega", "prompt_focus": "¿Qué ofensa pasada sigues cobrando en cuotas invisibles?"},
      {"week_number": 4, "title": "Pacto y Presencia", "focus": "Construir acuerdos claros y estar presente sin distracciones", "prompt_focus": "¿Cómo vas a honrar hoy a las personas que Dios te confió?"}
    ]'::jsonb
  ),
  (
    'cycle-proposito',
    2,
    'Propósito',
    'Claridad vocacional, dones y servicio duradero',
    'Alinear tu tiempo, talento y recursos al llamado fundamental de tu vida, descartando falsas urgencias.',
    '2026-10-16T00:00:00Z',
    '2026-11-15T00:00:00Z',
    'upcoming',
    '[
      {"week_number": 1, "title": "Despojo de Máscaras", "focus": "Separar el ego de la verdadera vocación de servicio", "prompt_focus": "¿Qué parte de tu trabajo haces por vanidad y cuál por verdadero fruto?"},
      {"week_number": 2, "title": "El Martes Normal", "focus": "Diseñar la rutina fiel que sostiene tu propósito", "prompt_focus": "Si fueras plenamente fiel a tu vocación, ¿qué cambiarías hoy?"},
      {"week_number": 3, "title": "La Resistencia Interior", "focus": "Vencer el miedo a no ser suficiente y la pereza encubierta", "prompt_focus": "¿Cuál es la duda recurrente que frena tu entrega?"},
      {"week_number": 4, "title": "El Fruto Fecundo", "focus": "Sellar compromisos de largo plazo para servir al prójimo", "prompt_focus": "¿A quién beneficiará que seas diligente en tu trabajo?"}
    ]'::jsonb
  ),
  (
    'cycle-disciplina',
    3,
    'Disciplina',
    'Orden en el caos, dominio propio y rituales innegociables',
    'Construir un ritmo diario sostenible que no dependa de la motivación emocional pasajera.',
    '2026-11-16T00:00:00Z',
    '2026-12-15T00:00:00Z',
    'upcoming',
    '[
      {"week_number": 1, "title": "La Regla de Vida", "focus": "Diseñar límites de tiempo y descanso sagrados", "prompt_focus": "¿En qué área de tu rutina diaria reina el desorden?"},
      {"week_number": 2, "title": "Frenar la Fuga", "focus": "Cortar microadicciones y distracciones digitales", "prompt_focus": "¿Qué distracción consume tus mejores horas de energía?"},
      {"week_number": 3, "title": "Firmeza en la Fatiga", "focus": "Aprender a cumplir tu palabra cuando estás cansado", "prompt_focus": "¿Qué compromiso abandonas cuando sientes desánimo?"},
      {"week_number": 4, "title": "El Hábito Silencioso", "focus": "Gozar de la sobriedad sin buscar aplauso ajeno", "prompt_focus": "¿Qué disciplina harás hoy solo ante Dios y nadie más?"}
    ]'::jsonb
  ),
  (
    'cycle-identidad',
    4,
    'Identidad',
    'Quién eres cuando nadie mira: carácter vs reputación',
    'Desmontar la necesidad patológica de validación externa para habitar con seguridad tu ser real.',
    '2026-12-16T00:00:00Z',
    '2027-01-15T00:00:00Z',
    'upcoming',
    '[
      {"week_number": 1, "title": "El Ídolo de la Aprobación", "focus": "Identificar ante quién actúas y qué buscas complacer", "prompt_focus": "¿Qué opinión ajena te quita la paz más de la cuenta?"},
      {"week_number": 2, "title": "Heridas y Arraigo", "focus": "Sanar la necesidad de demostrar tu valía mediante logros", "prompt_focus": "¿Qué intentas probar con tu hiperactividad o perfeccionismo?"},
      {"week_number": 3, "title": "La Sombra Reconocida", "focus": "Aceptar tus flaquezas con humildad y sin autoengaño", "prompt_focus": "¿Qué verdad sobre ti mismo te cuesta admitir en voz alta?"},
      {"week_number": 4, "title": "Firmeza Interior", "focus": "Anclar tu seguridad en Dios y en tus principios", "prompt_focus": "¿Qué decisión tomarías hoy si no te importara quedar bien?"}
    ]'::jsonb
  ),
  (
    'cycle-coraje',
    5,
    'Coraje',
    'Dar el paso difícil, enfrentar el temor y asumir riesgos',
    'Superar la parálisis del análisis y avanzar en obediencia aun temblando.',
    '2027-01-16T00:00:00Z',
    '2027-02-15T00:00:00Z',
    'upcoming',
    '[
      {"week_number": 1, "title": "Nombrar el Gigante", "focus": "Ponerle nombre y rostro al miedo que te paraliza", "prompt_focus": "¿Qué temes que pase si haces lo que debes hacer?"},
      {"week_number": 2, "title": "El Coste de la Inacción", "focus": "Medir cuánto daño hace seguir postergando", "prompt_focus": "¿Qué estás perdiendo cada día que sigues en tu zona de confort?"},
      {"week_number": 3, "title": "El Paso Decisivo", "focus": "Ejecutar la acción temida con fe y determinación", "prompt_focus": "¿Cuál es el paso concreto que vas a dar antes de que caiga el sol?"},
      {"week_number": 4, "title": "Resistir la Resaca", "focus": "Mantenerte firme tras tomar una postura valiente", "prompt_focus": "¿Cómo vas a sostener tu postura frente a la presión de tu entorno?"}
    ]'::jsonb
  ),
  (
    'cycle-familia',
    6,
    'Familia',
    'Edificar el hogar, sanar generaciones y honrar el linaje',
    'Restaurar la reverencia, el amor incondicional y el orden en el núcleo más sagrado de tu vida.',
    '2027-02-16T00:00:00Z',
    '2027-03-15T00:00:00Z',
    'upcoming',
    '[
      {"week_number": 1, "title": "El Estado del Hogar", "focus": "Diagnóstico sobrio del clima emocional de tu casa", "prompt_focus": "¿Hay paz o tensión latente al entrar por la puerta de tu hogar?"},
      {"week_number": 2, "title": "Romper Patrones", "focus": "Interrumpir vicios heredados de ira, frialdad o juicio", "prompt_focus": "¿Qué patrón destructivo de tus padres te juraste no repetir?"},
      {"week_number": 3, "title": "Presencia Fértil", "focus": "Calidad de atención sin teléfono ni dispersión mental", "prompt_focus": "¿Cómo puedes estar 100% presente para los tuyos esta tarde?"},
      {"week_number": 4, "title": "La Mesa Compartida", "focus": "Instituir momentos de bendición y comunión familiar", "prompt_focus": "¿Qué palabra de aliento necesita escuchar tu familia hoy?"}
    ]'::jsonb
  ),
  (
    'cycle-limites',
    7,
    'Límites',
    'Decir no, custodiar tu energía y proteger tu llamado',
    'Aprender a discernir entre lo que es tu carga y lo que estás asumiendo por culpa o vanidad.',
    '2027-03-16T00:00:00Z',
    '2027-04-15T00:00:00Z',
    'upcoming',
    '[
      {"week_number": 1, "title": "El No Libertador", "focus": "Practicar la negativa limpia sin dar explicaciones excesivas", "prompt_focus": "¿A qué compromiso deberías haber dicho no?"},
      {"week_number": 2, "title": "Custodia del Enfoque", "focus": "Blindar tus mañanas contra urgencias ajenas", "prompt_focus": "¿Quién o qué está secuestrando tu tiempo más valioso?"},
      {"week_number": 3, "title": "La Culpa Residual", "focus": "Desmontar la creencia de que poner límites es egoísmo", "prompt_focus": "¿Por qué sientes culpa cuando cuidas tus límites esenciales?"},
      {"week_number": 4, "title": "El Cerco de Paz", "focus": "Establecer estándares claros que nadie pueda cruzar", "prompt_focus": "¿Qué límite necesitas comunicar con firmeza y serenidad hoy?"}
    ]'::jsonb
  ),
  (
    'cycle-trabajo',
    8,
    'Trabajo',
    'Labor como servicio, excelencia y fruto duradero',
    'Transformar la profesión en un altar de servicio y disciplina cotidiana sin caer en el afán.',
    '2027-04-16T00:00:00Z',
    '2027-05-15T00:00:00Z',
    'upcoming',
    '[
      {"week_number": 1, "title": "El Sentido de la Tarea", "focus": "Redescubrir la dignidad espiritual de tu labor", "prompt_focus": "¿Para quién trabajas en última instancia?"},
      {"week_number": 2, "title": "Artesanía y Foco", "focus": "Ejecutar con maestría y sin mediocridad encubierta", "prompt_focus": "¿Qué proyecto o entrega requiere hoy tu mayor estándar de excelencia?"},
      {"week_number": 3, "title": "Desarmar la Ansiedad", "focus": "Distinguir entre diligencia fiel y afán obsesivo", "prompt_focus": "¿Qué miedo económico o profesional te roba el descanso?"},
      {"week_number": 4, "title": "El Fruto Compartido", "focus": "Usar los beneficios del trabajo para bendecir a otros", "prompt_focus": "¿Cómo puede tu éxito profesional mejorar la vida de tu comunidad?"}
    ]'::jsonb
  ),
  (
    'cycle-decisiones',
    9,
    'Decisiones',
    'Discernimiento bajo presión, sabiduría y consecuencias',
    'Aprender a deliberar con quietud y elegir lo correcto por encima de lo fácil.',
    '2027-05-16T00:00:00Z',
    '2027-06-15T00:00:00Z',
    'upcoming',
    '[
      {"week_number": 1, "title": "El Filtro de la Verdad", "focus": "Separar el impulso emocional del discernimiento sobrio", "prompt_focus": "¿Qué decisión importante tienes delante y qué temes elegir?"},
      {"week_number": 2, "title": "El Consejo Sabio", "focus": "Escuchar a hombres prudentes antes de comprometerte", "prompt_focus": "¿A quién de confianza le has consultado este dilema con humildad?"},
      {"week_number": 3, "title": "El Coste Oculto", "focus": "Evaluar el impacto a 5 años en tu paz interior y tu fe", "prompt_focus": "¿Qué consecuencias a largo plazo tendrá la opción que estás considerando?"},
      {"week_number": 4, "title": "Firmeza en la Elección", "focus": "Tomar la decisión sin mirar atrás con dudas estériles", "prompt_focus": "¿Estás listo para asumir las consecuencias de tu decisión con paz?"}
    ]'::jsonb
  ),
  (
    'cycle-espiritualidad',
    10,
    'Espiritualidad',
    'Comunión viva, silencio sagrado y rendición del alma',
    'Profundizar en la intimidad real con Dios más allá de fórmulas mecánicas.',
    '2027-06-16T00:00:00Z',
    '2027-07-15T00:00:00Z',
    'upcoming',
    '[
      {"week_number": 1, "title": "El Aposento Interior", "focus": "Cultivar el silencio contemplativo sin palabras aprendidas", "prompt_focus": "¿Cuánto tiempo puedes estar en silencio ante Dios sin inquietud?"},
      {"week_number": 2, "title": "Rendición de la Voluntad", "focus": "Soltar el control y decir hágase Tu voluntad de corazón", "prompt_focus": "¿Qué situación sigues intentando resolver con tus solas fuerzas?"},
      {"week_number": 3, "title": "El Desierto Fecundo", "focus": "Mantener la fidelidad cuando no sientes consuelo emocional", "prompt_focus": "¿Sigues buscando a Dios cuando no sientes nada?"},
      {"week_number": 4, "title": "La Alianza Renovada", "focus": "Sellar un pacto de lealtad espiritual duradera", "prompt_focus": "¿Qué ofrenda interior quieres entregarle a Dios en este amanecer?"}
    ]'::jsonb
  ),
  (
    'cycle-integracion',
    11,
    'Integración',
    'El hombre unificado: coherencia, fruto y perseverancia',
    'Cerrar el círculo formativo integrando todos los territorios en una vida sólida y fecunda.',
    '2027-07-16T00:00:00Z',
    '2027-08-15T00:00:00Z',
    'upcoming',
    '[
      {"week_number": 1, "title": "Coherencia Total", "focus": "Unificar tu vida pública, profesional y secreta", "prompt_focus": "¿Hay alguna diferencia entre quien eres en público y en privado?"},
      {"week_number": 2, "title": "El Templo Vivo", "focus": "Cuidar el sueño, el cuerpo y los sentidos como ofrenda", "prompt_focus": "¿Cómo estás honrando tu cuerpo hoy con descanso y alimento limpio?"},
      {"week_number": 3, "title": "La Forja Continua", "focus": "Aceptar que el trabajo interior nunca termina, se profundiza", "prompt_focus": "¿Qué fruto de madurez reconoces hoy que antes no tenías?"},
      {"week_number": 4, "title": "Legado de Paz", "focus": "Ser un faro sereno para tu comunidad y familia", "prompt_focus": "¿Cómo vas a irradiar sobriedad y verdad en tu entorno hoy?"}
    ]'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  theme = EXCLUDED.theme,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  weeks = EXCLUDED.weeks;

