import Report from '../models/ReportSchema.js';

// Create report
export const createReport = async (req, res) => {
  try {
    const { title, content, reportType, caseId, caseName, tags } = req.body;
    const userId = req.userId;
    const userRole = req.role;

    const report = new Report({
      title,
      content,
      reportType,
      createdBy: userId,
      creatorModel: userRole === 'citizen' ? 'Citizen' : 'Lawyer',
      caseId: caseId || null,
      caseName,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });

    await report.save();

    const populatedReport = await Report.findById(report._id)
      .populate('caseId', 'title')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: populatedReport
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to create report'
    });
  }
};

// Get all reports for user
export const getReports = async (req, res) => {
  try {
    const userId = req.userId;
    const { status, reportType } = req.query;

    let filter = { 
      $or: [
        { createdBy: userId },
        { 'sharedWith.userId': userId }
      ]
    };

    if (status) filter.status = status;
    if (reportType) filter.reportType = reportType;

    const reports = await Report.find(filter)
      .populate('caseId', 'title')
      .populate('createdBy', 'name email')
      .populate('attachments')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Reports fetched successfully',
      data: reports
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports'
    });
  }
};

// Get report by ID
export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const report = await Report.findOne({
      $and: [
        { _id: id },
        {
          $or: [
            { createdBy: userId },
            { 'sharedWith.userId': userId }
          ]
        }
      ]
    })
      .populate('caseId', 'title')
      .populate('createdBy', 'name email')
      .populate('attachments')
      .populate('sharedWith.userId', 'name email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Report fetched successfully',
      data: report
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report'
    });
  }
};

// Update report
export const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, status, reportType, caseId, caseName, tags } = req.body;
    const userId = req.userId;

    const updateData = {
      title,
      content,
      status,
      reportType,
      caseId: caseId || null,
      caseName,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      updatedAt: new Date(),
      lastModified: new Date()
    };

    const report = await Report.findOneAndUpdate(
      { 
        _id: id, 
        $or: [
          { createdBy: userId },
          { 'sharedWith.userId': userId, 'sharedWith.permissions': 'edit' }
        ]
      },
      updateData,
      { new: true }
    )
      .populate('caseId', 'title')
      .populate('createdBy', 'name email')
      .populate('attachments');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found or you do not have edit permissions'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Report updated successfully',
      data: report
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to update report'
    });
  }
};

// Delete report
export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const report = await Report.findOneAndDelete({ 
      _id: id, 
      createdBy: userId 
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete report'
    });
  }
};

// Share report
export const shareReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { shareWithUserId, permissions } = req.body;
    const userId = req.userId;

    const report = await Report.findOne({ 
      _id: id, 
      createdBy: userId 
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if already shared with this user
    const existingShare = report.sharedWith.find(
      share => share.userId.toString() === shareWithUserId
    );

    if (existingShare) {
      // Update permissions
      existingShare.permissions = permissions;
    } else {
      // Add new share
      report.sharedWith.push({
        userId: shareWithUserId,
        permissions: permissions || 'read'
      });
    }

    report.updatedAt = new Date();
    await report.save();

    const updatedReport = await Report.findById(report._id)
      .populate('caseId', 'title')
      .populate('createdBy', 'name email')
      .populate('sharedWith.userId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Report shared successfully',
      data: updatedReport
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to share report'
    });
  }
};

// Finalize report (change status from draft to final)
export const finalizeReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const report = await Report.findOneAndUpdate(
      { _id: id, createdBy: userId, status: 'draft' },
      { 
        status: 'final',
        updatedAt: new Date(),
        lastModified: new Date()
      },
      { new: true }
    )
      .populate('caseId', 'title')
      .populate('createdBy', 'name email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found or already finalized'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Report finalized successfully',
      data: report
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to finalize report'
    });
  }
};

// Get reports shared with client (for citizens to see lawyer reports)
export const getSharedReports = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.role;
    
    if (userRole !== 'citizen') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only clients can access shared reports.'
      });
    }

    // Import Case model
    const Case = (await import('../models/CaseSchema.js')).default;
    
    // Find cases where this citizen is involved
    const clientCases = await Case.find({ citizen: userId }).select('_id lawyer');
    const caseIds = clientCases.map(caseItem => caseItem._id);
    const lawyerIds = clientCases.map(caseItem => caseItem.lawyer).filter(Boolean);

    // Find reports shared with this user or from their assigned lawyers
    const reports = await Report.find({
      $or: [
        { 'sharedWith.userId': userId },
        { 
          createdBy: { $in: lawyerIds }, 
          creatorModel: 'Lawyer',
          status: 'final' // Only final reports visible to clients
        },
        {
          caseId: { $in: caseIds },
          status: 'final'
        }
      ]
    })
    .populate('caseId', 'title')
    .populate('createdBy', 'name email')
    .populate('attachments')
    .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Shared reports fetched successfully',
      data: reports
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shared reports'
    });
  }
};
