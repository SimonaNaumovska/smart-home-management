# 🔐 Login System - Complete Guide

## Overview

The Smart Household OS includes a complete authentication system with:

- ✅ Email/Password registration and sign-in
- ✅ Supabase Authentication integration
- ✅ Household creation and management
- ✅ Session persistence
- ✅ Multi-device sync

---

## How It Works

### 1. **Authentication Flow**

```
User visits app → Check Supabase config
                    ↓
          Is Supabase configured?
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
    Supabase sync
```

### 2. **Supabase Configuration Check**

The app automatically detects if Supabase is configured by checking environment variables:

```typescript
// Checks for Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
```

---

## Setup Instructions

### Option 1: Use Without Authentication (localStorage)

**No setup required!** The app works immediately with localStorage:

- Data saved locally in browser
- No login required
- Single device only

### Option 2: Enable Supabase Authentication

#### Step 1: Create Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Click "Start your project"
3. Sign up or sign in
4. Click "New Project"
5. Enter project name: `smart-home-management`
6. Create strong database password
7. Select region closest to you
8. Wait 2-3 minutes for setup

#### Step 2: Enable Email Authentication

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider (should be enabled by default)
3. Configure email templates (optional)

#### Step 3: Set Up Database Tables

1. Go to **SQL Editor** in Supabase Dashboard
2. Copy the SQL schema from `supabase-schema-regenerated.sql`
3. Run the SQL to create tables
4. Tables created: households, products, users, chores, consumption_logs, rooms, chore_categories

#### Step 4: Get Supabase Credentials

1. Go to **Settings** → **API** in Supabase Dashboard
2. Copy **Project URL** (looks like: `https://xxxxx.supabase.co`)
3. Copy **anon public** key (starts with `eyJhbGc...`)

#### Step 5: Update .env.local

Create or update `.env.local` in your project root:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_KEY=eyJhbGc...
VITE_GROQ_API_KEY=your_groq_key_here
```

#### Step 6: Restart Development Server

```bash
npm run dev
```

#### Step 7: Configure Row Level Security (Optional)

## Features

### Email/Password Authentication

**Sign Up:**

1. Click "Don't have an account? Sign up"
2. Enter household name (e.g., "Smith Family")
3. Enter email address
4. Enter password (min 6 characters)
5. Click "🎉 Create Household"
6. Check email for confirmation link (if email confirmation enabled)

**Sign In:**

1. Enter email address
2. Enter password
3. Click "🔐 Sign In"

### Sign Out

Click the **🚪 Sign Out** button in the top-right corner.

---

## Features When Authenticated

### Multi-Device Sync

- ✅ All data syncs in real-time across devices
- ✅ Changes appear instantly on other devices
- ✅ Works on desktop, tablet, and mobile

### Cloud Backup

- ✅ All data automatically backed up to Supabase
- ✅ Never lose your household data
- ✅ Restore data on any device
- ✅ Real-time PostgreSQL database

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
├── supabase/
│   ├── config.ts          # Supabase configuration
│   └── database.ts        # Database functions
├── shared/
│   └── components/
│       ├── Login.tsx      # Login/signup UI
│       ├── LandingPage.tsx # Landing page with auth
│       └── OfflineIndicator.tsx  # Connection status
└── app/
    └── App.tsx            # Main application
```

---

## Authentication Functions

### Available Functions (from Login.tsx)

```typescript
// Register new user
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { household_name: householdName },
  },
});

// Sign in existing user
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// Sign out
const { error } = await supabase.auth.signOut();

// Get current user
const {
  data: { user },
} = await supabase.auth.getUser();

// Listen to auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  // Handle auth changes
});
```

---

## Troubleshooting

### "Supabase not configured" Message

**Solution:** Update `.env.local` with your Supabase URL and anon key.

### "Sign in failed" Error

**Possible causes:**

1. Wrong email/password
2. Account doesn't exist - try signing up first
3. Supabase credentials not properly configured in `.env.local`
4. Email confirmation required (check Supabase Auth settings)

### Data Not Syncing

**Check:**

1. Internet connection (offline indicator shows status)
2. Supabase RLS policies are properly configured
3. User is signed in
4. Check browser console for errors

### "Permission denied" Error

**Solution:** Set up Row Level Security policies in Supabase Dashboard (see Step 7 above).

---

## Security Best Practices

### Password Requirements

- Minimum 6 characters (enforced by Supabase)
- Recommend 8+ characters with mix of letters, numbers, and symbols

### Email Verification (Optional Enhancement)

Enable email confirmation in Supabase Dashboard:

1. Go to **Authentication** → **Settings**
2. Enable "Confirm email"
3. Customize email templates

### Password Reset (Optional Enhancement)

Supabase provides built-in password reset:

```typescript
// Send password reset email
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: "http://localhost:5173/reset-password",
});

// Update password after reset
const { error } = await supabase.auth.updateUser({
  password: newPassword,
});
```

---

## Current Status

✅ **Fully Implemented:**

- Email/password authentication
- Supabase Auth integration
- Household creation
- Session persistence
- Real-time database sync
- Sign out functionality
- Multi-device sync

🔄 **Optional Enhancements:**

- Email verification
- Password reset flow
- OAuth providers (Google, GitHub, etc.)
- Two-factor authentication
- Profile picture upload

---

## Testing the Login System

### Test Without Supabase (localStorage mode):

1. Don't configure Supabase credentials
2. Run `npm run dev`
3. App runs in local mode
4. No login required - immediate access

### Test With Supabase (full auth):

1. Configure Supabase (Steps 1-7 above)
2. Run `npm run dev`
3. Login screen appears
4. Try signing up with email/password
5. Check email for confirmation (if enabled)
6. Sign in with your account
7. Open app on second device/browser
8. Sign in with same account
9. Verify data syncs between devices

---

## Support

For issues or questions:

1. Check Supabase RLS policies are correct
2. Verify `.env.local` has correct credentials
3. Check browser console for errors
4. Ensure Authentication is enabled in Supabase Dashboard
5. Check [Supabase Docs](https://supabase.com/docs/guides/auth)

---

## Next Steps

1. **Setup Supabase** following the steps above
2. **Test authentication** with email/password
3. **Configure RLS policies** for security
4. **Enable email verification** (optional)
5. **Add password reset** (optional)
6. **Add OAuth providers** (optional)
7. **Customize** the Login component styling

Your login system is production-ready! 🚀
