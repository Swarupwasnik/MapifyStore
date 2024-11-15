import React, { useState } from 'react';
import { TextField, Button, AlphaCard, FormLayout, Banner, Spinner } from '@shopify/polaris';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (field) => (value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData.username || !formData.email || !formData.password || !formData.role) {
      setError('All fields are required.');
      return;
    }
  
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5175/api/v1/auth/register', formData); // Adjust the URL if needed
      console.log('Register Response:', response.data); // Log the response
      setSuccess('User registered successfully!');
      setError('');
  
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlphaCard>
      <FormLayout>
        {error && <Banner status="critical">{error}</Banner>}
        {success && <Banner status="success">{success}</Banner>}

        <TextField
          label="Username"
          value={formData.username}
          onChange={handleChange('username')}
          required
        />
        <TextField
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          required
        />
        <TextField
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleChange('password')}
          required
        />
        <TextField
          label="Role (admin/user)"
          value={formData.role}
          onChange={handleChange('role')}
          required
        />
        
        <Button onClick={handleSubmit} primary disabled={loading}>
          {loading ? <Spinner accessibilityLabel="Loading" size="small" /> : 'Register'}
        </Button>
      </FormLayout>
    </AlphaCard>
  );
};

export default Signup;

