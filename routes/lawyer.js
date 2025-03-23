import express from 'express';
import { getLawyerProfile, updateLawyerProfile, getAssignedCases, getAllLawyers } from '../controllers/lawyerController.js';
import { authenticate, restrict } from '../auth/verifyToken.js';

const router = express.Router();

// Protected routes - require authentication
router.get('/profile', authenticate, restrict(['lawyer']), getLawyerProfile);
router.put('/profile', authenticate, restrict(['lawyer']), updateLawyerProfile);
router.get('/cases', authenticate, restrict(['lawyer']), getAssignedCases);

// Get all lawyers for dropdown selection - accessible by citizens
router.get('/all', authenticate, restrict(['citizen']), getAllLawyers);

export default router;