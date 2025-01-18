import Category from "../models/CategoryModel.js";
import Store from "../models/StoreModel.js";
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if a category with the same name already exists
    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    // Create a new category with 'published' set to false by default
    const category = new Category({
      name: name.trim(),
      description: description.trim(),
      published: false, // Default unpublished status
    });

    await category.save();

    // Return the created category with its status
    res.status(201).json({
      message: "Category created successfully",
      category: {
        id: category._id,
        name: category.name,
        description: category.description,
        published: category.published ? "Published" : "Unpublished",
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const togglePublish = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Toggle the published status
    category.published = !category.published;
    await category.save();

    // Ensure associated stores' published status matches the category
    await Store.updateMany(
      { category: req.params.id },
      { published: category.published }
    );

    res.status(200).json({
      message: `Category ${
        category.published ? "published" : "unpublished"
      } successfully`,
      category,
    });
  } catch (error) {
    console.error("Error toggling published status:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, description, published } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, published, updatedAt: Date.now() },
      { new: true }
    );
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.status(200).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await Store.updateMany(
      { category: categoryId },
      { $unset: { category: "" } }
    );

    await Store.deleteMany({ category: { $exists: false } });

    res
      .status(200)
      .json({ message: "Category and associated stores updated successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Failed to delete category" });
  }
};

export const getPublishedCategories = async (req, res) => {
  try {
    const publishedCategories = await Category.find({ published: true });
    res.status(200).json(publishedCategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getUserCategories = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming req.user is populated with the current user's data

    // Find stores registered by the current user
    const userStores = await Store.find({ user: userId });

    // Extract the store IDs
    const userStoreIds = userStores.map(store => store._id);

    // Find categories associated with the user's stores
    const categories = await Category.find({ store: { $in: userStoreIds } });

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// export const togglePublish = async (req, res) => {
//   try {
//     const category = await Category.findById(req.params.id);
//     if (!category)
//       return res.status(404).json({ message: "Category not found" });

//     category.published = !category.published;
//     await category.save();

//     res.status(200).json({
//       message: `Category ${
//         category.published ? "published" : "unpublished"
//       } successfully`,
//       category,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
