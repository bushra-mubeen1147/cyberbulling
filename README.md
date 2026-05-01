# SafeText AI — Cyberbullying & Toxicity Detection

A full-stack AI-powered web application that detects cyberbullying, toxicity, sarcasm, and sentiment in text. Built as a Final Year Project.

---

## 📋 Project Overview

**SafeText AI** is a comprehensive web-based system designed to analyze text content for potentially harmful or abusive language. The application provides:

- **Real-time Text Analysis** — Analyze any text for toxicity levels
- **User Authentication** — Secure signup/login with JWT tokens
- **Analysis History** — Track and manage past analysis results
- **Dashboard Analytics** — Comprehensive statistics and reports
- **Admin Panel** — User management and system monitoring
- **Activity Tracking** — Real-time activity feed and alerts

### Core Features

| Feature | Description |
|---------|-------------|
| Toxicity Detection | Analyzes text for harmful/toxic language |
| Sarcasm Detection | Identifies sarcastic or ironic content |
| Sentiment Analysis | Determines if text is positive, negative, or neutral |
| Cyberbullying Probability | Calculates likelihood of cyberbullying |
| User Management | Admin can manage users and roles |
| Data Export | Export analysis data in CSV/JSON/Excel formats |

---

## 🛠️ Tech Stack

### Frontend Technologies

| Library/Framework | Version | Purpose |
|------------------|---------|---------|
| **React** | 18.3.1 | UI framework for building the interface |
| **Vite** | 5.4.2 | Build tool and dev server |
| **TypeScript** | 5.5.3 | Type-safe JavaScript |
| **Tailwind CSS** | 3.4.1 | Utility-first CSS framework |
| **React Router DOM** | 7.9.6 | Client-side routing |
| **Axios** | 1.13.2 | HTTP client for API calls |
| **Framer Motion** | 12.23.24 | Animation library |
| **Lucide React** | 0.344.0 | Icon library |
| **Supabase JS** | 2.57.4 | Supabase client for frontend |

### Backend Technologies

| Library/Framework | Version | Purpose |
|------------------|---------|---------|
| **Flask** | 3.1.2 | Python web framework |
| **Flask-JWT-Extended** | 4.7.1 | JWT authentication |
| **Flask-CORS** | 6.0.1 | Cross-origin resource sharing |
| **psycopg2-binary** | 2.9.11 | PostgreSQL adapter for Python |
| **bcrypt** | 5.0.0+ | Password hashing |
| **python-dotenv** | 1.2.1 | Environment variable management |
| **gunicorn** | 23.0.0 | WSGI HTTP server |

### Database

| Service | Type | Purpose |
|---------|------|---------|
| **Supabase** | PostgreSQL | Cloud database with REST API |

---

## ⚠️ Current Classifier Status

**Note:** The current classifier (`backend/utils/classifier.py`) is a **rule-based classifier** that uses keyword matching and heuristics. It is functional but not a real ML model.

To use a real ML model, replace `classifier.py` with either:
- `classifier_template_bert.py` (BERT/Transformer model)
- `classifier_template_sklearn.py` (Scikit-learn model)

See [Model Integration](#model-integration) section below.

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
│   │   ├── history_controller.py
│   │   └── activity_controller.py
│   ├── models/             # Data models (Supabase REST)
│   │   ├── user.py
│   │   └── analysis_history.py
│   ├── routes/             # API route definitions
│   │   ├── auth.py
│   │   ├── admin.py
│   │   ├── analysis.py
│   │   ├── history.py
│   │   └── activity.py
│   └── utils/              # Helpers & AI classifier
│       ├── classifier.py
│       ├── classifier_template_bert.py
│       ├── classifier_template_sklearn.py
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

## 🧰 Detailed Tech Stack

### Frontend Dependencies

| Package | Version | Description |
|---------|---------|-------------|
| `react` | ^18.3.1 | Core React library |
| `react-dom` | ^18.3.1 | React DOM rendering |
| `react-router-dom` | ^7.9.6 | Routing and navigation |
| `axios` | ^1.13.2 | HTTP client for API requests |
| `framer-motion` | ^12.23.24 | Declarative animations |
| `lucide-react` | ^0.344.0 | Icon components |
| `@supabase/supabase-js` | ^2.57.4 | Supabase JavaScript client |
| `tailwindcss` | ^3.4.1 | Utility CSS framework |
| `typescript` | ^5.5.3 | TypeScript compiler |
| `vite` | ^5.4.2 | Next-generation build tool |
| `@vitejs/plugin-react` | ^4.3.1 | Vite React plugin |
| `postcss` | ^8.4.35 | CSS transformations |
| `autoprefixer` | ^10.4.18 | Vendor prefixer for CSS |
| `eslint` | ^9.9.1 | JavaScript/TypeScript linter |

### Backend Dependencies

| Package | Version | Description |
|---------|---------|-------------|
| `flask` | ^3.1.2 | Lightweight WSGI web framework |
| `flask-cors` | ^6.0.1 | CORS handling for Flask |
| `flask-jwt-extended` | ^4.7.1 | JWT authentication for Flask |
| `psycopg2-binary` | ^2.9.11 | PostgreSQL adapter |
| `bcrypt` | ^5.0.0 | Password hashing library |
| `python-dotenv` | ^1.2.1 | Load environment variables |
| `gunicorn` | ^23.0.0 | WSGI application server |

### Optional ML Dependencies (for real model integration)

| Package | Version | Description |
|---------|---------|-------------|
| `transformers` | >=4.35.0 | Hugging Face Transformers |
| `torch` | >=2.1.0 | PyTorch deep learning |
| `tokenizers` | >=0.15.0 | Fast tokenizers |
| `scikit-learn` | >=1.3.2 | Machine learning library |

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

### Activity (requires JWT)
| Method | Endpoint          | Description              |
|--------|-------------------|--------------------------|
| GET    | /activity/:user_id | Get user activities      |
| POST   | /activity/log     | Log a new activity       |

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

## Model Integration

The project includes templates for integrating real ML models:

### Option A: BERT/Transformer Model
1. Install dependencies:
```bash
pip install transformers torch
```
2. Replace `backend/utils/classifier.py` with content from `classifier_template_bert.py`
3. Update `model_name` to your trained model path or Hugging Face model ID

### Option B: Scikit-learn Model
1. Install dependencies:
```bash
pip install scikit-learn joblib
```
2. Replace `backend/utils/classifier.py` with content from `classifier_template_sklearn.py`
3. Update model path to point to your `.joblib` or `.pkl` file

### Current Implementation
The current `classifier.py` uses keyword-based heuristics:
- Toxic word detection
- Sentiment analysis
- Sarcasm detection via pattern matching
- Returns: `toxicity_score`, `cyberbullying_prob`, `sarcasm`, `sentiment`

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
