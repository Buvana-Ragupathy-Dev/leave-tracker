# Leave Tracker

A full-stack Leave Management application built with React, Node.js/Express, and MySQL.

## Project Structure

```
Leave Tracker/
├── backend/          # Node.js + Express API
└── frontend/         # React SPA
```

## Prerequisites

- Node.js >= 18
- MySQL >= 8.0

## Setup

### 1. Database

```sql
-- Run schema and seed
mysql -u root -p < backend/src/db/schema.sql
mysql -u root -p < backend/src/db/seed.sql
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # Fill in DB credentials and JWT_SECRET
npm run dev
```

Server runs on http://localhost:5000

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

App runs on http://localhost:3000 (proxies API calls to port 5000)

## Default Credentials (from seed)

| Role     | Email                    | Password     |
|----------|--------------------------|--------------|
| Admin    | admin@company.com        | password     |
| Manager  | manager@company.com      | password     |
| Employee | employee@company.com     | password     |

> **Note:** The seed uses a placeholder bcrypt hash. Generate real hashes with:
> ```js
> const bcrypt = require('bcryptjs');
> console.log(await bcrypt.hash('YourPassword', 10));
> ```
> Then update the seed.sql INSERT statements.

## API Overview

| Method | Endpoint                                    | Role              |
|--------|---------------------------------------------|-------------------|
| POST   | /api/auth/login                             | Public            |
| GET    | /api/me                                     | Authenticated     |
| GET    | /api/leave-balances                         | Employee          |
| GET    | /api/leave-requests                         | Employee          |
| POST   | /api/leave-requests                         | Employee          |
| PATCH  | /api/leave-requests/:id/cancel              | Request Owner     |
| GET    | /api/leave-requests/:id/activities          | Request Owner     |
| GET    | /api/manager/leave-requests                 | Manager           |
| GET    | /api/manager/leave-requests/:id             | Assigned Manager  |
| PATCH  | /api/manager/leave-requests/:id/approve     | Assigned Manager  |
| PATCH  | /api/manager/leave-requests/:id/reject      | Assigned Manager  |
| GET    | /api/admin/leave-requests                   | Admin             |
| GET    | /api/admin/leave-requests/:id               | Admin             |
| GET    | /api/admin/leave-requests/:id/activities    | Admin             |
| GET    | /api/admin/employees                        | Admin             |
| PATCH  | /api/admin/employees/:id                    | Admin             |
| PATCH  | /api/admin/employees/:id/manager            | Admin             |
| GET    | /api/admin/calendar                         | Admin             |
| POST   | /api/admin/calendar                         | Admin             |
| PATCH  | /api/admin/calendar/:id                     | Admin             |

## Key Business Rules

- Leave days counted from working days only (calendar table)
- Overlapping PENDING/APPROVED requests are blocked
- Managers cannot approve their own leave
- Cancellation only allowed on PENDING requests
- Leave balance deducted only on APPROVAL
- assigned_manager_id is snapshot at request creation time
