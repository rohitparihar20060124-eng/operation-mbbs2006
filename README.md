# OPERATION MBBS — NEET UG 2027 Prep OS

A full React + Vite app for tracking NEET UG 2027 preparation: lecture progress,
syllabus mastery, mock scores, error diary, daily planner, a NEET rank estimator,
analytics, toppers reference, and a Pomodoro focus timer.

This is a real, standalone project (not a Claude Artifact) — it runs in any
browser and can be deployed for free on Vercel or Netlify.

## 1. Run it locally

You'll need [Node.js](https://nodejs.org) 18+ installed.

```bash
cd operation-mbbs
npm install
npm run dev
```

Vite will print a local URL (usually `http://localhost:5173`) — open it in
your browser. Changes to any file hot-reload instantly.

## 2. Build for production

```bash
npm run build
```

This outputs a static site into `dist/`. You can preview the production
build locally with:

```bash
npm run preview
```

## 3. Deploy to Vercel (recommended, free)

**Option A — via the Vercel website (no terminal needed):**
1. Push this folder to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) → "Add New Project" → import the repo.
3. Vercel auto-detects Vite. Leave the defaults (Build Command: `npm run build`,
   Output Directory: `dist`) and click Deploy.

**Option B — via the CLI:**
```bash
npm install -g vercel
vercel
```
Follow the prompts. Vercel will give you a live URL immediately.

## 4. Deploy to Netlify (alternative, also free)

**Option A — drag and drop:**
1. Run `npm run build` locally.
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop) and drag the
   `dist/` folder onto the page. You'll get a live URL in seconds.

**Option B — connect to GitHub:**
1. Push this folder to a GitHub repository.
2. Go to [app.netlify.com](https://app.netlify.com) → "Add new site" → import
   the repo.
3. Build command: `npm run build`, publish directory: `dist`. Deploy.

## 5. How data is saved

The app stores everything in your browser's `localStorage` (see
`src/lib/storage.js`) — no backend, database, or account needed. Data persists
across page reloads and browser restarts on the same device/browser.
Notes:
- Data is per-browser, not synced across devices.
- Clearing your browser's site data/cache for this domain will erase it.
- If you want cross-device sync later, you'd need to add a real backend
  (e.g. Supabase, Firebase) — happy to help wire that up if you want it.

## 6. Project structure

```
operation-mbbs/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx          # React entry point
    ├── App.jsx           # Main app: state, tabs, screens
    ├── data.js           # Syllabus, lecture plan, rank table, toppers, constants
    ├── styles.js          # Shared inline-style constants
    ├── lib/
    │   └── storage.js     # localStorage persistence layer
    └── components/
        ├── Primitives.jsx  # ProgBar, Ring, Modal
        ├── MockModal.jsx
        ├── ErrModal.jsx
        ├── Pomodoro.jsx
        ├── RankSim.jsx
        ├── Planner.jsx
        ├── Analytics.jsx
        └── ToppersScreen.jsx
```

## 7. Customizing

- **Syllabus/lecture data**: edit `src/data.js` (`SYL` and `LDATA` objects).
- **Colors/branding**: edit `src/styles.js` and the header gradient in `App.jsx`.
- **Exam dates**: edit `EXAM_DATES` in `src/data.js`.
