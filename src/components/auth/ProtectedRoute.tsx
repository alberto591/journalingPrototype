import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDataStore } from '../../lib/dataStore';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, currentUser, isLoading, isDemoMode } = useDataStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sand-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-stone-900 flex items-center justify-center text-sand-50 shadow-md animate-pulse">
          <svg className="w-6 h-6" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="9" stroke="#E7C8B6" strokeWidth="1.5" strokeDasharray="2 3" opacity="0.6"/>
            <path d="M16 7V25" stroke="#FAF4EF" strokeWidth="2" strokeLinecap="round"/>
            <path d="M10 16H22" stroke="#FAF4EF" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="16" cy="16" r="3" fill="#B66E43" />
          </svg>
        </div>
        <p className="mt-4 text-xs font-serif italic text-stone-500">Cargando santuario...</p>
      </div>
    );
  }

  // If not authenticated and not in demo bypass, redirect to login
  if (!isAuthenticated && !isDemoMode) {
    return <Navigate to={`/login?redirectTo=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // If admin is required and user is not admin
  if (requireAdmin && currentUser?.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-serif font-bold text-stone-900 mb-2">Acceso Reservado</h2>
        <p className="text-sm text-stone-600 max-w-md mb-6">
          Esta sección está reservada para el equipo de administración y facilitación de TRAVESÍA.
        </p>
        <Navigate to="/dashboard" replace />
      </div>
    );
  }

  return <>{children}</>;
};
