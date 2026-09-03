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
  PiUserBold,
  PiUserPlusBold,
  PiWarningCircleBold,
} from "react-icons/pi";

const Register = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.register(formData);
      const { token, name, email } = response.data;
      login(token, { name, email });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
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
            <h2 className="auth-title">Create your account</h2>
          </div>
        </div>
        <p className="auth-sub">Start with one routine. Build consistency from there.</p>

        {error && (
          <Alert variant="danger" className="auth-alert" aria-live="polite">
            <PiWarningCircleBold aria-hidden="true" />
            <span>{error}</span>
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="auth-field">
            <Form.Label>Full name</Form.Label>
            <div className="auth-input-wrap">
              <PiUserBold className="auth-input-icon" aria-hidden="true" />
              <Form.Control
                className="auth-input"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Your full name"
              />
            </div>
          </Form.Group>

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
                autoComplete="new-password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                placeholder="Create a password"
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
            <div className="auth-helper">Use at least 6 characters.</div>
          </Form.Group>

          <Button type="submit" className="auth-submit" disabled={loading}>
            <PiUserPlusBold aria-hidden="true" />
            <span>{loading ? "Creating account..." : "Create account"}</span>
          </Button>
        </Form>

        <SocialAuthButtons onError={setError} disabled={loading} />

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
