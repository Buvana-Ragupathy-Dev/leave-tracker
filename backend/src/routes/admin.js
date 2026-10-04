const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getAllLeaveRequests, getLeaveRequestById, getLeaveRequestActivities,
  getEmployees, updateEmployee, updateEmployeeManager,
  getCalendar, createCalendarEntry, updateCalendarEntry,
} = require('../controllers/adminController');

router.use(authenticate, authorize('admin'));

router.get('/leave-requests', getAllLeaveRequests);
router.get('/leave-requests/:id', getLeaveRequestById);
router.get('/leave-requests/:id/activities', getLeaveRequestActivities);

router.get('/employees', getEmployees);
router.patch('/employees/:id', updateEmployee);
router.patch('/employees/:id/manager', updateEmployeeManager);

router.get('/calendar', getCalendar);
router.post('/calendar', createCalendarEntry);
router.patch('/calendar/:id', updateCalendarEntry);

module.exports = router;
