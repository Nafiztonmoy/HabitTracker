# HabitTracker

A full-stack habit tracking application built with **React** and **ASP.NET Core**, featuring JWT authentication, Google and Facebook sign-in, progress tracking, streaks, weekly analytics, and AI-assisted habit planning powered by **Groq**.

> Build consistent habits, track weekly progress, and get practical AI suggestions without turning the app into a complicated productivity system.

## Features

### Habit tracking

- Create, edit, and delete habits
- Daily and weekly habit targets
- Mark habits complete and keep completion history
- Track streaks and weekly progress
- Filter and manage active habits from the dashboard
- Visual progress charts and dashboard statistics

### Authentication

- Email and password registration/login
- JWT-based API authentication
- Google sign-in
- Facebook sign-in
- Backend verification of external provider credentials
- External-login records stored separately from local credentials

### AI features

- **Smart Habit Creator**: describe a goal and receive a practical habit suggestion
- **AI Weekly Review**: get a concise review of your recent habit progress
- Structured AI responses for predictable frontend rendering
- AI requests are handled only by the backend
- Powered by **Groq** using `openai/gpt-oss-20b` by default

### UI

- Responsive React dashboard
- Light and dark themes
- Glassmorphism-inspired interface
- Weekly charts and progress indicators
- Social login buttons
- Loading, empty, and error states

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, React Router, Axios |
| UI | Bootstrap, React Bootstrap, React Icons |
| Charts | Chart.js, react-chartjs-2 |
| Backend | ASP.NET Core Web API, .NET 10 |
| ORM | Entity Framework Core |
| Database | SQLite for local development |
| Authentication | JWT, BCrypt, Google OAuth, Facebook Login |
| AI | Groq API |

---

## Project Structure

```text
HabitTracker/
├── backend/
│   └── HabitTracker.Api/
│       ├── Controllers/
│       ├── Data/
│       ├── DTOs/
│       ├── Migrations/
│       ├── Models/
│       ├── Services/
│       ├── Program.cs
│       └── appsettings.json
│
├── frontend/
│   └── habit-tracker-client/
│       ├── public/
│       ├── src/
│       │   ├── components/
│       │   ├── context/
│       │   ├── pages/
│       │   └── services/
│       ├── .env.example
│       └── package.json
│
├── AI_SETUP.md
├── SOCIAL_AUTH_SETUP.md
└── README.md
```

---

## Local Development

### Prerequisites

Install:

- **.NET 10 SDK**
- **Node.js** and npm
- Git

Clone the repository:

```bash
git clone https://github.com/Nafiztonmoy/HabitTracker.git
cd HabitTracker
```

### 1. Frontend environment

Go to the frontend directory:

```powershell
cd frontend\habit-tracker-client
Copy-Item .env.example .env
```

Configure `.env`:

```env
REACT_APP_API_URL=http://localhost:5212/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
REACT_APP_FACEBOOK_APP_ID=your-facebook-app-id
REACT_APP_FACEBOOK_API_VERSION=v25.0
```

These frontend values are public browser configuration. **Never put API secrets or client secrets in the React `.env` file.**

### 2. Backend secrets

Go to the backend directory:

```powershell
cd ..\..\backend\HabitTracker.Api
```

Store development secrets with .NET User Secrets:

```powershell
dotnet user-secrets set "Jwt:Key" "YOUR_STRONG_RANDOM_JWT_KEY"
dotnet user-secrets set "Groq:ApiKey" "YOUR_GROQ_API_KEY"

dotnet user-secrets set "ExternalAuth:GoogleClientId" "YOUR_GOOGLE_CLIENT_ID"
dotnet user-secrets set "ExternalAuth:GoogleClientSecret" "YOUR_GOOGLE_CLIENT_SECRET"
dotnet user-secrets set "ExternalAuth:GoogleRedirectUri" "http://localhost:3000"

dotnet user-secrets set "ExternalAuth:FacebookAppId" "YOUR_FACEBOOK_APP_ID"
dotnet user-secrets set "ExternalAuth:FacebookAppSecret" "YOUR_FACEBOOK_APP_SECRET"
dotnet user-secrets set "ExternalAuth:FacebookApiVersion" "v25.0"
```

Do not commit real secret values to `appsettings.json`, `.env`, documentation, text files, or source code.

### 3. Run the backend

```powershell
cd backend\HabitTracker.Api
dotnet restore
dotnet build
dotnet run
```

Local API:

```text
http://localhost:5212
```

Entity Framework migrations are applied automatically when the API starts.

### 4. Run the frontend

Open another terminal:

```powershell
cd frontend\habit-tracker-client
npm install
npm start
```

Local frontend:

```text
http://localhost:3000
```

Restart the React development server whenever `.env` is changed.

---

## Google Login Setup

Create a **Web application** OAuth client in Google Cloud.

For local development, add:

```text
Authorized JavaScript origin:
http://localhost:3000
```

Use the Google Web Client ID in the frontend and backend configuration. Keep the **Google Client Secret backend-only**.

For the current popup authorization-code flow, the local backend redirect/origin configuration is:

```text
http://localhost:3000
```

When deploying, replace localhost values with the production frontend URL and update the Google OAuth configuration accordingly.

---

## Facebook Login Setup

Create a Meta developer app with Facebook Login enabled.

For local development:

- Enable **Login with the JavaScript SDK**
- Add `localhost` to the allowed JavaScript SDK domains
- Enable/request `public_profile` and `email`
- Put only the **Facebook App ID** in the frontend
- Keep the **Facebook App Secret backend-only**

Production authentication should use HTTPS and the deployed frontend domain must be configured in Meta's developer dashboard.

---

## Groq AI Setup

Create a Groq API key and store it only on the backend:

```powershell
cd backend\HabitTracker.Api
dotnet user-secrets set "Groq:ApiKey" "YOUR_GROQ_API_KEY"
```

The AI service uses Groq's OpenAI-compatible chat completions API. The default model is:

```text
openai/gpt-oss-20b
```

Main AI endpoints:

```text
GET  /api/ai/status
POST /api/ai/smart-habit
POST /api/ai/weekly-review
```

---

## API Overview

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/google
POST /api/auth/facebook
```

### Habits

```text
GET    /api/habits
POST   /api/habits
PUT    /api/habits/{id}
DELETE /api/habits/{id}
GET    /api/habits/weekly-progress
```

### Habit logs

```text
POST /api/logs
GET  /api/logs/{habitId}
```

### AI

```text
GET  /api/ai/status
POST /api/ai/smart-habit
POST /api/ai/weekly-review
```

Protected endpoints require the app's JWT access token.

---

## Database

Local development currently uses SQLite:

```text
Data Source=habittracker.db
```

The local database file is intentionally ignored by Git.

For production deployment, moving to a managed database such as PostgreSQL or SQL Server is recommended instead of relying on an ephemeral local SQLite file.

---

## Security

This repository is designed so that secrets stay outside source control.

**Never commit:**

- `.env`
- Groq API keys
- Google Client Secrets
- Facebook App Secrets
- JWT signing keys
- downloaded OAuth credential files
- local database files

The project `.gitignore` excludes local environment files, build output, local databases, and common credential files.

For local development, use **.NET User Secrets**. For deployment, use the hosting provider's **environment variables / secret manager**.

ASP.NET Core configuration environment variables use double underscores. Examples:

```text
Jwt__Key
Groq__ApiKey
ExternalAuth__GoogleClientId
ExternalAuth__GoogleClientSecret
ExternalAuth__GoogleRedirectUri
ExternalAuth__FacebookAppId
ExternalAuth__FacebookAppSecret
ExternalAuth__FacebookApiVersion
```

Before making the repository public, rotate any credential that has ever been pasted into a chat, terminal screenshot, filename, issue, or commit.

---

## Production Deployment Checklist

Before deploying:

- Move backend secrets to hosting environment variables
- Set the production frontend API URL
- Add the deployed frontend domain to backend CORS
- Configure Google OAuth production origins/redirect settings
- Configure Meta/Facebook production domains
- Use HTTPS
- Replace local SQLite with persistent production storage if the host has an ephemeral filesystem
- Apply database migrations
- Verify JWT signing key strength
- Verify Google, Facebook, and Groq credentials are not present in Git history
- Update any localhost-only configuration

---

## Useful Commands

Frontend:

```powershell
cd frontend\habit-tracker-client
npm install
npm start
npm run build
npm test
```

Backend:

```powershell
cd backend\HabitTracker.Api
dotnet restore
dotnet build
dotnet run
```

Entity Framework migrations:

```powershell
dotnet ef migrations add MigrationName
dotnet ef database update
```

Git workflow:

```powershell
git status
git add .
git commit -m "Describe your changes"
git push
```

---

## Roadmap

Possible next improvements:

- Production deployment
- PostgreSQL/managed database support
- Refresh-token authentication
- Password reset and email verification
- Account linking for existing Google/Facebook/local accounts
- Profile and account settings
- Habit reminders and notifications
- Improved AI personalization
- Automated backend/frontend tests
- CI/CD with GitHub Actions

---

## Repository

GitHub: [Nafiztonmoy/HabitTracker](https://github.com/Nafiztonmoy/HabitTracker)

---

## License

No license has been added yet. If you plan to make the repository public or allow reuse, add an appropriate license such as MIT.
