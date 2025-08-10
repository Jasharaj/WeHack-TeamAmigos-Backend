import express from 'express';
import { 
  createReminder, 
  getReminders, 
  getReminderById, 
  updateReminder, 
  deleteReminder,
  toggleReminderCompletion 
} from '../controllers/reminderController.js';
import { authenticate, restrict } from '../auth/verifyToken.js';

const router = express.Router();

// Create reminder - accessible by both citizens and lawyers
router.post('/', authenticate, restrict(['citizen', 'lawyer']), createReminder);

// Get all reminders for user - accessible by both citizens and lawyers
router.get('/', authenticate, restrict(['citizen', 'lawyer']), getReminders);

// Get reminder by ID - accessible by both citizens and lawyers
router.get('/:id', authenticate, restrict(['citizen', 'lawyer']), getReminderById);

// Update reminder - accessible by both citizens and lawyers
router.put('/:id', authenticate, restrict(['citizen', 'lawyer']), updateReminder);

// Delete reminder - accessible by both citizens and lawyers
router.delete('/:id', authenticate, restrict(['citizen', 'lawyer']), deleteReminder);

// Toggle reminder completion - accessible by both citizens and lawyers
router.patch('/:id/toggle', authenticate, restrict(['citizen', 'lawyer']), toggleReminderCompletion);

export default router;
