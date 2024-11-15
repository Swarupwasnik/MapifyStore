import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  togglePublish,
  getPublishedCategories,
} from "../controllers/categoryController.js";
import { authenticateAdmin } from "../middleware/authMiddleware.js";
import express from "express"; 

const router = express.Router();
router.post("/createcategory", createCategory);
router.get("/getcategory", getCategories);
router.get("/getcategory/:id", getCategoryById);
router.put("/updatecategory/:id", updateCategory);
router.delete("/deletecategory/:id", deleteCategory);
router.put("/:id/toggle-publish", togglePublish);
router.get("/publishcategory", getPublishedCategories);

export default router;
