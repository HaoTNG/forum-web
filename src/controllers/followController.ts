import {Request, Response} from 'express';
import User from '../models/userModel';
import {Follow} from '../models/followModel';


exports.getFollowerCount = async (req: Request, res: Response) =>{
    try{
        const {id} = req.params;
        const followerCount = await Follow.countDocuments({following: id});
        res.status(200).json({ followersCount: followerCount });
    }catch(err: any){
        res.status(500).json({
            error: err,
            message: "server error"});
    }
}

exports.getFollowingCount = async (req: Request, res: Response) =>{
    try{
        const {id} = req.params;
        const followingCount = await Follow.countDocuments({follower: id});
        res.status(200).json({ followingCount: followingCount });
    }catch(err:any){
        res.status(500).json({
            error: err,
            message: "server error"});
    }
}
exports.followUser = async (req: Request, res: Response) => {
    try{
        const  followerId = (req as any).user.id;
        const  followingId = req.params.id;

        if(followerId === followingId){
            return res.status(400).json({message: "cannot follow yourself"});
        }
        const targetUser = await User.findById(followingId);
        if(!targetUser){
            return res.status(404).json({message: "user not exist"})
        }

        const existingFollow = await Follow.findOne({follower: followerId, following: followingId});
        if(existingFollow){
            return res.status(400).json({message: "you already follow this user"})
        }

        const follow = await Follow.create({follower: followerId, following: followingId})
        res.status(201).json({
            status: "success",
            message: "following successfully"
        })
    }catch(err: any){
        res.status(500).json({
            status:"error",
            error: err,
            message: "following failed"
        })
    }
}


exports.unfollowUser = async (req: Request, res: Response) => {
    try{
        const followerId = (req as any).user.id;
        const followingId = req.params.id;

        const deleted = await Follow.findOneAndDelete({follower: followerId, following: followingId});
        if(!deleted){
            return res.status(404).json({message: "not followed yet"})
        }

        res.status(200).json({
            status: "success",
            message: "unfollowing successfully"
        })
    }catch(err: any){
        res.status(500).json({
            status:"error",
            error: err,
            message: "unfollowing failed"
        })
    }
}

exports.checkFollowStatus = async (req: Request, res: Response) => {
  try {
    const followerId = (req as any).user.id;
    const followingId = req.params.id;
    if (!followerId) return res.status(401).json({ message: "Unauthorized" });

    const exists = await Follow.findOne({ follower: followerId, following: followingId });
    res.json({ isFollowing: !!exists });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};