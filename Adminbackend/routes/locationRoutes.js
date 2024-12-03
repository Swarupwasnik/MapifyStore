// import express from 'express';
// import { findStoresByLocation } from '../controllers/locationController.js';
// const router = express.Router();

// router.get('/nearby', async (req, res) => {
//   const { latitude, longitude, radius } = req.query;

//   if (!latitude || !longitude || !radius) {
//     return res.status(400).json({ error: 'Latitude, longitude, and radius are required.' });
//   }

//   try {
//     const stores = await findStoresByLocation(parseFloat(latitude), parseFloat(longitude), parseFloat(radius));
//     res.json(stores);
//   } catch (error) {
//     res.status(500).json({ error: 'Error fetching nearby stores' });
//   }
// });

// export default router;


import express from 'express';
import { findStoresByLocation } from '../controllers/locationController.js';

const router = express.Router();

router.get('/nearby', async (req, res) => {
  const { latitude, longitude, radius } = req.query;

  // Validate query parameters
  if (!latitude || !longitude || !radius) {
    return res.status(400).json({ 
      error: 'Latitude, longitude, and radius are required.' 
    });
  }

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const rad = parseFloat(radius);

  if (isNaN(lat) || isNaN(lng) || isNaN(rad)) {
    return res.status(400).json({ 
      error: 'Latitude, longitude, and radius must be valid numbers.' 
    });
  }

  try {
    // Call the controller function to fetch stores
    const stores = await findStoresByLocation(lat, lng, rad);
    if (stores.length === 0) {
      return res.status(404).json({ 
        message: 'No stores found within the given radius.' 
      });
    }

    // Respond with the list of stores
    res.status(200).json({
      message: 'Nearby stores fetched successfully.',
      data: stores,
    });
  } catch (error) {
    console.error('Error fetching nearby stores:', error);
    res.status(500).json({ 
      error: 'An error occurred while fetching nearby stores.',
      details: error.message,
    });
  }
});

export default router;

