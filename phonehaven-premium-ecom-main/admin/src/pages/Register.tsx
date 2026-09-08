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

export function Register() {
  const { register, googleSignIn, isAuthenticated, loading } = useAdminAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const result = await register(name.trim(), email.trim(), password);
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

        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Register as an admin to manage your store.</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <input type="text" autoComplete="username" style={{ position: "absolute", left: "-9999px", opacity: 0 }} tabIndex={-1} />
          <input type="password" autoComplete="new-password" style={{ position: "absolute", left: "-9999px", opacity: 0 }} tabIndex={-1} />
          <div className="auth-field auth-field--delay-1">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div className="auth-field auth-field--delay-2">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="new-email"
              name="register-email"
            />
          </div>

          <div className="auth-field auth-field--delay-3">
            <label htmlFor="password">Password</label>
            <div className="auth-password-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
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

          <div className="auth-field auth-field--delay-4">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="auth-password-wrap">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-pw-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit auth-field--delay-5" disabled={submitting}>
            {submitting ? (
              <span className="auth-submit-spinner" />
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
          <>
            <div className="auth-divider auth-field--delay-6"><span>or</span></div>
            <div className="auth-google-wrap auth-field--delay-7">
              <div ref={googleBtnRef} />
            </div>
          </>
        )}

        <p className="auth-switch auth-field--delay-8">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
