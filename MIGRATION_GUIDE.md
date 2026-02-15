# Firebase → Supabase Migration Guide

## What's Done ✅

1. **Installed** `@supabase/supabase-js` package
2. **Created** `src/supabase/config.ts` - Supabase client setup
3. **Created** `src/supabase/database.ts` - Complete database service layer with:
   - ✅ Products (CRUD + sync)
   - ✅ Users (CRUD + sync)
   - ✅ Chores (CRUD + sync)
   - ✅ Consumption Logs (CRUD + sync)
   - ✅ Rooms (CRUD + sync)
   - ✅ Chore Categories (CRUD + sync)
   - ✅ Data export/import
4. **Created** `SUPABASE_SETUP.md` - Complete SQL schema

## What's Left to Do

### Step 1: Create Supabase Project

- Go to https://supabase.com
- Create new project
- Run SQL from `SUPABASE_SETUP.md` to create tables
- Copy credentials

### Step 2: Update App.tsx

Replace at the top:

```typescript
// OLD:
import {
  syncProducts,
  syncUsers,
  syncChores,
  syncConsumptionLogs,
  addProduct as addProductDB,
  // ... etc
} from "./firebase/database";

// NEW:
import {
  syncProducts,
  syncUsers,
  syncChores,
  syncConsumptionLogs,
  addProduct as addProductDB,
  // ... etc (same names!)
} from "./supabase/database";
```

Remove `useFirebase` parameter from App:

```typescript
// OLD:
function App({ householdId, useFirebase = false }: AppProps = {});

// NEW:
function App({ householdId = "default-household" }: AppProps = {});
```

Remove all `if (useFirebase && householdId)` conditions - now always use Supabase.

### Step 3: Update .env.local

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_KEY=eyJhbGc...
VITE_GROQ_API_KEY=gsk_...
```

### Step 4: Test

```bash
npm run build
npm run dev
```

## Key Changes

### Before (Firebase)

```typescript
if (useFirebase && householdId) {
  addProductDB(householdId, newProduct);
}
```

### After (Supabase)

```typescript
// Always synced to Supabase
addProductDB(householdId, newProduct);
```

## Data Mapping

| Firebase            | Supabase                            |
| ------------------- | ----------------------------------- |
| Nested collections  | PostgreSQL tables with foreign keys |
| Real-time listeners | Subscriptions via Postgres Changes  |
| `onSnapshot()`      | `subscription()`                    |
| serverTimestamp()   | CURRENT_TIMESTAMP                   |
| Auto-sync           | Real-time + manual subscriptions    |

## Benefits

- ✅ True PostgreSQL database (better queries)
- ✅ Cheaper at scale
- ✅ Better data integrity (foreign keys)
- ✅ Standard SQL (easy to query, migrate)
- ✅ Real-time built-in
- ✅ Can host own server later

## If Issues

Check browser console for:

- "Missing Supabase credentials" → Add to .env.local
- "Error fetching products" → Check table names, permissions
- Network errors → Check Supabase URL/key
