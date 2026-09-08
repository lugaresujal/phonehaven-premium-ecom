import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAdminAuth } from "../contexts/AdminAuthContext";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (el: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export function Login() {
  const { login, googleSignIn, isAuthenticated, loading } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (window.google?.accounts?.id && googleBtnRef.current) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
        callback: async (response: any) => {
          setSubmitting(true);
          setError("");
          const result = await googleSignIn(response.credential);
          if (result.success) {
            navigate("/", { replace: true });
          } else {
            setError(result.message);
            setSubmitting(false);
          }
        },
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        width: "100%",
        text: "continue_with",
        shape: "rectangular",
      });
    }
  }, [googleSignIn, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setSubmitting(true);
    const result = await login(email.trim(), password);
    if (result.success) {
      navigate("/", { replace: true });
    } else {
      setError(result.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-form-wrap">
          <div className="auth-loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="auth-page">
      <div className="auth-page-bg-dots">
        <span className="auth-dot" />
        <span className="auth-dot" />
        <span className="auth-dot" />
        <span className="auth-dot" />
        <span className="auth-dot" />
        <span className="auth-dot" />
        <span className="auth-dot" />
        <span className="auth-dot" />
      </div>
      <div className={`auth-form-wrap ${mounted ? "auth-form-wrap--visible" : ""}`}>
        <div className="auth-logo">
          <div className="auth-logo-mark">H</div>
          <h1>House of Phones</h1>
          <p>Admin Panel</p>
        </div>

        <h2 className="auth-title">Sign In</h2>
        <p className="auth-subtitle">Welcome back. Enter your credentials to continue.</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <input type="text" autoComplete="username" style={{ position: "absolute", left: "-9999px", opacity: 0 }} tabIndex={-1} />
          <input type="password" autoComplete="new-password" style={{ position: "absolute", left: "-9999px", opacity: 0 }} tabIndex={-1} />
          <div className="auth-field auth-field--delay-1">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              name="login-email"
            />
          </div>

          <div className="auth-field auth-field--delay-2">
            <label htmlFor="password">Password</label>
            <div className="auth-password-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              name="login-password"
              />
              <button
                type="button"
                className="auth-pw-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="auth-row auth-field--delay-3">
            <Link to="/forgot-password" className="auth-forgot-link">Forgot Password?</Link>
          </div>

          <button type="submit" className="auth-submit auth-field--delay-4" disabled={submitting}>
            {submitting ? (
              <span className="auth-submit-spinner" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
          <>
            <div className="auth-divider auth-field--delay-5"><span>or</span></div>
            <div className="auth-google-wrap auth-field--delay-6">
              <div ref={googleBtnRef} />
            </div>
          </>
        )}

        <p className="auth-switch auth-field--delay-7">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
