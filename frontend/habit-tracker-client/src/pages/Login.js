import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import SocialAuthButtons from "../components/SocialAuthButtons";
import {
  PiEnvelopeSimpleBold,
  PiEyeBold,
  PiEyeSlashBold,
  PiFlameBold,
  PiLockKeyBold,
  PiSignInBold,
  PiWarningCircleBold,
} from "react-icons/pi";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authAPI.login(formData);
      const { token, name, email } = response.data;
      login(token, { name, email });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials provided.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-form-head">
          <div className="auth-icon-wrapper" aria-hidden="true">
            <PiFlameBold className="auth-brand-icon" />
          </div>
          <div>
            <span className="auth-form-kicker">Habit Architecture</span>
            <h2 className="auth-title">Welcome back</h2>
          </div>
        </div>
        <p className="auth-sub">Sign in to continue your routines and keep your momentum visible.</p>

        {error && (
          <Alert variant="danger" className="auth-alert" aria-live="polite">
            <PiWarningCircleBold aria-hidden="true" />
            <span>{error}</span>
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="auth-field">
            <Form.Label>Email address</Form.Label>
            <div className="auth-input-wrap">
              <PiEnvelopeSimpleBold className="auth-input-icon" aria-hidden="true" />
              <Form.Control
                className="auth-input"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="name@example.com"
              />
            </div>
          </Form.Group>

          <Form.Group className="auth-field">
            <Form.Label>Password</Form.Label>
            <div className="auth-input-wrap">
              <PiLockKeyBold className="auth-input-icon" aria-hidden="true" />
              <Form.Control
                className="auth-input auth-input-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <PiEyeSlashBold /> : <PiEyeBold />}
              </button>
            </div>
          </Form.Group>

          <Button type="submit" className="auth-submit" disabled={loading}>
            <PiSignInBold aria-hidden="true" />
            <span>{loading ? "Signing in..." : "Sign in"}</span>
          </Button>
        </Form>

        <SocialAuthButtons onError={setError} disabled={loading} />

        <div className="auth-footer">
          New here? <Link to="/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
