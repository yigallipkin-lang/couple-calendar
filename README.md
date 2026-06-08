# Couple Calendar App

A modern, couples-only shared calendar and todo app available on web (Next.js), iOS (React Native), and Android (React Native).

## Tech Stack

- **Frontend**
  - Web: Next.js 14 + TypeScript + Tailwind CSS
  - Mobile: React Native (Expo) + TypeScript
  - Shared: Monorepo with shared types, hooks, and utilities

- **Backend**
  - Firebase Auth (email/password)
  - Firestore (real-time database)
  - Firebase Cloud Functions (notifications, reminders)
  - Firebase Cloud Messaging (push notifications)

- **Deployment**
  - Web: Vercel
  - Mobile: Expo EAS (TestFlight & Google Play Console)
  - Backend: Firebase Console

## Project Structure

```
couple-calendar/
├── packages/
│   ├── shared/          # Shared TypeScript types, hooks, utilities
│   │   └── src/
│   │       ├── types/   # All TypeScript interfaces
│   │       ├── hooks/   # Custom React hooks (useAuth, useEvents, etc.)
│   │       ├── utils/   # Date, color, Firebase helper utilities
│   │       └── firebase/# Firebase config and Firestore paths
│   │
│   ├── web/             # Next.js web app
│   │   └── src/
│   │       ├── app/     # App Router (pages, layouts)
│   │       └── components/ # Reusable components
│   │
│   └── mobile/          # React Native (Expo) mobile app
│       └── src/
│           ├── App.tsx  # Root component
│           └── screens/ # App screens
│
├── functions/           # Firebase Cloud Functions (TypeScript)
│   └── src/
│       └── index.ts     # Notification & reminder functions
│
├── firebase/            # Firebase configuration
│   ├── firestore.rules  # Firestore security rules
│   ├── firestore.indexes.json # Firestore indexes
│   └── firebase.json    # Firebase config
│
└── docs/                # Architecture & API documentation

```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Firebase account
- For iOS: Xcode
- For Android: Android Studio

### 1. Clone & Install

```bash
git clone <repo-url>
cd couple-calendar
pnpm install
```

### 2. Set Up Firebase

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database (production mode)
3. Enable Firebase Authentication (email/password)
4. Enable Cloud Messaging for notifications
5. Create a web app in Firebase Console
6. Copy your Firebase config

### 3. Environment Variables

```bash
cp .env.example .env.local
```

Fill in your Firebase config in `.env.local`:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 4. Deploy Firestore Rules

```bash
# Install Firebase CLI if you haven't
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

### 5. Run Development Servers

```bash
# All platforms at once
pnpm dev

# Or individually:
pnpm --filter @couple-calendar/web dev   # Web: http://localhost:3000
pnpm --filter @couple-calendar/mobile dev # Mobile: Expo CLI
```

## Features

### Phase 1: Foundation & Auth ✅
- [x] Monorepo setup
- [x] Firebase configuration
- [x] Firestore schema (users, couples)
- [x] Shared types and utilities
- [x] Cloud Functions structure
- [ ] User signup/login flow (Next up)
- [ ] Pairing flow (invite link + QR code)

### Phase 2: Calendar & Events (Next)
- [ ] Month calendar view
- [ ] Event CRUD
- [ ] Real-time Firestore listeners
- [ ] Reminders
- [ ] Push notifications

### Phase 3: Todos & Polish (Later)
- [ ] Multiple todo lists
- [ ] Todo item CRUD
- [ ] Partner colors
- [ ] Dark mode UI
- [ ] Deployment

## Data Model

### Collections

**users/{userId}**
```typescript
{
  email: string;
  displayName: string;
  color: string; // Partner's color (hex)
  partnerId: string | null;
  createdAt: timestamp;
  photoURL?: string;
  fcmToken?: string; // For push notifications
}
```

**couples/{coupleId}** (where coupleId = min(userId1, userId2))
```typescript
{
  partner1Id: string;
  partner2Id: string;
  pairedAt: timestamp;
  settings: {
    theme: "dark" | "light";
    language: string;
    notificationsEnabled: boolean;
  }
}
```

**couples/{coupleId}/events/{eventId}**
```typescript
{
  coupleId: string;
  createdBy: string; // userId
  title: string;
  startTime: timestamp | null;
  endTime: timestamp | null;
  allDay: boolean;
  color: string; // Hex color of creator
  notes?: string;
  location?: string;
  reminder: "none" | "15min" | "1hour" | "1day" | "1week";
  checklist?: Array<{ id, text, done }>;
  updatedAt: timestamp;
  createdAt: timestamp;
}
```

**couples/{coupleId}/todoLists/{listId}**
```typescript
{
  coupleId: string;
  name: string; // "Groceries", "Chores", etc.
  createdBy: string;
  items: Array<{ id, text, done, createdAt }>;
  updatedAt: timestamp;
  createdAt: timestamp;
}
```

## Shared Utilities

### Hooks (`packages/shared/src/hooks/`)
- `useAuth()` - Authentication state and methods
- `useCoupleContext()` - Couple and partner data
- `useEvents()` - Real-time event listener (Phase 2)
- `useTodoLists()` - Real-time todo listener (Phase 3)
- `useNotifications()` - FCM token registration
- `useFirestore()` - Generic Firestore wrapper

### Utils (`packages/shared/src/utils/`)
- `dateUtils.ts` - Date formatting, calendar logic
- `colorUtils.ts` - Color manipulation, vibrant colors
- `firebaseConfig.ts` - Firebase initialization
- `firestore-refs.ts` - Type-safe collection paths

## Security

### Firestore Rules
- Users can only read/write their own user document
- Both partners in a couple can read/write events and todos
- Notifications are read-only for the recipient
- Cloud Functions are the only write source for notifications

## Design System

### Colors (Vibrant & Saturated)
- Blue: `#3B82F6`, `#0EA5E9`
- Green: `#10B981`, `#06B6D4`
- Orange/Red: `#F59E0B`, `#F97316`, `#EF4444`
- Purple: `#A855F7`, `#8B5CF6`, `#D946EF`

### Dark Mode (Default)
- Background: `#0f172a` (slate-950)
- Text: `#f1f5f9` (slate-50)
- Accents: Vibrant colors above

## Deployment

### Web (Vercel)
```bash
cd packages/web
vercel deploy
```

### Mobile (Expo EAS)
```bash
pnpm --filter @couple-calendar/mobile eas build --platform ios --profile preview
pnpm --filter @couple-calendar/mobile eas build --platform android --profile preview
```

### Backend (Firebase)
```bash
firebase deploy --only functions
firebase deploy --only firestore:rules
```

## API Endpoints (Phase 1+)

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in existing user
- `POST /api/auth/send-pairing-link` - Generate pairing link
- `POST /api/auth/verify-pairing` - Verify & complete pairing

### Couple Data (Phase 2+)
- `GET /api/couple/info` - Get couple info
- `GET /api/couple/events` - List couple's events
- `GET /api/couple/todos` - List couple's todo lists

## Next Steps

1. ✅ Project initialization (monorepo, Firebase setup)
2. 📦 Implement shared types and utilities
3. 🔐 Build authentication flow (signup, signin, pairing)
4. 📅 Implement month calendar and events
5. ✅ Build todo list feature
6. 🎨 Polish design and dark mode
7. 📱 Test on real devices (iOS/Android)
8. 🚀 Deploy to production

## Contributing

See CONTRIBUTING.md for development guidelines.

## License

MIT
