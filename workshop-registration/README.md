# Interactive Workshop Registration (Lab 2)

A React + Vite form that practises **state, events, controlled inputs, validation and immutable array updates**.

## Setup

1. Install [Node.js](https://nodejs.org) (v18+) and [VS Code](https://code.visualstudio.com).
2. Clone or extract this project and open the folder in VS Code.
3. In the terminal run:
   ```bash
   npm install
   npm run dev
   ```
4. Open the local URL Vite prints (usually http://localhost:5173).

Production build: `npm run build`.

## Features (mapped to the lab)

| Lab step | Where / how |
|---|---|
| 1. Connect state | `useState` for `form`, `errors`, `registrations`, `success`. Every input has `value` + `onChange` (one shared `handleChange`). |
| 2. Modern types | `text`, `email`, `tel`, `date`, `number`, `url` and a `<select>`; plus `required`, `min`, `max`, `minLength`, `pattern`. |
| 3. Validate | `validateField()` gives a specific message per field; shown beside the field on blur, on submit and live while fixing. |
| 4. Register | `e.preventDefault()`, add with `[...registrations, newItem]`, clear the form, show a success message. |
| 5. Remove & test | `registrations.filter(r => r.id !== id)`; tested with valid, invalid and boundary values (below). |

### Validation rules
- Name: required, 2+ characters
- Email: must match `name@domain.tld`
- Phone: 9–15 digits, optional leading `+`
- Track: must be selected
- Date: today up to 12 months ahead (no past dates)
- Age: whole number 16–100
- Portfolio: valid `http://` or `https://` URL

### Accessibility and responsiveness
Labels linked with `htmlFor`, `aria-invalid`, `aria-describedby`, `role="alert"` on errors, `role="status"` on success, visible focus rings, focus jumps to the first invalid field, two-column layout on desktop that stacks on mobile.

### Extension feature: seat capacity meter
The workshop has **10 seats**. A live progress bar and "N seats remaining" text update as people register or are removed; at 10 the form disables and shows "Workshop is full".

## Testing performed
- Empty submit: 7 errors, nothing added, no page refresh
- Invalid email / phone / URL / past date: blocked with specific messages
- Boundaries: age 15 ✗, 16 ✓, 100 ✓, 101 ✗, 20.5 ✗; date yesterday ✗, today ✓, +1 year ✓, +1 year +1 day ✗; phone 8 digits ✗, 9 ✓, 15 ✓, 16 ✗
- Valid registration appears instantly, form clears, success shown
- Remove deletes only the chosen attendee
- Capacity limit reached at 10; no horizontal scroll at 375px width

## Screenshots
![Registered attendees](screenshots/01-registered-attendees.png)
![Validation errors](screenshots/02-validation-errors.png)
