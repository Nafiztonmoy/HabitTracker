import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { FcGoogle } from "react-icons/fc";
import { PiFacebookLogoBold } from "react-icons/pi";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { authAPI } from "../services/api";

const GOOGLE_SCRIPT =
  "https://accounts.google.com/gsi/client";

const FACEBOOK_SCRIPT =
  "https://connect.facebook.net/en_US/sdk.js";

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
  const [facebookReady, setFacebookReady] = useState(false);
  const [providerLoading, setProviderLoading] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const googleClientId =
    process.env.REACT_APP_GOOGLE_CLIENT_ID?.trim();

  const facebookAppId =
    process.env.REACT_APP_FACEBOOK_APP_ID?.trim();

  const facebookApiVersion =
    process.env.REACT_APP_FACEBOOK_API_VERSION?.trim() ||
    "v25.0";

  const googleEnabled =
    Boolean(googleClientId) &&
    googleClientId !== "your-google-client-id";

  const facebookEnabled =
    Boolean(facebookAppId) &&
    facebookAppId !== "your-facebook-app-id";

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
    async (provider, credential) => {
      if (!credential || disabled) return;

      setProviderLoading(provider);
      onError?.("");

      try {
        const response =
          provider === "google"
            ? await authAPI.google({
                credential,
              })
            : await authAPI.facebook({
                credential,
              });

        finishAuth(response);
      } catch (error) {
        console.error(
          `${provider} authentication failed:`,
          error
        );

        onError?.(
          error.response?.data?.message ||
            `${
              provider === "google"
                ? "Google"
                : "Facebook"
            } sign-in could not be completed.`
        );
      } finally {
        setProviderLoading("");
      }
    },
    [disabled, finishAuth, onError]
  );

  // Google OAuth code client
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
                exchangeCredential(
                  "google",
                  response.code
                );
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

  // Facebook SDK
  useEffect(() => {
    if (!facebookEnabled) {
      setFacebookReady(false);
      return undefined;
    }

    let cancelled = false;

    loadScript(
      FACEBOOK_SCRIPT,
      "facebook-jssdk",
      () => Boolean(window.FB)
    )
      .then(() => {
        if (
          cancelled ||
          !window.FB
        ) {
          return;
        }

        window.FB.init({
          appId: facebookAppId,
          cookie: true,
          xfbml: false,
          version: facebookApiVersion,
        });

        setFacebookReady(true);
      })
      .catch((error) => {
        console.error(
          "Facebook SDK failed to load:",
          error
        );

        setFacebookReady(false);

        onError?.(
          "Facebook sign-in could not be loaded."
        );
      });

    return () => {
      cancelled = true;
    };
  }, [
    facebookApiVersion,
    facebookAppId,
    facebookEnabled,
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

  const handleFacebook = () => {
    if (
      !window.FB ||
      !facebookReady ||
      disabled ||
      providerLoading
    ) {
      return;
    }

    onError?.("");

    window.FB.login(
      (response) => {
        const accessToken =
          response.authResponse?.accessToken;

        if (accessToken) {
          exchangeCredential(
            "facebook",
            accessToken
          );
        } else {
          onError?.(
            "Facebook sign-in was cancelled or not authorized."
          );
        }
      },
      {
        scope: "public_profile,email",
        return_scopes: true,
      }
    );
  };

  if (
    !googleEnabled &&
    !facebookEnabled
  ) {
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

        {googleEnabled && (
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
        )}

        {facebookEnabled && (
          <button
            type="button"
            className="auth-social-button auth-facebook-button"
            onClick={handleFacebook}
            disabled={!facebookReady || busy}
          >
            <PiFacebookLogoBold
              aria-hidden="true"
            />

            <span>
              {providerLoading === "facebook"
                ? "Connecting..."
                : "Continue with Facebook"}
            </span>
          </button>
        )}

      </div>
    </div>
  );
};

export default SocialAuthButtons;