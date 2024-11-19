import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PolarisProvider } from './components/providers';
import { QueryProvider } from "./components/providers";
import MainContent from "./components/MainContent";
import { SettingsProvider } from "./context/SettingsContext";
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Create a Material-UI theme
const muiTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Customize the primary color
    },
    secondary: {
      main: '#ff4081', // Customize the secondary color
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

export default function App() {
  return (
    <PolarisProvider>
      <BrowserRouter>
        <SettingsProvider>
          <QueryProvider>
            {/* Wrap the app with Material-UI ThemeProvider */}
            <ThemeProvider theme={muiTheme}>
              <div className="main-section">
                <MainContent />
              </div>
            </ThemeProvider>
          </QueryProvider>
        </SettingsProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}


// import React from "react";
// import { BrowserRouter,Route,Routes } from "react-router-dom";
// import { PolarisProvider } from './components/providers';
//  import { QueryProvider } from "./components/providers";
//  import MainContent from "./components/MainContent";
// import { SettingsProvider } from "./context/SettingsContext";


// export default function App() {
//   return (
//     <PolarisProvider>
//       <BrowserRouter>
//       <SettingsProvider>

//           <QueryProvider>
//               <div className="main-section">
//                 <MainContent />
//               </div>
//           </QueryProvider>
//       </SettingsProvider>
//       </BrowserRouter>
//     </PolarisProvider>
//   );
// }







