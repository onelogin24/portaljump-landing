import { useId, useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { CONTACT_EMAIL, WAITLIST_ENDPOINT } from "../config";
import { form } from "../content/site";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function WaitlistForm({ className = "" }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const errId = useId();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setError(true);
      return;
    }
    setError(false);
    if (WAITLIST_ENDPOINT) {
      setBusy(true);
      try {
        const res = await fetch(WAITLIST_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: value }),
        });
        if (!res.ok) throw new Error("bad status");
        setDone(true);
      } catch {
        setError(true);
      } finally {
        setBusy(false);
      }
    } else {
      const subject = encodeURIComponent(`${form.subject}: ${value}`);
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}`;
      setDone(true);
    }
  }

  if (done) {
    return (
      <p className={`form-done ${className}`} role="status">
        <Check size={18} strokeWidth={2} aria-hidden="true" /> {form.success}
      </p>
    );
  }

  return (
    <form className={`wl ${className}`} onSubmit={onSubmit} noValidate>
      <div className="wl-field">
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder={form.placeholder}
          aria-label="Email address"
          aria-invalid={error}
          aria-describedby={error ? errId : undefined}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="btn" disabled={busy}>
          {form.button}
        </button>
      </div>
      {error && (
        <p id={errId} className="wl-error" role="alert">
          {form.invalid}
        </p>
      )}
    </form>
  );
}
