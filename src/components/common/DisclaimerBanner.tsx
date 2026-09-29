import React, { useState } from 'react';
import { ShieldAlert, X, HeartHandshake } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <>
      <div className="bg-sand-100 border-b border-sand-200/80 px-4 py-2 text-xs text-stone-600 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-4xl mx-auto truncate">
          <ShieldAlert className="w-4 h-4 text-bronze-600 flex-shrink-0" />
          <span className="truncate">
            <strong className="font-semibold text-stone-800">Aviso Ético y de Bienestar:</strong> TRAVESÍA es una herramienta de reflexión personal y discernimiento espiritual. No sustituye la atención psicológica, médica o terapéutica profesional.
          </span>
          <button 
            onClick={() => setIsOpen(true)}
            className="text-bronze-700 underline font-medium hover:text-bronze-800 flex-shrink-0 ml-1"
          >
            Saber más
          </button>
        </div>
        <button 
          onClick={() => setIsDismissed(true)} 
          className="text-stone-400 hover:text-stone-600 p-1"
          title="Cerrar aviso"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-sand-200 animate-scale-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-bronze-50 flex items-center justify-center text-bronze-600">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-lg text-stone-900">Compromiso de Cuidado y Seguridad</h3>
                  <p className="text-xs text-stone-500">Orientación para tu bienestar interior</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-sand-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-stone-700 leading-relaxed">
              <p>
                <strong>TRAVESÍA</strong> está concebida como una disciplina formativa, educativa y espiritual para forjar el carácter, frenar la dispersión y ordenar los propósitos diarios.
              </p>
              <div className="p-3.5 bg-sand-50 rounded-xl border border-sand-200 text-xs text-stone-700 space-y-2">
                <p className="font-semibold text-stone-900">Límites explícitos de la plataforma:</p>
                <ul className="list-disc pl-4 space-y-1 text-stone-600">
                  <li>No realizamos diagnósticos clínicos de salud mental ni trastornos psiquiátricos.</li>
                  <li>Las sesiones de journaling no constituyen psicoterapia ni reemplazan medicamentos o intervenciones clínicas.</li>
                  <li>Si atraviesas una crisis aguda, depresión severa o pensamientos de autolesión, te instamos a contactar inmediatamente con servicios de salud mental acreditados o líneas de auxilio en tu país.</li>
                </ul>
              </div>
              <p className="text-xs text-stone-500 italic">
                Cuidar de tu mente y de tu espíritu también implica la humildad de buscar ayuda médica y profesional cuando la carga sobrepasa nuestras fuerzas.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setIsOpen(false)}
                className="travesia-btn-primary w-full sm:w-auto"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
