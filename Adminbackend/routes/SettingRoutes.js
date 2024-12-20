import express from 'express';
import {
  createSettings,
  updateSettings,
  getSettings,
  deleteSettings
} from '../controllers/SettingsController.js';

const router = express.Router();

// Settings Routes
router.post('/settings1', createSettings);
router.put('/settings1', updateSettings);
router.get('/settings1', getSettings);
router.delete('/settings1', deleteSettings);

export default router;



// import express from "express";
// import {
//   createSettings,
//   updateSettings,
//   getSettings,
//   getDefaultSettings
// } from "../controllers/SettingsController.js";

// const router = express.Router();

// // Route to get settings for a specific store
// router.get("/:storeId", getSettings);

// // Route to create settings
// router.post("/createsettings", createSettings);
// router.get('/default', getDefaultSettings);
// // Route to update settings
// router.put("/updatesettings", updateSettings);

// export default router;
