import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(UserContext);

  // If the user is logged in, render the children; otherwise, navigate to /login.
  return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;




// import React, { useContext } from 'react';
// import { Navigate, useLocation } from 'react-router-dom';
// import { UserContext } from '../context/UserContext';

// const ProtectedRoute = ({ element }) => {
//   const { user } = useContext(UserContext);
//   const location = useLocation();

//   return user && user.role === 'admin' ? element : <Navigate to="/login" state={{ from: location }} />;
// };

// export default ProtectedRoute;
