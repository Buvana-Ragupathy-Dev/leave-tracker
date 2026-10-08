const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getAssignedRequests, getApprovedTickets, getAssignedRequestById, approveRequest, rejectRequest,
} = require('../controllers/managerController');

router.use(authenticate, authorize('manager'));

router.get('/leave-requests', getAssignedRequests);
router.get('/approved-tickets', getApprovedTickets);
router.get('/leave-requests/:id', getAssignedRequestById);
router.patch('/leave-requests/:id/approve', approveRequest);
router.patch('/leave-requests/:id/reject', rejectRequest);

module.exports = router;
