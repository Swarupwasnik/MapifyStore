import React, { useState, useEffect } from "react";
import { TextContainer } from "@shopify/polaris";

import {
  Button,
  Stack,
  Select,
  Modal,
  Checkbox,
  InputLabel,
  TextField,
  FormControl,
  Alert,
  Snackbar,
  Card,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Switch,
  MenuItem,
  FormControlLabel,
  Box,
  Grid,
  Typography,
} from "@mui/material";

import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import retryFetch from "../utils/utils";

const AllStore = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();
  const [selectedStore, setSelectedStore] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  const debounceTimeout = 500;

  const handleSelect = (index) => {
    if (selectedRows.includes(index)) {
      setSelectedRows(selectedRows.filter((rowIndex) => rowIndex !== index));
    } else {
      setSelectedRows([...selectedRows, index]);
    }
  };

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80%",
    maxHeight: "80%",
    bgcolor: "white",
    boxShadow: 24,
    p: 4,
    overflowY: "auto",
    borderRadius: "8px",
  };

  const filterOptions = [
    { label: "All Stores", value: "all" },
    { label: "Published Stores", value: "published" },
    { label: "Unpublished Stores", value: "unpublished" },
  ];

  const handleAddStore = () => {
    navigate("/storereg");
  };
  // added into it
  // const handleEditStore = (store) => {
  //   // Ensure workingHours is initialized properly
  //   const workingHours = daysOfWeek.reduce((acc, day) => {
  //     acc[day] = store.workingHours[day] || {
  //       isOpen: false,
  //       start: "",
  //       end: "",
  //     };
  //     return acc;
  //   }, {});

  //   setSelectedStore({ ...store, workingHours });
  //   setIsEditing(true);
  // };

  const handleEditStore = (store) => {
    const workingHours = daysOfWeek.map((day) => {
      const dayData = store.workingHours.find((wh) => wh.day === day) || {
        isOpen: false,
        start: "",
        end: "",
        customTimes: [],
      };
      return { ...dayData };
    });

    setSelectedStore({ ...store, workingHours });
    setIsEditing(true);
  };

  // added into it

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      try {
        const endpoint =
          filter === "published"
            ? "http://localhost:5175/api/v1/stores/published?shop=quickstart-2770d800.myshopify.com"
            : filter === "unpublished"
            ? "http://localhost:5175/api/v1/stores/unpublished?shop=quickstart-2770d800.myshopify.com"
            : "http://localhost:5175/api/v1/stores/stores?shop=quickstart-2770d800.myshopify.com";

        const response = await retryFetch(endpoint, { method: "GET" });
        setStores(response.data);
      } catch (err) {
        setError(
          err.response?.status === 429
            ? "Too many requests. Please try again later."
            : "Error fetching stores."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [filter]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5175/api/v1/category/publishcategory"
      );
      setCategories(response.data);
    } catch (err) {
      setError("Error fetching categories");
    }
  };
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    // Debounce mechanism
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fetchStores();
    }, debounceTimeout);
  };
  // newlyadded
  const filteredStores = stores.filter((store) => {
    const lowerCaseSearchValue = searchValue.toLowerCase();
    return (
      store.company.toLowerCase().includes(lowerCaseSearchValue) ||
      store.name.toLowerCase().includes(lowerCaseSearchValue) ||
      store.email.toLowerCase().includes(lowerCaseSearchValue) ||
      store.address.city.toLowerCase().includes(lowerCaseSearchValue) ||
      (store.category?.name &&
        store.category.name.toLowerCase().includes(lowerCaseSearchValue))
    );
  });

  // newlyadded
 
  
  
  const handleTogglePublished = async (storeId, isPublished) => {
    setError("");
    setSuccess("");
    try {
      const response = await axios.put(
        `http://localhost:5175/api/v1/stores/${storeId}/publish`,
        { published: !isPublished }
      );
      setStores((prevStores) =>
        prevStores.map((store) =>
          store._id === storeId
            ? { ...store, published: response.data.published }
            : store
        )
      );
      setSuccess("Store Status Updated successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Error updating store status.");
      setTimeout(() => setError(""), 3000);
    }
  };

  // addtocode


  // addtocode
  const handleSaveEdit = async () => {
    if (!selectedStore) return;
 // Validate phone number (exactly 10 digits)
 if (!/^\d{10}$/.test(selectedStore.phone?.number)) {
  setError("Phone number must be exactly 10 digits.");
  setTimeout(() => setError(""), 3000);
  return;
}
 // Validate fax number (exactly 4 digits)
 if (!/^\d{4}$/.test(selectedStore.fax || "")) {
  setError("Fax number must be exactly 4 digits.");
  setTimeout(() => setError(""), 3000);
  return;
}
     // Validate country code (starts with '+' and 1-3 digits)
  if (!/^\+\d{1,3}$/.test(selectedStore.phone?.countryCode || "")) {
    setError("Country code must start with '+' followed by 1 to 3 digits.");
    setTimeout(() => setError(""), 3000);
    return;
  }

    // Validate postal code (exactly 10 digits)
    if (!/^\d{6}$/.test(selectedStore.address?.postalCode || "")) {
      setError("Postal code must be exactly 6 digits.");
      setTimeout(() => setError(""), 3000);
      return;
    }

      // Validate additional information (maximum of 10 characters)
  if (!/^.{1,150}$/.test(selectedStore.additional || "")) {
    setError("Additional information must be 150 characters or less.");
    setTimeout(() => setError(""), 3000);
    return;
  }
    // Define required fields
    const requiredFields = [
      "company",
      "name",
      "email",
      "phone",
      "address",
      "category",
      "workingHours",
      "agreeToTerms",
    ];

    // Check for missing required fields
    const missingFields = requiredFields.filter((field) => {
      if (!selectedStore[field]) return true;
      if (field === "phone") {
        return (
          !selectedStore.phone?.countryCode || !selectedStore.phone?.number
        );
      }
      if (field === "address") {
        return (
          !selectedStore.address?.street ||
          !selectedStore.address?.city ||
          !selectedStore.address?.state ||
          !selectedStore.address?.postalCode ||
          !selectedStore.address?.country
        );
      }
      if (field === "category") {
        return !selectedStore.category?._id;
      }
      if (field === "workingHours") {
        return selectedStore.workingHours.length === 0;
      }
      return false;
    });

    // If there are missing fields, show an error
    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.join(", ")}`);
      setTimeout(() => setError(""), 3000);
      return;
    }

    // Construct workingHours as an array
    const workingHours = daysOfWeek.map((day) => ({
      day,
      isOpen: selectedStore.workingHours[day]?.isOpen || false,
      start: selectedStore.workingHours[day]?.start || "09:00",
      end: selectedStore.workingHours[day]?.end || "18:00",
      // customTimes: [],
      customTimes: selectedStore.workingHours[day]?.customTimes || [],
    }));

    // Create payload for the API request
    const payload = {
      company: selectedStore.company,
      name: selectedStore.name,
      websiteURL: selectedStore.websiteURL || "",
      fax: selectedStore.fax || "",
      email: selectedStore.email,
      phone: {
        countryCode: selectedStore.phone?.countryCode,
        number: selectedStore.phone?.number,
      },
      categoryId: selectedStore.category._id,
      address: {
        street: selectedStore.address?.street,
        city: selectedStore.address?.city,
        state: selectedStore.address?.state,
        postalCode: selectedStore.address?.postalCode,
        country: selectedStore.address?.country,
      },
      additional: selectedStore.additional || "",
      workingHours: workingHours,
      agreeToTerms: selectedStore.agreeToTerms,
    };

    console.log("Payload being sent:", payload);

    try {
      // Send PUT request to update store
      const response = await axios.put(
        `http://localhost:5175/api/v1/stores/updatestore/${selectedStore._id}`,
        payload
      );

      // Update the store list with the new data
      setStores((prevStores) =>
        prevStores.map((store) =>
          store._id === selectedStore._id ? response.data : store
        )
      );

      // Show success message
      setSuccess("Store updated successfully.");
      setTimeout(() => setSuccess(""), 3000);
      setIsEditing(false);
      setSelectedStore(null);
    } catch (error) {
      console.error("Error updating store:", error);
      setError("Error updating store.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleDeleteStore = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5175/api/v1/stores/deletestore/${id}`
      );
      setStores((prevStores) => prevStores.filter((store) => store._id !== id));
      setSuccess("Store deleted successfully.");
    } catch (error) {
      setError("Error deleting store.");
    }
  };
  // newly updte
  const handleDeleteSelectedStores = async () => {
    const idsToDelete = selectedRows.map((index) => stores[index]._id);
    try {
      await Promise.all(
        idsToDelete.map((id) =>
          axios.delete(`http://localhost:5175/api/v1/stores/deletestore/${id}`)
        )
      );
      setStores((prevStores) =>
        prevStores.filter((_, index) => !selectedRows.includes(index))
      );
      setSuccess("Selected stores deleted successfully.");
      setSelectedRows([]); // Clear selected rows after deletion
    } catch (error) {
      setError("Error deleting selected stores.");
    }
  };
  // newlyUpdate

  const rows = filteredStores
    // stores
    .filter((store) =>
      store.name.toLowerCase().includes(searchValue.toLowerCase())
    )
    .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
    .map((store) => [
      store.company,
      store.name,
      store.email,
      store.address.city,
      store.websiteURL || "-",
      store.category?.name || "-",
      <Switch
        primary={store.published}
        variant="outlined"
        color={store.published ? "success" : "warning"}
        onClick={() => handleTogglePublished(store._id, store.published)}
      >
        {store.published ? "Unpublish" : "Publish"}
      </Switch>,
      <Stack spacing={2} direction="row">
        <IconButton color="primary" onClick={() => handleEditStore(store)}>
          <EditIcon />
        </IconButton>

        <IconButton color="error" onClick={() => handleDeleteStore(store._id)}>
          <DeleteIcon />
        </IconButton>
      </Stack>,
    ]);

  return (
    <div style={{ width: "80%", margin: "auto", marginTop: "20px" }}>
      <Stack direction="row" spacing={2} justifyContent="space-between">
        <TextField
          label="Search Stores"
          value={searchValue}
          onChange={handleSearchChange}
          // onChange={(e) => setSearchValue(e.target.value)}
          variant="outlined"
        />
        <FormControl variant="outlined">
          <InputLabel>Filter</InputLabel>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            label="Filter"
          >
            {filterOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" onClick={handleAddStore}>
          Add Store
        </Button>
        {/* newlyUpdate */}
        <Button
          variant="contained"
          color="error"
          onClick={handleDeleteSelectedStores}
          disabled={selectedRows.length === 0}
        >
          Delete Selected
        </Button>
        {/* newlyUpdate */}
      </Stack>
      <Snackbar open={!!success} autoHideDuration={3000}>
        <Alert severity="success">{success}</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={3000}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>

      {/* {success && <Alert severity="success">{success}</Alert>}
      {error && <Alert severity="error">{error}</Alert>} */}

      <Card variant="outlined" style={{ marginTop: "20px" }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Select</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Website</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Options</TableCell>
              </TableRow>
              {/* addnew */}

              {/* addnew */}
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.includes(index)}
                      onChange={() => handleSelect(index)}
                    />
                  </TableCell>
                  {row.map((value, i) => (
                    <TableCell key={i}>{value}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Pagination
          count={Math.ceil(stores.length / rowsPerPage)}
          page={page + 1}
          onChange={(e, newPage) => setPage(newPage - 1)}
          color="primary"
          style={{ marginTop: "20px", textAlign: "center" }}
        />
      </Card>
      {isEditing && (
        <Modal
          open={isEditing}
          onClose={() => setIsEditing(false)}
          aria-labelledby="edit-store-title"
        >
          <Box
            component="form"
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 600,
              maxHeight: "90vh",
              overflowY: "auto",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <Typography id="edit-store-title" variant="h6" mb={2}>
              Edit Store
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Company"
                  value={selectedStore.company || ""}
                  onChange={(e) =>
                    setSelectedStore({
                      ...selectedStore,
                      company: e.target.value,
                    })
                  }
                  fullWidth
                  error={!selectedStore.company}
                  helperText={!selectedStore.company && "Company is required"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Name"
                  value={selectedStore.name || ""}
                  onChange={(e) =>
                    setSelectedStore({ ...selectedStore, name: e.target.value })
                  }
                  fullWidth
                  error={!selectedStore.name}
                  helperText={!selectedStore.name && "Name is required"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  value={selectedStore.email || ""}
                  onChange={(e) =>
                    setSelectedStore({
                      ...selectedStore,
                      email: e.target.value,
                    })
                  }
                  fullWidth
                  error={!selectedStore.email || !/\S+@\S+\.\S+/.test(selectedStore.email)} // Email validation
                  helperText={
                    !selectedStore.email
                      ? "Email is required"
                      : !/\S+@\S+\.\S+/.test(selectedStore.email) &&
                        "Enter a valid email"
                  } 
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Website"
                  value={selectedStore.websiteURL || ""}
                  onChange={(e) =>
                    setSelectedStore({
                      ...selectedStore,
                      websiteURL: e.target.value,
                    })
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Fax"
                  value={selectedStore.fax || ""}
                  onChange={(e) =>
                    setSelectedStore({ ...selectedStore, fax: e.target.value })
                  }
                  fullWidth
                  error={!selectedStore.fax}
                  helperText={!selectedStore.fax && "fax no is required"}
                />
              </Grid>
              {/* adding */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone (Country Code)"
                  value={selectedStore.phone?.countryCode || ""}
                  onChange={(e) =>
                    setSelectedStore({
                      ...selectedStore,
                      phone: {
                        ...selectedStore.phone,
                        countryCode: e.target.value,
                      },
                    })
                  }
                  fullWidth
                  error={!selectedStore.phone?.countryCode}
                  helperText={!selectedStore.phone?.countryCode && "Country code is required"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone (Number)"
                  value={selectedStore.phone?.number || ""}
                  onChange={(e) =>
                    setSelectedStore({
                      ...selectedStore,
                      phone: {
                        ...selectedStore.phone,
                        number: e.target.value,
                      },
                    })
                  }
                  fullWidth
                  error={!selectedStore.phone?.number}
            helperText={!selectedStore.phone?.number && "Phone number is required"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Street"
                  value={selectedStore.address?.street || ""}
                  onChange={(e) =>
                    setSelectedStore({
                      ...selectedStore,
                      address: {
                        ...selectedStore.address,
                        street: e.target.value,
                      },
                    })
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="City"
                  value={selectedStore.address?.city || ""}
                  onChange={(e) =>
                    setSelectedStore({
                      ...selectedStore,
                      address: {
                        ...selectedStore.address,
                        city: e.target.value,
                      },
                    })
                  }
                  fullWidth
                  
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="State"
                  value={selectedStore.address?.state || ""}
                  onChange={(e) =>
                    setSelectedStore({
                      ...selectedStore,
                      address: {
                        ...selectedStore.address,
                        state: e.target.value,
                      },
                    })
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Postal Code"
                  value={selectedStore.address?.postalCode || ""}
                  onChange={(e) =>
                    setSelectedStore({
                      ...selectedStore,
                      address: {
                        ...selectedStore.address,
                        postalCode: e.target.value,
                      },
                    })
                  }
                  fullWidth
                  error={!selectedStore.address?.postalCode}
            helperText={!selectedStore.address?.postalCode && "Postal code is required"}
                />
              </Grid>
              {" "}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedStore.category?._id || ""}
                    onChange={(e) =>
                      setSelectedStore({
                        ...selectedStore,
                        category: { _id: e.target.value },
                      })
                    }
                  >
                    {categories.map((category) => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Additional Information"
                  multiline
                  value={selectedStore.additional || ""}
                  onChange={(e) =>
                    setSelectedStore({
                      ...selectedStore,
                      additional: e.target.value,
                    })
                  }
                  fullWidth
             
                />
              </Grid>
              {daysOfWeek.map((day) => (
                <Grid item xs={12} key={day}>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography style={{ width: "100px" }}>{day}</Typography>
                    <Switch
                      checked={selectedStore.workingHours[day]?.isOpen || false}
                      onChange={(e) => {
                        const isOpen = e.target.checked;
                        const updatedWorkingHours = {
                          ...selectedStore.workingHours,
                          [day]: {
                            ...selectedStore.workingHours[day],
                            isOpen,
                            start: isOpen
                              ? selectedStore.workingHours[day]?.start ||
                                "09:00" // Default start time
                              : "", // Clear if closed
                            end: isOpen
                              ? selectedStore.workingHours[day]?.end || "18:00" // Default end time
                              : "", // Clear if closed
                          },
                        };
                        setSelectedStore({
                          ...selectedStore,
                          workingHours: updatedWorkingHours,
                        });
                      }}
                    />
                    {selectedStore.workingHours[day]?.isOpen && (
                      <Stack direction="row" spacing={2}>
                        <TextField
                          label="Start Time"
                          type="time"
                          value={selectedStore.workingHours[day]?.start || ""}
                          onChange={(event) => {
                            const start = event.target.value;
                            const updatedWorkingHours = {
                              ...selectedStore.workingHours,
                              [day]: {
                                ...selectedStore.workingHours[day],
                                start,
                              },
                            };
                            setSelectedStore({
                              ...selectedStore,
                              workingHours: updatedWorkingHours,
                            });
                          }}
                        />
                        <TextField
                          label="End Time"
                          type="time"
                          value={selectedStore.workingHours[day]?.end || ""}
                          onChange={(event) => {
                            const end = event.target.value;
                            const updatedWorkingHours = {
                              ...selectedStore.workingHours,
                              [day]: {
                                ...selectedStore.workingHours[day],
                                end,
                              },
                            };
                            setSelectedStore({
                              ...selectedStore,
                              workingHours: updatedWorkingHours,
                            });
                          }}
                        />
                      </Stack>
                    )}
                  </Stack>
                </Grid>
              ))}
            </Grid>
            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={4}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveEdit}
                disabled={
                  !selectedStore.company ||
                  !selectedStore.name ||
                  !selectedStore.email ||
                  !/\S+@\S+\.\S+/.test(selectedStore.email) ||
                  !selectedStore.phone?.countryCode ||
                  !selectedStore.phone?.number ||
                  !selectedStore.address.postalCode ||
                  !selectedStore.fax
                }
              >
                Save
              </Button>
            </Stack>
          </Box>
        </Modal>
      )}
    </div>
  );
};

export default AllStore;
