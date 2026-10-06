import { useId, useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { CONTACT_EMAIL, WAITLIST_ENDPOINT } from "../config";
import { form } from "../content/site";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function WaitlistForm({ className = "" }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const errId = useId();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setErrorMsg(form.invalid);
      return;
    }
    setErrorMsg(null);
    if (WAITLIST_ENDPOINT) {
      setBusy(true);
      try {
        const res = await fetch(WAITLIST_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ email: value }),
          redirect: "follow",
        });
        const data = await res.json();
        if (res.ok && data.ok === true) setDone(true);
        else setErrorMsg(data.error === "invalid_email" ? form.invalid : form.failed);
      } catch {
        setErrorMsg(form.failed);
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
          aria-invalid={errorMsg === form.invalid}
          aria-describedby={errorMsg ? errId : undefined}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrorMsg(null);
          }}
        />
        <button type="submit" className="btn" disabled={busy}>
          {form.button}
        </button>
      </div>
      {errorMsg && (
        <p id={errId} className="wl-error" role="alert">
          {errorMsg}
        </p>
      )}
    </form>
  );
}
