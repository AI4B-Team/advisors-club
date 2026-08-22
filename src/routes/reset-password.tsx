import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import logoUrl from "@/assets/advisorsclub-logo-real.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set A New Password — AdvisorsClub" },
      { name: "description", content: "Choose a new password for your AdvisorsClub account." },
      { property: "og:title", content: "Set A New Password — AdvisorsClub" },
      { property: "og:description", content: "Choose a new password for your account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const nav = useNavigate();
  const [ready, setReady] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data: s }) => {
      if (s.session) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (password.length < 8) {
      toast.error("Password Must Be At Least 8 Characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords Do Not Match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password Updated.");
    nav({ to: "/app/dashboard" });
  }

  return (
    <div className="lt">
      <div className="lt-auth lt-auth-rev">
        <div className="lt-auth-left">
          <Link to="/landing" className="lt-auth-logo"><img src={logoUrl} alt="AdvisorsClub" /></Link>

          <h1>Set A New Password</h1>
          {!ready ? (
            <>
              <p className="lt-auth-sub">This Reset Link Is Invalid Or Has Expired.</p>
              <div className="lt-auth-foot">
                <Link to="/forgot-password">Request A New Link</Link>
              </div>
            </>
          ) : (
            <>
              <p className="lt-auth-sub">Choose A New Password For Your Account.</p>
              <form onSubmit={onSubmit}>
                <div className="lt-field lt-field-rel">
                  <label>New Password</label>
                  <input type={showPw ? "text" : "password"} required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPw(!showPw)} aria-label="Toggle Password">
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="lt-field">
                  <label>Confirm Password</label>
                  <input type={showPw ? "text" : "password"} required placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                </div>
                <button type="submit" className="lt-cta-full" disabled={loading}>
                  {loading ? "Updating..." : <>Update Password <ArrowRight size={16} strokeWidth={3} /></>}
                </button>
              </form>
            </>
          )}
          <div className="lt-auth-foot">
            <Link to="/login">Back To Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
