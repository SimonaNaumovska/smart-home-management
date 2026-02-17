# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" or sign in
3. Create a new project:
   - **Project name:** `smart-home-management`
   - **Password:** Create strong password (save it!)
   - **Region:** Choose closest to you
4. Wait for project to initialize (2-3 minutes)

## 2. Get Connection Credentials

Once project is ready:

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (looks like: `eyJhbGc...`)
3. Save these in `.env.local`:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_KEY=eyJhbGc...
```

## 3. Create Database Tables

Go to **SQL Editor** and run these queries:

### Create households table

```sql
CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Create products table

```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES households(id),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT,
  min_stock NUMERIC,
  purchased TEXT,
  use_by TEXT,
  storage TEXT,
  to_buy BOOLEAN DEFAULT FALSE,
  frequently_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_household ON products(household_id);
```

### Create users table

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES households(id),
  name TEXT NOT NULL,
  avatar TEXT,
  color TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_household ON users(household_id);
```

### Create chores table

```sql
CREATE TABLE chores (
  id TEXT PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES households(id),
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT,
  active BOOLEAN DEFAULT TRUE,
  assigned_to TEXT,
  duedate TEXT,
  chore_category TEXT,
  consumed_products JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chores_household ON chores(household_id);
```

### Create consumption_logs table

```sql
CREATE TABLE consumption_logs (
  id TEXT PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES households(id),
  user_id TEXT NOT NULL,
  user_name TEXT,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  unit TEXT,
  type TEXT,
  chore_id TEXT,
  chore_name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_consumption_logs_household ON consumption_logs(household_id);
```

### Create rooms table

```sql
CREATE TABLE rooms (
  id TEXT PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES households(id),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rooms_household ON rooms(household_id);
```

### Create chore_categories table

```sql
CREATE TABLE chore_categories (
  id TEXT PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES households(id),
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chore_categories_household ON chore_categories(household_id);
```

## 4. Update .env.local

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_KEY=eyJhbGc...
VITE_GROQ_API_KEY=gsk_...
```

## 5. Testing

The app will:

- ✅ Load data from Supabase on mount
- ✅ Save all products, users, chores to PostgreSQL
- ✅ Sync real-time updates via Supabase subscriptions
- ✅ All data persists across sessions

---
