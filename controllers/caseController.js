import Case from '../models/CaseSchema.js';
import Citizen from '../models/CitizenSchema.js';
import Lawyer from '../models/LawyerSchema.js';

// Create a new case
export const createCase = async (req, res) => {
  const { title, description, caseType, lawyerId } = req.body;
  const citizenId = req.userId; // From auth middleware

  try {
    // Verify citizen exists
    const citizen = await Citizen.findById(citizenId);
    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: 'Citizen not found'
      });
    }

    // Verify lawyer exists if provided
    if (lawyerId) {
      const lawyer = await Lawyer.findById(lawyerId);
      if (!lawyer) {
        return res.status(404).json({
          success: false,
          message: 'Selected lawyer not found'
        });
      }
    }

    // Create new case
    const newCase = new Case({
      title,
      description,
      caseType,
      citizen: citizenId,
      status: 'pending',
      ...(lawyerId && { lawyer: lawyerId }) // Add lawyer if provided
    });

    // Save the case
    const savedCase = await newCase.save();

    // Update citizen's cases array
    await Citizen.findByIdAndUpdate(
      citizenId,
      { $push: { cases: savedCase._id } }
    );

    // If lawyer is selected, add case to their pending cases
    if (lawyerId) {
      await Lawyer.findByIdAndUpdate(
        lawyerId,
        { $push: { casesAssigned: savedCase._id } }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Case created successfully and pending lawyer approval',
      data: savedCase
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to create case. Please try again.'
    });
  }
};

// Get all cases (Admin/Lawyer view)
export const getAllCases = async (req, res) => {
  try {
    const { status, caseType } = req.query;
    const userRole = req.role;
    const userId = req.userId;
    
    let filter = {};
    
    // If user is a lawyer, only show cases that are either:
    // 1. Unassigned (no lawyer field or lawyer is null)
    // 2. Assigned to this specific lawyer
    if (userRole === 'lawyer') {
      filter.$or = [
        { lawyer: null },
        { lawyer: { $exists: false } },
        { lawyer: userId }
      ];
    }
    // If user is a citizen, show only their cases
    else if (userRole === 'citizen') {
      filter.citizen = userId;
    }

    // Apply additional filters
    if (status) filter.status = status;
    if (caseType) filter.caseType = caseType;

    const cases = await Case.find(filter)
      .populate('citizen', 'name email phone')
      .populate('lawyer', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Cases retrieved successfully',
      count: cases.length,
      data: cases
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cases. Please try again.'
    });
  }
};

// Get case by ID
export const getCaseById = async (req, res) => {
  const { id } = req.params;

  try {
    const caseItem = await Case.findById(id)
      .populate('citizen', 'name email phone')
      .populate('lawyer', 'name email phone');

    if (!caseItem) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Case retrieved successfully',
      data: caseItem
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve case. Please try again.'
    });
  }
};

// Update case status or details
export const updateCase = async (req, res) => {
  const { id } = req.params;
  const { title, description, status, caseType } = req.body;

  try {
    // Check if case exists
    const existingCase = await Case.findById(id);
    if (!existingCase) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    // Update fields
    const updatedData = {
      ...(title && { title }),
      ...(description && { description }),
      ...(status && { status }),
      ...(caseType && { caseType }),
      updatedAt: Date.now()
    };

    const updatedCase = await Case.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true }
    )
      .populate('citizen', 'name email phone')
      .populate('lawyer', 'name email phone');

    res.status(200).json({
      success: true,
      message: 'Case updated successfully',
      data: updatedCase
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to update case. Please try again.'
    });
  }
};

// Assign lawyer to a case (Accept or Reject)
export const assignLawyer = async (req, res) => {
  const { action } = req.body; // action can be 'accept' or 'reject'
  const caseId = req.params.id; // Get case ID from URL parameter
  const lawyerId = req.userId; // The lawyer making the decision

  if (!['accept', 'reject'].includes(action)) {
    return res.status(400).json({
      success: false,
      message: "Action must be either 'accept' or 'reject'"
    });
  }

  try {
    // Check if case exists
    const existingCase = await Case.findById(caseId);
    if (!existingCase) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    // Check if this lawyer can act on this case
    // Allow if: 1) No lawyer assigned yet, or 2) This lawyer is the assigned one
    if (existingCase.lawyer && existingCase.lawyer.toString() !== lawyerId) {
      return res.status(403).json({
        success: false,
        message: 'This case is assigned to another lawyer. You can only accept cases that are unassigned or specifically assigned to you.'
      });
    }

    // Check if the case is in pending status
    if (existingCase.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Case is already ${existingCase.status}`
      });
    }

    // Update case based on lawyer's decision
    const newStatus = action === 'accept' ? 'in progress' : 'rejected';
    
    let updateFields = { 
      status: newStatus,
      updatedAt: Date.now() 
    };

    // If accepting, assign the lawyer to the case
    if (action === 'accept') {
      updateFields.lawyer = lawyerId;
    }

    const updatedCase = await Case.findByIdAndUpdate(
      caseId,
      { $set: updateFields },
      { new: true }
    )
      .populate('citizen', 'name email phone')
      .populate('lawyer', 'name email phone');

    // Update lawyer's assigned cases
    if (action === 'accept') {
      // Add case to lawyer's assigned cases if not already there
      await Lawyer.findByIdAndUpdate(
        lawyerId,
        { $addToSet: { casesAssigned: caseId } }
      );
    } else if (action === 'reject') {
      // Remove from lawyer's assigned cases if rejecting
      await Lawyer.findByIdAndUpdate(
        lawyerId,
        { $pull: { casesAssigned: caseId } }
      );
    }

    res.status(200).json({
      success: true,
      message: `Case ${action === 'accept' ? 'accepted' : 'rejected'} successfully`,
      data: updatedCase
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: `Failed to ${action} case. Please try again.`
    });
  }
};