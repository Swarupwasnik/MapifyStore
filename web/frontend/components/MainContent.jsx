import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import LoginForm from "../pages/LoginPage";
import SettingsPage from "../pages/SettingsPage";
import Category from "../pages/Category";
import StoreList from "../pages/UserStoreList";
import Pricing from "../pages/Pricing";
import NavigationBar from "./Header";
import Signup from "../pages/SignupPage";
import AllStore from "../pages/AllStores";

import StoreRegister from "../pages/StoreRegister";
function MainContent() {
  const location = useLocation();

  return (
    <div className="content-section">
      <div className="content-section">
        <NavigationBar />
      </div>

      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/category" element={<Category />} />
        <Route path="/" element={<AllStore />} />
        <Route path="/storereg" element={<StoreRegister />} />
        <Route path="/storereg/:id" element={<StoreRegister />} />

        <Route path="/pricing" element={<Pricing />} />
      </Routes>
    </div>
  );
}

export default MainContent;
