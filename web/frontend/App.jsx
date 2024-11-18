

import React from "react";
import { BrowserRouter,Route,Routes } from "react-router-dom";
import { PolarisProvider } from './components/providers';
 import { QueryProvider } from "./components/providers";
 import MainContent from "./components/MainContent";
import { SettingsProvider } from "./context/SettingsContext";


export default function App() {
  return (
    <PolarisProvider>
      <BrowserRouter>
      <SettingsProvider>

          <QueryProvider>
              <div className="main-section">
                <MainContent />
              </div>
          </QueryProvider>
      </SettingsProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}







