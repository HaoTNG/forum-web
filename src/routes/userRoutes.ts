import express, { Request } from "express";
import { protect, restrictTo } from "../middlewares/authMiddleware";
import fs from "fs";
import path from "path";
import multer, { StorageEngine } from "multer";
const router = express.Router();
const userController = require("../controllers/userController");

// ================= Multer config =================
const uploadDir = "/apps/uploads/avatars";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage: StorageEngine = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, uploadDir);
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});


// Upload banner
const bannerUploadDir = "/apps/uploads/banners";

if (!fs.existsSync(bannerUploadDir)) {
  fs.mkdirSync(bannerUploadDir, { recursive: true });
}

const bannerStorage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, bannerUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const uploadBanner = multer({ storage: bannerStorage });






const upload = multer({ storage });

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
  uploadBanner.single("banner"),
  userController.uploadBanner
);

export default router;
