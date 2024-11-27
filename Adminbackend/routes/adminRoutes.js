import express from 'express';
import { fetchStoreData } from '../controllers/adminController';
import adminMiddleware from '../middleware/AdminMiddleware';
const router = express.Router();

router.get('/dashboard', adminMiddleware, fetchStoreData);

export default router;

