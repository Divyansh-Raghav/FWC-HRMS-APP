import { Router } from 'express';
import { getJobs, createJob, updateJob, addApplication, updateApplication } from '../controllers/recruitmentController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect);
router.get('/',                                    getJobs);
router.post('/',    authorize('admin', 'hr_recruiter'), createJob);
router.put('/:id',  authorize('admin', 'hr_recruiter'), updateJob);
router.post('/:id/apply',                          addApplication);
router.put('/:jobId/applications/:appId',          authorize('admin', 'hr_recruiter'), updateApplication);

export default router;