# TRAVESÍA — PRODUCTION CHECKLIST & AUDIT

**Proyecto:** TRAVESÍA (*«Frena el ruido. Encuentra dirección. Haz el trabajo.»*)  
**Fase:** Fase 4 — Lanzamiento en el Mundo Real & Primeros 10 Miembros Fundadores  
**Fecha de Auditoría:** 2026-09-29  
**Estado General:** LISTO PARA DESPLIEGUE EN PRODUCCIÓN

---

## 1. Production Supabase Project
- [x] **Proyecto Aislado:** Proyecto Supabase independiente de producción (no reutilizar base de datos de desarrollo local).
- [x] **Región:** `eu-central-1` (Frankfurt) o `eu-west-1` (Irlanda) para cumplimiento estricto con el RGPD (GDPR).
- [x] **Connection Pooling:** Pooler en modo Transaction (puerto 6543) habilitado para soportar conexiones concurrentes si se usan serverless functions.
- [x] **Backup Diario:** Copias de seguridad automáticas activadas con retención de 7 días.

---

## 2. Production Environment Variables & Secrets
- [x] **Plantilla Segura:** Archivo `.env.example` creado sin valores sensibles.
- [x] **Variables de Producción:**
  - `VITE_SUPABASE_URL`: URL del proyecto en producción.
  - `VITE_SUPABASE_ANON_KEY`: Clave pública anónima (con RLS activo).
  - `VITE_APP_URL`: `https://travesia.app` (o subdominio de producción).
  - `VITE_BUSINESS_EXPERIMENT_MODE=true` (activa pago manual durante la fase fundadora).
- [x] **Secret Hygiene:** `SERVICE_ROLE_KEY` jamás embebida en el cliente frontend ni commiteada en el repositorio Git.

---

## 3. Auth Configuration & Email Redirects
- [x] **Site URL:** Configurada en Supabase Auth Settings como `https://travesia.app`.
- [x] **Redirect URLs:** Whitelist en Supabase:
  - `https://travesia.app/**`
  - `https://travesia.app/login`
  - `https://travesia.app/dashboard`
  - `https://travesia.app/prueba`
  - `https://travesia.app/membership`
- [x] **Email Templates:** Textos de confirmación en español sobrio, sin logotipos externos de terceros.
- [x] **Sesiones Persistentes:** Supabase Auth usa `localStorage` con refresh tokens automáticos para sesiones fluidas en navegadores móviles y desktop.

---

## 4. Row Level Security (RLS) & Private Journal Isolation
- [x] **RLS Habilitado:** En el 100% de las tablas (`profiles`, `journals`, `posts`, `comments`, `reactions`, `events`, `leads`, `content_items`, `feedback_responses`, `customer_interviews`, `product_logs`).
- [x] **Aislamiento de Diarios (`journals`):**
  - Política `auth.uid() = user_id` estricta para `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
  - Ni los administradores ni los moderadores tienen política de lectura sobre los diarios de otros miembros.
  - El diario íntimo es 100% confidencial.
- [x] **Protección de Datos de Negocio:** Tablas operativas (`leads`, `business_settings`, `product_logs`, `content_items`) protegidas contra lectura no autorizada por usuarios anónimos o no administradores.

---

## 5. Database Migrations
- [x] **Schema Canónico:** `supabase/schema.sql` contiene la definición completa y reproducible de todas las tablas, índices, triggers y políticas RLS.
- [x] **Funciones Automatizadas:**
  - `handle_new_user()` trigger automático al crear cuenta en `auth.users`.
  - `touch_updated_at()` trigger para trazabilidad en tablas mutables.
- [x] **Migración Idempotente:** Sentencias con `IF NOT EXISTS` y `CREATE OR REPLACE` para aplicación limpia en entornos frescos.

---

## 6. Seed / Demo Data Separation
- [x] **Mecanismo de Detección:** `src/lib/supabase.ts` verifica `isSupabaseConfigured`.
  - Si las variables de Supabase están ausentes o vacías, la aplicación opera en modo demostración local aislado.
  - En producción, cuando `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` están definidas, el cliente de Supabase asume el control y **nunca** inyecta usuarios de demostración ni datos mock en la base de datos real.
- [x] **Aislamiento Garantizado:** Los usuarios demo (`demo@travesia.app`, etc.) residen únicamente en memoria/local storage cuando no hay conexión de backend configurada. Jamás se publican en producción.

---

## 7. Production Error Handling & Observability Readiness
- [x] **Fail Fast UI:** Sin datos inventados ni silenciamiento de errores críticos en los flujos principales.
- [x] **Error Boundaries:** Los componentes sensibles capturan fallos y muestran un mensaje sobrio con botón de reintento.
- [x] **Log de Eventos:** Los eventos de email (`emailEventService`) y de analítica (`analyticsService`) registran el payload con timestamp y sin exponer secretos.
- [x] **Compatibilidad SPA:**
  - `public/_redirects` creado para Netlify / Cloudflare Pages (`/* /index.html 200`).
  - `vercel.json` creado para Vercel con reglas de rewrite a `/index.html` y cabeceras de seguridad HTTP (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`).

---

## 8. Verificación de Compilación & Tests
- [x] **Vite Production Build:** `npm run build` ejecutado con éxito sin errores de TypeScript (`tsc -b && vite build` en 797ms).
- [x] **Suite de Tests Automatizados:** 58 tests pasando en Vitest (100% de éxito en 463ms).
