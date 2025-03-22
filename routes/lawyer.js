import express from 'express';
import { getLawyerProfile, updateLawyerProfile, getAssignedCases } from '../controllers/lawyerController.js';
import { authenticate, restrict } from '../auth/verifyToken.js';

const router = express.Router();

// Protected routes - require authentication
router.get('/profile', authenticate, restrict(['lawyer']), getLawyerProfile);
router.put('/profile', authenticate, restrict(['lawyer']), updateLawyerProfile);
router.get('/cases', authenticate, restrict(['lawyer']), getAssignedCases);

export default router;