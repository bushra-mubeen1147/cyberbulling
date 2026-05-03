# SafeText AI — Cyberbullying & Toxicity Detection

> **Final Year Project** — A production-ready, full-stack AI web application that detects cyberbullying, toxicity, sarcasm, and sentiment in text. Every feature uses real database-backed data — nothing is mocked.

---

## Overview

SafeText AI allows users to submit text (social media posts, messages, comments) and instantly receive:
- **Toxicity Score** — how harmful the content is (0–100%)
- **Cyberbullying Probability** — likelihood of bullying or harassment (0–100%)
- **Sentiment Analysis** — positive, negative, or neutral
- **Sarcasm Detection** — identifies masked harmful intent

All results are saved to a personal dashboard with full history, reports, alerts, trending pattern analysis, and an admin panel for platform monitoring.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons |
| **Backend** | Python 3.11, Flask 3, Flask-JWT-Extended |
| **Database** | PostgreSQL (Supabase hosted), psycopg2 direct connection |
| **Authentication** | Custom JWT — bcrypt password hashing, 7-day token expiry |
| **AI / ML** | Rule-based classifier (BERT model integration ready — see below) |
| **HTTP Client** | Axios with JWT interceptor |

---

## Project Structure

```
cyberbulling/
│
├── backend/
│   ├── app.py                         # Flask app factory, CORS, blueprint registration
│   ├── config.py                      # JWT secret, DB URL from environment
│   ├── main.py                        # Entry point — runs on port 8000
│   │
│   ├── controllers/
│   │   ├── auth_controller.py         # signup, login, profile update, password change
│   │   ├── analysis_controller.py     # calls classifier, returns scores
│   │   ├── history_controller.py      # save/fetch/delete analysis history + auto-alerts
│   │   ├── admin_controller.py        # list all users, all history, delete user
│   │   ├── activity_controller.py     # activity log, user alerts from alerts table
│   │   ├── settings_controller.py     # UPSERT user settings to user_settings table
│   │   ├── contact_controller.py      # contact form → contact_messages, tickets → support_tickets
│   │   └── api_keys_controller.py     # create / list / delete / regenerate API keys
│   │
│   ├── models/
│   │   ├── user.py                    # User CRUD using psycopg2 (no Supabase REST dependency)
│   │   └── analysis_history.py        # History CRUD using psycopg2
│   │
│   ├── routes/
│   │   ├── auth.py                    # POST /signup  POST /login  GET /user  POST /profile/update  POST /password/update
│   │   ├── analysis.py                # POST /analyze
│   │   ├── history.py                 # POST /history/add  GET /history/<user_id>  DELETE /history/delete/<id>
│   │   ├── admin.py                   # GET /admin/users  GET /admin/history  DELETE /admin/user/<id>
│   │   ├── activity.py                # GET /activity/<user_id>  POST /activity/log  GET /alerts/<user_id>
│   │   ├── settings.py                # POST /settings/save  GET /settings/get
│   │   ├── contact.py                 # POST /contact/send  POST /contact/support/ticket
│   │   └── api_keys.py                # GET /apikeys  POST /apikeys  DELETE /apikeys/<id>  POST /apikeys/<id>/regenerate
│   │
│   └── utils/
│       ├── classifier.py              # Active classifier (rule-based, swap for BERT)
│       ├── classifier_template_bert.py  # Ready-to-use BERT integration template
│       └── helpers.py                 # format_response() / format_error()
│
├── database/
│   └── connection.py                  # psycopg2 context manager + init_db() with migrations
│
├── migrations/
│   └── 001_initial_schema.sql         # Full schema — all 8 tables
│
├── frontend/
│   └── src/
│       ├── api/
│       │   ├── api.js                 # Axios client + authAPI, analysisAPI, historyAPI,
│       │   │                          # adminAPI, activityAPI, alertsAPI, settingsAPI,
│       │   │                          # contactAPI, apiKeysAPI
│       │   └── config.js              # API base URL (http://127.0.0.1:8000)
│       │
│       ├── context/
│       │   └── AuthProvider.jsx       # Global auth state, JWT stored in localStorage
│       │
│       ├── components/
│       │   ├── Navbar.jsx             # Public navbar with dark mode toggle
│       │   ├── Footer.jsx
│       │   ├── ProtectedRoute.jsx     # Auth guard — redirects unauthenticated users
│       │   ├── DashboardSidebar.jsx   # Dashboard navigation sidebar
│       │   ├── HistoryTable.jsx       # Reusable history list with delete
│       │   ├── ResultCard.jsx         # Analysis result display card
│       │   ├── Spinner.jsx
│       │   └── Tooltip.jsx
│       │
│       └── pages/
│           ├── Home.jsx               # Landing page
│           ├── About.jsx
│           ├── Services.jsx
│           ├── Contact.jsx            # Public contact form → backend → contact_messages table
│           ├── Login.jsx              # JWT login
│           ├── Signup.jsx             # Registration
│           ├── Dashboard.jsx          # Shell with sidebar, real notifications from alerts table
│           ├── Analyze.jsx            # Text analysis + save to history via backend
│           ├── History.jsx            # Full history — sort, filter, CSV export, delete
│           ├── Statistics.jsx         # Real stats with 7d/30d/90d/all-time filter
│           ├── Reports.jsx            # Weekly/monthly reports — generate + download CSV
│           ├── Alerts.jsx             # Real alerts from alerts table (auto-created on toxicity >50%)
│           ├── ActivityFeed.jsx       # Timeline of all analyses
│           ├── TrendingTopics.jsx     # Pattern detection with real trend % vs previous period
│           ├── APIManagement.jsx      # Full CRUD — keys stored in user_api_keys table
│           ├── ContentReview.jsx      # Moderation queue with computed detection rate
│           ├── AdvancedSearch.jsx     # Full-text + severity + date + sentiment filter
│           ├── DataExport.jsx         # CSV / JSON download of real history
│           ├── Profile.jsx            # Account settings — pre-filled from backend
│           ├── DashboardSettings.jsx  # Preferences — UPSERT to user_settings table
│           ├── Support.jsx            # Feedback form → support_tickets table
│           └── Admin.jsx              # Admin panel — real users, real flagged content
│
├── .env                               # DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY, JWT_SECRET_KEY
├── pyproject.toml                     # Python dependencies
└── README.md
```

---

## Database Schema (8 Tables)

| Table | Columns | Purpose |
|---|---|---|
| `users` | id, name, email, password_hash, role, bio, location, website, created_at, updated_at | User accounts and profiles |
| `analysis_history` | id, user_id, input_text, toxicity_score, cyberbullying_prob, result_sarcasm, sentiment, tweet_url, created_at | Every saved analysis result |
| `alerts` | id, user_id, alert_type, content, severity, is_read, created_at | Auto-created when toxicity/cyberbullying > 50% |
| `activities` | id, user_id, activity_type, description, metadata, created_at | User activity log |
| `user_settings` | id, user_id, theme, notifications_enabled, email_alerts, auto_save, privacy_mode, analysis_threshold, … | Per-user dashboard preferences |
| `contact_messages` | id, name, email, subject, message, category, created_at | Public contact form submissions |
| `support_tickets` | id, user_id, title, description, type, priority, category, status, created_at | Authenticated support requests |
| `user_api_keys` | id, user_id, name, key_value, environment, status, calls_count, last_used_at, created_at | API keys for integrations |

The database is **auto-initialised** on backend startup. `init_db()` uses `CREATE TABLE IF NOT EXISTS` + `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` so existing data is never lost when the schema evolves.

---

## API Endpoints

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/signup` | — | Register — returns JWT + user object |
| `POST` | `/login` | — | Login — returns JWT + user object |
| `GET` | `/user` | JWT | Get current user's full profile |
| `POST` | `/profile/update` | JWT | Update name, bio, location, website |
| `POST` | `/password/update` | JWT | Verify current password, set new one |
| `GET` | `/health` | — | Backend health check |

### Analysis
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/analyze` | — | Analyze text → toxicity, cyberbullying, sentiment, sarcasm |

### History
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/history/add` | JWT | Save result + auto-create alert if toxic |
| `GET` | `/history/<user_id>` | JWT | Fetch history (own only; admin sees all) |
| `DELETE` | `/history/delete/<id>` | JWT | Delete one item (ownership enforced) |

### Alerts & Activity
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/alerts/<user_id>` | JWT | Real alerts from `alerts` table |
| `GET` | `/activity/<user_id>` | JWT | Activity log |
| `POST` | `/activity/log` | JWT | Record an activity |

### Settings
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/settings/get` | JWT | Load saved settings (returns defaults if none) |
| `POST` | `/settings/save` | JWT | UPSERT all settings to `user_settings` |

### Contact
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/contact/send` | — | Public form → `contact_messages` table |
| `POST` | `/contact/support/ticket` | JWT | Support ticket → `support_tickets` table |

### API Keys
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/apikeys` | JWT | List all keys for current user |
| `POST` | `/apikeys` | JWT | Create key (random `sk_live_` or `sk_test_` prefix) |
| `DELETE` | `/apikeys/<id>` | JWT | Delete key |
| `POST` | `/apikeys/<id>/regenerate` | JWT | Issue new key value, same name/env |

### Admin *(role = admin required)*
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/admin/users` | JWT + Admin | All registered users |
| `GET` | `/admin/history` | JWT + Admin | All analysis history with user info |
| `DELETE` | `/admin/user/<id>` | JWT + Admin | Delete user + cascade all their data |

---

## Running the Project

### Prerequisites
- Python 3.11+, Node.js 18+
- A Supabase project with PostgreSQL (or any PostgreSQL instance)

### Environment Setup

Create `.env` in the project root:
```env
DATABASE_URL=postgresql://postgres.<ref>:<password>@aws-<region>.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_ANON_KEY=eyJ...
JWT_SECRET_KEY=<generate-a-long-random-string>
```

Create `frontend/.env.local`:
```env
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Start Backend
```bash
# Activate the virtual environment
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # macOS / Linux

# Install dependencies (first time only)
pip install flask flask-jwt-extended psycopg2-binary python-dotenv bcrypt requests flask-cors

# Run (tables are created automatically on first start)
python main.py
# → Listening on http://0.0.0.0:8000
```

### Start Frontend
```bash
cd frontend
npm install          # first time only
npm run dev
# → http://localhost:5000
```

### Deploy on Vercel
This project should be deployed as a frontend app on Vercel. The Flask backend must be hosted separately and exposed over HTTPS.

1. In Vercel, create or reconnect the project from the repository root.
2. Use the root build command `npm run build`; it delegates to the `frontend/` workspace and outputs to `frontend/dist`.
3. Add an environment variable named `VITE_API_BASE_URL` that points to your deployed backend API URL.
4. Deploy the project. Client-side routes are handled by the root `vercel.json`.

---

## Dashboard Features

All 14 dashboard tabs use real database data — no mock values anywhere.

| Tab | Data Source | Key Features |
|---|---|---|
| **Analyze Text** | `POST /analyze` + `POST /history/add` | Real-time scoring, PDF export, auto-save to history |
| **Analysis History** | `GET /history/<id>` | Sort by date/toxicity, filter by sentiment/safety, CSV export, delete |
| **Statistics** | `GET /history/<id>` | 7d / 30d / 90d / all-time filter, dynamic insights, sentiment breakdown |
| **Reports** | `GET /history/<id>` | Auto-groups by week or month, view modal, CSV download per report |
| **Alerts** | `GET /alerts/<id>` | Auto-created on save when toxicity >50%, unread badges, severity levels |
| **Activity Feed** | `GET /history/<id>` | Timeline of all analyses with toxicity indicators |
| **Trending Topics** | `GET /history/<id>` | Regex pattern detection, real trend % vs previous period, time filter |
| **API Management** | `/apikeys` CRUD | Create, delete, regenerate keys — persisted to `user_api_keys` table |
| **Content Review** | `GET /history/<id>` | Moderation queue, approve/reject, computed detection rate |
| **Advanced Search** | `GET /history/<id>` | Keyword search, severity, date range, sentiment filter, export |
| **Data Export** | `GET /history/<id>` | CSV and JSON download, configurable date range |
| **Profile Settings** | `GET /user` + `POST /profile/update` | Pre-filled from backend, updates name/bio/location/website |
| **Dashboard Settings** | `/settings/get` + `/settings/save` | UPSERT to `user_settings` — persists across sessions |
| **Support & Feedback** | `POST /contact/support/ticket` | Saves to `support_tickets` table in DB |

### Admin Panel *(admin role required)*
- **Overview** — real content breakdown chart + live recent activity feed
- **Flagged Content** — all toxic submissions across all users, sorted by score
- **Users** — full user list with analysis counts, flagged counts, join date, delete button

---

## AI Classifier

### Current (Active)
`backend/utils/classifier.py` — a rule-based keyword classifier used during development.

**Output format:**
```json
{
  "toxicity_score": 0.72,
  "cyberbullying_prob": 0.65,
  "sarcasm": false,
  "sentiment": "negative"
}
```

### Planned — BERT Integration
`backend/utils/classifier_template_bert.py` contains the ready-to-use integration template.

**To swap in the trained model:**
1. Place the trained model in `backend/utils/model/`
2. Copy the `classify_text()` function from `classifier_template_bert.py` into `classifier.py`
3. Restart the backend — no other changes needed

The rest of the system (routes, controllers, frontend) is model-agnostic.

---

## Authentication Flow

```
User → POST /signup (name, email, password)
     ← { access_token, user: { id, name, email, role } }

User → POST /login (email, password)
     ← { access_token, user: { id, name, email, role } }

All protected routes:
     → Header: Authorization: Bearer <access_token>
```

Tokens are stored in `localStorage` and automatically attached by the Axios request interceptor. A 401 response clears the token and redirects to `/login`.

---

## Security Notes

- Passwords are hashed with **bcrypt** (cost factor 12)
- JWT tokens expire after **7 days**
- All protected routes validate the JWT before processing
- History deletion checks ownership — users can only delete their own records
- Admin routes check `role = 'admin'` before returning cross-user data
- CORS is configured to accept requests from `localhost:5000` / `localhost:5173`

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Production-ready releases |
| `dev2` | Active development — current work |

---

*Built with React + Flask + PostgreSQL · Final Year Project 2026*
