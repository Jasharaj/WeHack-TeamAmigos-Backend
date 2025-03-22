import jwt from "jsonwebtoken";
import Citizen from "../models/CitizenSchema.js";
import Lawyer from "../models/LawyerSchema.js";

export const authenticate = async (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;

  // Check if token exists
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "No token, authorization denied" });
  }

  try {
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.userId = decoded.id;
    req.role = decoded.role;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token is expired" });
    }

    return res.status(401).json({ success: false, message: "Invalid Token" });
  }
};

export const restrict = (roles) => async (req, res, next) => {
  const userId = req.userId;
  const userRole = req.role;

  try {
    // Verify user exists
    let user = null;
    
    if (userRole === 'citizen') {
      user = await Citizen.findById(userId);
    } else if (userRole === 'lawyer') {
      user = await Lawyer.findById(userId);
    }
    
    // If user not found
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found. ID: " + userId + ", Role: " + userRole
      });
    }
    
    // Check if user role is allowed
    if (!roles.includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: "You're not authorized to access this resource" 
      });
    }
    
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error during authorization"
    });
  }
};