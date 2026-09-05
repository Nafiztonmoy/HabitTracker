# Phase 1: LIFE ROI implementation

This project extends the existing HabitTracker architecture without replacing authentication, habit tracking, Google login, existing migrations, or the HabitLog source of truth.

## Audit summary

Existing architecture inspected before implementation:

- Backend models: `Habit`, `HabitLog`, `User`
- DTOs: `HabitDTOs.cs`
- Business layer: `IHabitService`, `HabitService`
- Controllers: `HabitsController`, `LogsController`
- EF Core: `ApplicationDbContext`, existing PostgreSQL migration and model snapshot
- Frontend: `Dashboard`, `HabitForm`, `HabitCard`, API service
- Existing Groq and Google authentication code was left intact

## Phase 1 implemented

### Habit impact fields

Each habit now supports optional user estimates:

- `MoneySavedPerCompletion`
- `MinutesSavedPerCompletion`
- `MinutesInvestedPerCompletion`

Existing habits receive safe zero defaults and continue to work normally.

### Backend calculations

Completed `HabitLog` rows remain the source of truth. For each habit the API now returns:

- `totalCompletions`
- `totalMoneySaved`
- `totalMinutesSaved`
- `totalMinutesInvested`

The authenticated user also has a new endpoint:

`GET /api/habits/impact-summary`

It returns user-scoped totals and last-30-day totals. No cross-user data is queried.

### Frontend

- Create/Edit Habit now has an optional Life ROI section.
- Habit cards show up to two useful cumulative impact indicators.
- Dashboard now includes a connected Life Impact summary for estimated savings, time recovered, time invested, and successful changes.
- Impact-summary failure is isolated so core habit tracking still loads.
- BDT is formatted as `৳1,250` through a reusable formatter.
- Time is formatted consistently through a reusable formatter.

## Additive migration

New migration:

`20260905130000_AddHabitImpactTracking`

It only adds three columns to `Habits` with zero defaults. It does not delete or reset any existing migration or schema.

The application already calls `Database.Migrate()` at startup, so environments with valid database credentials will apply pending migrations when the backend starts. Production migration policy should still follow your normal deployment process.

## Validation performed in this workspace

- ESLint: passed for modified frontend JavaScript files.
- CSS parsing: passed.
- Jest: 2 suites passed, 3 tests passed.
- Frontend source parsing: passed.
- `npm run build`: attempted, but the supplied CRA build did not complete within this container's execution window.
- `dotnet build`: could not be run because this container does not have the .NET SDK installed.

Before production deployment, run:

```bash
cd backend/HabitTracker.Api
dotnet build

cd ../../frontend/habit-tracker-client
npm install
npm run build
```

Then verify login, Google login, normal habit creation, impact-enabled habit creation, completion/uncompletion totals, and the production PostgreSQL migration in your normal deployment environment.
