import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import BasicDashboard from './pages/BasicDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

export default function App() {
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

  // ─── Login Screen ─────────────────────────────────────────────────

  if (currentPath === '/forgot-password') {
    return <ForgotPasswordPage navigateTo={navigateTo} />;
  }

  if (currentPath.startsWith('/reset-password')) {
    return <ResetPasswordPage navigateTo={navigateTo} />;
  }

  if (!isAuthenticated) {
    return (
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
    );
  }

  // ─── Authenticated Layout ─────────────────────────────────────────

  return (
    <div className="container">
      <Header user={user!} isAdmin={isAdmin} isChoi={isChoi} onLogout={logout} />
      {isAdmin ? <AdminDashboard /> : <BasicDashboard />}
    </div>
  );
}
