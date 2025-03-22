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
  const { name, email, password, phone, role } = req.body;

  try {
    let user = null;

    // Check if user already exists based on role
    if (role === 'citizen') {
      user = await Citizen.findOne({ email });
    } else if (role === 'lawyer') {
      user = await Lawyer.findOne({ email });
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
        role
      });
    }

    await user.save();

    res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully`
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
  const { email, password, role } = req.body;

  try {
    let user = null;

    // Find user based on role and email
    if (role === 'citizen') {
      user = await Citizen.findOne({ email });
    } else if (role === 'lawyer') {
      user = await Lawyer.findOne({ email });
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
      data: userData,
      role
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Failed to login. Please try again.'
    });
  }
};