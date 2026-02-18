# 🚀 Backend Migration Guide

## Architecture Shift

**Before:**

```
React → Supabase (Direct)
```

**After:**

```
React → Express API → Supabase
```

## ✅ Completed Setup

### 1. Vite Proxy Configuration ✅

Located in `vite.config.ts`:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
}
```

### 2. Backend API Routes ✅

Located in `server/src/app.ts`:

```typescript
app.use("/api/inventory", inventoryRoutes);
```

Backend exposes:

- `GET /api/inventory` - Get all products
- `GET /api/inventory/:id` - Get single product
- `POST /api/inventory` - Create product
- `PATCH /api/inventory/:id` - Update product
- `DELETE /api/inventory/:id` - Delete product
- `PATCH /api/inventory/:id/mark-to-buy` - Toggle shopping list
- `GET /api/inventory/low-stock` - Get low stock items

### 3. Frontend API Service ✅

Created `src/api/inventoryApi.ts` - A clean TypeScript service that wraps all backend API calls.

### 4. Example Migration Hook ✅

Created `src/shared/hooks/useProductsApi.ts` - Backend version of useProducts hook.

---

## 📋 Migration Steps

### Phase 1: Start Backend

```bash
cd server
npm run dev
# Server runs on http://localhost:3001
```

### Phase 2: Start Frontend (with proxy)

```bash
# In project root
npm run dev
# Frontend runs on http://localhost:5173
# API calls to /api/* are proxied to backend
```

### Phase 3: Gradual Migration

#### Option A: Quick Test (Recommended First)

Test the backend API directly in your component:

```typescript
import { inventoryApi } from "../../api/inventoryApi";

// In your component or hook:
const products = await inventoryApi.getProducts({
  householdId: "your-household-id",
});
```

#### Option B: Swap Hooks (Feature by Feature)

Replace Supabase hooks with API hooks:

**Before:**

```typescript
import { useProducts } from "../../shared/hooks/useProducts";

function InventoryView() {
  const { products, addProduct } = useProducts(householdId);
  // ...
}
```

**After:**

```typescript
import { useProductsApi } from "../../shared/hooks/useProductsApi";

function InventoryView() {
  const { products, addProduct, loading, error } = useProductsApi(householdId);
  // ...
}
```

---

## 🔄 Migration Order (Recommended)

### 1. Inventory Module (Start Here)

- ✅ Backend ready: `server/src/modules/inventory/`
- ✅ Frontend service ready: `src/api/inventoryApi.ts`
- ✅ Example hook ready: `src/shared/hooks/useProductsApi.ts`

**Components to migrate:**

- `src/features/inventory/InventoryView.tsx`
- `src/features/inventory/InventoryDashboard.tsx`
- `src/features/inventory/ProductList.tsx`
- `src/features/inventory/MobileInventoryView.tsx`

**How to migrate:**

1. Import `useProductsApi` instead of `useProducts`
2. Handle `loading` and `error` states in UI
3. Test thoroughly before moving to next component

### 2. Shopping Module

Create `server/src/modules/shopping/` with same pattern:

- `shopping.routes.ts`
- `shopping.controller.ts`
- `shopping.service.ts`
- `shopping.types.ts`

### 3. Chores Module

Create `server/src/modules/chores/`

### 4. Dashboard Module

Create `server/src/modules/dashboard/`

### 5. Users Module

Create `server/src/modules/users/`

---

## 🎯 Key Differences

### Supabase Hook vs Backend API Hook

| Feature            | Supabase (Old)   | Backend API (New) |
| ------------------ | ---------------- | ----------------- |
| Real-time          | ✅ Subscriptions | ⏳ Polling (5s)   |
| Loading state      | ❌ No            | ✅ Yes            |
| Error handling     | ❌ Basic         | ✅ Comprehensive  |
| Optimistic updates | ❌ No            | ✅ Yes            |
| Rollback on error  | ❌ No            | ✅ Yes            |
| Type safety        | ✅ Yes           | ✅ Yes            |

### Note on Real-time

Current implementation uses **polling every 5 seconds**. For true real-time:

- Add WebSocket support to backend
- Or use Server-Sent Events (SSE)
- Or keep Supabase realtime subscriptions (hybrid approach)

---

## 🧪 Testing

### 1. Test Backend Directly

```bash
# In another terminal
curl http://localhost:3001/health

# Test inventory endpoint
curl "http://localhost:3001/api/inventory?householdId=your-id"
```

### 2. Test Frontend Proxy

Open browser DevTools → Network tab:

- Look for calls to `/api/inventory`
- Should show 200 status
- Should return JSON data

### 3. Test Error Handling

- Stop backend server
- Try to fetch data in frontend
- Should see error state in UI

---

## 📝 Example: Full Migration of One Component

**Before (Direct Supabase):**

```typescript
// InventoryView.tsx
import { useProducts } from "../../shared/hooks/useProducts";
import { supabase } from "../../supabase/config";

function InventoryView() {
  const { products, addProduct } = useProducts(householdId);

  return (
    <div>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
```

**After (Backend API):**

```typescript
// InventoryView.tsx
import { useProductsApi } from "../../shared/hooks/useProductsApi";

function InventoryView() {
  const { products, addProduct, loading, error } = useProductsApi(householdId);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
```

---

## 🚨 Common Issues

### Issue 1: CORS Errors

**Solution:** Backend already configured CORS. Make sure:

- Backend is running on port 3001
- Frontend proxy is configured in vite.config.ts

### Issue 2: 404 Not Found

**Solution:** Check route registration in `server/src/app.ts`

### Issue 3: Environment Variables Not Loading

**Solution:** Already fixed! `dotenv.config()` is in `server/src/config/supabase.ts`

### Issue 4: Slow Updates

**Solution:** Currently using 5-second polling. For faster updates:

- Reduce polling interval (use cautiously)
- Implement WebSockets
- Or keep Supabase realtime for updates only

---

## 🎬 Next Actions

1. **Test backend:**
   - Start backend: `cd server && npm run dev`
   - Hit health check: `curl http://localhost:3001/health`

2. **Test frontend integration:**
   - Start frontend: `npm run dev`
   - Open DevTools → Network
   - Try any inventory operation
   - Look for `/api/inventory` calls

3. **Migrate first component:**
   - Start with `InventoryView.tsx`
   - Replace `useProducts` with `useProductsApi`
   - Add loading/error UI
   - Test thoroughly

4. **Expand gradually:**
   - One component at a time
   - Test each migration
   - Keep old code until confirmed working

---

## 💡 Pro Tips

- Keep both `useProducts` and `useProductsApi` during migration
- Test with real data, not just mock data
- Monitor backend logs for errors
- Use browser DevTools to debug API calls
- Consider adding request/response logging in inventoryApi.ts

---

## 🏆 Success Criteria

✅ Backend server running on 3001
✅ Frontend can fetch data via `/api/inventory`
✅ CRUD operations work through backend
✅ Loading states show correctly
✅ Errors are handled gracefully
✅ No direct Supabase calls in migrated components

---

## 📚 File Reference

### Backend

- `server/src/index.ts` - Entry point
- `server/src/app.ts` - Express config
- `server/src/modules/inventory/` - Inventory module
- `server/.env` - Environment variables

### Frontend

- `vite.config.ts` - Proxy configuration
- `src/api/inventoryApi.ts` - API service
- `src/shared/hooks/useProductsApi.ts` - Backend hook
- `src/shared/hooks/useProducts.ts` - Old Supabase hook (keep for reference)

---

**Status:** ✅ Ready to start migration
**Recommended Start:** Test backend health check, then migrate `InventoryView.tsx`
