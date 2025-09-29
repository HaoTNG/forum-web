import { Request, Response } from "express";
import {Group} from "../models/groupModel";
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
        res.status(201).json({message:"group created successfully"});

    }catch(err: any){
        res.status(400).json({message: err.message});
    }
}


exports.joinGroup = async (req: Request, res: Response) =>{
    try{
        const group = await Group.findById(req.params.id);
        if(!group) return res.status(404).json({message: "group not found"});

        const userId = (req as any).user.id;
        if(group.members.includes(userId)){
            return res.status(400).json({message: "you already a member of this group"})

        }
        group.members.push(new mongoose.Types.ObjectId(userId));
        await group.save();

        res.status(200).json({message: "Joined group"});
    }catch(err: any){
        res.status(500).json({message: err.message});
    }
}

exports.leaveGroup = async (req: Request, res: Response) =>{
    try{
        const group = await Group.findById(req.params.id);
        if(!group) return res.status(404).json({message: "group not found"})
        const userId = (req as any).user.id;
    if(!group.members.includes(userId)){
        return res.status(400).json({message: "you are not a member of this group"});
    }
    if(group.owner.toString()===userId){
        return res.status(400).json({message: "owner cannot leave the group"});
    }

    group.members = group.members.filter(
        (m) => m.toString() !== userId.toString()
    );
    await group.save();
    res.status(200).json({message: "leave group successfully"})

    }catch(err: any){
        res.status(500).json({message: err.message});
    }
}

exports.getGroup = async (req: Request, res: Response) => {
    try{
        const group = await Group.findById(req.params.id)
            .populate("owner", "username")
            .populate("members", "username")
            .populate("posts");
        if(!group) return res.status(404).json({message: "group not found"})
        res.json(group);
    }catch(err: any){
        res.status(500).json({
            message: err.message
        })
    }
}

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