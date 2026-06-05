import { Router } from "express";
import { login, register, forgotPassword, resetPassword, getUsers, updateUserRole, deleteUser, getStats, logVisit, updateProfile, changePassword, requestRoleChange, getPendingUsers, approveUser, rejectUser } from "../controllers/authController";
import { authMiddleware, requireAdmin } from "../middlewares/authMiddleware";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/access", logVisit);
router.patch("/profile", authMiddleware, updateProfile);
router.patch("/change-password", authMiddleware, changePassword);
router.post("/request-role", authMiddleware, requestRoleChange);
router.get("/stats", authMiddleware, requireAdmin, getStats);
router.get("/users", authMiddleware, requireAdmin, getUsers);
router.patch("/users/:id/role", authMiddleware, requireAdmin, updateUserRole);
router.delete("/users/:id", authMiddleware, requireAdmin, deleteUser);
router.get("/pending", authMiddleware, requireAdmin, getPendingUsers);
router.patch("/users/:id/approve", authMiddleware, requireAdmin, approveUser);
router.patch("/users/:id/reject", authMiddleware, requireAdmin, rejectUser);

export default router;