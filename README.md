# SafeText AI — Cyberbullying & Toxicity Detection

A full-stack AI-powered web app that detects cyberbullying, toxicity, sarcasm, and sentiment in text. Built as a Final Year Project.

---

## Project Structure

```
cyberbulling/
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── api/            # Axios API calls to backend
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Auth context (AuthProvider)
│   │   ├── lib/            # Supabase client
│   │   ├── pages/          # Route pages (Home, Login, Dashboard, etc.)
│   │   ├── types/          # TypeScript type definitions
│   │   ├── App.tsx         # Root component with routes
│   │   ├── main.tsx        # React entry point
│   │   └── index.css       # Global styles (Tailwind)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── backend/                # Flask REST API
│   ├── app.py              # Flask app factory
│   ├── config.py           # App config (JWT, env vars)
│   ├── controllers/        # Business logic
│   │   ├── auth_controller.py
│   │   ├── admin_controller.py
│   │   ├── analysis_controller.py
│   │   └── history_controller.py
│   ├── models/             # Data models (Supabase REST)
│   │   ├── user.py
│   │   └── analysis_history.py
│   ├── routes/             # API route definitions
│   │   ├── auth.py
│   │   ├── admin.py
│   │   ├── analysis.py
│   │   └── history.py
│   └── utils/              # Helpers & AI classifier
│       ├── classifier.py
│       └── helpers.py
│
├── database/               # Database connection utilities
│   ├── __init__.py
│   └── connection.py       # psycopg2 connection manager + init_db
│
├── migrations/             # SQL migration files (run in order)
│   └── 001_initial_schema.sql
│
├── main.py                 # Backend entry point (runs Flask)
├── .env                    # Environment variables (never commit this)
├── .gitignore
└── README.md
```

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18, Vite, TypeScript, Tailwind CSS |
| Animations | Framer Motion                           |
| Icons      | Lucide React                            |
| HTTP       | Axios                                   |
| Backend    | Python, Flask, Flask-JWT-Extended       |
| Database   | PostgreSQL (Supabase)                   |
| Auth       | JWT tokens (bcrypt password hashing)    |

---

## Environment Setup

Create a `.env` file in the project root:

```env
# Supabase (used by backend REST calls)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Supabase (used by frontend Vite)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# PostgreSQL direct connection
DATABASE_URL=postgresql://postgres.your-ref:password@aws-region.pooler.supabase.com:5432/postgres
```

---

## Running the Project

### 1. Backend (Flask API)

```bash
# From project root
python main.py
```

Runs on: `http://127.0.0.1:8000`

### 2. Frontend (React + Vite)

```bash
# From project root
cd frontend
npm install       # first time only
npm run dev
```

Runs on: `http://localhost:5000`

### Run Both at the Same Time

Open **two terminals**:

```bash
# Terminal 1 — Backend
python main.py

# Terminal 2 — Frontend
cd frontend && npm run dev
```

---

## Database Migrations

The schema is auto-created on backend startup via `database/connection.py`.

To apply manually, run the SQL in order:

```bash
# Using psql
psql $DATABASE_URL -f migrations/001_initial_schema.sql
```

Tables created:
- `users` — stores registered users with hashed passwords and roles
- `analysis_history` — stores each text analysis result per user

---

## API Endpoints

### Auth
| Method | Endpoint  | Description        |
|--------|-----------|--------------------|
| POST   | /signup   | Register new user  |
| POST   | /login    | Login, returns JWT |
| GET    | /user     | Get current user   |

### Analysis
| Method | Endpoint  | Description          |
|--------|-----------|----------------------|
| POST   | /analyze  | Analyze text for cyberbullying |

### History
| Method | Endpoint          | Description              |
|--------|-------------------|--------------------------|
| POST   | /history/add      | Save an analysis result  |
| GET    | /history/:user_id | Get history for a user   |

### Admin (requires admin role)
| Method | Endpoint              | Description       |
|--------|-----------------------|-------------------|
| GET    | /admin/users          | List all users    |
| GET    | /admin/history        | List all history  |
| DELETE | /admin/user/:id       | Delete a user     |

---

## Default Admin Login

```
Email:    admin@safetext.com
Password: admin123
```

Regular users can register via the `/signup` page.

---

## Key Pages & Dashboard Tabs

### Public Pages
| Route          | Page             | Access       |
|----------------|------------------|--------------|
| /              | Home             | Public       |
| /about         | About            | Public       |
| /services      | Services         | Public       |
| /contact       | Contact          | Public       |
| /login         | Login            | Public       |
| /signup        | Sign Up          | Public       |

### Dashboard (14 Tabs)
| Route                    | Page                  | Description                    |
|--------------------------|-----------------------|--------------------------------|
| /dashboard/analyze       | Analyze Text         | Check content for toxicity     |
| /dashboard/history      | Analysis History     | View past analysis results     |
| /dashboard/statistics   | Statistics           | Analytics & metrics dashboard |
| /dashboard/reports      | Reports              | Generate analysis reports     |
| /dashboard/alerts       | Alerts & Warnings    | Monitor detected threats       |
| /dashboard/activity    | Activity Feed        | Real-time activity timeline    |
| /dashboard/trending     | Trending Topics      | Top harmful patterns          |
| /dashboard/api          | API Management       | Manage API keys                |
| /dashboard/review      | Content Review       | Manual content moderation      |
| /dashboard/search       | Advanced Search      | Search & filter content        |
| /dashboard/export      | Data Export          | Export data (CSV/JSON/Excel)  |
| /dashboard/profile     | Profile Settings     | Manage account                 |
| /dashboard/settings   | Dashboard Settings   | Customize preferences          |
| /dashboard/support     | Support              | Help & feedback                |

### Admin
| Route          | Page             | Access       |
|----------------|------------------|--------------|
| /admin         | Admin Panel      | Admin only   |

---

## Dashboard Features

### Core Analysis
- **Analyze Text** — Real-time AI-powered toxicity detection
- **Analysis History** — Browse and manage past analysis results

### Analytics & Insights
- **Statistics** — Comprehensive metrics with time range filters
- **Reports** — Generate weekly/monthly/custom reports
- **Alerts** — Monitor critical threats and warnings
- **Activity Feed** — Real-time timeline of all system events
- **Trending Topics** — Track most common harmful patterns

### Developer Tools
- **API Management** — Create and manage API keys for integrations
- **Advanced Search** — Powerful search with filters and export
- **Data Export** — Export data in CSV, JSON, or Excel format

### User Management
- **Content Review** — Manual moderation queue for flagged content
- **Profile Settings** — Account management and preferences
- **Dashboard Settings** — Notification and privacy preferences
- **Support** — FAQ, feedback submission, and resources

---

## Build for Production

```bash
# Frontend
cd frontend
npm run build
# Output in frontend/dist/

# Backend — use a production WSGI server
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 main:app
```

---

*Built for a safer internet — Final Year Project*
