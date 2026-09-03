# Grok AI setup

This project uses xAI Grok for:

- Smart Habit Creator in the New Habit modal
- AI Weekly Review on the dashboard

## 1. Create an xAI API key

Create an API key in the xAI developer console. Keep the key on the backend only.

## 2. Store the key with .NET user secrets

From `backend/HabitTracker.Api` run:

```powershell
dotnet user-secrets set "XAI:ApiKey" "YOUR_XAI_API_KEY"
dotnet user-secrets list
```

The project already contains a `UserSecretsId`, so `dotnet user-secrets init` should not be necessary.

## 3. Configuration

`appsettings.json` contains only non-secret defaults:

```json
"XAI": {
  "ApiKey": "",
  "BaseUrl": "https://api.x.ai/v1",
  "Model": "grok-4.6"
}
```

Do not place the real API key in React `.env` or commit it to source control.

## 4. Run

Backend:

```powershell
cd backend\HabitTracker.Api
dotnet restore
dotnet build
dotnet run
```

Frontend:

```powershell
cd frontend\habit-tracker-client
npm install
npm start
```

## 5. Verify AI status

After signing in, the frontend calls `GET /api/ai/status`. A configured backend returns data similar to:

```json
{
  "configured": true,
  "provider": "xAI Grok",
  "model": "grok-4.6"
}
```

AI endpoints:

- `GET /api/ai/status`
- `POST /api/ai/smart-habit`
- `POST /api/ai/weekly-review`
