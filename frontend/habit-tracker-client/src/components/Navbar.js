import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  PiChartLineUpBold,
  PiCheckSquareBold,
  PiClockBold,
  PiFlameBold,
  PiHouseBold,
  PiListBold,
  PiMoonBold,
  PiPiggyBankBold,
  PiSignOutBold,
  PiSunBold,
  PiTargetBold,
  PiUserBold,
  PiXBold,
} from "react-icons/pi";

import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: PiHouseBold },
  { to: "/habits", label: "Habits", icon: PiCheckSquareBold },
  { to: "/impact", label: "Life ROI", icon: PiPiggyBankBold },
  { to: "/goals", label: "Goals", icon: PiTargetBold },
  { to: "/future-me", label: "Future", icon: PiClockBold },
  { to: "/reports", label: "Reports", icon: PiChartLineUpBold },
];

const AppNavbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("habit_theme") || "light"
  );

  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("habit_theme", theme);
  }, [theme]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <nav className={`cadence-nav ${isAuthPage ? "cadence-nav-auth" : ""}`}>
      <Container className="cadence-nav-container">
        <div className="cadence-nav-row">
          <Link
            to="/dashboard"
            className="cadence-nav-brand"
            onClick={() => setMenuOpen(false)}
          >
            <span className="cadence-nav-logo" aria-hidden="true">
              <PiFlameBold />
            </span>
            <span className="cadence-nav-name">Cadence</span>
          </Link>

          {isAuthenticated && !isAuthPage ? (
            <div className="cadence-nav-desktop" aria-label="Main navigation">
              {navItems.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`cadence-nav-link ${
                    location.pathname === to ? "active" : ""
                  }`}
                >
                  <Icon aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div />
          )}

          <div className="cadence-nav-actions">
            <button
              type="button"
              className="cadence-nav-icon-button"
              onClick={toggleTheme}
              aria-label="Toggle light and dark mode"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <PiSunBold /> : <PiMoonBold />}
            </button>

            {isAuthenticated ? (
              <>
                <div className="cadence-nav-user">
                  <span className="cadence-nav-avatar" aria-hidden="true">
                    <PiUserBold />
                  </span>
                  <span className="cadence-nav-user-name">
                    {user?.name || user?.email || "User"}
                  </span>
                </div>

                <button
                  type="button"
                  className="cadence-nav-logout"
                  onClick={handleLogout}
                >
                  <PiSignOutBold aria-hidden="true" />
                  <span>Logout</span>
                </button>

                {!isAuthPage && (
                  <button
                    type="button"
                    className="cadence-nav-menu-button"
                    onClick={() => setMenuOpen((current) => !current)}
                    aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={menuOpen}
                    aria-controls="cadence-responsive-menu"
                  >
                    {menuOpen ? <PiXBold /> : <PiListBold />}
                  </button>
                )}
              </>
            ) : !isAuthPage ? (
              <>
                <Link to="/login" className="nav-link-glass">
                  Log in
                </Link>
                <Link to="/register" className="btn-cta-gradient">
                  Get Started
                </Link>
              </>
            ) : null}
          </div>
        </div>

        {isAuthenticated && !isAuthPage && (
          <div
            id="cadence-responsive-menu"
            className={`cadence-responsive-menu ${menuOpen ? "open" : ""}`}
          >
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`cadence-responsive-menu-link ${
                  location.pathname === to ? "active" : ""
                }`}
              >
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </Link>
            ))}

            <button
              type="button"
              className="cadence-responsive-menu-logout"
              onClick={handleLogout}
            >
              <PiSignOutBold aria-hidden="true" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </Container>
    </nav>
  );
};

export default AppNavbar;
