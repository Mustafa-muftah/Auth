import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import UserController from "../controllers/userController";

const router = Router();

router.post("/signup",UserController.signUp)
router.post("/login", UserController.login);       
router.put("/update", authenticateToken, UserController.updateUser)
router.delete("/delete", authenticateToken, UserController.deleteUser);

export default router;