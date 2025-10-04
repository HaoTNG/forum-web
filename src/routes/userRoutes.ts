import express, { Request } from "express";
import { protect, restrictTo } from "../middlewares/authMiddleware";
import fs from "fs";
import path from "path";
import multer, { StorageEngine } from "multer";
const router = express.Router();
const userController = require("../controllers/userController");

// ================= Multer config =================
const avatarDir = "/apps/uploads/avatars";
const bannerDir = "/apps/uploads/banners";

// Tạo folder nếu chưa tồn tại
[avatarDir, bannerDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Cấu hình Multer
const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    const isBanner = file.fieldname === "banner";
    cb(null, isBanner ? bannerDir : avatarDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({ storage });

// ================= Routes =================
router
  .route("/user/me")
  .get(protect, userController.getMe)
  .put(protect, userController.updateMe)
  .delete(protect, userController.deleteMe);

router.route("/user/top-contributors").get(userController.contributors);
router.route("/user/:id").get(userController.getUser);
router.route("/user/check-username").get(userController.checkUsername);

router
  .route("/mod/user")
  .get(protect, restrictTo("moderator", "admin"), userController.getAllUsers);

router
  .route("/mod/user/:id")
  .delete(protect, restrictTo("admin"), userController.deleteUser);

router
  .route("/admin/:id/role")
  .patch(protect, restrictTo("admin"), userController.updateUserRole);

// Upload avatar
router.post(
  "/user/avatar/:id",
  protect, 
  upload.single("avatar"),
  userController.uploadAvatar
);
//Upload banner
router.post(
  "/user/banner/:id",
  protect,
  upload.single("banner"),
  userController.uploadBanner
);

export default router;
