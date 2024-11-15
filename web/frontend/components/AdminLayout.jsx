import React from 'react';
import { Frame, Navigation } from '@shopify/polaris';
import { useNavigate } from 'react-router-dom';
import { useAdminContext } from '../context/AdminContext';

const AdminLayout = () => {
  const navigate = useNavigate();
  const { pageContent, handleLogout } = useAdminContext();

  return (
    <Frame>
      <Navigation>
        <Navigation.Section
          items={[
            {
              label: 'Admin Dashboard',
              onClick: () => navigate('/admin'),
            },
            {
              label: 'Catogry',
              onClick :() => navigate ("/admin/catgory")

            },
            {
              label: 'All Stores',
              onClick: () => navigate('/allstores'),
            },
            {
              label: 'Published Stores',
              onClick: () => navigate('/admin/publish'),
            },
            {
              label: 'Unpublished Stores',
              onClick: () => navigate('/admin/unpublish'),
            },
            {
              label: 'Logout', // Adding Logout option
              onClick: handleLogout, // Call handleLogout function
            },
          ]}
        />
      </Navigation>
      <div className="admin-content">
        {pageContent} {/* Render the page content */}
      </div>
    </Frame>
  );
};

export default AdminLayout;











