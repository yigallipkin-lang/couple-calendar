# Couple Calendar - Firestore Security Rules Documentation

## Overview

This document explains the Firestore security rules implemented for the Couple Calendar application. The rules are designed to:

- **Authenticate** all database access
- **Authorize** operations based on couple membership
- **Protect** user privacy and data
- **Prevent** unauthorized access and modifications

## Collection Structure

```
firestore
├── users/
│   └── {userId}/
│       ├── email: string
│       ├── displayName: string
│       ├── color: string
│       ├── partnerId: string | null
│       ├── createdAt: timestamp
│       └── photoURL: string (optional)
│
├── couples/
│   └── {coupleId}/
│       ├── partner1Id: string
│       ├── partner2Id: string
│       ├── pairedAt: timestamp
│       └── settings: object
│
├── events/
│   └── {coupleId}/
│       └── items/
│           └── {eventId}/
│               ├── title: string
│               ├── startTime: timestamp | null
│               ├── endTime: timestamp | null
│               ├── allDay: boolean
│               ├── color: string
│               ├── notes: string (optional)
│               ├── location: string (optional)
│               ├── reminder: string
│               ├── checklist: array (optional)
│               ├── createdBy: string
│               ├── createdAt: timestamp
│               └── updatedAt: timestamp
│
├── todoLists/
│   └── {coupleId}/
│       └── items/
│           └── {itemId}/
│               ├── text: string
│               ├── done: boolean
│               ├── createdAt: timestamp
│               └── updatedAt: timestamp
│
├── notifications/
│   └── {coupleId}/
│       └── {notificationId}/
│           ├── userId: string
│           ├── type: string
│           ├── relatedId: string
│           ├── read: boolean
│           ├── createdAt: timestamp
│           └── message: string
│
└── pairing_codes/
    └── {code}/
        ├── code: string
        ├── generatorId: string
        ├── createdAt: timestamp
        ├── expiresAt: timestamp
        ├── used: boolean
        ├── acceptedBy: string (optional)
        └── acceptedAt: timestamp (optional)
```

## Security Rules by Collection

### 1. Users Collection

**Location:** `/users/{userId}`

**Rules:**
- ✅ Users can read their own document
- ✅ Users can write to their own document
- ✅ Users can create their account (during signup)
- ❌ Users cannot delete their account (must contact support)
- ❌ Users cannot read/write other users' documents

**Use Cases:**
- Authenticate user
- Update profile (display name, color, partner ID)
- Retrieve user metadata

### 2. Couples Collection

**Location:** `/couples/{coupleId}`

**Rules:**
- ✅ Both partners can read couple document
- ✅ Both partners can write to couple document
- ✅ Cloud Functions can create couple during pairing
- ❌ Cannot delete couple
- ❌ Only members of the couple can access

**CoupleId Format:** `{userId1}_{userId2}` (lexicographically sorted for consistency)

**Use Cases:**
- Store couple metadata
- Store couple settings (theme, notifications, language)
- Reference partner relationship

### 3. Events Collection

**Location:** `/events/{coupleId}/items/{eventId}`

**Rules:**
- ✅ Both partners can read all couple events
- ✅ Both partners can create new events
- ✅ Both partners can update events
- ✅ Both partners can delete events
- ❌ Only couple members can access events
- ❌ Non-members cannot see events

**Use Cases:**
- Create shared calendar events
- Update event details (time, location, notes)
- Delete events
- Real-time sync via Firestore listeners

### 4. Todo Lists Collection

**Location:** `/todoLists/{coupleId}/items/{itemId}`

**Rules:**
- ✅ Both partners can read all todo items
- ✅ Both partners can create new items
- ✅ Both partners can update items
- ✅ Both partners can delete items
- ❌ Only couple members can access todos
- ❌ Non-members cannot see todos

**Use Cases:**
- Create shared todo items
- Check off completed items
- Delete items
- Manage multiple todo lists

### 5. Notifications Collection

**Location:** `/notifications/{coupleId}/{notificationId}`

**Rules:**
- ✅ Users can read their own notifications
- ❌ Users cannot write notifications (Cloud Functions only)
- ❌ Users cannot delete notifications
- ❌ Users cannot read partner's notifications

**Note:** This collection is managed entirely by Cloud Functions.

**Use Cases:**
- Track event creation notifications
- Track todo completion notifications
- Audit notification history

### 6. Pairing Codes Collection

**Location:** `/pairing_codes/{code}`

**Rules:**
- ✅ Authenticated users can read pairing codes
- ❌ Users cannot create pairing codes (Cloud Functions only)
- ❌ Users cannot modify pairing codes
- ❌ Users cannot delete pairing codes
- ❌ Unauthenticated users cannot access codes

**Note:** Entire collection managed by Cloud Functions.

**Use Cases:**
- Validate pairing code
- Retrieve generator's information
- Check code expiration
- Verify code has not been used

## Key Security Features

### 1. Authentication Requirement

All operations require `request.auth != null`. Unauthenticated users cannot read or write any data.

```javascript
function isAuth() {
  return request.auth != null;
}
```

### 2. Couple Membership Validation

Access to couple-related collections requires verified membership:

```javascript
function isCouplePartner(coupleId) {
  let couple = get(/databases/$(database)/documents/couples/$(coupleId)).data;
  return couple.partner1Id == uid() || couple.partner2Id == uid();
}
```

### 3. Least Privilege Access

- Users can only modify their own document
- Couples can only be modified by members
- Notifications are read-only for users
- Pairing codes are managed by Cloud Functions only

### 4. Data Isolation

- Events are grouped by couple ID (not globally searchable)
- Todos are grouped by couple ID (not globally searchable)
- Users cannot access other couples' data
- Notifications include recipient validation

### 5. Immutable Operations

- User deletion disabled
- Couple deletion disabled
- Notification deletion disabled
- Pairing code deletion disabled

## Deployment Instructions

### 1. Test Rules (Recommended)

Before deploying, test rules in Firebase Console:

```bash
# In Firebase Console:
# 1. Go to Firestore Database → Rules tab
# 2. Click "Rules Playground" to test
# 3. Simulate authentication and operations
```

### 2. Deploy Rules via Firebase CLI

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Authenticate with Firebase
firebase login

# Deploy rules to your project
firebase deploy --only firestore:rules

# Or deploy all (including indexes, rules, etc.)
firebase deploy
```

### 3. Deploy Rules via Firebase Console

```
1. Go to Firebase Console → Firestore → Rules tab
2. Paste contents of firestore.rules
3. Click "Publish"
```

## Testing Security Rules

### 1. Unit Tests (Recommended)

Create `firebase.test.js`:

```javascript
const firebase = require("@firebase/rules-unit-testing");

describe("Security Rules", () => {
  let db;

  beforeEach(async () => {
    await firebase.initializeTestEnvironment({
      projectId: "couple-calendar",
      firestore: {
        rules: require("./firestore.rules"),
      },
    });
  });

  describe("Users Collection", () => {
    it("user can read own document", async () => {
      const userId = "user123";
      const userDb = firebase.initializeTestApp({
        auth: { uid: userId },
      });
      const userRef = userDb.collection("users").doc(userId);

      // Should succeed
      await expect(userRef.get()).to.succeed();
    });

    it("user cannot read other user's document", async () => {
      const user1 = firebase.initializeTestApp({
        auth: { uid: "user1" },
      });
      const user2Ref = user1.collection("users").doc("user2");

      // Should fail
      await expect(user2Ref.get()).to.fail();
    });
  });

  // Add more tests for other collections...
});
```

### 2. Manual Testing

Test in Firebase Emulator Suite:

```bash
# Start emulator
firebase emulators:start

# Access Emulator UI at http://localhost:4000
# Test read/write operations with different authentication states
```

## Common Operations & Permissions

| Operation | User 1 | User 2 | Other User | Not Auth |
|-----------|--------|--------|------------|----------|
| Read own user doc | ✅ | ❌ | ❌ | ❌ |
| Write own user doc | ✅ | ❌ | ❌ | ❌ |
| Read couple doc (paired) | ✅ | ✅ | ❌ | ❌ |
| Write couple doc (paired) | ✅ | ✅ | ❌ | ❌ |
| Read events (paired) | ✅ | ✅ | ❌ | ❌ |
| Create event (paired) | ✅ | ✅ | ❌ | ❌ |
| Read pairing code | ✅ | ✅ | ✅ | ❌ |
| Read other user's events | ❌ | ❌ | ❌ | ❌ |
| Modify pairing code | ❌ | ❌ | ❌ | ❌ |

## Security Considerations

### 1. Couple ID Generation

Couple IDs are generated deterministically:
```
coupleId = [userId1, userId2].sort().join('_')
```

This ensures the same couple ID regardless of who initiates pairing.

### 2. Real-time Listeners

Firestore security rules apply to real-time listeners. Only authorized users receive updates.

```typescript
// This listener only receives data if user is couple partner
onSnapshot(collection(db, 'events', coupleId, 'items'), (snapshot) => {
  // Real-time updates only if user is authenticated couple member
});
```

### 3. Cloud Functions

Cloud Functions execute with admin privileges and bypass security rules. They must validate:
- User authentication
- Couple membership
- Data validity

Example:
```typescript
// Cloud Function - runs with admin privileges
exports.createEvent = functions.https.onCall(async (data, context) => {
  // Validate authentication
  if (!context.auth) throw new Error('Unauthenticated');

  const userId = context.auth.uid;
  const coupleId = data.coupleId;

  // Validate user is couple partner
  const couple = await admin.firestore()
    .collection('couples')
    .doc(coupleId)
    .get();

  if (couple.data().partner1Id !== userId && 
      couple.data().partner2Id !== userId) {
    throw new Error('Unauthorized');
  }

  // Proceed with operation
  // ...
});
```

## Future Enhancements

### 1. Batch Operations

For bulk updates, consider implementing Cloud Functions:

```typescript
// Cloud Function for batch event creation
exports.batchCreateEvents = functions.https.onCall(async (data, context) => {
  const batch = admin.firestore().batch();
  
  data.events.forEach(event => {
    batch.set(eventRef, event);
  });

  await batch.commit();
});
```

### 2. Custom Claims

Enhance security with Firebase Custom Claims:

```typescript
// Admin sets custom claim
await admin.auth().setCustomUserClaims(uid, {
  coupleId: 'couple123',
  role: 'couple_member'
});

// Security rule validation
match /events/{coupleId}/items/{eventId} {
  allow read: if request.auth.token.coupleId == coupleId;
}
```

### 3. Field-level Encryption

For sensitive data like notes, consider encrypting at application level before storing.

## Troubleshooting

### "Permission denied" errors

**Check:**
1. User is authenticated
2. User is part of the couple
3. Couple document exists and has correct partner IDs
4. Couple ID is correctly formatted

### Real-time listener not updating

**Check:**
1. User still has read permission
2. No security rule changes after initial load
3. Network connectivity
4. Firestore rules not blocking query

### Cloud Functions unable to write

**Note:** Cloud Functions use admin credentials and bypass rules. If writes fail:
1. Check Firestore quota
2. Verify collection/document structure
3. Check Cloud Functions error logs

## Deployment Checklist

- [ ] Security rules reviewed and tested
- [ ] Rules deployed to Firestore
- [ ] Rules tested in production (development mode first)
- [ ] Team notified of security model
- [ ] Incident response plan documented
- [ ] Regular rule audits scheduled

## References

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Functions Best Practices](https://firebase.google.com/docs/functions/tips)
