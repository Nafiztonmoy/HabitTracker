import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  PiChartLineUpBold,
  PiCheckSquareBold,
  PiFlameBold,
  PiHouseBold,
  PiPiggyBankBold,
  PiSignOutBold,
  PiSunBold,
  PiMoonBold,
  PiUserBold,
} from "react-icons/pi";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: PiHouseBold },
  { to: "/habits", label: "Habits", icon: PiCheckSquareBold },
  { to: "/impact", label: "Life ROI", icon: PiPiggyBankBold },
  { to: "/reports", label: "Reports", icon: PiChartLineUpBold },
];

const AppNavbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthRoute = ["/login", "/register"].includes(location.pathname);

  const [theme, setTheme] = useState(() => localStorage.getItem("habit_theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("habit_theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((current) => (current === "light" ? "dark" : "light"));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isDark = theme === "dark";

  return (
    <nav className={`glass-navbar app-product-nav ${isAuthRoute ? "glass-navbar--auth" : ""}`}>
      <Container style={{ maxWidth: "1240px" }}>
        <div className="navbar-flex-row product-navbar-row">
          <Link to="/dashboard" className="navbar-brand-glass">
            <div className="brand-logo-gradient"><PiFlameBold /></div>
            <span className="brand-name">Habit Architecture</span>
          </Link>

          {isAuthenticated && !isAuthRoute && (
            <div className="product-nav-links" aria-label="Main navigation">
              {navItems.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`product-nav-link ${location.pathname === to ? "active" : ""}`}
                >
                  <Icon />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          )}

          <div className="navbar-right-controls product-nav-controls">
            <button
              onClick={toggleTheme}
              className="btn-theme-glass"
              title={`Switch to ${isDark ? "light" : "dark"} mode`}
              aria-label="Toggle light and dark mode"
            >
              {isDark ? <PiSunBold className="icon-sun" /> : <PiMoonBold className="icon-moon" />}
            </button>

            {isAuthenticated ? (
              <>
                <div className="user-glass-pill product-user-pill">
                  <div className="user-avatar-gradient"><PiUserBold /></div>
                  <span className="user-name-text">{user?.name || user?.email || "User"}</span>
                </div>

                <button onClick={handleLogout} className="btn-logout-glass product-logout-button" aria-label="Log out">
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
