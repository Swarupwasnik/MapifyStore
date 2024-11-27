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
  const debounceTimeout = 500; // Delay for debounce
  let debounceTimer;

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

  const handleEditStore = (store) => {
    setSelectedStore(store);
    setIsEditing(true);
  };



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
      setSuccess("Store Published successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Error updating store status.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedStore) return;

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

    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.join(", ")}`);
      setTimeout(() => setError(""), 3000);
      return;
    }

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
      workingHours: selectedStore.workingHours,
      agreeToTerms: selectedStore.agreeToTerms,
    };

    try {
      const response = await axios.put(
        `http://localhost:5175/api/v1/stores/updatestore/${selectedStore._id}`,
        payload
      );
      setStores((prevStores) =>
        prevStores.map((store) =>
          store._id === selectedStore._id ? response.data : store
        )
      );
      setSuccess("Store updated successfully.");
      setTimeout(() => setSuccess(""), 3000);
      setIsEditing(false);
      setSelectedStore(null);
    } catch (error) {
      console.error("Error updating store:", error);
      if (error.response && error.response.data.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.keys(errors).map(
          (field) => `${field}: ${errors[field]}`
        );
        setError(errorMessages.join(", "));
      } else {
        setError("Error updating store.");
      }
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

  const rows = stores
    .filter((store) =>
      store.name.toLowerCase().includes(searchValue.toLowerCase())
    )
    .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
    .map((store) => [
      store.name,
      store.email,
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
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Website</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Options</TableCell>
              </TableRow>
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
                />
              </Grid>
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
                />
              </Grid>
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

              {[...Array(7)].map((_, i) => {
                const day = daysOfWeek[i];
                return (
                  <Grid item xs={12} key={day}>
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography style={{ width: "100px" }}>{day}</Typography>
                      <Switch
                        checked={
                          selectedStore.workingHours?.[day]?.isOpen || false
                        }
                        onChange={(e) => {
                          const isOpen = e.target.checked;
                          const updatedWorkingHours = {
                            ...selectedStore.workingHours,
                            [day]: {
                              ...selectedStore.workingHours?.[day],
                              isOpen,
                            },
                          };
                          setSelectedStore({
                            ...selectedStore,
                            workingHours: updatedWorkingHours,
                          });
                        }}
                      />
                      {selectedStore.workingHours?.[day]?.isOpen && (
                        <Stack direction="row" spacing={2}>
                          <TextField
                            label="Start Time"
                            type="time"
                            value={
                              selectedStore.workingHours?.[day]?.start || ""
                            }
                            onChange={(event) => {
                              const start = event.target.value;
                              const updatedWorkingHours = {
                                ...selectedStore.workingHours,
                                [day]: {
                                  ...selectedStore.workingHours?.[day],
                                  start,
                                },
                              };
                              setSelectedStore({
                                ...selectedStore,
                                workingHours: updatedWorkingHours,
                              });
                            }}
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                          <TextField
                            label="End Time"
                            type="time"
                            value={selectedStore.workingHours?.[day]?.end || ""}
                            onChange={(event) => {
                              const end = event.target.value;
                              const updatedWorkingHours = {
                                ...selectedStore.workingHours,
                                [day]: {
                                  ...selectedStore.workingHours?.[day],
                                  end,
                                },
                              };
                              setSelectedStore({
                                ...selectedStore,
                                workingHours: updatedWorkingHours,
                              });
                            }}
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                        </Stack>
                      )}
                    </Stack>
                  </Grid>
                );
              })}
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
