import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  IconButton,
  TextField,
  Button,
  TablePagination,
  InputAdornment,
  Checkbox,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState({
    name: "",
    description: "",
    published: false,
  });
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5175/api/v1/category/getcategory"
      );
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Save category (Add/Edit)
  const handleSaveCategory = async () => {
    try {
      if (editMode) {
        await axios.put(
          `http://localhost:5175/api/v1/category/updateCategory/${currentCategory._id}`,
          currentCategory
        );
        showSnackbar("Category updated successfully!");
      } else {
        await axios.post(
          "http://localhost:5175/api/v1/category/createcategory",
          currentCategory
        );
        showSnackbar("Category added successfully!");
      }
      fetchCategories();
      setModalOpen(false);
      setCurrentCategory({ name: "", description: "", published: false });
      setEditMode(false);
    } catch (error) {
      console.error("Error saving category:", error);
      showSnackbar("Failed to save category!", "error");
    }
  };

  // Delete category
  const handleDeleteCategory = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5175/api/v1/category/deletecategory/${id}`
      );
      showSnackbar("Category deleted successfully!");
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      showSnackbar("Failed to delete category!", "error");
    }
  };

  // Toggle publish status
  const handleTogglePublished = async (id, published) => {
    try {
      await axios.put(
        `http://localhost:5175/api/v1/category/updateCategory/${id}`,
        { published: !published }
      );
      showSnackbar("Category publish status updated successfully!");
      fetchCategories();
    } catch (error) {
      console.error("Error updating publish status:", error);
      showSnackbar("Failed to update publish status!", "error");
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const paginatedCategories = filteredCategories.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div style={{ width: "80%", margin: "auto", marginTop: "20px" }}>
      {/* <h1>Categories List</h1> */}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "15px",
        }}
      >
        <TextField
          style={{ marginRight: "10px" }}
          label="Search"
          variant="outlined"
          size="small"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => {
            setCurrentCategory({ name: "", description: "", published: false });
            setEditMode(false);
            setModalOpen(true);
          }}
        >
          Add Category
        </Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Select</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Published</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCategories.map((category) => (
              <TableRow key={category._id}>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell>
                  <Switch
                    checked={category.published}
                    onChange={() =>
                      handleTogglePublished(category._id, category.published)
                    }
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => {
                      setCurrentCategory(category);
                      setEditMode(true);
                      setModalOpen(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  Edit
                  <IconButton
                    color="secondary"
                    onClick={() => handleDeleteCategory(category._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                  Delete
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 15]}
          component="div"
          count={filteredCategories.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>{editMode ? "Edit Category" : "Add Category"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            value={currentCategory.name}
            onChange={(e) =>
              setCurrentCategory({ ...currentCategory, name: e.target.value })
            }
            margin="normal"
          />
          <TextField
            label="Description"
            fullWidth
            value={currentCategory.description}
            onChange={(e) =>
              setCurrentCategory({
                ...currentCategory,
                description: e.target.value,
              })
            }
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button
            color="primary"
            variant="contained"
            onClick={handleSaveCategory}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Category;
