import {Router} from "express"
const groupController = require("../controllers/groupController");
import { protect, optionalAuth } from "../middlewares/authMiddleware";

const route = Router()

route.post("/group/create", protect, groupController.createGroup );
route.post("/group/join/:id", protect, groupController.joinGroup);
route.post("/group/leave/:id", protect, groupController.leaveGroup);

route.get("/group/user/:id", groupController.getGroupsByUserId)
route.get("/group/:id", optionalAuth ,groupController.getGroup);
route.get("/group/list", groupController.listGroup);
route.get("/group/:id/membership", protect, groupController.checkMembership);
export default route;