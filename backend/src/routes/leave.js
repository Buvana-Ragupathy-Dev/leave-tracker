const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getLeaveBalances, getLeaveRequests, createLeaveRequest,
  cancelLeaveRequest, getLeaveActivities,
} = require('../controllers/leaveController');

router.use(authenticate, authorize('employee', 'manager'));

router.get('/leave-balances', getLeaveBalances);
router.get('/leave-requests', getLeaveRequests);
router.post('/leave-requests', createLeaveRequest);
router.patch('/leave-requests/:id/cancel', cancelLeaveRequest);
router.get('/leave-requests/:id/activities', getLeaveActivities);

module.exports = router;
