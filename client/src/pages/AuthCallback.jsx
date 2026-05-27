import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Confirming your email...");

  useEffect(() => {
    let active = true;

    async function finishEmailConfirmation() {
      if (!supabase) {
        throw new Error("Supabase is not configured for this app.");
      }

      const query = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const linkError = query.get("error_description") || hash.get("error_description");

      if (linkError) {
        throw new Error(linkError);
      }

      const code = query.get("code");
      const tokenHash = query.get("token_hash");
      const type = query.get("type");
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      let confirmationAttempted = false;
      let result;

      if (code) {
        confirmationAttempted = true;
        result = await supabase.auth.exchangeCodeForSession(code);
      } else if (tokenHash && type) {
        confirmationAttempted = true;
        result = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
      } else if (accessToken && refreshToken) {
        confirmationAttempted = true;
        result = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      }

      if (result?.error) {
        throw result.error;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        navigate("/", { replace: true });
        return;
      }

      if (!confirmationAttempted) {
        throw new Error("This confirmation link is incomplete. Please request a new email.");
      }

      if (active) {
        setStatus("success");
        setMessage("Your email is confirmed. Please sign in to continue.");
      }
    }

    finishEmailConfirmation().catch((confirmationError) => {
      if (active) {
        setStatus("error");
        setMessage(confirmationError.message);
      }
    });

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div className="auth-page">
      <section className="auth-intro">
        <div className="brand auth-brand">
          <div className="brand-mark">AI</div>
          <strong>Spoken English Tutor</strong>
        </div>
        <h1>Your learning is waiting.</h1>
        <p>Confirm your email once, then continue speaking and improving every day.</p>
      </section>
      <section className="auth-card">
        <h2>Email confirmation</h2>
        <p>We are securely connecting your account.</p>
        <p className={`alert ${status === "error" ? "error" : "success"}`}>{message}</p>
        {status !== "loading" && (
          <Link className="primary-button auth-callback-link" to="/login">
            Go to sign in
          </Link>
        )}
      </section>
    </div>
  );
}
