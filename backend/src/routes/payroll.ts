import { Router } from 'express';
import { getPayrolls, generatePayroll, markAsPaid } from '../controllers/payrollController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect);
router.get('/',           getPayrolls);
router.post('/generate',  authorize('admin'), generatePayroll);
router.put('/:id/pay',    authorize('admin'), markAsPaid);

export default router;