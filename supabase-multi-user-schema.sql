-- Multi-User Authentication Schema Extension
-- Adds household_members table to link Supabase auth users to households
-- Run this AFTER the base supabase-schema.sql

-- ====================================
-- HOUSEHOLD MEMBERS TABLE  
-- Links auth.users to households
-- ====================================
CREATE TABLE IF NOT EXISTS public.household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id TEXT NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'owner' or 'member'
  display_name TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(household_id, user_id)
);

CREATE INDEX idx_household_members_household ON public.household_members(household_id);
CREATE INDEX idx_household_members_user ON public.household_members(user_id);

-- Enable RLS
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;

-- Policies: Users can see members of households they belong to
CREATE POLICY "household_members_select" ON public.household_members 
FOR SELECT TO authenticated 
USING (
  user_id = auth.uid() OR
  household_id IN (
    SELECT household_id FROM public.household_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "household_members_insert" ON public.household_members 
FOR INSERT TO authenticated 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "household_members_delete" ON public.household_members 
FOR DELETE TO authenticated 
USING (
  user_id = auth.uid() OR
  household_id IN (
    SELECT household_id FROM public.household_members 
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

-- ====================================
-- UPDATE EXISTING RLS POLICIES
-- Replace open policies with user-scoped policies
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

-- Drop old permissive policies
DROP POLICY IF EXISTS "households_select" ON public.households;
DROP POLICY IF EXISTS "households_insert" ON public.households;
DROP POLICY IF EXISTS "households_update" ON public.households;
DROP POLICY IF EXISTS "products_select" ON public.products;
DROP POLICY IF EXISTS "products_insert" ON public.products;
DROP POLICY IF EXISTS "products_update" ON public.products;
DROP POLICY IF EXISTS "products_delete" ON public.products;
DROP POLICY IF EXISTS "users_select" ON public.users;
DROP POLICY IF EXISTS "users_insert" ON public.users;
DROP POLICY IF EXISTS "users_update" ON public.users;
DROP POLICY IF EXISTS "users_delete" ON public.users;
DROP POLICY IF EXISTS "chores_select" ON public.chores;
DROP POLICY IF EXISTS "chores_insert" ON public.chores;
DROP POLICY IF EXISTS "chores_update" ON public.chores;
DROP POLICY IF EXISTS "chores_delete" ON public.chores;
DROP POLICY IF EXISTS "consumption_logs_select" ON public.consumption_logs;
DROP POLICY IF EXISTS "consumption_logs_insert" ON public.consumption_logs;
DROP POLICY IF EXISTS "consumption_logs_delete" ON public.consumption_logs;
DROP POLICY IF EXISTS "rooms_select" ON public.rooms;
DROP POLICY IF EXISTS "rooms_insert" ON public.rooms;
DROP POLICY IF EXISTS "rooms_update" ON public.rooms;
DROP POLICY IF EXISTS "rooms_delete" ON public.rooms;
DROP POLICY IF EXISTS "chore_categories_select" ON public.chore_categories;
DROP POLICY IF EXISTS "chore_categories_insert" ON public.chore_categories;
DROP POLICY IF EXISTS "chore_categories_update" ON public.chore_categories;
DROP POLICY IF EXISTS "chore_categories_delete" ON public.chore_categories;

-- Create new user-scoped policies
-- HOUSEHOLDS
CREATE POLICY "households_select" ON public.households 
FOR SELECT TO authenticated 
USING (id IN (SELECT household_id FROM public.household_members WHERE user_id = auth.uid()));

CREATE POLICY "households_insert" ON public.households 
FOR INSERT TO authenticated 
WITH CHECK (true);

CREATE POLICY "households_update" ON public.households 
FOR UPDATE TO authenticated 
USING (is_household_member(id));

-- PRODUCTS
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

-- USERS (household member profiles)
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

-- CHORES
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

-- CONSUMPTION LOGS
CREATE POLICY "consumption_logs_select" ON public.consumption_logs 
FOR SELECT TO authenticated 
USING (is_household_member(household_id));

CREATE POLICY "consumption_logs_insert" ON public.consumption_logs 
FOR INSERT TO authenticated 
WITH CHECK (is_household_member(household_id));

CREATE POLICY "consumption_logs_delete" ON public.consumption_logs 
FOR DELETE TO authenticated 
USING (is_household_member(household_id));

-- ROOMS
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

-- CHORE CATEGORIES
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
