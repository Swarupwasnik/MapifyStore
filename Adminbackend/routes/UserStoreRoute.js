import express from "express";
import { addStore, getUserStores } from "../controllers/userController.js";
import { authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();


router.post("/registerstore", addStore,authenticateUser);

router.get("/user-stores",authenticateUser,getUserStores)

export default router;
