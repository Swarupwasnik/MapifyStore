import express from 'express';
import { registerUser, loginUser, getAllUsers,getCurrentUser,logOut } from '../controllers/authController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';
const router = express.Router();


router.post('/login', loginUser);
router.post('/user', getAllUsers);

router.post('/register', registerUser);

router.get('/me', authenticateAdmin, getCurrentUser);


router.post('/login', loginUser);
router.post("/logout", logOut)

router.get('/users', authenticateAdmin, getAllUsers);




export default router;



