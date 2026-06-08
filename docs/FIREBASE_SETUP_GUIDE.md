# Firebase Setup Guide — Step by Step

This guide walks you through creating a Firebase project and configuring all necessary services for the Couple Calendar app.

---

## 📋 Checklist

- [ ] Create Firebase project
- [ ] Enable Firestore Database
- [ ] Enable Firebase Authentication (Email/Password)
- [ ] Enable Cloud Messaging
- [ ] Create Web App in Firebase
- [ ] Copy Firebase Config
- [ ] Create Service Account (for Cloud Functions)
- [ ] Install Firebase CLI
- [ ] Deploy Firestore Rules
- [ ] Configure Environment Variables
- [ ] Test Firebase Connection

---

## Step 1: Create Firebase Project

### 1.1 Go to Firebase Console
1. Open https://console.firebase.google.com
2. Click **"Create a project"** or **"+ Add project"**

### 1.2 Project Setup
1. **Project Name**: Enter `Couple Calendar` (or your preferred name)
2. **Analytics**: Disable Google Analytics (not needed for MVP)
3. Click **"Create project"**

⏳ Wait for project creation (1-2 minutes)

### 1.3 Verify Project Created
You should see your project name at the top of the console.

---

## Step 2: Enable Firestore Database

### 2.1 Navigate to Firestore
1. Left sidebar → **"Build"** → **"Firestore Database"**
2. Click **"Create database"**

### 2.2 Configure Database
1. **Location**: Select a region (recommend `us-central1` or closest to you)
2. **Mode**: Select **"Start in production mode"**
3. Click **"Create"**

⏳ Wait for database creation (30-60 seconds)

### 2.3 Verify Firestore Created
You should see an empty Firestore console with no collections yet.

---

## Step 3: Enable Firebase Authentication

### 3.1 Navigate to Authentication
1. Left sidebar → **"Build"** → **"Authentication"**
2. Click **"Get started"**

### 3.2 Enable Email/Password
1. Find **"Email/Password"** in the sign-in methods
2. Click it
3. Toggle **"Enable"** to ON
4. Click **"Save"**

You should see "Email/Password" listed as enabled.

---

## Step 4: Enable Cloud Messaging

### 4.1 Navigate to Cloud Messaging
1. Left sidebar → **"Build"** → **"Cloud Messaging"**

### 4.2 Get Server API Key
1. At the top, you should see "Cloud Messaging API" with a status
2. If disabled, click to enable it
3. Your **Server API Key** will appear at the top of the page
4. **Save this key** (you'll need it later for testing)

---

## Step 5: Create Web App

### 5.1 Navigate to Project Settings
1. Top right → **Settings icon** (gear) → **"Project settings"**

### 5.2 Add Web App
1. Under **"Your apps"** section, click the **Web icon** `</>`
2. App name: `Couple Calendar Web`
3. Click **"Register app"**

### 5.3 Copy Firebase Config
You'll see a code block like:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "couple-calendar-xxx.firebaseapp.com",
  projectId: "couple-calendar-xxx",
  storageBucket: "couple-calendar-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcd1234",
  measurementId: "G-XXXXX"
};
```

**COPY THIS ENTIRE OBJECT** — You'll need it for .env.local

---

## Step 6: Create Service Account (for Cloud Functions)

### 6.1 Navigate to Service Accounts
1. Top right → **Settings icon** (gear) → **"Project settings"**
2. Click **"Service accounts"** tab

### 6.2 Generate Private Key
1. Click **"Generate new private key"**
2. A JSON file will download (e.g., `couple-calendar-xxx-firebase-adminsdk-xxxxx.json`)
3. **SAVE THIS FILE SECURELY** (don't commit to git!)
4. Open the JSON file in a text editor and copy the contents

You need these values from the JSON:
- `project_id`
- `private_key`
- `client_email`

---

## Step 7: Create Environment Variables File

### 7.1 Edit .env.local

Open `C:\Users\mayze\projects\couple-calendar\.env.local` and fill in:

```env
# From Firebase Config (Step 5.3)
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=couple-calendar-xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=couple-calendar-xxx
VITE_FIREBASE_STORAGE_BUCKET=couple-calendar-xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcd1234
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXX

# Web App URLs
NEXT_PUBLIC_WEB_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# From Service Account JSON (Step 6.2)
FIREBASE_PROJECT_ID=couple-calendar-xxx
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@couple-calendar-xxx.iam.gserviceaccount.com
```

**Important**: Use the exact values from Firebase Console (no placeholders!)

### 7.2 Also Create .env.local for Mobile

Copy the same environment variables to `packages/mobile/.env.local`:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=couple-calendar-xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=couple-calendar-xxx
VITE_FIREBASE_STORAGE_BUCKET=couple-calendar-xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcd1234
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXX
```

### 7.3 Also Create .env.local for Web

Copy to `packages/web/.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=couple-calendar-xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=couple-calendar-xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=couple-calendar-xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcd1234
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXX

NEXT_PUBLIC_WEB_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## Step 8: Install Firebase CLI

### 8.1 Install Globally
```bash
npm install -g firebase-tools
```

### 8.2 Verify Installation
```bash
firebase --version
```

You should see a version number (e.g., `13.0.0`)

---

## Step 9: Login to Firebase

### 9.1 Authenticate
```bash
firebase login
```

This will open a browser window asking you to log in with your Google account.

### 9.2 Verify Login
```bash
firebase projects:list
```

You should see your "couple-calendar" project listed.

---

## Step 10: Initialize Firebase Project Locally

### 10.1 Initialize
```bash
cd C:\Users\mayze\projects\couple-calendar
firebase init
```

### 10.2 Answer Prompts

When asked what features to set up, select:
- ✅ **Firestore: Configure security rules and indexes**
- ✅ **Functions: Configure a Cloud Functions directory**
- ✅ **Hosting: Configure files for Firebase Hosting**

(Use arrow keys to navigate, space to toggle, enter to confirm)

### 10.3 Project Selection

When asked which project, select:
- **"couple-calendar-xxx"** (the one you created)

### 10.4 Default Answers

For remaining prompts, press Enter to use defaults:
- Use existing Firestore rules file: **Yes** (keep firestore.rules)
- Use existing functions: **Yes** (keep existing)
- Public directory: **public** (or press Enter)
- etc.

**Result**: This creates `.firebaserc` and updates firebase.json

---

## Step 11: Deploy Firestore Rules

### 11.1 Deploy Rules
```bash
firebase deploy --only firestore:rules
```

You should see:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/couple-calendar-xxx/overview
```

### 11.2 Verify Deployment
Go to Firebase Console → Firestore → Rules tab. You should see your security rules loaded.

---

## Step 12: Test Connection

### 12.1 Run Web App
```bash
cd C:\Users\mayze\projects\couple-calendar
pnpm install  # If not done already
pnpm --filter @couple-calendar/web dev
```

Open http://localhost:3000 in your browser.

### 12.2 Check Console for Errors
1. Open browser DevTools (F12)
2. Go to Console tab
3. You should see **NO red Firebase errors**

If you see errors like:
- "Firebase API key is invalid"
- "Permission denied" errors

Then you need to double-check your .env.local values.

### 12.3 Test Firestore Connection
In browser console, you can manually test:
```javascript
// If your app loads, Firebase is connected!
console.log("Firebase loaded successfully");
```

---

## 🎯 Success Criteria

- [ ] Firebase project created and visible in console
- [ ] Firestore Database is active (no errors)
- [ ] Authentication shows "Email/Password" enabled
- [ ] Cloud Messaging API is enabled
- [ ] Web app registered in Firebase
- [ ] firebase.json has been initialized locally
- [ ] .env.local files created with all values
- [ ] `firebase deploy --only firestore:rules` succeeded
- [ ] Web app loads at http://localhost:3000 without Firebase errors

---

## ⚠️ Troubleshooting

### "Firebase API key is invalid"
- Check that VITE_FIREBASE_API_KEY (or NEXT_PUBLIC_FIREBASE_API_KEY) is exactly as shown in Firebase Config
- Make sure .env.local is in the right directory
- Try restarting the dev server

### "Permission denied" errors
- Firestore rules were not deployed
- Run: `firebase deploy --only firestore:rules`
- Check that rules deployed successfully in Firebase Console

### "firebase command not found"
- Install Firebase CLI: `npm install -g firebase-tools`
- Verify: `firebase --version`

### "No projects found" when running firebase init
- Make sure you're logged in: `firebase login`
- Verify project exists: `firebase projects:list`

### Firestore rules deployment fails
- Check rules syntax: `firebase validate`
- Make sure you have write permissions in Firebase Console
- Try deploying again

### Port 3000 already in use
```bash
# Use a different port
pnpm --filter @couple-calendar/web dev -- -p 3001
```

---

## 📝 Next Steps After Setup

Once Firebase is configured:

1. **Test Authentication** (Phase 1)
   - Open http://localhost:3000
   - Try creating a test user
   - Verify it appears in Firebase Console → Authentication

2. **Start Building Auth Flows** (Phase 1 continued)
   - Implement signup form
   - Implement login form
   - Test with real Firebase

3. **Deploy Firestore Indexes** (if needed)
   - Firebase will suggest indexes as you query
   - Deploy them with: `firebase deploy --only firestore:indexes`

---

## 📚 Resources

- Firebase Console: https://console.firebase.google.com
- Firestore Docs: https://firebase.google.com/docs/firestore
- Firebase CLI Docs: https://firebase.google.com/docs/cli
- Rules Playground: https://firebase.google.com/docs/rules/rules-language

---

**✅ Firebase is now ready for development!** 🚀

Next: We'll implement authentication flows (signup/login/pairing) in the web and mobile apps.
