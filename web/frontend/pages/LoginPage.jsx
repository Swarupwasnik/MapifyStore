import React, { useState, useContext, useEffect } from "react";
import {
  TextField,
  Button,
  AlphaCard,
  FormLayout,
  Banner,
  Spinner,
} from "@shopify/polaris";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/LoginForm.css";
import { UserContext } from "../context/UserContext";
import { Link } from 'react-router-dom';

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSignupNavigation = () => {
    navigate('/signup');
  };

  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [headerText, setHeaderText] = useState("Welcome to Mapify Store");

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    const role = localStorage.getItem("userRole");
    const userId = localStorage.getItem("userId");
    if (token && role) {
      setUser({ token, role, id: userId });
      navigate(role === "admin" ? "/allstore" : `/storereg/${userId}`);
      setHeaderText(
        role === "admin"
          ? "Welcome to Mapify Store Admin Page"
          : "Welcome to Mapify Store"
      );
    } else {
      navigate(location.pathname === '/signup' ? '/signup' : '/login');
    }
  }, [navigate, setUser]);

  const handleChange = (field) => (value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5175/api/v1/auth/login",
        formData
      );
      const { token, role, _id } = response.data;

      if (!token || !role || !_id) {
        setError("Invalid response from server.");
        setLoading(false);
        return;
      }

      setSuccess("Login successful!");
      setError("");

      localStorage.setItem("userToken", token);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userId", _id);
      setUser({ token, role, id: _id });

      setHeaderText(
        role === "admin"
          ? "Welcome to Mapify Store Admin Page"
          : "Welcome to Mapify Store"
      );

      navigate(role === "admin" ? "/allstore" : `/storereg/${_id}`);
    } catch (err) {
      console.error("Login Error:", err); // Log the complete error object
      if (err.response && err.response.status === 401) {
        setError("Incorrect email or password. Please try again.");
      } else {
        setError("An error occurred. Please try again.");
      }
      setSuccess("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="form-wrapper">
        <AlphaCard>
          <h1>{headerText}</h1>
          <FormLayout>
            {error && <Banner status="critical">{error}</Banner>}
            {success && <Banner status="success">{success}</Banner>}

            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange("email")}
              autoComplete="email"
              required
            />
            <TextField
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange("password")}
              autoComplete="current-password"
              required
            />

            <Button onClick={handleSubmit} primary disabled={loading}>
              {loading ? (
                <Spinner accessibilityLabel="Loading" size="small" />
              ) : (
                "Login"
              )}
            </Button>
            <div className="auth-links">
              Don't have an account? <Button onClick={handleSignupNavigation}>Register here</Button>
            </div>
          </FormLayout>
        </AlphaCard>
      </div>
    </div>
  );
};

export default LoginForm;



