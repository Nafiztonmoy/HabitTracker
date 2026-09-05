import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AppNavbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Habits from "./pages/Habits";
import LifeImpact from "./pages/LifeImpact";
import Reports from "./pages/Reports";
import "./App.css";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="text-center mt-5 text-white">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const authCopy = {
  login: {
    kicker: "Welcome back",
    title: "Keep the rhythm going.",
    text: "Sign in, see today's habits, and continue from where you left off.",
  },
  register: {
    kicker: "Start simple",
    title: "Build a routine that lasts.",
    text: "Create your account and turn small repeatable actions into visible progress.",
  },
};

const AuthFrame = ({ mode, children }) => {
  const copy = authCopy[mode];
  const days = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <section className={`auth-shell auth-shell--${mode}`}>
      <div className="auth-visual" aria-hidden="true">
        <div className="auth-aura auth-aura-1" />
        <div className="auth-aura auth-aura-2" />

        <div className="auth-visual-copy">
          <span className="auth-kicker">{copy.kicker}</span>
          <h1>{copy.title}</h1>
          <p>{copy.text}</p>

          <div className="auth-rhythm">
            {days.map((day, index) => (
              <span className="auth-day" style={{ "--i": index }} key={`${day}-${index}`}>
                <i />
                {day}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-content">{children}</div>
      </div>
    </section>
  );
};

const protectedPage = (page) => <ProtectedRoute>{page}</ProtectedRoute>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-bg">
          <AppNavbar />
          <Routes>
            <Route
              path="/login"
              element={
                <AuthFrame mode="login">
                  <Login />
                </AuthFrame>
              }
            />
            <Route
              path="/register"
              element={
                <AuthFrame mode="register">
                  <Register />
                </AuthFrame>
              }
            />
            <Route path="/dashboard" element={protectedPage(<Dashboard />)} />
            <Route path="/habits" element={protectedPage(<Habits />)} />
            <Route path="/impact" element={protectedPage(<LifeImpact />)} />
            <Route path="/reports" element={protectedPage(<Reports />)} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
