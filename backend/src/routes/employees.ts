import { Router } from 'express';
import { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee } from '../controllers/employeeController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect);
router.get('/',     getEmployees);
router.get('/:id',  getEmployee);
router.post('/',    authorize('admin', 'hr_recruiter'), createEmployee);
router.put('/:id',  authorize('admin', 'hr_recruiter'), updateEmployee);
router.delete('/:id', authorize('admin'), deleteEmployee);

export default router;


