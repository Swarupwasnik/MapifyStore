import React, { useState, useEffect } from "react";
import {
  Card,
  DataTable,
  Banner,
  TextField,
  Stack,
  Scrollable,
  Pagination,
  Button,
  Select,
  Modal,
  Checkbox,
  TextContainer,
} from "@shopify/polaris";
import axios from "axios";
import { SearchMinor, EditMinor, DeleteMinor } from "@shopify/polaris-icons";
import { useNavigate } from "react-router-dom";

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

  const filterOptions = [
    { label: "All Stores", value: "all" },
    { label: "Published Stores", value: "published" },
    { label: "Unpublished Stores", value: "unpublished" },
  ];

  const handleAddStore = () => {
    navigate("/storereg");
  };

  // const handleEditStore = (store) => {
  //   navigate(`/storereg/${store._id}`);
  // };
  const handleEditStore = (store) => {
    setSelectedStore(store);
    setIsEditing(true);
  };

  useEffect(() => {
    fetchStores();
  }, [filter]);
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const endpoint =
        filter === "published"
          ? "http://localhost:5175/api/v1/stores/published"
          : filter === "unpublished"
          ? "http://localhost:5175/api/v1/stores/unpublished"
          : "http://localhost:5175/api/v1/stores/stores";

      const response = await axios.get(endpoint);
      setStores(response.data);
      setLoading(false);
    } catch (err) {
      setError("Error fetching stores");
      setLoading(false);
    }
  };
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

  const handleTogglePublished = async (storeId, isPublished) => {
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
      setSuccess("Store status updated successfully.");
    } catch (err) {
      setError("Error updating store status.");
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

  const handleSaveEdit = async () => {
    console.log("Selected Store Data:", selectedStore); // Log the store data to check for missing fields
  
    // Validate required fields, including nested objects
    const requiredFields = [
      "company", 
      "name", 
      "email", 
      "phone", 
      "address", 
      "category", 
      "workingHours", // Ensure workingHours is not empty
      "agreeToTerms"
    ];
  
    const missingFields = requiredFields.filter((field) => {
      if (!selectedStore[field]) return true;
  
      // Special handling for nested objects
      if (field === "phone") {
        return !selectedStore.phone?.countryCode || !selectedStore.phone?.number;
      }
      if (field === "address") {
        return !selectedStore.address?.street || !selectedStore.address?.city || 
               !selectedStore.address?.state || !selectedStore.address?.postalCode ||
               !selectedStore.address?.country || !selectedStore.address?.latitude || 
               !selectedStore.address?.longitude;
      }
      if (field === "category") {
        return !selectedStore.category?._id || !selectedStore.category?.name;
      }
      return false; // No missing field for other simple fields
    });
  
    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.join(", ")}`);
      return; // Exit early if validation fails
    }
  
    try {
      const response = await axios.put(
        `http://localhost:5175/api/v1/stores/updatestore/${selectedStore._id}`,
        selectedStore
      );
  
      setStores((prevStores) =>
        prevStores.map((store) =>
          store._id === selectedStore._id ? response.data : store
        )
      );
      setSuccess("Store updated successfully.");
      setIsEditing(false);
      setSelectedStore(null);
    } catch (error) {
      console.error("Error updating store:", error);
      if (error.response && error.response.data.errors) {
        // Handle specific error responses
        const errors = error.response.data.errors;
        const errorMessages = Object.keys(errors).map(
          (field) => `${field}: ${errors[field]}`
        );
        setError(errorMessages.join(", "));
      } else {
        setError("Error updating store.");
      }
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
      <Button
        primary={store.published}
        onClick={() => handleTogglePublished(store._id, store.published)}
      >
        {store.published ? "Unpublish" : "Publish"}
      </Button>,
      <Stack spacing="tight">
        <Button plain icon={EditMinor} onClick={() => handleEditStore(store)}>
          Edit
        </Button>
        <Button
          plain
          destructive
          icon={DeleteMinor}
          onClick={() => handleDeleteStore(store._id)}
        >
          Delete
        </Button>
      </Stack>,
    ]);

  return (
    <div style={{ width: "80%", margin: "auto", marginTop: "20px" }}>
      <Stack
        distribution="equalSpacing"
        alignment="center"
        style={{ marginBottom: "10px" }}
      >
        <TextField
          placeholder="Search Stores"
          value={searchValue}
          onChange={(value) => setSearchValue(value)}
          prefix={<SearchMinor />}
          autoComplete="off"
        />
        <Select
          label="Filter"
          options={filterOptions}
          value={filter}
          onChange={(value) => setFilter(value)}
        />
        <Button primary onClick={handleAddStore}>
          Add Store
        </Button>
      </Stack>

      {success && <Banner status="success">{success}</Banner>}
      {error && <Banner status="critical">{error}</Banner>}

      <Card
        title={`${filter.charAt(0).toUpperCase() + filter.slice(1)} Stores`}
      >
        <Scrollable shadow style={{ height: "400px" }}>
          <DataTable
            columnContentTypes={[
              "text",
              "text",
              "text",
              "text",
              "text",
              "text",
            ]}
            headings={["Name", "Email", "Website", "Category", "Actions"]}
            rows={rows}
          />
        </Scrollable>

        <Pagination
          hasPrevious={page > 0}
          onPrevious={() => setPage(page - 1)}
          hasNext={(page + 1) * rowsPerPage < stores.length}
          onNext={() => setPage(page + 1)}
        />
      </Card>
      {isEditing && (
        <Modal
          open={isEditing}
          onClose={() => setIsEditing(false)}
          title="Edit Store"
          primaryAction={{
            content: "Save",
            onAction: handleSaveEdit,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: () => setIsEditing(false),
            },
          ]}
        >
          <Modal.Section>
            <TextField
              label="Company"
              value={selectedStore.company}
              onChange={(value) =>
                setSelectedStore({ ...selectedStore, company: value })
              }
            />
            <TextField
              label="Name"
              value={selectedStore.name}
              onChange={(value) =>
                setSelectedStore({ ...selectedStore, name: value })
              }
            />
            <TextField
              label="Email"
              value={selectedStore.email}
              onChange={(value) =>
                setSelectedStore({ ...selectedStore, email: value })
              }
            />
            <TextField
              label="Website"
              value={selectedStore.websiteURL}
              onChange={(value) =>
                setSelectedStore({ ...selectedStore, websiteURL: value })
              }
            />
            <TextField
              label="Fax"
              value={selectedStore.
                fax}
              onChange={(value) =>
                setSelectedStore({ ...selectedStore, 
                  fax: value })
              }
            />
            <TextField
              label="Phone (Country Code)"
              value={selectedStore.phone?.countryCode || ""}
              onChange={(value) =>
                setSelectedStore({
                  ...selectedStore,
                  phone: { ...selectedStore.phone, countryCode: value },
                })
              }
            />
            <TextField
              label="Phone (Number)"
              value={selectedStore.phone?.number || ""}
              onChange={(value) =>
                setSelectedStore({
                  ...selectedStore,
                  phone: { ...selectedStore.phone, number: value },
                })
              }
            />
            <TextField
              label="Street"
              value={selectedStore.address?.street || ""}
              onChange={(value) =>
                setSelectedStore({
                  ...selectedStore,
                  address: { ...selectedStore.address, street: value },
                })
              }
            />
            <TextField
              label="City"
              value={selectedStore.address?.city || ""}
              onChange={(value) =>
                setSelectedStore({
                  ...selectedStore,
                  address: { ...selectedStore.address, city: value },
                })
              }
            />
            <TextField
              label="State"
              value={selectedStore.address?.state || ""}
              onChange={(value) =>
                setSelectedStore({
                  ...selectedStore,
                  address: { ...selectedStore.address, state: value },
                })
              }
            />
            <TextField
              label="Postal Code"
              value={selectedStore.address?.postalCode || ""}
              onChange={(value) =>
                setSelectedStore({
                  ...selectedStore,
                  address: { ...selectedStore.address, postalCode: value },
                })
              }
            />
            <TextField
              label="Country"
              value={selectedStore.address?.country || ""}
              onChange={(value) =>
                setSelectedStore({
                  ...selectedStore,
                  address: { ...selectedStore.address, country: value },
                })
              }
            />
            <Select
              label="Category"
              options={categories.map((category) => ({
                label: category.name,
                value: category._id,
              }))}
              value={selectedStore.category?._id || ""}
              onChange={(value) =>
                setSelectedStore({ ...selectedStore, category: { _id: value } })
              }
            />
            <TextField
              label="Additional Information"
              multiline
              autoComplete="off"
              value={selectedStore.additional || ""}
              onChange={(value) =>
                setSelectedStore({ ...selectedStore, additional: value })
              }
            />
            <TextField
              label="latitude"
              multiline
              autoComplete="off"
              value={selectedStore.latitude || ""}
              onChange={(value) =>
                setSelectedStore({ ...selectedStore, latitude: value })
              }
            />

            <TextField
              label="Longitude"
              multiline
              autoComplete="off"
              value={selectedStore.longitude || ""}
              onChange={(value) =>
                setSelectedStore({ ...selectedStore, longitude: value })
              }
            />
            <Checkbox
              label="Published"
              checked={selectedStore.published || false}
              onChange={(checked) =>
                setSelectedStore({ ...selectedStore, published: checked })
              }
            />
            <Checkbox
              label="Agree to Terms"
              checked={selectedStore.agreeToTerms || false}
              onChange={(checked) =>
                setSelectedStore({ ...selectedStore, agreeToTerms: checked })
              }
            />

            {/* Working Hours Section */}
            {[
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ].map((day) => (
              <Stack key={day} distribution="fill">
                <TextContainer>
                  <h3>{day}</h3>
                </TextContainer>
                <Checkbox
                  label="Open"
                  checked={selectedStore.workingHours[day]?.isOpen || false}
                  onChange={(checked) => {
                    const updatedWorkingHours = {
                      ...selectedStore.workingHours,
                      [day]: {
                        ...selectedStore.workingHours[day],
                        isOpen: checked,
                      },
                    };
                    setSelectedStore({
                      ...selectedStore,
                      workingHours: updatedWorkingHours,
                    });
                  }}
                />
                {selectedStore.workingHours[day]?.isOpen && (
                  <>
                    <TextField
                      label="Start Time"
                      type="time"
                      value={selectedStore.workingHours[day]?.start || ""}
                      onChange={(value) => {
                        const updatedWorkingHours = {
                          ...selectedStore.workingHours,
                          [day]: {
                            ...selectedStore.workingHours[day],
                            start: value,
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
                      onChange={(value) => {
                        const updatedWorkingHours = {
                          ...selectedStore.workingHours,
                          [day]: {
                            ...selectedStore.workingHours[day],
                            end: value,
                          },
                        };
                        setSelectedStore({
                          ...selectedStore,
                          workingHours: updatedWorkingHours,
                        });
                      }}
                    />
                  </>
                )}
              </Stack>
            ))}
          </Modal.Section>
        </Modal>
      )}
    </div>
  );
};

export default AllStore;
