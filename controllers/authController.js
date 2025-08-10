import Citizen from '../models/CitizenSchema.js';
import Lawyer from '../models/LawyerSchema.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '15d' }
  );
};

// Register a new user (citizen or lawyer)
export const register = async (req, res) => {
  const { name, email, password, phone, role, licenseNumber, specialization, yearsOfExperience } = req.body;

  try {
    let user = null;

    // Check if user already exists based on role
    if (role === 'citizen') {
      user = await Citizen.findOne({ email });
    } else if (role === 'lawyer') {
      user = await Lawyer.findOne({ email });
      
      // Check if license number already exists for lawyers
      if (!user && licenseNumber) {
        const existingLawyer = await Lawyer.findOne({ licenseNumber });
        if (existingLawyer) {
          return res.status(400).json({
            success: false,
            message: 'Lawyer with this license number already exists'
          });
        }
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Role must be either 'citizen' or 'lawyer'"
      });
    }

    // Check if user exists
    if (user) {
      return res.status(400).json({
        success: false,
        message: `${role.charAt(0).toUpperCase() + role.slice(1)} already exists with this email`
      });
    }

    // Validate lawyer-specific required fields
    if (role === 'lawyer') {
      if (!licenseNumber) {
        return res.status(400).json({
          success: false,
          message: 'License number is required for lawyers'
        });
      }
      if (!specialization) {
        return res.status(400).json({
          success: false,
          message: 'Specialization is required for lawyers'
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user based on role
    if (role === 'citizen') {
      user = new Citizen({
        name,
        email,
        password: hashedPassword,
        phone,
        role
      });
    }

    if (role === 'lawyer') {
      user = new Lawyer({
        name,
        email,
        password: hashedPassword,
        phone,
        role,
        licenseNumber,
        specialization,
        yearsOfExperience: yearsOfExperience || 0
      });
    }

    await user.save();

    // Generate token for immediate login
    const token = generateToken(user);

    // Remove password from response
    const { password: _, ...userData } = user._doc;

    res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully`,
      token,
      user: userData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to register. Please try again.'
    });
  }
};

// Login user (citizen or lawyer)
export const login = async (req, res) => {
  const { email, password, role, licenseNumber } = req.body;

  try {
    let user = null;

    // Find user based on role and email
    if (role === 'citizen') {
      user = await Citizen.findOne({ email });
    } else if (role === 'lawyer') {
      user = await Lawyer.findOne({ email });
      
      // Additional validation for lawyers with license number
      if (user && licenseNumber && user.licenseNumber !== licenseNumber) {
        return res.status(400).json({
          success: false,
          message: 'License number does not match our records'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Role must be either 'citizen' or 'lawyer'"
      });
    }

    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `${role.charAt(0).toUpperCase() + role.slice(1)} not found`
      });
    }

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Make sure the role is set on the user object
    if (!user.role) {
      user.role = role;
      await user.save();
    }

    // Generate token
    const token = generateToken(user);

    // Remove password from response
    const { password: _, ...userData } = user._doc;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to login. Please try again.'
    });
  }
};

// Logout user
export const logout = async (req, res) => {
  try {
    // In a stateless JWT authentication system, the server doesn't need to do anything
    // The client is responsible for removing the token
    
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
    
    // Note: For enhanced security in a production environment, you might want to:
    // 1. Implement a token blacklist using Redis or another cache
    // 2. Use refresh tokens and revoke them on logout
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong during logout'
    });
  }
};

// Get all registered users (citizens and lawyers) - for debugging/admin purposes
export const getAllUsers = async (req, res) => {
  try {
    // Fetch all citizens
    const citizens = await Citizen.find({}, { password: 0 }).lean();
    
    // Fetch all lawyers
    const lawyers = await Lawyer.find({}, { password: 0 }).lean();
    
    // Add role field to distinguish between user types
    const citizensWithRole = citizens.map(citizen => ({ ...citizen, userType: 'citizen' }));
    const lawyersWithRole = lawyers.map(lawyer => ({ ...lawyer, userType: 'lawyer' }));
    
    // Return the data
    return res.status(200).json({
      success: true,
      message: 'All users fetched successfully',
      data: {
        citizens: citizensWithRole,
        lawyers: lawyersWithRole,
        totalCitizens: citizens.length,
        totalLawyers: lawyers.length,
        totalUsers: citizens.length + lawyers.length
      }
    });
    
  } catch (err) {
    console.error('Error fetching all users:', err);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while fetching users'
    });
  }
};

// Delete all users from database - for development/testing purposes
export const deleteAllUsers = async (req, res) => {
  try {
    // Delete all citizens
    const citizenDeleteResult = await Citizen.deleteMany({});
    
    // Delete all lawyers
    const lawyerDeleteResult = await Lawyer.deleteMany({});
    
    
    return res.status(200).json({
      success: true,
      message: 'All users deleted successfully',
      data: {
        citizensDeleted: citizenDeleteResult.deletedCount,
        lawyersDeleted: lawyerDeleteResult.deletedCount,
        totalDeleted: citizenDeleteResult.deletedCount + lawyerDeleteResult.deletedCount
      }
    });
    
  } catch (err) {
    console.error('Error deleting all users:', err);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while deleting users'
    });
  }
};