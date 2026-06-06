import { Router } from 'express';
import { getReviews, createReview, updateReview } from '../controllers/performanceController';
import { protect, authorize } from '../middleware/auth';

const router = Router();

router.use(protect);
router.get('/',      getReviews);
router.post('/',     authorize('admin', 'senior_manager'), createReview);
router.put('/:id',   authorize('admin', 'senior_manager'), updateReview);

export default router;