import express from "express";
import { createOrUpdateProfile, getMyProfile } from "../controllers/profileController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createOrUpdateProfile);
router.get("/me", authMiddleware, getMyProfile);

export default router;
