# 📺 VSA - Video Sharing App

A web application for sharing livestreams with your team. Create video meeting rooms instantly and share them with authenticated users. Built with Next.js, Jitsi Meet, and Microsoft authentication.

## How It Works

1. Users sign in with their Microsoft (Azure AD) account
2. Create a meeting room with one click (Quick Start) or custom time
3. Share the meeting link — anyone with the link can join the Jitsi video room
4. The host opens the livestream (e.g. TV4 Play) and shares their screen in the Jitsi meeting
5. Everyone in the meeting can watch the livestream together

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Auth**: NextAuth.js with Microsoft Azure AD
- **Video**: Jitsi Meet (public instance)
- **Architecture**: Controller → Service → Repository pattern
- **Infrastructure**: Docker / Docker Compose with hot reload

## Project Structure

```
src/
├── lib/types.ts                              # Shared TypeScript interfaces
├── components/
│   ├── Header.tsx                            # Top bar with user info + sign out
│   ├── LoginScreen.tsx                       # Microsoft sign-in screen
│   ├── CreateMeetingPanel.tsx                # Quick start buttons + custom form
│   ├── MeetingList.tsx                       # Meeting cards with live indicator
│   ├── JoinModal.tsx                         # Confirmation modal before joining
│   └── Spinner.tsx                           # Loading spinner
├── api/meetings/
│   ├── controller/meeting.controller.ts      # Auth guard + HTTP request handling
│   ├── service/meeting.service.ts            # Validation + business logic
│   └── repository/meeting.repository.ts      # Data storage + Jitsi link generation
├── app/
│   ├── api/auth/[...nextauth]/route.ts       # Microsoft login endpoint
│   ├── api/meetings/route.ts                 # GET (list) + POST (create)
│   ├── api/meetings/[meetingId]/route.ts     # GET (single) + DELETE
│   ├── layout.tsx                            # Root layout with fonts + session
│   ├── page.tsx                              # Main page composing all components
│   └── globals.css                           # Global styles
```

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- A Microsoft Azure account (free tier works)

## Setup Guide

### Step 1: Register an App in Azure AD

1. Go to [portal.azure.com](https://portal.azure.com)
2. Navigate to **Microsoft Entra ID** → **App registrations** → **New registration**
3. Fill in:
   - **Name**: `VSA - Video Sharing App`
   - **Supported account types**: Choose based on your needs:
     - **Single tenant** — only users from your organization
     - **Multiple Entra ID tenants** — users from any organization
   - **Redirect URI**: Leave blank for now
4. Click **Register**
5. On the overview page, copy:
   - **Application (client) ID** → you'll need this for `AZURE_CLIENT_ID`
   - **Directory (tenant) ID** → you'll need this for `AZURE_TENANT_ID`

### Step 2: Create a Client Secret

1. In your app registration, go to **Certificates & secrets**
2. Click **New client secret**
3. Add a description (e.g. `vsa-secret`), choose an expiry period
4. Click **Add**
5. **Copy the Value immediately** — it won't be shown again. This is your `AZURE_CLIENT_SECRET`

### Step 3: Add a Redirect URI

1. Go to **Authentication** in the left sidebar
2. Click **Add a platform** → **Web**
3. Set the redirect URI to:
   ```
   http://localhost:3000/api/auth/callback/azure-ad
   ```
4. Click **Configure** / **Save**

### Step 4: Configure API Permissions

1. Go to **API permissions** in the left sidebar
2. Click **Add a permission** → **Microsoft Graph** → **Delegated permissions**
3. Add: `User.Read`
4. Click **Add permissions**
5. If you are an admin, click **Grant admin consent for [your org]**

### Step 5: Configure Environment Variables

1. Copy the example env file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your values:
   ```env
   # From Step 1
   AZURE_TENANT_ID=your-tenant-id
   AZURE_CLIENT_ID=your-client-id

   # From Step 2
   AZURE_CLIENT_SECRET=your-client-secret

   # Generate with: openssl rand -base64 32
   NEXTAUTH_SECRET=your-random-secret

   # Leave as-is for local development
   NEXTAUTH_URL=http://localhost:3000

   # Jitsi instance (public, no setup needed)
   JITSI_BASE_URL=https://meet.jit.si

   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   > **Tip**: If you set the app to single tenant, use your specific tenant ID.
   > If multi-tenant, you can set `AZURE_TENANT_ID=common`.

### Step 6: Run the App

```bash
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Click **Sign in with Microsoft** and log in with your organizational account
2. Use **Quick Start** buttons to create a meeting instantly (20min, 30min, 1h, 2h)
3. Or expand **Custom Meeting** to set a specific subject and time range
4. Click **Join** on any meeting to open the Jitsi video room
5. In the Jitsi room, click **Share Screen** to broadcast a livestream to all participants

## API Endpoints

All endpoints require authentication (Microsoft sign-in).

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/meetings` | List all meetings |
| `POST` | `/api/meetings` | Create a meeting |
| `GET` | `/api/meetings/:id` | Get a specific meeting |
| `DELETE` | `/api/meetings/:id` | Delete a meeting |

### Create Meeting Request Body

```json
{
  "subject": "Movie Night",
  "startDateTime": "2026-02-28T19:00:00.000Z",
  "endDateTime": "2026-02-28T21:00:00.000Z"
}
```

## Development

The Docker setup includes hot reload — any changes to source files are reflected immediately without rebuilding.

```bash
# Start in background
docker compose up --build -d

# View logs
docker compose logs app -f

# Stop
docker compose down
```

## Notes

- Meeting data is stored in-memory and resets when the container restarts
- Meeting room URLs use long random IDs (UUID + 32 hex chars) making them virtually unguessable
- The app uses the public `meet.jit.si` instance — no Jitsi setup required
- You can point `JITSI_BASE_URL` to a self-hosted Jitsi instance for more control
