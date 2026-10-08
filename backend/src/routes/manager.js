const router = require('express').Router();
const { authenticate, authorize, decryptId } = require('../middleware/auth');
const {
  getAssignedRequests, getAssignedRequestById, approveRequest, rejectRequest, getRequestActivities,
} = require('../controllers/managerController');

router.use(authenticate, authorize('manager'));

router.get('/leave-requests', getAssignedRequests);
router.get('/leave-requests/:id', decryptId, getAssignedRequestById);
router.patch('/leave-requests/:id/approve', decryptId, approveRequest);
router.patch('/leave-requests/:id/reject', decryptId, rejectRequest);
router.get('/leave-requests/:id/activities', decryptId, getRequestActivities);

module.exports = router;
