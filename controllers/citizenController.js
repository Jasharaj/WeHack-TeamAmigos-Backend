import Citizen from '../models/CitizenSchema.js';
import Case from '../models/CaseSchema.js';

// Get citizen profile
export const getCitizenProfile = async (req, res) => {
  const citizenId = req.userId;

  try {
    const citizen = await Citizen.findById(citizenId).select('-password');

    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: 'Citizen not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Citizen profile fetched successfully',
      data: citizen
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile. Please try again.'
    });
  }
};

// Update citizen profile
export const updateCitizenProfile = async (req, res) => {
  const citizenId = req.userId;
  const { name, email, phone } = req.body;

  try {
    // Check if citizen exists
    const citizen = await Citizen.findById(citizenId);

    if (!citizen) {
      return res.status(404).json({
        success: false,
        message: 'Citizen not founsd'
      });
    }

    // Update citizen profile
    const updatedCitizen = await Citizen.findByIdAndUpdate(
      citizenId,
      {
        name,
        email,
        phone
      },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Citizen profile updated successfully',
      data: updatedCitizen
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile. Please try again.'
    });
  }
};

// Get citizen cases
export const getCitizenCases = async (req, res) => {
  const citizenId = req.userId;

  try {
    // Find all cases filed by the citizen
    const cases = await Case.find({ citizen: citizenId })
      .populate('lawyer', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Cases fetched successfully',
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