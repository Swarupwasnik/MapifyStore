import express from 'express';
import { authCallback } from '../controllers/shopifyController.js';

const router = express.Router();

router.get('/auth/callback', authCallback);

export default router;
