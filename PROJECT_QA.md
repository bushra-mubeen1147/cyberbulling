# SafeText AI — Project Questions & Answers

Common questions about the project — useful for viva, presentations, and interviews.

---

## General / Overview

**Q1. What is SafeText AI and what problem does it solve?**

SafeText AI is a web application that uses artificial intelligence to detect cyberbullying, toxicity, sarcasm, and sentiment in text. The problem it solves is that online platforms — social media, comment sections, chat apps — are full of harmful content that is hard to moderate manually at scale. SafeText AI gives users and moderators a tool to automatically score any piece of text for how harmful it is, flag dangerous content instantly, and track patterns over time.

---

**Q2. Who is the target user of this system?**

There are three target users:
1. **Regular users** — individuals who want to check if content they received or wrote is toxic, or who want to monitor harassment directed at them
2. **Moderators / content managers** — people who review flagged content through the admin panel
3. **Developers** — who can integrate the analysis API into their own applications using the API key management system

---

**Q3. What makes this project different from a simple keyword filter?**

A keyword filter cannot understand context. The word "kill" in "I'll kill this level" is harmless; in "I'll kill you" it is a threat. Both sentences contain the same word. SafeText AI uses a BERT transformer model trained on millions of toxic comments — it understands the context and intent behind words, not just their presence. Additionally, the Gemini API is used for sarcasm detection, which is something keyword rules cannot do at all (e.g., "Oh great, another idiot" is negative despite containing the word "great").

---

## Technical Architecture

**Q4. Explain the overall architecture of the system.**

The system is split into three layers:

1. **Frontend** — A React 18 application built with Vite. It runs in the user's browser and communicates with the backend via HTTP (Axios). It has 20+ pages including a 14-tab personal dashboard and an admin panel.

2. **Backend** — A Python Flask API server that handles all business logic. It receives requests from the frontend, runs the AI classifier, reads/writes to the database, and enforces authentication and authorization.

3. **Database** — PostgreSQL hosted on Supabase. It stores users, analysis results, alerts, settings, API keys, and more across 10 tables. The backend connects to it directly using psycopg2.

The frontend and backend are deployed separately. The frontend is a static site (Vercel), the backend is a Python server, and the database is a managed cloud service (Supabase).

---

**Q5. Why did you choose Flask over Django or FastAPI?**

Flask was chosen because:
- **Control** — Flask has no ORM or built-in admin. Every SQL query is written explicitly, which makes the data layer clear and easy to debug.
- **Simplicity** — For a project with a defined scope, Flask's minimal setup is an advantage. Django's features (ORM, migrations, admin) are powerful but add complexity we didn't need.
- **Speed of development** — Flask blueprints let us split routes into logical groups (auth, history, admin, etc.) without boilerplate.

FastAPI would have been a valid choice for automatic API docs, but Flask was more familiar and the async performance advantage of FastAPI is not relevant for a project of this scale.

---

**Q6. Why PostgreSQL and not MongoDB or SQLite?**

- **PostgreSQL over MongoDB**: Our data is relational. Users have analysis history; history creates alerts; alerts belong to users. These relationships are best expressed with foreign keys and JOIN queries, not embedded documents. PostgreSQL also enforces `ON DELETE CASCADE` which automatically removes all a user's data when they are deleted.

- **PostgreSQL over SQLite**: SQLite is a file-based database not suitable for concurrent connections from a deployed web server. PostgreSQL handles multiple simultaneous requests safely and is production-grade.

---

**Q7. What is JWT and why is it used here instead of sessions?**

JWT (JSON Web Token) is a signed string that contains the user's ID. After login, the server creates a JWT and sends it to the browser. The browser stores it in `localStorage` and sends it in the `Authorization` header of every subsequent request.

The server does not store sessions — it just verifies the signature on the JWT. This makes the backend **stateless**: any backend instance can verify any token without sharing session data. This is important for scalability and simplifies deployment. JWT tokens here expire after 7 days for security.

---

**Q8. How does the auto-alert system work?**

When a user saves an analysis result, the backend automatically checks the toxicity score and cyberbullying probability. If either exceeds 50%, an alert is inserted into the `alerts` table in the same database transaction. The alert includes a severity level:
- `low` — 50–65%
- `medium` — 65–80%
- `high` — 80–90%
- `critical` — above 90%

The frontend's Alerts tab reads from this table in real time. The user does not need to do anything — the alert appears automatically after saving.

---

## AI / Machine Learning

**Q9. Explain the 4-layer classifier pipeline.**

The classifier in `backend/utils/classifier.py` runs four layers in order:

1. **Text Normalization** — Regex patterns deobfuscate masked profanity (`A$$` → `ass`, `F*ck` → `fuck`). This prevents users from bypassing detection by substituting characters.

2. **BERT Toxicity Model** — A transformer model (`martin-ha/toxic-comment-model`) trained on labeled toxic comments. It returns a `toxicity_score` and `cyberbullying_prob` between 0 and 1. It first tries a local model file; if not present, it calls the HuggingFace Inference API.

3. **Gemini 2.0 Flash** — Google's large language model is called with `temperature=0` (deterministic) to classify `sarcasm` (true/false) and `sentiment` (positive/negative/neutral). It handles nuanced language that rule-based methods cannot.

4. **Keyword Fallback** — If both BERT and Gemini fail (API down, rate limit, etc.), a deterministic keyword list provides a result. This ensures the system always returns an answer.

Results from all layers are combined into a single JSON response.

---

**Q10. What is BERT and why is it suitable for toxicity detection?**

BERT (Bidirectional Encoder Representations from Transformers) is a transformer model pre-trained on a large corpus of text. "Bidirectional" means it reads words in context of both the words before and after them, unlike simpler models that read left-to-right only.

For toxicity detection, context is everything. The word "stupid" in "that was a stupid mistake I made" is self-directed and low toxicity. In "you're so stupid" it is an attack. BERT understands this distinction because it considers the full sentence.

The specific model used — `martin-ha/toxic-comment-model` — was fine-tuned on the Jigsaw Toxic Comment Classification dataset which contains thousands of labeled examples of online harassment.

---

**Q11. Why is Gemini used for sarcasm and not for toxicity?**

Sarcasm is fundamentally different from toxicity. Toxicity is about harmful language, which BERT can detect by pattern-matching on training data. Sarcasm is about **intent disguised as the opposite** — "Oh, you're so smart" said sarcastically means the opposite of what the words say.

Detecting this requires understanding tone, conversational context, and irony — which is an LLM task, not a classification task. Gemini is a large generative language model that understands these subtleties. BERT (as a classification model) is not well-suited for sarcasm.

Gemini is NOT used for toxicity because it is slower, has rate limits, and a classification model is more consistent for this well-defined task.

---

**Q12. What happens if the Gemini API is rate-limited or down?**

The classifier handles this gracefully:
- If Gemini returns HTTP 429 (rate limit), the code catches the error and skips to the keyword fallback for sentiment/sarcasm
- If HuggingFace Inference API is down, the code falls back to the keyword rules for toxicity
- The response is still returned to the user — it may have slightly less accurate sarcasm detection but it does not fail

This is called **graceful degradation** — the system degrades in quality before it fails completely.

---

**Q13. What is SHA-256 caching in the classifier?**

Identical text is hashed using SHA-256 and the hash is used as a cache key. If the same text has been analyzed before, the result is returned immediately from an in-memory dictionary without re-running BERT or calling the Gemini API.

This saves API costs and improves response time for repeated text. SHA-256 is used (not just the raw text) because it produces a fixed-length key regardless of input length and avoids memory issues with very long strings.

---

## Database Design

**Q14. Why does the database use CASCADE deletes?**

When a user account is deleted, all their associated data should be deleted too: analysis history, alerts, activity logs, settings, API keys, support tickets, and monitored profiles. Without CASCADE, the admin route would need to manually delete from 8 tables in the correct order and wrap it all in a transaction.

With `ON DELETE CASCADE` on the foreign keys, the database handles this automatically — delete one row from `users` and the database removes all related rows from all child tables. This is atomic (all or nothing) and cannot leave orphaned records.

---

**Q15. Why store settings in a database table instead of localStorage?**

`localStorage` is browser-specific and device-specific. If a user logs in from a different device or browser, their settings would be lost. Storing settings in the `user_settings` table means they are synced across all devices. The `UPSERT` pattern (INSERT or UPDATE if exists) means the settings row is created on first save and updated on subsequent saves without duplication.

---

**Q16. What are the `activities` and `alerts` tables and why are they separate?**

- **`activities`** — a general audit log. Every time a user does something meaningful (analyzes text, logs in, updates profile), an activity entry is created. It uses a JSONB `metadata` column to store flexible extra data. The Activity Feed tab reads from this table.

- **`alerts`** — specifically for toxic content flags. An alert is only created when toxicity or cyberbullying exceeds 50%. Alerts have a `severity` level and an `is_read` flag. The Alerts tab reads from this table and shows unread badges.

They are separate because their purpose is different: activities are informational, alerts are actionable. Mixing them would make it hard to show "you have 3 unread alerts" without scanning through all activity types.

---

## Frontend

**Q17. Why React and not Vue or plain HTML?**

The dashboard has 14 tabs that all share data — the user object, alert count, history data. In plain HTML, sharing state between tabs requires global variables or re-fetching data on every tab switch. React's component tree and Context API let all tabs share a single source of truth that updates reactively.

Vue would also be a valid choice. React was chosen for its larger ecosystem, better TypeScript support, and team familiarity.

---

**Q18. What does the Axios interceptor do?**

The Axios interceptor is configured in `frontend/src/api/api.js`. It runs on every outgoing request and every incoming response:

- **Request interceptor** — reads the JWT from `localStorage` and adds `Authorization: Bearer <token>` to the request header. This means no page has to manually add the auth header.
- **Response interceptor** — if a response returns HTTP 401 (Unauthorized), it automatically clears `localStorage` and redirects the user to `/login`. This handles expired tokens without any page needing to check for it.

---

**Q19. What is a ProtectedRoute and how does it work?**

`ProtectedRoute` is a React component that wraps dashboard pages. Before rendering the page, it checks if a valid JWT exists in `localStorage`. If not, it redirects to `/login`. This prevents unauthenticated users from accessing dashboard URLs directly, even if they type them in the browser.

---

**Q20. What is Framer Motion used for?**

Framer Motion is a React animation library. It is used for:
- Page transition animations (fade in / slide in when navigating)
- Card entrance animations on the dashboard
- Loading state transitions (skeleton → content)

It makes the UI feel more responsive and professional. It was chosen over CSS animations because it is React-native (animations are tied to component lifecycle) and handles exit animations cleanly.

---

## Security

**Q21. How are passwords stored and protected?**

Passwords are never stored in plain text. When a user registers, the password is hashed using bcrypt with a cost factor of 12. bcrypt is a slow hashing algorithm by design — cost 12 means each hash takes approximately 300ms to compute. This makes brute-force attacks extremely slow. Even if the database were leaked, the hashes cannot be reversed to recover passwords in a reasonable timeframe.

---

**Q22. How is authorization enforced — can a user see another user's data?**

Two levels of enforcement:
1. **JWT ownership** — every protected route calls `get_jwt_identity()` to get the logged-in user's ID from the token. History and alerts endpoints compare this ID against the `user_id` in the query. A user requesting `/history/<id>` for a different user's ID gets a 403 Forbidden.
2. **Admin role check** — admin routes check that `user.role == 'admin'` in the database before returning cross-user data. The role is read from the database on each request, not from the JWT, so it cannot be forged.

---

**Q23. What SQL injection protections are in place?**

All database queries use **parameterized queries** with psycopg2. For example:
```python
cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
```
The `%s` placeholder is handled by the database driver, which escapes user input before including it in the query. User-provided values are never concatenated directly into SQL strings.

---

## Deployment

**Q24. How is the project deployed?**

- **Frontend** — deployed on Vercel as a static site. Vercel builds the React app with `npm run build` and serves the output from `frontend/dist`. Client-side routing is handled by `vercel.json`.
- **Backend** — deployed on any Python-compatible server (e.g., Railway, Render, or a VPS) running Flask on port 8000 behind HTTPS.
- **Database** — hosted on Supabase (managed PostgreSQL in the cloud).

The frontend reads the backend URL from the `VITE_API_BASE_URL` environment variable, so the same codebase works for local development and production.

---

**Q25. What environment variables does the project need and why?**

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string — connects backend to Supabase |
| `JWT_SECRET_KEY` | Signs and verifies JWT tokens — must be secret and random |
| `GEMINI_API_KEY` | Authenticates requests to Google's Gemini AI API |
| `HF_TOKEN` | Authenticates requests to HuggingFace Inference API for BERT |
| `TWITTER_BEARER_TOKEN` | Authenticates Twitter API v2 for tweet analysis feature |
| `VITE_API_BASE_URL` | Tells the frontend where the backend server is |

None of these are committed to the repository — they are kept in `.env` files which are in `.gitignore`.

---

## Scalability & Improvements

**Q26. What are the limitations of the current system?**

1. **In-memory cache** — the SHA-256 classifier cache lives in RAM on one server instance. If the server restarts or scales to multiple instances, the cache is lost. Redis would be a proper solution.
2. **Single backend process** — Flask's development server runs single-threaded. For production, a WSGI server like Gunicorn with multiple workers is needed.
3. **Twitter API rate limits** — the Twitter Bearer Token tier has strict rate limits, which restricts the tweet analysis feature.
4. **No real-time updates** — the dashboard polls via page navigation, not WebSockets. Truly real-time alert badges would require WebSocket or SSE connections.

---

**Q27. How would you scale this system for 1 million users?**

1. Move the classifier to a separate **ML inference service** — the BERT model is CPU/GPU intensive; isolating it lets it scale independently
2. Add **Redis caching** for both the classifier results and frequently-read database queries
3. Use **Gunicorn + Nginx** in front of Flask for multi-threaded request handling
4. Add a **job queue** (Celery + Redis) for async analysis so the HTTP response returns immediately and the result is pushed via WebSocket
5. Use **database connection pooling** (PgBouncer) to handle high concurrent DB connections
6. Add **read replicas** for PostgreSQL to offload analytics queries

---

**Q28. What would you add if you had more time?**

1. **Real-time WebSocket alerts** — push notifications to the browser the moment an alert is created
2. **Model fine-tuning pipeline** — allow admins to label misclassified examples and retrain the BERT model
3. **Multi-language support** — BERT models exist for many languages; the classifier pipeline could route by detected language
4. **Browser extension** — detect toxic content inline on social media sites without copying text into the app
5. **Batch analysis API** — analyze hundreds of texts in one API call for enterprise customers

---

*SafeText AI · Final Year Project 2026*
