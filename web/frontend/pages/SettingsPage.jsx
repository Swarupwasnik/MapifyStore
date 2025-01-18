import React, { useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Circle,
} from "react-leaflet";
import L from "leaflet";
import "../styles/settings.css";
import { Alert, Snackbar } from "@mui/material";

// Leaflet icon configuration
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const SettingsPage = () => {
  // State variables
  const [company, setCompany] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [zoomLevel, setZoomLevel] = useState(10);
  const [radius, setRadius] = useState("5");
  const [unit, setUnit] = useState("km");
  const [mapColor, setMapColor] = useState("#3498db");
  const [center, setCenter] = useState([21.14979, 79.08069]);
  const [enableGeolocation, setEnableGeolocation] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "", open: false });

  const showAlert = (message, type) => {
    setAlert({ message, type, open: true });
  };
  const handleCloseAlert = () => {
    setAlert((prev) => ({ ...prev, open: false }));
  };
  // Fetch settings on component mount
  
// Fetch settings on component mount
useEffect(() => {
  const fetchSettings = async () => {
      try {
          const token = localStorage.getItem("userToken"); // Change from "token" to "userToken"
          if (!token) {
              console.error("Token is missing from localStorage");
              showAlert("Authentication token is missing. Please log in.", "error");
              window.location.href = "/login"; // Redirect to login
              return;
          }

          const response = await fetch("http://localhost:5175/api/v1/settings/settings1", {
              headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
              },
          });

          if (response.ok) {
              const settings = await response.json();
              // Update state with fetched settings
              setCompany(settings.companyName || "");
              setContactEmail(settings.contactEmail || "");
              setZoomLevel(settings.zoomLevel || 10);
              setRadius(settings.radius || "5");
              setUnit(settings.unit || "km");
              setMapColor(settings.mapColor || "#3498db");
              setCenter(settings.centerCoordinates || [21.14979, 79.08069]);
              setEnableGeolocation(settings.enableGeolocation || false);
          } else if (response.status === 401) {
              console.error("Authentication error");
              showAlert("Session expired. Please log in again.", "error");
              localStorage.removeItem("userToken"); // Clear invalid token
              window.location.href = "/login"; // Redirect to login
          } else {
              console.error("Failed to fetch settings");
              showAlert("Failed to fetch settings.", "error");
          }
      } catch (error) {
          console.error("Error fetching settings:", error);
          showAlert("Error fetching settings.", "error");
      }
  };

  fetchSettings();
}, []);



  // Save settings handler
  const handleSave = async () => {
    // Validation
    if (!company.trim()) {
      showAlert("Company Name is required.");
      return;
    }

    if (!contactEmail.trim() || !/\S+@\S+\.\S+/.test(contactEmail)) {
      showAlert("A valid Contact Email is required.");
      return;
    }

    if (!radius || isNaN(Number(radius)) || Number(radius) <= 0) {
      showAlert("Radius must be a valid positive number.");
      return;
    }

    if (
      !center ||
      center.length !== 2 ||
      isNaN(center[0]) ||
      isNaN(center[1])
    ) {
      showAlert(
        "Center coordinates must be valid latitude and longitude values."
      );
      return;
    }

    try {
      // Prepare settings object
      const token = localStorage.getItem("userToken");

      const updatedSettings = {
        companyName: company,
        contactEmail: contactEmail,
        radius,
        unit,
        zoomLevel,
        mapColor,
        centerCoordinates: center,
        enableGeolocation,
      };

      // Send update request
      const response = await fetch(
        `http://localhost:5175/api/v1/settings/settings1`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedSettings),
        }
      );

      if (response.ok) {
        showAlert("Settings saved successfully!");
      } else {
        const errorData = await response.json();
        showAlert(`Error saving settings: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      showAlert("Error saving settings.");
    }
  };

  // Cancel handler
  const handleCancel = () => {
    // Reload the original settings
    window.location.reload();
  };

  // Dynamic Map Component
  const DynamicMap = ({ zoomLevel, center, mapColor }) => {
    const map = useMap();

    useEffect(() => {
      map.setView(center, zoomLevel);
      map.getContainer().style.backgroundColor = mapColor;
    }, [zoomLevel, center, mapColor, map]);

    return null;
  };

  return (
    <div className="store-locator-settings">
      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.type}>
          {alert.message}
        </Alert>
      </Snackbar>
      <h2 className="store-ls-top">Store Locator Settings</h2>

      <div className="store-locator-section store-general-info">
        <h3>General Information</h3>
        <div className="store-inp-flex">
          <input
            type="text"
            placeholder="Company Name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
          <input
            type="email"
            placeholder="Contact Email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="store-locator-section location-settings store-general-info">
        <h3>Store Location Settings</h3>
        <div className="store-locator-map-flex">
          <div className="store-locator-map-left">
            <div className="store-locator-field">
              <label>Default Radius for Search (KM)</label>
              <select
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
              >
                <option value="2">2KM</option>
                <option value="5">5KM</option>
                <option value="10">10 KM</option>
              </select>
            </div>

            <div className="store-locator-field">
              <label>
                <input
                  type="checkbox"
                  checked={enableGeolocation}
                  onChange={() => setEnableGeolocation(!enableGeolocation)}
                />{" "}
                Enable Geolocation
              </label>
            </div>

            <div className="store-locator-field">
              <label>Distance Unit</label>
              <div>
                <label>
                  <input
                    type="radio"
                    name="unit"
                    value="km"
                    checked={unit === "km"}
                    onChange={() => setUnit("km")}
                  />
                  Kilometers (KM)
                </label>
                <label>
                  <input
                    type="radio"
                    name="unit"
                    value="miles"
                    checked={unit === "miles"}
                    onChange={() => setUnit("miles")}
                  />
                  Miles
                </label>
              </div>
            </div>
          </div>

          <div className="store-locator-map-container">
            <MapContainer
              center={center}
              zoom={zoomLevel}
              style={{ height: "300px", width: "100%" }}
              whenCreated={(map) => map.invalidateSize()}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={center}>
                <Popup>Store Location</Popup>
              </Marker>
              <Circle
                center={center}
                radius={radius * (unit === "km" ? 1000 : 1609.34)}
              />
              <DynamicMap
                zoomLevel={zoomLevel}
                center={center}
                mapColor={mapColor}
              />
            </MapContainer>
          </div>
        </div>
      </div>

      <div className="store-locator-section store-locator-field store-general-info store-map-appearance">
        <h3>Map Appearance</h3>
        <label>Map Zoom Level</label>
        <input
          type="range"
          min="1"
          max="20"
          value={zoomLevel}
          onChange={(e) => setZoomLevel(parseInt(e.target.value))}
        />

        <div className="color-picker">
          <label>Map Color</label>
          <HexColorPicker color={mapColor} onChange={setMapColor} />
        </div>
      </div>

      <div className="settings-actions">
        <button className="save-button" onClick={handleSave}>
          Save
        </button>
        <button className="cancel-button" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
