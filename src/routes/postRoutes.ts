import express, { Request } from "express";
import { protect, restrictTo } from "../middlewares/authMiddleware";
import fs from "fs";
import path from "path";
import multer, { StorageEngine } from "multer";
const router = express.Router();
const postController = require("../controllers/postController");

// ================= Multer config =================
const uploadDir = "/var/www/uploads/posts";

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

const upload = multer({ storage });

// ================= Routes =================
router.get("/post", postController.getAllPost);
router.get("/post/:id", postController.getPostById);
router.get("/post/user/:id", postController.getPostByUser);
router.get("/posts", postController.getPosts);
router.get("/search", postController.searchPosts);
router.get("/stats", postController.getStats);
router.get("/posts/popular", postController.getPopularPosts);
router.get("/posts/latest", postController.getLatestPosts);

// Create post with up to 5 images
router.post(
  "/post",
  protect,
  upload.array("images", 5),
  postController.createPost
);

// Update post (can reupload images)
router.put(
  "/post/:id",
  protect,
  upload.array("images", 5),
  postController.updatePost
);

router.put("/post/:id/like", protect, postController.likePost);
router.put("/post/:id/dislike", protect, postController.dislikePost);

router.get("/posts/topic-stats", postController.getTopicStats);
router.get("/posts/topic/:topic", postController.getPostsByTopic);
router.get("/posts/fixed-topic", postController.getFixedTopicStats);

router.delete("/post/:id", protect, postController.deletePost);

// Moderator/admin can force delete
router.delete(
  "/mod/:id",
  protect,
  restrictTo("moderator", "admin"),
  postController.deletePostByMod
);

export default router;
