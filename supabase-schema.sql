-- ============================================
-- SMART HOME MANAGEMENT - COMPLETE SCHEMA
-- ============================================
-- This file contains the complete database schema including:
-- 1. Base tables (households, products, users, chores, etc.)
-- 2. Multi-user authentication with household_members
-- 3. Row-Level Security (RLS) policies
-- 4. Chore categories with frequency support
-- 5. Default rooms initialization
--
-- Run this in Supabase SQL Editor
-- Created: 2026-02-17
-- ============================================

-- ====================================
-- PART 1: BASE SCHEMA
-- ====================================

-- Drop existing tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS public.chore_categories CASCADE;
DROP TABLE IF EXISTS public.consumption_logs CASCADE;
DROP TABLE IF EXISTS public.chores CASCADE;
DROP TABLE IF EXISTS public.rooms CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.household_members CASCADE;
DROP TABLE IF EXISTS public.households CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.is_household_member(TEXT);
DROP FUNCTION IF EXISTS public.initialize_default_categories(TEXT);
DROP FUNCTION IF EXISTS public.auto_init_chore_categories();
DROP FUNCTION IF EXISTS public.initialize_default_rooms(TEXT);
DROP FUNCTION IF EXISTS public.auto_init_rooms();

-- ====================================
-- HOUSEHOLDS TABLE
-- ====================================
CREATE TABLE public.households (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================
-- HOUSEHOLD MEMBERS TABLE (Multi-User Auth)
-- ====================================
CREATE TABLE public.household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id TEXT NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'owner' or 'member'
  display_name TEXT,
  avatar TEXT DEFAULT '👤',
  color TEXT DEFAULT '#4CAF50',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(household_id, user_id)
);

CREATE INDEX idx_household_members_household ON public.household_members(household_id);
CREATE INDEX idx_household_members_user ON public.household_members(user_id);

-- ====================================
-- PRODUCTS TABLE
-- ====================================
CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_household ON public.products(household_id);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_to_buy ON public.products(to_buy);

-- ====================================
-- USERS TABLE (Household Member Profiles)
-- ====================================
CREATE TABLE public.users (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_household ON public.users(household_id);

-- ====================================
-- CHORES TABLE
-- ====================================
CREATE TABLE public.chores (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT,
  active BOOLEAN DEFAULT TRUE,
  assigned_to TEXT,
  duedate TEXT,
  chore_category TEXT,
  consumed_products JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chores_household ON public.chores(household_id);
CREATE INDEX idx_chores_active ON public.chores(active);
CREATE INDEX idx_chores_assigned ON public.chores(assigned_to);

-- ====================================
-- CONSUMPTION LOGS TABLE
-- ====================================
CREATE TABLE public.consumption_logs (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  unit TEXT,
  type TEXT,
  chore_id TEXT,
  chore_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_consumption_logs_household ON public.consumption_logs(household_id);
CREATE INDEX idx_consumption_logs_created ON public.consumption_logs(created_at);
CREATE INDEX idx_consumption_logs_user ON public.consumption_logs(user_id);

-- ====================================
-- ROOMS TABLE
-- ====================================
CREATE TABLE public.rooms (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🏠',
  "order" INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rooms_household ON public.rooms(household_id);

-- ====================================
-- CHORE CATEGORIES TABLE (with frequency support)
-- ====================================
CREATE TABLE public.chore_categories (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  frequency_days INTEGER DEFAULT 1,
  "order" INTEGER DEFAULT 0,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chore_categories_household ON public.chore_categories(household_id);

-- ====================================
-- PART 2: ROW-LEVEL SECURITY (RLS)
-- ====================================

-- Helper function to check if user is household member
CREATE OR REPLACE FUNCTION public.is_household_member(hh_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.household_members 
    WHERE household_id = hh_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumption_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chore_categories ENABLE ROW LEVEL SECURITY;

-- ====================================
-- HOUSEHOLDS POLICIES
-- ====================================
CREATE POLICY "households_select" ON public.households 
FOR SELECT TO authenticated 
USING (true); -- Permissive for creation flow, data scoped by household_members

CREATE POLICY "households_insert" ON public.households 
FOR INSERT TO authenticated 
WITH CHECK (true);

CREATE POLICY "households_update" ON public.households 
FOR UPDATE TO authenticated 
USING (is_household_member(id));

CREATE POLICY "households_delete" ON public.households 
FOR DELETE TO authenticated 
USING (is_household_member(id));

-- ====================================
-- HOUSEHOLD MEMBERS POLICIES
-- ====================================
CREATE POLICY "household_members_select" ON public.household_members 
FOR SELECT TO authenticated 
USING (true);

CREATE POLICY "household_members_insert" ON public.household_members 
FOR INSERT TO authenticated 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "household_members_update" ON public.household_members 
FOR UPDATE TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "household_members_delete" ON public.household_members 
FOR DELETE TO authenticated 
USING (user_id = auth.uid());

-- ====================================
-- PRODUCTS POLICIES
-- ====================================
CREATE POLICY "products_select" ON public.products 
FOR SELECT TO authenticated 
USING (is_household_member(household_id));

CREATE POLICY "products_insert" ON public.products 
FOR INSERT TO authenticated 
WITH CHECK (is_household_member(household_id));

CREATE POLICY "products_update" ON public.products 
FOR UPDATE TO authenticated 
USING (is_household_member(household_id));

CREATE POLICY "products_delete" ON public.products 
FOR DELETE TO authenticated 
USING (is_household_member(household_id));

-- ====================================
-- USERS POLICIES
-- ====================================
CREATE POLICY "users_select" ON public.users 
FOR SELECT TO authenticated 
USING (is_household_member(household_id));

CREATE POLICY "users_insert" ON public.users 
FOR INSERT TO authenticated 
WITH CHECK (is_household_member(household_id));

CREATE POLICY "users_update" ON public.users 
FOR UPDATE TO authenticated 
USING (is_household_member(household_id));

CREATE POLICY "users_delete" ON public.users 
FOR DELETE TO authenticated 
USING (is_household_member(household_id));

-- ====================================
-- CHORES POLICIES
-- ====================================
CREATE POLICY "chores_select" ON public.chores 
FOR SELECT TO authenticated 
USING (is_household_member(household_id));

CREATE POLICY "chores_insert" ON public.chores 
FOR INSERT TO authenticated 
WITH CHECK (is_household_member(household_id));

CREATE POLICY "chores_update" ON public.chores 
FOR UPDATE TO authenticated 
USING (is_household_member(household_id));

CREATE POLICY "chores_delete" ON public.chores 
FOR DELETE TO authenticated 
USING (is_household_member(household_id));

-- ====================================
-- CONSUMPTION LOGS POLICIES
-- ====================================
CREATE POLICY "consumption_logs_select" ON public.consumption_logs 
FOR SELECT TO authenticated 
USING (is_household_member(household_id));

CREATE POLICY "consumption_logs_insert" ON public.consumption_logs 
FOR INSERT TO authenticated 
WITH CHECK (is_household_member(household_id));

CREATE POLICY "consumption_logs_update" ON public.consumption_logs 
FOR UPDATE TO authenticated 
USING (is_household_member(household_id));

CREATE POLICY "consumption_logs_delete" ON public.consumption_logs 
FOR DELETE TO authenticated 
USING (is_household_member(household_id));

-- ====================================
-- ROOMS POLICIES
-- ====================================
CREATE POLICY "rooms_select" ON public.rooms 
FOR SELECT TO authenticated 
USING (is_household_member(household_id));

CREATE POLICY "rooms_insert" ON public.rooms 
FOR INSERT TO authenticated 
WITH CHECK (is_household_member(household_id));

CREATE POLICY "rooms_update" ON public.rooms 
FOR UPDATE TO authenticated 
USING (is_household_member(household_id));

CREATE POLICY "rooms_delete" ON public.rooms 
FOR DELETE TO authenticated 
USING (is_household_member(household_id));

-- ====================================
-- CHORE CATEGORIES POLICIES
-- ====================================
CREATE POLICY "chore_categories_select" ON public.chore_categories 
FOR SELECT TO authenticated 
USING (is_household_member(household_id));

CREATE POLICY "chore_categories_insert" ON public.chore_categories 
FOR INSERT TO authenticated 
WITH CHECK (is_household_member(household_id));

CREATE POLICY "chore_categories_update" ON public.chore_categories 
FOR UPDATE TO authenticated 
USING (is_household_member(household_id));

CREATE POLICY "chore_categories_delete" ON public.chore_categories 
FOR DELETE TO authenticated 
USING (is_household_member(household_id));

-- ====================================
-- PART 3: DEFAULT CHORE CATEGORIES INITIALIZATION
-- ====================================

-- Function to initialize default frequency categories for a household
CREATE OR REPLACE FUNCTION initialize_default_categories(hh_id TEXT)
RETURNS void AS $$
BEGIN
  -- Check if household already has categories
  IF NOT EXISTS (SELECT 1 FROM public.chore_categories WHERE household_id = hh_id) THEN
    -- Insert default frequency-based categories (can be modified/deleted by users)
    INSERT INTO public.chore_categories (id, name, icon, frequency_days, "order", household_id, created_at)
    VALUES 
      (gen_random_uuid(), 'Daily', '📅', 1, 0, hh_id, CURRENT_TIMESTAMP),
      (gen_random_uuid(), 'Weekly', '📆', 7, 1, hh_id, CURRENT_TIMESTAMP),
      (gen_random_uuid(), 'Biweekly', '🗓️', 14, 2, hh_id, CURRENT_TIMESTAMP),
      (gen_random_uuid(), 'Monthly', '📋', 30, 3, hh_id, CURRENT_TIMESTAMP),
      (gen_random_uuid(), 'Quarterly', '📊', 90, 4, hh_id, CURRENT_TIMESTAMP),
      (gen_random_uuid(), 'Half-year', '📈', 180, 5, hh_id, CURRENT_TIMESTAMP);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-initialize categories for new households
CREATE OR REPLACE FUNCTION auto_init_chore_categories()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM initialize_default_categories(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_init_chore_categories
AFTER INSERT ON public.households
FOR EACH ROW
EXECUTE FUNCTION auto_init_chore_categories();

-- ====================================
-- PART 4: DEFAULT ROOMS INITIALIZATION
-- ====================================

-- Function to initialize default rooms for a household
CREATE OR REPLACE FUNCTION initialize_default_rooms(hh_id TEXT)
RETURNS void AS $$
BEGIN
  -- Check if household already has rooms
  IF NOT EXISTS (SELECT 1 FROM public.rooms WHERE household_id = hh_id) THEN
    -- Insert default rooms with icons and order
    INSERT INTO public.rooms (id, name, icon, "order", household_id, created_at)
    VALUES 
      (gen_random_uuid(), 'Kitchen', '🍳', 0, hh_id, CURRENT_TIMESTAMP),
      (gen_random_uuid(), 'Bathroom', '🚿', 1, hh_id, CURRENT_TIMESTAMP),
      (gen_random_uuid(), 'Bedroom 1', '🛏️', 2, hh_id, CURRENT_TIMESTAMP),
      (gen_random_uuid(), 'Bedroom 2', '🛏️', 3, hh_id, CURRENT_TIMESTAMP),
      (gen_random_uuid(), 'Bedroom 3', '🛏️', 4, hh_id, CURRENT_TIMESTAMP),
      (gen_random_uuid(), 'Living Room', '🛋️', 5, hh_id, CURRENT_TIMESTAMP),
      (gen_random_uuid(), 'Whole House', '🏠', 6, hh_id, CURRENT_TIMESTAMP),
      (gen_random_uuid(), 'Storage', '📚', 7, hh_id, CURRENT_TIMESTAMP),
      (gen_random_uuid(), 'Garage', '🚪', 8, hh_id, CURRENT_TIMESTAMP),
      (gen_random_uuid(), 'Other', '🧹', 9, hh_id, CURRENT_TIMESTAMP);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-initialize rooms for new households
CREATE OR REPLACE FUNCTION auto_init_rooms()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM initialize_default_rooms(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_init_rooms
AFTER INSERT ON public.households
FOR EACH ROW
EXECUTE FUNCTION auto_init_rooms();

-- ====================================
-- PART 5: INITIALIZE EXISTING HOUSEHOLDS
-- ====================================

-- Initialize categories for all existing households
DO $$
DECLARE
  household_record RECORD;
BEGIN
  FOR household_record IN SELECT id FROM public.households LOOP
    PERFORM initialize_default_categories(household_record.id);
    PERFORM initialize_default_rooms(household_record.id);
  END LOOP;
END $$;

-- ====================================
-- GRANT PERMISSIONS
-- ====================================
GRANT EXECUTE ON FUNCTION public.is_household_member TO authenticated;
GRANT EXECUTE ON FUNCTION initialize_default_categories TO authenticated;
GRANT EXECUTE ON FUNCTION auto_init_chore_categories TO authenticated;
GRANT EXECUTE ON FUNCTION initialize_default_rooms TO authenticated;
GRANT EXECUTE ON FUNCTION auto_init_rooms TO authenticated;

-- ============================================
-- SCHEMA COMPLETE!
-- ============================================
-- Your database now includes:
-- ✅ Multi-user authentication with household_members table
-- ✅ Row-Level Security policies for data isolation
-- ✅ Chore categories with custom frequency support
-- ✅ Default rooms automatically initialized for all households
-- ✅ Avatar and color support for household members
--
-- New households will automatically receive:
-- - 6 default frequency categories (Daily, Weekly, Biweekly, Monthly, Quarterly, Half-year)
-- - 10 default rooms (Kitchen, Bathroom, Bedrooms, Living Room, etc.)
-- ============================================
