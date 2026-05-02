# SafeText AI — Cyberbullying & Toxicity Detection

A full-stack AI-powered web application that detects cyberbullying, toxicity, sarcasm, and sentiment in text. Built as a Final Year Project.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Backend | Flask (Python), Flask-JWT-Extended, Flask-CORS |
| Database | PostgreSQL via Supabase (direct psycopg2 + REST API) |
| Auth | Custom JWT (bcrypt password hashing) |
| ML Model | Rule-based classifier (BERT integration coming) |

---

## Project Structure

```
cyberbulling/
├── backend/
│   ├── app.py                        # Flask app factory
│   ├── config.py                     # JWT & env config
│   ├── main.py                       # Entry point (port 8000)
│   ├── controllers/
│   │   ├── auth_controller.py        # Signup, login, profile, password
│   │   ├── analysis_controller.py    # Text classification
│   │   ├── history_controller.py     # Save & fetch analysis history
│   │   ├── admin_controller.py       # Admin: users & flagged content
│   │   ├── activity_controller.py    # Activities & alerts
│   │   ├── settings_controller.py    # User settings (DB-persisted)
│   │   ├── contact_controller.py     # Contact form & support tickets
│   │   └── api_keys_controller.py    # API key CRUD
│   ├── models/
│   │   ├── user.py                   # User model (Supabase REST)
│   │   └── analysis_history.py       # History model (psycopg2)
│   ├── routes/
│   │   ├── auth.py       /signup /login /user /profile/update /password/update
│   │   ├── analysis.py   /analyze
│   │   ├── history.py    /history/add  /history/<user_id>
│   │   ├── admin.py      /admin/users  /admin/history  /admin/user/<id>
│   │   ├── activity.py   /activity/<user_id>  /activity/log  /alerts/<user_id>
│   │   ├── settings.py   /settings/save  /settings/get
│   │   ├── contact.py    /contact/send  /contact/support/ticket
│   │   └── api_keys.py   /apikeys  /apikeys/<id>  /apikeys/<id>/regenerate
│   └── utils/
│       ├── classifier.py             # Active: rule-based classifier
│       ├── classifier_template_bert.py   # Template for BERT (tomorrow)
│       └── helpers.py                # format_response / format_error
│
├── frontend/src/
│   ├── api/api.js                    # Axios client + all API modules
│   ├── context/AuthProvider.jsx      # Global auth state (JWT in localStorage)
│   ├── components/
│   │   ├── ProtectedRoute.jsx        # Auth guard
│   │   ├── DashboardSidebar.jsx
│   │   ├── HistoryTable.jsx
│   │   ├── ResultCard.jsx
│   │   ├── Navbar.jsx / Footer.jsx
│   │   └── Spinner.jsx / Tooltip.jsx
│   └── pages/
│       ├── Login.jsx / Signup.jsx
│       ├── Dashboard.jsx             # Shell with sidebar + nested routes
│       ├── Analyze.jsx               # Text analysis (saves via backend API)
│       ├── History.jsx               # Sortable, filterable, CSV export
│       ├── Statistics.jsx            # Real stats + time range filter
│       ├── Reports.jsx               # Weekly reports grouped by date
│       ├── Alerts.jsx                # Derived from analysis_history scores
│       ├── ActivityFeed.jsx          # Analysis activity timeline
│       ├── TrendingTopics.jsx        # Pattern analysis with time filter
│       ├── APIManagement.jsx         # Full CRUD API keys (DB-persisted)
│       ├── ContentReview.jsx         # Moderation queue
│       ├── AdvancedSearch.jsx        # Real search + filters on history
│       ├── DataExport.jsx            # CSV/JSON download
│       ├── Profile.jsx               # Account settings (loaded from backend)
│       ├── DashboardSettings.jsx     # App settings (DB-persisted)
│       ├── Support.jsx               # Feedback → backend support_tickets
│       ├── Admin.jsx                 # Admin panel
│       └── Contact.jsx               # Public contact form → DB
│
├── database/connection.py            # psycopg2 context manager + init_db()
├── migrations/001_initial_schema.sql # Full schema
└── .env                              # DATABASE_URL, SUPABASE_*, JWT_SECRET_KEY
```

---

## Database Tables

| Table | Purpose |
|---|---|
| `users` | Auth — name, email, password_hash, role, bio, location, website |
| `analysis_history` | Every saved analysis result |
| `activities` | Activity log (login, analysis events) |
| `alerts` | Auto-generated when toxicity > 50% |
| `user_settings` | Per-user dashboard settings (UPSERT) |
| `contact_messages` | Public contact form submissions |
| `support_tickets` | Authenticated user support tickets |
| `user_api_keys` | Generated API keys per user |

---

## API Endpoints

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/signup` | — | Register new user |
| POST | `/login` | — | Login, returns JWT |
| GET | `/user` | JWT | Get current user |
| POST | `/profile/update` | JWT | Update name/bio/location/website |
| POST | `/password/update` | JWT | Change password |

### Analysis
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/analyze` | — | Analyze text for toxicity/cyberbullying/sentiment/sarcasm |

### History
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/history/add` | JWT | Save analysis result (auto-creates alert if toxic) |
| GET | `/history/<user_id>` | JWT | Fetch user's history |

### Activity & Alerts
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/activity/<user_id>` | JWT | User activities |
| POST | `/activity/log` | JWT | Log an activity |
| GET | `/alerts/<user_id>` | JWT | User alerts (generated on toxic saves) |

### Settings
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/settings/save` | JWT | Save all settings to DB (UPSERT) |
| GET | `/settings/get` | JWT | Load settings (returns defaults if none) |

### Contact
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/contact/send` | — | Public contact form → `contact_messages` |
| POST | `/contact/support/ticket` | JWT | Support ticket → `support_tickets` |

### API Keys
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/apikeys` | JWT | List user's API keys |
| POST | `/apikeys` | JWT | Create new key |
| DELETE | `/apikeys/<id>` | JWT | Delete key |
| POST | `/apikeys/<id>/regenerate` | JWT | Regenerate key value |

### Admin
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/admin/users` | JWT+Admin | All users |
| GET | `/admin/history` | JWT+Admin | All history |
| DELETE | `/admin/user/<id>` | JWT+Admin | Delete user |

---

## Running the Project

```bash
# Terminal 1 — Backend (port 8000)
python main.py

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Create a `.env` at the project root:
```
DATABASE_URL=postgresql://...supabase.com:5432/postgres
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
JWT_SECRET_KEY=your-secret-key
```

---

## Current Classifier Status

The active classifier (`backend/utils/classifier.py`) is a **rule-based keyword model** used temporarily.

**BERT model integration is planned for the next session** — see `backend/utils/classifier_template_bert.py` for the integration template. Once the trained model is ready, swap `classify_text()` in `classifier.py` with the BERT version and the rest of the system requires no changes.

---

## Dashboard Features (All Functional)

| Tab | Data Source | Status |
|---|---|---|
| Analyze Text | Backend `/analyze` + `/history/add` | Real |
| Analysis History | Supabase `analysis_history` | Real |
| Statistics | Supabase `analysis_history` + time filter | Real |
| Reports | Grouped by week from Supabase | Real |
| Alerts | Auto-created on toxic saves, from `alerts` table | Real |
| Activity Feed | Derived from `analysis_history` | Real |
| Trending Topics | Pattern analysis on history + time filter | Real |
| API Management | Backend CRUD on `user_api_keys` table | Real |
| Content Review | Moderation queue from history | Real |
| Advanced Search | Full-text search with filters on history | Real |
| Data Export | CSV/JSON download from Supabase | Real |
| Profile Settings | Loads from `/user` endpoint | Real |
| Dashboard Settings | Persisted to `user_settings` table | Real |
| Support & Feedback | Saves to `support_tickets` table | Real |
