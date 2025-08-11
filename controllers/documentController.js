import Document from '../models/DocumentSchema.js';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { CloudinaryStorage } from '@fluidjs/multer-cloudinary';

// Configure multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'casepilot/documents',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt', 'xlsx', 'xls'],
    resource_type: 'auto'
  }
});

export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Upload document
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { title, description, category, tags, caseId } = req.body;
    const userId = req.userId;
    const userRole = req.role;

    const document = new Document({
      title,
      description,
      category,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      filePath: req.file.path, // Cloudinary URL
      cloudinaryPublicId: req.file.filename, // Cloudinary public ID
      uploadedBy: userId,
      uploaderModel: userRole === 'citizen' ? 'Citizen' : 'Lawyer',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      caseId: caseId || null,
      shareSettings: {
        isPublic: false,
        sharedWith: [],
        shareableLink: null
      }
    });

    await document.save();

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document'
    });
  }
};

// Get all documents for user
export const getDocuments = async (req, res) => {
  try {
    const userId = req.userId;
    
    const documents = await Document.find({ uploadedBy: userId })
      .populate('caseId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Documents fetched successfully',
      data: documents
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents'
    });
  }
};

// Get document by ID
export const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const document = await Document.findOne({ 
      _id: id, 
      uploadedBy: userId 
    }).populate('caseId', 'title');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Document fetched successfully',
      data: document
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document'
    });
  }
};

// Update document
export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, tags, status } = req.body;
    const userId = req.userId;

    const document = await Document.findOneAndUpdate(
      { _id: id, uploadedBy: userId },
      {
        title,
        description,
        category,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        status,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('caseId', 'title');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Document updated successfully',
      data: document
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to update document'
    });
  }
};

// Delete document
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const document = await Document.findOneAndDelete({ 
      _id: id, 
      uploadedBy: userId 
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete file from Cloudinary
    if (document.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(document.cloudinaryPublicId);
      } catch (cloudinaryError) {
        console.error('Failed to delete from Cloudinary:', cloudinaryError);
        // Continue anyway, document deleted from database
      }
    }

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document'
    });
  }
};

// Download document
export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const document = await Document.findOne({ 
      _id: id, 
      uploadedBy: userId 
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // For Cloudinary, we just redirect to the secure URL
    res.json({
      success: true,
      message: 'Document download link',
      data: {
        downloadUrl: document.filePath,
        fileName: document.fileName,
        fileType: document.fileType
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to download document'
    });
  }
};

// Get client documents for lawyers (documents from their assigned cases)
export const getClientDocuments = async (req, res) => {
  try {
    const lawyerId = req.userId;
    const userRole = req.role;
    
    if (userRole !== 'lawyer') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only lawyers can access client documents.'
      });
    }

    // Import Case model
    const Case = (await import('../models/CaseSchema.js')).default;
    
    // Find all cases assigned to this lawyer
    const lawyerCases = await Case.find({ lawyer: lawyerId }).select('_id citizen');
    const caseIds = lawyerCases.map(caseItem => caseItem._id);
    const clientIds = lawyerCases.map(caseItem => caseItem.citizen);

    // Find documents from these cases or uploaded by these clients
    const documents = await Document.find({
      $or: [
        { caseId: { $in: caseIds } },
        { uploadedBy: { $in: clientIds }, uploaderModel: 'Citizen' }
      ]
    })
    .populate('caseId', 'title')
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Client documents fetched successfully',
      data: documents
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch client documents'
    });
  }
};
