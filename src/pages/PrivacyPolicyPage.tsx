import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, FileText, Trash2, Download } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-sand-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8 bg-white p-6 sm:p-10 rounded-3xl border border-sand-200 shadow-card">
        {/* Navigation Back */}
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </Link>

        {/* Header */}
        <div className="space-y-3 border-b border-sand-200/80 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sand-100 text-stone-700 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5 text-stone-600" />
            <span>Documento Legal — Versión Borrador</span>
          </div>
          <h1 className="font-serif font-bold text-3xl text-stone-900">
            Política de Privacidad y Tratamiento de Datos
          </h1>
          <p className="text-xs text-stone-500 font-mono">
            Última actualización: 30 de septiembre de 2026 | Estado: Borrador para revisión legal
          </p>
        </div>

        {/* Notice for Legal Review */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
          <strong>Aviso de revisión legal obligatoria:</strong> Este documento establece las bases de arquitectura de privacidad bajo el RGPD (Reglamento General de Protección de Datos UE) y la normativa aplicable en España e Iberoamérica. Se encuentra estructurado para facilitar la auditoría de cumplimiento formal antes de la fase de cobro masivo.
        </div>

        {/* Body Content */}
        <div className="space-y-6 text-sm text-stone-700 leading-relaxed font-sans">
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-stone-700" />
              1. Privacidad Radical del Diario Personal
            </h2>
            <p>
              El diario personal de TRAVESÍA es estrictamente confidencial. En ningún caso tus notas de descarga emocional, reflexiones personales, confesiones o compromisos de acción serán:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-stone-600">
              <li>Accesibles por otros miembros de la comunidad.</li>
              <li>Visibles para administradores ni facilitadores en dashboards ordinarios.</li>
              <li>Utilizados para entrenar modelos públicos de inteligencia artificial.</li>
              <li>Compartidos con anunciantes ni comercializados con terceras partes.</li>
            </ul>
            <p className="text-xs text-stone-500 italic">
              La protección del diario está garantizada a nivel de infraestructura mediante políticas de Seguridad a Nivel de Fila (Row Level Security - RLS) en la base de datos PostgreSQL de Supabase.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-lg text-stone-900">
              2. Datos Recopilados y Finalidad
            </h2>
            <p>
              Recopilamos únicamente los datos necesarios para brindar la experiencia de acompañamiento, hábito y membresía:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-stone-600">
              <li><strong>Cuenta y Perfil:</strong> Nombre o alias, correo electrónico, fotografía voluntaria, bio y preferencias de notificación.</li>
              <li><strong>Membresía y Pagos:</strong> Estado de suscripción (TRIAL, ACTIVA, PAUSADA), gestionada de forma segura a través de pasarelas certificadas PCI-DSS.</li>
              <li><strong>Progreso y Racha:</strong> Días consecutivos de práctica completados, minutos de silencio y estado en el ciclo formativo de 4 semanas.</li>
              <li><strong>Comunidad y Eventos:</strong> Mensajes publicados voluntariamente en los canales públicos del santuario y registro a sesiones en directo por Zoom.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-lg text-stone-900">
              3. Proveedores de Infraestructura
            </h2>
            <p>
              Nuestra arquitectura técnica opera exclusivamente con proveedores de nivel industrial comprometidos con altos estándares de seguridad:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-stone-600">
              <li><strong>Vercel Inc.:</strong> Alojamiento de la aplicación web y entrega de contenido.</li>
              <li><strong>Supabase Inc.:</strong> Base de datos PostgreSQL, autenticación de usuarios y almacenamiento de archivos protegidos.</li>
              <li><strong>Zoom Video Communications:</strong> Transmisión en tiempo real de las sesiones grupales de silencio y reflexión matutina.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
              <Download className="w-4 h-4 text-stone-700" />
              4. Tus Derechos RGPD: Portabilidad y Supresión
            </h2>
            <p>
              Como usuario de TRAVESÍA, tienes pleno derecho a:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-stone-600">
              <li><strong>Exportar todos tus datos:</strong> Descargar una copia completa en formato JSON o texto legible de tus entradas de diario y perfil.</li>
              <li><strong>Derecho al olvido (Eliminación de cuenta):</strong> Solicitar la eliminación definitiva de tu usuario y todos sus registros asociados de la base de datos de producción.</li>
              <li><strong>Revocación de consentimiento:</strong> Cancelar suscripciones o desactivar notificaciones en cualquier instante desde tu panel de Ajustes.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-lg text-stone-900">
              5. Contacto del Delegado de Privacidad
            </h2>
            <p className="text-xs text-stone-600">
              Para ejercer cualquiera de tus derechos ARCO (Acceso, Rectificación, Cancelación y Oposición), puedes escribirnos directamente a: <span className="font-mono font-semibold text-stone-900">privacidad@travesia.app</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
