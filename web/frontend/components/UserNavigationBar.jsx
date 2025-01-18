import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/header.css";
import { UserContext } from "../context/UserContext";

const UserNavigationBar = () => {
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
          <NavLink to={`/storereg/${user?.id}`} activeClassName="active">Store Register</NavLink>
          {/* <NavLink to="/settings" activeClassName="active">Settings</NavLink> */}
          <NavLink to="/pricing" activeClassName="active">Pricing</NavLink>
          <NavLink to="/userstorelist" activeClassName="active">Storelist</NavLink>
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

export default UserNavigationBar;



// import React, { useContext } from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import "../styles/header.css";
// import { UserContext } from "../context/UserContext";

// const UserNavigationBar = () => {
//   const { user, setUser } = useContext(UserContext);
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     localStorage.removeItem("userToken");
//     localStorage.removeItem("userRole");
//     localStorage.removeItem("userId");
//     setUser(null);
//     navigate("/login");
//   };

//   return (
//     <header className="cd-header-nav">
//       <nav>
//         <NavLink to={`/storereg/${user?.id}`} activeClassName="active">Store Register</NavLink>
//         <NavLink to="/settings" activeClassName="active">Settings</NavLink>
//         <NavLink to="/pricing" activeClassName="active">Pricing</NavLink>
//         <NavLink to="/userstorelist" activeClassName="active">Storelist</NavLink>
//         {user && (
//           <button className="logout-button" onClick={handleLogout}>
//             Logout
//           </button>
//         )}
//       </nav>
//     </header>
//   );
// };

// export default UserNavigationBar;





