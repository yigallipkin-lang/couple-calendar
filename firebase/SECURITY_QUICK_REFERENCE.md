# Firestore Security Rules - Quick Reference

## Security Model Summary

🔒 **Principle:** Couples-only access with strict authentication

**Key Concepts:**
- All operations require authentication
- Users can only access data for their couple
- Couple membership verified on every operation
- Cloud Functions manage sensitive operations

## Collection Access Matrix

|Collection|Create|Read|Update|Delete|Who|
|-----------|------|----|----|------|---|
|`/users/{userId}`|Self|Self|Self|❌|User only|
|`/couples/{coupleId}`|CloudFn|Both|Both|❌|Couple members|
|`/events/{coupleId}/items/*`|Both|Both|Both|Both|Couple members|
|`/todoLists/{coupleId}/items/*`|Both|Both|Both|Both|Couple members|
|`/notifications/{coupleId}/*`|CloudFn|Own|❌|❌|Recipient only|
|`/pairing_codes/{code}`|CloudFn|Auth|❌|❌|Cloud Functions|

**Legend:**
- ✅ Allowed
- ❌ Blocked
- `Self` = Only own document
- `Both` = Both couple members
- `Own` = Only recipient
- `CloudFn` = Cloud Functions only
- `Auth` = Any authenticated user

## Code Examples

### 1. Read User's Own Document

```typescript
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const db = getFirestore();
const userRef = doc(db, 'users', auth.currentUser.uid);
const userDoc = await getDoc(userRef);
// ✅ Allowed - reading own document
```

### 2. Read Couple's Events

```typescript
import { getFirestore, collection, query, onSnapshot } from 'firebase/firestore';

const db = getFirestore();
const eventsRef = collection(db, 'events', coupleId, 'items');
const q = query(eventsRef);

onSnapshot(q, (snapshot) => {
  snapshot.forEach((doc) => {
    console.log(doc.data());
  });
});
// ✅ Allowed - both partners can read couple events
```

### 3. Create New Event

```typescript
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const db = getFirestore();
const eventsRef = collection(db, 'events', coupleId, 'items');

await addDoc(eventsRef, {
  title: 'Anniversary Dinner',
  startTime: new Date('2026-06-15'),
  createdBy: auth.currentUser.uid,
  createdAt: serverTimestamp(),
  // ... other fields
});
// ✅ Allowed - couple members can create events
```

### 4. Attempt Invalid Access (Will Fail)

```typescript
// ❌ NOT ALLOWED - reading other user's document
const otherUserRef = doc(db, 'users', 'other-user-id');
const otherUserDoc = await getDoc(otherUserRef); // Permission Denied

// ❌ NOT ALLOWED - accessing non-existent couple
const wrongCoupleRef = collection(db, 'events', 'different-couple', 'items');
const q = query(wrongCoupleRef);
onSnapshot(q, ...); // Permission Denied

// ❌ NOT ALLOWED - modifying pairing codes
const codeRef = doc(db, 'pairing_codes', 'ABC-123-DEF');
await updateDoc(codeRef, { used: true }); // Permission Denied
```

## Authentication States

### ✅ Authenticated as Couple Member
- Can read/write own user document
- Can read/write couple document
- Can read/write events and todos
- Can read own notifications
- Can read pairing codes

### ❌ Authenticated but Not Couple Member
- Can read own user document
- **Cannot** read couple data
- **Cannot** read couple's events
- Can read pairing codes (for validation)

### ❌ Not Authenticated
- **Cannot** access any data
- Redirected to login

## Common Tasks & Permissions

### Task: User Signs Up
```
Firestore Path: /users/{newUserId}
Required Auth: None (special case handled in Cloud Function)
Result: ✅ User document created by Cloud Function
```

### Task: Generate Pairing Code
```
Firestore Path: /pairing_codes/{code}
Required Auth: Authenticated user
Result: ✅ Code created by Cloud Function
```

### Task: Accept Pairing Code
```
Firestore Paths: 
  - /pairing_codes/{code} (read)
  - /users/{userId} (update partnerId)
  - /couples/{coupleId} (create)
Required Auth: Both users authenticated
Result: ✅ Couple linked, code marked used
```

### Task: View Calendar
```
Firestore Path: /events/{coupleId}/items/{*}
Required Auth: Member of couple
Result: ✅ Real-time updates of couple events
```

### Task: Create Event
```
Firestore Path: /events/{coupleId}/items/{newEventId}
Required Auth: Member of couple
Result: ✅ Event created, visible to partner
```

## Security Rules Helper Functions

### isAuth()
```javascript
function isAuth() {
  return request.auth != null;
}
```
Checks if user is authenticated.

### uid()
```javascript
function uid() {
  return request.auth.uid;
}
```
Returns authenticated user's ID.

### isCouplePartner(coupleId)
```javascript
function isCouplePartner(coupleId) {
  let couple = get(/databases/$(database)/documents/couples/$(coupleId)).data;
  return couple.partner1Id == uid() || couple.partner2Id == uid();
}
```
Verifies user is member of couple.

## Error Messages

### "Permission denied"
**Causes:**
- Not authenticated (no auth token)
- Not couple member (accessing other's data)
- Operation type not allowed (e.g., deleting user)
- Cloud Function error (security checks failed)

**Solution:**
1. Verify user is authenticated: `auth.currentUser`
2. Verify couple membership: Check user's `partnerId`
3. Verify couple document exists
4. Check browser console for details

## Development Tips

### Testing with Emulator

```bash
# Start emulator with rules
firebase emulators:start

# Connect your app
const db = getFirestore();
connectFirestoreEmulator(db, 'localhost', 8080);

# Now test with permissive rules
// match /{document=**} { allow read, write: if true; }
```

### Debugging Denials

```typescript
// Add this to Cloud Function logs
console.log('User UID:', context.auth?.uid);
console.log('Couple ID:', coupleId);
console.log('Is partner:', 
  couple.partner1Id === uid || 
  couple.partner2Id === uid
);
```

### Monitoring

```javascript
// Listen to real-time errors
onSnapshot(query, (snapshot) => {
  // Success
}, (error) => {
  console.error('Query failed:', error.code, error.message);
  // 'permission-denied' = security rule blocked access
});
```

## Rule Deployment

### Quick Deploy
```bash
firebase deploy --only firestore:rules
```

### Validate Before Deploy
```bash
firebase deploy --only firestore:rules --dry-run
```

### Rollback
```bash
# View recent versions in Console: Firestore → Rules → Revisions
# Or restore from git
git checkout HEAD~1 firebase/firestore.rules
firebase deploy --only firestore:rules
```

## Security Checklist

Before launch:

- [ ] Rules block all unauthenticated access
- [ ] Users can only read own documents
- [ ] Couple membership verified on all operations
- [ ] Cloud Functions have validation logic
- [ ] Notifications are recipient-specific
- [ ] Pairing codes are immutable
- [ ] Deletion operations blocked where needed
- [ ] Real-time listeners respect rules
- [ ] Error handling covers permission denied
- [ ] Team trained on security model

## Common Pitfalls

❌ **DON'T:** Allow read access without verifying couple membership
```javascript
// BAD
match /events/{coupleId}/items/{eventId} {
  allow read: if isAuth(); // Anyone authenticated can read!
}
```

✅ **DO:** Verify couple membership
```javascript
// GOOD
match /events/{coupleId}/items/{eventId} {
  allow read: if isAuth() && isCouplePartner(coupleId);
}
```

---

❌ **DON'T:** Let users manage pairing codes
```javascript
// BAD
match /pairing_codes/{code} {
  allow write: if isAuth();
}
```

✅ **DO:** Only allow Cloud Functions
```javascript
// GOOD
match /pairing_codes/{code} {
  allow write: if false; // Cloud Functions only
}
```

---

❌ **DON'T:** Hardcode user IDs in rules
```javascript
// BAD
match /events/{coupleId}/items/{eventId} {
  allow read: if uid() == 'specific-user-id';
}
```

✅ **DO:** Use dynamic verification
```javascript
// GOOD
match /events/{coupleId}/items/{eventId} {
  allow read: if isCouplePartner(coupleId);
}
```

## Links & Resources

- 📖 [Full Documentation](./SECURITY_RULES.md)
- 🚀 [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- 🔥 [Firebase Docs](https://firebase.google.com/docs/firestore/security)
- 🧪 [Testing Guide](https://firebase.google.com/docs/firestore/security/test-rules-emulator)

---

**Version:** 1.0
**Last Updated:** June 8, 2026
**Status:** Active
