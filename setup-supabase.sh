#!/bin/bash
# Supabase Schema Setup Script
# This script helps you set up the database schema in Supabase

echo "🚀 Smart Home Supabase Schema Setup"
echo "===================================="
echo ""
echo "Prerequisites:"
echo "1. Create a Supabase project at https://supabase.com"
echo "2. Have your Supabase URL and API key ready"
echo ""
echo "Steps:"
echo "1. Go to your Supabase project dashboard"
echo "2. Click 'SQL Editor' on the left sidebar"
echo "3. Click 'New Query'"
echo "4. Copy and paste the entire SQL schema below"
echo "5. Click 'Run'"
echo ""
echo "===================================="
echo "SQL SCHEMA - Copy everything below:"
echo "===================================="
echo ""

cat << 'EOF'
-- Create households table
CREATE TABLE IF NOT EXISTS households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_products_household ON products(household_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT,
  color TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_household ON users(household_id);

-- Create chores table
CREATE TABLE IF NOT EXISTS chores (
  id TEXT PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_chores_household ON chores(household_id);
CREATE INDEX IF NOT EXISTS idx_chores_active ON chores(active);

-- Create consumption_logs table
CREATE TABLE IF NOT EXISTS consumption_logs (
  id TEXT PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_consumption_logs_household ON consumption_logs(household_id);
CREATE INDEX IF NOT EXISTS idx_consumption_logs_created ON consumption_logs(created_at);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rooms_household ON rooms(household_id);

-- Create chore_categories table
CREATE TABLE IF NOT EXISTS chore_categories (
  id TEXT PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chore_categories_household ON chore_categories(household_id);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chores ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumption_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chore_categories ENABLE ROW LEVEL SECURITY;

-- Create default household
INSERT INTO households (name) VALUES ('Default Household')
ON CONFLICT DO NOTHING;

EOF

echo ""
echo "===================================="
echo ""
echo "After running the SQL:"
echo "1. Get your credentials:"
echo "   - Settings → API → Project URL"
echo "   - Settings → API → anon public key"
echo ""
echo "2. Update .env.local with:"
echo "   VITE_SUPABASE_URL=https://xxxxx.supabase.co"
echo "   VITE_SUPABASE_KEY=eyJhbGc..."
echo ""
echo "3. Run: npm run build && npm run dev"
echo ""
