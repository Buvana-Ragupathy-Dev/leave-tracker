const db = require('../config/db');

async function getAssignedRequests(req, res) {
  const { status, search, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  const params = [req.user.id];
  let where = 'lr.assigned_manager_id = ?';
  if (status) { where += ' AND lr.status = ?'; params.push(status); }
  if (search) { where += ' AND (u.name LIKE ? OR lr.ticket_number LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  const [rows] = await db.query(
    `SELECT lr.id, lr.ticket_number, u.name AS employee_name, lt.name AS leave_type,
            lr.start_date, lr.end_date, lr.leave_days, lr.status, lr.created_at
     FROM leave_requests lr
     JOIN users u ON u.id = lr.user_id
     JOIN leave_types lt ON lt.id = lr.leave_type_id
     WHERE ${where}
     ORDER BY lr.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM leave_requests lr
     JOIN users u ON u.id = lr.user_id
     WHERE ${where}`, params
  );
  res.json({ data: rows, total, page: Number(page), limit: Number(limit) });
}

async function getAssignedRequestById(req, res) {
  const { id } = req.params;
  const [[lr]] = await db.query(
    `SELECT lr.*, u.name AS employee_name, lt.name AS leave_type
     FROM leave_requests lr
     JOIN users u ON u.id = lr.user_id
     JOIN leave_types lt ON lt.id = lr.leave_type_id
     WHERE lr.id = ? AND lr.assigned_manager_id = ?`,
    [id, req.user.id]
  );
  if (!lr) return res.status(404).json({ message: 'Leave request not found or not assigned to you' });
  res.json(lr);
}

async function approveRequest(req, res) {
  const { id } = req.params;
  const [[lr]] = await db.query(
    'SELECT id, user_id, assigned_manager_id, status, leave_type_id, leave_days FROM leave_requests WHERE id = ?',
    [id]
  );
  if (!lr) return res.status(404).json({ message: 'Leave request not found' });
  if (lr.assigned_manager_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  if (lr.user_id === req.user.id) return res.status(403).json({ message: 'Cannot approve your own leave request' });
  if (lr.status !== 'PENDING') return res.status(409).json({ message: `Request is already ${lr.status}` });

  const { remarks } = req.body;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `UPDATE leave_requests SET status = 'APPROVED', reviewed_by = ?, reviewed_at = NOW(), updated_at = NOW() WHERE id = ?`,
      [req.user.id, id]
    );
    await conn.query(
      `UPDATE leave_balances SET used_days = used_days + ? WHERE user_id = ? AND leave_type_id = ?`,
      [lr.leave_days, lr.user_id, lr.leave_type_id]
    );
    await conn.query(
      `INSERT INTO leave_activities (leave_request_id, action, performed_by, remarks) VALUES (?, 'APPROVED', ?, ?)`,
      [id, req.user.id, remarks || null]
    );
    await conn.commit();
    res.json({ message: 'Leave request approved' });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function rejectRequest(req, res) {
  const { id } = req.params;
  const { rejection_reason } = req.body;
  if (!rejection_reason) return res.status(400).json({ message: 'rejection_reason is required' });

  const [[lr]] = await db.query(
    'SELECT id, user_id, assigned_manager_id, status FROM leave_requests WHERE id = ?', [id]
  );
  if (!lr) return res.status(404).json({ message: 'Leave request not found' });
  if (lr.assigned_manager_id !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
  if (lr.user_id === req.user.id) return res.status(403).json({ message: 'Cannot reject your own leave request' });
  if (lr.status !== 'PENDING') return res.status(409).json({ message: `Request is already ${lr.status}` });

  await db.query(
    `UPDATE leave_requests SET status = 'REJECTED', reviewed_by = ?, reviewed_at = NOW(), rejection_reason = ?, updated_at = NOW() WHERE id = ?`,
    [req.user.id, rejection_reason, id]
  );
  await db.query(
    `INSERT INTO leave_activities (leave_request_id, action, performed_by, remarks) VALUES (?, 'REJECTED', ?, ?)`,
    [id, req.user.id, rejection_reason]
  );
  res.json({ message: 'Leave request rejected' });
}


async function getRequestActivities(req, res) {
  const { id } = req.params;
  const [[lr]] = await db.query(
    'SELECT id FROM leave_requests WHERE id = ? AND assigned_manager_id = ?',
    [id, req.user.id]
  );
  if (!lr) return res.status(404).json({ message: 'Leave request not found or not assigned to you' });
  const [activities] = await db.query(
    `SELECT la.action, u.name AS performed_by, la.remarks, la.created_at
     FROM leave_activities la
     JOIN users u ON u.id = la.performed_by
     WHERE la.leave_request_id = ?
     ORDER BY la.created_at ASC`,
    [id]
  );
  res.json(activities);
}

module.exports = { getAssignedRequests, getAssignedRequestById, approveRequest, rejectRequest, getRequestActivities };
