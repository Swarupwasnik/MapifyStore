import React, { createContext, useState } from "react";

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    radius: 5,
    unit: "km",
    zoomLevel: 10,
    mapColor: "#3498db",
    centerCoordinates: [35.6895, 139.6917], // Default location (Tokyo)
    enableGeolocation: false,
  });

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
