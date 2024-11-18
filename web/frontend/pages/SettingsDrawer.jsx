import React, { useState, useEffect } from "react";
import "../styles/settingsDrawer.css";
const SettingsDrawer = ({ isOpen, toggleDrawer }) => {
  const [openSection, setOpenSection] = useState(null);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleLimitClick = (limit) => {
    onLimitChange(limit); 
  };

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await fetch(
          "http://localhost:5175/api/v1/stores/published"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch stores");
        }
        const data = await response.json();
        setStores(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  return (
    <div className={`settings-drawer ${isOpen ? "open" : ""}`}>
      <div className="drawer-settings-container">
        <button className="drawer-close-btn" onClick={toggleDrawer}>
          X
        </button>
        <h2 className="drawer-box-title">Store Locator Advanced Options</h2>

        <div className="drawer-box-padd">
          <div className="drwer-wrap-main-btns">
            <button className="draer-button-tab">Basic Settings</button>
            <button className="draer-button-tab">Search & Filter</button>
            <button className="draer-button-tab">Map Control</button>
          </div>

          <div className="drawer-wrap-section">
            <h3
              onClick={() => toggleSection("template")}
              className="drawer-wrap-section-title"
            >
              Template
            </h3>
            {openSection === "template" && (
              <div className="drawer-wrap-button-group">
                {[
                  "Template 0",
                  "Template 1",
                  "Template 2",
                  "Template 3",
                  "Template 4",
                ].map((template) => (
                  <button key={template} className="drawer-option-button">
                    {template}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="drawer-wrap-section">
            <h3
              onClick={() => toggleSection("infoBox")}
              className="drawer-wrap-section-title"
            >
              InfoBox Layout
            </h3>
            {openSection === "infoBox" && (
              <div className="drawer-info-box-layout">
                {stores.length > 0 ? (
                  stores.map((store) => (
                    <div key={store.id} className="drawer-info-box">
                      <h4 className="drawer-info-box-title">{store.name}</h4>
                      <p>
                        {store.address
                          ? `${store.address.street}, ${store.address.city}, ${store.address.state}, ${store.address.postalCode}, ${store.address.country}`
                          : "Address not available"}
                      </p>
                      <p>📧 {store.email}</p>
                      <p>
                        📞{" "}
                        {store.phone
                          ? `${store.phone.countryCode} ${store.phone.number}`
                          : "N/A"}
                      </p>
                      <div className="drawer-info-box-buttons">
                        <button className="drawer-info-box-button">
                          Directions
                        </button>
                        <button className="drawer-info-box-button">Zoom</button>
                        <button className="drawer-info-box-button">
                          Website
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No stores available</p>
                )}
              </div>
            )}
          </div>

          <div className="drawer-wrap-section">
            <h3
              onClick={() => toggleSection("colorScheme")}
              className="drawer-wrap-section-title"
            >
              Color Scheme
            </h3>
            {openSection === "colorScheme" && (
              <div className="drawer-color-scheme-options">
                {[
                  "#b22222",
                  "#003366",
                  "#800000",
                  "#0099cc",
                  "#4d4d4d",
                  "#ff9933",
                  "#cc0033",
                  "#996699",
                  "#669966",
                ].map((color, index) => (
                  <div
                    key={index}
                    className="drawer-color-box"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="drawer-wrap-section">
            <h3
              onClick={() => toggleSection("DistanceControl")}
              className="drawer-wrap-section-title"
            >
              Distance Control
            </h3>
            {openSection === "DistanceControl" && (
              <div className="drawer-wrap-button-group">
                {["Slider", "Dropdown", "Boundary Box"].map((option) => (
                  <button key={option} className="drawer-option-button">
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="drawer-wrap-section">
            <h3
              onClick={() => toggleSection("DistanceUnit")}
              className="drawer-wrap-section-title"
            >
              Distance Unit
            </h3>
            {openSection === "DistanceUnit" && (
              <div className="drawer-wrap-button-group">
                {["KM", "Miles"].map((unit) => (
                  <button key={unit} className="drawer-option-button">
                    {unit}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="drawer-wrap-section">
            <h3
              onClick={() => toggleSection("TimeFormat")}
              className="drawer-wrap-section-title"
            >
              Time Format
            </h3>
            {openSection === "TimeFormat" && (
              <div className="drawer-wrap-button-group">
                {["12 Hours", "24 Hours"].map((format) => (
                  <button key={format} className="drawer-option-button">
                    {format}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="drawer-wrap-section">
            <h3
              onClick={() => toggleSection("Prompt")}
              className="drawer-wrap-section-title"
            >
              Prompt
            </h3>
            {openSection === "Prompt" && (
              <div className="drawer-wrap-button-group">
                {[
                  "NONE",
                  "GeoLocation Dialog",
                  "Type your Location Dialog",
                  "GeoLocation On Page Load",
                  "GEOJS (Free API)",
                ].map((prompt) => (
                  <button key={prompt} className="drawer-option-button">
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="drawer-wrap-section">
            <h3
              onClick={() => toggleSection("HoursStyle")}
              className="drawer-wrap-section-title"
            >
              Hours Style
            </h3>
            {openSection === "HoursStyle" && (
              <div className="drawer-wrap-button-group">
                {["Today Hours", "Week Hours", "Grouped"].map((style) => (
                  <button key={style} className="drawer-option-button">
                    {style}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="drawer-wrap-section">
            <h3
              onClick={() => toggleSection("FullHeight/Width")}
              className="drawer-wrap-section-title"
            >
              Full Height/Width
            </h3>
            {openSection === "FullHeight/Width" && (
              <div className="drawer-wrap-button-group">
                {[
                  "None",
                  "Full Width",
                  "Full Height (Not Fixed)",
                  "Full Height (Not Fixed)",
                ].map((style) => (
                  <button key={style} className="drawer-option-button">
                    {style}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="drawer-wrap-section">
            <h3
              onClick={() => toggleSection("SortList")}
              className="drawer-wrap-section-title"
            >
              Sort List
            </h3>
            {openSection === "SortList" && (
              <div className="drawer-wrap-button-group">
                {[
                  "Default (Distance)",
                  "Title",
                  "City",
                  "State",
                  "Categories",
                ].map((style) => (
                  <button key={style} className="drawer-option-button">
                    {style}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="drawer-wrap-section">
            <h3
              onClick={() => toggleSection("WebsiteLink")}
              className="drawer-wrap-section-title"
            >
              Website Link
            </h3>
            {openSection === "WebsiteLink" && (
              <div className="drawer-wrap-button-group">
                {["Same Tab", "New Tab"].map((style) => (
                  <button key={style} className="drawer-option-button">
                    {style}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="drawer-wrap-section">
            <h3
              onClick={() => toggleSection("DisplayList")}
              className="drawer-wrap-section-title"
            >
              Display List
            </h3>
            {openSection === "DisplayList" && (
              <div className="drawer-wrap-button-group">
                {["Yes", "No"].map((style) => (
                  <button key={style} className="drawer-option-button">
                    {style}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="drawer-wrap-section">
            <h3
              onClick={() => toggleSection("TabsLayout")}
              className="drawer-wrap-section-title"
            >
              Tabs Layout
            </h3>
            {openSection === "TabsLayout" && (
              <div className="drawer-wrap-button-group">
                {["Tabs Layout", "Dropdowns"].map((style) => (
                  <button key={style} className="drawer-option-button">
                    {style}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="drawer-wrap-section">
            <h3
              onClick={() => toggleSection("StoresLimit")}
              className="drawer-wrap-section-title"
            >
              Stores Limit
            </h3>
            {openSection === "StoresLimit" && (
              <div className="drawer-wrap-button-group">
                {[
                  "Limit 1 Stores",
                  "Limit 2 Stores",
                  "Limit 5 Stores",
                  "Limit 10 Stores",
                  "Limit 20 Stores",
                  "Limit 25 Stores",
                ].map((style) => (
                  <button key={style}
                  onClick={() => handleLimitClick(parseInt(style.split(" ")[1]))}

                  className="drawer-option-button">
                    {style}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="drawer-wrap-section">
            <h3
              onClick={() => toggleSection("GDPRCompliance")}
              className="drawer-wrap-section-title"
            >
              GDPR Compliance
            </h3>
            {openSection === "GDPRCompliance" && (
              <div className="drawer-wrap-button-group">
                {["Toggle GDPR Compliance"].map((style) => (
                  <button key={style} className="drawer-option-button">
                    {style}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsDrawer;
