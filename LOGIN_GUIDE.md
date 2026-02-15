# 🔐 Login System - Complete Guide

## Overview

The Smart Household OS includes a complete authentication system with:

- ✅ Email/Password registration and sign-in
- ✅ Google OAuth sign-in
- ✅ Firebase Authentication integration
- ✅ Automatic localStorage fallback
- ✅ Household creation and management
- ✅ Session persistence

---

## How It Works

### 1. **Authentication Flow**

```
User visits app → Check Firebase config
                    ↓
          Is Firebase configured?
                    ↓
         YES ←──────┴──────→ NO
          ↓                   ↓
    Show Auth Screen    Use localStorage
          ↓                   ↓
    User signs in/up    No authentication
          ↓                   ↓
    Create household    Direct app access
          ↓
    Access app with
    Firebase sync
```

### 2. **Firebase Configuration Check**

The app automatically detects if Firebase is configured:

```typescript
// AppWithFirebase.tsx checks:
if (!auth || !auth.config.apiKey || auth.config.apiKey === "YOUR_API_KEY") {
  // Falls back to localStorage mode
  setUseFirebase(false);
}
```

---

## Setup Instructions

### Option 1: Use Without Authentication (localStorage)

**No setup required!** The app works immediately with localStorage:

- Data saved locally in browser
- No login required
- Single device only

### Option 2: Enable Firebase Authentication

#### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `smart-household-os`
4. Enable Google Analytics (optional)
5. Create project

#### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Enable **Email/Password** provider
4. (Optional) Enable **Google** provider for Google sign-in

#### Step 3: Configure Firestore Database

1. Go to **Firestore Database**
2. Click **Create Database**
3. Choose **Start in production mode**
4. Select location closest to you
5. Click **Enable**

#### Step 4: Add Firebase Config

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click the web icon `</>`
4. Register your app with a nickname
5. Copy the configuration object

#### Step 5: Update config.ts

Replace the placeholder values in `src/firebase/config.ts`:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyC...", // Your API Key
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456",
};
```

#### Step 6: Configure Firestore Security Rules

In Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Household documents - authenticated users can read/write their own
    match /households/{householdId} {
      allow read, write: if request.auth != null && request.auth.uid == householdId;

      // Products collection within household
      match /products/{productId} {
        allow read, write: if request.auth != null && request.auth.uid == householdId;
      }

      // Users collection within household
      match /users/{userId} {
        allow read, write: if request.auth != null && request.auth.uid == householdId;
      }

      // Chores collection within household
      match /chores/{choreId} {
        allow read, write: if request.auth != null && request.auth.uid == householdId;
      }

      // Consumption logs within household
      match /consumptionLogs/{logId} {
        allow read, write: if request.auth != null && request.auth.uid == householdId;
      }
    }
  }
}
```

#### Step 7: Restart Development Server

```bash
npm run dev
```

---

## Features

### Email/Password Authentication

**Sign Up:**

1. Click "Don't have an account? Sign up"
2. Enter household name (e.g., "Smith Family")
3. Enter email address
4. Enter password (min 6 characters)
5. Click "🎉 Create Household"

**Sign In:**

1. Enter email address
2. Enter password
3. Click "🔐 Sign In"

### Google Sign-In

1. Click "Sign in with Google" button
2. Select your Google account
3. Grant permissions
4. Household automatically created with your Google name

### Sign Out

Click the **🚪 Sign Out** button in the top-right corner.

---

## Features When Authenticated

### Multi-Device Sync

- ✅ All data syncs in real-time across devices
- ✅ Changes appear instantly on other devices
- ✅ Works on desktop, tablet, and mobile

### Cloud Backup

- ✅ All data automatically backed up to Firebase
- ✅ Never lose your household data
- ✅ Restore data on any device

### Offline Support

- ✅ App works without internet
- ✅ Changes sync when back online
- ✅ Offline indicator shows connection status

### Household Management

- ✅ Each household has unique data
- ✅ Secure - only you can access your data
- ✅ Share access by signing in on multiple devices

---

## File Structure

```
src/
├── firebase/
│   ├── config.ts          # Firebase configuration
│   ├── auth.ts            # Authentication functions
│   └── database.ts        # Database sync functions
├── components/
│   ├── AuthScreen.tsx     # Login/signup UI
│   └── OfflineIndicator.tsx  # Connection status
├── AppWithFirebase.tsx    # Main auth wrapper
└── App.tsx                # Main application
```

---

## Authentication Functions

### Available Functions (auth.ts)

```typescript
// Register new household
registerHousehold(email, password, householdName);

// Sign in to existing household
signInHousehold(email, password);

// Sign in with Google
signInWithGoogle();

// Sign out
signOutHousehold();

// Listen to auth state changes
onAuthChange(callback);

// Get household data
getHouseholdData(userId);
```

---

## Troubleshooting

### "Firebase not configured" Message

**Solution:** Update `src/firebase/config.ts` with your Firebase credentials.

### "Sign in failed" Error

**Possible causes:**

1. Wrong email/password
2. Account doesn't exist - try signing up first
3. Firebase not properly configured

### Google Sign-In Not Working

**Solutions:**

1. Make sure Google provider is enabled in Firebase Console
2. Check that your domain is authorized in Firebase settings
3. Try clearing browser cache

### Data Not Syncing

**Check:**

1. Internet connection (offline indicator shows status)
2. Firestore security rules are properly configured
3. User is signed in (green banner at top)

### "Permission denied" Error

**Solution:** Update Firestore security rules in Firebase Console (see Step 6 above).

---

## Security Best Practices

### Password Requirements

- Minimum 6 characters (enforced by Firebase)
- Recommend 8+ characters with mix of letters and numbers

### Email Verification (Optional Enhancement)

To add email verification, update auth.ts:

```typescript
import { sendEmailVerification } from "firebase/auth";

// After registration:
await sendEmailVerification(user);
```

### Password Reset (Optional Enhancement)

To add password reset, update auth.ts:

```typescript
import { sendPasswordResetEmail } from "firebase/auth";

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
```

---

## Current Status

✅ **Fully Implemented:**

- Email/password authentication
- Google OAuth sign-in
- Household creation
- Session persistence
- Auto-detection of Firebase config
- localStorage fallback
- Sign out functionality
- Multi-device sync

🔄 **Optional Enhancements:**

- Email verification
- Password reset
- Two-factor authentication
- Social providers (Facebook, Twitter)
- Profile picture upload

---

## Testing the Login System

### Test Without Firebase (localStorage mode):

1. Leave Firebase config as default
2. Run `npm run dev`
3. App shows "Running in Local Mode" banner
4. No login required - immediate access

### Test With Firebase (full auth):

1. Configure Firebase (Steps 1-6 above)
2. Run `npm run dev`
3. Login screen appears
4. Try signing up with email/password
5. Try Google sign-in
6. Open app on second device/browser
7. Sign in with same account
8. Verify data syncs between devices

---

## Support

For issues or questions:

1. Check Firestore rules are correct
2. Verify Firebase config is accurate
3. Check browser console for errors
4. Ensure Authentication is enabled in Firebase Console

---

## Next Steps

1. **Setup Firebase** following the steps above
2. **Test authentication** with email and Google
3. **Configure security rules** for your needs
4. **Enable email verification** (optional)
5. **Add password reset** (optional)
6. **Customize** the AuthScreen styling

Your login system is production-ready! 🚀
