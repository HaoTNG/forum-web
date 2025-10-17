import User, {IUser} from "../models/userModel";
import Post from "../models/postModel";
import Comment from "../models/commentModel";
import { Request, Response } from "express";
import { readdirSync } from "fs";
import { Multer } from "multer"; 
import fs from "fs";
import path from "path";
exports.getMe = async (req: Request, res: Response) =>{
    try{
        const user = await User.findById((req as Request &{user? : IUser}).user?._id).select("-password");
        res.status(200).json(user);
    } catch(error: any){
        res.status(400).json({
            message: "failed to get user",
            error: error.message
        });
    }
};

exports.getUser = async (req: Request, res: Response) => {
  
  try{
    const user = await User.findById(req.params.id);
    if(!user){
      return res.status(400).json({message: "cannot found user"})
    }
    res.status(200).json(user);
  }catch(error: any){
    res.status(400).json({
      message: "failed to fetch user",
      error: error.message
    })
  }
}

exports.updateMe = async (req: Request, res: Response) => {
    const update = req.body;

    delete update.role;
    

    try{
        const updateUser = await User.findByIdAndUpdate((req as Request &{user? : IUser}).user?._id,
                update,
                {new: true, runValidators: true}).select("-password");
        res.status(200).json(updateUser);
    }catch(error: any){
        res.status(400).json({
            message:"Cannot update the profile",
            error: error.message
        });
    }
};

exports.deleteMe = async (req: Request,  res: Response) => {
    try{
        await User.findByIdAndDelete((req as Request &{user? : IUser}).user?._id);
        res.status(200).json({message:"your account has been deleted successfully"});
    } catch(error: any){
        res.status(400).json({
            message:"failed to delete your account",
            error: error.message
        });
    }
};


//moderator api

exports.getAllUsers = async (req: Request, res: Response) => {
    try{
        const users = await User.find().select("-password");
        res.status(200).json(users);
    }catch(error: any){
        res.status(400).json({
            message: "Cannot find all the users",
            error: error.message
        });
    }
};

exports.deleteUser = async (req: Request, res: Response) => {
    try{
        const user = await User.findById(req.params.id);
        if(!user){
            return res.status(400).json({message: "cannot found user"})
        }

        await user.deleteOne();
        res.status(200).json({message:"delete user successfully"});
    }catch(error: any){
        res.status(400).json({
            message:"failed to delete user",
            error: error.message
        });
    }
};


//moderator api

exports.updateUserRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    if (!['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "Role updated", user: updatedUser });
  } catch (err: any) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.contributors = async (req: Request, res: Response) =>{
    try {
    const users = await User.find({}).select("_id username posts comments");

    const contributions = users.map((user) => {
      const postCount = user.posts?.length || 0;
      const commentCount = user.comments?.length || 0;
      const score = postCount * 3 + commentCount * 1;

      return {
        _id: user._id,
        username: user.username,
        postCount,
        commentCount,
        score,
      };
    });

    const top10 = contributions.sort((a, b) => b.score - a.score).slice(0, 10);
    res.status(200).json(top10);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to get top contributors",
      error: error.message,
    });
  }
}

exports.checkUsername = async (req: Request, res: Response) => {
  try {
    const { username } = req.query;
    if (!username || typeof username !== "string") {
      return res.status(200).json({ available: false, message: "Username is required" });
    }

    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(200).json({ available: false, message: "Username already taken" });
    } else {
      return res.status(200).json({ available: true, message: "Username is available" });
    }
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ available: false, message: "Server Error" });
  }
};

function deleteOldFile(filePath: string) {
  try {
    if (!filePath) return;

    // loại bỏ prefix "/" nếu có
    const relativePath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
    const absolutePath = path.join("/apps", relativePath);

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      console.log(" Deleted old file:", absolutePath);
    }
  } catch (err: any) {
    console.warn(" Cannot delete old file:", err.message);
  }
}
export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const file = req.file as Express.Multer.File;

    if (!file) return res.status(400).json({ message: "No avatar file uploaded" });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🔥 Xóa avatar cũ nếu có (trừ file default)
    if (user.avatarUrl && !user.avatarUrl.includes("default-user-avatar.png")) {
      deleteOldFile(user.avatarUrl);
    }

    const avatarUrl = `/uploads/avatars/${file.filename}`;
    user.avatarUrl = avatarUrl;
    await user.save();

    res.json(user);
  } catch (err) {
    console.error("❌ Upload avatar failed:", err);
    res.status(500).json({ message: "Upload avatar failed" });
  }
};



export const uploadBanner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const file = req.file as Express.Multer.File;

    if (!file) return res.status(400).json({ message: "No banner file uploaded" });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🔥 Xóa banner cũ nếu có (trừ file default)
    if (user.bannerUrl && !user.bannerUrl.includes("default-user-banner.png")) {
      deleteOldFile(user.bannerUrl);
    }

    const bannerUrl = `/uploads/banners/${file.filename}`;
    user.bannerUrl = bannerUrl;
    await user.save();

    res.json(user);
  } catch (err) {
    console.error("❌ Upload banner failed:", err);
    res.status(500).json({ message: "Upload banner failed" });
  }
};