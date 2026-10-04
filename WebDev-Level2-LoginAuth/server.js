// Full-stack auth server (approach B): Express + JSON file store +
// server-side sessions. Passwords are bcrypt-hashed; the session cookie
// holds only a random session id, never user data.

const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const fs = require('fs/promises');
const path = require('path');

// JSON file holding { [lowercasedEmail]: { name, email, hash } }.
// Created on first registration; gitignored (runtime data, not source).
const USERS_FILE = path.join(__dirname, 'users.json');
const PORT = process.env.PORT || 3000;

const app = express();

// Parse JSON request bodies (req.body) for the /api/* routes below.
app.use(express.json());

// Sessions: the cookie stores only a session id (httpOnly, so page JS
// can't read it). Set SESSION_SECRET in production; the fallback is dev-only.
app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-only-secret-change-me',
    resave: false,            // don't rewrite unchanged sessions
    saveUninitialized: false, // no session until login (nothing to hijack)
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 }, // 1 hour
}));

// --- JSON store ---

// Read all users; missing/corrupt file means "no users yet".
async function readUsers() {
    try {
        return JSON.parse(await fs.readFile(USERS_FILE, 'utf8'));
    } catch {
        return {};
    }
}

async function writeUsers(users) {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

// --- validation (server is the source of truth; the pages mirror it) ---

// Task rule: minimum 8 characters, at least 1 number.
function passwordProblem(pw) {
    if (typeof pw !== 'string' || pw.length < 8) return 'Password must be at least 8 characters.';
    if (!/\d/.test(pw)) return 'Password must contain at least 1 number.';
    return null;
}

// --- API ---

// Register: validate -> reject duplicates -> bcrypt-hash -> save.
app.post('/api/register', async (req, res) => {
    const name = (req.body.name || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';

    // No empty submissions.
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Enter a valid email address.' });
    }
    const bad = passwordProblem(password);
    if (bad) return res.status(400).json({ error: bad });

    // Duplicate check by email and by username.
    const users = await readUsers();
    const nameTaken = Object.values(users).some((u) => u.name.toLowerCase() === name.toLowerCase());
    if (users[email] || nameTaken) {
        return res.status(409).json({ error: 'That username or email is already registered.' });
    }

    // bcrypt hash (cost 10); only the hash is stored, never the password.
    users[email] = { name, email, hash: await bcrypt.hash(password, 10) };
    await writeUsers(users);
    res.status(201).json({ ok: true });
});

// Login: find by email OR username, compare bcrypt hash, open a session.
// Unknown id and wrong password give the SAME generic error on purpose.
app.post('/api/login', async (req, res) => {
    const id = (req.body.id || '').trim().toLowerCase();
    const password = req.body.password || '';
    if (!id || !password) {
        return res.status(400).json({ error: 'Enter your username/email and password.' });
    }

    const users = await readUsers();
    const user = users[id] ||
        Object.values(users).find((u) => u.name.toLowerCase() === id);
    const fail = () => res.status(401).json({ error: 'Invalid username/email or password.' });
    if (!user) return fail();
    if (!(await bcrypt.compare(password, user.hash))) return fail();

    // Success: remember who this session belongs to, nothing more.
    req.session.user = { name: user.name, email: user.email };
    res.json({ ok: true, name: user.name });
});

// Who is logged in? 200 + user, or 401 when there is no session.
app.get('/api/me', (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Not logged in.' });
    res.json(req.session.user);
});

// Logout: destroy the server-side session and clear its cookie.
app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ ok: true });
    });
});

// --- page guard ---

// Dashboard opened directly with no session bounces to login.
// Registered BEFORE the static server so it runs first.
app.get('/dashboard.html', (req, res, next) => {
    if (!req.session.user) return res.redirect('/index.html');
    next(); // logged in: fall through to the static file server below
});

// Static pages + CSS + browser JS. (Dashboard HTML itself is safe to serve:
// its inline script re-checks /api/me and redirects without a session.)
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => console.log(`LoginAuth running at http://localhost:${PORT}`));
