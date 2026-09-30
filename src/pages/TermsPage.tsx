import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Scale, AlertCircle } from 'lucide-react';

export const TermsPage: React.FC = () => {
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
            <Scale className="w-3.5 h-3.5 text-stone-600" />
            <span>Condiciones de Uso — Versión Borrador</span>
          </div>
          <h1 className="font-serif font-bold text-3xl text-stone-900">
            Términos y Condiciones del Servicio
          </h1>
          <p className="text-xs text-stone-500 font-mono">
            Última actualización: 30 de septiembre de 2026 | Estado: Borrador para revisión legal
          </p>
        </div>

        {/* Notice for Legal Review */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
          <strong>Aviso de revisión legal obligatoria:</strong> Estos términos regulan el acceso a la plataforma digital TRAVESÍA, su comunidad y los servicios de acompañamiento en directo. Su redacción está sujeta a adaptación conforme a la legislación mercantil y de defensa del consumidor en cada jurisdicción.
        </div>

        {/* Body Content */}
        <div className="space-y-6 text-sm text-stone-700 leading-relaxed font-sans">
          <section className="space-y-2">
            <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-stone-700" />
              1. Naturaleza del Servicio y Santuario Digital
            </h2>
            <p>
              TRAVESÍA es un entorno guiado de introspección, journaling estructurado de 5 movimientos y sesiones de enfoque matutino grupal.
            </p>
            <div className="p-3 bg-sand-100/60 rounded-xl text-xs text-stone-700 border border-sand-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-stone-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Descargo de salud y acompañamiento:</strong> TRAVESÍA no presta asesoramiento médico, psicológico, psiquiátrico ni legal. El diario y los encuentros facilitados no sustituyen en ningún caso el diagnóstico ni la intervención de un profesional sanitario titulado.
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-lg text-stone-900">
              2. Membresías, Cuotas y Cancelaciones
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-xs text-stone-600">
              <li><strong>Periodo de Prueba (7 Días):</strong> El usuario dispone de 7 días continuos para experimentar el método y las sesiones diarias sin compromiso inicial de permanencia.</li>
              <li><strong>Membresía Fundadora / Estándar:</strong> El acceso continuado al archivo de grabaciones, formación avanzada y comunidad requiere una suscripción activa con renovación mensual o anual recurrente.</li>
              <li><strong>Cancelación sin penalizaciones:</strong> El usuario puede cancelar su membresía en cualquier momento. El acceso persistirá hasta el final del ciclo de facturación pagado en curso.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-lg text-stone-900">
              3. Reglas de Convivencia en la Comunidad
            </h2>
            <p>
              Para mantener el santuario libre de ruido, polarización y juicios, los miembros se comprometen a:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-stone-600">
              <li>Respetar la confidencialidad de lo compartido por otros compañeros en directos o canales.</li>
              <li>No realizar proselitismo, spam publicitario ni captación de clientes en los canales.</li>
              <li>Mantener un lenguaje constructivo, honesto y libre de agresividad verbal o descalificaciones.</li>
            </ul>
            <p className="text-xs text-stone-500 italic">
              El equipo de facilitación se reserva el derecho de suspender o revocar el acceso de cualquier participante que incumpla reiteradamente estas normas de respeto básico.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-lg text-stone-900">
              4. Propiedad Intelectual y Grabaciones
            </h2>
            <p className="text-xs text-stone-600">
              El contenido formativo, textos de prompts, método de 5 movimientos y el archivo de grabaciones son propiedad de TRAVESÍA. El usuario recibe una licencia personal, intransferible y no exclusiva de visualización para su propio crecimiento personal. Queda prohibida la redistribución, copia o descarga no autorizada de las grabaciones del archivo.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif font-bold text-lg text-stone-900">
              5. Legislación Aplicable
            </h2>
            <p className="text-xs text-stone-600">
              Para cualquier controversia, las partes se someterán a la legislación aplicable y a los juzgados competentes según la normativa de consumidores. Consultas y notificaciones: <span className="font-mono font-semibold text-stone-900">hola@travesia.app</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
