import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export const authenticateUser = async (req, res, next) => {
  const authHeader = req.header('Authorization');

  console.log('Authorization header:', authHeader); // Log the header

  if (!authHeader) {
    console.log('Authorization header missing');
    return res.status(401).json({ message: 'Authorization header missing.' });
  }

  const token = authHeader.replace('Bearer ', '');
  console.log('Extracted token:', token); // Log the extracted token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('User not found');
      throw new Error('User not found');
    }

    console.log('Authenticated user:', user); // Log user info
    req.user = user; // Attach the user to the request object
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ message: 'Please authenticate.', error: error.message }); // Log the error message
  }
};


export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    console.log("User role:", req.user.role); // Debug: Log the user's role
    if (!roles.includes(req.user.role)) {
      console.log("Unauthorized role:", req.user.role); // Log the unauthorized role
      return res.status(403).json({ message: "Unauthorized role" });
    }
    next();
  };
};

// export const authorizeRoles = (...roles) => {
//     return (req, res, next) => {
//       if (!roles.includes(req.user.role)) {
//         return res.status(403).json({ message: 'Unauthorized role' });
//       }
//       next();
//     };
//   };












