import express from 'express';
import { 
  uploadDocument, 
  getDocuments, 
  getDocumentById, 
  updateDocument, 
  deleteDocument, 
  downloadDocument,
  getClientDocuments,
  upload 
} from '../controllers/documentController.js';
import { authenticate, restrict } from '../auth/verifyToken.js';

const router = express.Router();

// Upload document - accessible by both citizens and lawyers
router.post('/', authenticate, restrict(['citizen', 'lawyer']), upload.single('file'), uploadDocument);

// Get all documents for user - accessible by both citizens and lawyers
router.get('/', authenticate, restrict(['citizen', 'lawyer']), getDocuments);

// Get document by ID - accessible by both citizens and lawyers
router.get('/:id', authenticate, restrict(['citizen', 'lawyer']), getDocumentById);

// Update document - accessible by both citizens and lawyers
router.put('/:id', authenticate, restrict(['citizen', 'lawyer']), updateDocument);

// Delete document - accessible by both citizens and lawyers
router.delete('/:id', authenticate, restrict(['citizen', 'lawyer']), deleteDocument);

// Download document - accessible by both citizens and lawyers
router.get('/:id/download', authenticate, restrict(['citizen', 'lawyer']), downloadDocument);

// Get client documents for lawyers - only accessible by lawyers
router.get('/clients/all', authenticate, restrict(['lawyer']), getClientDocuments);

export default router;
