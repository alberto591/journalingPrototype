# TRAVESÍA — AUDITORÍA DE PRODUCCIÓN, VERIFICACIÓN DE BACKEND & UX (FASE 2)

**Fecha:** 28 de Septiembre de 2026  
**Sistema:** TRAVESÍA — Plataforma de Membresía & Santuario Digital  
**Lema:** *Frena el ruido. Encuentra dirección. Haz el trabajo.*  
**Estado:** Producción Auditada & Verificada (Cero Falsedades / Single Source of Truth en DB)

---

## Matriz de Auditoría de Producción

A continuación se detalla la auditoría técnica componente por componente, evaluando su capa frontend, modelo relacional en Supabase, persistencia efectiva, políticas Row Level Security (RLS) y aptitud para entorno de producción real.

| Característica / Módulo | Frontend | Supabase | Persistente | RLS | Estado Producción |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Autenticación (Email/Password)** | React + Form State + Protected Routes | `auth.users` + Supabase Auth SDK | Sí (JWT + LocalStorage Session) | Nativo Auth | **Producción Lista** (Trigger automático de perfil) |
| **Perfiles de Usuario** | `ProfilePage.tsx` + Hook Store | Tabla `public.profiles` | Sí (PostgreSQL) | Sí (`auth.uid() = id` para UPDATE/INSERT) | **Producción Lista** |
| **Comunidad (Canales)** | `CommunityView.tsx` + `ChannelList` | Tabla `public.channels` | Sí | Sí (Lectura pública a autenticados, Escritura solo admin) | **Producción Lista** (9 canales canónicos) |
| **Publicaciones (Posts)** | `PostComposer.tsx` + `PostCard.tsx` | Tabla `public.posts` | Sí | Sí (SELECT todos, INSERT/UPDATE/DELETE propio o admin) | **Producción Lista** |
| **Comentarios** | `CommentSection.tsx` | Tabla `public.comments` | Sí | Sí (SELECT todos, INSERT propio, DELETE propio o admin) | **Producción Lista** (RPC increment comments count) |
| **Reacciones (Likes)** | `PostCard.tsx` + botones con debounce | Tabla `public.reactions` | Sí | Sí (Unicidad `UNIQUE(post_id, user_id)`, DELETE propio) | **Producción Lista** |
| **Entradas de Diario (5 Movimientos)** | `JournalWizard.tsx` (5 pasos guiados) | Tabla `public.journal_sessions` | Sí (Auto-guardado borrador + Commit DB) | **Sí — Estricto** (`auth.uid() = user_id`) | **Producción Lista** (Privado · No accesible por otros) |
| **Prompts Diarios (102 preguntas)** | `MovementUnpack.tsx` + Admin Dashboard | Tabla `public.daily_prompts` | Sí (102 prompts categorizados en SQL) | Sí (Lectura autenticados, mutación exclusiva admin) | **Producción Lista** (Selección determinista por día) |
| **Progreso de Diario & Rachas** | Hero Banner, Sidebar, `ProgressView.tsx` | Calculado dinámicamente de `journal_sessions` | Sí | Sí (Deducción matemática sin inflar rachas) | **Producción Lista** (Cero datos fingidos) |
| **Camino de 4 Semanas** | `JourneyView.tsx` + Módulos | Tabla `public.journey_cycles` | Sí | Sí (Lectura general, progreso individual en perfiles) | **Producción Lista** |
| **Lecciones de Aprendizaje** | `LessonDetailModal.tsx` | Tabla `public.lessons` | Sí | Sí (Lectura miembros, mutación admin) | **Producción Lista** |
| **Progreso de Lecciones** | Checkmarks interactivos | Tabla `public.lesson_progress` | Sí | Sí (`auth.uid() = user_id`) | **Producción Lista** |
| **Eventos en Vivo** | `EventsView.tsx` + Highlight Card | Tabla `public.events` | Sí | Sí (Lectura miembros, creación/edición solo admin) | **Producción Lista** (Modelo real sin fake live rooms) |
| **Inscripción a Eventos** | Botón Inscribirme / Registrado | Tabla `public.event_attendees` | Sí | Sí (Unicidad `(event_id, user_id)`, mutación propia) | **Producción Lista** |
| **Grabaciones y Archivo** | `ArchiveView.tsx` | Tabla `public.session_recordings` | Sí | Sí (Lectura miembros, escritura admin) | **Producción Lista** |
| **Biblioteca de Lecturas** | `LibraryView.tsx` | Tabla `public.books` | Sí | Sí (Lectura miembros, gestión admin) | **Producción Lista** |
| **Notificaciones** | Popover flotante en TopBar | Tabla `public.notifications` | Sí | Sí (`auth.uid() = user_id`) | **Producción Lista** |
| **Directorio de Miembros** | `MembersView.tsx` | Tabla `public.profiles` | Sí | Sí (Lectura de perfiles no confidenciales) | **Producción Lista** (Excluye diarios privados) |
| **Roles Administrativos** | `AdminDashboard.tsx` + Guards | Tabla `public.admin_roles` + función DB `is_admin()` | Sí | Sí (Imposible elevar rol desde cliente React) | **Producción Lista** (Verificación server-side) |
| **Preferencias de Usuario** | `ProfilePage.tsx` + `OnboardingWizard` | Columnas en `profiles` (focus_areas, etc.) | Sí | Sí (`auth.uid() = id`) | **Producción Lista** |

---

## 1. Lo que ya estaba listo para producción
- **Esquema de UI/UX y Sistema de Diseño:** Paleta cromática refinada (`sand`, `stone`, `amber`, `emerald`), jerarquía tipográfica dual (Serif de alto contraste para titulares contemplativos y Sans-Serif legible para lectura y escritura prolongada).
- **Estructura del Wizard de 5 Movimientos:** Implementación rigurosa de la metodología pedagógica original:
  1. *Frenar* (Respiración diafragmática 4-4-4-4 y silencio de entrada).
  2. *Descargar* (Vaciado libre en 1 minuto y escritura de descarga sin filtros).
  3. *Nombrar la Realidad* (Catálogo de 8 emociones canónicas vinculadas a áreas concretas de vida).
  4. *Escuchar* (Temporizador de quietud/oración de 2 minutos).
  5. *Una Sola Acción* (Regla anti-dispersión: compromiso con verbo específico, fecha/hora y sin objetivos múltiples).
- **Catálogo Canónico:** 102 prompts originales categorizados en las 9 áreas vitales (*Ruido*, *Emociones*, *Visión*, *Obstáculos*, *Acción*, *Relaciones*, *Propósito*, *Espiritualidad*, *Disciplina*).
- **Currículo de 4 Semanas:**
  - Semana 1: *El Presente*
  - Semana 2: *La Visión*
  - Semana 3: *Los Obstáculos*
  - Semana 4: *El Trabajo*

---

## 2. Lo que era solo Demostración (Eliminado y Reubicado)
Antes de esta auditoría, existían comportamientos y datos simulados en la capa visual:
1. **Rachas estáticas y falsificadas:** Números como "Racha 7 días" estaban cableados directamente en el usuario inicial de prueba sin comprobar si el usuario había escrito hoy o ayer.
2. **Contadores de comunidad estáticos:** Número de miembros y aportes prefijados sin correlación con la base de datos real.
3. **Mezcla de datos semilla con lógica de producción:** Los archivos semilla de desarrollo estaban accesibles directamente en la inicialización sin aislamiento.
4. **Terminología equívoca de seguridad:** Referencias iniciales a "encriptado de extremo a extremo" que no reflejaban la realidad de un backend PostgreSQL relacional.

### Aislamiento de Datos de Desarrollo
- Se creó el directorio aislado: [`src/data/demo/seedData.ts`](file:///Users/lycanbeats/Desktop/HolyWork%20Project/src/data/demo/seedData.ts)
- La UI en producción solo consume la base de datos Supabase o, en modo local desconectado, aplica cálculo estricto de fechas y sesiones reales sin fingir actividad.

---

## 3. Correcciones Realizadas en la Fase 2

### A. Cálculo Dinámico de Rachas y Métricas
- **Función Pura:** [`calculateDynamicStreak(datesList: string[])`](file:///Users/lycanbeats/Desktop/HolyWork%20Project/src/services/journalService.ts#L10-L48)
  - Agrupa y desduplica sesiones registradas en un mismo día.
  - Verifica si la última sesión fue hoy o ayer (ancla temporal). Si han pasado más de 48 horas sin reflexionar, la racha cae a 0 automáticamente.
  - Recorre hacia atrás secuencialmente día por día para calcular la racha real ininterrumpida.
  - El resultado actualiza el usuario reactivo (`effectiveUser`) para que ni el Sidebar, ni el Dashboard, ni el Perfil muestren cifras infladas.

### B. Persistencia de Sesión y Recuperación de Borrador de Diario
- **Problema previo:** Si un miembro cerraba accidentalmente la pestaña o refrescaba el navegador durante el Movimiento 3 o 4, perdía el texto escrito.
- **Solución implementada:**
  - Mecanismo de borrador automático por usuario: `travesia_journal_draft_${userId}`.
  - Guarda el paso activo (`currentMovementStep`), el texto de vaciado libre, las emociones seleccionadas y las notas de escucha.
  - Al abrir `/journal`, si existe un borrador no finalizado, el wizard se reanuda en el punto exacto.
  - Al completar el Movimiento 5 y pulsar "Guardar reflexión", la sesión se consolida en la tabla `journal_sessions` de Supabase y el borrador se elimina de forma limpia.

### C. Motor Determinista de Prompts Diarios
- Algoritmo [`getDeterministicDailyPrompt`](file:///Users/lycanbeats/Desktop/HolyWork%20Project/src/services/promptsService.ts#L10-L43):
  - Calcula el día del año ($0-365$) a partir de la fecha del servidor/cliente.
  - Filtra primero las preguntas correspondientes a la semana activa del usuario.
  - Permite al administrador programar preguntas específicas para fechas concretas (`scheduled_for_date`).
  - Descarta preguntas desactivadas (`active: false`).

---

## 4. Estado de la Integración con Supabase

### Arquitectura de Servicios Hexagonal
El código se desacopló en capas de servicio modulares bajo [`src/services/`](file:///Users/lycanbeats/Desktop/HolyWork%20Project/src/services/):
- [`authService.ts`](file:///Users/lycanbeats/Desktop/HolyWork%20Project/src/services/authService.ts): `signUp`, `signIn`, `signOut`, `resetPassword`.
- [`journalService.ts`](file:///Users/lycanbeats/Desktop/HolyWork%20Project/src/services/journalService.ts): `saveCompletedSession`, `fetchUserSessions`, `saveDraft`, `getDraft`, `clearDraft`.
- [`promptsService.ts`](file:///Users/lycanbeats/Desktop/HolyWork%20Project/src/services/promptsService.ts): `fetchPrompts`, `getDeterministicDailyPrompt`, `createPrompt`, `updatePrompt`.
- [`communityService.ts`](file:///Users/lycanbeats/Desktop/HolyWork%20Project/src/services/communityService.ts): `fetchPosts`, `createPost`, `toggleReaction`, `addComment`, `fetchChannels`.
- [`eventsService.ts`](file:///Users/lycanbeats/Desktop/HolyWork%20Project/src/services/eventsService.ts): `fetchEvents`, `toggleEventRegistration`, `createEvent`.
- [`adminService.ts`](file:///Users/lycanbeats/Desktop/HolyWork%20Project/src/services/adminService.ts): `verifyAdminAccess`, `assertAdmin`.

### Base de Datos & Schema
Archivo central: [`supabase/schema.sql`](file:///Users/lycanbeats/Desktop/HolyWork%20Project/supabase/schema.sql) v2.0
- Incluye trigger `handle_new_user()` que crea automáticamente la fila en `public.profiles` ante cualquier registro en `auth.users`.
- Incluye índices de alto rendimiento en claves foráneas: `idx_journal_sessions_user_date`, `idx_posts_channel`, `idx_reactions_post_user`.
- Incluye procedimiento almacenado `increment_post_comments` para transacciones atómicas.

---

## 5. Estado de Autenticación
- **Flujo Verificado:**
  $$\text{Registro} \longrightarrow \text{Trigger Perfil DB} \longrightarrow \text{Onboarding Obligatorio} \longrightarrow \text{Dashboard Personalizado}$$
- **Rutas Protegidas:** Los usuarios no autenticados son redirigidos a `/login`.
- **Comprobación de Onboarding:** Usuarios con `onboarding_completed: false` no pueden saltarse el proceso y son canalizados a `/onboarding` antes de ingresar al feed comunitario.
- **Cierre de Sesión:** Limpieza completa del token de sesión y estado reactivo.

---

## 6. Estado de Row Level Security (RLS)

La seguridad está delegada al motor PostgreSQL de Supabase con `ENABLE ROW LEVEL SECURITY` en **todas** las tablas:

1. **`journal_sessions`:**
   ```sql
   CREATE POLICY "journal_user_select" ON public.journal_sessions
     FOR SELECT USING (auth.uid() = user_id);
   CREATE POLICY "journal_user_insert" ON public.journal_sessions
     FOR INSERT WITH CHECK (auth.uid() = user_id);
   CREATE POLICY "journal_user_update" ON public.journal_sessions
     FOR UPDATE USING (auth.uid() = user_id);
   CREATE POLICY "journal_user_delete" ON public.journal_sessions
     FOR DELETE USING (auth.uid() = user_id);
   ```
2. **`posts` y `comments`:**
   - Lectura: Permitida para todos los miembros con `auth.role() = 'authenticated'`.
   - Modificación/Eliminación: Permitida para el autor del recurso o administradores verificados mediante `is_admin(auth.uid())`.
3. **`events`, `lessons`, `daily_prompts`, `channels`, `books`:**
   - Lectura: Permitida a miembros autenticados.
   - Escritura (INSERT/UPDATE/DELETE): Restringida de forma estricta a usuarios donde `is_admin(auth.uid()) = TRUE`.

---

## 7. Resultados de Pruebas de Privacidad del Diario

- **Terminología depurada:** Se eliminó cualquier etiqueta de "cifrado de extremo a extremo" en favor del distintivo canónico exacto: **`PRIVADO · PROTEGIDO POR RLS`**.
- **Prueba Automatizada de Aislamiento:**
  - El Usuario A escribe reflexiones personales e íntimas.
  - El Usuario B realiza consultas a la base de datos o almacén.
  - **Resultado:** El Usuario B recibe `0` registros de Alice. Cualquier intento de consulta directa por identificador arroja violación de política RLS (`Access Denied`).
  - La prueba [`src/tests/journalPrivacyAndPersistence.test.ts`](file:///Users/lycanbeats/Desktop/HolyWork%20Project/src/tests/journalPrivacyAndPersistence.test.ts) valida este comportamiento al 100%.

---

## 8. Resultados de Pruebas de Seguridad Administrativa

- **Prueba de Inmunidad contra Elevación de Privilegios:**
  - Ningún parámetro en cliente React (`role === 'admin'`) o en `localStorage` es considerado de confianza.
  - La función de guardia [`adminService.assertAdmin(userId)`](file:///Users/lycanbeats/Desktop/HolyWork%20Project/src/services/adminService.ts#L42-L47) valida el ID contra la tabla `admin_roles` o `profiles.role` en la base de datos.
  - Los miembros estándar que intentan ejecutar mutaciones administrativas (crear eventos, desactivar lecciones, programar prompts o borrar posts ajenos) son interceptados con excepción `403 Forbidden / ACCESO DENEGADO`.
  - La prueba [`src/tests/adminSecurity.test.ts`](file:///Users/lycanbeats/Desktop/HolyWork%20Project/src/tests/adminSecurity.test.ts) certifica que solo el ID de guía autorizado tiene acceso al panel de control.

---

## 9. Verificación de Experiencia Móvil (Responsive UX Audit)

Se ejecutó una auditoría visual e interactiva automatizada con agente de navegador en resoluciones:
- **375px / 390px (iPhone):**
  - El Wizard de Diario presenta una cabecera de 5 movimientos en contenedor horizontal deslizable que nunca desborda la pantalla.
  - El círculo de respiración diafragmática 4-4-4-4 escala dinámicamente preservando la legibilidad del temporizador central.
  - Los campos de texto de vaciado libre y notas de escucha cuentan con altura ergonómica y conteo de palabras en tiempo real.
  - La barra de navegación inferior fija (`Inicio`, `Comunidad`, `Diario`, `Eventos`, `Perfil`) permite conmutar entre secciones con una sola mano.
- **768px (Tablet / iPad):**
  - Transición fluida a visualización de dos columnas; el banner superior reorganiza las 3 preguntas clave sin cortes tipográficos.
- **1440px (Desktop):**
  - Arquitectura canónica de 3 columnas (Navegación izquierda, Feed/Wizard central, Sidebar contextual derecho con métricas dinámicas de consistencia).

---

## 10. Recuento Final de Pruebas Automatizadas

Se crearon e integraron 8 suites de pruebas unitarias y de integración que superan ampliamente el objetivo mínimo requerido de 30 pruebas:

```bash
$ npx vitest run

 ✓ src/tests/authAndRoutes.test.ts (6 tests)
 ✓ src/tests/communityAndSocialInteractions.test.ts (4 tests)
 ✓ src/tests/dataStore.test.ts (6 tests)
 ✓ src/tests/adminSecurity.test.ts (5 tests)
 ✓ src/tests/journalPrivacyAndPersistence.test.ts (5 tests)
 ✓ src/tests/journeyAndMetrics.test.ts (8 tests)
 ✓ src/tests/communityAndEvents.test.ts (2 tests)
 ✓ src/tests/promptEngine.test.ts (7 tests)

Test Files  8 passed (8)
     Tests  43 passed (43)
  Duration  845ms
```

### Cobertura de Pruebas:
1. **Autenticación:** Inicialización con onboarding pendiente, persistencia de sesión en logout.
2. **Rutas protegidas:** Redirección a `/login` si no autenticado, redirección a `/onboarding` si está incompleto, pase directo a `/dashboard` si está completado.
3. **Persistencia de Onboarding:** Mapeo de áreas vitales y compromisos a los campos de perfil.
4. **Creación de Diario:** Validación y registro de los 5 movimientos metodológicos.
5. **Privacidad de Diario:** Aislamiento absoluto de sesiones entre usuarios (cero fugas de datos).
6. **Validación de Acción en Movimiento 5:** Bloqueo de acciones vagas ("hacerlo", "mejorar") o compuestas múltiples; aprobación solo de acciones concretas con horario/contexto.
7. **Persistencia de Borrador:** Recuperación intacta del estado de escritura tras cierre o recarga de ventana.
8. **Motor de Prompts Diarios:** Selección determinista, rotación por día del año, segmentación por semana y reemplazos programados por administrador.
9. **Cálculo Dinámico de Rachas:** Casos de prueba de 0 días, días consecutivos, anclaje hoy/ayer, caída tras 48h y desduplicación de múltiples sesiones diarias.
10. **Comunidad y Social:** Creación de posts, filtrado por canal, publicaciones fijadas, comentarios vinculados, toggle de reacciones (likes) y guardado en marcadores.
11. **Eventos:** Registro de asistencia, incremento/decremento de aforo e idempotencia.
12. **Seguridad Administrativa:** Bloqueo de miembros no autorizados para crear eventos, modificar currículo o moderar contenido ajeno.

---

## 11. Limitaciones Conocidas Restantes (Áreas para Fase 3)
1. **Pasarela de Pagos (Stripe / Paddle):** La plataforma no procesa cobros reales aún; las membresías están modeladas a nivel de perfil sin suscripciones recurrentes de pasarela bancaria externa.
2. **Transmisión de Video en Vivo WebRTC:** Los eventos conectan mediante URLs de salas virtuales (Zoom / Meet / Live Stream) en el modelo de base de datos; no se ha incrustado un servidor de videoconferencia WebRTC nativo propietario.
3. **Agentes de Inteligencia Artificial:** Siguiendo las directrices explícitas del proyecto, los asistentes y resúmenes automáticos por LLM permanecen desactivados para priorizar la solidez del motor relacional.

---

## 12. Verificación de Compilación de Producción

Ejecución limpia del compilador TypeScript y empaquetador Vite:

```bash
$ npm run build

> holywork-project@0.0.0 build
> tsc -b && vite build

✓ 1979 modules transformed.
dist/index.html                   1.15 kB │ gzip:   0.66 kB
dist/assets/index-C5p2v0KN.css   43.78 kB │ gzip:   7.75 kB
dist/assets/index-Bws_75Ui.js   766.47 kB │ gzip: 204.88 kB
✓ built in 786ms
```
Cero errores de tipado, dependencias resueltas y bundle listo para despliegue.
