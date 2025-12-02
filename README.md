# SafeText AI - Cyberbullying & Toxicity Detection System

A modern, professional React frontend for an AI-powered cyberbullying and toxicity detection system. Built as a Final Year Project with a focus on cyber safety and online community protection.

## 🚀 Features

- **Real-time Text Analysis**: Detect toxicity, cyberbullying, sarcasm, and sentiment
- **Beautiful UI**: Modern design with blue-purple gradient theme and smooth animations
- **Dark Mode**: Toggle between light and dark themes
- **Analysis History**: View and manage past analysis results
- **Responsive Design**: Works seamlessly on all device sizes
- **Mock API Support**: Test frontend independently before backend integration

## 🛠️ Tech Stack

- **React 18** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **Axios** for API calls
- **Google Fonts (Poppins)** for typography
- **Unsplash** for professional imagery

## 📦 Installation

```bash
npm install
```

## 🏃 Running the Project

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔧 Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
src/
├── pages/
│   ├── Home.jsx          # Landing page with hero section
│   ├── Analyze.jsx       # Text analysis interface
│   ├── Login.jsx         # Authentication page
│   └── History.jsx       # Analysis history viewer
├── components/
│   ├── Navbar.jsx        # Navigation bar with dark mode
│   ├── Footer.jsx        # Footer with links
│   ├── ResultCard.jsx    # Analysis result display
│   ├── Spinner.jsx       # Loading animation
│   └── HistoryTable.jsx  # History data table
├── api/
│   ├── config.js         # API configuration
│   └── mockApi.js        # Mock API responses
├── App.tsx               # Main app component
├── main.tsx              # Entry point
└── index.css             # Global styles
```

## 🎨 Pages Overview

### 1. Home Page (/)
- Hero section with compelling copy
- Feature showcase with icons
- Call-to-action buttons
- Professional imagery from Unsplash

### 2. Analyze Page (/analyze)
- Multi-line text input
- Optional tweet URL input
- Real-time analysis with loading states
- Animated result cards showing:
  - Toxicity Score
  - Cyberbullying Probability
  - Sarcasm Detection
  - Sentiment Analysis
- Save results to history

### 3. Login Page (/login)
- Clean authentication form
- Email and password inputs
- Success/error messages
- Demo mode (any credentials work)

### 4. History Page (/history)
- Table view of past analyses
- Delete functionality
- Mock data included for demo
- Empty state for new users

## 🔌 Backend Integration

### Changing the API URL

Edit `src/api/config.js`:

```javascript
export const API_BASE_URL = "http://your-backend-url:port";
```

### Expected Backend Endpoints

**POST /api/analyze**
```json
Request:
{
  "text": "string",
  "url": "string (optional)"
}

Response:
{
  "toxicity_score": 0.72,
  "cyberbullying_prob": 0.63,
  "sarcasm": false,
  "sentiment": "negative"
}
```

**Note**: The frontend currently uses mock data from `src/api/mockApi.js` when the backend is not connected. Update the `Analyze.jsx` component to integrate with your Flask backend.

## 🗄️ Database

Backend will use:
- **Database**: Supabase / PostgreSQL
- **ORM**: SQLAlchemy (Flask)
- **Authentication**: JWT tokens

## 🎯 Key Features Explained

### Dark Mode
- Persists across sessions using localStorage
- Smooth transitions between themes
- Affects all components system-wide

### Animations
- Page transitions with Framer Motion
- Smooth entry animations for cards
- Loading spinners
- Hover effects on interactive elements

### History Management
- Stored in localStorage
- Sample data included
- Delete functionality
- Date tracking

## 🎨 Design System

### Colors
- Primary: Blue (#2563eb)
- Secondary: Purple (#9333ea)
- Accent: Pink (#ec4899)
- Success: Green (#10b981)
- Warning: Yellow (#f59e0b)
- Error: Red (#ef4444)

### Typography
- Font Family: Poppins
- Headings: 600-800 weight
- Body: 400-500 weight
- Small text: 300 weight

### Spacing
- Consistent 4px/8px grid system
- Large breathing room between sections
- Proper card padding

## 🚀 Deployment

Build the project and deploy to any static hosting service:

```bash
npm run build
```

Deploy the `dist` folder to:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

## 📝 Future Enhancements

- Real-time analysis streaming
- Batch file uploads
- Export reports as PDF
- User accounts with cloud sync
- Analytics dashboard
- API rate limiting indicators
- Multi-language support

## 👨‍💻 Development Notes

- All components are functional components using React Hooks
- State management via useState and localStorage
- Responsive design with mobile-first approach
- Accessibility features included
- SEO-friendly structure

## 📄 License

This is a Final Year Project. All rights reserved.

## 🤝 Support

For questions or issues, please contact the project team.

---

**Built with ❤️ for a safer internet**
