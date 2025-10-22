PapiOS (getpapi)

Retro terminal UI built with Next.js (App Router), Tailwind, NextAuth (Google), Anthropic Claude, and Google Docs/Drive APIs.

🚀 Quick start
git clone https://github.com/FredoHausner/Papi
cd Papi/getpapi
npm install

Create .env.local in Papi/getpapi:

# NextAuth

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace_with_a_random_base64_string

# Google OAuth (from Google Cloud Console)

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Anthropic

ANTHROPIC_API_KEY=your_anthropic_api_key

Generate a strong secret (paste the output into NEXTAUTH_SECRET):

openssl rand -base64 32

Run the dev server:

npm run dev

# open http://localhost:3000

🔐 Google Cloud setup (one-time)

Create project at https://console.cloud.google.com/

OAuth consent screen → External → fill in app name & support email → Save.

Enable APIs (APIs & Services → Library):

Google Drive API

Google Docs API

Create OAuth Client (APIs & Services → Credentials → Create Credentials → OAuth client ID):

App type: Web application

Authorized redirect URI:

http://localhost:3000/api/auth/callback/google

Copy Client ID and Client Secret into .env.local.

Add scopes (OAuth consent screen → Data Access → Add or remove scopes):

https://www.googleapis.com/auth/documents
https://www.googleapis.com/auth/drive.file

Add Test Users (OAuth consent screen → Test users):
Add the Google accounts that will sign in during development.

If you change scopes later, sign out and sign back in to refresh tokens.

🧪 Using the terminal

Type prompts; they’re sent to Claude via /api/claude.

Keyboard shortcuts:

^G (Ctrl+G): Google actions (e.g., list docs)

^R (Ctrl+R): Restart session

^K (Ctrl+K): Clear screen

Google export commands (once signed in):

google login – trigger OAuth flow

google docs – list recent Docs

export new <title> – create a new Doc with current session

export to <#> – append session to a listed Doc by index

🛠️ Project scripts
npm run dev # start dev server
npm run build # production build
npm run start # start production server
npm run lint # eslint

❓Troubleshooting

403 PERMISSION_DENIED / ACCESS_TOKEN_SCOPE_INSUFFICIENT
Make sure both Docs + Drive scopes are added and you re-authenticated after the change.

User logging in will have to check and acknowledge these boxes

useSession must be wrapped in a <SessionProvider />
Ensure app/providers.tsx is used in app/layout.tsx.

JWT decryption failed / NO_SECRET / NEXTAUTH_URL warnings
Confirm NEXTAUTH_SECRET and NEXTAUTH_URL are set in .env.local, then restart npm run dev.

📁 Where things live

app/api/auth/[...nextauth]/route.ts — NextAuth Google provider

app/api/claude/route.ts — Anthropic Claude endpoint

app/api/google/\* — Google Docs/Drive endpoints

app/components/Terminal/\* — terminal UI

# example .env.local file variables:

NEXT_PUBLIC_API_BASE_URL=
ANTHROPIC_API_KEY=
GOOGLE_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

For app, use localhost:3000
and for NEXTAUTH_SECRET use
`openssl rand -base64 32`
on macintosh and
`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
on windows with node installed
to generate a random token
