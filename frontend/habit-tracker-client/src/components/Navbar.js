import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  PiFlameBold,
  PiSignOutBold,
  PiSunBold,
  PiMoonBold,
  PiUserBold,
} from "react-icons/pi";

const AppNavbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthRoute = ["/login", "/register"].includes(location.pathname);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("habit_theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("habit_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isDark = theme === "dark";

  return (
    <nav className={`glass-navbar ${isAuthRoute ? "glass-navbar--auth" : ""}`}>
      <Container style={{ maxWidth: "1160px" }}>
        <div className="navbar-flex-row">
          <Link to="/" className="navbar-brand-glass">
            <div className="brand-logo-gradient">
              <PiFlameBold />
            </div>
            <span className="brand-name">Habit Architecture</span>
          </Link>

          <div className="navbar-right-controls">
            <button
              onClick={toggleTheme}
              className="btn-theme-glass"
              title={`Switch to ${isDark ? "Bright" : "Dark"} Mode`}
              aria-label="Toggle dark and bright mode"
            >
              {isDark ? <PiSunBold className="icon-sun" /> : <PiMoonBold className="icon-moon" />}
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`nav-link-glass ${location.pathname === "/dashboard" ? "active" : ""}`}
                >
                  Dashboard
                </Link>

                <div className="user-glass-pill">
                  <div className="user-avatar-gradient">
                    <PiUserBold />
                  </div>
                  <span className="user-name-text">
                    {user?.name || user?.email || "User"}
                  </span>
                </div>

                <button onClick={handleLogout} className="btn-logout-glass">
                  <PiSignOutBold />
                  <span>Logout</span>
                </button>
              </>
            ) : !isAuthRoute ? (
              <>
                <Link to="/login" className="nav-link-glass">Log in</Link>
                <Link to="/register" className="btn-cta-gradient">Get Started</Link>
              </>
            ) : null}
          </div>
        </div>
      </Container>
    </nav>
  );
};

export default AppNavbar;
