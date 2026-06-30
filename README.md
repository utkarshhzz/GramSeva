# GramSahay — ग्रामसहाय

**हर समस्या का समाधान, हर नागरिक की आवाज़**
*Every Problem, A Solution. Every Citizen, A Voice.*

GramSahay is an AI-powered community issue reporting platform that empowers Indian citizens to report, track, and resolve local community issues. Powered by **Google Gemini AI** and deployed on **Google Cloud Platform**.

---

## 🛡️ Problem Statement

**Community Hero**: Building applications that allow users to report issues and serve their local communities.

Indian villages and urban wards face countless daily issues — broken roads, water shortages, electricity outages, sanitation problems, public safety concerns. Citizens often don't know whom to report to, how to follow up, or whether their voice matters. GramSahay changes that.

---

## 🚀 Key Features

### 🤖 Agentic AI (Google Gemini)
- **AI Issue Classification**: Automatically categorizes issues, assesses severity, and identifies the responsible government authority.
- **AI Formal Complaint Draft**: Generates professional, formal complaint letters addressed to the right department.
- **AI Community Insights**: Analyzes patterns and generates actionable community health reports.
- **AI Chat Assistant**: Conversational help for navigating government processes, schemes, and platform features.
- **Voice-First Reporting**: Speak in Hindi, English, or Kannada — AI transcribes and classifies automatically.

### 🌍 Accessibility & Inclusivity
- **Progressive Web App (PWA)**: Installable on any mobile device. Works offline or in low-network areas.
- **Multilingual Support**: Real-time UI translation across English, Hindi (हिंदी), and Kannada (ಕನ್ನಡ) for all major components.
- **Voice Features**: Allowing non-technical or illiterate citizens to report issues effortlessly.

### 📱 Action & Escalation
- **WhatsApp Community Rally**: One-click sharing to local WhatsApp groups to rally upvotes and community support.
- **One-Click Email Escalation**: Automatically generates and opens an email client with the AI-drafted complaint to send directly to local authorities.

### 📍 Issue Reporting System
- Photo upload with multiple images
- GPS location pinning with map view
- Category-based classification (Roads, Water, Electricity, Sanitation, Safety, Environment, etc.)
- Severity levels (Low, Medium, High, Critical)
- Status tracking (Reported → Acknowledged → In Progress → Resolved)

### 🗺️ Community Map
- Live map of all community issues with color-coded severity markers
- Category and status filters
- Issue popup with quick details

### 📊 Community Analytics
- Resolution rate tracking
- Category-wise issue distribution (bar charts)
- Status breakdown (donut charts)
- Weekly trend analysis (line charts)
- KPI dashboards

### 🏆 Community Heroes (Gamification)
- Points system: 10 pts per report, 25 pts per resolution, 3 pts per comment, 2 pts per upvote
- Leaderboard with animated podium for top 3
- Community engagement tracking

### 🗳️ Community Engagement
- Upvote/support issues to show priority
- Comment threads on issues
- User profiles with contribution stats

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React 18, TypeScript, Vite, PWA Plugin |
| **UI/Design** | Tailwind CSS, shadcn/ui, Framer Motion |
| **AI Engine** | Google Gemini 2.0 Flash (via Google AI Studio) |
| **Authentication** | Firebase Authentication |
| **Database** | Cloud Firestore |
| **File Storage** | Firebase Storage |
| **Maps** | React-Leaflet / OpenStreetMap |
| **Charts** | Recharts |
| **Deployment** | Firebase Hosting |

### Google Tools Used
- ✅ Google Gemini AI (via Google AI Studio)
- ✅ Firebase Authentication
- ✅ Cloud Firestore
- ✅ Firebase Storage
- ✅ Google Cloud Run
- ✅ Google Cloud Build

---

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- npm
- Firebase project (see setup below)
- Gemini API key

### Setup

1. **Clone the repo**
```bash
git clone https://github.com/YOUR_USERNAME/gramsahay.git
cd gramsahay
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your Firebase config and Gemini API key
```

4. **Start dev server**
```bash
npm run dev
```

Open **http://localhost:8080**

### Firebase Setup
1. Go to [console.firebase.google.com](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication → Email/Password
4. Enable Firestore Database → Start in test mode
5. Enable Storage → Start in test mode
6. Add a Web app → Copy config to `.env`

### Gemini API Key
1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Create an API key → Copy to `.env`

---

## ☁️ Deployment (Firebase Hosting)

```bash
# Build the project
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

---

## 📂 Project Structure

```
├── src/
│   ├── pages/              # Route pages
│   │   ├── LandingPage.tsx       # Premium landing page
│   │   ├── CommunityDashboard.tsx # Main dashboard
│   │   ├── ReportIssue.tsx       # Multi-step issue reporting
│   │   ├── IssueFeed.tsx         # Browse/search issues
│   │   ├── IssueDetail.tsx       # Single issue view
│   │   ├── CommunityMap.tsx      # Map view of issues
│   │   ├── CommunityAnalytics.tsx # Charts & insights
│   │   ├── LeaderboardPage.tsx   # Community heroes
│   │   ├── AIAssistant.tsx       # Gemini chat assistant
│   │   ├── SignInPage.tsx        # Firebase auth
│   │   └── SignUpPage.tsx        # Registration
│   ├── lib/
│   │   ├── firebase.ts           # Firebase initialization
│   │   ├── gemini.ts             # Gemini AI client (agents)
│   │   └── firestore.ts          # Firestore data layer
│   ├── contexts/
│   │   └── FirebaseAuthContext.tsx # Auth state management
│   ├── types/
│   │   └── community.ts          # TypeScript types
│   └── components/               # Shared UI components
├── Dockerfile                    # Cloud Run container
├── nginx.conf                    # SPA routing
└── .env.example                  # Environment template
```

---

## 🌐 Languages Supported
- English
- Hindi (हिंदी)
- Kannada (ಕನ್ನಡ)

---

## 📜 Attribution

### Open Source Libraries
- React (MIT License)
- Vite (MIT License)
- Tailwind CSS (MIT License)
- shadcn/ui (MIT License)
- Framer Motion (MIT License)
- Firebase SDK (Apache 2.0)
- Google Generative AI SDK (Apache 2.0)
- Pigeon Maps (MIT License)
- Recharts (MIT License)
- Lucide Icons (ISC License)

### APIs & Services
- Google Gemini AI (Google AI Studio)
- Firebase (Google)
- Google Cloud Run
- Nominatim / OpenStreetMap (for reverse geocoding)

---

## 👥 Team

Built for the Community Hero hackathon.

---

*Made with ❤️ for Indian communities • Powered by Google Gemini AI*
