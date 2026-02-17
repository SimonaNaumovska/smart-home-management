# Multi-User Authentication Setup

This application now supports true multi-user authentication where multiple people can log in with separate accounts and access the same household data.

## 🎯 How It Works

1. **Each user has their own Supabase account** (separate email/password)
2. **Users belong to a household** via the `household_members` table
3. **All household data is shared** among members (products, chores, consumption logs, etc.)
4. **Row-Level Security (RLS)** ensures users only see data from their household

## 🔧 Database Setup

### Step 1: Run Base Schema

First, run the base schema in your Supabase SQL Editor:

```sql
-- Run supabase-schema.sql
```

This creates the core tables: `households`, `products`, `users`, `chores`, `consumption_logs`, `rooms`, and `chore_categories`.

### Step 2: Add Multi-User Support

Then run the multi-user extension schema:

```sql
-- Run supabase-multi-user-schema.sql
```

This:

- Creates the `household_members` table linking auth.users to households
- Updates all RLS policies to enforce household-based access control
- Adds helper function `is_household_member()` for policy checks

## 👥 User Flow

### New User Signup

1. User signs up with email/password
2. After authentication, sees "Household Setup" screen
3. User chooses to either:
   - **Create New Household**: Enters household name and display name, becomes owner
   - **Join Existing Household**: Enters household ID (provided by owner) and display name

### Existing User Login

1. User logs in with email/password
2. App automatically fetches their household
3. User sees all shared household data

## 🏠 Household Management

### Creating a Household

```typescript
const { createHousehold } = useHousehold(userId);

// Creates household and adds user as owner
await createHousehold("Smith Family", "John");
// Returns: household-xxxxx-xxxxx (UUID)
```

### Joining a Household

```typescript
const { joinHousehold } = useHousehold(userId);

// Adds user as member to existing household
await joinHousehold("household-xxxxx-xxxxx", "Jane");
```

### Inviting Others

1. Household owner logs in
2. Goes to Settings tab
3. Shows their household ID: `household-xxxxx-xxxxx`
4. Shares this ID with family members/roommates
5. New users can join during signup by entering this ID

## 🔒 Security (RLS Policies)

All tables use Row-Level Security:

```sql
-- Example: Products table policy
CREATE POLICY "products_select" ON public.products
FOR SELECT TO authenticated
USING (is_household_member(household_id));
```

Users can only:

- **SELECT**: Data from their household
- **INSERT/UPDATE/DELETE**: Data in their household
- **No access**: To other households' data

## 📝 Key Files

- **`supabase-multi-user-schema.sql`**: Database schema for multi-user support
- **`src/shared/hooks/useHousehold.ts`**: Household management hook
- **`src/shared/hooks/useAuth.ts`**: Updated to return userId
- **`src/shared/components/HouseholdSetup.tsx`**: Onboarding flow for new users
- **`src/app/App.tsx`**: Updated to use household from authenticated user
- **`src/supabase/database.ts`**: Added household member query functions

## 🧪 Testing Multi-User

1. **Create first account**:
   - Sign up as user1@example.com
   - Create household "Test Family"
   - Note the household ID shown in Settings

2. **Create second account**:
   - Sign out
   - Sign up as user2@example.com
   - Choose "Join Existing Household"
   - Enter the household ID from step 1
   - Enter display name

3. **Verify data sharing**:
   - User 1 adds a product
   - User 2 should see it immediately (real-time sync)
   - Both users can edit, delete, and manage all household data

## 🚀 Migration from Single-User

If you have existing data in the "default-household":

1. Run the multi-user schema
2. Existing data remains in "default-household"
3. First user who logs in and creates a household gets a new one
4. **Optional**: Manually migrate data in Supabase SQL Editor:

```sql
-- Update existing data to new household
UPDATE products SET household_id = 'household-xxxxx-xxxxx'
WHERE household_id = 'default-household';

UPDATE users SET household_id = 'household-xxxxx-xxxxx'
WHERE household_id = 'default-household';

-- Repeat for chores, consumption_logs, rooms, chore_categories
```

## ⚙️ Environment Variables

No additional environment variables needed. Uses existing Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_anon_key
```

## 🎉 Benefits

✅ **True multi-user authentication** - Each person has their own login
✅ **Shared household data** - All members see the same products, chores, etc.
✅ **Real-time sync** - Changes appear instantly for all users
✅ **Secure access control** - RLS ensures data privacy between households
✅ **Easy invitation** - Just share the household ID
✅ **Role-based access** - Owner vs member roles (can be extended)

## 📊 Database Diagram

```
auth.users (Supabase Auth)
    ↓ (user_id)
household_members
    ↓ (household_id)
households
    ↓ (household_id)
├── products
├── users (member profiles)
├── chores
├── consumption_logs
├── rooms
└── chore_categories
```

---

Now your household management app supports real multi-user authentication! 🎊
