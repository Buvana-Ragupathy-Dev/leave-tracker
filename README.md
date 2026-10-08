# Leave Tracker

A full-stack Leave Management application built with React, Node.js/Express, and MySQL.

## Project Structure

```
leave-tracker/
├── backend/
│   └── src/
│       ├── config/       # MySQL connection pool (mysql2/promise)
│       ├── controllers/  # authController, leaveController, managerController, adminController
│       ├── db/           # schema.sql, seed.sql, schema.js, seed.js
│       ├── middleware/   # authenticate, authorize, decryptId
│       ├── routes/       # auth.js, leave.js, manager.js, admin.js
│       └── utils/        # crypto.js (AES-128-CBC encrypt/decrypt for IDs)
└── frontend/
    └── src/
        ├── api/          # Axios client (attaches Bearer token, handles 401 redirect)
        ├── components/   # Navbar, ProtectedRoute
        ├── context/      # AuthContext (user, activeRole, login, logout, switchRole)
        ├── pages/
        │   ├── employee/ # Login, Dashboard, ApplyLeave, MyRequests, RequestActivity
        │   ├── manager/  # ManagerRequests, ManagerRequestDetail
        │   └── admin/    # AdminRequests, AdminRequestDetail, AdminEmployees, AdminEditEmployee, AdminCalendar
        └── utils/        # crypto.js (Web Crypto API AES-CBC), swal.js (SweetAlert2 helpers)
```

---

## Prerequisites

- Node.js >= 18
- MySQL >= 8.0

---

## Setup

### 1. Database

```bash
mysql -u root -p < backend/src/db/schema.sql
mysql -u root -p < backend/src/db/seed.sql
```

The seed automatically populates the `calendar` table with working/non-working days for the current year (Mon–Fri = working, Sat–Sun = non-working).

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # Fill in DB credentials and secrets
npm run dev
```

Server runs on http://localhost:5000

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

App runs on http://localhost:3000 (proxies `/api` calls to port 5000 via `package.json` proxy).

---

## Environment Variables

### Backend (`backend/.env`)

| Variable        | Description                                      | Example                            |
|-----------------|--------------------------------------------------|------------------------------------|
| PORT            | Backend port                                     | 5000                               |
| DB_HOST         | MySQL host                                       | localhost                          |
| DB_PORT         | MySQL port                                       | 3306                               |
| DB_USER         | MySQL user                                       | root                               |
| DB_PASSWORD     | MySQL password                                   | your_password                      |
| DB_NAME         | Database name                                    | leave_tracker                      |
| JWT_SECRET      | Secret key for signing JWT tokens                | a_long_random_string               |
| JWT_EXPIRES_IN  | Token expiry duration                            | 8h                                 |
| ENCRYPT_SECRET  | 32 hex chars (= 16 bytes) AES-128-CBC key        | 0123456789abcdef0123456789abcdef   |

### Frontend (`frontend/.env`)

| Variable                  | Description                               | Example                            |
|---------------------------|-------------------------------------------|------------------------------------|
| REACT_APP_ENCRYPT_SECRET  | Same 32 hex chars as backend ENCRYPT_SECRET | 0123456789abcdef0123456789abcdef |

> Both sides must use the **same** `ENCRYPT_SECRET` value so the frontend can encrypt IDs that the backend can decrypt.

---

## Default Credentials (from seed)

| Role              | Email                       | Password |
|-------------------|-----------------------------|----------|
| Admin             | arun.kumar@company.com      | password |
| Manager           | priya.sharma@company.com    | password |
| Manager + Admin   | rahul.verma@company.com     | password |
| Manager + Employee| meena.krishnan@company.com  | password |
| Employee          | karthik.raj@company.com     | password |
| Employee          | anitha.devi@company.com     | password |
| Employee          | vignesh.kumar@company.com   | password |
| Employee          | divya.ramesh@company.com    | password |
| Employee          | suresh.babu@company.com     | password |
| Employee          | nandhini.raj@company.com    | password |

> The seed uses a pre-generated bcrypt hash for `password`. To use a different password:
> ```js
> const bcrypt = require('bcryptjs');
> console.log(await bcrypt.hash('YourPassword', 10));
> ```
> Then replace the hash in `seed.sql`.

---

## Leave Type Allocations (from seed)

| Leave Type   | Annual Allocation |
|--------------|-------------------|
| Casual Leave | 12 days           |
| Sick Leave   | 12 days           |
| Earned Leave | 15 days           |

---

## Dependencies

### Backend
- `express` — REST API framework
- `mysql2` — MySQL client with promise support
- `jsonwebtoken` — JWT sign and verify
- `bcryptjs` — password hashing
- `dotenv` — environment variable loading
- `cors` — cross-origin request handling
- `nodemon` (dev) — auto-restart on file changes

### Frontend
- `react`, `react-dom` — UI framework
- `react-router-dom` — client-side routing
- `axios` — HTTP client
- `sweetalert2` — toast and confirm dialogs

---

## API Reference

| Method | Endpoint                                        | Role             | Description                          |
|--------|-------------------------------------------------|------------------|--------------------------------------|
| POST   | /api/auth/login                                 | Public           | Login, returns JWT                   |
| GET    | /api/me                                         | Authenticated    | Get current user profile             |
| GET    | /api/leave-balances                             | Employee/Manager | View own leave balances              |
| GET    | /api/leave-days-preview                         | Employee/Manager | Preview working days for a date range|
| GET    | /api/leave-requests                             | Employee/Manager | List own leave requests (paginated)  |
| POST   | /api/leave-requests                             | Employee/Manager | Submit a new leave request           |
| PATCH  | /api/leave-requests/:id/cancel                  | Request Owner    | Cancel a PENDING request             |
| GET    | /api/leave-requests/:id/activities              | Request Owner    | View audit trail for a request       |
| GET    | /api/manager/leave-requests                     | Manager          | List assigned team requests          |
| GET    | /api/manager/leave-requests/:id                 | Assigned Manager | View a specific assigned request     |
| PATCH  | /api/manager/leave-requests/:id/approve         | Assigned Manager | Approve a PENDING request            |
| PATCH  | /api/manager/leave-requests/:id/reject          | Assigned Manager | Reject a PENDING request             |
| GET    | /api/manager/leave-requests/:id/activities      | Assigned Manager | View audit trail for assigned request|
| GET    | /api/admin/leave-requests                       | Admin            | List all leave requests              |
| GET    | /api/admin/leave-requests/:id                   | Admin            | View any leave request               |
| GET    | /api/admin/leave-requests/:id/activities        | Admin            | View audit trail (admin view)        |
| GET    | /api/admin/employees                            | Admin            | List employees with search           |
| PATCH  | /api/admin/employees/:id                        | Admin            | Update employee name/role/roleset    |
| PATCH  | /api/admin/employees/:id/manager                | Admin            | Assign a manager to an employee      |
| GET    | /api/admin/calendar                             | Admin            | View working day calendar            |
| POST   | /api/admin/calendar                             | Admin            | Add or update a calendar entry       |
| PATCH  | /api/admin/calendar/:id                         | Admin            | Edit an existing calendar entry      |

All `:id` parameters in URLs are AES-128-CBC encrypted on the frontend and decrypted by the `decryptId` middleware on the backend, so database IDs are never exposed in the browser.

---

## Screens

| Screen                 | Path                      | Role              |
|------------------------|---------------------------|-------------------|
| Login                  | /login                    | Public            |
| Employee Dashboard     | /dashboard                | Employee, Manager |
| Apply Leave            | /apply-leave              | Employee, Manager |
| My Requests            | /my-requests              | Employee, Manager |
| Request Activity       | /my-requests/:id/activity | Employee, Manager |
| Team Requests          | /manager/requests         | Manager           |
| Review Request         | /manager/requests/:id     | Manager           |
| All Requests (Admin)   | /admin/requests           | Admin             |
| Request Detail (Admin) | /admin/requests/:id       | Admin             |
| Employee Management    | /admin/employees          | Admin             |
| Edit Employee          | /admin/employees/:id/edit | Admin             |
| Holiday Calendar       | /admin/calendar           | Admin             |

---

## Architecture & Key Decisions

### Authentication & Authorization
- JWT-based authentication. Token is stored in `localStorage` and attached as a `Bearer` header on every request via the Axios client.
- On a 401 response, the Axios interceptor clears the token and redirects to `/login` automatically.
- Each user has a `role` (primary, stored as a numeric FK) and a `roleset` (JSON array of numeric role IDs) to support multiple roles — e.g. a manager who is also an employee.
- At login and on `/me`, numeric role IDs are mapped to name strings (`employee`, `manager`, `admin`) so the frontend and middleware always work with names.
- `authorize(...roles)` checks `req.user.roleset` (array of names), so a user with multiple roles can access all their permitted routes.
- Express 4 does not catch async errors natively — the `Router.Layer` prototype is patched at startup to forward rejected promises to the global error handler.

### ID Obfuscation
- All record IDs are AES-128-CBC encrypted on the frontend (Web Crypto API) before being placed in URLs.
- The `decryptId` middleware decrypts `req.params.id` on every route that uses it, so the backend always works with plain integer IDs.
- Both sides share the same 32 hex char key (`ENCRYPT_SECRET` / `REACT_APP_ENCRYPT_SECRET`).
- This prevents users from guessing or enumerating resource IDs in the browser.

### Password Encryption in Transit
- The frontend encrypts the password with AES-128-CBC before sending it to `/api/auth/login`.
- The backend decrypts it, then compares against the bcrypt hash stored in the database.

### Database Design
- `roles` — lookup table: `employee` (1), `manager` (2), `admin` (3).
- `users` — `role` (FK to roles, primary role), `roleset` (JSON array of role IDs), `manager_id` (self-referencing FK), `deleted_at` (soft delete).
- `leave_types` — `name` and `annual_allocation` (days/year). Allocation is DB-configured, not hardcoded.
- `leave_balances` — one row per user per leave type, tracks `used_days` only. Available = `annual_allocation - used_days`, computed in SQL at query time. Unique constraint on `(user_id, leave_type_id)`.
- `calendar` — one row per date, `is_working_day` flag, optional `description`. Unique constraint on `calendar_date`. Seeded for the current year.
- `leave_requests` — snapshot of `assigned_manager_id` at creation time so manager reassignments don't affect in-flight requests. `status` is an ENUM: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`.
- `leave_activities` — append-only audit log. `action` is an ENUM: `CREATED`, `APPROVED`, `REJECTED`, `CANCELLED`.

### Leave Day Calculation
Leave days are counted as **working days only** using the `calendar` table:
```sql
SELECT COUNT(*) AS leave_days FROM calendar
WHERE calendar_date BETWEEN ? AND ? AND is_working_day = 1
```
Weekends are seeded as non-working. Public holidays can be added via the Admin Calendar page. The frontend calls `/api/leave-days-preview` to show the live working day count as the user picks dates.

### Overlap Prevention
Before creating a request, a SQL check blocks any overlap with existing PENDING or APPROVED requests for the same user:
```sql
SELECT COUNT(*) AS overlap FROM leave_requests
WHERE user_id = ? AND status IN ('PENDING','APPROVED')
  AND start_date <= ? AND end_date >= ?
```

### Balance Deduction
`used_days` is only incremented when a request is **approved**, inside a database transaction that also updates the request status. Rejection and cancellation do not affect the balance.

### SQL over Application Logic
All filtering, counting, pagination and aggregation is done in SQL — no JavaScript loops over result sets:
- Leave day count: `COUNT(*)` with `WHERE is_working_day = 1`
- Overlap check: date range intersection in SQL
- Balance calculation: `annual_allocation - used_days` in the `SELECT`
- Pagination: `LIMIT` / `OFFSET` in every list query
- Search: `LIKE` conditions in the `WHERE` clause
- Manager validation: `JSON_CONTAINS(roleset, '2', '$')` in SQL

### Cancellation
Only **PENDING** requests can be cancelled. APPROVED or REJECTED requests cannot be cancelled — enforced in the backend before any DB write.

### Manager Constraint
A manager cannot approve or reject their own leave request — enforced in the backend by comparing `lr.user_id` with `req.user.id`.

### Ticket Number Format
Each leave request gets a human-readable ticket number at creation time:
```
{TYPE_PREFIX}-{MM}/{YYYY}-{SEQUENCE}
e.g. CL-05/2026-00000001
```
The prefix is derived from the leave type name initials (CL = Casual Leave, SL = Sick Leave, EL = Earned Leave).

### Role Switching
Users with multiple roles (e.g. Manager + Employee) can switch their active role via the Navbar. The active role determines which navigation links and pages are shown. Role priority defaults to: `admin` > `manager` > `employee`.

---

## Bonus Features Implemented

- **Working-day-aware leave calculation** via the `calendar` table
- **Live working-day preview** on the Apply Leave form
- **Holiday calendar** — Admin can mark any date as a holiday/non-working day
- **Pagination, search, filtering** on all list pages
- **Audit history** — every state change is logged in `leave_activities`
- **Manager/team-based access** — managers only see requests assigned to them
- **Multi-role support** — a user can hold multiple roles (e.g. manager + employee) with role switching
- **ID obfuscation** — AES-128-CBC encrypted IDs in all URLs

---

## AI Usage

Amazon Q Developer (AWS IDE plugin) was used to assist with:
- Debugging role-based access issues (roleset numeric ID vs name string mismatch)
- Fixing async error propagation in Express 4 (Router.Layer prototype patch)
- SQL query corrections (missing `annual_allocation` column join, `JSON_CONTAINS` syntax)
- Reviewing completed implementation for requirement coverage

All core logic, schema design, business rules and architectural decisions were authored and are fully understood by the developer.
