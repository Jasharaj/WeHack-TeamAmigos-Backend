import express from 'express';
import { createCase, getAllCases, getCaseById, updateCase, assignLawyer } from '../controllers/caseController.js';
import { authenticate, restrict } from '../auth/verifyToken.js';

const router = express.Router();

// Create a new case - only citizens can create cases
router.post('/', authenticate, restrict(['citizen']), createCase);

// Get all cases - accessible by both lawyers and citizens
router.get('/', authenticate, restrict(['citizen', 'lawyer']), getAllCases);

// Get case by ID - accessible by both lawyers and citizens
router.get('/:id', authenticate, restrict(['citizen', 'lawyer']), getCaseById);

// Update case - accessible by both lawyers and citizens
router.put('/:id', authenticate, restrict(['citizen', 'lawyer']), updateCase);

// Assign lawyer to case (Accept/Reject) - only lawyers can accept/reject cases
router.put('/:id/assign', authenticate, restrict(['lawyer']), assignLawyer);

export default router;