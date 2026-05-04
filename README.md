# SafeText AI — Cyberbullying & Toxicity Detection

> **Final Year Project** — A production-ready, full-stack AI web application that detects cyberbullying, toxicity, sarcasm, and sentiment in text. Every feature uses real database-backed data — nothing is mocked.

---

## What the Project Does

SafeText AI allows users to submit text (social media posts, messages, comments) and instantly receive:
- **Toxicity Score** — how harmful the content is (0–100%)
- **Cyberbullying Probability** — likelihood of bullying or harassment (0–100%)
- **Sentiment Analysis** — positive, negative, or neutral
- **Sarcasm Detection** — identifies masked or ironic harmful intent

All results are saved to a personal dashboard with full history, statistics, auto-alerts, trending topic analysis, and an admin panel for platform-wide monitoring.

---

## Tech Stack

| Layer | Technology | Why We Use It |
|---|---|---|
| **Frontend** | React 18 + TypeScript + Vite | Fast component re-renders for a 14-tab live dashboard; Vite starts in milliseconds vs CRA |
| **Styling** | Tailwind CSS + Framer Motion | Utility-first CSS with built-in dark mode; Framer for smooth animations |
| **Icons** | Lucide Icons | 2000+ consistent SVG icons, tree-shakable |
| **HTTP Client** | Axios | Single interceptor auto-attaches JWT to every request and handles 401 redirects globally |
| **Backend** | Python 3.11 + Flask 3 | Lightweight, no ORM magic — full SQL control; fast to build and easy to extend |
| **Auth** | Flask-JWT-Extended + bcrypt | Stateless JWT scales without sessions; bcrypt cost=12 makes brute-force impractical |
| **Database** | PostgreSQL on Supabase | Relational integrity with cascade deletes; Supabase gives managed cloud with SSL |
| **DB Driver** | psycopg2 (direct) | Direct SQL driver — faster and more flexible than Supabase REST API |
| **Toxicity AI** | BERT (`toxic-comment-model`) | Transformer model understands context — knows "I'll kill this level" ≠ "I'll kill you" |
| **Sarcasm/Sentiment** | Gemini 2.0 Flash API | LLM-level language understanding; sarcasm is impossible to detect with keyword rules |
| **Fallback** | Keyword rule engine | Guarantees a result even if both BERT and Gemini APIs are down |

---

## Project Structure

```
cyberbulling/
│
├── backend/
│   ├── app.py                          # Flask app factory, CORS, blueprint registration
│   ├── config.py                       # JWT secret, DB URL from environment
│   ├── main.py                         # Entry point — runs on port 8000
│   │
│   ├── controllers/
│   │   ├── auth_controller.py          # signup, login, profile update, password change
│   │   ├── analysis_controller.py      # calls classifier, returns scores
│   │   ├── history_controller.py       # save/fetch/delete history + auto-alerts
│   │   ├── admin_controller.py         # users, history, stats, notifications, reports
│   │   ├── activity_controller.py      # activity log, alerts from alerts table
│   │   ├── settings_controller.py      # UPSERT user settings to user_settings table
│   │   ├── contact_controller.py       # contact form → contact_messages, tickets → support_tickets
│   │   └── api_keys_controller.py      # create / list / delete / regenerate API keys
│   │
│   ├── models/
│   │   ├── user.py                     # User CRUD (bcrypt hashing, find by email/id)
│   │   └── analysis_history.py         # History CRUD
│   │
│   ├── routes/
│   │   ├── auth.py                     # POST /signup  POST /login  GET /user  POST /profile/update
│   │   ├── analysis.py                 # POST /analyze
│   │   ├── history.py                  # POST /history/add  GET /history/<user_id>  DELETE /history/delete/<id>
│   │   ├── admin.py                    # GET /admin/users  GET /admin/history  DELETE /admin/user/<id>
│   │   ├── activity.py                 # GET /activity/<user_id>  GET /alerts/<user_id>
│   │   ├── settings.py                 # POST /settings/save  GET /settings/get
│   │   ├── contact.py                  # POST /contact/send  POST /contact/support/ticket
│   │   └── api_keys.py                 # GET /apikeys  POST /apikeys  DELETE /apikeys/<id>
│   │
│   ├── bert_model/                     # Trained BERT model files (local inference)
│   │
│   └── utils/
│       ├── classifier.py               # 4-layer AI pipeline (BERT → Gemini → keyword fallback)
│       └── helpers.py                  # format_response() / format_error()
│
├── database/
│   └── connection.py                   # psycopg2 context manager + init_db() auto-migration
│
├── migrations/
│   └── 001_initial_schema.sql          # Full schema — all tables
│
├── frontend/
│   └── src/
│       ├── api/
│       │   ├── api.js                  # Axios client + all API endpoint groups
│       │   └── config.js               # API base URL (http://127.0.0.1:8000)
│       │
│       ├── context/
│       │   └── AuthProvider.jsx        # Global auth state, JWT in localStorage
│       │
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Footer.jsx
│       │   ├── ProtectedRoute.jsx      # Auth guard — redirects unauthenticated users
│       │   ├── DashboardSidebar.jsx
│       │   ├── HistoryTable.jsx
│       │   ├── ResultCard.jsx
│       │   └── Spinner.jsx
│       │
│       └── pages/
│           ├── Home.jsx
│           ├── About.jsx
│           ├── Services.jsx
│           ├── Contact.jsx
│           ├── Login.jsx
│           ├── Signup.jsx
│           ├── Dashboard.jsx           # Shell with sidebar, real notifications from alerts table
│           ├── Analyze.jsx             # Text analysis + save to history + PDF export
│           ├── History.jsx             # Full history — sort, filter, CSV export, delete
│           ├── Statistics.jsx          # Real stats with 7d/30d/90d/all-time filter
│           ├── Reports.jsx             # Weekly/monthly reports — generate + CSV download
│           ├── Alerts.jsx              # Real alerts from alerts table (auto-created on toxicity >50%)
│           ├── ActivityFeed.jsx        # Timeline of all analyses
│           ├── TrendingTopics.jsx      # Pattern detection with real trend % vs previous period
│           ├── APIManagement.jsx       # Full CRUD — keys stored in user_api_keys table
│           ├── ContentReview.jsx       # Moderation queue with computed detection rate
│           ├── AdvancedSearch.jsx      # Full-text + severity + date + sentiment filter
│           ├── DataExport.jsx          # CSV / JSON download of real history
│           ├── TwitterAnalysis.jsx     # Analyze live tweets by URL
│           ├── VictimMonitoring.jsx    # Track harassment on monitored profiles
│           ├── BehaviorPrediction.jsx  # AI-powered risk forecasting
│           ├── Profile.jsx             # Account settings — pre-filled from backend
│           ├── DashboardSettings.jsx   # Preferences — UPSERT to user_settings table
│           ├── Support.jsx             # Feedback form → support_tickets table
│           └── Admin.jsx               # Admin panel — users, flagged content, notifications
│
├── .env                                # All secrets (see Environment Setup below)
├── pyproject.toml                      # Python dependencies
└── README.md
```

---

## AI Classifier — 4-Layer Pipeline

**File:** `backend/utils/classifier.py`

The classifier runs 4 layers in priority order. If a layer fails, the next one takes over — the API always returns a result.

```
Input Text
    │
    ▼
Layer 1 — Text Normalization
    Regex deobfuscation: A$$ → ass, F*ck → fuck, SCHITT → shit
    20+ patterns to defeat profanity masking
    │
    ▼
Layer 2 — BERT Toxicity Model
    Model: martin-ha/toxic-comment-model (HuggingFace)
    Local: bert_model/ directory (if present)
    Fallback: HuggingFace Inference API (HF_TOKEN)
    Returns: toxicity_score (0–1), cyberbullying_prob (0–1)
    Boosts cyberbullying score if personal attack markers found
    │
    ▼
Layer 3 — Gemini 2.0 Flash (Sarcasm + Sentiment)
    API: Google Generative AI (GEMINI_API_KEY)
    temperature = 0 → deterministic output, no randomness
    Fallback cascade: gemini-2.0-flash → gemini-2.0-flash-lite → gemini-1.5-flash
    Skips gracefully on rate limits (HTTP 429)
    Returns: sarcasm (bool), sentiment (positive/negative/neutral)
    │
    ▼
Layer 4 — Keyword Fallback (Zero Dependency)
    Deterministic word lists: extreme, severe, moderate, attack phrases
    Activates only if BERT + Gemini both fail
    Guarantees a result in all conditions
    │
    ▼
SHA-256 Cache Check → identical text returns instantly
    │
    ▼
Output: { toxicity_score, cyberbullying_prob, sarcasm, sentiment }
```

**Why BERT for toxicity?** Transformers understand context. "I'll kill this level" scores low; "I'll kill you" scores high. Keyword rules cannot do this.

**Why Gemini for sarcasm?** Sarcasm is irony — "Oh great, another idiot" is negative despite containing "great". Only a large language model understands this. `temperature=0` makes it deterministic and reproducible.

**Why a keyword fallback?** The app should never return an error to the user because an external API is down. The fallback ensures 100% uptime for results.

**Output format:**
```json
{
  "toxicity_score": 0.72,
  "cyberbullying_prob": 0.65,
  "sarcasm": false,
  "sentiment": "negative"
}
```

---

## Data Flow: End-to-End

```
1. User types text → clicks "Analyze"
        ↓
2. POST /analyze → 4-layer classifier pipeline runs
        ↓
3. Frontend shows scores on ResultCard (toxicity %, cyberbullying %, sentiment, sarcasm)
        ↓
4. User clicks "Save Result" (must be logged in)
        ↓
5. POST /history/add  { text, toxicity_score, cyberbullying_prob, sarcasm, sentiment }
   Header: Authorization: Bearer <JWT>
        ↓
6. Backend: verify JWT → extract user_id
   → INSERT row into analysis_history
   → AUTO-ALERT: if toxicity_score > 0.5 OR cyberbullying_prob > 0.5
       → INSERT row into alerts table with severity (low/medium/high/critical)
        ↓
7. Dashboard tabs update with live data:
   History tab  → GET /history/<user_id>
   Alerts tab   → GET /alerts/<user_id>
   Stats tab    → computed from history rows
```

---

## Database Schema

10 tables. Auto-initialised on backend startup using `CREATE TABLE IF NOT EXISTS`.

| Table | Purpose |
|---|---|
| `users` | Accounts, profiles, roles (user / admin) |
| `analysis_history` | Every saved analysis — text + all 4 scores |
| `alerts` | Auto-created when toxicity or cyberbullying > 50% |
| `activities` | User action log with JSONB metadata |
| `user_settings` | Per-user dashboard preferences (theme, notifications, etc.) |
| `contact_messages` | Public contact form submissions |
| `support_tickets` | Authenticated support requests |
| `user_api_keys` | API credentials with usage tracking |
| `monitored_profiles` | Twitter usernames being watched for harassment |
| `admin_notifications` | Admin → user broadcast messages |

**Key design decisions:**
- `ON DELETE CASCADE` on all `user_id` foreign keys — delete a user and all their data is gone automatically
- `UNIQUE` constraints on email, api key values, and monitored profile tuples
- Indexes on `user_id` columns for fast per-user queries

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
| `POST` | `/apikeys` | JWT | Create key (`sk_live_` or `sk_test_` prefix) |
| `DELETE` | `/apikeys/<id>` | JWT | Delete key |
| `POST` | `/apikeys/<id>/regenerate` | JWT | Issue new key value, same name/env |

### Admin *(role = admin required)*
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/admin/users` | JWT + Admin | All registered users with stats |
| `GET` | `/admin/history` | JWT + Admin | All analysis history across all users |
| `DELETE` | `/admin/user/<id>` | JWT + Admin | Delete user + cascade all their data |
| `POST` | `/admin/notify` | JWT + Admin | Send notification to a user or broadcast |

---

## Dashboard Features (14 Tabs)

All tabs read live data from PostgreSQL — no mock values anywhere.

| Tab | Data Source | Key Features |
|---|---|---|
| **Analyze Text** | `POST /analyze` + `POST /history/add` | Real-time scoring, PDF export, auto-save |
| **Analysis History** | `GET /history/<id>` | Sort, filter, CSV export, delete |
| **Statistics** | `GET /history/<id>` | 7d/30d/90d/all-time views, dynamic insights |
| **Reports** | `GET /history/<id>` | Weekly/monthly grouping, CSV download |
| **Alerts** | `GET /alerts/<id>` | Auto-created on toxicity >50%, severity levels |
| **Activity Feed** | `GET /history/<id>` | Timeline of all analyses |
| **Trending Topics** | `GET /history/<id>` | Regex pattern detection, trend % vs prior period |
| **API Management** | `/apikeys` CRUD | Create/delete/regenerate keys |
| **Content Review** | `GET /history/<id>` | Moderation queue, approve/reject |
| **Advanced Search** | `GET /history/<id>` | Keyword + severity + date + sentiment filter |
| **Data Export** | `GET /history/<id>` | CSV and JSON download |
| **Profile Settings** | `GET /user` + `POST /profile/update` | Pre-filled from backend |
| **Dashboard Settings** | `/settings/get` + `/settings/save` | Persists across sessions |
| **Support** | `POST /contact/support/ticket` | Saves to `support_tickets` table |

### Advanced Features
| Feature | Description |
|---|---|
| **Twitter Analysis** | Analyze live tweets by URL using Twitter Bearer Token |
| **Victim Monitoring** | Track harassment targeting specific Twitter profiles |
| **Behavior Prediction** | AI-powered risk forecasting based on historical patterns |

### Admin Panel *(admin role only)*
- **Overview** — platform-wide content breakdown + live activity feed
- **Flagged Content** — all toxic submissions across all users
- **Users** — full user list, analysis counts, delete button (cascade)
- **Notifications** — send messages to individual users or broadcast to all

---

## Authentication Flow

```
POST /signup or /login
    → bcrypt verify password
    ← { access_token, user: { id, name, email, role } }

Frontend:
    localStorage.setItem('authToken', token)
    localStorage.setItem('user', JSON.stringify(user))

All protected requests:
    Axios interceptor → Header: Authorization: Bearer <token>

On 401 response:
    Axios interceptor → clear localStorage → redirect /login
```

Tokens expire after **7 days**. Role (`user` / `admin`) is read from the database on every login — never stored only in the token.

---

## Security

- Passwords hashed with **bcrypt** (cost factor 12) — ~300ms per hash, brute-force impractical
- JWT tokens expire after **7 days**
- All protected routes validate JWT before processing
- History deletion enforces ownership — users can only delete their own records
- Admin routes check `role = 'admin'` in the database before returning cross-user data
- `ON DELETE CASCADE` prevents orphaned records when users are deleted
- CORS is configured to accept requests from `localhost:5173` and the production frontend URL

---

## Environment Setup

**`.env` (backend root):**
```env
DATABASE_URL=postgresql://postgres.<ref>:<password>@aws-<region>.pooler.supabase.com:5432/postgres
JWT_SECRET_KEY=<generate-a-long-random-string>
GEMINI_API_KEY=<google-generative-ai-key>
HF_TOKEN=<huggingface-inference-api-token>
TWITTER_BEARER_TOKEN=<twitter-api-v2-bearer-token>
```

**`frontend/.env.local`:**
```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

---

## Running the Project

### Prerequisites
- Python 3.11+, Node.js 18+
- A PostgreSQL database (Supabase recommended)

### Start Backend
```bash
# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

# Install dependencies (first time only)
pip install flask flask-jwt-extended psycopg2-binary python-dotenv bcrypt requests flask-cors google-generativeai

# Run — tables are auto-created on first start
python main.py
# → Listening on http://0.0.0.0:8000
```

### Start Frontend
```bash
cd frontend
npm install        # first time only
npm run dev
# → http://localhost:5173
```

### Deploy on Vercel
1. Connect the repository root to a Vercel project
2. Build command: `npm run build` (delegates to `frontend/`)
3. Output directory: `frontend/dist`
4. Add environment variable `VITE_API_BASE_URL` pointing to your deployed backend
5. The root `vercel.json` handles client-side routing

---

## Why Each Technology Was Chosen

### React + Vite (not plain HTML or Django templates)
The dashboard has 14 interactive tabs that all share the same live state (user info, history count, alert badges). React's component model means when new data arrives, only the affected components re-render. Vite replaces Create React App because it starts dev server in under 1 second and hot-reloads changes instantly.

### Flask (not Django or FastAPI)
Flask is minimal — no ORM, no admin auto-generation, no migration system. This forces explicit, readable code. Every SQL query is written by hand which means we control exactly what queries run and can optimise them. For a final-year project with a defined scope, Flask's simplicity is an advantage over Django's complexity.

### psycopg2 Direct Connection (not Supabase REST/JS client)
Supabase provides a REST API, but using it from Python adds latency and restricts query expressiveness. psycopg2 connects directly to PostgreSQL with a persistent connection pool, supports full SQL (JOINs, CTEs, transactions), and is faster by an order of magnitude for bulk queries.

### BERT for Toxicity (not simple keyword matching)
Keyword matching cannot understand context. "I want to kill this bug" is safe; "I want to kill you" is a threat. Both contain "kill". BERT was trained on millions of toxic comments and learns contextual meaning — it assigns low toxicity to the first and high toxicity to the second. This is the core value of the ML layer.

### Gemini API for Sarcasm & Sentiment (not VADER or TextBlob)
VADER and TextBlob are rule-based sentiment tools — they score "Great, another idiot ruined my day" as positive because of the word "great". Gemini understands that this sentence is sarcastic and negative because it reads full context. Sarcasm detection is an LLM problem, not a lexicon problem.

### 4-Layer Fallback Architecture
Production systems must handle API failures. If HuggingFace is down, Gemini still runs. If Gemini is rate-limited, keywords still run. The result is a system with 100% uptime for the analysis feature — it degrades gracefully rather than throwing errors.

### JWT (not sessions)
Sessions require server-side storage. With JWT, the server is stateless — any backend instance can verify any token without a shared session store. This makes the backend horizontally scalable and simplifies deployment.

### PostgreSQL CASCADE Deletes
When a user is deleted by an admin, their analysis history, alerts, API keys, settings, support tickets, and monitored profiles should all be deleted too. Without CASCADE, the admin route would need to manually delete from 8 tables in the correct order. CASCADE makes this atomic and automatic.

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Production-ready releases |
| `dev` | Active development |

---

*Built with React + Flask + PostgreSQL + BERT + Gemini · Final Year Project 2026*
