import { useState } from "react";

export default function PasswordField({ autoComplete, onChange, value }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-field">
      <input
        autoComplete={autoComplete}
        minLength="6"
        onChange={onChange}
        required
        type={visible ? "text" : "password"}
        value={value}
      />
      <button
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="password-toggle"
        onClick={() => setVisible((current) => !current)}
        type="button"
      >
        {visible ? (
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.1A10.6 10.6 0 0112 5c5.4 0 9 7 9 7a16.5 16.5 0 01-3.3 3.8M6.2 6.3C4.2 8 3 12 3 12s3.6 7 9 7a9.5 9.5 0 003-.5" />
          </svg>
        ) : (
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M3 12s3.6-7 9-7 9 7 9 7-3.6 7-9 7-9-7-9-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}
