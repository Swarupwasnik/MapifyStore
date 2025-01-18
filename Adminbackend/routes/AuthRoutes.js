import express from 'express';
import { authenticateUser,authorizeRoles} from '../middleware/authMiddleware.js';
import {registerUser,loginUser,loginAdmin,forgotPassword,resetPassword, getAllUsers} from "../controllers/authController.js"
const router = express.Router();


router.post('/login', loginUser);


// router.post('/user', getAllUsers);

router.post('/signup', registerUser);
router.post("/admin/login",loginAdmin);
router.post('/forgotpassword', forgotPassword);
 router.post('/resetpassword/:token', resetPassword);
 router.get(
    "/all-user",
    authenticateUser,
    authorizeRoles("admin"), // Only admin users are allowed
    getAllUsers
  );
// router.get('/me', authenticateAdmin, getCurrentUser);


// router.post('/login', loginUser);
// router.post("/logout", logOut)





export default router;


// import express from 'express';
// import { registerUser, loginUser, getUserProfile,getAllUsers,registerAdmin } from '../controllers/authController.js';
// import { authenticateUser,authenticateAdmin } from '../middleware/authMiddleware.js';

// const router = express.Router();

// // Register a new user
// router.post('/register', registerUser);
// router.post('/register-admin', registerAdmin);
// // Login user and get token
// router.post('/login', loginUser);

// // Get user profile
// router.get('/profile', authenticateUser, getUserProfile);
// router.get('/users', authenticateAdmin, getAllUsers);

// export default router;


