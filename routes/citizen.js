import express from 'express';
import { getCitizenProfile, updateCitizenProfile, getCitizenCases } from '../controllers/citizenController.js';
import { authenticate, restrict } from '../auth/verifyToken.js';

const router = express.Router();

// Protected routes - require authentication
router.get('/profile', authenticate, restrict(['citizen']), getCitizenProfile);
router.put('/profile', authenticate, restrict(['citizen']), updateCitizenProfile);
router.get('/cases', authenticate, restrict(['citizen']), getCitizenCases);

export default router;