import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/header.css";
import { UserContext } from "../context/UserContext";

const AdminNavigationBar = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    setUser(null);
    navigate("/login");
  };

  return (
    <header className="cd-header-nav">
      <nav>
        <div className="dis">
          <NavLink to="/allstore" activeClassName="active">
            Storelist
          </NavLink>
          <NavLink to="/adminsettings" activeClassName="active">
            Settings
          </NavLink>
          <NavLink to="/category" activeClassName="active">
            Category
          </NavLink>
          <NavLink to="/adpricing" activeClassName="active">
            Pricing
          </NavLink>
        </div>
        <div className="dis">
          {user && (
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default AdminNavigationBar;
