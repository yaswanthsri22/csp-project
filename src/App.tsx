import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import LandingPage from '@/components/LandingPage';
import AuthForm from '@/components/AuthForm';
import Dashboard from '@/components/Dashboard';
import EventDetail from '@/components/EventDetail';
import type { EventRow } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

type Page = 'landing' | 'login' | 'register' | 'dashboard' | 'event-detail';

function AppContent() {
  const { session, loading } = useAuth();
  const [page, setPage] = useState<Page>('landing');
  const [selectedEvent, setSelectedEvent] = useState<EventRow | null>(null);

  useEffect(() => {
    if (loading) return;
    if (session && (page === 'login' || page === 'register' || page === 'landing')) {
      setPage('dashboard');
    }
    if (!session && (page === 'dashboard' || page === 'event-detail')) {
      setPage('landing');
    }
  }, [session, loading, page]);

  const handleOpenEvent = (event: EventRow) => {
    setSelectedEvent(event);
    setPage('event-detail');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-maroon-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-saffron-400" />
      </div>
    );
  }

  switch (page) {
    case 'login':
      return <AuthForm mode="login" onNavigate={setPage} />;
    case 'register':
      return <AuthForm mode="register" onNavigate={setPage} />;
    case 'dashboard':
      return session ? <Dashboard onOpenEvent={handleOpenEvent} /> : <LandingPage onNavigate={setPage} />;
    case 'event-detail':
      return session && selectedEvent
        ? <EventDetail event={selectedEvent} onBack={() => setPage('dashboard')} />
        : <LandingPage onNavigate={setPage} />;
    default:
      return <LandingPage onNavigate={setPage} />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
