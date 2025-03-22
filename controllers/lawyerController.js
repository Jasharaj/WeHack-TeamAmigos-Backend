import Lawyer from '../models/LawyerSchema.js';
import Case from '../models/CaseSchema.js';

// Get lawyer profile
export const getLawyerProfile = async (req, res) => {
  const lawyerId = req.userId;

  try {
    const lawyer = await Lawyer.findById(lawyerId).select('-password');

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lawyer profile fetched successfully',
      data: lawyer
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile. Please try again.'
    });
  }
};

// Update lawyer profile
export const updateLawyerProfile = async (req, res) => {
  const lawyerId = req.userId;
  const { name, email, phone } = req.body;

  try {
    // Check if lawyer exists
    const lawyer = await Lawyer.findById(lawyerId);

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer not found'
      });
    }

    // Update lawyer profile
    const updatedLawyer = await Lawyer.findByIdAndUpdate(
      lawyerId,
      {
        name,
        email,
        phone
      },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Lawyer profile updated successfully',
      data: updatedLawyer
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile. Please try again.'
    });
  }
};

// Get assigned cases
export const getAssignedCases = async (req, res) => {
  const lawyerId = req.userId;

  try {
    // Find all cases assigned to the lawyer
    const cases = await Case.find({ lawyer: lawyerId })
      .populate('citizen', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Assigned cases fetched successfully',
      data: cases
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cases. Please try again.'
    });
  }
};