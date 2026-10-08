# Leave Tracker

A full-stack Leave Management application built with React, Node.js/Express, and MySQL.

## Project Structure

```
leave-tracker/
├── backend/          # Node.js + Express REST API
│   └── src/
│       ├── config/   # Database connection
│       ├── controllers/
│       ├── db/       # schema.sql, seed.sql
│       ├── middleware/
│       └── routes/
└── frontend/         # React SPA
    └── src/
        ├── api/      # Axios client
        ├── components/
        ├── context/  # Auth context
        └── pages/
```

## Prerequisites

- Node.js >= 18
- MySQL >= 8.0

## Setup

### 1. Database

```bash
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

App runs on http://localhost:3000 (proxies /api calls to port 5000)

---

## Environment Variables

| Variable       | Description                        | Example              |
|----------------|------------------------------------|----------------------|
| PORT           | Backend port                       | 5000                 |
| DB_HOST        | MySQL host                         | localhost            |
| DB_PORT        | MySQL port                         | 3306                 |
| DB_USER        | MySQL user                         | root                 |
| DB_PASSWORD    | MySQL password                     | your_password        |
| DB_NAME        | Database name                      | leave_tracker        |
| JWT_SECRET     | Secret key for signing JWT tokens  | a_long_random_string |
| JWT_EXPIRES_IN | Token expiry duration              | 8h                   |

---

## Default Credentials (from seed)

| Role     | Email                       | Password |
|----------|-----------------------------|----------|
| Admin    | arun.kumar@company.com      | password |
| Manager  | priya.sharma@company.com    | password |
| Manager  | rahul.verma@company.com     | password |
| Employee | karthik.raj@company.com     | password |
| Employee | anitha.devi@company.com     | password |

> The seed uses a pre-generated bcrypt hash for `password`. To use a different password:
> ```js
> const bcrypt = require('bcryptjs');
> console.log(await bcrypt.hash('YourPassword', 10));
> ```
> Then replace the hash in `seed.sql`.

---

## API Reference

| Method | Endpoint                                 | Role             | Description                        |
|--------|------------------------------------------|------------------|------------------------------------|
| POST   | /api/auth/login                          | Public           | Login, returns JWT                 |
| GET    | /api/me                                  | Authenticated    | Get current user profile           |
| GET    | /api/leave-balances                      | Employee         | View own leave balances            |
| GET    | /api/leave-requests                      | Employee         | List own leave requests (paginated)|
| POST   | /api/leave-requests                      | Employee         | Submit a new leave request         |
| PATCH  | /api/leave-requests/:id/cancel           | Request Owner    | Cancel a PENDING request           |
| GET    | /api/leave-requests/:id/activities       | Request Owner    | View audit trail for a request     |
| GET    | /api/manager/leave-requests              | Manager          | List assigned team requests        |
| GET    | /api/manager/leave-requests/:id          | Assigned Manager | View a specific assigned request   |
| PATCH  | /api/manager/leave-requests/:id/approve  | Assigned Manager | Approve a PENDING request          |
| PATCH  | /api/manager/leave-requests/:id/reject   | Assigned Manager | Reject a PENDING request           |
| GET    | /api/admin/leave-requests                | Admin            | List all leave requests            |
| GET    | /api/admin/leave-requests/:id            | Admin            | View any leave request             |
| GET    | /api/admin/leave-requests/:id/activities | Admin            | View audit trail (admin view)      |
| GET    | /api/admin/employees                     | Admin            | List employees with search         |
| PATCH  | /api/admin/employees/:id                 | Admin            | Update employee name/role/roleset  |
| PATCH  | /api/admin/employees/:id/manager         | Admin            | Assign a manager to an employee    |
| GET    | /api/admin/calendar                      | Admin            | View working day calendar          |
| POST   | /api/admin/calendar                      | Admin            | Add or update a calendar entry     |
| PATCH  | /api/admin/calendar/:id                  | Admin            | Edit an existing calendar entry    |

---

## Architecture & Key Decisions

### Authentication & Authorization
- JWT-based authentication. Token is stored in `localStorage` and sent as a `Bearer` header on every request.
- Each user has a `role` (primary) and a `roleset` (JSON array) to support users with multiple roles — e.g. a manager who is also an employee.
- The `roleset` is stored as numeric IDs in the DB and mapped to role name strings (`employee`, `manager`, `admin`) at login and on `/me`, so the frontend and middleware always work with names.
- Route-level middleware (`authenticate` + `authorize`) enforces access per role.

### Database Design
- `roles` — lookup table for role names.
- `users` — stores `role` (FK to roles) and `roleset` (JSON array of role IDs) for multi-role support.
- `leave_types` — stores leave type name and `annual_allocation` (days per year). Allocation is configured here, not hardcoded.
- `leave_balances` — one row per user per leave type, tracks `used_days` only. Available days = `annual_allocation - used_days`, computed in SQL at query time.
- `calendar` — one row per date for the year, marks each day as working or non-working (weekend/holiday). Seeded automatically for the current year.
- `leave_requests` — stores the full request with a snapshot of `assigned_manager_id` at creation time, so manager reassignments don't affect in-flight requests.
- `leave_activities` — append-only audit log for every state change (CREATED, APPROVED, REJECTED, CANCELLED).

### Leave Day Calculation
Leave days are counted as **working days only**, using the `calendar` table:
```sql
SELECT COUNT(*) FROM calendar
WHERE calendar_date BETWEEN ? AND ? AND is_working_day = 1
```
Weekends are seeded as non-working. Public holidays can be added via the Admin Calendar page.

### Overlap Prevention
Before creating a request, a SQL check blocks any overlap with existing PENDING or APPROVED requests for the same user:
```sql
SELECT COUNT(*) FROM leave_requests
WHERE user_id = ? AND status IN ('PENDING','APPROVED')
  AND start_date <= ? AND end_date >= ?
```

### Balance Deduction
Leave balance (`used_days`) is only incremented when a request is **approved**, inside a database transaction. Rejection and cancellation do not affect the balance.

### SQL over Application Logic
All filtering, counting, pagination and aggregation is done in SQL — no JavaScript loops over result sets. Examples:
- Leave day count: `COUNT(*)` with `WHERE is_working_day = 1`
- Overlap check: date range intersection in SQL
- Balance calculation: `annual_allocation - used_days` computed in the SELECT
- Pagination: `LIMIT` / `OFFSET` in every list query

### Cancellation
Only **PENDING** requests can be cancelled. APPROVED or REJECTED requests cannot be cancelled (enforced in the backend).

### Manager Constraint
A manager cannot approve or reject their own leave request — enforced in the backend with `lr.user_id === req.user.id` check.

---

## Screens

| Screen                  | Path                        | Role              |
|-------------------------|-----------------------------|-------------------|
| Login                   | /login                      | Public            |
| Employee Dashboard      | /dashboard                  | Employee, Manager |
| Apply Leave             | /apply-leave                | Employee, Manager |
| My Requests             | /my-requests                | Employee, Manager |
| Request Activity        | /my-requests/:id/activity   | Employee, Manager |
| Team Requests           | /manager/requests           | Manager           |
| Review Request          | /manager/requests/:id       | Manager           |
| All Requests (Admin)    | /admin/requests             | Admin             |
| Request Detail (Admin)  | /admin/requests/:id         | Admin             |
| Employee Management     | /admin/employees            | Admin             |
| Edit Employee           | /admin/employees/:id/edit   | Admin             |
| Holiday Calendar        | /admin/calendar             | Admin             |

---

## Bonus Features Implemented

- **Working-day-aware leave calculation** via the `calendar` table
- **Holiday calendar** — Admin can mark any date as a holiday/non-working day
- **Pagination, filtering** on all list pages
- **Audit history** — every state change is logged in `leave_activities`
- **Manager/team-based access** — managers only see requests assigned to them
- **Multi-role support** — a user can hold multiple roles (e.g. manager + employee)

---

## AI Usage

Amazon Q Developer (AWS IDE plugin) was used to assist with:
- Debugging role-based access issues (roleset ID vs name mismatch)
- Fixing async error propagation in Express 4
- SQL query corrections (missing `annual_allocation` column, `JSON_CONTAINS` fix)

All core logic, schema design, business rules and architectural decisions were authored and are fully understood by the developer.
