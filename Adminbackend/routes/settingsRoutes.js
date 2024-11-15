import express from "express";
import { settingsController } from "../controllers/SettingsController.js";
const router = express.Router();

router.get("/:storeId", settingsController.getSettings);

router.post("/createsettings", settingsController.updateSettings);

router.put("/updatesettings", settingsController.updateSettings);

export default router;
