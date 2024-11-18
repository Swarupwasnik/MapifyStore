import React, { useState, useEffect } from "react";
import "../styles/App.css";
import axios from "axios";
import { useNavigate,useParams } from "react-router-dom";
const StoreRegister = () => {
  const {storeId} = useParams();
  const [categories, setCategories] = useState([]);

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
    const confirmCancel = window.confirm("Are you sure you want to cancel and clear all fields?");
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
  

  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5175/api/v1/category/publishcategory"
        );

        // Ensure categories are set to an array, even if the response data is not as expected
        setCategories(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Failed to load categories.", error);
        setCategories([]); // Set to an empty array in case of an error
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handlePhoneChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      phone: { ...prevData.phone, [name]: value },
    }));
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
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.phone.countryCode)
      newErrors.countryCode = "Country code is required";
    if (!formData.phone.number)
      newErrors.phoneNumber = "Phone number is required";
    if (!formData.address.street) newErrors.street = "Street is required";
    if (!formData.address.city) newErrors.city = "City is required";
    if (!formData.address.state) newErrors.state = "State is required";
    if (!formData.address.postalCode)
      newErrors.postalCode = "Postal code is required";
    if (!formData.address.country) newErrors.country = "Country is required";
    if (!formData.agreeToTerms)
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    if (!formData.agreeToTerms)
      newErrors.additional = "You must Add Additional Fields";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


    const handleSubmit = async (e) => {
      e.preventDefault();
      if(!validateForm()) return;
      setLoading(true);
      try {
        if (storeId) {
          // Update store logic
          await axios.put(`http://localhost:5175/api/v1/stores/updatestore/${storeId}`, formData);
          alert("Store updated successfully");
        } else {
          // Create store logic
          await axios.post('http://localhost:5175/api/v1/stores/addstore', formData);
          alert("Store created successfully");
        }
        navigate('/'); // Navigate to another page after success
      } catch (error) {
        console.error("Error saving store:", error);
        setError("Error saving store");
      }
      setLoading(false);
    };

  useEffect(() => {
    const fetchStoreData = async () => {
      if (storeId) {
        setLoading(true);
        try {
          const response = await axios.get(`http://localhost:5175/api/v1/stores/${storeId}`);
          setFormData(response.data); 
        } catch (error) {
          console.error("Failed to fetch store data:", error);
          setError('Failed to fetch store data');
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
            <h2>{storeId ? "Edit Store" :"Create Store"}</h2>
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
                    placeholder="Fax"
                    name="fax"
                    value={formData.fax}
                    onChange={handleChange}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && <p className="error">{errors.email}</p>}
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
                  placeholder="Please enter..."
                  name="additional"
                />
                {errors.additional && (
                  <p className="error">{errors.additional}</p>
                )}
              </section>

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
                  {loading ? "Saving.." : storeId ? "Update Store" : "Create Store" }
                </button>
                <button type="button" className="cancel" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreRegister;




