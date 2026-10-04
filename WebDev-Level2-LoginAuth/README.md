# Login Authentication System (Full-Stack)

Registration, login, and a protected dashboard backed by a Node.js + Express server with bcrypt-hashed passwords and server-side sessions. Built for the Oasis Infobyte (OIBSIP) Web Development Level 2 task (approach B: full-stack).

## Features (maps to the task checklist)

- Registration page (`register.html`): username/email + password
- Password rule: minimum 8 characters, at least 1 number (checked in the browser for speed, enforced on the server)
- Duplicate check: 409 error if the username or email already exists
- Login page (`index.html`): accepts username OR email + password
- Wrong credentials: one generic 401 error (never says which field failed)
- Protected page (`dashboard.html`): server redirects to login with no session, and the page re-checks `GET /api/me`
- Logout button: destroys the server-side session, clears its cookie, redirects to login
- Passwords stored as bcrypt hashes in `users.json` — never plaintext
- Both forms reject empty submissions (400)

## Tech Stack

- Node.js + Express 4 (API + static pages)
- `express-session` (server-side sessions, httpOnly cookie holds only a session id)
- `bcryptjs` (password hashing, pure JS — no build tools needed)
- Vanilla HTML/CSS/JS in `public/` (fetch calls, no libraries)

## Project Structure

- `server.js` — API (`/api/register`, `/api/login`, `/api/me`, `/api/logout`), dashboard guard, static server
- `package.json` — dependencies + `npm start`
- `public/index.html` — login page (entry point)
- `public/register.html` — registration page
- `public/dashboard.html` — protected page (session guard + logout)
- `public/style.css` — shared card layout
- `public/auth.js` — fetch wrapper + form handlers (shared)
- `users.json` — created on first registration, gitignored (runtime data)

## How to Run

1. `npm install`
2. `npm start`
3. Open `http://localhost:3000`
4. Register an account, then log in to reach the dashboard.
