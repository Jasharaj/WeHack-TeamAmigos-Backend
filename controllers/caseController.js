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
    let filter = {};

    // Apply filters if provided
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
  const { caseId, action } = req.body; // action can be 'accept' or 'reject'
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

    // Check if this lawyer is the one assigned to the case
    if (existingCase.lawyer && existingCase.lawyer.toString() !== lawyerId) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this case'
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
    
    const updatedCase = await Case.findByIdAndUpdate(
      caseId,
      { 
        $set: { 
          status: newStatus,
          updatedAt: Date.now() 
        } 
      },
      { new: true }
    )
      .populate('citizen', 'name email phone')
      .populate('lawyer', 'name email phone');

    // If rejected, remove from lawyer's assigned cases
    if (action === 'reject') {
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