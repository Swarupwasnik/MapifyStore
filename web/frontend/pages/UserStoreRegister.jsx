import React, { useState, useEffect } from "react";
import { Snackbar, Alert, CircularProgress, Button } from "@mui/material";

import "../styles/App.css";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
const UserStoreRegister = () => {
  const { storeId } = useParams();
  const [categories, setCategories] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarProps, setSnackbarProps] = useState({ message: "", severity: "" });
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setSuccessMessage("");
    setErrorMessage("");
  };
  const [formData, setFormData] = useState({
    company: "",
    name: "",
    websiteURL: "",
    fax: "",
    email: "",
    phone: {
      countryCode: "",
      number: "",
    },
    categoryId: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
    additional: "",
    workingHours: [
      { day: "Monday", isOpen: true, start: "09:00", end: "18:00" },
      { day: "Tuesday", isOpen: true, start: "09:00", end: "18:00" },
      { day: "Wednesday", isOpen: true, start: "09:00", end: "18:00" },
      { day: "Thursday", isOpen: true, start: "09:00", end: "18:00" },
      { day: "Friday", isOpen: true, start: "09:00", end: "18:00" },
      { day: "Saturday", isOpen: true, start: "09:00", end: "18:00" },
      { day: "Sunday", isOpen: false, start: "09:00", end: "18:00" },
    ],

    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleCancel = () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel and clear all fields?"
    );
    if (confirmCancel) {
      setFormData({
        company: "",
        name: "",
        websiteURL: "",
        fax: "",
        email: "",
        phone: {
          countryCode: "",
          number: "",
        },
        categoryId: "",
        address: {
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        },
        additional: "",
        workingHours: [
          { day: "Monday", isOpen: true, start: "09:00", end: "18:00" },
          { day: "Tuesday", isOpen: true, start: "09:00", end: "18:00" },
          { day: "Wednesday", isOpen: true, start: "09:00", end: "18:00" },
          { day: "Thursday", isOpen: true, start: "09:00", end: "18:00" },
          { day: "Friday", isOpen: true, start: "09:00", end: "18:00" },
          { day: "Saturday", isOpen: true, start: "09:00", end: "18:00" },
          { day: "Sunday", isOpen: false, start: "09:00", end: "18:00" },
        ],
        agreeToTerms: false,
      });
      setErrors({});
    }
  };



  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5175/api/v1/category/publishcategory"
        );

        setCategories(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Failed to load categories.", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for additional information
    if (name === "additional") {
      // Limit to 150 words
      const words = value.split(/\s+/);
      const limitedValue = words.slice(0, 150).join(" ");

      setFormData((prevData) => ({
        ...prevData,
        [name]: limitedValue,
      }));
    } else {
      // Default handling for other fields
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }

    // Clear any previous errors for this field
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };
  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     [name]: value,
  //   }));
  //   setErrors((prevErrors) => ({
  //     ...prevErrors,
  //     [name]: "",
  //   }));
  // };
  const handlePhoneChange = (e) => {
    const { name, value } = e.target;

    // Restrict input based on field
    let processedValue = value;

    if (name === "countryCode") {
      // Allow only digits and + at the start, max 2 digits
      processedValue = value.replace(/[^+\d]/g, "");
      processedValue = processedValue.slice(0, 3); // Including potential + sign
    } else if (name === "number") {
      // Allow only digits, max 10 digits
      processedValue = value.replace(/\D/g, "");
      processedValue = processedValue.slice(0, 10);
    }

    setFormData((prevData) => ({
      ...prevData,
      phone: { ...prevData.phone, [name]: processedValue },
    }));

    // Clear any previous phone-related errors
    setErrors((prevErrors) => ({
      ...prevErrors,
      phone: { ...prevErrors.phone, [name]: "" },
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      address: { ...prevData.address, [name]: value },
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      address: { ...prevErrors.address, [name]: "" },
    }));
  };

  const handleWorkingHoursChange = (index, field, value) => {
    setFormData((prevData) => {
      const workingHours = [...prevData.workingHours];
      workingHours[index][field] = value;
      return { ...prevData, workingHours };
    });
  };

  const handleToggleDay = (index) => {
    setFormData((prevData) => {
      const workingHours = [...prevData.workingHours];
      workingHours[index].isOpen = !workingHours[index].isOpen;
      return { ...prevData, workingHours };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.company) newErrors.company = "Company is required";
    if (!formData.name) newErrors.name = "Name is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    const countryCodeRegex = /^\+?\d{1,2}$/;
    const phoneNumberRegex = /^\d{10}$/;

    if (!formData.phone.countryCode) {
      newErrors.countryCode = "Country code is required";
    } else if (!countryCodeRegex.test(formData.phone.countryCode)) {
      newErrors.countryCode = "Country code must be 1-2 digits";
    }

    if (!formData.phone.number) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!phoneNumberRegex.test(formData.phone.number)) {
      newErrors.phoneNumber = "Phone number must be 10 digits";
    }
    const faxRegex = /^\d{4}$/;
    if (formData.fax && !faxRegex.test(formData.fax)) {
      newErrors.fax = "Fax number must be 4 digits";
    }

    if (!formData.address.street) newErrors.street = "Street is required";
    if (!formData.address.city) newErrors.city = "City is required";
    if (!formData.address.state) newErrors.state = "State is required";
    const postalCodeRegex = /^\d{6}$/;
    if (!formData.address.postalCode) {
      newErrors.postalCode = "Postal code is required";
    } else if (!postalCodeRegex.test(formData.address.postalCode)) {
      newErrors.postalCode = "Postal code must be 6 digits";
    }

    if (!formData.address.country) newErrors.country = "Country is required";
    if (!formData.agreeToTerms)
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    if (formData.additional && formData.additional.length > 150) {
      newErrors.additional = "Additional information must be 150 words or less";
    }
    if (!formData.categoryId) newErrors.categoryId = "Category is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const renderCharacterCount = () => {
    const additionalInfo = formData.additional || "";
    const wordCount = additionalInfo.split(/\s+/).length;

    return (
      <div className="character-count">
        {wordCount}/150 words
        {wordCount > 150 && (
          <span className="error">Maximum word limit exceeded</span>
        )}
      </div>
    );
  };
  // newlyadd

  // Add this useEffect to check email on change
  useEffect(() => {
    if (formData.email) {
      const checkEmailDebounced = debounce(() => {
        emailAlreadyRegistered(formData.email);
      }, 500);

      checkEmailDebounced();

      // Cleanup function
      return () => {
        checkEmailDebounced.cancel();
      };
    }
  }, [formData.email]);

  // Modify emailAlreadyRegistered function
  const emailAlreadyRegistered = async (email) => {
    try {
      const response = await axios.get(
        `http://localhost:5175/api/v1/stores/check-email?email=${email}`
      );

      setErrors((prevErrors) => ({
        ...prevErrors,
        emailAlreadyRegistered: response.data.exists
          ? "Email is already registered"
          : undefined,
      }));

      return response.data.exists;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) return;
  
    setLoading(true);
  
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        alert("Please log in to continue.");
        navigate("/login");
        return;
      }
  
      const userSubscription = localStorage.getItem("userSubscription");
      const maxStores =
        userSubscription === "free"
          ? 1
          : userSubscription === "pro"
          ? 10
          : userSubscription === "enterprise"
          ? 100
          : 0;
  
      const storeCountResponse = await axios.get(
        "http://localhost:5175/api/v1/stores/count",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      if (storeCountResponse.status === 200) {
        const storeCount = storeCountResponse.data.storeCount;
        console.log(`Store Count: ${storeCount}, Max Stores: ${maxStores}`);
  
        if (storeCount >= maxStores) {
          alert("Store limit exceeded. Upgrade your plan to add more stores.");
          navigate("/pricing");
          return;
        }
      }
  
      const url = storeId
        ? `http://localhost:5175/api/v1/stores/updatestore/${storeId}`
        : "http://localhost:5175/api/v1/stores/addstore";
      const method = storeId ? "put" : "post";
  
      const response = await axios({
        method,
        url,
        data: formData,
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.status >= 200 && response.status < 300) {
        setSuccessMessage(
          storeId ? "Store updated successfully" : "Store created successfully"
        );
        navigate("/userstorelist");
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
  
      if (error.response) {
        if (error.response.status === 403) {
          alert(error.response.data.error || "Store limit exceeded.");
          navigate("/pricing");
        } else if (
          error.response.status === 500 &&
          error.response.data?.message?.includes("location")
        ) {
          alert("Invalid location. Please check the address and try again.");
        } else {
          setErrorMessage(`Error: ${error.response.data.error || "Unknown error"}`);
          setSnackbarOpen(true);
        }
      } else {
        setErrorMessage("Network or server issue. Please try again.");
        setSnackbarOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };
  
  
  
  
  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (!validateForm()) return;

  //   const isEmailRegistered = await emailAlreadyRegistered(formData.email);
  //   if (isEmailRegistered) {
  //     setLoading(false);
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     const token = localStorage.getItem("userToken");
  //     const url = storeId
  //       ? `http://localhost:5175/api/v1/stores/updatestore/${storeId}`
  //       : "http://localhost:5175/api/v1/stores/addstore";
  //     const method = storeId ? "put" : "post";

  //     const response = await axios({
  //       method,
  //       url,
  //       data: formData,
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     if (response.status >= 200 && response.status < 300) {
  //       setSuccessMessage(
  //         storeId ? "Store updated successfully" : "Store created successfully"
  //       );
  //       navigate("/userstorelist");
  //     } else {
  //       setErrorMessage(
  //         `Error: ${response.status} - ${
  //           response.data?.message || "Unknown error"
  //         }`
  //       );
  //       setSnackbarOpen(true);
  //     }
  //   } catch (error) {
  //     console.error("Error adding store:", error);
  //     // Check for specific location error
  //     if (
  //       error.response &&
  //       error.response.status === 500 &&
  //       error.response.data &&
  //       error.response.data.message &&
  //       error.response.data.message.includes("location")
  //     ) {
  //       alert(
  //         "The location or city you provided is invalid. Please check and try again."
  //       );
  //     } else {
  //       setErrorMessage("Error adding store: Network error");
  //       setSnackbarOpen(true);
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Add debounce utility function
  function debounce(func, delay) {
    let timeoutId;

    const debouncedFunction = (...args) => {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        func.apply(null, args);
      }, delay);
    };

    debouncedFunction.cancel = () => {
      clearTimeout(timeoutId);
    };

    return debouncedFunction;
  }

  useEffect(() => {
    const fetchStoreData = async () => {
      if (storeId) {
        setLoading(true);
        try {
          const response = await axios.get(
            `http://localhost:5175/api/v1/stores/${storeId}`
          );
          setFormData(response.data);
        } catch (error) {
          console.error("Failed to fetch store data:", error);
          setError("Failed to fetch store data");
        }
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [storeId]);

  return (
    <div className="store-registration-wrap">
      <div className="container">
        <div className="main-content cd-store-locator">
          <div className="form-container">
            <h2>{storeId ? "Edit Store" : "Create Store"}</h2>
            <form onSubmit={handleSubmit}>
              <section>
                <h3>Store Information</h3>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                  />
                  {errors.company && <p className="error">{errors.company}</p>}
                  <input
                    type="text"
                    placeholder="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  {errors.name && <p className="error">{errors.name}</p>}
                  <input
                    type="url"
                    placeholder="Website URL"
                    name="websiteURL"
                    value={formData.websiteURL}
                    onChange={handleChange}
                  />
                  {errors.websiteURL && (
                    <p className="error">{errors.websiteURL}</p>
                  )}
                  <input
                    type="text"
                    placeholder="Country Code"
                    name="countryCode"
                    value={formData.phone.countryCode}
                    onChange={handlePhoneChange}
                    required
                  />
                  {errors.countryCode && (
                    <p className="error">{errors.countryCode}</p>
                  )}
                  <input
                    type="text"
                    placeholder="Phone number"
                    name="number"
                    value={formData.phone.number}
                    onChange={handlePhoneChange}
                    required
                  />
                  {errors.phoneNumber && (
                    <p className="error">{errors.phoneNumber}</p>
                  )}
                  <input
                    type="text"
                    placeholder="Fax Number"
                    name="fax"
                    value={formData.fax}
                    onChange={handleChange}
                  />
                  {errors.fax && <p className="error">{errors.fax}</p>}

                  <input
                    type="email"
                    placeholder="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.emailAlreadyRegistered && (
                    <p className="error">{errors.emailAlreadyRegistered}</p>
                  )}
                  {/* {errors.email && <p className="error">{errors.email}</p>} */}
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="error">{errors.categoryId}</p>
                  )}
                </div>
              </section>

              <section>
                <h3>Address Location</h3>
                <div className="cd-address-main">
                  <div className="cd-address-left">
                    <div className="form-group">
                      <input
                        type="text"
                        placeholder="Street"
                        name="street"
                        value={formData.address.street}
                        onChange={handleAddressChange}
                        required
                      />
                      {errors.street && (
                        <p className="error">{errors.street}</p>
                      )}
                      <input
                        type="text"
                        placeholder="City"
                        name="city"
                        value={formData.address.city}
                        onChange={handleAddressChange}
                        required
                      />
                      {errors.city && <p className="error">{errors.city}</p>}
                      <input
                        type="text"
                        placeholder="State"
                        name="state"
                        value={formData.address.state}
                        onChange={handleAddressChange}
                        required
                      />
                      {errors.state && <p className="error">{errors.state}</p>}
                      <input
                        type="text"
                        placeholder="Postal Code"
                        name="postalCode"
                        value={formData.address.postalCode}
                        onChange={handleAddressChange}
                        required
                      />
                      {errors.postalCode && (
                        <p className="error">{errors.postalCode}</p>
                      )}
                      <input
                        type="text"
                        placeholder="Country"
                        name="country"
                        value={formData.address.country}
                        onChange={handleAddressChange}
                        required
                      />
                      {errors.country && (
                        <p className="error">{errors.country}</p>
                      )}
                    </div>
                  </div>
                  <div className="cd-address-right">
                    <div className="map-placeholder">Map Placeholder</div>
                  </div>
                </div>
              </section>

              <section>
                <h3>Store Opening Hours</h3>
                <div className="working-hours">
                  {formData.workingHours.map((day, index) => (
                    <div key={index} className="day-row">
                      <label>
                        <span>
                          {" "}
                          {day.day}
                          <input
                            type="checkbox"
                            className="toggle-switch"
                            checked={day.isOpen}
                            onChange={() => handleToggleDay(index)}
                          />{" "}
                        </span>
                      </label>
                      {day.isOpen && (
                        <>
                          <div className="from-dc-box">
                            <span>From</span>

                            <input
                              className="time-input"
                              type="time"
                              value={day.start}
                              onChange={(e) =>
                                handleWorkingHoursChange(
                                  index,
                                  "start",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="from-dc-box">
                            <span>To</span>

                            <input
                              className="time-input"
                              type="time"
                              value={day.end}
                              onChange={(e) =>
                                handleWorkingHoursChange(
                                  index,
                                  "end",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3>Additional Information</h3>
                <textarea
                  type="text"
                  value={formData.additional}
                  onChange={handleChange}
                  placeholder="Please enter... (Max 150 words)"
                  name="additional"
                  maxLength={750}
                />
                {errors.additional && (
                  <p className="error">{errors.additional}</p>
                )}
              </section>
              {renderCharacterCount()}
              <div className="agreement">
                <input
                  className="agreement-inp"
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={(e) =>
                    setFormData({ ...formData, agreeToTerms: e.target.checked })
                  }
                  id="agree"
                />
                <label htmlFor="agree">
                  I agree to terms and conditions, and all the provided
                  information is correct
                </label>

                {errors.agreeToTerms && (
                  <p className="error">{errors.agreeToTerms}</p>
                )}
              </div>

              <div className="form-buttons">
                <button type="submit" className="save" disabled={loading}>
                  {loading
                    ? "Saving.."
                    : storeId
                    ? "Update Store"
                    : "Create Store"}
                </button>
                <button type="button" className="cancel" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={handleCloseSnackbar}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
              {snackbarOpen && (
                <>
                  {successMessage && (
                    <Alert
                      onClose={handleCloseSnackbar}
                      severity="success"
                      variant="filled"
                    >
                      {successMessage}
                    </Alert>
                  )}
                  {errorMessage && (
                    <Alert
                      onClose={handleCloseSnackbar}
                      severity="error"
                      variant="filled"
                    >
                      {errorMessage}
                    </Alert>
                  )}
                </>
              )}
            </Snackbar>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStoreRegister;
