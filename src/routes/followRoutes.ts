import express from 'express';
const followController = require("../controllers/followController");
import { protect } from '../middlewares/authMiddleware';

const route = express.Router();

route.post("/:id/follow", protect, followController.followUser);
route.delete("/:id/unfollow", protect, followController.unfollowUser);
route.get("/:id/followers/count", followController.getFollowerCount);
route.get("/:id/following/count", followController.getFollowingCount);

export default route;