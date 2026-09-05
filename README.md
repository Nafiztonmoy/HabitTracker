# Cadence

Cadence is a full-stack habit tracking web app that helps users build consistent routines, understand the real-life value of their habits, and turn better choices into measurable progress.

Alongside standard habit tracking, Cadence includes **Life ROI**, **Savings Goals**, **Time Bank**, **Future Me projections**, and AI-assisted habit planning and reviews.

> Build better habits. Recover time. Save money. See where your routine is taking you.

---

## Features

### Habit tracking

- Create, edit, and delete habits
- Daily and weekly habit targets
- Mark habits complete or incomplete
- Habit completion history backed by `HabitLog`
- Streak tracking
- Weekly progress tracking
- Search and filter habits
- Responsive habit cards and progress views

### Life ROI

Each habit can optionally include:

- Money saved per completion
- Minutes recovered per completion
- Minutes invested per completion

Cadence calculates:

- Total money saved
- Total time recovered
- Total time invested
- Total successful completions
- Last-30-day impact totals
- Per-habit impact breakdowns

Completed habit logs remain the source of truth for impact calculations.

### Savings Goals

- Create savings goals
- Edit and delete goals
- Activate one goal at a time
- Add a starting savings amount
- Add an optional target date
- Automatically count money saved from completed impact-enabled habits toward the active goal
- Track goal progress and remaining amount

### Time Bank

- Lifetime recovered time
- Recovered time in the last 30 days
- Recovered time in the last 7 days
- Shows which habit has recovered the most time

### Future Me

Cadence projects future outcomes based on recent real habit completion pace.

Available projections:

- 30 days
- 90 days
- 1 year

Projected values include:

- Money saved
- Time recovered
- Useful time invested
- Estimated progress toward the active savings goal

### AI features

Cadence uses the existing backend AI integration through Groq.

- **Smart Habit Creator**: turn a personal goal into one practical habit suggestion
- **AI Weekly Review**: summarize recent habit performance and suggest a practical next step
- **AI Future Me**: explain calculated future projections without inventing additional money, time, dates, or completion data
- Structured AI responses for predictable frontend rendering
- AI requests stay on the backend so API keys are never exposed to the browser

Default AI model:

```text
openai/gpt-oss-20b
```

### Authentication

- Email and password registration/login
- JWT-based API authentication
- Google sign-in
- Facebook sign-in
- External provider credentials verified by the backend
- External-login records stored separately from local credentials

### Product UI

Cadence uses separate pages instead of placing every feature on one dashboard.

```text
Overview | Habits | Life ROI | Goals | Future | Reports
```

Current routes:

```text
/dashboard
/habits
/impact
/goals
/future-me
/reports
/login
/register
```

UI features include:

- Responsive navigation
- Desktop navigation that switches to a compact menu on narrower screens
- Mobile-friendly layouts
- Light and dark themes
- Responsive charts
- Loading, empty, and error states
- Reduced-motion fallbacks
- Subtle entry, hover, progress, and brand animations

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19 |
| Routing | React Router |
| HTTP | Axios |
| UI | Bootstrap, React Bootstrap, React Icons |
| Charts | Chart.js, react-chartjs-2 |
| Backend | ASP.NET Core Web API |
| Runtime | .NET 10 |
| ORM | Entity Framework Core |
| Database | PostgreSQL via Npgsql |
| Authentication | JWT, BCrypt, Google OAuth, Facebook Login |
| AI | Groq OpenAI-compatible API |

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
├── PHASE1_LIFE_ROI.md
├── PHASE2_GOALS_FUTURE_ME.md
└── README.md
```

---

## Database Migrations

Current migration history includes:

```text
20260904114808_InitialPostgres
20260905130000_AddHabitImpactTracking
20260905145000_AddSavingsGoalsAndFutureTools
```

The backend calls:

```csharp
db.Database.Migrate();
```

when the API starts, so pending EF Core migrations are applied when valid database credentials are available.

---

## Local Development

### Prerequisites

Install:

- .NET 10 SDK
- Node.js and npm
- PostgreSQL access
- Git

Clone the repository:

```powershell
git clone https://github.com/Nafiztonmoy/HabitTracker.git
cd HabitTracker
```

If you already have the Git-ready project folder with its `.git` directory, you do not need to clone again.

---

## Frontend Setup

Go to the frontend folder:

```powershell
cd frontend\habit-tracker-client
```

Install dependencies:

```powershell
npm install
```

Create `.env` from the example if needed:

```powershell
Copy-Item .env.example .env
```

Example frontend configuration:

```env
REACT_APP_API_URL=http://localhost:5212/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
REACT_APP_FACEBOOK_APP_ID=your-facebook-app-id
REACT_APP_FACEBOOK_API_VERSION=v25.0
```

Never place API secrets or OAuth client secrets in the React `.env` file.

Run the frontend:

```powershell
npm start
```

Local frontend:

```text
http://localhost:3000
```

---

## Backend Setup

Go to the backend folder:

```powershell
cd backend\HabitTracker.Api
```

### PostgreSQL connection

Store the database connection string outside source control.

Example using .NET User Secrets:

```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=YOUR_HOST;Port=5432;Database=YOUR_DATABASE;Username=YOUR_USERNAME;Password=YOUR_PASSWORD;SSL Mode=Require"
```

### JWT

```powershell
dotnet user-secrets set "Jwt:Key" "YOUR_STRONG_RANDOM_JWT_KEY"
```

### Groq AI

```powershell
dotnet user-secrets set "Groq:ApiKey" "YOUR_GROQ_API_KEY"
dotnet user-secrets set "Groq:Model" "openai/gpt-oss-20b"
```

### Google authentication

```powershell
dotnet user-secrets set "ExternalAuth:GoogleClientId" "YOUR_GOOGLE_CLIENT_ID"
dotnet user-secrets set "ExternalAuth:GoogleClientSecret" "YOUR_GOOGLE_CLIENT_SECRET"
dotnet user-secrets set "ExternalAuth:GoogleRedirectUri" "http://localhost:3000"
```

### Facebook authentication

```powershell
dotnet user-secrets set "ExternalAuth:FacebookAppId" "YOUR_FACEBOOK_APP_ID"
dotnet user-secrets set "ExternalAuth:FacebookAppSecret" "YOUR_FACEBOOK_APP_SECRET"
dotnet user-secrets set "ExternalAuth:FacebookApiVersion" "v25.0"
```

### Run the backend

```powershell
dotnet restore
dotnet build
dotnet ef database update
dotnet run
```

Local API:

```text
http://localhost:5212
```

Keep the backend terminal running while using the frontend locally.

---

## API Overview

Protected endpoints require a valid Cadence JWT access token.

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
GET    /api/habits/impact-summary
GET    /api/habits/time-bank
GET    /api/habits/future-me
```

### Habit logs

```text
POST /api/logs
GET  /api/logs/{habitId}
```

### Savings goals

```text
GET    /api/goals
POST   /api/goals
PUT    /api/goals/{id}
POST   /api/goals/{id}/activate
DELETE /api/goals/{id}
```

### AI

```text
GET  /api/ai/status
POST /api/ai/smart-habit
POST /api/ai/weekly-review
POST /api/ai/future-me
```

---

## Life ROI Calculation Model

For every completed `HabitLog`:

```text
Money Saved = completions x MoneySavedPerCompletion
Time Recovered = completions x MinutesSavedPerCompletion
Time Invested = completions x MinutesInvestedPerCompletion
```

This keeps calculations tied to real completion history instead of manually maintained totals.

---

## Future Me Calculation Model

Future Me uses recent completion pace, with up to a 30-day lookback window, to estimate what the current routine may produce over future periods.

The calculated projection is generated first by the backend. AI is then used only to explain those calculated values.

---

## Google Login Setup

Create a Google Cloud OAuth client with application type **Web application**.

For local development, add:

```text
Authorized JavaScript origin:
http://localhost:3000
```

Use the Google Web Client ID in both the frontend and backend configuration where required.

Keep the Google Client Secret backend-only.

For production, update the allowed Google OAuth origins and redirect configuration to match the deployed frontend URL.

---

## Facebook Login Setup

Create a Meta developer app with Facebook Login enabled.

For local development:

- Enable Login with the JavaScript SDK
- Add localhost to the allowed JavaScript SDK domains
- Enable/request `public_profile` and `email`
- Put only the Facebook App ID in the frontend
- Keep the Facebook App Secret backend-only

Production authentication should use HTTPS and the deployed frontend domain must be configured in Meta's developer dashboard.

---

## Security

Never commit:

- `.env`
- PostgreSQL credentials
- JWT signing keys
- Groq API keys
- Google Client Secrets
- Facebook App Secrets
- downloaded OAuth credential files
- local credential files

For local development, use .NET User Secrets.

For deployment, use the hosting provider's environment variables or secret manager.

Common backend environment variable names:

```text
ConnectionStrings__DefaultConnection
Jwt__Key
Groq__ApiKey
Groq__Model
Frontend__Url
ExternalAuth__GoogleClientId
ExternalAuth__GoogleClientSecret
ExternalAuth__GoogleRedirectUri
ExternalAuth__FacebookAppId
ExternalAuth__FacebookAppSecret
ExternalAuth__FacebookApiVersion
```

---

## Production Deployment

The project is suitable for a split frontend/backend deployment.

Typical setup:

```text
Frontend  -> Vercel
Backend   -> Render
Database  -> PostgreSQL / Neon
```

### Backend production variables

Configure at minimum:

```text
ConnectionStrings__DefaultConnection
Jwt__Key
Frontend__Url
Groq__ApiKey
Groq__Model
ExternalAuth__GoogleClientId
ExternalAuth__GoogleClientSecret
ExternalAuth__GoogleRedirectUri
ExternalAuth__FacebookAppId
ExternalAuth__FacebookAppSecret
ExternalAuth__FacebookApiVersion
```

### Frontend production variables

Configure:

```text
REACT_APP_API_URL
REACT_APP_GOOGLE_CLIENT_ID
REACT_APP_FACEBOOK_APP_ID
REACT_APP_FACEBOOK_API_VERSION
```

Also verify:

- Production frontend URL is allowed by backend CORS
- Google production origins are correct
- Facebook production domains are correct
- PostgreSQL connection uses SSL when required
- Pending migrations apply successfully
- No secrets are present in Git history

---

## Useful Commands

### Frontend

```powershell
cd frontend\habit-tracker-client
npm install
npm start
npm test
npm run build
```

### Backend

```powershell
cd backend\HabitTracker.Api
dotnet restore
dotnet build
dotnet ef database update
dotnet run
```

### Git

```powershell
cd D:\HabitTracker
git status
git add .
git commit -m "Update Cadence"
git push origin main
```

---

## Current Product Areas

### Overview

Daily command center with:

- Today's completion progress
- Current streak and weekly rate
- Life ROI preview
- Weekly activity chart
- Today's remaining habits
- Active savings goal preview

### Habits

Main habit management area for:

- Creating habits
- Editing habits
- Completing habits
- Impact values
- Search and filters
- Habit history

### Life ROI

Detailed view of:

- Money saved
- Time recovered
- Time invested
- Impact-enabled habits
- Per-habit totals

### Goals

Savings goal management plus Time Bank.

### Future

30-day, 90-day, and 1-year projections plus AI interpretation.

### Reports

Weekly progress, consistency metrics, and AI weekly review.

---

## Development Notes

The project has evolved through additive phases while preserving the existing authentication and habit architecture.

### Phase 1

Added Life ROI and impact tracking.

See:

```text
PHASE1_LIFE_ROI.md
```

### Phase 2

Added Savings Goals, Time Bank, Future Me, AI Future Me, page-based navigation, and the Cadence product identity.

See:

```text
PHASE2_GOALS_FUTURE_ME.md
```

---

## Repository

GitHub: https://github.com/Nafiztonmoy/HabitTracker

---

## License

No license has been added yet. Add a license such as MIT if you plan to allow public reuse or redistribution.
