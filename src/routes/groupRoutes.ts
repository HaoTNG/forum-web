import {Router} from "express"
const groupController = require("../controllers/groupController");
import { protect } from "../middlewares/authMiddleware";

const route = Router()

route.post("/group/create", protect, groupController.createGroup );
route.post("/group/join/:id", protect, groupController.joinGroup);
route.post("/group/leave/:id", protect, groupController.leaveGroup);


route.get("/group/:id", groupController.getGroup);
route.get("/group/list", groupController.listGroup);

export default route;