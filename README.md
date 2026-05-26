# AI Spoken English Tutor

A full-stack spoken English learning app for Tamil students and English beginners. Learners can practise with an AI teacher, convert Tamil or Tanglish to English, correct grammar, use voice input and output, complete roleplays, and track daily lesson progress.

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database and authentication: Supabase
- AI: Groq API with `llama-3.3-70b-versatile`
- Voice input: Browser Web Speech API
- Voice output: Browser `speechSynthesis` API

## Folder Structure

```text
AI Spoken English Tutor/
|-- client/
|   |-- .env.example
|   |-- index.html
|   |-- package.json
|   |-- vite.config.js
|   `-- src/
|       |-- App.jsx
|       |-- main.jsx
|       |-- styles.css
|       |-- components/
|       |   |-- Layout.jsx
|       |   |-- PageHeader.jsx
|       |   `-- PracticeChat.jsx
|       |-- context/
|       |   `-- AuthContext.jsx
|       |-- hooks/
|       |   `-- useSpeechRecognition.js
|       |-- lib/
|       |   |-- api.js
|       |   |-- speech.js
|       |   `-- supabase.js
|       `-- pages/
|           |-- Dashboard.jsx
|           |-- DailyLessons.jsx
|           |-- Login.jsx
|           |-- Progress.jsx
|           |-- Roleplay.jsx
|           |-- Signup.jsx
|           |-- SpeakingPractice.jsx
|           `-- TutorChat.jsx
|-- server/
|   |-- .env.example
|   |-- package.json
|   `-- src/
|       |-- config.js
|       |-- index.js
|       |-- lib/supabase.js
|       |-- middleware/requireAuth.js
|       |-- routes/api.js
|       `-- services/groq.js
|-- supabase/
|   `-- schema.sql
|-- .gitignore
|-- package.json
`-- README.md
```

## Setup

### 1. Requirements

- Node.js 22.15 or later
- A [Supabase](https://supabase.com/) project
- A [Groq](https://console.groq.com/) API key

### 2. Install dependencies

From the project root:

```bash
npm install
```

The root project uses npm workspaces, so this installs both `client` and `server` dependencies.

### 3. Set up Supabase

1. Open the SQL Editor in the Supabase project.
2. Run the complete script in `supabase/schema.sql`.
3. In Authentication settings, enable Email authentication.
4. For local development, either disable email confirmation or confirm a new signup email before logging in.

The script creates:

- `practice_history`
- `daily_lessons`
- `user_progress`
- Row-level security policies
- Seven seeded lessons, each with 10 sentences, 5 vocabulary words, and a quiz

### 4. Configure environment variables

Create `server/.env` from `server/.env.example`:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Create `client/.env` from `client/.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Use the Supabase anon key only in the frontend. Keep the service role key in `server/.env` and never expose it in client variables.

### 5. Run locally

```bash
npm run dev
```

Open `http://localhost:5173`.

To build the frontend for production:

```bash
npm run build
```

To run only the backend:

```bash
npm start
```

The backend uses Node's system certificate trust store when it starts. This supports Windows networks where browsers can access Supabase and Groq but Node's bundled certificate store cannot verify the local TLS chain.

## API Routes

All application API routes require a signed-in user's Supabase access token in the `Authorization: Bearer <token>` header.

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/ai-tutor` | Send `{ message, mode }` to the Groq-powered teacher |
| `POST` | `/api/save-practice` | Save `{ mode, userInput, aiReply }` for the signed-in user |
| `GET` | `/api/daily-lessons` | Return lessons together with the learner's completion data |
| `POST` | `/api/complete-lesson` | Save `{ lessonId, score }` |
| `GET` | `/api/progress` | Load practice history and completed lesson scores |
| `GET` | `/api/health` | Backend health check |

## Voice Notes

- Microphone transcription depends on browser Web Speech API support. Chrome and Edge generally provide the best support.
- The speaking page sends recognised speech directly to the AI teacher.
- The `Speak reply` button reads an AI response aloud through the browser speech synthesis engine.

## Deploy on Vercel

Deploy this workspace as two Vercel projects:

1. Deploy `server` as the Express API project. Add the server environment variables from `server/.env`, changing `CLIENT_URL` to the deployed client URL.
2. Deploy `client` as the Vite frontend project. Add the client environment variables from `client/.env`, changing `VITE_API_BASE_URL` to `https://YOUR-API-PROJECT.vercel.app/api`.

The frontend contains a `vercel.json` SPA rewrite so dashboard, speaking, lessons, and progress links continue to work when opened directly on the hosted site.
