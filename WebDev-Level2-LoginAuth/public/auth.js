// Browser side of the full-stack auth: tiny fetch() wrapper around the
// server API. No users, passwords, or hashes live here anymore — the
// server (server.js) owns all of that. Exposes: handleRegister,
// handleLogin, requireSession, logout.

const Auth = (() => {
    // POST a JSON body, always resolve { status, data }.
    // Network/server-down becomes status 0 so callers show one message.
    async function post(path, body) {
        try {
            const res = await fetch(path, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body), // same-origin: session cookie goes along automatically
            });
            return { status: res.status, data: await res.json().catch(() => ({})) };
        } catch {
            return { status: 0, data: {} };
        }
    }

    // Ask the server who is logged in; null when there is no session.
    async function me() {
        try {
            const res = await fetch('/api/me');
            if (!res.ok) return null;
            return await res.json();
        } catch {
            return null; // server down: treat as logged out, pages show it
        }
    }

    function show(el, msg) {
        el.textContent = msg;
        el.hidden = false;
    }

    // Message when the server can't be reached at all.
    function serverDown(el) {
        show(el, 'Could not reach the server. Start it with "npm start" and reload.');
    }

    // --- register ---

    // Client-side pre-checks mirror the server (fast feedback); the
    // server re-validates everything and its error is what counts.
    async function handleRegister(e) {
        e.preventDefault(); // no page reload
        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const pass = document.getElementById('reg-pass').value;
        const err = document.getElementById('reg-error');
        const ok = document.getElementById('reg-ok');
        err.hidden = true;
        ok.hidden = true;

        if (!name || !email || !pass) {
            show(err, 'All fields are required.');
            return;
        }

        const { status, data } = await post('/api/register', { name, email, password: pass });
        if (status === 0) return serverDown(err);
        if (status !== 201) {
            show(err, data.error || 'Registration failed.');
            return;
        }

        ok.textContent = 'Registered. Redirecting to login…';
        ok.hidden = false;
        setTimeout(() => location.replace('/index.html'), 800);
    }

    // --- login ---

    async function handleLogin(e) {
        e.preventDefault(); // no page reload
        const id = document.getElementById('login-id').value.trim();
        const pass = document.getElementById('login-pass').value;
        const err = document.getElementById('login-error');
        err.hidden = true;

        if (!id || !pass) {
            show(err, 'Enter your username/email and password.');
            return;
        }

        const { status, data } = await post('/api/login', { id, password: pass });
        if (status === 0) return serverDown(err);
        if (status !== 200) {
            // Server always answers 401 with the generic message.
            show(err, data.error || 'Invalid username/email or password.');
            return;
        }
        location.replace('/dashboard.html');
    }

    // --- session ---

    // Dashboard guard: no session -> bounce to login. Returns the user otherwise.
    async function requireSession() {
        const user = await me();
        if (!user) location.replace('/index.html');
        return user;
    }

    // Tell the server to destroy the session, then go to login.
    async function logout() {
        try {
            await fetch('/api/logout', { method: 'POST' });
        } catch {
            // Server already gone; redirecting is enough.
        }
        location.replace('/index.html');
    }

    return { handleRegister, handleLogin, requireSession, logout };
})();
