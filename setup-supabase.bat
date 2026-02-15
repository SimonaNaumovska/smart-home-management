@echo off
REM Supabase Schema Setup for Windows
REM This outputs the SQL schema to a file

echo.
echo ========================================
echo Supabase Schema Setup
echo ========================================
echo.
echo Creating supabase-schema.sql...
echo.

(
echo -- Create households table
echo CREATE TABLE IF NOT EXISTS households (
echo   id UUID PRIMARY KEY DEFAULT gen_random_uuid(^),
echo   name TEXT NOT NULL,
echo   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
echo ^);
echo.
echo -- Create products table
echo CREATE TABLE IF NOT EXISTS products (
echo   id TEXT PRIMARY KEY,
echo   household_id UUID NOT NULL REFERENCES households(id^) ON DELETE CASCADE,
echo   name TEXT NOT NULL,
echo   category TEXT NOT NULL,
echo   quantity NUMERIC NOT NULL,
echo   unit TEXT,
echo   min_stock NUMERIC,
echo   purchased TEXT,
echo   use_by TEXT,
echo   storage TEXT,
echo   to_buy BOOLEAN DEFAULT FALSE,
echo   frequently_used BOOLEAN DEFAULT FALSE,
echo   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
echo   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
echo ^);
echo.
echo CREATE INDEX IF NOT EXISTS idx_products_household ON products(household_id^);
echo CREATE INDEX IF NOT EXISTS idx_products_category ON products(category^);
echo.
echo -- Create users table
echo CREATE TABLE IF NOT EXISTS users (
echo   id TEXT PRIMARY KEY,
echo   household_id UUID NOT NULL REFERENCES households(id^) ON DELETE CASCADE,
echo   name TEXT NOT NULL,
echo   avatar TEXT,
echo   color TEXT,
echo   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
echo ^);
echo.
echo CREATE INDEX IF NOT EXISTS idx_users_household ON users(household_id^);
echo.
echo -- Create chores table
echo CREATE TABLE IF NOT EXISTS chores (
echo   id TEXT PRIMARY KEY,
echo   household_id UUID NOT NULL REFERENCES households(id^) ON DELETE CASCADE,
echo   name TEXT NOT NULL,
echo   description TEXT,
echo   frequency TEXT,
echo   active BOOLEAN DEFAULT TRUE,
echo   assigned_to TEXT,
echo   duedate TEXT,
echo   chore_category TEXT,
echo   consumed_products JSONB DEFAULT '[]',
echo   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
echo   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
echo ^);
echo.
echo CREATE INDEX IF NOT EXISTS idx_chores_household ON chores(household_id^);
echo CREATE INDEX IF NOT EXISTS idx_chores_active ON chores(active^);
echo.
echo -- Create consumption_logs table
echo CREATE TABLE IF NOT EXISTS consumption_logs (
echo   id TEXT PRIMARY KEY,
echo   household_id UUID NOT NULL REFERENCES households(id^) ON DELETE CASCADE,
echo   user_id TEXT NOT NULL,
echo   user_name TEXT,
echo   product_id TEXT NOT NULL,
echo   product_name TEXT NOT NULL,
echo   amount NUMERIC NOT NULL,
echo   unit TEXT,
echo   type TEXT,
echo   chore_id TEXT,
echo   chore_name TEXT,
echo   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
echo ^);
echo.
echo CREATE INDEX IF NOT EXISTS idx_consumption_logs_household ON consumption_logs(household_id^);
echo CREATE INDEX IF NOT EXISTS idx_consumption_logs_created ON consumption_logs(created_at^);
echo.
echo -- Create rooms table
echo CREATE TABLE IF NOT EXISTS rooms (
echo   id TEXT PRIMARY KEY,
echo   household_id UUID NOT NULL REFERENCES households(id^) ON DELETE CASCADE,
echo   name TEXT NOT NULL,
echo   description TEXT,
echo   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
echo ^);
echo.
echo CREATE INDEX IF NOT EXISTS idx_rooms_household ON rooms(household_id^);
echo.
echo -- Create chore_categories table
echo CREATE TABLE IF NOT EXISTS chore_categories (
echo   id TEXT PRIMARY KEY,
echo   household_id UUID NOT NULL REFERENCES households(id^) ON DELETE CASCADE,
echo   name TEXT NOT NULL,
echo   icon TEXT,
echo   color TEXT,
echo   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
echo ^);
echo.
echo CREATE INDEX IF NOT EXISTS idx_chore_categories_household ON chore_categories(household_id^);
echo.
echo -- Enable Row Level Security
echo ALTER TABLE households ENABLE ROW LEVEL SECURITY;
echo ALTER TABLE products ENABLE ROW LEVEL SECURITY;
echo ALTER TABLE users ENABLE ROW LEVEL SECURITY;
echo ALTER TABLE chores ENABLE ROW LEVEL SECURITY;
echo ALTER TABLE consumption_logs ENABLE ROW LEVEL SECURITY;
echo ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
echo ALTER TABLE chore_categories ENABLE ROW LEVEL SECURITY;
echo.
echo -- Create default household
echo INSERT INTO households ^(name^) VALUES ^('Default Household'^)
echo ON CONFLICT DO NOTHING;
) > supabase-schema.sql

echo File created: supabase-schema.sql
echo.
echo Next steps:
echo 1. Create a Supabase project at https://supabase.com
echo 2. Go to SQL Editor
echo 3. Click "New Query"
echo 4. Open supabase-schema.sql and copy all content
echo 5. Paste into Supabase SQL Editor
echo 6. Click "Run"
echo 7. Get your credentials from Settings ^> API
echo 8. Update .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_KEY
echo 9. Run: npm run build ^&^& npm run dev
echo.
pause
