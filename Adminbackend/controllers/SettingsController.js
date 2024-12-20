import Settings from '../models/settingsModel.js';

export const createSettings = async (req, res) => {
  try {
    // Check if settings already exist
    const existingSettings = await Settings.findOne();
    if (existingSettings) {
      return res.status(400).json({
        error: "Settings already exist. Use update endpoint.",
        data: existingSettings
      });
    }

    const {
      companyName,
      contactEmail,
      radius,
      enableGeolocation,
      unit,
      zoomLevel,
      mapColor,
      centerCoordinates
    } = req.body;

    const newSettings = new Settings({
      companyName: companyName || "",
      contactEmail: contactEmail || "",
      radius: radius || "",
      enableGeolocation: enableGeolocation !== undefined ? enableGeolocation : false,
      unit: unit || "km",
      zoomLevel: zoomLevel || 10,
      mapColor: mapColor || "#3498db",
      centerCoordinates: centerCoordinates || [35.6895, 139.6917]
    });

    await newSettings.save();

    res.status(201).json({
      message: "Settings created successfully.",
      data: newSettings
    });
  } catch (error) {
    console.error("Error creating settings:", error);
    res.status(500).json({ 
      error: "Error creating settings.",
      details: error.message 
    });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const {
      companyName,
      contactEmail,
      radius,
      enableGeolocation,
      unit,
      zoomLevel,
      mapColor,
      centerCoordinates
    } = req.body;

    // Find existing settings or create new if none exist
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings();
    }

    // Update settings with new values or keep existing
    if (companyName !== undefined) settings.companyName = companyName;
    if (contactEmail !== undefined) settings.contactEmail = contactEmail;
    if (radius !== undefined) settings.radius = radius;
    if (enableGeolocation !== undefined) settings.enableGeolocation = enableGeolocation;
    if (unit !== undefined) settings.unit = unit;
    if (zoomLevel !== undefined) settings.zoomLevel = zoomLevel;
    if (mapColor !== undefined) settings.mapColor = mapColor;
    if (centerCoordinates !== undefined) settings.centerCoordinates = centerCoordinates;

    await settings.save();

    res.status(200).json({
      message: "Settings updated successfully.",
      data: settings
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ 
      error: "Error updating settings.",
      details: error.message 
    });
  }
};

export const getSettings = async (req, res) => {
  try {
    // Find the first (and only) settings document
    const settings = await Settings.findOne();

    if (!settings) {
      // If no settings exist, return default settings
      return res.status(200).json({
        companyName: "",
        contactEmail: "",
        radius: "",
        enableGeolocation: false,
        unit: "km",
        zoomLevel: 10,
        mapColor: "#3498db",
        centerCoordinates: [35.6895, 139.6917]
      });
    }

    res.status(200).json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ 
      error: "Error retrieving settings.",
      details: error.message 
    });
  }
};

export const deleteSettings = async (req, res) => {
  try {
    const result = await Settings.deleteMany({});
    
    res.status(200).json({
      message: "All settings deleted successfully.",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Error deleting settings:", error);
    res.status(500).json({ 
      error: "Error deleting settings.",
      details: error.message 
    });
  }
};




// import Settings from '../models/settingsModel.js';

// export const createSettings = async (req, res) => {
//   try {
//     const {
//       storeId,
//       companyName,
//       contactEmail,
//       radius,
//       enableGeolocation,
//       unit,
//       zoomLevel,
//       mapColor,
//       centerCoordinates,
//     } = req.body;

//     const newSettings = new Settings({
//       storeId,
//       companyName,
//       contactEmail,
//       radius: radius || "",
//       enableGeolocation:
//         enableGeolocation !== undefined ? enableGeolocation : false,
//       unit: unit || "km",
//       zoomLevel: zoomLevel || 10,
//       mapColor: mapColor || "#3498db",
//       centerCoordinates: centerCoordinates || [35.6895, 139.6917],
//     });

//     await newSettings.save();

//     res.status(201).json({
//       message: "Settings created successfully.",
//       data: newSettings,
//     });
//   } catch (error) {
//     console.error("Error creating settings:", error);
//     res.status(500).json({ error: "Error creating settings." });
//   }
// };

// export const updateSettings = async (req, res) => {
//   try {
//     const {
//       storeId,
//       companyName,
//       contactEmail,
//       radius,
//       enableGeolocation,
//       unit,
//       zoomLevel,
//       mapColor,
//       centerCoordinates,
//     } = req.body;

//     let settings = await Settings.findOne({ storeId });
//     if (!settings) {
//       settings = new Settings({ storeId });
//     }

//     settings.companyName = companyName || settings.companyName;
//     settings.contactEmail = contactEmail || settings.contactEmail;
//     settings.radius = radius || settings.radius;
//     settings.enableGeolocation =
//       enableGeolocation !== undefined
//         ? enableGeolocation
//         : settings.enableGeolocation;
//     settings.unit = unit || settings.unit;
//     settings.zoomLevel = zoomLevel || settings.zoomLevel;
//     settings.mapColor = mapColor || settings.mapColor;
//     settings.centerCoordinates =
//       centerCoordinates || settings.centerCoordinates;

//     await settings.save();

//     res.status(200).json({
//       message: "Settings updated successfully.",
//       data: settings,
//     });
//   } catch (error) {
//     console.error("Error updating settings:", error);
//     res.status(500).json({ error: "Error updating settings." });
//   }
// };

// export const getSettings = async (req, res) => {
//   try {
//     const { storeId } = req.params;

//     const settings = await Settings.findOne({ storeId });
//     if (!settings) {
//       return res.status(404).json({ error: "Settings not found." });
//     }

//     res.status(200).json(settings);
//   } catch (error) {
//     console.error("Error fetching settings:", error);
//     res.status(500).json({ error: "Error retrieving settings." });
//   }
// };

// export const getDefaultSettings = async (req, res) => {
//   try {
//     const settings = await Settings.findOne();
//     if (!settings) {
//       return res.status(404).json({ error: "Settings not found." });
//     }
//     res.status(200).json(settings);
//   } catch (error) {
//     console.error("Error fetching settings:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };






