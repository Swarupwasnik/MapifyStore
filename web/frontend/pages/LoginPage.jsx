import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  AlphaCard,
  FormLayout,
  Banner,
  Spinner,
} from "@shopify/polaris";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (token) {
      navigate("/admin");
    }
  }, [navigate]);

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
      console.log("Login Response:", response.data); // Log the response
      const { token, role } = response.data;

      if (!token || !role) {
        setError("Invalid response from server.");
        setLoading(false);
        return;
      }

      setSuccess("Login successful!");
      setError("");

      localStorage.setItem("userToken", token);
      localStorage.setItem("userRole", role);

      if (role === "admin") {
        navigate("/admin");
      } else {
        setError("Access denied. You are not an admin.");
      }
    } catch (err) {
      setError(
        err.response?.data?.error || "An error occurred. Please try again."
      );
      setSuccess("");
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
        {/* <Button onClick={handleSignupRedirect} plain>Create an account</Button> */}
      </FormLayout>
    </AlphaCard>
  );
};

export default LoginForm;
