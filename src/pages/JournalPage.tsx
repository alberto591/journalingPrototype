import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { JournalWizard } from '../components/journal/JournalWizard';
import { JournalHistoryView } from '../components/journal/JournalHistoryView';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { PenLine, Calendar, Lock } from 'lucide-react';

export const JournalPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'today' | 'history'>(() => {
    return location.pathname.includes('history') ? 'history' : 'today';
  });

  useEffect(() => {
    if (location.pathname.includes('history')) {
      setActiveTab('history');
    } else if (location.pathname.includes('today')) {
      setActiveTab('today');
    }
  }, [location.pathname]);

  const handleTabChange = (tab: 'today' | 'history') => {
    setActiveTab(tab);
    if (tab === 'history') {
      navigate('/journal/history');
    } else {
      navigate('/journal');
    }
  };

  return (
    <ErrorBoundary
      fallbackTitle="Error al cargar el diario"
      fallbackDescription="No se pudo cargar la vista del diario. Hemos asegurado tus datos para que no se pierdan."
    >
      <div className="space-y-6 animate-fade-in">
        {/* Top Tab Bar */}
        <div className="flex items-center justify-between border-b border-sand-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTabChange('today')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'today'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-sand-100'
              }`}
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Práctica de Hoy (5 Movimientos)</span>
            </button>

            <button
              onClick={() => handleTabChange('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-sand-100'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Mi Archivo Privado</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-500 font-medium">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Privacidad Cifrada</span>
          </div>
        </div>

        {/* Main Tab Content */}
        {activeTab === 'today' ? (
          <JournalWizard />
        ) : (
          <JournalHistoryView />
        )}
      </div>
    </ErrorBoundary>
  );
};
