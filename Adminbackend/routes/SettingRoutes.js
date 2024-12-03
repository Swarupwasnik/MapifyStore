import express from "express";
import {
  createSettings,
  updateSettings,
  getSettings,
} from "../controllers/SettingsController.js";

const router = express.Router();

// Route to get settings for a specific store
router.get("/:storeId", getSettings);

// Route to create settings
router.post("/createsettings", createSettings);

// Route to update settings
router.put("/updatesettings", updateSettings);

export default router;
