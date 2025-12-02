# SafeText AI - Cyberbullying Detection Platform

## Overview
SafeText AI is a full-stack web application for detecting cyberbullying, toxicity, and sarcasm in text using AI-powered analysis. This is a Final Year Project (FYP) that provides real-time text analysis with sentiment detection.

## Project Structure
```
/
├── backend/                 # Flask backend
│   ├── app.py              # Main Flask application
│   ├── config.py           # Configuration settings
│   ├── controllers/        # Route handlers
│   │   ├── admin_controller.py
│   │   ├── analysis_controller.py
│   │   ├── auth_controller.py
│   │   └── history_controller.py
│   ├── models/             # Database models
│   │   ├── analysis_history.py
│   │   ├── database.py
│   │   └── user.py
│   ├── routes/             # API routes
│   │   ├── admin.py
│   │   ├── analysis.py
│   │   ├── auth.py
│   │   └── history.py
│   └── utils/              # Utilities
│       ├── classifier.py   # Mock text classifier (replace with BERT model)
│       └── helpers.py
├── src/                    # React frontend
│   ├── api/                # API configuration
│   ├── components/         # React components
│   └── pages/              # Page components
├── main.py                 # Backend entry point
└── package.json            # Frontend dependencies
```

## Tech Stack
- **Frontend**: React, Vite, TailwindCSS, Framer Motion
- **Backend**: Python, Flask, Flask-JWT-Extended
- **Database**: PostgreSQL
- **Authentication**: JWT with bcrypt password hashing

## API Endpoints

### Authentication
- `POST /signup` - Register new user
- `POST /login` - User login
- `GET /user` - Get current user profile (JWT required)

### Analysis
- `POST /analyze` - Analyze text for toxicity/cyberbullying

### History
- `POST /history/add` - Save analysis result (JWT required)
- `GET /history/<user_id>` - Get user's analysis history

### Admin
- `GET /admin/users` - Get all users (admin only)
- `GET /admin/history` - Get all history (admin only)
- `DELETE /admin/user/<id>` - Delete user (admin only)

## Running the Application
- Frontend runs on port 5000 (Vite dev server)
- Backend runs on port 5001 (Flask server)

## Future Improvements
- Replace mock classifier with trained BERT model
- Add pagination for history
- Add export functionality (CSV/JSON)
- Add user profile management
