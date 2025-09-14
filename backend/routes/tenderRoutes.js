import express from "express";
import { fetchTenders, getTenderById } from "../controllers/tenderController.js";

const router = express.Router();

router.get("/", fetchTenders);
router.get("/:id", getTenderById);

export default router;
