import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Card,
  FormLayout,
  Checkbox,
  Banner,
  Select,
} from "@shopify/polaris";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    storename: "",
    ownername: "",
    email: "",
    phone: "",
    category: "",
    street: "",
    pincode: "",
    state: "",
    country: "",
    password: "",
    website: "",
    city: "",
    additional: "",
    agreeToPrivacyPolicy: false,
    role: "user",
  });

  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5175/api/v1/category/getcategory"
        );
        const categoryOptions = response.data.map((category) => ({
          label: category.name,
          value: category._id,
        }));
        setCategories(categoryOptions);
      } catch (err) {
        setError("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (field) => (value) => {
    if (field === "phone" && !/^\d{0,10}$/.test(value)) return; // Limit to 10 digits
    if (field === "password" && value.length > 5) return; // Limit password to 5 characters
    if (field === "additional" && value.split(" ").length > 250) return; // Limit to 250 words

    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    // Frontend validations
    if (!/^\d{10}$/.test(formData.phone)) {
      setError("Phone number must be exactly 10 digits");
      return;
    }
    if (
      !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(
        formData.website
      ) &&
      formData.website
    ) {
      setError("Please enter a valid website URL");
      return;
    }
    if (formData.password.length !== 5) {
      setError("Password must be exactly 5 characters long");
      return;
    }
    if (formData.additional.split(" ").length > 250) {
      setError("Additional information cannot exceed 250 words");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5175/api/v1/auth/register",
        formData
      );
      setSuccess(response.data.message);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
      setSuccess("");
    }
  };

  return (
    <Card sectioned>
      <FormLayout>
        {error && <Banner status="critical">{error}</Banner>}
        {success && <Banner status="success">{success}</Banner>}

        <TextField
          label="Store Name"
          value={formData.storename}
          onChange={handleChange("storename")}
          autoComplete="off"
          required
        />

        <TextField
          label="Owner Name"
          value={formData.ownername}
          onChange={handleChange("ownername")}
          autoComplete="off"
          required
        />

        <TextField
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange("email")}
          autoComplete="off"
          required
        />

        <TextField
          label="Phone"
          value={formData.phone}
          onChange={handleChange("phone")}
          autoComplete="off"
          required
          helpText="Enter a 10-digit phone number"
        />

        <Select
          label="Category"
          options={categories}
          value={formData.category}
          onChange={handleChange("category")}
          placeholder="Select a category"
          required
        />

        <TextField
          label="Street"
          value={formData.street}
          onChange={handleChange("street")}
          autoComplete="off"
          required
        />

        <TextField
          label="Pincode"
          value={formData.pincode}
          onChange={handleChange("pincode")}
          autoComplete="off"
          required
        />

        <TextField
          label="State"
          value={formData.state}
          onChange={handleChange("state")}
          autoComplete="off"
          required
        />

        <TextField
          label="Country"
          value={formData.country}
          onChange={handleChange("country")}
          autoComplete="off"
          required
        />

        <TextField
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleChange("password")}
          autoComplete="off"
          required
          helpText="Password must be exactly 5 characters long"
        />

        <TextField
          label="Website"
          type="url"
          value={formData.website}
          onChange={handleChange("website")}
          autoComplete="off"
          helpText="Enter a valid URL (optional)"
        />

        <TextField
          label="City"
          value={formData.city}
          onChange={handleChange("city")}
          autoComplete="off"
          required
        />

        <TextField
          label="Additional Information"
          value={formData.additional}
          onChange={handleChange("additional")}
          autoComplete="off"
          multiline
          helpText="Maximum 250 words"
        />

        <Checkbox
          label="Agree to Privacy Policy"
          checked={formData.agreeToPrivacyPolicy}
          onChange={(newValue) =>
            setFormData({ ...formData, agreeToPrivacyPolicy: newValue })
          }
        />

        <Button onClick={handleSubmit} primary>
          Register
        </Button>
      </FormLayout>
    </Card>
  );
};

export default RegistrationForm;
