import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import InstallAppButton from "../components/InstallAppButton.jsx";
import PasswordField from "../components/PasswordField.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { supabase } from "../lib/supabase.js";

export default function Signup() {
  const { configured, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  if (user) {
    return <Navigate replace to="/" />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setMessage(
      data.session
        ? "Account created. You can begin practising now."
        : "Account created. Check your email to confirm your account, then sign in.",
    );
  }

  return (
    <div className="auth-page">
      <section className="auth-intro">
        <div className="brand auth-brand">
          <div className="brand-mark">AI</div>
          <strong>Spoken English Tutor</strong>
        </div>
        <h1>Start your speaking journey.</h1>
        <p>
          Learn useful sentences, practise real conversations, and improve one day at a time.
        </p>
        <InstallAppButton />
      </section>
      <section className="auth-card">
        <h2>Create account</h2>
        <p>Use your email to save your learning progress.</p>
        {!configured && (
          <p className="alert error">
            Configure the Supabase frontend variables in `client/.env` before signing up.
          </p>
        )}
        {error && <p className="alert error">{error}</p>}
        {message && <p className="alert success">{message}</p>}
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
              autoComplete="new-password"
              onChange={(event) => setPassword(event.target.value)}
              value={password}
            />
          </label>
          <button className="primary-button full" disabled={!configured || loading} type="submit">
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>
        <p className="auth-switch">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </div>
  );
}
