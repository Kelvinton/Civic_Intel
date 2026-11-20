import { useEffect, useRef } from "react";
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
import Governance from "./pages/Governance.jsx";
import States from "./pages/States.jsx";
import StateDetails from "./pages/StatesDetail.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import Explore from "./pages/Explore.jsx";
import CompareResults from "./pages/CompareResults.jsx";
import SourcesAndMethods from "./pages/SourceAndMethods.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import Media from "./pages/Media.jsx";
import MediaDetails from "./pages/MediaDetails.jsx";
import Account from "./pages/Account.jsx";
import FAQ from "./pages/FAQ.jsx";
import VoterEducation from "./pages/VoterEducation.jsx";

import AdminLayout from "./components/admin/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminDataIngest from "./pages/admin/AdminDataIngest.jsx";
import AdminDatasetUpload from "./pages/admin/AdminDatasetUpload.jsx";
import AdminDatasetMetadata from "./pages/admin/AdminDatasetMetadata.jsx";
import AdminDatasetPreview from "./pages/admin/AdminDatasetPreview.jsx";

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

// Protect routes that require administrator access.
function RequireAdmin() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[#0B3C5D]">
        Checking administrator access...
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function AppContent() {
  const { isLoggedIn, login, signup, logout } = useAuth();
  const location = useLocation();

  const previousPath = useRef(location.pathname);

  useEffect(() => {
    const previous = previousPath.current;

    if (previous === "/health" && location.pathname !== "/health") {
      sessionStorage.removeItem("civicintel_health_filters");
    }

    if (
      previous === "/education" &&
      location.pathname !== "/education"
    ) {
      sessionStorage.removeItem("civicintel_education_filters");
    }

    if (
      previous === "/governance" &&
      location.pathname !== "/governance"
    ) {
      sessionStorage.removeItem("civicintel_governance_filters");
    }

    previousPath.current = location.pathname;
  }, [location.pathname]);

  return (
    <Routes>
      {/* Authentication pages */}
      <Route
        path="/login"
        element={
          <AuthPage
            mode="login"
            isLoggedIn={isLoggedIn}
            onLogin={login}
            onSignup={signup}
          />
        }
      />

      <Route
        path="/signup"
        element={
          <AuthPage
            mode="signup"
            isLoggedIn={isLoggedIn}
            onLogin={login}
            onSignup={signup}
          />
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

        <Route path="/governance" element={<Governance />} />

        <Route
          path="/media"
          element={<Media />}
        />

        <Route 
          path="/faq" 
          element={<FAQ />} 
        />

        <Route
          path="/voter-education"
          element={<VoterEducation />}
        />

        <Route
          path="/media/:mediaId"
          element={<MediaDetails />}
        />
        
      </Route>

      
      {/* Administration Routes */}
      <Route
        path="/admin-preview"
        element={<AdminLayout />}
      >
        <Route index element={<AdminDashboard />} />
        <Route path="data" element={<AdminDataIngest />} />
      </Route>

      <Route element={<RequireAdmin />}>
        <Route path="/admin-preview" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="data" element={<AdminDataIngest />} />
          <Route path="upload" element={<AdminDatasetUpload />} />
          <Route path="upload/metadata" element={<AdminDatasetMetadata />} />
          <Route path="upload/preview" element={<AdminDatasetPreview />} />
        </Route>
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
