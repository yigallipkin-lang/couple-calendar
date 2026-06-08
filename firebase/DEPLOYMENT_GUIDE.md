# Firestore Security Rules Deployment Guide

## Quick Start

### Option 1: Deploy via Firebase CLI (Recommended)

```bash
# 1. Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. From the project root, deploy only rules
firebase deploy --only firestore:rules

# 4. Or deploy everything (rules, indexes, functions, etc.)
firebase deploy
```

### Option 2: Deploy via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** → **Rules** tab
4. Click **Edit rules**
5. Replace the content with the rules from `firebase/firestore.rules`
6. Click **Publish**

## Pre-Deployment Steps

### 1. Review Security Rules

```bash
# Read and understand the rules
cat firebase/firestore.rules
```

Review the `firebase/SECURITY_RULES.md` documentation to ensure you understand each rule.

### 2. Test Rules Locally

```bash
# Start Firebase Emulator Suite
firebase emulators:start

# In another terminal, run tests
npm run test:firestore  # if you have tests configured
```

### 3. Verify Collection Structure

Ensure your Firestore database has the following collections created (can be empty):

```
✓ users/
✓ couples/
✓ events/
✓ todoLists/
✓ notifications/
✓ pairing_codes/
```

You can create empty collections in Firebase Console if they don't exist.

## Deployment Steps (Detailed)

### Step 1: Prepare Environment

```bash
# Clone/pull latest code
git pull origin main

# Navigate to project root
cd couple-calendar

# Verify Firebase project is set
cat .firebaserc

# Expected output:
# {
#   "projects": {
#     "default": "your-project-id"
#   }
# }
```

### Step 2: Validate Rules Syntax

```bash
# Firebase CLI validates syntax automatically during deployment
# But you can validate before by checking the file exists
ls -la firebase/firestore.rules

# Should output: -rw-r--r-- 1 ... firestore.rules
```

### Step 3: Deploy Rules

```bash
# Deploy only Firestore rules (fastest)
firebase deploy --only firestore:rules

# Expected output:
# ✔ Firestore Rules have been successfully published.
#
# Project Console: https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore
```

### Step 4: Verify Deployment

```bash
# Check deployment status in console
firebase deploy --info

# Or open Firebase Console:
# https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore/rules
```

## Testing After Deployment

### 1. Manual Testing in Firebase Console

1. Go to Firestore → **Rules** tab
2. Click **Rules Playground** (bottom right)
3. Test various read/write scenarios:

```javascript
// Test 1: Unauthenticated read (should fail)
Authentication: None
Request: get /databases/(default)/documents/users/user123
Expected: Deny

// Test 2: User reads own document (should succeed)
Authentication: uid=user123
Request: get /databases/(default)/documents/users/user123
Expected: Allow

// Test 3: User reads other user document (should fail)
Authentication: uid=user123
Request: get /databases/(default)/documents/users/user456
Expected: Deny
```

### 2. Application Testing

```bash
# Start dev server
cd packages/web
pnpm dev

# Test user actions:
# 1. Sign up new user (creates /users/{uid})
# 2. Generate pairing code (tests /pairing_codes access)
# 3. Create calendar event (tests /events/{coupleId}/items access)
# 4. Check real-time sync works
```

### 3. Automated Testing (Advanced)

```bash
# Install Firebase testing library
npm install -D @firebase/rules-unit-testing

# Run tests
npm run test:firestore

# Expected output:
# PASS src/__tests__/firestore.test.js
#   Security Rules
#     Users Collection
#       ✓ user can read own document
#       ✓ user cannot read other user's document
#     ... more tests
```

## Rollback Procedure

If rules cause issues, you can revert to previous version:

### Via Firebase Console

1. Go to Firestore → **Rules** tab
2. Click **Revisions** (if available)
3. Select previous version
4. Click **Restore**

### Via Firebase CLI

```bash
# View deployment history
firebase deploy --info

# If you have git history, revert the rules file
git checkout HEAD~1 firebase/firestore.rules

# Redeploy
firebase deploy --only firestore:rules
```

### Emergency: Allow All (Temporary)

**Only for emergency debugging:**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // TEMPORARY - REMOVE ASAP
    }
  }
}
```

⚠️ **REMOVE immediately after debugging!** This allows all access to your data.

## Production Checklist

- [ ] Rules reviewed by 2+ team members
- [ ] Rules tested in development environment
- [ ] Collection structure verified
- [ ] Backup of previous rules taken
- [ ] Team notified of deployment time
- [ ] Monitoring/alerts set up
- [ ] Incident response plan documented
- [ ] Rules deployed
- [ ] Post-deployment verification completed
- [ ] Team confirmed all features working

## Monitoring & Maintenance

### Monitor for Errors

```bash
# View Firestore usage and errors
# Firebase Console → Firestore → Usage tab

# Check Cloud Logging
# https://console.cloud.google.com/logs/query

# Query for permission denied errors:
# resource.type="cloud_firestore"
# protoPayload.status.code=403
```

### Regular Audits

Schedule monthly reviews:

1. Review security rules for needed updates
2. Check for any permission denied spikes
3. Verify no hardcoded user IDs in rules
4. Update documentation if rules change

### Update Procedures

When updating rules:

```bash
# 1. Create feature branch
git checkout -b fix/firestore-rules

# 2. Update firestore.rules
vim firebase/firestore.rules

# 3. Test locally
firebase emulators:start

# 4. Commit changes
git add firebase/firestore.rules
git commit -m "Update Firestore rules for feature X"

# 5. Create pull request for review
git push origin fix/firestore-rules

# 6. After approval, merge and deploy
git checkout main
git pull
firebase deploy --only firestore:rules
```

## Troubleshooting

### Issue: "Permission denied" in development

**Solution:**

1. Check Firestore rules allow development mode:
   ```
   // During development only - REMOVE for production
   match /{document=**} {
     allow read, write: if true;
   }
   ```

2. Or ensure user is properly authenticated

### Issue: Real-time listeners not updating

**Check:**

1. User is authenticated: `console.log(auth.currentUser)`
2. User is couple partner: `db.collection('couples').doc(coupleId).get()`
3. No security rule blocking query
4. Database rule has `allow read`

### Issue: Cloud Functions cannot write

**Check:**

1. Cloud Functions have admin credentials (not blocked by rules)
2. Firestore quota not exceeded
3. Document path is correct
4. Check Cloud Functions logs: `firebase functions:log`

### Issue: Rules syntax error during deployment

**Fix:**

```bash
# Validate syntax
firebase deploy --only firestore:rules --dry-run

# Check for common errors:
# - Missing semicolon
# - Unclosed braces
# - Invalid function names
# - Typos in collection names
```

## Environment-Specific Rules

### Development (Firestore Emulator)

```
# In firestore.rules for local testing
match /{document=**} {
  allow read, write: if true;  // Allow all for testing
}
```

### Staging

```
# Balance security with testing
match /users/{userId} {
  allow read, write: if request.auth != null;  // Allow all authenticated
}
```

### Production

```
# Strict security rules (see SECURITY_RULES.md)
match /users/{userId} {
  allow read: if request.auth.uid == userId;  // Only own documents
}
```

## Deployment Best Practices

1. **Always test first** - Use emulator or staging environment
2. **Deploy during low traffic** - Minimize impact of any issues
3. **Have a rollback plan** - Know how to revert quickly
4. **Monitor after deployment** - Watch for permission denied errors
5. **Document changes** - Keep SECURITY_RULES.md updated
6. **Review regularly** - Monthly audits of security rules
7. **Version control** - Keep rules in git for history
8. **Notify team** - Let team know about rule changes

## Additional Resources

- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase CLI Documentation](https://firebase.google.com/docs/cli)
- [Cloud Firestore Data Model](https://firebase.google.com/docs/firestore/data-model)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)

## Support

If you encounter issues:

1. Check [Firebase Status Dashboard](https://status.firebase.google.com)
2. Review [Firestore Error Messages](https://firebase.google.com/docs/firestore/troubleshoot)
3. Check [Firebase GitHub Issues](https://github.com/firebase/firebase-js-sdk/issues)
4. Contact Firebase Support (requires paid plan)

---

**Last Updated:** June 8, 2026
**Maintained By:** Development Team
