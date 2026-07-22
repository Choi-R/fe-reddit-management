import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import LoginPage from './pages/LoginPage';
import BasicDashboard from './pages/BasicDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { AuthProvider } from './contexts/AuthContext';

function AppContent() {
  const { user, login, logout, isAuthenticated, isAdmin, isChoi } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Catch browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const isAdminRoute = currentPath.startsWith('/admin');

  // ─── Login & Auth Screens ─────────────────────────────────────────

  if (currentPath === '/forgot-password') {
    return (
      <div className="app-layout container">
        <main className="app-main">
          <ForgotPasswordPage navigateTo={navigateTo} />
        </main>
        <Footer />
      </div>
    );
  }

  if (currentPath.startsWith('/reset-password')) {
    return (
      <div className="app-layout container">
        <main className="app-main">
          <ResetPasswordPage navigateTo={navigateTo} />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="app-layout container">
        <main className="app-main">
          <LoginPage
            isAdminRoute={isAdminRoute}
            onLogin={async (email, password) => {
              const loggedInUser = await login(email, password);
              const hasAdminRights =
                loggedInUser.roles.includes('admin') || loggedInUser.roles.includes('choi');

              if (isAdminRoute && !hasAdminRights) {
                throw new Error('Access denied: Admin credentials required.');
              }
              if (!isAdminRoute && hasAdminRights) {
                throw new Error('Access denied: Please log in at the admin portal (/admin).');
              }

              navigateTo(hasAdminRights ? '/admin' : '/');
            }}
            onSwitchRoute={() => navigateTo(isAdminRoute ? '/' : '/admin')}
            onForgotPassword={() => navigateTo('/forgot-password')}
          />
        </main>
        <Footer />
      </div>
    );
  }

  // ─── Authenticated Layout ─────────────────────────────────────────

  return (
    <div className="app-layout container">
      <Header user={user!} isAdmin={isAdmin} isChoi={isChoi} onLogout={logout} />
      <main className="app-main">
        {isAdmin ? <AdminDashboard /> : <BasicDashboard />}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
