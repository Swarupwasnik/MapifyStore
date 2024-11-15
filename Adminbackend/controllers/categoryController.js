import Category from "../models/CategoryModel.js";

export const createCategory = async (req, res) => {
  try {
    const { name, description, published } = req.body;
    const category = new Category({ name, description, published });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.status(200).json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const togglePublish = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    category.published = !category.published;
    await category.save();

    res.status(200).json({
      message: `Category ${
        category.published ? "published" : "unpublished"
      } successfully`,
      category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
