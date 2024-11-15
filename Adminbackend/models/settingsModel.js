
import mongoose from "mongoose";

// Define the schema for settings
const settingsSchema = new mongoose.Schema({
  companyName: {
    type: String,
    default: ""
  },
  contactEmail: {
    type: String,
    default: ""
  },
  radius: {
    type: String,
    default: ""
  },
  enableGeolocation: {
    type: Boolean,
    default: false
  },
  unit: {
    type: String,
    enum: ["km", "miles"],
    default: "km"
  },
  zoomLevel: {
    type: Number,
    default: 10
  },
  mapColor: {
    type: String,
    default: "#3498db"
  },
  centerCoordinates: {
    type: [Number],
    default: [35.6895, 139.6917]
  }
});

// Create the model from the schema
const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;

  