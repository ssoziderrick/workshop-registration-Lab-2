import { useState } from 'react';

/* ---------- Constants ---------- */
const CAPACITY = 10; // Extension feature: limited seats
const MIN_AGE = 16;
const MAX_AGE = 100;
const TRACKS = ['Web Development', 'Mobile Apps', 'Cybersecurity', 'UI/UX Design'];

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  track: '',
  date: '',
  age: '',
  portfolio: '',
};

// Helpers for the date field's min / max (local time, YYYY-MM-DD)
function toInputDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
const TODAY = toInputDate(new Date());
const NEXT_YEAR = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return toInputDate(d);
})();

/* ---------- Step 3: Validation (one rule per field) ---------- */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9 ]{9,15}$/;

function validateField(field, value) {
  const v = value.trim();
  switch (field) {
    case 'name':
      if (!v) return 'Full name is required.';
      if (v.length < 2) return 'Name must be at least 2 characters.';
      return '';
    case 'email':
      if (!v) return 'Email is required.';
      if (!EMAIL_RE.test(v)) return 'Enter a valid email, e.g. name@example.com.';
      return '';
    case 'phone':
      if (!v) return 'Phone number is required.';
      if (!PHONE_RE.test(v)) return 'Use 9–15 digits, optionally starting with +.';
      return '';
    case 'track':
      return v ? '' : 'Please choose a workshop track.';
    case 'date':
      if (!v) return 'Choose your preferred workshop date.';
      if (v < TODAY) return 'Date cannot be in the past.';
      if (v > NEXT_YEAR) return 'Date must be within the next 12 months.';
      return '';
    case 'age': {
      if (!v) return 'Age is required.';
      const n = Number(v);
      if (!Number.isInteger(n)) return 'Age must be a whole number.';
      if (n < MIN_AGE) return `You must be at least ${MIN_AGE} years old.`;
      if (n > MAX_AGE) return `Age cannot be more than ${MAX_AGE}.`;
      return '';
    }
    case 'portfolio':
      if (!v) return 'Portfolio URL is required.';
      try {
        const u = new URL(v);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error();
        if (!u.hostname.includes('.')) throw new Error();
      } catch {
        return 'Enter a full URL starting with http:// or https://';
      }
      return '';
    default:
      return '';
  }
}

function validateAll(form) {
  const errors = {};
  Object.keys(EMPTY_FORM).forEach((f) => {
    const msg = validateField(f, form[f]);
    if (msg) errors[f] = msg;
  });
  return errors;
}

/* ---------- Reusable field wrapper (label + error, accessible) ---------- */
function Field({ id, label, error, hint, children }) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ');
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children({ id, describedBy, invalid: !!error })}
      {hint && !error && <small id={`${id}-hint`} className="hint">{hint}</small>}
      {error && (
        <small id={`${id}-error`} className="error" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}

export default function App() {
  /* Step 1: state for form values, errors and registrations */
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [registrations, setRegistrations] = useState([]);
  const [success, setSuccess] = useState('');

  const seatsLeft = CAPACITY - registrations.length;
  const isFull = seatsLeft <= 0;

  // Controlled input handler: one function for every field
  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setSuccess('');
    // Re-check a field live once it is already showing an error
    if (errors[name]) setErrors({ ...errors, [name]: validateField(name, value) });
  }

  // Show a field's error when the user leaves it
  function handleBlur(e) {
    const { name, value } = e.target;
    setErrors({ ...errors, [name]: validateField(name, value) });
  }

  /* Step 4: Register */
  function handleSubmit(e) {
    e.preventDefault(); // stop page refresh
    if (isFull) return;

    const found = validateAll(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // move focus to the first invalid field
      const first = Object.keys(EMPTY_FORM).find((f) => found[f]);
      document.getElementById(first)?.focus();
      setSuccess('');
      return;
    }

    const newRegistration = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      portfolio: form.portfolio.trim(),
      id: crypto.randomUUID(),
    };
    setRegistrations([...registrations, newRegistration]); // spread, no push()
    setForm(EMPTY_FORM);
    setErrors({});
    setSuccess(`${newRegistration.name} is registered for ${newRegistration.track}!`);
  }

  /* Step 5: Remove with filter() */
  function handleRemove(id) {
    setRegistrations(registrations.filter((r) => r.id !== id));
    setSuccess('');
  }

  const common = { onChange: handleChange, onBlur: handleBlur };

  return (
    <main>
      <header className="hero">
        <h1>Interactive Workshop Registration</h1>
        <p>Reserve your seat. Every field is checked as you go.</p>
      </header>

      <div className="layout">
        <form onSubmit={handleSubmit} noValidate aria-label="Workshop registration form">
          <h2>Your details</h2>

          <Field id="name" label="Full name" error={errors.name}>
            {(p) => (
              <input
                id="name" name="name" type="text" autoComplete="name"
                placeholder="e.g. Ssozi Derrick" required minLength={2}
                value={form.name} {...common}
                aria-invalid={p.invalid} aria-describedby={p.describedBy || undefined}
              />
            )}
          </Field>

          <Field id="email" label="Email address" error={errors.email}>
            {(p) => (
              <input
                id="email" name="email" type="email" autoComplete="email"
                placeholder="name@example.com" required
                value={form.email} {...common}
                aria-invalid={p.invalid} aria-describedby={p.describedBy || undefined}
              />
            )}
          </Field>

          <Field id="phone" label="Phone number" error={errors.phone} hint="9–15 digits, may start with +">
            {(p) => (
              <input
                id="phone" name="phone" type="tel" autoComplete="tel"
                placeholder="+256 700 000000" required
                pattern="\+?[0-9 ]{9,15}"
                value={form.phone} {...common}
                aria-invalid={p.invalid} aria-describedby={p.describedBy || undefined}
              />
            )}
          </Field>

          <Field id="track" label="Workshop track" error={errors.track}>
            {(p) => (
              <select
                id="track" name="track" required value={form.track} {...common}
                aria-invalid={p.invalid} aria-describedby={p.describedBy || undefined}
              >
                <option value="">Select a track…</option>
                {TRACKS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            )}
          </Field>

          <div className="row">
            <Field id="date" label="Preferred date" error={errors.date}>
              {(p) => (
                <input
                  id="date" name="date" type="date" required min={TODAY} max={NEXT_YEAR}
                  value={form.date} {...common}
                  aria-invalid={p.invalid} aria-describedby={p.describedBy || undefined}
                />
              )}
            </Field>

            <Field id="age" label="Age" error={errors.age} hint={`${MIN_AGE}–${MAX_AGE}`}>
              {(p) => (
                <input
                  id="age" name="age" type="number" inputMode="numeric" required
                  min={MIN_AGE} max={MAX_AGE} step="1" placeholder="e.g. 21"
                  value={form.age} {...common}
                  aria-invalid={p.invalid} aria-describedby={p.describedBy || undefined}
                />
              )}
            </Field>
          </div>

          <Field id="portfolio" label="Portfolio URL" error={errors.portfolio}>
            {(p) => (
              <input
                id="portfolio" name="portfolio" type="url" autoComplete="url"
                placeholder="https://yourname.dev" required
                value={form.portfolio} {...common}
                aria-invalid={p.invalid} aria-describedby={p.describedBy || undefined}
              />
            )}
          </Field>

          <button type="submit" disabled={isFull}>
            {isFull ? 'Workshop is full' : 'Register'}
          </button>

          <p className="success" role="status" aria-live="polite">{success}</p>
        </form>

        <section className="list" aria-labelledby="list-title">
          <div className="list-head">
            <h2 id="list-title">Registered attendees</h2>
            <span className="badge">{registrations.length} / {CAPACITY}</span>
          </div>

          {/* Extension: live seats-remaining meter */}
          <div
            className="meter" role="progressbar" aria-label="Seats taken"
            aria-valuemin={0} aria-valuemax={CAPACITY} aria-valuenow={registrations.length}
          >
            <span style={{ width: `${(registrations.length / CAPACITY) * 100}%` }} />
          </div>
          <p className={`seats${seatsLeft <= 3 ? ' low' : ''}`}>
            {isFull ? 'No seats left.' : `${seatsLeft} seat${seatsLeft === 1 ? '' : 's'} remaining`}
          </p>

          {registrations.length === 0 && <p className="empty">No registrations yet. Be the first!</p>}

          <ul>
            {registrations.map((r) => (
              <li key={r.id} className="card">
                <div>
                  <h3>{r.name}</h3>
                  <p className="track">{r.track}</p>
                  <p>{r.email} · {r.phone}</p>
                  <p>Date: {r.date} · Age: {r.age}</p>
                  <p>
                    <a href={r.portfolio} target="_blank" rel="noreferrer">{r.portfolio}</a>
                  </p>
                </div>
                <button
                  type="button" className="danger"
                  onClick={() => handleRemove(r.id)}
                  aria-label={`Remove ${r.name}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
