// ============================================================
// GramSahay — Main App Router
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from '@/contexts/FirebaseAuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Footer from '@/components/Footer';

// Pages
import LandingPage from '@/pages/LandingPage';
import SignInPage from '@/pages/SignInPage';
import SignUpPage from '@/pages/SignUpPage';
import CommunityDashboard from '@/pages/CommunityDashboard';
import ReportIssue from '@/pages/ReportIssue';
import IssueFeed from '@/pages/IssueFeed';
import IssueDetail from '@/pages/IssueDetail';
import CommunityMap from '@/pages/CommunityMap';
import CommunityAnalytics from '@/pages/CommunityAnalytics';
import LeaderboardPage from '@/pages/LeaderboardPage';
import AIAssistant from '@/pages/AIAssistant';
import NotFound from '@/pages/NotFound';
// Keep the government schemes page — it's relevant
import Government from '@/pages/Government';

// ── Protected Route wrapper ──────────────────────────────────

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06060a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
}

// ── App ──────────────────────────────────────────────────────

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/government" element={<Government />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><CommunityDashboard /></ProtectedRoute>} />
      <Route path="/report" element={<ProtectedRoute><ReportIssue /></ProtectedRoute>} />
      <Route path="/issues" element={<ProtectedRoute><IssueFeed /></ProtectedRoute>} />
      <Route path="/issues/:id" element={<ProtectedRoute><IssueDetail /></ProtectedRoute>} />
      <Route path="/community-map" element={<ProtectedRoute><CommunityMap /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><CommunityAnalytics /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
      <Route path="/assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <div className="flex flex-col min-h-screen w-full">
            <AppRoutes />
            <Footer />
          </div>
          <Toaster />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
