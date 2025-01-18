import React, { useState } from 'react';
import { TextField, Button, AlphaCard, FormLayout, Banner, Spinner } from '@shopify/polaris';
import axios from 'axios';
import { useNavigate,Link } from 'react-router-dom';
import "../styles/registerForm.css";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const handleSignupNavigation = () => {
    navigate("/login");
  };

  const handleChange = (field) => (value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      setError('All fields are required.');
      return;
    }
  
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5175/api/v1/auth/signup', formData); // Adjust the URL if needed
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
    <div className="login-container">
      <div className="form-wrapper">
        <AlphaCard>
          <h1>Welcome to Mapify Store Register Page</h1> {/* Add the header */}
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
            
            <Button onClick={handleSubmit} primary disabled={loading}>
              {loading ? <Spinner accessibilityLabel="Loading" size="small" /> : 'Register'}
            </Button>
            <div className="auth-links">
                          Already have an account? <Button onClick={handleSignupNavigation}>Login here</Button>
                        </div>
          </FormLayout>
        </AlphaCard>
      </div>
    </div>
  );
};

export default RegisterForm;





