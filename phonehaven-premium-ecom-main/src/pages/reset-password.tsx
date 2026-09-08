import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, AlertCircle, CheckCircle, KeyRound, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { PageLayout } from "@/components/layout/PageLayout";
import { useAuth, isValidEmail } from "@/lib/store/auth";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — House of Phones" },
      { name: "description", content: "Set a new password for your House of Phones account." },
      { property: "og:url", content: "/reset-password" },
    ],
    links: [{ rel: "canonical", href: "/reset-password" }],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const inputCls = (bad?: string) =>
    `w-full px-4 py-3 rounded-xl bg-background border text-sm focus:outline-none transition-colors ${bad ? "border-destructive focus:border-destructive" : "border-border focus:border-primary"}`;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    if (!email.trim()) return setError("Please enter your email address.");
    if (!isValidEmail(email.trim())) return setError("Please enter a valid email address.");
    if (!token.trim()) return setError("Please enter the 6-digit verification code.");
    if (!newPassword) return setError("Please enter a new password.");
    if (newPassword.length < 6) return setError("Password must be at least 6 characters.");
    if (newPassword !== confirmPassword) return setError("Passwords do not match.");
    setSubmitting(true);
    try {
      await resetPassword(email.trim(), token.trim(), newPassword);
      toast.success("Password reset successfully!");
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message ?? "Failed to reset password. Please check your verification code.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout bare>
      <section className="container-hop py-10 md:py-16 max-w-lg mx-auto">
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-10">
          <div className="flex items-center gap-3 mb-2">
            <KeyRound size={24} className="text-primary" />
            <h2 className="font-serif text-2xl">Reset Password</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your email, the 6-digit verification code received, and your new password.
          </p>

          {success && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-green-500/30 bg-green-500/5 p-5 text-sm text-green-700">
              <CheckCircle size={20} className="mt-0.5 shrink-0 text-green-600" />
              <div>
                <span className="font-medium">Your password has been reset successfully!</span>
                <p className="mt-1 text-xs text-muted-foreground">You can now sign in with your updated password.</p>
                <Link to="/login" className="inline-block mt-4 px-6 py-2.5 rounded-full bg-foreground text-background text-xs uppercase tracking-widest font-medium hover:bg-primary transition-colors">
                  Go to Sign In
                </Link>
              </div>
            </div>
          )}

          {!success && (
            <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
              {error && (
                <div role="alert" className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  placeholder="name@example.com"
                  autoComplete="email"
                  inputMode="email"
                  className={inputCls()}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">6-Digit Verification Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={token}
                  onChange={(e) => { setToken(e.target.value); setError(null); }}
                  placeholder="e.g. 123456"
                  autoComplete="one-time-code"
                  className={`${inputCls()} text-center font-mono text-lg tracking-widest`}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                    className={`${inputCls()} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                    className={`${inputCls()} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-full bg-foreground text-background text-sm tracking-widest uppercase hover:bg-primary transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {submitting && <Loader2 size={15} className="animate-spin" />}
                {submitting ? "Resetting Password" : "Reset Password"}
              </button>
            </form>
          )}

          <p className="mt-6 text-sm text-muted-foreground text-center">
            Remember your password? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </section>
    </PageLayout>
  );
}
