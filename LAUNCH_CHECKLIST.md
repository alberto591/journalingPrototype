# TRAVESÍA — LAUNCH CHECKLIST (PHASE 4)

**Proyecto:** TRAVESÍA (*«Frena el ruido. Encuentra dirección. Haz el trabajo.»*)  
**Objetivo de Fase:** Conseguir los primeros 10 miembros de pago y validar la asistencia recurrente.  
**Fecha:** 2026-09-29  

Cada uno de los elementos se audita bajo el estándar de estado: **Not started** | **In progress** | **Complete**.

---

## 1. Technical
- **Configuración de Variables de Producción (.env.example):**  
  STATUS: Complete
- **Build de Producción Limpio (Vite + TypeScript):**  
  STATUS: Complete
- **Suite de Pruebas Automatizadas (58 tests passing):**  
  STATUS: Complete
- **Reglas de Redirección SPA (_redirects y vercel.json):**  
  STATUS: Complete
- **Row Level Security (RLS) en todas las tablas:**  
  STATUS: Complete
- **Separación estricta entre datos de demostración y producción:**  
  STATUS: Complete
- **Cabeceras de Seguridad HTTP (X-Frame-Options, nosniff, XSS):**  
  STATUS: Complete
- **Dominio personalizado con HTTPS forzado:**  
  STATUS: In progress

---

## 2. Legal
- **Aviso Legal y Términos de Servicio para España:**  
  STATUS: Complete
- **Política de Privacidad adaptada al RGPD (GDPR):**  
  STATUS: Complete
- **Disclaimer Explícito (Práctica secular de discernimiento, no sustituye terapia médica ni psicológica):**  
  STATUS: Complete
- **Política de Reembolso de 14 días:**  
  STATUS: Complete
- **Consentimiento de Cookies / Privacidad mínima:**  
  STATUS: In progress

---

## 3. Payments
- **Aviso explícito "Pago manual durante la fase fundadora":**  
  STATUS: Complete
- **Recepción de Transferencias Bancarias SEPA directas:**  
  STATUS: Complete
- **Flujo de Activación Manual por el Administrador:**  
  STATUS: Complete
- **Procedimiento de Emisión de Facturas para empresas/autónomos:**  
  STATUS: Complete
- **Cálculo dinámico de plazas fundadoras restantes (`20 - active_founders`):**  
  STATUS: Complete
- **Integración automatizada con Stripe Checkout / Webhooks:**  
  STATUS: Not started *(Postergada deliberadamente a Fase 5 tras validar con 10 clientes)*

---

## 4. Analytics
- **Separación en embudo: Tráfico → Leads → Trials → Clientes → Retención:**  
  STATUS: Complete
- **Registro de Eventos de Conversión en Base de Datos y Consola:**  
  STATUS: Complete
- **Tarjeta de KPI Fundacional (Meta: 10 Miembros de Pago):**  
  STATUS: Complete
- **Métricas de Retención de Cohorte (Días 1, 3, 7, 14, 28):**  
  STATUS: Complete
- **Monitoreo de Asistencia a Sesiones en Vivo:**  
  STATUS: Complete
- **Integración externa con PostHog / Plausible:**  
  STATUS: Not started *(Planificada para escalado de tráfico)*

---

## 5. Email
- **Definición de los 12 Momentos Clave del Ciclo de Vida:**  
  STATUS: Complete
- **Servicio de Despacho y Registro de Eventos (`emailEventService`):**  
  STATUS: Complete
- **Plantillas de Texto Sobrias en Español para los 7 días del reto:**  
  STATUS: Complete
- **Conexión de Credenciales SMTP / Resend en Producción:**  
  STATUS: In progress

---

## 6. Landing
- **Landing Page en `/` con los 9 bloques de persuasión y sobriedad:**  
  STATUS: Complete
- **Métricas de Plazas Restantes Calculadas en Tiempo Real (no hardcodeadas):**  
  STATUS: Complete
- **Página de Identidad del Fundador (`/fundador`) como facilitador y participante:**  
  STATUS: Complete
- **Página de Precios (`/membership`) con selector mensual / anual y pago manual:**  
  STATUS: Complete
- **Llamadas a la acción (CTAs) sin ruido ni promesas exageradas:**  
  STATUS: Complete

---

## 7. Free Challenge
- **Ruta `/prueba` interactiva con los 7 días estructurados:**  
  STATUS: Complete
- **Estructura por día: Número, Tema, Introducción, Ejercicio, Temporizador y Entrada de Diario:**  
  STATUS: Complete
- **Expectativa para el día siguiente en cada hito (Días 1 al 6):**  
  STATUS: Complete
- **Pantalla de cierre al terminar el Día 7 con el copy exacto:**  
  *«Has terminado tus 7 primeros días. ¿Y AHORA QUÉ? Puedes volver a hacerlo solo. Pero también puedes hacerlo acompañado. [Entrar en Travesía]»*  
  STATUS: Complete
- **Persistencia local y remota del avance del usuario en el reto:**  
  STATUS: Complete

---

## 8. Live Sessions
- **Creación administrativa de sesiones: Fecha, Hora, Temática, Prompt, Facilitador y URL:**  
  STATUS: Complete
- **Tarjeta destacada en el Dashboard: "PRÓXIMA SESIÓN" con cuenta regresiva y botón de acceso:**  
  STATUS: Complete
- **Campo y visualización de grabación tras la sesión:**  
  STATUS: Complete
- **Sala virtual de Google Meet / Zoom configurada:**  
  STATUS: Complete

---

## 9. Community
- **Canales organizados por temas (`#anuncios`, `#silencio-matutino`, `#descarga`, `#preguntas`):**  
  STATUS: Complete
- **Publicación de reflexiones no privadas, comentarios y reacciones sobrias:**  
  STATUS: Complete
- **Enlaces a grupos de acompañamiento externo (WhatsApp / Telegram de la cohorte):**  
  STATUS: Complete
- **10 Prompts iniciales de discusión comunitaria en el motor de contenidos:**  
  STATUS: Complete

---

## 10. Founder Operations
- **Panel Administrativo con Directorio Operativo de Miembros Fundadores:**  
  STATUS: Complete
- **Formulario y Modal de Entrevistas Cualitativas (las 10 preguntas exactas):**  
  STATUS: Complete
- **Bitácora de Desarrollo de Producto (Observación → Problema → Hipótesis → Cambio → Medir):**  
  STATUS: Complete
- **Motor Editorial con 65 piezas preparadas (30 IG, 15 vídeos, 5 newsletters, 5 prácticas, 10 debates):**  
  STATUS: Complete
- **Horario de facilitación matutina reservado (L-V 07:00 AM CET):**  
  STATUS: Complete

---

## 11. Customer Support
- **Canal directo de contacto con el fundador (`alberto@travesia.app`):**  
  STATUS: Complete
- **Protocolo de onboarding manual y bienvenida personalizada (1-a-1):**  
  STATUS: Complete
- **Gestión ágil de dudas sobre facturas o transferencias SEPA:**  
  STATUS: Complete
- **Procedimiento de soporte ante bloqueos de acceso o contraseñas:**  
  STATUS: Complete
