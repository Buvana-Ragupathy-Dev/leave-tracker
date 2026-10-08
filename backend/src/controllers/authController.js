const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  const [[user]] = await db.query(
    'SELECT id, name, email, password, role, roleset, manager_id FROM users WHERE email = ? AND deleted_at IS NULL',
    [email]
  );
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const roleIds = typeof user.roleset === 'string' ? JSON.parse(user.roleset) : user.roleset;
  const [roleRows] = await db.query('SELECT id, name FROM roles WHERE id IN (?)', [roleIds]);
  const roleMap = {};
  roleRows.forEach(r => { roleMap[r.id] = r.name; });
  const roleset = roleIds.map(id => roleMap[id]).filter(Boolean);

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role, roleset },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, roleset } });
}

async function getMe(req, res) {
  const [[user]] = await db.query(
    'SELECT id, name, email, role, roleset, manager_id FROM users WHERE id = ? AND deleted_at IS NULL',
    [req.user.id]
  );
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.roleset = typeof user.roleset === 'string' ? JSON.parse(user.roleset) : user.roleset;
  res.json(user);
}

module.exports = { login, getMe };
