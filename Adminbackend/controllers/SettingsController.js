import Settings from "../models/settingsModel.js";

export const settingsController = {
  createSettings: async (req, res) => {
    try {
      const {
        storeId,
        companyName,
        contactEmail,
        radius,
        enableGeolocation,
        unit,
        zoomLevel,
        mapColor,
        centerCoordinates,
      } = req.body;

      const newSettings = new Settings({
        storeId,
        companyName,
        contactEmail,
        radius: radius || "",
        enableGeolocation:
          enableGeolocation !== undefined ? enableGeolocation : false,
        unit: unit || "km",
        zoomLevel: zoomLevel || 10,
        mapColor: mapColor || "#3498db",
        centerCoordinates: centerCoordinates || [35.6895, 139.6917],
      });

      await newSettings.save();

      res.status(201).json({
        message: "Settings created successfully.",
        data: newSettings,
      });
    } catch (error) {
      console.error("Error creating settings:", error);
      res.status(500).json({ error: "Error creating settings." });
    }
  },

  // Update settings for a store
  updateSettings: async (req, res) => {
    try {
      const {
        storeId,
        companyName,
        contactEmail,
        radius,
        enableGeolocation,
        unit,
        zoomLevel,
        mapColor,
        centerCoordinates,
      } = req.body;

      let settings = await Settings.findOne({ storeId });
      if (!settings) {
        settings = new Settings({ storeId });
      }

      settings.companyName = companyName || settings.companyName;
      settings.contactEmail = contactEmail || settings.contactEmail;
      settings.radius = radius || settings.radius;
      settings.enableGeolocation =
        enableGeolocation !== undefined
          ? enableGeolocation
          : settings.enableGeolocation;
      settings.unit = unit || settings.unit;
      settings.zoomLevel = zoomLevel || settings.zoomLevel;
      settings.mapColor = mapColor || settings.mapColor;
      settings.centerCoordinates =
        centerCoordinates || settings.centerCoordinates;

      await settings.save();

      res.status(200).json({
        message: "Settings updated successfully.",
        data: settings,
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ error: "Error updating settings." });
    }
  },

  getSettings: async (req, res) => {
    try {
      const { storeId } = req.params;

      let settings = await Settings.findOne({ storeId });
      if (!settings) {
        return res.status(404).json({ error: "Settings not found." });
      }

      res.status(200).json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ error: "Error retrieving settings." });
    }
  },
};
