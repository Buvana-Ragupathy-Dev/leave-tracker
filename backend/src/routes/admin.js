const router = require('express').Router();
const { authenticate, authorize, decryptId } = require('../middleware/auth');
const {
  getAllLeaveRequests, getLeaveRequestById, getLeaveRequestActivities,
  getEmployees, updateEmployee, updateEmployeeManager,
  getCalendar, createCalendarEntry, updateCalendarEntry,
} = require('../controllers/adminController');

router.use(authenticate, authorize('admin'));

router.get('/leave-requests', getAllLeaveRequests);
router.get('/leave-requests/:id', decryptId, getLeaveRequestById);
router.get('/leave-requests/:id/activities', decryptId, getLeaveRequestActivities);

router.get('/employees', getEmployees);
router.patch('/employees/:id', decryptId, updateEmployee);
router.patch('/employees/:id/manager', decryptId, updateEmployeeManager);

router.get('/calendar', getCalendar);
router.post('/calendar', createCalendarEntry);
router.patch('/calendar/:id', decryptId, updateCalendarEntry);

module.exports = router;
