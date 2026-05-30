import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Landing from './pages/Landing.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Scanner from './pages/Scanner.jsx';
import ProductResult from './pages/ProductResult.jsx';
import Profile from './pages/Profile.jsx';

function ProtectedRoute({ children, requireOnboarding = true }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-shell">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (requireOnboarding && !user.onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  if (user?.onboardingComplete) return <Navigate to="/dashboard" replace />;
  if (user) return <Navigate to="/onboarding" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/auth"
        element={
          <PublicOnly>
            <AuthPage />
          </PublicOnly>
        }
      />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute requireOnboarding={false}>
            <Onboarding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/scan"
        element={
          <ProtectedRoute>
            <Scanner />
          </ProtectedRoute>
        }
      />
      <Route
        path="/product/:barcode"
        element={
          <ProtectedRoute>
            <ProductResult />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
