import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";
import { useAdminAuth } from "../contexts/AdminAuthContext";

export function ForgotPassword() {
  const { forgotPassword, resetPassword } = useAdminAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<"request" | "reset" | "done">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setSubmitting(true);
    const result = await forgotPassword(email.trim());
    if (result.success) {
      setStep("reset");
    } else {
      setError(result.message);
    }
    setSubmitting(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otp.trim()) {
      setError("Please enter the 6-digit verification code.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const result = await resetPassword(email.trim(), otp.trim(), newPassword);
    if (result.success) {
      setStep("done");
    } else {
      setError(result.message);
    }
    setSubmitting(false);
  };

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

        {step === "request" && (
          <>
            <h2 className="auth-title">Forgot Password?</h2>
            <p className="auth-subtitle">
              Enter your registered email address and we'll send you a verification code.
            </p>

            {error && <div className="auth-error">{error}</div>}

            <form className="auth-form" onSubmit={handleRequestCode}>
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
                  autoComplete="new-email"
                  name="forgot-email"
                />
              </div>

              <button type="submit" className="auth-submit auth-field--delay-2" disabled={submitting}>
                {submitting ? "Sending code..." : "Send Verification Code"}
              </button>
            </form>
          </>
        )}

        {step === "reset" && (
          <>
            <h2 className="auth-title">Reset Password</h2>
            <p className="auth-subtitle">
              Enter the 6-digit code sent to <strong>{email}</strong> and your new password.
            </p>

            {error && <div className="auth-error">{error}</div>}

            <form className="auth-form" onSubmit={handleResetPassword}>
              <div className="auth-field auth-field--delay-1">
                <label htmlFor="otp">Verification Code</label>
                <input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  autoComplete="one-time-code"
                />
              </div>

              <div className="auth-field auth-field--delay-2">
                <label htmlFor="newPassword">New Password</label>
                <div className="auth-password-wrap">
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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

              <div className="auth-field auth-field--delay-3">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <div className="auth-password-wrap">
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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

              <button type="submit" className="auth-submit auth-field--delay-4" disabled={submitting}>
                {submitting ? "Resetting password..." : "Reset Password"}
              </button>
            </form>

            <button
              type="button"
              className="auth-back-btn auth-field--delay-5"
              onClick={() => { setStep("request"); setError(""); setOtp(""); setNewPassword(""); setConfirmPassword(""); }}
            >
              <ArrowLeft size={16} />
              Back to email
            </button>
          </>
        )}

        {step === "done" && (
          <div className="auth-success">
            <CheckCircle size={48} className="auth-success-icon" />
            <h2 className="auth-title">Password Reset!</h2>
            <p className="auth-subtitle">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            <button
              type="button"
              className="auth-submit auth-field--delay-1"
              onClick={() => navigate("/login", { replace: true })}
            >
              Go to Sign In
            </button>
          </div>
        )}

        <p className="auth-switch auth-field--delay-5">
          Remember your password? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
