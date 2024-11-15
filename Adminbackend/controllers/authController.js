
import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
// Register user
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({ username, email, password, role });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      // Create a token with user ID and role
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.json({
        message: 'Login successful',
        token,
        role: user.role,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    // Ensure only admin can access this route
    const userRole = req.user.role; // Assumes role is stored in req.user from middleware
    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    // Retrieve all users from the database
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users', error });
  }
};
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // Get user data from DB using the user ID in the token
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user); // Return user data
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user data', error });
  }
};


// Assuming you're using localStorage for JWT
// Logout user
export const logOut = (req, res) => {
  try {
    // If you're using cookies to store the JWT token
    res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production' }); // Clears the cookie with JWT

    // Send response
    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error logging out', error });
  }
};

