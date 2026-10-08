const db = require('../config/db');

// --- Leave Requests ---
async function getAllLeaveRequests(req, res) {
  const { status, user_id, search, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  const params = [];
  const conditions = [];
  if (status) { conditions.push('lr.status = ?'); params.push(status); }
  if (user_id) { conditions.push('lr.user_id = ?'); params.push(user_id); }
  if (search) { conditions.push('(u.name LIKE ? OR lr.ticket_number LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await db.query(
    `SELECT lr.id, lr.ticket_number, u.name AS employee_name, lt.name AS leave_type,
            lr.start_date, lr.end_date, lr.leave_days, lr.status, lr.created_at
     FROM leave_requests lr
     JOIN users u ON u.id = lr.user_id
     JOIN leave_types lt ON lt.id = lr.leave_type_id
     ${where}
     ORDER BY lr.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM leave_requests lr
     JOIN users u ON u.id = lr.user_id
     ${where}`, params
  );
  res.json({ data: rows, total, page: Number(page), limit: Number(limit) });
}

async function getLeaveRequestById(req, res) {
  const [[lr]] = await db.query(
    `SELECT lr.*, u.name AS employee_name, lt.name AS leave_type,
            m.name AS manager_name, r.name AS reviewed_by_name
     FROM leave_requests lr
     JOIN users u ON u.id = lr.user_id
     JOIN leave_types lt ON lt.id = lr.leave_type_id
     LEFT JOIN users m ON m.id = lr.assigned_manager_id
     LEFT JOIN users r ON r.id = lr.reviewed_by
     WHERE lr.id = ?`,
    [req.params.id]
  );
  if (!lr) return res.status(404).json({ message: 'Leave request not found' });
  res.json(lr);
}

async function getLeaveRequestActivities(req, res) {
  const [rows] = await db.query(
    `SELECT la.action, u.name AS performed_by, la.remarks, la.created_at
     FROM leave_activities la
     JOIN users u ON u.id = la.performed_by
     WHERE la.leave_request_id = ?
     ORDER BY la.created_at ASC`,
    [req.params.id]
  );
  res.json(rows);
}

// --- Employees ---
const ROLE_NAMES = { 1: 'employee', 2: 'manager', 3: 'admin' };

async function getEmployees(req, res) {
  const { search, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  const params = [];
  let where = 'WHERE u.deleted_at IS NULL';
  if (search) { where += ' AND (u.name LIKE ? OR u.email LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  const [rows] = await db.query(
    `SELECT u.id, u.name, u.email, u.role, u.roleset, u.manager_id, m.name AS manager_name, u.created_at
     FROM users u
     LEFT JOIN users m ON m.id = u.manager_id
     ${where}
     ORDER BY u.name ASC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM users u ${where}`, params
  );

  // Map numeric role/roleset to name strings
  const mapped = rows.map((r) => {
    const rsRaw = typeof r.roleset === 'string' ? JSON.parse(r.roleset) : (r.roleset || []);
    return {
      ...r,
      role: ROLE_NAMES[r.role] || r.role,
      roleset: rsRaw.map((id) => ROLE_NAMES[id] || id),
    };
  });

  res.json({ data: mapped, total, page: Number(page), limit: Number(limit) });
}

async function updateEmployee(req, res) {
  const { id } = req.params;
  const { name, role, roleset } = req.body;
  const [[emp]] = await db.query('SELECT id FROM users WHERE id = ? AND deleted_at IS NULL', [id]);
  if (!emp) return res.status(404).json({ message: 'Employee not found' });

  const ROLE_IDS = { employee: 1, manager: 2, admin: 3 };

  const fields = [];
  const params = [];
  if (name) { fields.push('name = ?'); params.push(name); }
  if (role) { fields.push('role = ?'); params.push(ROLE_IDS[role] ?? role); }
  if (roleset) {
    const rolesetIds = roleset.map((r) => ROLE_IDS[r] ?? r);
    fields.push('roleset = ?'); params.push(JSON.stringify(rolesetIds));
  }
  if (!fields.length) return res.status(400).json({ message: 'No fields to update' });

  params.push(id);
  await db.query(`UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`, params);
  res.json({ message: 'Employee updated' });
}

async function updateEmployeeManager(req, res) {
  const { id } = req.params;
  const { manager_id } = req.body;

  const [[emp]] = await db.query('SELECT id FROM users WHERE id = ? AND deleted_at IS NULL', [id]);
  if (!emp) return res.status(404).json({ message: 'Employee not found' });

  if (manager_id !== null && manager_id !== undefined) {
    const [[mgr]] = await db.query(
      `SELECT id FROM users WHERE id = ? AND deleted_at IS NULL AND JSON_CONTAINS(roleset, '2', '$')`,
      [manager_id]
    );
    if (!mgr) return res.status(400).json({ message: 'Invalid manager: user not found or does not have manager role' });
  }

  await db.query('UPDATE users SET manager_id = ?, updated_at = NOW() WHERE id = ?', [manager_id ?? null, id]);
  res.json({ message: 'Manager updated' });
}

// --- Calendar ---
async function getCalendar(req, res) {
  const { year, month } = req.query;
  let where = '';
  const params = [];
  if (year && month) {
    where = 'WHERE YEAR(calendar_date) = ? AND MONTH(calendar_date) = ?';
    params.push(year, month);
  } else if (year) {
    where = 'WHERE YEAR(calendar_date) = ?';
    params.push(year);
  }
  const [rows] = await db.query(
    `SELECT id, calendar_date, is_working_day, description FROM calendar ${where} ORDER BY calendar_date ASC`,
    params
  );
  res.json(rows);
}

async function createCalendarEntry(req, res) {
  const { calendar_date, is_working_day, description } = req.body;
  if (!calendar_date || is_working_day === undefined)
    return res.status(400).json({ message: 'calendar_date and is_working_day are required' });

  await db.query(
    `INSERT INTO calendar (calendar_date, is_working_day, description) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE is_working_day = VALUES(is_working_day), description = VALUES(description), updated_at = NOW()`,
    [calendar_date, is_working_day, description ?? null]
  );
  res.status(201).json({ message: 'Calendar entry saved' });
}

async function updateCalendarEntry(req, res) {
  const { id } = req.params;
  const { is_working_day, description } = req.body;
  const [[entry]] = await db.query('SELECT id FROM calendar WHERE id = ?', [id]);
  if (!entry) return res.status(404).json({ message: 'Calendar entry not found' });

  const fields = [];
  const params = [];
  if (is_working_day !== undefined) { fields.push('is_working_day = ?'); params.push(is_working_day); }
  if (description !== undefined) { fields.push('description = ?'); params.push(description); }
  if (!fields.length) return res.status(400).json({ message: 'No fields to update' });

  params.push(id);
  await db.query(`UPDATE calendar SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`, params);
  res.json({ message: 'Calendar entry updated' });
}

module.exports = {
  getAllLeaveRequests, getLeaveRequestById, getLeaveRequestActivities,
  getEmployees, updateEmployee, updateEmployeeManager,
  getCalendar, createCalendarEntry, updateCalendarEntry,
};
