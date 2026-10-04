// To-Do app: tasks live in one array, render into two lists
// (pending / completed), and persist to localStorage on every change.

// localStorage key holding the JSON-encoded task array.
const STORE_KEY = 'todo_tasks';

// Task shape: { id, text, done, createdAt, completedAt }
let tasks = [];

// Static controls.
const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const formError = document.getElementById('form-error');
const pendingList = document.getElementById('pending-list');
const completedList = document.getElementById('completed-list');
const pendingCount = document.getElementById('pending-count');
const completedCount = document.getElementById('completed-count');
const pendingEmpty = document.getElementById('pending-empty');
const completedEmpty = document.getElementById('completed-empty');

// Load saved tasks (if any), then paint the screen.
load();
render();

// --- storage ---

// Read tasks from localStorage. Bad/corrupt data resets to empty.
function load() {
    try {
        const raw = localStorage.getItem(STORE_KEY);
        tasks = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(tasks)) tasks = [];
    } catch {
        tasks = [];
    }
}

// Write the whole array back to localStorage.
function save() {
    localStorage.setItem(STORE_KEY, JSON.stringify(tasks));
}

// --- create ---

// Form submit = add a task. Reject empty input with an error message.
form.addEventListener('submit', (e) => {
    e.preventDefault(); // stay on the page, no reload
    const text = input.value.trim();
    if (!text) {
        showError('Please type a task first.');
        return;
    }
    hideError();
    tasks.unshift({ // newest on top
        id: Date.now(), // unique enough for a local app
        text,
        done: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
    });
    input.value = '';
    input.focus();
    save();
    render();
});

function showError(msg) {
    formError.textContent = msg;
    formError.hidden = false;
}

function hideError() {
    formError.hidden = true;
}

// --- render ---

// Rebuild both lists from scratch. Simple and bug-free at this scale.
function render() {
    pendingList.innerHTML = '';
    completedList.innerHTML = '';

    const pending = tasks.filter((t) => !t.done);
    const done = tasks.filter((t) => t.done);

    // Counts above each list.
    pendingCount.textContent = pending.length;
    completedCount.textContent = done.length;

    // Empty-state messages.
    pendingEmpty.hidden = pending.length > 0;
    completedEmpty.hidden = done.length > 0;

    pending.forEach((t) => pendingList.appendChild(taskRow(t)));
    done.forEach((t) => completedList.appendChild(taskRow(t)));
}

// Build one <li>: checkbox-style toggle + text (+timestamp) + edit + delete.
function taskRow(task) {
    const li = document.createElement('li');
    if (task.done) li.classList.add('done');

    // Toggle button: ✓ moves to Completed, ↩ moves back to Pending.
    const toggle = document.createElement('button');
    toggle.textContent = task.done ? '↩' : '✓';
    toggle.title = task.done ? 'Mark as pending' : 'Mark complete';
    toggle.setAttribute('aria-label', toggle.title);
    toggle.addEventListener('click', () => {
        task.done = !task.done;
        task.completedAt = task.done ? new Date().toISOString() : null;
        save();
        render();
    });

    // Text + timestamp wrapper.
    const wrap = document.createElement('span');
    wrap.className = 'task-text';
    wrap.textContent = task.text;
    const time = document.createElement('span');
    time.className = 'task-time';
    time.textContent = stampText(task);
    wrap.appendChild(time);

    // Edit button: swaps the text for an input, Enter saves, Esc cancels.
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => startEdit(li, task));

    // Delete button: removes the task permanently.
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.className = 'btn-delete';
    delBtn.addEventListener('click', () => {
        tasks = tasks.filter((t) => t.id !== task.id);
        save();
        render();
    });

    li.append(toggle, wrap, editBtn, delBtn);
    return li;
}

// "Added <date>" plus "· Done <date>" once completed.
function stampText(task) {
    const added = new Date(task.createdAt).toLocaleString();
    if (task.done && task.completedAt) {
        return `Added ${added} · Done ${new Date(task.completedAt).toLocaleString()}`;
    }
    return `Added ${added}`;
}

// Replace the row's text with an input pre-filled with the current value.
function startEdit(li, task) {
    const wrap = li.querySelector('.task-text');
    const editInput = document.createElement('input');
    editInput.className = 'task-edit';
    editInput.value = task.text;
    editInput.maxLength = 200;
    editInput.setAttribute('aria-label', 'Edit task text');

    // Enter commits (if non-empty), Esc aborts.
    editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') commitEdit();
        if (e.key === 'Escape') render();
    });
    editInput.addEventListener('blur', commitEdit); // click-away also saves

    let committed = false; // blur fires after Enter — save only once
    function commitEdit() {
        if (committed) return;
        committed = true;
        const next = editInput.value.trim();
        if (next) task.text = next; // empty edit = keep old text
        save();
        render();
    }

    li.replaceChild(editInput, wrap);
    editInput.focus();
    editInput.select();
}
