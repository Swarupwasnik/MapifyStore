import Settings from "../models/settingsModel.js";


export const createSettings = async (req, res) => {
  try {
    // Check if settings already exist
    const existingSettings = await Settings.findOne();
    if (existingSettings) {
      return res.status(400).json({
        error: "Settings already exist. Use update endpoint.",
        data: existingSettings,
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
      centerCoordinates,
    } = req.body;

    const newSettings = new Settings({
      companyName: companyName || "",
      contactEmail: contactEmail || "",
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
    res.status(500).json({
      error: "Error creating settings.",
      details: error.message,
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
      centerCoordinates,
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
    if (enableGeolocation !== undefined)
      settings.enableGeolocation = enableGeolocation;
    if (unit !== undefined) settings.unit = unit;
    if (zoomLevel !== undefined) settings.zoomLevel = zoomLevel;
    if (mapColor !== undefined) settings.mapColor = mapColor;
    if (centerCoordinates !== undefined)
      settings.centerCoordinates = centerCoordinates;

    await settings.save();

    res.status(200).json({
      message: "Settings updated successfully.",
      data: settings,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({
      error: "Error updating settings.",
      details: error.message,
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
        centerCoordinates: [35.6895, 139.6917],
      });
    }

    res.status(200).json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({
      error: "Error retrieving settings.",
      details: error.message,
    });
  }
};

export const deleteSettings = async (req, res) => {
  try {
    const result = await Settings.deleteMany({});

    res.status(200).json({
      message: "All settings deleted successfully.",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting settings:", error);
    res.status(500).json({
      error: "Error deleting settings.",
      details: error.message,
    });
  }
};



// export const createSettings = async (req, res) => {
//   try {
//     // Log the incoming request body
//     console.log("Request body:", req.body);

//     // Log the authenticated user
//     if (!req.user) {
//       console.log("Authentication failed. User not found in request.");
//       return res.status(401).json({ error: "User not authenticated." });
//     }
//     console.log("User ID from token:", req.user.id);

//     const userId = req.user.id;
//     const {
//       companyName,
//       contactEmail,
//       radius,
//       enableGeolocation,
//       unit,
//       zoomLevel,
//       mapColor,
//       centerCoordinates,
//     } = req.body;

//     console.log("Parsed fields:", {
//       companyName,
//       contactEmail,
//       radius,
//       enableGeolocation,
//       unit,
//       zoomLevel,
//       mapColor,
//       centerCoordinates,
//     });

//     const newSettings = new Settings({
//       companyName,
//       contactEmail,
//       radius,
//       enableGeolocation,
//       unit,
//       zoomLevel,
//       mapColor,
//       centerCoordinates,
//       user: userId,
//     });

//     console.log("Settings before save:", newSettings);

//     await newSettings.save();

//     res.status(201).json({
//       message: "Settings created successfully.",
//       data: newSettings,
//     });
//   } catch (error) {
//     console.error("Error in createSettings:", error.message);
//     res.status(500).json({ error: "Server error", details: error.message });
//   }
// };



// export const updateSettings = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const {
//       companyName,
//       contactEmail,
//       radius,
//       enableGeolocation,
//       unit,
//       zoomLevel,
//       mapColor,
//       centerCoordinates,
//     } = req.body;

//     const settings = await Settings.findOne({ user: userId });

//     if (!settings) {
//       return res.status(404).json({ error: "Settings not found for this user." });
//     }

//     // Update settings
//     if (companyName !== undefined) settings.companyName = companyName;
//     if (contactEmail !== undefined) settings.contactEmail = contactEmail;
//     if (radius !== undefined) settings.radius = radius;
//     if (enableGeolocation !== undefined)
//       settings.enableGeolocation = enableGeolocation;
//     if (unit !== undefined) settings.unit = unit;
//     if (zoomLevel !== undefined) settings.zoomLevel = zoomLevel;
//     if (mapColor !== undefined) settings.mapColor = mapColor;
//     if (centerCoordinates !== undefined)
//       settings.centerCoordinates = centerCoordinates;

//     await settings.save();

//     res.status(200).json({
//       message: "Settings updated successfully.",
//       data: settings,
//     });
//   } catch (error) {
//     console.error("Error updating settings:", error);
//     res.status(500).json({
//       error: "Error updating settings.",
//       details: error.message,
//     });
//   }
// };
// export const getSettings = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const settings = await Settings.findOne({ user: userId });

//     if (!settings) {
//       return res.status(200).json({
//         companyName: "",
//         contactEmail: "",
//         radius: "",
//         enableGeolocation: false,
//         unit: "km",
//         zoomLevel: 10,
//         mapColor: "#3498db",
//         centerCoordinates: [35.6895, 139.6917],
//       });
//     }

//     res.status(200).json(settings);
//   } catch (error) {
//     console.error("Error fetching settings:", error);
//     res.status(500).json({
//       error: "Error retrieving settings.",
//       details: error.message,
//     });
//   }
// };
// export const deleteSettings = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const result = await Settings.deleteOne({ user: userId });

//     if (result.deletedCount === 0) {
//       return res.status(404).json({ error: "No settings found for this user." });
//     }

//     res.status(200).json({
//       message: "Settings deleted successfully.",
//     });
//   } catch (error) {
//     console.error("Error deleting settings:", error);
//     res.status(500).json({
//       error: "Error deleting settings.",
//       details: error.message,
//     });
//   }
// };




