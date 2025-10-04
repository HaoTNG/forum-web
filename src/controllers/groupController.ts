import { Request, Response } from "express";
import {Group} from "../models/groupModel";
import User, {IUser} from "../models/userModel";
//import {Post} from "../models/postModel";
import mongoose from "mongoose";

exports.createGroup = async (req: Request, res: Response) => {
    try{
        const { name, description} = req.body;
        const userId = (req as any).user.id; //from protect middleware
        const group = new Group({
            name,
            description,
            owner: userId,
            members: [userId],
        });

        await group.save();
        res.status(201).json({
            message:"group created successfully",
            groupId: group._id,
    });

    }catch(err: any){
        res.status(400).json({message: err.message});
    }
}


export const joinGroup = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id; // middleware auth đã decode user id
    const { id: groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Check nếu đã là member
    if (group.members.includes(userId)) {
      return res.status(400).json({ message: "Already a member" });
    }

    group.members.push(userId);
    group.memberCount += 1;
    await group.save();

    return res.json({
      id: group._id,
      name: group.name,
      description: group.description,
      owner: group.owner,
      memberCount: group.memberCount,
      isMember: true,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Leave group
export const leaveGroup = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id: groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Nếu chưa join
    if (!group.members.includes(userId)) {
      return res.status(400).json({ message: "Not a member" });
    }

    group.members = group.members.filter(
      (memberId) => memberId.toString() !== userId.toString()
    );
    group.memberCount = Math.max(0, group.memberCount - 1);
    await group.save();

    return res.json({
      id: group._id,
      name: group.name,
      description: group.description,
      owner: group.owner,
      memberCount: group.memberCount,
      isMember: false,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getGroup = async (req: Request, res: Response) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate("owner", "username")
            .populate("members", "username")
            .populate("posts");

        if (!group) {
            return res.status(404).json({ message: "group not found" });
        }

        let isMember = false;
        let isOwner = false;

        // chỉ check nếu user đã đăng nhập
        if ((req as any).user?.id) {
            const userId = (req as any).user.id;
            isMember = group.members.some(
                (m: any) => m._id.toString() === userId
            );
            isOwner = group.owner._id.toString() === userId;
        }

        res.json({
            ...group.toObject(),
            isMember,
            isOwner
        });
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
};




exports.listGroup = async (req: Request, res: Response) =>{
    try{
        const groups = await Group.find().populate("owner", "username");
        res.status(200).json(groups);
    }catch(err: any){
        res.status(500).json({
            message: err.message
        })
    }
}

exports.checkMembership = async (req: Request, res: Response) =>{
    try{
        const userId = (req as any).user.id;
        const groupId = req.params.id;

        const group = await Group.findById(groupId).select("members");
        if(!group) return res.status(403).json({message: "group not found"});
        const isMember = group.members.some(
            (memberId) => memberId.toString() === userId
        );
        res.json({isMember});
    }catch(err: any){
        res.status(500).json({message: err.message});
    }
}


export const getGroupsByUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    if (!userId) return res.status(400).json({ message: "User id is required" });

    // select chỉ những field cần thiết trả FE
    const groups = await Group.find({ members: userId })
      .select("name description memberCount owner _id")
      .lean();

    return res.json(groups);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};