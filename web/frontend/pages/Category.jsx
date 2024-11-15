import React, { useState, useEffect } from 'react';
import {
  Card,
  DataTable,
  Button,
  TextField,
  Pagination,
  Stack,
  Icon,
  Scrollable,
  Modal
} from '@shopify/polaris';
import { SearchMinor, EditMinor, DeleteMinor, CirclePlusMinor } from '@shopify/polaris-icons';
import axios from 'axios';

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalActive, setModalActive] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({ name: '', description: '', published: false });
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);
  const [searchValue, setSearchValue] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5175/api/v1/category/getcategory');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleModalToggle = () => {
    setModalActive(!modalActive);
  };

  const handleFieldChange = (field) => (value) => {
    setCurrentCategory((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveCategory = async () => {
    try {
      if (editMode) {
        await axios.put(`http://localhost:5175/api/v1/category/updateCategory/${currentCategory._id}`, currentCategory);
      } else {
        await axios.post('http://localhost:5175/api/v1/category/createcategory', {
          ...currentCategory,
          published: false  // Set initial published status to false
        });
      }
      fetchCategories();
      setModalActive(false);
      setCurrentCategory({ name: '', description: '', published: false });
      setEditMode(false);
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEditCategory = (category) => {
    setCurrentCategory(category);
    setEditMode(true);
    setModalActive(true);
  };

  const handleDeleteCategory = async (id) => {
    try {
      await axios.delete(`http://localhost:5175/api/v1/category/deletecategory/${id}`);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleSearchChange = (value) => {
    setSearchValue(value);
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const paginatedCategories = filteredCategories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handlePublishToggle = async (category) => {
    try {
      await axios.put(`http://localhost:5175/api/v1/category/${category._id}/toggle-publish`);
      fetchCategories();
    } catch (error) {
      console.error('Error toggling publish status:', error);
    }
  };

  const rows = paginatedCategories.map((category) => [
    category.name,
    <Button
      onClick={() => handlePublishToggle(category)}
      primary={category.published}
      destructive={!category.published}
    >
      {category.published ? 'Unpublish' : 'Publish'}
    </Button>,
    <Stack spacing="tight">
      <Button plain icon={EditMinor} onClick={() => handleEditCategory(category)}>Edit</Button>
      <Button plain destructive icon={DeleteMinor} onClick={() => handleDeleteCategory(category._id)}>Delete</Button>
    </Stack>
  ]);

  return (
    <div style={{ width: '80%', margin: 'auto', marginTop: '20px' }}>
      <Stack distribution="equalSpacing" alignment="center" style={{ marginBottom: '10px' }}>
        <TextField
          label=""
          placeholder="Search Categories"
          value={searchValue}
          onChange={handleSearchChange}
          prefix={<Icon source={SearchMinor} />}
          autoComplete="off"
        />
        <Button primary icon={CirclePlusMinor} onClick={() => { setEditMode(false); setModalActive(true); }}>Add Category</Button>
      </Stack>

      <Card title="Categories List">
        <Scrollable shadow style={{ height: '400px' }}>
          <DataTable
            columnContentTypes={['text', 'text', 'text']}
            headings={['Name', 'Publish Status', 'Actions']}
            rows={rows}
            loading={loading}
          />
        </Scrollable>
        <Pagination
          hasPrevious={page > 0}
          onPrevious={() => setPage(page - 1)}
          hasNext={(page + 1) * rowsPerPage < filteredCategories.length}
          onNext={() => setPage(page + 1)}
        />
      </Card>

      <Modal
        open={modalActive}
        onClose={handleModalToggle}
        title={editMode ? "Edit Category" : "Add Category"}
        primaryAction={{
          content: editMode ? "Save Changes" : "Add Category",
          onAction: handleSaveCategory,
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: handleModalToggle,
          },
        ]}
      >
        <Modal.Section>
          <TextField
            label="Category Name"
            value={currentCategory.name}
            onChange={handleFieldChange('name')}
            autoComplete="off"
          />
          <TextField
            label="Category Description"
            value={currentCategory.description}
            onChange={handleFieldChange('description')}
            autoComplete="off"
            multiline={3}
          />
        </Modal.Section>
      </Modal>
    </div>
  );
};

export default Category;



// import React, { useState, useEffect } from 'react';
// import {
//   Card,
//   DataTable,
//   Button,
//   TextField,
//   Pagination,
//   Stack,
//   Icon,
//   Scrollable,
//   Modal
// } from '@shopify/polaris';
// import { SearchMinor, EditMinor, DeleteMinor, CirclePlusMinor } from '@shopify/polaris-icons';
// import axios from 'axios';

// const Category = () => {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [modalActive, setModalActive] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [currentCategory, setCurrentCategory] = useState({ name: '', description: '' });
//   const [page, setPage] = useState(0);
//   const [rowsPerPage] = useState(5);
//   const [searchValue, setSearchValue] = useState('');

//   const fetchCategories = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get('http://localhost:5175/api/v1/category/getcategory');
//       setCategories(response.data);
//     } catch (error) {
//       console.error('Error fetching categories:', error);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   const handleModalToggle = () => {
//     setModalActive(!modalActive);
//   };

//   const handleFieldChange = (field) => (value) => {
//     setCurrentCategory((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleSaveCategory = async () => {
//     try {
//       if (editMode) {
//         await axios.put(`http://localhost:5175/api/v1/category/updateCategory/${currentCategory._id}`, currentCategory);
//       } else {
//         await axios.post('http://localhost:5175/api/v1/category/createcategory', currentCategory);
//       }
//       fetchCategories();
//       setModalActive(false);
//       setCurrentCategory({ name: '', description: '' });
//       setEditMode(false);
//     } catch (error) {
//       console.error('Error saving category:', error);
//     }
//   };

//   const handleEditCategory = (category) => {
//     setCurrentCategory(category);
//     setEditMode(true);
//     setModalActive(true);
//   };

//   const handleDeleteCategory = async (id) => {
//     try {
//       await axios.delete(`http://localhost:5175/api/v1/category/deletecategory/${id}`);
//       fetchCategories();
//     } catch (error) {
//       console.error('Error deleting category:', error);
//     }
//   };

//   const handleSearchChange = (value) => {
//     setSearchValue(value);
//   };

//   const filteredCategories = categories.filter((category) =>
//     category.name.toLowerCase().includes(searchValue.toLowerCase())
//   );

//   const paginatedCategories = filteredCategories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

//   const handlePublishToggle = async (category) => {
//     try {
//       // Toggle the published status of the category
//       await axios.put(`http://localhost:5175/api/v1/category/updateCategory/${category._id}`, {
//         ...category,
//         published: !category.published
//       });
//       fetchCategories();
//     } catch (error) {
//       console.error('Error updating publish status:', error);
//     }
//   };

//   const rows = paginatedCategories.map((category) => [
//     category.name,
//     <Button
//       onClick={() => handlePublishToggle(category)}
//       primary={category.published}
//       destructive={!category.published}
//     >
//       {category.published ? 'Unpublish' : 'Publish'}
//     </Button>,
//     <Stack spacing="tight">
//       <Button plain icon={EditMinor} onClick={() => handleEditCategory(category)}>Edit</Button>
//       <Button plain destructive icon={DeleteMinor} onClick={() => handleDeleteCategory(category._id)}>Delete</Button>
//     </Stack>
//   ]);

//   return (
//     <div style={{ width: '80%', margin: 'auto', marginTop: '20px' }}>
//       <Stack distribution="equalSpacing" alignment="center" style={{ marginBottom: '10px' }}>
//         <TextField
//           label=""
//           placeholder="Search Categories"
//           value={searchValue}
//           onChange={handleSearchChange}
//           prefix={<Icon source={SearchMinor} />}
//           autoComplete="off"
//         />
//         <Button primary icon={CirclePlusMinor} onClick={() => { setEditMode(false); setModalActive(true); }}>Add Category</Button>
//       </Stack>

//       <Card title="Categories List">
//         <Scrollable shadow style={{ height: '400px' }}>
//           <DataTable
//             columnContentTypes={['text', 'text', 'text']}
//             headings={['Name', 'Publish Status', 'Actions']}
//             rows={rows}
//             loading={loading}
//           />
//         </Scrollable>
//         <Pagination
//           hasPrevious={page > 0}
//           onPrevious={() => setPage(page - 1)}
//           hasNext={(page + 1) * rowsPerPage < filteredCategories.length}
//           onNext={() => setPage(page + 1)}
//         />
//       </Card>

//       <Modal
//         open={modalActive}
//         onClose={handleModalToggle}
//         title={editMode ? "Edit Category" : "Add Category"}
//         primaryAction={{
//           content: editMode ? "Save Changes" : "Add Category",
//           onAction: handleSaveCategory,
//         }}
//         secondaryActions={[
//           {
//             content: 'Cancel',
//             onAction: handleModalToggle,
//           },
//         ]}
//       >
//         <Modal.Section>
//           <TextField
//             label="Category Name"
//             value={currentCategory.name}
//             onChange={handleFieldChange('name')}
//             autoComplete="off"
//           />
//           <TextField
//             label="Category Description"
//             value={currentCategory.description}
//             onChange={handleFieldChange('description')}
//             autoComplete="off"
//             multiline={3}
//           />
//         </Modal.Section>
//       </Modal>
//     </div>
//   );
// };

// export default Category;








