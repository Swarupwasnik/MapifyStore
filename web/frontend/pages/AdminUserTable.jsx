import React, { useEffect, useState } from 'react';
import { Page, Card, DataTable } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';

const AdminUserTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5175/api/v1/auth/all-user', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`, // Add your token here
          },
        });
        const data = await response.json();
        setUsers(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const rows = users.map(user => [
    user.username,
    user.email,
    user.subscription,
    new Date(user.createdAt).toLocaleDateString(), // Format date as needed
  ]);

  return (
    <Page title="User Table">
      <Card>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <DataTable
            columnContentTypes={[
              'text',
              'text',
              'text',
              'text',
            ]}
            headings={[
              'Username',
              'Email',
              'Subscription',
              'Created At',
            ]}
            rows={rows}
          />
        )}
      </Card>
    </Page>
  );
};

export default AdminUserTable;
