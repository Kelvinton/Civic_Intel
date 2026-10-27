
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import ScrollToTop from "./components/ScrollToTop.jsx";

import Layout from "./components/layout/Layout.jsx";
import Home from "./pages/Home.jsx";
import Health from "./pages/Health.jsx";
import Education from "./pages/Education.jsx";
import States from "./pages/States.jsx";
import StateDetails from "./pages/StatesDetail.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import Explore from "./pages/Explore.jsx";
import CompareResults from "./pages/CompareResults.jsx";
import SourcesAndMethods from "./pages/SourceAndMethods.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import Media from "./pages/Media.jsx";
import Account from "./pages/Account.jsx";

// Protect only routes that require authentication.
function RequireAuth() {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[#0B3C5D]">
        Checking your session...
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
          message: "Please log in to use this feature.",
        }}
      />
    );
  }

  return <Outlet />;
}

function AppContent() {
  const { isLoggedIn, loading, login, signup, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[#0B3C5D]">
        Checking your session...
      </div>
    );
  }

  return (
    <Routes>
      {/* Authentication pages */}
      <Route
        path="/login"
        element={
          isLoggedIn ? (
            <Navigate to="/" replace />
          ) : (
            <AuthPage onLogin={login} onSignup={signup} />
          )
        }
      />

      <Route
        path="/signup"
        element={
          isLoggedIn ? (
            <Navigate to="/" replace />
          ) : (
            <AuthPage onLogin={login} onSignup={signup} />
          )
        }
      />

      <Route
        path="/forgot-password"
        element={<Navigate to="/login" replace />}
      />

      {/* Public platform pages */}
      <Route
        element={
          <Layout
            isLoggedIn={isLoggedIn}
            onLogout={logout}
          />
        }
      >

        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Account />} />
        <Route path="/health" element={<Health />} />
        <Route path="/education" element={<Education />} />
        <Route path="/states" element={<States />} />
        <Route
          path="/states/:stateSlug"
          element={<StateDetails />}
        />
        <Route path="/explore" element={<Explore />} />
        
        <Route
          path="/compare-results"
          element={<CompareResults />}
        />

        <Route
          path="/sources-and-methods"
          element={<SourcesAndMethods />}
        />

        <Route
          path="/media"
          element={<Media />}
        />
        
      </Route>
      
      
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppContent />
    </BrowserRouter>
  );
}
