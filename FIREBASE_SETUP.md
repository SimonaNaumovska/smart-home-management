# 🔥 Firebase Backend Setup Guide

This guide will help you set up Firebase for your Smart Household OS with **ALL** features:

- ✅ User Authentication (Household accounts)
- ✅ Real-time Multi-device Sync
- ✅ Cloud Backup & Restore
- ✅ Offline Support
- ✅ Secure Data Storage

---

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `smart-household-os`
4. Disable Google Analytics (optional)
5. Click "Create project"

---

## Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** → **Get started**
2. Click **Sign-in method** tab
3. Enable **Email/Password** provider
4. Click **Save**

---

## Step 3: Create Firestore Database

1. In Firebase Console, go to **Firestore Database** → **Create database**
2. Choose **Production mode** (we'll set up rules below)
3. Select your preferred location (closest to your users)
4. Click **Enable**

---

## Step 4: Set Up Security Rules

Go to **Firestore Database** → **Rules** and paste this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Household data - only authenticated household owner can access
    match /households/{householdId} {
      allow read, write: if request.auth != null && request.auth.uid == householdId;

      // Sub-collections (products, users, chores, logs)
      match /{subcollection}/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == householdId;
      }
    }
  }
}
```

Click **Publish**

---

## Step 5: Get Firebase Configuration

1. In Firebase Console, click the **⚙️ Settings** icon → **Project settings**
2. Scroll down to **Your apps** → Click **Web** icon `</>`
3. Register app nickname: `smart-household-web`
4. Click **Register app**
5. Copy the `firebaseConfig` object

---

## Step 6: Update Your Project

Open `src/firebase/config.ts` and replace with your Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

---

## Step 7: Test Firebase Installation

Run this command to test:

```bash
npm run dev
```

You should see the authentication screen!

---

## 📚 What You Get

### ✨ Features Enabled:

1. **🔐 Authentication**
   - Household registration
   - Secure login/logout
   - Password reset (can be added)

2. **🔄 Real-time Sync**
   - All devices update instantly
   - Changes sync across phones, tablets, computers
   - Multiple family members can use simultaneously

3. **💾 Cloud Backup**
   - Auto-save every change
   - Export/import JSON backups
   - Never lose data

4. **📵 Offline Support**
   - Works without internet
   - Syncs when reconnected
   - Offline indicator shows status

5. **🛡️ Security**
   - Each household isolated
   - Firebase security rules protect data
   - Only authenticated users access their household

---

## 🎯 How to Use

### First Time Setup:

1. Open app → See auth screen
2. Click "Sign up"
3. Enter household name, email, password
4. Start using the app!

### Adding Family Members:

- All family members use **same household email/password**
- Each person selects their profile in "Members" tab
- System tracks who does what

### Multiple Devices:

- Sign in with household credentials on each device
- All devices sync automatically
- Changes appear instantly everywhere

---

## 🔧 Optional Enhancements

### Add Password Reset:

Install in `src/firebase/auth.ts`:

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

### Add Invites:

Create invite codes for family members to join household

### Add Roles:

Implement admin/member permissions

---

## 🆘 Troubleshooting

### "Permission denied" error:

- Check Firestore security rules are set correctly
- Ensure user is authenticated before accessing data

### "No Firebase config" error:

- Make sure you updated `src/firebase/config.ts` with your credentials

### "Auth domain not authorized":

- Go to Firebase Console → Authentication → Settings
- Add your domain to Authorized domains

---

## 💰 Cost

**Firebase Free Tier (Spark Plan):**

- ✅ 10,000 reads/day
- ✅ 20,000 writes/day
- ✅ 1GB storage
- ✅ 10GB/month transfer

**Perfect for household use!** Unless you have 100+ family members 😄

---

## 🚀 Next Steps

1. Set up Firebase project (5 minutes)
2. Copy config to `config.ts`
3. Run `npm run dev`
4. Create household account
5. Enjoy multi-device sync!

---

## 📞 Support

If you need help:

1. Check [Firebase Documentation](https://firebase.google.com/docs)
2. Firebase Console has built-in tutorials
3. Test with Firebase Emulator for local development

---

**Your Smart Household OS now has enterprise-grade backend! 🎉**
