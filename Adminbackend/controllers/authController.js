import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import crypto from "crypto";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if any users exist in the database
    const userCount = await User.countDocuments();

    const role = userCount === 0 ? "admin" : "user";
    // Default subscription when registering
    const subscription = "free";

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      username,
      email,
      password,
      role,
      subscription, // Include subscription
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        subscription: user.subscription, // Include subscription in response
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during registration", error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        subscription: user.subscription, // Include subscription in response
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during login", error: error.message });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && user.role === "admin" && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        subscription: user.subscription, // Include subscription in response
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials or not an admin" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during admin login", error: error.message });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    console.log("Generated Reset Token:", resetToken);
    console.log("Generated Reset Token Hash:", resetTokenHash);

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour from now

    await user.save();
    console.log("User Document After Saving Reset Token:", user);

    res
      .status(200)
      .json({ message: "Password reset token generated", resetToken });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during forgot password", error: error.message });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const resetToken = req.params.token;
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    console.log("Received Reset Token:", resetToken);
    console.log("Received Reset Token Hash:", resetTokenHash);

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      console.log("No user found or token expired");
      return res
        .status(400)
        .json({ message: "Invalid token or token has expired" });
    }

    console.log("User Document Found for Reset:", user);

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    console.log("User Document After Password Reset:", user);

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during password reset", error: error.message });
  }
};
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" });
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};
// Get stores for a specific user (Admin only)


// export const getAllUsers = async (req, res) => {
//   try {
//     const users = await User.find({});
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching users", error: error.message });
//   }
// };
