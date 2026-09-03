# Google + Facebook authentication setup

The code is already wired. You only need to add provider credentials.

## 1. Frontend environment

Copy `frontend/habit-tracker-client/.env.example` to `.env` and fill in:

```env
REACT_APP_API_URL=http://localhost:5212/api
REACT_APP_GOOGLE_CLIENT_ID=YOUR_GOOGLE_WEB_CLIENT_ID
REACT_APP_FACEBOOK_APP_ID=YOUR_FACEBOOK_APP_ID
REACT_APP_FACEBOOK_API_VERSION=v25.0
```

Restart `npm start` after changing `.env`.

## 2. Backend configuration

Do not put the Facebook App Secret in React or commit it to source control.

From `backend/HabitTracker.Api`, set configuration with .NET user-secrets or environment variables:

```bash
dotnet user-secrets init
dotnet user-secrets set "ExternalAuth:GoogleClientId" "YOUR_GOOGLE_WEB_CLIENT_ID"
dotnet user-secrets set "ExternalAuth:FacebookAppId" "YOUR_FACEBOOK_APP_ID"
dotnet user-secrets set "ExternalAuth:FacebookAppSecret" "YOUR_FACEBOOK_APP_SECRET"
dotnet user-secrets set "ExternalAuth:FacebookApiVersion" "v25.0"
```

Equivalent environment variable names are:

```text
ExternalAuth__GoogleClientId
ExternalAuth__FacebookAppId
ExternalAuth__FacebookAppSecret
ExternalAuth__FacebookApiVersion
```

## 3. Google console

Create a Web application OAuth client and add your frontend origin, for example:

```text
http://localhost:3000
```

Use the same Google Web Client ID in the frontend and backend settings.

## 4. Meta developer dashboard

Create/configure an app with Facebook Login for Web. Enable Login with the JavaScript SDK, add your production domain to Allowed Domains for JavaScript SDK, and request `public_profile,email`.

Meta's current web documentation requires HTTPS for authentication actions. Use HTTPS when testing Facebook Login outside environments explicitly supported by Meta, and always use HTTPS in production.

## 5. Database

A migration named `20260815000000_AddExternalLogins` was added. The app already calls `Database.Migrate()` on startup, so the new `ExternalLogins` table will be created when the backend starts.

## Security behavior

Provider tokens are verified on the backend before your app issues its own JWT. The Facebook App Secret never goes to the browser. Existing password accounts are not silently linked to a social identity just because the email matches; this avoids unsafe automatic account linking.
