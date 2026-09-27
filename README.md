# 🌱 Habit Tracker

A simple web app for building better habits, one day at a time. Create an account, add the habits you want to build, check them off each day, and watch your streaks grow.

Built for **Engineering Design 2 (FAU)** as a practice project in building real software with AI tools.

- **Live app:** _coming soon — Netlify link_
- **Demo video (YouTube):** _coming soon — unlisted video link_

---

## What the app does

| Feature | Description |
|---|---|
| **User accounts** | Register, log in, and log out with email + password (Supabase Auth). You stay logged in across page reloads. |
| **Create habits** | Add a habit with a name, optional description, and a color. |
| **View habits** | See all of your habits in a list, loaded from the database. |
| **Edit habits** | Rename a habit, change its description, or pick a new color. |
| **Delete habits** | Remove a habit (with confirmation). Its check-off history is deleted too. |
| **Daily check-offs** | Tap the circle to mark a habit done for today; tap again to undo. |
| **Streaks** | Each habit shows how many days in a row you've completed it (🔥 3-day streak). |
| **7-day history** | A row of the last 7 days shows which days you completed. Click a day to fill in one you forgot. |
| **Private data** | Each user can only see and change their own habits. This is enforced in the database with Row Level Security, not just in the UI. |

It also supports light and dark mode (follows your system setting) and works on phone-sized screens.

## Technologies used

- **[React](https://react.dev/) 19** with **[Vite](https://vite.dev/)**: frontend UI and build tool
- **[Supabase](https://supabase.com/)**: PostgreSQL database, user authentication, and Row Level Security
- **[@supabase/supabase-js](https://supabase.com/docs/reference/javascript)**: client library for talking to Supabase from the browser
- **[Netlify](https://www.netlify.com/)**: hosting for the deployed app
- **Git & GitHub**: version control
- **AI tools**: [Claude Code](https://claude.com/claude-code) was used to plan, write, and test the code

## How it works

```
Browser (React app)  ──supabase-js──▶  Supabase
  • Auth screens                         • Auth (email + password)
  • Habit list / forms                   • Postgres: habits, habit_logs
                                         • Row Level Security policies
```

There is no custom backend server. The React app talks directly to Supabase using the public "anon" key. This is safe because **Row Level Security** policies in the database only allow each logged-in user to read and write rows where `user_id` matches their own account.

### Database schema

Defined in [`supabase/schema.sql`](supabase/schema.sql).

**`habits`**: one row per habit

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `user_id` | uuid | Owner; defaults to the logged-in user (`auth.uid()`) |
| `name` | text | Required, 1–100 characters |
| `description` | text | Optional |
| `color` | text | Hex color, e.g. `#4f46e5` |
| `created_at` | timestamptz | Set automatically |

**`habit_logs`**: one row per day a habit was completed

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `habit_id` | uuid | References `habits.id`; deleted automatically when the habit is deleted |
| `user_id` | uuid | Owner; defaults to the logged-in user |
| `date` | date | The day it was completed. Unique per habit, so a habit can only be checked off once per day |

## Project structure

```
├── index.html                 # Page shell that loads the React app
├── netlify.toml               # Netlify build settings
├── .env.example               # Template for the Supabase environment variables
├── supabase/
│   └── schema.sql             # Database tables + Row Level Security policies
└── src/
    ├── main.jsx               # React entry point
    ├── App.jsx                # Tracks login state; shows Auth or Dashboard
    ├── supabaseClient.js      # Creates the Supabase client from env variables
    ├── dates.js               # Date helpers + streak calculation
    ├── constants.js           # Habit color options
    ├── index.css / App.css    # Styling (light + dark mode)
    └── components/
        ├── Auth.jsx           # Login / register form
        ├── Dashboard.jsx      # Loads data; create, update, delete, check-off logic
        ├── HabitForm.jsx      # Form for creating and editing a habit
        └── HabitList.jsx      # Habit cards with check-off, streak, and 7-day history
```

## Setup instructions (run it locally)

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or newer
- A free [Supabase](https://supabase.com/) account

### 1. Clone and install

```bash
git clone https://github.com/TonyMalayil/ed2_AI_software_practice.git
cd ed2_AI_software_practice
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com/dashboard).
2. Open **SQL Editor → New query**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and click **Run**.
3. _(Optional, recommended for testing)_ Go to **Authentication → Sign In / Providers → Email** and turn off **Confirm email** so new accounts can log in immediately.

### 3. Add your environment variables

```bash
cp .env.example .env
```

Fill in `.env` with the values from **Supabase → Project Settings → API**:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

> Use the **anon / public** key only. Never put the `service_role` key in a frontend app.

### 4. Run the app

```bash
npm run dev
```

Open http://localhost:5173, register an account, and start adding habits.

### Other commands

```bash
npm run build     # Production build into dist/
npm run preview   # Preview the production build locally
npm run lint      # Lint the code with oxlint
```

## Deployment (Netlify)

1. In Netlify, choose **Add new site → Import an existing project** and select this GitHub repository.
2. The build settings are read from [`netlify.toml`](netlify.toml) (`npm run build`, publish `dist`).
3. Under **Site configuration → Environment variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Deploy. Then, in **Supabase → Authentication → URL Configuration**, set the **Site URL** to your Netlify URL.

## Author

Tony Malayil, Engineering Design 2, Florida Atlantic University
