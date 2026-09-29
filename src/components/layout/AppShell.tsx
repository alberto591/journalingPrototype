import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { RightSidebar } from './RightSidebar';
import { MobileNav } from './MobileNav';
import { DisclaimerBanner } from '../common/DisclaimerBanner';

export const AppShell: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Pages that display the right sidebar
  const showRightSidebar = 
    location.pathname === '/dashboard' || 
    location.pathname === '/' || 
    location.pathname.startsWith('/community');

  return (
    <div className="min-h-screen bg-sand-50 text-stone-900 flex flex-col font-sans">
      {/* 1. Global Ethical & Health Disclaimer Banner */}
      <DisclaimerBanner />

      <div className="flex-1 flex overflow-hidden h-[calc(100vh-37px)]">
        {/* 2. Desktop Left Sidebar */}
        <div className="hidden lg:block h-full flex-shrink-0">
          <Sidebar />
        </div>

        {/* 3. Mobile Sidebar Drawer */}
        {isMobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            {/* Drawer */}
            <div className="relative z-10 w-72 h-full bg-sand-50 shadow-2xl animate-slide-right flex flex-col">
              <Sidebar onCloseMobile={() => setIsMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* 4. Center Main Column (Header + Scrollable Outlet) */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />
          
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 pb-24 lg:pb-8">
            <div className="max-w-5xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>

        {/* 5. Desktop Right Column */}
        {showRightSidebar && (
          <div className="hidden xl:block h-full flex-shrink-0 border-l border-sand-200/80 bg-sand-50/50">
            <RightSidebar />
          </div>
        )}
      </div>

      {/* 6. Mobile Bottom Nav */}
      <MobileNav />
    </div>
  );
};
