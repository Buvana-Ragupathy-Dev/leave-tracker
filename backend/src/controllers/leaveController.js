const db = require('../config/db');

async function getLeaveBalances(req, res) {
  const [rows] = await db.query(
    `SELECT lt.name AS leave_type, lb.allocated_days, lb.used_days,
            (lb.allocated_days - lb.used_days) AS remaining_days
     FROM leave_balances lb
     JOIN leave_types lt ON lt.id = lb.leave_type_id
     WHERE lb.user_id = ? AND lt.deleted_at IS NULL`,
    [req.user.id]
  );
  res.json(rows);
}

async function getLeaveRequests(req, res) {
  const { status, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  const params = [req.user.id];
  let where = 'lr.user_id = ?';
  if (status) { where += ' AND lr.status = ?'; params.push(status); }

  const [rows] = await db.query(
    `SELECT lr.id, lr.ticket_number, lt.name AS leave_type, lr.start_date, lr.end_date,
            lr.leave_days, lr.status, lr.created_at
     FROM leave_requests lr
     JOIN leave_types lt ON lt.id = lr.leave_type_id
     WHERE ${where}
     ORDER BY lr.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM leave_requests lr WHERE ${where}`, params
  );
  res.json({ data: rows, total, page: Number(page), limit: Number(limit) });
}

async function createLeaveRequest(req, res) {
  const { leave_type_id, start_date, end_date, reason } = req.body;
  if (!leave_type_id || !start_date || !end_date || !reason)
    return res.status(400).json({ message: 'leave_type_id, start_date, end_date and reason are required' });

  if (new Date(end_date) < new Date(start_date))
    return res.status(400).json({ message: 'end_date must be on or after start_date' });

  // Count working days in range
  const [[{ leave_days }]] = await db.query(
    `SELECT COUNT(*) AS leave_days FROM calendar
     WHERE calendar_date BETWEEN ? AND ? AND is_working_day = 1`,
    [start_date, end_date]
  );
  if (leave_days === 0)
    return res.status(400).json({ message: 'Selected period contains no working days' });

  // Check overlap with PENDING or APPROVED
  const [[{ overlap }]] = await db.query(
    `SELECT COUNT(*) AS overlap FROM leave_requests
     WHERE user_id = ? AND status IN ('PENDING','APPROVED')
       AND start_date <= ? AND end_date >= ?`,
    [req.user.id, end_date, start_date]
  );
  if (overlap > 0)
    return res.status(409).json({ message: 'Leave request overlaps an existing pending or approved request' });

  // Check balance
  const [[balance]] = await db.query(
    `SELECT allocated_days - used_days AS remaining FROM leave_balances
     WHERE user_id = ? AND leave_type_id = ?`,
    [req.user.id, leave_type_id]
  );
  if (!balance) return res.status(400).json({ message: 'Leave type not found for this employee' });
  if (balance.remaining < leave_days)
    return res.status(400).json({ message: `Insufficient leave balance. Available: ${balance.remaining}, Requested: ${leave_days}` });

  // Get assigned manager
  const [[emp]] = await db.query('SELECT manager_id FROM users WHERE id = ?', [req.user.id]);
  const assigned_manager_id = emp?.manager_id ?? null;

  const ticket_number = `LV-${Date.now()}`;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      `INSERT INTO leave_requests (ticket_number, user_id, assigned_manager_id, leave_type_id, start_date, end_date, leave_days, reason, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [ticket_number, req.user.id, assigned_manager_id, leave_type_id, start_date, end_date, leave_days, reason]
    );
    await conn.query(
      `INSERT INTO leave_activities (leave_request_id, action, performed_by, remarks) VALUES (?, 'CREATED', ?, ?)`,
      [result.insertId, req.user.id, reason]
    );
    await conn.commit();
    res.status(201).json({ id: result.insertId, ticket_number, leave_days });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function cancelLeaveRequest(req, res) {
  const { id } = req.params;
  const [[lr]] = await db.query(
    'SELECT id, user_id, status FROM leave_requests WHERE id = ?', [id]
  );
  if (!lr) return res.status(404).json({ message: 'Leave request not found' });
  if (lr.user_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  if (lr.status !== 'PENDING') return res.status(409).json({ message: `Cannot cancel a ${lr.status} request` });

  await db.query(
    `UPDATE leave_requests SET status = 'CANCELLED', updated_at = NOW() WHERE id = ?`, [id]
  );
  await db.query(
    `INSERT INTO leave_activities (leave_request_id, action, performed_by) VALUES (?, 'CANCELLED', ?)`,
    [id, req.user.id]
  );
  res.json({ message: 'Leave request cancelled' });
}

async function getLeaveActivities(req, res) {
  const { id } = req.params;
  const [[lr]] = await db.query(
    'SELECT id, user_id FROM leave_requests WHERE id = ?', [id]
  );
  if (!lr) return res.status(404).json({ message: 'Leave request not found' });
  if (lr.user_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

  const [rows] = await db.query(
    `SELECT la.action, u.name AS performed_by, la.remarks, la.created_at
     FROM leave_activities la
     JOIN users u ON u.id = la.performed_by
     WHERE la.leave_request_id = ?
     ORDER BY la.created_at ASC`,
    [id]
  );
  res.json(rows);
}

module.exports = { getLeaveBalances, getLeaveRequests, createLeaveRequest, cancelLeaveRequest, getLeaveActivities };
