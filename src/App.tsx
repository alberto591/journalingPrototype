import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { DataStoreProvider } from './lib/dataStore';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardPage } from './pages/DashboardPage';
import { CommunityPage } from './pages/CommunityPage';
import { JournalPage } from './pages/JournalPage';
import { FourWeekJourneyView } from './components/journey/FourWeekJourneyView';
import { EventsView } from './components/events/EventsView';
import { LessonsView } from './components/lessons/LessonsView';
import { LibraryView } from './components/library/LibraryView';
import { ArchiveView } from './components/archive/ArchiveView';
import { MembersView } from './components/members/MembersView';
import { ProgressView } from './components/progress/ProgressView';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LandingPage } from './pages/LandingPage';
import { FreeTrialPage } from './pages/FreeTrialPage';
import { PricingPage } from './pages/PricingPage';
import { ReferralHandlerPage } from './pages/ReferralHandlerPage';
import { FounderPage } from './pages/FounderPage';
import { LoginPage } from './pages/LoginPage';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { HealthCheckPage } from './pages/HealthCheckPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DataStoreProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Marketing & Growth Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/prueba" element={<FreeTrialPage />} />
            <Route path="/membership" element={<PricingPage />} />
            <Route path="/fundador" element={<FounderPage />} />
            <Route path="/r/:code" element={<ReferralHandlerPage />} />

            {/* Public Legal & Observability Routes */}
            <Route path="/health" element={<HealthCheckPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />

            {/* Standalone Auth & Onboarding */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<LoginPage />} />
            <Route path="/onboarding" element={<OnboardingWizard />} />

            {/* Member App Layout (Protected Sanctuary Shell) */}
            <Route 
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              
              {/* Community & Channels */}
              <Route path="community" element={<CommunityPage />} />
              <Route path="community/:channel" element={<CommunityPage />} />
              
              {/* Guided Journaling */}
              <Route path="journal" element={<JournalPage />} />
              <Route path="journal/today" element={<JournalPage />} />
              <Route path="journal/history" element={<JournalPage />} />

              {/* 4-Week Journey & Curriculum */}
              <Route path="journey" element={<FourWeekJourneyView />} />
              <Route path="journey/week/:week" element={<FourWeekJourneyView />} />
              
              {/* Events & Live Sessions */}
              <Route path="events" element={<EventsView />} />
              <Route path="events/:id" element={<EventsView />} />

              {/* Formación / Lecciones (Subordinadas dentro de El Camino) */}
              <Route path="lessons" element={<FourWeekJourneyView defaultTab="lessons" />} />
              <Route path="lessons/:id" element={<FourWeekJourneyView defaultTab="lessons" />} />

              {/* Resources, Books & Archive */}
              <Route path="library" element={<LibraryView />} />
              <Route path="archive" element={<ArchiveView />} />

              {/* Members & Progress */}
              <Route path="members" element={<MembersView />} />
              <Route path="members/:id" element={<MembersView />} />
              <Route path="progress" element={<ProgressView />} />

              {/* Profile & Settings */}
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<ProfilePage />} />

              {/* Admin Console (Strictly requires admin role) */}
              <Route 
                path="admin" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Catch-all within shell */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DataStoreProvider>
    </QueryClientProvider>
  );
}

export default App;
