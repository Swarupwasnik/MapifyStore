import express from 'express';
import { findStoresByLocation } from '../controllers/locationController.js';
const router = express.Router();

router.get('/nearby', async (req, res) => {
  const { latitude, longitude, radius } = req.query;

  if (!latitude || !longitude || !radius) {
    return res.status(400).json({ error: 'Latitude, longitude, and radius are required.' });
  }

  try {
    const stores = await findStoresByLocation(parseFloat(latitude), parseFloat(longitude), parseFloat(radius));
    res.json(stores);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching nearby stores' });
  }
});

export default router;
