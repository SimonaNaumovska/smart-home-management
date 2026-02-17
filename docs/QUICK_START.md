# ⚡ Quick Start - Setup Supabase in 5 Minutes

## Step 1: Create Supabase Project (2 minutes)

1. Go to https://supabase.com
2. Click **"Start your project"** (top right)
3. Sign up / Sign in
4. Click **"New Project"**
   - **Name:** `smart-home-management`
   - **Password:** Create strong password (save it!)
   - **Region:** Pick closest to you
5. Wait 2-3 minutes for setup to complete

## Step 2: Get Your Credentials (30 seconds)

1. Once ready, go to **Settings** (left sidebar, bottom)
2. Click **API** section
3. Copy these two values:
   ```
   Project URL:  https://xxxxx.supabase.co
   anon public:  eyJhbGc...
   ```

## Step 3: Create Database Tables (1 minute)

1. Go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open the file `supabase-schema-regenerated.sql` in this folder
4. Copy ALL the SQL code
5. Paste into Supabase SQL Editor
6. Click **Run** button (top right)
7. Wait for success message ✅

## Step 4: Update .env.local (1 minute)

Open `.env.local` and add:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_KEY=eyJhbGc...
VITE_GROQ_API_KEY=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
```

## Step 5: Test It! (1 minute)

```bash
npm run build
npm run dev
```

✅ **Done!** Your app now uses PostgreSQL via Supabase!

---

## What Just Happened?

You now have a fully functional smart home management system powered by:

- **PostgreSQL** database with Supabase
- **Real-time sync** across devices
- **Full SQL** query capabilities
- **Free tier** for most household uses (~0-5/month)
- **Standard PostgreSQL** (portable, no vendor lock-in)

## Verify It Works

1. Open http://localhost:5173 in browser
2. Add a product "I bought 10 eggs"
3. Go to Supabase → Table Editor
4. Click **products** table
5. You should see the product! ✨

## Troubleshooting

**"Missing Supabase credentials"**

- Check `.env.local` has both variables
- Restart dev server: `npm run dev`

**"Error fetching products"**

- Verify SQL schema ran (Supabase → Table Editor)
- Check household_id matches

**"Table doesn't exist"**

- Run SQL schema again from `supabase-schema-regenerated.sql`

---

## Need Help?

1. Check [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)
2. Check browser console for errors
3. Verify `.env.local` is correct

**That's it! You're using PostgreSQL now! 🎉**
