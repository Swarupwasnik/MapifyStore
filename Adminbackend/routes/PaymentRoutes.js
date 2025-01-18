import express from 'express';
import { authenticateUser } from "../middleware/authMiddleware.js";
import { createPayment,cancelPayment, capturePayment  } from '../controllers/paymentsController.js';

const router = express.Router();

// PayPal Routes
router.post('/pay', authenticateUser,createPayment);
router.get('/success',authenticateUser, capturePayment);
router.get('/cancel', cancelPayment);


export default router;
