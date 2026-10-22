import { lazy, Suspense, useContext } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate
} from "react-router-dom";

import { AuthProvider, AuthContext } from "./context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import EventsPage from "./pages/EventsPage";
import MyTicketsPage from "./pages/MyTicketsPage";

// Task 2: Lazy load the organizer panel
const OrganizerPanel = lazy(() => import("./pages/OrganizerPanel"));

function Navigation() {
  const { token, role, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="nav-brand">
        <Link to="/" className="brand-logo">
          <span className="brand-icon">🎟️</span> EventHub
        </Link>
        <span className="brand-tag">CHARUSAT AWDF</span>
      </div>

      <nav className="nav-links">
        <Link to="/" className="nav-link">Login</Link>
        <Link to="/events" className="nav-link">Events</Link>
        <Link to="/my-tickets" className="nav-link">My Tickets</Link>
        <Link to="/organizer" className="nav-link">
          Organizer {role === "organizer" && <span className="pill-dot"></span>}
        </Link>
      </nav>

      <div className="nav-actions">
        {token ? (
          <button onClick={handleLogout} className="btn btn-outline btn-sm">
            Logout
          </button>
        ) : (
          <Link to="/" className="btn btn-primary btn-sm">
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Navigation />

          <main className="main-content">
            <Suspense fallback={<p className="suspense-loader">Loading organizer panel...</p>}>
              <Routes>
                {/* 1. Public Login Route */}
                <Route path="/" element={<LoginPage />} />

                {/* 2. Protected Events Route */}
                <Route
                  path="/events"
                  element={
                    <ProtectedRoute>
                      <EventsPage />
                    </ProtectedRoute>
                  }
                />

                {/* 3. Protected My Tickets Route */}
                <Route
                  path="/my-tickets"
                  element={
                    <ProtectedRoute>
                      <MyTicketsPage />
                    </ProtectedRoute>
                  }
                />

                {/* 4. Protected Organizer Route (role-based) */}
                <Route
                  path="/organizer"
                  element={
                    <ProtectedRoute requiredRole="organizer">
                      <OrganizerPanel />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </main>

          <footer className="footer">
            <p>
              ITUE301: Advanced Web Development Frameworks (AWDF) Practical Exam — Set F &bull; EventHub Ticket Booking System
            </p>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
