import express from 'express';
import { 
  createReport, 
  getReports, 
  getReportById, 
  updateReport, 
  deleteReport,
  shareReport,
  finalizeReport,
  getSharedReports 
} from '../controllers/reportController.js';
import { authenticate, restrict } from '../auth/verifyToken.js';

const router = express.Router();

// Create report - accessible by both citizens and lawyers
router.post('/', authenticate, restrict(['citizen', 'lawyer']), createReport);

// Get all reports for user - accessible by both citizens and lawyers
router.get('/', authenticate, restrict(['citizen', 'lawyer']), getReports);

// Get report by ID - accessible by both citizens and lawyers
router.get('/:id', authenticate, restrict(['citizen', 'lawyer']), getReportById);

// Update report - accessible by both citizens and lawyers
router.put('/:id', authenticate, restrict(['citizen', 'lawyer']), updateReport);

// Delete report - accessible by both citizens and lawyers
router.delete('/:id', authenticate, restrict(['citizen', 'lawyer']), deleteReport);

// Share report - accessible by both citizens and lawyers
router.post('/:id/share', authenticate, restrict(['citizen', 'lawyer']), shareReport);

// Finalize report - accessible by both citizens and lawyers
router.patch('/:id/finalize', authenticate, restrict(['citizen', 'lawyer']), finalizeReport);

// Get shared reports for clients - only accessible by citizens
router.get('/shared/all', authenticate, restrict(['citizen']), getSharedReports);

export default router;
