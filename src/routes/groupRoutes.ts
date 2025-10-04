import {Router} from "express";
import multer, { StorageEngine } from "multer";
import fs from "fs";
import path from "path";
const groupController = require("../controllers/groupController");
import { protect, optionalAuth } from "../middlewares/authMiddleware";
const avatarDir = "/apps/uploads/groups/avatars";
const bannerDir = "/apps/uploads/groups/banners";

[avatarDir, bannerDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

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

const upload = multer({ storage });

const route = Router()
route.post(
  "/group/banner/:id",
  protect,  
  upload.single("banner"),
  groupController.uploadBanner
);

route.post(
  "/group/avatar/:id",
  protect,
  upload.single("avatar"),
  groupController.uploadAvatar
);

route.post("/group/create", protect, groupController.createGroup );
route.post("/group/join/:id", protect, groupController.joinGroup);
route.post("/group/leave/:id", protect, groupController.leaveGroup);

route.get("/group/user/:id", groupController.getGroupsByUserId)
route.get("/group/:id", optionalAuth ,groupController.getGroup);
route.get("/group/list", groupController.listGroup);
route.get("/group/:id/membership", protect, groupController.checkMembership);
export default route;