# Cadence - Phase 2

This phase adds Savings Goals, Time Bank, Future Me projections, and a Future Me AI interpretation while preserving the existing auth, habit tracking, Life ROI, PostgreSQL setup, and Git history.

## New product areas

### Goals
- Create, edit, activate, and delete savings goals.
- Only one savings goal is active at a time.
- Money saved by completed impact-enabled habits is counted toward the active goal.
- Existing savings can be entered as a starting amount.
- Optional target dates are supported.

### Time Bank
- Tracks lifetime recovered time.
- Shows recovered time for the last 30 days and last 7 days.
- Shows the habit that has recovered the most time.
- Uses completed HabitLogs as the source of truth.

### Future Me
- Projects 30-day, 90-day, and 1-year money and time outcomes.
- Uses the recent real completion pace, up to a 30-day lookback window.
- Shows an estimated time to the active savings goal when enough money-saving pace data exists.

### AI Future Me
- Uses the existing Groq integration.
- AI only receives calculated projections and current habit statistics.
- AI is instructed not to invent extra money, time, dates, or completion data.

## Backend additions
- `SavingsGoal` model and additive PostgreSQL migration.
- `/api/goals` CRUD and activation endpoints.
- `GET /api/habits/time-bank`
- `GET /api/habits/future-me`
- `POST /api/ai/future-me`

## Frontend additions
- `/goals`
- `/future-me`
- Dashboard goal / Future Me preview.
- Updated responsive navigation.
- Brand name changed from Habit Architecture to Cadence.
- Added restrained entry, hover, progress, and brand motion with reduced-motion fallbacks.

## Local run

Backend:

```powershell
cd D:\HabitTracker\backend\HabitTracker.Api
dotnet restore
dotnet build
dotnet ef database update
dotnet run
```

Frontend:

```powershell
cd D:\HabitTracker\frontend\habit-tracker-client
npm install
npm start
```
