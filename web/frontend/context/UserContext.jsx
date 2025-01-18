// UserContext.tsx
import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        try {
          // Replace with your actual API endpoint
          const response = await fetch('http://localhost:5175/api/v1/auth/me', {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Handle invalid token or other errors
            console.error('Failed to fetch user data:', response.statusText);
            localStorage.removeItem('authToken'); // Clear invalid token
            setUser(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          localStorage.removeItem('authToken');
          setUser(null);
        }
      }
    };

    fetchUserData();
  }, []);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};


// import React, { createContext, useState } from 'react';

// export const UserContext = createContext();

// export const UserProvider = ({ children }) => {
//   const [user, setUser] = useState(null);

//   // Logout function
//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem('authToken'); // assuming you store token in localStorage
//   };

//   return (
//     <UserContext.Provider value={{ user, setUser, logout }}>
//       {children}
//     </UserContext.Provider>
//   );
// };






