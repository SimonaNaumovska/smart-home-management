# Smart Home Management Backend

Clean Express + TypeScript backend with feature-based modular architecture.

## 🏗️ Architecture

```
server/
├── src/
│   ├── index.ts              # Server entry point
│   ├── app.ts                # Express app configuration
│   ├── config/
│   │   └── supabase.ts       # Supabase client
│   ├── middleware/
│   │   ├── errorHandler.ts   # Global error handling
│   │   └── logger.ts         # Request logging
│   ├── modules/
│   │   └── inventory/        # Feature module
│   │       ├── inventory.routes.ts
│   │       ├── inventory.controller.ts
│   │       ├── inventory.service.ts
│   │       └── inventory.types.ts
│   └── types/
│       └── express.ts        # TypeScript type extensions
├── package.json
├── tsconfig.json
└── .env.example
```

## 🚀 Getting Started

### Installation

```bash
cd server
npm install
```

### Environment Setup

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Update `.env` with your credentials:

```env
PORT=3001
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
CORS_ORIGIN=http://localhost:5173
```

### Development

```bash
npm run dev
```

Server runs on `http://localhost:3001`

### Production

```bash
npm run build
npm start
```

## 📡 API Endpoints

### Health Check

- `GET /health` - Server health status

### Inventory Module

| Method | Endpoint                         | Description          |
| ------ | -------------------------------- | -------------------- |
| GET    | `/api/inventory`                 | Get all products     |
| GET    | `/api/inventory/:id`             | Get product by ID    |
| POST   | `/api/inventory`                 | Create new product   |
| PATCH  | `/api/inventory/:id`             | Update product       |
| DELETE | `/api/inventory/:id`             | Delete product       |
| PATCH  | `/api/inventory/:id/mark-to-buy` | Toggle to-buy status |
| GET    | `/api/inventory/low-stock`       | Get low stock items  |

#### Query Parameters

- `householdId` (required) - Household identifier
- `category` (optional) - Filter by category
- `toBuy` (optional) - Filter by shopping list status
- `search` (optional) - Search by name
- `limit` (optional) - Pagination limit
- `offset` (optional) - Pagination offset

## 🧩 Adding New Modules

Create a new feature module with the same structure:

```bash
mkdir -p src/modules/[feature]
touch src/modules/[feature]/[feature].routes.ts
touch src/modules/[feature]/[feature].controller.ts
touch src/modules/[feature]/[feature].service.ts
touch src/modules/[feature]/[feature].types.ts
```

Then register routes in `src/app.ts`:

```typescript
import featureRoutes from "./modules/[feature]/[feature].routes";
app.use("/api/[feature]", featureRoutes);
```

## 📝 Layer Responsibilities

- **Routes**: HTTP endpoint definitions and route registration
- **Controller**: Request/response handling, validation, HTTP logic
- **Service**: Business logic, data access, Supabase operations
- **Types**: TypeScript interfaces and type definitions

## 🔒 Security Features

- ✅ Helmet (security headers)
- ✅ CORS configuration
- ✅ Request logging
- ✅ Global error handling
- ⏳ JWT authentication (coming soon)

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Dev Tools**: tsx (fast TypeScript execution)
