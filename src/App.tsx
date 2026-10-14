import React, { useState, useEffect } from 'react';
import { ToastProvider, useToast } from './components/common/Toast.tsx';
import { Navbar } from './components/common/Navbar.tsx';
import { Sidebar } from './components/common/Sidebar.tsx';
import { LandingPage } from './components/landing/LandingPage.tsx';
import { LoginPage, SignupPage, ForgotPasswordPage, LegalPage } from './components/auth/AuthPages.tsx';
import { DashboardView } from './components/dashboard/DashboardView.tsx';
import { PlannerView } from './components/planner/PlannerView.tsx';
import { LibraryView } from './components/decks/LibraryView.tsx';
import { DeckDetailView } from './components/decks/DeckDetailView.tsx';
import { AdaptiveQuizView } from './components/quiz/AdaptiveQuizView.tsx';
import { ProgressView } from './components/progress/ProgressView.tsx';
import { RemindersView } from './components/reminders/RemindersView.tsx';
import { SettingsView } from './components/settings/SettingsView.tsx';
import { SharedDeckView } from './components/decks/SharedDeckView.tsx';
import { DeckGeneratorModal } from './components/decks/DeckGeneratorModal.tsx';
import { CreateExamModal } from './components/planner/CreateExamModal.tsx';
import { api } from './api/client.ts';
import { Loader2 } from 'lucide-react';

function MainApp() {
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Simple client-side routing based on window.location.pathname / hash
  const getInitialRoute = () => {
    const path = window.location.pathname;
    if (path.startsWith('/share/')) return path;
    if (path === '/login' || path === '/signup' || path === '/forgot-password' || path === '/privacy' || path === '/terms') {
      return path;
    }
    // Default to app dashboard if user logged in, or landing page if not
    return path.startsWith('/app') ? path : '/';
  };

  const [currentRoute, setCurrentRoute] = useState<string>(getInitialRoute);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [createExamModalOpen, setCreateExamModalOpen] = useState(false);

  // Streak state
  const [streakCount, setStreakCount] = useState<number>(0);
  const [activeDeckId, setActiveDeckId] = useState<string>('deck_demo_distributed_sys');

  // Sync URL history state
  const navigate = (newRoute: string) => {
    window.history.pushState(null, '', newRoute);
    setCurrentRoute(newRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Check initial user authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setCheckingAuth(true);
        const res = await api.auth.me();
        if (res.success && res.user) {
          setCurrentUser(res.user);
          setStreakCount(res.user.streak?.currentStreak || 0);
        }
      } catch (err) {
        console.warn('Initial session check notice:', err);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await api.auth.logout();
      setCurrentUser(null);
      showToast('Logged out successfully.');
      navigate('/');
    } catch (err: any) {
      showToast('Logout error: ' + err.message, 'error');
    }
  };

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    navigate('/app/dashboard');
  };

  const handleQuickDemoLogin = async () => {
    try {
      const res = await api.auth.login({
        email: 'alex@studyloop.edu',
        password: 'studyloop123',
      });
      if (res.success && res.user) {
        setCurrentUser(res.user);
        showToast('Demo workspace loaded!');
        navigate('/app/dashboard');
      }
    } catch (err: any) {
      showToast('Demo login notice: ' + err.message, 'error');
      navigate('/login');
    }
  };

  const handleDeckCreated = (newDeck: any) => {
    setActiveDeckId(newDeck.id);
    navigate(`/app/decks/${newDeck.id}`);
  };

  const handleExamCreated = (newExam: any) => {
    navigate('/app/planner');
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center select-none">
        <div className="flex flex-col items-center gap-2 text-[#778196]">
          <Loader2 className="w-8 h-8 animate-spin text-[#6857E8]" />
          <span className="text-xs font-semibold">Starting Study Loop...</span>
        </div>
      </div>
    );
  }

  // --- Route 1: Public Share View (/share/:shareToken) ---
  if (currentRoute.startsWith('/share/')) {
    const shareToken = currentRoute.replace('/share/', '');
    return <SharedDeckView shareToken={shareToken} onNavigate={navigate} />;
  }

  // --- Route 2: Public Legal Pages ---
  if (currentRoute === '/privacy') {
    return <LegalPage type="privacy" onNavigate={navigate} />;
  }
  if (currentRoute === '/terms') {
    return <LegalPage type="terms" onNavigate={navigate} />;
  }

  // --- Route 3: Auth Pages ---
  if (currentRoute === '/login') {
    return <LoginPage onNavigate={navigate} onSuccess={handleLoginSuccess} />;
  }
  if (currentRoute === '/signup') {
    return <SignupPage onNavigate={navigate} onSuccess={handleLoginSuccess} />;
  }
  if (currentRoute === '/forgot-password') {
    return <ForgotPasswordPage onNavigate={navigate} />;
  }

  // --- Route 4: Landing Page ---
  if (currentRoute === '/' && !currentUser) {
    return <LandingPage onNavigate={navigate} onQuickDemoLogin={handleQuickDemoLogin} />;
  }

  // --- Authenticated Layout & Protected App Routes ---
  // If not logged in and requesting /app/*, redirect to login
  if (!currentUser && currentRoute.startsWith('/app')) {
    return <LoginPage onNavigate={navigate} onSuccess={handleLoginSuccess} />;
  }

  // Render Authenticated Shell
  const renderAppContent = () => {
    // 1. Single Deck Detail View
    if (currentRoute.startsWith('/app/decks/')) {
      const deckId = currentRoute.replace('/app/decks/', '');
      return (
        <DeckDetailView
          deckId={deckId}
          onNavigate={navigate}
          onBack={() => navigate('/app/library')}
        />
      );
    }

    // 2. Adaptive Quiz View
    if (currentRoute.startsWith('/app/quiz/')) {
      const deckId = currentRoute.replace('/app/quiz/', '');
      return (
        <AdaptiveQuizView
          deckId={deckId}
          onNavigate={navigate}
          onBack={() => navigate(`/app/decks/${deckId}`)}
        />
      );
    }
    if (currentRoute === '/app/quiz') {
      // Default to active or demo deck
      return (
        <AdaptiveQuizView
          deckId={activeDeckId}
          onNavigate={navigate}
          onBack={() => navigate('/app/library')}
        />
      );
    }

    // 3. Study Planner
    if (currentRoute.startsWith('/app/planner')) {
      return (
        <PlannerView
          onOpenCreateExam={() => setCreateExamModalOpen(true)}
        />
      );
    }

    // 4. Notes & Decks Library
    if (currentRoute.startsWith('/app/library')) {
      return (
        <LibraryView
          onNavigate={navigate}
          onOpenUpload={() => setUploadModalOpen(true)}
        />
      );
    }

    // 5. Progress Analytics
    if (currentRoute.startsWith('/app/progress')) {
      return <ProgressView onNavigate={navigate} />;
    }

    // 6. Reminders & Streaks
    if (currentRoute.startsWith('/app/reminders')) {
      return <RemindersView />;
    }

    // 7. Settings
    if (currentRoute.startsWith('/app/settings')) {
      return (
        <SettingsView
          user={currentUser}
          onUserUpdated={u => setCurrentUser(u)}
          onLogout={handleLogout}
        />
      );
    }

    // Default: Dashboard Overview
    return (
      <DashboardView
        onNavigate={navigate}
        onOpenUpload={() => setUploadModalOpen(true)}
        onOpenCreateExam={() => setCreateExamModalOpen(true)}
        user={currentUser}
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col">
      {/* Top Navbar */}
      <Navbar
        user={currentUser}
        streakCount={streakCount}
        onOpenUpload={() => setUploadModalOpen(true)}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
        onLogout={handleLogout}
        onNavigate={navigate}
        currentRoute={currentRoute}
      />

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          currentRoute={currentRoute}
          onNavigate={navigate}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          streakCount={streakCount}
          activeDeckId={activeDeckId}
        />

        <main className="flex-1 overflow-x-hidden min-h-[calc(100vh-61px)]">
          {renderAppContent()}
        </main>
      </div>

      {/* Modals */}
      <DeckGeneratorModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onDeckCreated={handleDeckCreated}
      />

      <CreateExamModal
        isOpen={createExamModalOpen}
        onClose={() => setCreateExamModalOpen(false)}
        onExamCreated={handleExamCreated}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
