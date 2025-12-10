import express from "express";
import { register, login, employeeLogin } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { profile } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/employee/login", employeeLogin);

// GET /api/auth/profile - returns user info (requires Bearer token)
router.get("/profile", verifyToken, profile);

export default router;
