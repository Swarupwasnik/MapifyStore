
import React, { useContext } from 'react';
import UserStoreRegister from '../pages/UserStoreRegister';
import { UserContext } from '../context/UserContext';
import { Navigate } from 'react-router-dom';
import LoginForm from '../pages/LoginPage';

const UserPanel = () => {
  const { user } = useContext(UserContext);

  // If no user is authenticated, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      <LoginForm/>
    </div>
  );
};

export default UserPanel;


// import React from 'react';
// import UserStoreRegister from '../pages/UserStoreRegister';
// const UserPanel = () => {
//   return (
//     <div>
// <UserStoreRegister/>
 
//     </div>
//   );
// }

// export default UserPanel;
