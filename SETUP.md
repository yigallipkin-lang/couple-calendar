# Setup Guide for Couple Calendar App

This guide walks you through setting up the development environment for the Couple Calendar app.

## Step 1: Initial Setup

### 1.1 Install pnpm (if not already installed)
```bash
npm install -g pnpm
```

### 1.2 Install dependencies
```bash
cd couple-calendar
pnpm install
```

This will install all dependencies for:
- packages/shared
- packages/web
- packages/mobile
- functions

## Step 2: Firebase Setup

### 2.1 Create a Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Create a project"
3. Name it "Couple Calendar"
4. Continue through the setup (disable analytics for MVP)
5. Go to "Project Settings" (gear icon → Project Settings)
6. Copy your Web SDK config

### 2.2 Enable Firebase Services

**Firestore:**
1. Left sidebar → "Build" → "Firestore Database"
2. Click "Create database"
3. Select "Start in production mode"
4. Choose region (e.g., us-central1)

**Authentication:**
1. Left sidebar → "Build" → "Authentication"
2. Click "Get started"
3. Click "Email/Password"
4. Enable it

**Cloud Messaging:**
1. Left sidebar → "Build" → "Cloud Messaging"
2. You should see a Server API Key (save this for later)

### 2.3 Create Web App

1. Project Settings → "Your apps" section
2. Click web icon `</>`
3. Name: "Couple Calendar Web"
4. Copy the config

### 2.4 Create Service Account (for Cloud Functions)

1. Project Settings → "Service accounts" tab
2. Click "Generate new private key"
3. Save this JSON file securely (don't commit to git!)

## Step 3: Environment Variables

### 3.1 Create .env.local

```bash
cp .env.example .env.local
```

### 3.2 Fill in Firebase Config

Edit `.env.local` with your Firebase Web SDK config:

```
VITE_FIREBASE_API_KEY=your_api_key_from_step_2.2
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=optional

NEXT_PUBLIC_WEB_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_service_account_private_key
FIREBASE_CLIENT_EMAIL=your_service_account_email
```

You can find all these values in your Firebase Project Settings.

## Step 4: Firebase CLI Setup

### 4.1 Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 4.2 Login to Firebase
```bash
firebase login
```

### 4.3 Initialize Firebase Project
```bash
firebase init
```

When prompted:
- Select "Firestore", "Functions", "Hosting"
- Use existing project "couple-calendar"
- For all prompts, use defaults (or press Enter)
- Accept overwriting firestore.rules and firebase.json

### 4.4 Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

## Step 5: Development Setup

### 5.1 .env files for Mobile
Create `packages/mobile/.env.local` with the same Firebase config:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
# ... etc
```

### 5.2 .env file for Web
Create `packages/web/.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
# ... etc
```

## Step 6: Run Development Servers

### Option A: Run All Platforms at Once
```bash
pnpm dev
```

This will start:
- Web: http://localhost:3000
- Mobile: Expo CLI will show a menu to run on device/simulator

### Option B: Run Individual Platforms

**Web only:**
```bash
pnpm --filter @couple-calendar/web dev
```

**Mobile only:**
```bash
pnpm --filter @couple-calendar/mobile dev
```

Then choose:
- `i` - Open in iOS Simulator
- `a` - Open in Android Emulator
- `w` - Open in web browser
- Or scan QR code with Expo Go app

## Step 7: Verify Setup

### 7.1 Web App
1. Open http://localhost:3000
2. You should see "Couple Calendar" landing page

### 7.2 Mobile App
1. Open Expo app on simulator or device
2. You should see "Couple Calendar" landing page

### 7.3 Firestore
1. Go to Firebase Console → Firestore Database
2. You should see the empty collections (no data yet)

## Troubleshooting

### pnpm install fails
```bash
# Clear cache and reinstall
pnpm install --frozen-lockfile=false
pnpm install
```

### Firebase CLI authentication fails
```bash
firebase logout
firebase login
```

### Firestore rules deployment fails
```bash
# Check rules syntax
firebase validate

# Then deploy
firebase deploy --only firestore:rules
```

### Expo connection issues
```bash
# Clear Expo cache
cd packages/mobile
npx expo start -c
```

### Next.js build fails
```bash
cd packages/web
rm -rf .next
pnpm build
```

## Next: Build Authentication

Once setup is complete, you're ready to build:
1. User signup/login screens
2. Email verification
3. Pairing flow (invite link + QR code)

See the main README.md for the complete roadmap.
