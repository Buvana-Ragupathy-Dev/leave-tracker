const router = require('express').Router();
const { authenticate, authorize, decryptId } = require('../middleware/auth');
const {
  getLeaveBalances, getLeaveRequests, createLeaveRequest,
  cancelLeaveRequest, getLeaveActivities, getLeaveDaysPreview,
} = require('../controllers/leaveController');

router.use(authenticate, authorize('employee', 'manager'));

router.get('/leave-balances', getLeaveBalances);
router.get('/leave-days-preview', getLeaveDaysPreview);
router.get('/leave-requests', getLeaveRequests);
router.post('/leave-requests', createLeaveRequest);
router.patch('/leave-requests/:id/cancel', decryptId, cancelLeaveRequest);
router.get('/leave-requests/:id/activities', decryptId, getLeaveActivities);

module.exports = router;
