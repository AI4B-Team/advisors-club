import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, MailCheck } from "lucide-react";
import logoUrl from "@/assets/advisorsclub-logo-real.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Your Password — AdvisorsClub" },
      { name: "description", content: "Send yourself a secure link to reset your AdvisorsClub password." },
      { property: "og:title", content: "Reset Your Password — AdvisorsClub" },
      { property: "og:description", content: "Send yourself a secure password reset link." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="lt">
      <div className="lt-auth lt-auth-rev">
        <div className="lt-auth-left">
          <Link to="/landing" className="lt-auth-logo"><img src={logoUrl} alt="AdvisorsClub" /></Link>

          <h1>Forgot Your Password?</h1>
          {sent ? (
            <>
              <p className="lt-auth-sub">
                <MailCheck size={16} style={{ verticalAlign: "-3px", marginRight: 6 }} />
                We Sent A Reset Link To <strong>{email}</strong>. Check Your Inbox.
              </p>
              <div className="lt-auth-foot">
                Didn’t Get It? <button type="button" className="lt-linkish" onClick={() => setSent(false)}>Try Again</button>
              </div>
            </>
          ) : (
            <>
              <p className="lt-auth-sub">Enter Your Email And We’ll Send You A Secure Reset Link.</p>
              <form onSubmit={onSubmit}>
                <div className="lt-field">
                  <label>Email</label>
                  <input type="email" required placeholder="You@YourClub.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <button type="submit" className="lt-cta-full" disabled={loading}>
                  {loading ? "Sending..." : <>Send Reset Link <ArrowRight size={16} strokeWidth={3} /></>}
                </button>
              </form>
            </>
          )}
          <div className="lt-auth-foot">
            Remembered It? <Link to="/login">Back To Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
