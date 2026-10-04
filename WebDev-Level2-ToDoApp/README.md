# To-Do Web App

Interactive task manager with pending/completed lists. Built for the Oasis Infobyte (OIBSIP) Web Development Level 2 task.

## Features (maps to the task checklist)

- Input field + "Add Task" button; empty input shows an error
- New tasks appear immediately in Pending
- "✓" toggle moves a task Pending ↔ Completed
- Edit button renames a task inline (Enter saves, Esc cancels)
- Delete button removes a task permanently
- Count indicators: "Pending (X)" and "Completed (Y)"
- Bonus: timestamp on each task (added date, plus done date)
- Bonus: tasks persist across refreshes via `localStorage`
- Empty-state message when a list has no items

## Tech Stack

- HTML5, CSS3, Vanilla JavaScript (no libraries)

## Project Structure

- `index.html` — form, the two lists, empty states
- `style.css` — card layout, task rows, responsive rule
- `script.js` — task array, render, add/complete/edit/delete, localStorage

## How to Run

1. Open `index.html` in any modern browser.
2. No build step, no server needed.
