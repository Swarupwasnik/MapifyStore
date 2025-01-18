import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "../pages/LoginPage";
import SettingsPage from "../pages/SettingsPage";
import Category from "../pages/Category";
import Pricing from "../pages/Pricing";
import AdminNavigationBar from "./AdminNavigationBar";
import UserNavigationBar from "./UserNavigationBar";
import AllStore from "../pages/AllStores";
import UserStoreList from "../pages/UserStoreList";
import UserPanel from "./Userpanel";
import AdminPanel from "./AdminPanel";
import AdminSettings from "../pages/AdminSettings";
import AdminPricing from "../pages/AdminPricing";
import ProtectedRoute from "./ProtectedRoute";
import { UserContext } from "../context/UserContext";
import NotFound from "../pages/NotFound";
import RegisterForm from "../pages/SignupPage";
import AdminStoreRegister from "../pages/AdminStoreRegister";
import UserStoreRegister from "../pages/UserStoreRegister";
import AdminUserTable from "../pages/AdminUserTable";
function MainContent() {
  const { user } = useContext(UserContext);

  return (
    <div className="content-section">
      {/* Render navigation bar based on user role only if user is authenticated */}
      {user && user.role === "admin" ? (
        <AdminNavigationBar />
      ) : user ? (
        <UserNavigationBar />
      ) : null}

      {/* Define routes */}
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<RegisterForm />} />
        <Route
          path="/adminsettings"
          element={
            <ProtectedRoute>
              <AdminSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/category"
          element={
            <ProtectedRoute>
              <Category />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/adpricing"
          element={
            <ProtectedRoute>
              <AdminPricing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/allstore"
          element={
            <ProtectedRoute>
              <AllStore />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pricing"
          element={
            <ProtectedRoute>
              <Pricing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/storereg"
          element={
            <ProtectedRoute>
              <AdminStoreRegister />
            </ProtectedRoute>
          }
        />
        <Route
          path="/storereg/:id"
          element={
            <ProtectedRoute>
              <UserStoreRegister />
            </ProtectedRoute>
          }
        />
        <Route
          path="/userstorelist"
          element={
            <ProtectedRoute>
              <UserStoreList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            user ? (
              <Navigate
                to={user.role === "admin" ? "/admin" : "/userstorelist"}
                replace
              />
            ) : (
              <LoginForm />
            )
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default MainContent;
