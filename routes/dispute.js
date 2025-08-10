import express from 'express';
import { 
  createIntegratedDispute,
  getIntegratedDisputes,
  acceptDisputeAssignment,
  addDisputeMessage,
  createCaseFromDispute,
  getDisputeDashboard
} from '../controllers/disputeController.js';
import { authenticate } from '../auth/verifyToken.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Dashboard and overview
router.get('/dashboard', getDisputeDashboard);
router.get('/', getIntegratedDisputes);

// Dispute management
router.post('/create', createIntegratedDispute);
router.put('/:id/accept', acceptDisputeAssignment);
router.post('/:id/messages', addDisputeMessage);
router.post('/:id/create-case', createCaseFromDispute);

export default router;
