# Little by little

A local habit tracker built with React and Vite. Add habits, check or uncheck today's completion, delete habits, and see daily progress. No login, backend, analytics, or external services.

## Start or restart on this Mac

Node and npm were not on the shell PATH, so this project uses Codex's bundled Node and pnpm. Run:

```sh
cd /Users/weichen/Documents/ChatGPT/codex-first-app
export PATH="/Users/weichen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/weichen/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH"
pnpm dev
```

Open http://127.0.0.1:5173/. Keep that exact address to use the same browser storage. The server binds only to your computer's loopback interface.

## Stop

Press **Control+C** in the terminal running `pnpm dev`.

To stop the server initially launched by Codex from another terminal:

```sh
lsof -tiTCP:5173 -sTCP:LISTEN | xargs kill
```

This stops the process listening on the app's port. Stopping Vite does not erase habits.

## How it works

1. **Vite and the entry point:** `index.html` contains a root element and loads `src/main.jsx`. Vite transforms JSX and serves files during development; saved edits update the browser.
2. **React state:** `App` keeps the habit list and input text in `useState`. Submitting the form adds a habit with a unique ID. Checkboxes update its completion dates. React renders the updated list automatically.
3. **Browser storage:** `readHabits()` reads and validates saved JSON once at startup. `updateHabits()` updates React state and writes JSON to `localStorage` after each edit. Storage failures show a message.
4. **Daily completion:** Each habit stores local calendar dates. The checkbox represents today, so it starts unchecked on a new day while the habit stays in the list. A small timer and focus listener detect day changes.
5. **Styling:** `src/style.css` controls the layout, colors, focus outlines, and mobile layout. System fonts mean no remote font requests.

Data belongs to this browser profile and exact site address. Clearing site data removes it; another browser will have a separate list. Use one tab at a time: this first version does not synchronize concurrent edits between tabs.

## Dependencies and build

After setting PATH as above:

```sh
pnpm install
pnpm build
```

Dependencies are already installed. `pnpm-lock.yaml` records their resolved versions. `pnpm-workspace.yaml` permits esbuild's required installation script. `pnpm build` creates static output in `dist`; it does not publish anything.

Verified: production build, adding a habit, checking completion, persistence after reload, and unchecking completion. The preview contains one sample habit, “Read a few pages,” which you can delete using ×.
