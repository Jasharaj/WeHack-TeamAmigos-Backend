import Dispute from '../models/DisputeSchema.js';
import Case from '../models/CaseSchema.js';
import Citizen from '../models/CitizenSchema.js';
import Lawyer from '../models/LawyerSchema.js';

// Enhanced dispute creation with automatic lawyer matching
export const createIntegratedDispute = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      defendant, 
      category, 
      priority = 'medium',
      preferredLawyer,
      canCreateCase = false 
    } = req.body;
    
    const userId = req.userId;
    const userRole = req.role;

    // Get creator details
    const Creator = userRole === 'citizen' ? Citizen : Lawyer;
    const creator = await Creator.findById(userId).select('name email');
    
    if (!creator) {
      return res.status(404).json({
        success: false,
        message: 'Creator not found'
      });
    }

    // Create dispute with proper party structure
    const dispute = new Dispute({
      title,
      description,
      parties: {
        plaintiff: {
          id: userId,
          name: creator.name,
          type: userRole === 'citizen' ? 'Citizen' : 'Lawyer',
          contactEmail: creator.email
        },
        defendant: {
          name: defendant.name,
          type: defendant.type || 'External',
          contactEmail: defendant.email || null,
          id: defendant.id || null
        }
      },
      category,
      priority,
      createdBy: userId,
      createdByModel: userRole === 'citizen' ? 'Citizen' : 'Lawyer',
      canCreateCase,
      status: preferredLawyer ? 'pending' : 'draft'
    });

    // If preferred lawyer specified, try to assign
    if (preferredLawyer) {
      const lawyer = await Lawyer.findById(preferredLawyer);
      if (lawyer) {
        dispute.assignedLawyer = preferredLawyer;
        dispute.assignmentStatus = 'pending-acceptance';
        dispute.assignmentDate = new Date();
        
        // Add notification for lawyer
        dispute.notifications.push({
          recipient: preferredLawyer,
          recipientModel: 'Lawyer',
          type: 'assignment',
          message: `New dispute "${title}" has been assigned to you for review.`
        });
      }
    }

    // If no lawyer specified and user is citizen, find suitable lawyers
    if (!preferredLawyer && userRole === 'citizen') {
      const suitableLawyers = await Lawyer.find({
        $or: [
          { specialization: category },
          { specialization: 'other' }
        ]
      }).limit(3);

      // Add notifications to suitable lawyers
      suitableLawyers.forEach(lawyer => {
        dispute.notifications.push({
          recipient: lawyer._id,
          recipientModel: 'Lawyer',
          type: 'assignment',
          message: `New dispute "${title}" in ${category} category is available for assignment.`
        });
      });
    }

    await dispute.save();

    // Populate and return
    const populatedDispute = await Dispute.findById(dispute._id)
      .populate('assignedLawyer', 'name email specialization')
      .populate('relatedCase', 'title status');

    res.status(201).json({
      success: true,
      message: 'Dispute created successfully',
      data: populatedDispute
    });

  } catch (err) {
    console.error('Error creating integrated dispute:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create dispute'
    });
  }
};

// Get disputes with enhanced filtering and role-based access
export const getIntegratedDisputes = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.role;
    const { 
      status, 
      category, 
      priority, 
      assigned = 'all', 
      timeline = 'all',
      search 
    } = req.query;

    let filter = {};
    
    // Role-based filtering
    if (userRole === 'citizen') {
      filter.$or = [
        { createdBy: userId },
        { 'parties.plaintiff.id': userId },
        { 'parties.defendant.id': userId }
      ];
    } else if (userRole === 'lawyer') {
      // For lawyers, show:
      // 1. Disputes assigned to them
      // 2. Disputes they created  
      // 3. Unassigned disputes that are available for assignment
      // 4. Disputes they've been notified about
      
      filter.$or = [
        { assignedLawyer: userId },                           // Assigned to them
        { createdBy: userId },                                // Created by them
        { $and: [                                            // Available for assignment
          { assignedLawyer: { $exists: false } },
          { assignmentStatus: 'unassigned' }
        ]},
        { 'notifications.recipient': userId }                 // They've been notified
      ];
    }

    // Apply additional filters
    if (status && status !== 'all') {
      if (status === 'active') {
        filter.status = { $in: ['pending', 'assigned', 'mediation', 'negotiation'] };
      } else if (status === 'resolved') {
        filter.status = { $in: ['resolved', 'dismissed', 'withdrawn'] };
      } else {
        filter.status = status;
      }
    }

    if (category && category !== 'all') filter.category = category;
    if (priority && priority !== 'all') filter.priority = priority;

    // Assignment filter for lawyers
    if (userRole === 'lawyer' && assigned !== 'all') {
      if (assigned === 'mine') {
        filter.assignedLawyer = userId;
      } else if (assigned === 'available') {
        filter.assignedLawyer = { $exists: false };
        filter.status = { $in: ['draft', 'pending'] };
      }
    }

    // Timeline filter
    const now = new Date();
    if (timeline === 'today') {
      filter.nextHearing = {
        $gte: new Date(now.setHours(0, 0, 0, 0)),
        $lt: new Date(now.setHours(23, 59, 59, 999))
      };
    } else if (timeline === 'week') {
      const weekFromNow = new Date();
      weekFromNow.setDate(now.getDate() + 7);
      filter.nextHearing = { $gte: now, $lte: weekFromNow };
    }

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'parties.plaintiff.name': { $regex: search, $options: 'i' } },
        { 'parties.defendant.name': { $regex: search, $options: 'i' } }
      ];
    }

    const disputes = await Dispute.find(filter)
      .populate('assignedLawyer', 'name email specialization')
      .populate('relatedCase', 'title status')
      .populate('createdBy', 'name email')
      .sort({ lastActivity: -1, createdAt: -1 })
      .lean();

    // Add computed fields
    const enhancedDisputes = disputes.map(dispute => ({
      ...dispute,
      isMyDispute: dispute.createdBy._id.toString() === userId.toString(),
      isAssignedToMe: dispute.assignedLawyer?._id?.toString() === userId.toString(),
      unreadMessages: dispute.messages?.filter(msg => 
        !msg.readBy.some(read => read.user.toString() === userId.toString())
      ).length || 0,
      hasUpcomingDeadlines: dispute.deadlines?.some(deadline => 
        deadline.dueDate > new Date() && deadline.status === 'pending'
      ) || false
    }));

    res.status(200).json({
      success: true,
      message: 'Disputes retrieved successfully',
      data: enhancedDisputes,
      total: enhancedDisputes.length
    });

  } catch (err) {
    console.error('Error getting integrated disputes:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve disputes'
    });
  }
};

// Accept dispute assignment (for lawyers)
export const acceptDisputeAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.role;

    if (userRole !== 'lawyer') {
      return res.status(403).json({
        success: false,
        message: 'Only lawyers can accept dispute assignments'
      });
    }

    const dispute = await Dispute.findById(id);
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    // Check if already assigned or if lawyer is eligible
    if (dispute.assignedLawyer && dispute.assignmentStatus === 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Dispute already has an assigned lawyer'
      });
    }

    // Assign lawyer
    dispute.assignedLawyer = userId;
    dispute.assignmentStatus = 'accepted';
    dispute.assignmentDate = new Date();
    dispute.status = 'assigned';

    // Add notification for dispute creator
    dispute.notifications.push({
      recipient: dispute.createdBy,
      recipientModel: dispute.createdByModel,
      type: 'assignment',
      message: `Lawyer has been assigned to your dispute "${dispute.title}".`
    });

    // Add system message
    dispute.messages.push({
      content: 'Lawyer has accepted the dispute assignment and is now handling your case.',
      sender: userId,
      senderModel: 'Lawyer',
      messageType: 'status-update'
    });

    await dispute.save();

    const populatedDispute = await Dispute.findById(dispute._id)
      .populate('assignedLawyer', 'name email specialization')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Dispute assignment accepted successfully',
      data: populatedDispute
    });

  } catch (err) {
    console.error('Error accepting dispute assignment:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to accept assignment'
    });
  }
};

// Add message to dispute
export const addDisputeMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, messageType = 'message', isPrivate = false } = req.body;
    const userId = req.userId;
    const userRole = req.role;

    const dispute = await Dispute.findById(id);
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    // Check access rights
    const hasAccess = dispute.createdBy.toString() === userId.toString() ||
                     dispute.assignedLawyer?.toString() === userId.toString();

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this dispute'
      });
    }

    // Add message
    const newMessage = {
      content,
      sender: userId,
      senderModel: userRole === 'citizen' ? 'Citizen' : 'Lawyer',
      messageType,
      isPrivate,
      createdAt: new Date()
    };

    dispute.messages.push(newMessage);
    dispute.lastActivity = new Date();

    // Add notification for other party (if not private)
    if (!isPrivate) {
      const otherPartyId = dispute.createdBy.toString() === userId.toString() 
        ? dispute.assignedLawyer 
        : dispute.createdBy;
      
      const otherPartyModel = dispute.createdBy.toString() === userId.toString()
        ? 'Lawyer'
        : dispute.createdByModel;

      if (otherPartyId) {
        dispute.notifications.push({
          recipient: otherPartyId,
          recipientModel: otherPartyModel,
          type: 'message',
          message: `New message in dispute "${dispute.title}"`
        });
      }
    }

    await dispute.save();

    res.status(200).json({
      success: true,
      message: 'Message added successfully',
      data: newMessage
    });

  } catch (err) {
    console.error('Error adding dispute message:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to add message'
    });
  }
};

// Create case from dispute
export const createCaseFromDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.role;

    const dispute = await Dispute.findById(id)
      .populate('assignedLawyer')
      .populate('createdBy');

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    // Check authorization
    if (dispute.assignedLawyer?._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only assigned lawyer can escalate dispute to case'
      });
    }

    if (!dispute.canCreateCase) {
      return res.status(400).json({
        success: false,
        message: 'This dispute is not eligible for case creation'
      });
    }

    // Create case from dispute
    const newCase = new Case({
      title: `Case: ${dispute.title}`,
      description: `Escalated from dispute: ${dispute.description}`,
      caseType: dispute.category === 'corporate' ? 'civil' : dispute.category,
      citizen: dispute.parties.plaintiff.type === 'Citizen' ? dispute.parties.plaintiff.id : null,
      lawyer: userId,
      status: 'in progress'
    });

    await newCase.save();

    // Link dispute to case
    dispute.relatedCase = newCase._id;
    dispute.status = 'court-prep';
    
    // Add system message
    dispute.messages.push({
      content: `Dispute has been escalated to a full legal case: ${newCase.title}`,
      sender: userId,
      senderModel: 'Lawyer',
      messageType: 'status-update'
    });

    // Add notification
    dispute.notifications.push({
      recipient: dispute.createdBy,
      recipientModel: dispute.createdByModel,
      type: 'status-change',
      message: `Your dispute "${dispute.title}" has been escalated to a full legal case.`
    });

    await dispute.save();

    res.status(201).json({
      success: true,
      message: 'Case created from dispute successfully',
      data: {
        case: newCase,
        dispute: dispute
      }
    });

  } catch (err) {
    console.error('Error creating case from dispute:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create case from dispute'
    });
  }
};

// Get dispute dashboard data
export const getDisputeDashboard = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.role;

    let filter = {};
    if (userRole === 'citizen') {
      filter = { createdBy: userId };
    } else {
      filter = { assignedLawyer: userId };
    }

    const [
      totalDisputes,
      activeDisputes,
      pendingDisputes,
      resolvedDisputes,
      upcomingHearings,
      recentActivity
    ] = await Promise.all([
      Dispute.countDocuments(filter),
      Dispute.countDocuments({ ...filter, status: { $in: ['assigned', 'mediation', 'negotiation'] } }),
      Dispute.countDocuments({ ...filter, status: 'pending' }),
      Dispute.countDocuments({ ...filter, status: 'resolved' }),
      Dispute.find({ ...filter, nextHearing: { $gte: new Date() } })
        .sort({ nextHearing: 1 })
        .limit(5)
        .populate('assignedLawyer', 'name')
        .populate('createdBy', 'name'),
      Dispute.find(filter)
        .sort({ lastActivity: -1 })
        .limit(10)
        .populate('assignedLawyer', 'name')
        .populate('createdBy', 'name')
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          total: totalDisputes,
          active: activeDisputes,
          pending: pendingDisputes,
          resolved: resolvedDisputes
        },
        upcomingHearings,
        recentActivity
      }
    });

  } catch (err) {
    console.error('Error getting dispute dashboard:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data'
    });
  }
};

export default {
  createIntegratedDispute,
  getIntegratedDisputes,
  acceptDisputeAssignment,
  addDisputeMessage,
  createCaseFromDispute,
  getDisputeDashboard
};
