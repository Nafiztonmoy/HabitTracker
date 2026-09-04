import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";

const GOOGLE_SCRIPT =
  "https://accounts.google.com/gsi/client";

const loadScript = (src, id, readyCheck) =>
  new Promise((resolve, reject) => {
    if (readyCheck?.()) {
      resolve();
      return;
    }

    const existing = document.getElementById(id);

    if (existing) {
      if (
        existing.dataset.loaded === "true" ||
        readyCheck?.()
      ) {
        resolve();
        return;
      }

      existing.addEventListener(
        "load",
        resolve,
        { once: true }
      );

      existing.addEventListener(
        "error",
        reject,
        { once: true }
      );

      return;
    }

    const script = document.createElement("script");

    script.id = id;
    script.src = src;
    script.async = true;
    script.defer = true;

    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true }
    );

    script.addEventListener(
      "error",
      reject,
      { once: true }
    );

    document.head.appendChild(script);
  });

const SocialAuthButtons = ({
  onError,
  disabled = false,
}) => {
  const googleCodeClientRef = useRef(null);

  const [googleReady, setGoogleReady] = useState(false);
  const [providerLoading, setProviderLoading] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const googleClientId =
    process.env.REACT_APP_GOOGLE_CLIENT_ID?.trim();

  const googleEnabled =
    Boolean(googleClientId) &&
    googleClientId !== "your-google-client-id";

  const finishAuth = useCallback(
    (response) => {
      const { token, name, email } = response.data;

      login(token, {
        name,
        email,
      });

      navigate("/dashboard");
    },
    [login, navigate]
  );

  const exchangeCredential = useCallback(
    async (credential) => {
      if (!credential || disabled) return;

      setProviderLoading("google");
      onError?.("");

      try {
        const response = await authAPI.google({
          credential,
        });

        finishAuth(response);
      } catch (error) {
        console.error(
          "Google authentication failed:",
          error
        );

        onError?.(
          error.response?.data?.message ||
            "Google sign-in could not be completed."
        );
      } finally {
        setProviderLoading("");
      }
    },
    [disabled, finishAuth, onError]
  );

  useEffect(() => {
    if (!googleEnabled) {
      setGoogleReady(false);
      return undefined;
    }

    let cancelled = false;

    loadScript(
      GOOGLE_SCRIPT,
      "google-identity-services",
      () =>
        Boolean(
          window.google?.accounts?.oauth2
        )
    )
      .then(() => {
        if (
          cancelled ||
          !window.google?.accounts?.oauth2
        ) {
          return;
        }

        const codeClient =
          window.google.accounts.oauth2.initCodeClient({
            client_id: googleClientId,

            scope: "openid email profile",

            ux_mode: "popup",

            callback: (response) => {
              if (response?.error) {
                onError?.(
                  "Google sign-in was cancelled or could not be completed."
                );
                return;
              }

              if (response?.code) {
                exchangeCredential(response.code);
              }
            },

            error_callback: (error) => {
              console.error(
                "Google popup error:",
                error
              );

              onError?.(
                "Google sign-in popup could not be opened."
              );
            },
          });

        googleCodeClientRef.current =
          codeClient;

        setGoogleReady(true);
      })
      .catch((error) => {
        console.error(
          "Google SDK failed to load:",
          error
        );

        setGoogleReady(false);

        onError?.(
          "Google sign-in could not be loaded."
        );
      });

    return () => {
      cancelled = true;
    };
  }, [
    exchangeCredential,
    googleClientId,
    googleEnabled,
    onError,
  ]);

  const handleGoogle = () => {
    if (
      !googleCodeClientRef.current ||
      !googleReady ||
      disabled ||
      providerLoading
    ) {
      return;
    }

    onError?.("");

    googleCodeClientRef.current.requestCode();
  };

  if (!googleEnabled) {
    return null;
  }

  const busy =
    disabled ||
    Boolean(providerLoading);

  return (
    <div
      className={`auth-social${
        busy ? " is-disabled" : ""
      }`}
      aria-busy={Boolean(providerLoading)}
    >
      <div className="auth-divider">
        <span>or continue with</span>
      </div>

      <div className="auth-social-stack">
        <button
          type="button"
          className="auth-social-button auth-google-button"
          onClick={handleGoogle}
          disabled={!googleReady || busy}
        >
          <FcGoogle aria-hidden="true" />

          <span>
            {providerLoading === "google"
              ? "Connecting..."
              : "Continue with Google"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default SocialAuthButtons;