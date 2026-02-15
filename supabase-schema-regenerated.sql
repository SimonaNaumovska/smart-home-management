-- Smart Home Management - Supabase Schema (REGENERATED)
-- Complete schema with RLS policies and proper structure
-- Created: 2026-02-16

-- ====================================
-- HOUSEHOLDS TABLE
-- ====================================
DROP TABLE IF EXISTS public.chore_categories CASCADE;
DROP TABLE IF EXISTS public.consumption_logs CASCADE;
DROP TABLE IF EXISTS public.chores CASCADE;
DROP TABLE IF EXISTS public.rooms CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.households CASCADE;

CREATE TABLE public.households (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
CREATE POLICY "households_select" ON public.households FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "households_insert" ON public.households FOR INSERT TO authenticated, anon WITH CHECK (id IS NOT NULL);
CREATE POLICY "households_update" ON public.households FOR UPDATE TO authenticated, anon USING (id IS NOT NULL) WITH CHECK (id IS NOT NULL);
CREATE POLICY "households_delete" ON public.households FOR DELETE TO authenticated, anon USING (id IS NOT NULL);

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

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_select" ON public.products FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "products_insert" ON public.products FOR INSERT TO authenticated, anon WITH CHECK (household_id IS NOT NULL);
CREATE POLICY "products_update" ON public.products FOR UPDATE TO authenticated, anon USING (household_id IS NOT NULL) WITH CHECK (household_id IS NOT NULL);
CREATE POLICY "products_delete" ON public.products FOR DELETE TO authenticated, anon USING (household_id IS NOT NULL);

-- ====================================
-- USERS TABLE (Household Members)
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

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select" ON public.users FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "users_insert" ON public.users FOR INSERT TO authenticated, anon WITH CHECK (household_id IS NOT NULL);
CREATE POLICY "users_update" ON public.users FOR UPDATE TO authenticated, anon USING (household_id IS NOT NULL) WITH CHECK (household_id IS NOT NULL);
CREATE POLICY "users_delete" ON public.users FOR DELETE TO authenticated, anon USING (household_id IS NOT NULL);

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

ALTER TABLE public.chores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chores_select" ON public.chores FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "chores_insert" ON public.chores FOR INSERT TO authenticated, anon WITH CHECK (household_id IS NOT NULL);
CREATE POLICY "chores_update" ON public.chores FOR UPDATE TO authenticated, anon USING (household_id IS NOT NULL) WITH CHECK (household_id IS NOT NULL);
CREATE POLICY "chores_delete" ON public.chores FOR DELETE TO authenticated, anon USING (household_id IS NOT NULL);

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

ALTER TABLE public.consumption_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "consumption_logs_select" ON public.consumption_logs FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "consumption_logs_insert" ON public.consumption_logs FOR INSERT TO authenticated, anon WITH CHECK (household_id IS NOT NULL);
CREATE POLICY "consumption_logs_update" ON public.consumption_logs FOR UPDATE TO authenticated, anon USING (household_id IS NOT NULL) WITH CHECK (household_id IS NOT NULL);
CREATE POLICY "consumption_logs_delete" ON public.consumption_logs FOR DELETE TO authenticated, anon USING (household_id IS NOT NULL);

-- ====================================
-- ROOMS TABLE
-- ====================================
CREATE TABLE public.rooms (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rooms_household ON public.rooms(household_id);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rooms_select" ON public.rooms FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "rooms_insert" ON public.rooms FOR INSERT TO authenticated, anon WITH CHECK (household_id IS NOT NULL);
CREATE POLICY "rooms_update" ON public.rooms FOR UPDATE TO authenticated, anon USING (household_id IS NOT NULL) WITH CHECK (household_id IS NOT NULL);
CREATE POLICY "rooms_delete" ON public.rooms FOR DELETE TO authenticated, anon USING (household_id IS NOT NULL);

-- ====================================
-- CHORE CATEGORIES TABLE
-- ====================================
CREATE TABLE public.chore_categories (
  id TEXT PRIMARY KEY,
  household_id TEXT NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chore_categories_household ON public.chore_categories(household_id);

ALTER TABLE public.chore_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chore_categories_select" ON public.chore_categories FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "chore_categories_insert" ON public.chore_categories FOR INSERT TO authenticated, anon WITH CHECK (household_id IS NOT NULL);
CREATE POLICY "chore_categories_update" ON public.chore_categories FOR UPDATE TO authenticated, anon USING (household_id IS NOT NULL) WITH CHECK (household_id IS NOT NULL);
CREATE POLICY "chore_categories_delete" ON public.chore_categories FOR DELETE TO authenticated, anon USING (household_id IS NOT NULL);

-- ====================================
-- SEED DEFAULT DATA
-- ====================================
INSERT INTO public.households (id, name) VALUES ('default-household', 'Default Household')
ON CONFLICT (id) DO NOTHING;
