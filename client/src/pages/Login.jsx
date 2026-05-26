import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import PasswordField from "../components/PasswordField.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { supabase } from "../lib/supabase.js";

export default function Login() {
  const { configured, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (user) {
    return <Navigate replace to="/" />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }

    navigate("/");
  }

  return (
    <div className="auth-page">
      <section className="auth-intro">
        <div className="brand auth-brand">
          <div className="brand-mark">AI</div>
          <strong>Spoken English Tutor</strong>
        </div>
        <h1>Speak English with confidence.</h1>
        <p>
          Friendly corrections, Tamil and Tanglish support, voice practice, and daily
          lessons built for beginners.
        </p>
      </section>
      <section className="auth-card">
        <h2>Welcome back</h2>
        <p>Sign in to continue your practice.</p>
        {!configured && (
          <p className="alert error">
            Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `client/.env`
            before signing in.
          </p>
        )}
        {error && <p className="alert error">{error}</p>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label>
            Password
            <PasswordField
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              value={password}
            />
          </label>
          <button className="primary-button full" disabled={!configured || loading} type="submit">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="auth-switch">
          New learner? <Link to="/signup">Create an account</Link>
        </p>
      </section>
    </div>
  );
}
