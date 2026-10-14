# Study Loop 🔄
> **Your study, in rhythm.**

*Upload your syllabus and notes, get a personalized revision plan, and practice quizzes that adapt to what you don't know.*

---

## 📖 Product Overview

**Study Loop** is an AI-powered micro SaaS web application designed for college students, university scholars, and competitive exam candidates. It transforms unstructured lecture notes, syllabi, and textbook excerpts into structured study decks, active-recall flashcards, and adaptive quizzes that reinforce low-mastery concepts.

### Key Capabilities
1. **Notes-to-Study-Deck Generator**: Upload PDF lecture slides, TXT files, Markdown documents, or paste notes directly into the browser. Powered by Google Gemini 3.8 Flash with a server-side extraction pipeline.
2. **Smart Exam Planner**: Enter examination dates and available days; Study Loop algorithmically schedules core study sessions, revision checkpoints, practice quizzes, and final recaps.
3. **Adaptive Quiz System**: Quizzes track accuracy per topic. Questions from low-mastery topics (<70%) and previously missed questions are weighted higher in future rounds. Answer keys and explanations are guarded server-side until submission.
4. **Weak-Topic Learning Analytics**: Real-time mastery percentages, quiz accuracy progression, and frequently missed concept analysis.
5. **Daily Reminders & Authentic Streaks**: Browser push notifications, preferred study times, and daily streak calculations based exclusively on completed study tasks in the user's local timezone.
6. **Deck Sharing & PDF Export**: Secure random share tokens for read-only peer review (`/share/:shareToken`) and formatted printable layouts.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express.js (REST API v1 architecture).
- **AI Engine**: `@google/genai` TypeScript SDK with model `gemini-3.8-flash` on the server.
- **Database & Persistence**: Typed relational persistent datastore with comprehensive seed data + formal PostgreSQL `prisma/schema.prisma` definitions.
- **File Handling**: `multer` memory storage + `pdf-parse` for text extraction.

---

## 🚀 Quick Start & Local Development

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### 2. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your `.env` contains:
```env
GEMINI_API_KEY="your-gemini-api-key"
PORT="3000"
APP_URL="http://localhost:3000"
DATABASE_URL="postgresql://user:password@localhost:5432/studyloop?schema=public"
```
*(Note: If no Gemini API key is provided, Study Loop seamlessly switches to its built-in rule-based demo generator with a clear `Demo Mode` indicator).*

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Full-Stack Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Automated Tests
```bash
npm test
```

### 6. Build for Production
```bash
npm run build
npm start
```

---

## 🔐 Default Demo Student Credentials

For instant testing and evaluation, Study Loop comes pre-seeded with a comprehensive student account:
- **Email:** `alex@studyloop.edu`
- **Password:** `studyloop123`
- **Course:** CS301 Distributed Systems & Cloud Architecture (includes pre-generated summary, 6 active-recall flashcards, 5 multiple-choice questions, exam countdown, and topic mastery data).

---

## 📡 REST API Documentation (`/api/v1`)

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/auth/signup` | POST | Register new student account |
| `/api/v1/auth/login` | POST | Authenticate student & set HTTP session cookie |
| `/api/v1/auth/logout` | POST | Clear session cookie |
| `/api/v1/auth/me` | GET | Retrieve authenticated profile, settings, and streak |
| `/api/v1/auth/forgot-password` | POST | Issue password recovery token |
| `/api/v1/dashboard` | GET | Overview metrics, today's tasks, countdowns, and weak topics |
| `/api/v1/notes/upload` | POST | Upload PDF, TXT, or MD note document |
| `/api/v1/decks/generate` | POST | AI study deck generator (Gemini 3.8 Flash) |
| `/api/v1/decks` | GET | List all user study decks |
| `/api/v1/decks/:deckId` | GET | Get deck details (summary, flashcards, questions count) |
| `/api/v1/decks/:deckId/quiz` | GET | Retrieve adaptive quiz questions (answers concealed) |
| `/api/v1/decks/:deckId/attempts` | POST | Submit quiz answers, evaluate score, update topic mastery |
| `/api/v1/flashcards/:id/review` | POST | Record "Know It" or "Review Again" |
| `/api/v1/exams` | GET/POST | List exams or create exam plan with automatic scheduling |
| `/api/v1/exams/:id/generate-plan` | POST | Re-distribute sessions prioritizing latest weak topics |
| `/api/v1/study-sessions/:id/complete`| POST | Mark scheduled session complete & update streak |
| `/api/v1/progress` | GET | Retrieve weak topics (<70%), strong topics, and missed concepts |
| `/api/v1/reminders` | GET/PATCH | Get or update daily study reminder preferences |
| `/api/v1/decks/:id/share` | POST/DELETE | Create or revoke secure public share token |
| `/api/v1/share/:token` | GET | Read-only shared deck viewer |

---

## 🎨 Design System Tokens

- **Background:** `#F7F9FC`
- **Surface:** `#FFFFFF`
- **Primary Text:** `#172033`
- **Secondary Text:** `#778196`
- **Border:** `#E7ECF3`
- **Primary Purple:** `#6857E8` (Hover: `#5645D3`, Light: `#F0EEFF`)
- **Success Green:** `#238A66` (Light: `#E3F8EF`)
- **Information Blue:** `#3977D6` (Light: `#E8F2FF`)
- **Warning Amber:** `#B97820` (Light: `#FFF2DF`)
- **Error Red:** `#C24141`
- **Typography:** Google Font **Lato** (300, 400, 700, 900)
