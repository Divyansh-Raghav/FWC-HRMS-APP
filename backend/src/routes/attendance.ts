import { Router } from 'express';
import { getAttendance, clockIn, clockOut, getLeaves, applyLeave, updateLeaveStatus } from '../controllers/attendanceController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect);
router.get('/',           getAttendance);
router.post('/clock-in',  clockIn);
router.post('/clock-out', clockOut);
router.get('/leaves',     getLeaves);
router.post('/leaves',    applyLeave);
router.put('/leaves/:id', authorize('admin', 'senior_manager', 'hr_recruiter'), updateLeaveStatus);

export default router;