import express from 'express';
import { initiateOAuth, handleOAuthCallback } from '../controllers/shopifyController.js';

const router = express.Router();

router.get('/auth', initiateOAuth);
router.get('/auth/callback', handleOAuthCallback);

export default router;
