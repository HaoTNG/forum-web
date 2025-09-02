import mongoose from 'mongoose';
import Post, { IPost, topics } from '../models/postModel';
import Comment from '../models/commentModel';
import { Request, Response } from "express";
import User, { IUser} from '../models/userModel';


exports.getAllPost = async (req: Request, res: Response) => {
    try {
        const posts: IPost[] = await Post.find()
            .populate("author", "_id username avatarUrl")
            .sort({ createdAt: -1 })
            .limit(10); 
        res.status(200).json(posts);
    } catch (error: any) {
        res.status(400).json({ message: 'Cannot get posts', error: error.message });
    }
};
exports.getLatestPosts = async (req: Request, res: Response) => {
    try {
        const posts = await Post.find()
            .populate("author", "_id username avatarUrl")
            .sort({ createdAt: -1 })
            .limit(10)
            .select("_id title content createdAt author comments likes"); 

        const formatted = posts.map(post => ({
            _id: post._id,
            title: post.title,
            content: post.content.substring(0, 100), 
            author: post.author,
            createdAt: post.createdAt,    
            commentsCount: post.comments.length,
            likesCount: post.likes.length
        }));

        res.status(200).json(formatted);
    } catch (error: any) {
        res.status(400).json({ message: "Cannot get latest posts", error: error.message });
    }
};


exports.getPostById = async (req: Request, res: Response) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("author", "_id username avatarUrl")
            .populate({
                path: "comments",
                populate: { path: "author", select: "_id username avatarUrl" },
                options: { limit: 20, sort: { createdAt: -1 } } 
            });

        if (!post) return res.status(404).json({ message: "Post not found" });

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: "server error" });
    }
};


export const getPostByUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    const posts = await Post.find({ author: userId })
      .populate("author", "username avatarUrl") 
      .sort({ createdAt: -1 }); 

    return res.status(200).json(posts);
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "Failed to fetch posts by user", error: error.message });
  }
};

export const createPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id; 
    const { title, content, topic } = req.body;

    let images: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      images = (req.files as Express.Multer.File[]).map(
        (file) => `${req.protocol}://${req.get("host")}/uploads/posts/${file.filename}`
      );
    }

    const post = new Post({
      title,
      content,
      topic,
      images,
      author: userId,
    });

    await post.save();

    await User.findByIdAndUpdate(userId, {
      $push: { posts: post._id },
    });

    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create post" });
  }
};



export const updatePost = async (req: Request, res: Response) => {
  try {
    const { title, content, topic } = req.body;

    let images: string[] = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      images = (req.files as Express.Multer.File[]).map(
        (file) => `${req.protocol}://${req.get("host")}/uploads/posts/${file.filename}`
      );
    }

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        topic,
        ...(images.length > 0 && { images }), // chỉ cập nhật nếu có file
      },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update post failed" });
  }
};


exports.deletePost = async (req: Request, res: Response) => {
    try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);

    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    await User.findByIdAndUpdate(deletedPost.author, {
      $pull: { posts: deletedPost._id },
    });

    const comments = await Comment.find({ post: deletedPost._id });
    await Comment.deleteMany({ post: deletedPost._id });

    const updateUserPromises = comments.map((comment) =>
      User.findByIdAndUpdate(comment.author, {
        $pull: { comments: comment._id },
      })
    );
    await Promise.all(updateUserPromises);

    res.status(200).json({
      success: true,
      message: "Post and related comments deleted",
      data: deletedPost,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to delete post",
      error: error.message,
    });
  }
};


exports.likePost = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { id } = req.params;
        const post = await Post.findById(id) as IPost;
        if (!post) return res.status(404).json({ message: "Post not found" });

        post.dislikes = post.dislikes.filter(d => d.toString() !== userId.toString());

        if (post.likes.some(l => l.toString() === userId.toString())) {
            post.likes = post.likes.filter(l => l.toString() !== userId.toString());
        } else {
            post.likes.push(new mongoose.Types.ObjectId(userId));
        }
        await post.save();

        res.status(200).json({
            message: "like successfully",
            postId: post._id,
            likes: post.likes.length,
            dislikes: post.dislikes.length
        });
    } catch (error: any) {
        res.status(500).json({ message: "error", error: error.message });
    }
};


exports.dislikePost = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const { id } = req.params;
        const post = await Post.findById(id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        post.likes = post.likes.filter(l => l.toString() !== userId.toString());

        if (post.dislikes.some(d => d.toString() === userId.toString())) {
            post.dislikes = post.dislikes.filter(d => d.toString() !== userId.toString());
        } else {
            post.dislikes.push(new mongoose.Types.ObjectId(userId));
        }
        await post.save();

        res.status(200).json({
            message: "dislike successfully",
            postId: post._id,
            likes: post.likes.length,
            dislikes: post.dislikes.length
        });
    } catch (error: any) {
        res.status(500).json({ message: "error", error: error.message });
    }
};


exports.getPosts = async (req: Request, res: Response) => {
    try {
        const {
            keyword,
            author,
            minLikes,
            topic,
            page = "1",
            limit = "10",
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        const filter: any = {};

        if (keyword) {
            filter.$or = [
                { title: { $regex: keyword, $options: "i" } },
                { content: { $regex: keyword, $options: "i" } },
            ];
        }

        if (author) filter.author = author;
        if (topic) filter.topic = topic;
        if (minLikes) filter.likes = { $exists: true, $not: { $size: 0 } };

        const pageNum = parseInt(page as string) || 1;
        const limitNum = parseInt(limit as string) || 10;
        const skip = (pageNum - 1) * limitNum;

        const sortOptions: any = {};
        sortOptions[sortBy as string] = sortOrder === "asc" ? 1 : -1;

        const posts = await Post.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum)
            .populate("author", "username")
            .populate("likes", "_id")
            .populate("dislikes", "_id");

        const total = await Post.countDocuments(filter);

        res.json({
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
            totalPosts: total,
            posts,
        });
    } catch (error: any) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.searchPosts = async (req: Request, res: Response) => {
  try {
    const keyword = (req.query.q as string)?.trim();
    if (!keyword) {
      return res.status(400).json({ message: "Missing search keyword" });
    }
    const result = await Post.find(
      { $text: { $search: keyword } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" }, createdAt: -1 })
      .populate("author", "_id username");

    return res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to search posts",
      error: error.message
    });
  }
};


exports.deletePostByMod = async (req: Request, res: Response) => {
    try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    await post.deleteOne();

    await User.findByIdAndUpdate(post.author, {
      $pull: { posts: post._id },
    });
    const comments = await Comment.find({ post: post._id });
    await Comment.deleteMany({ post: post._id });

    const updateUserPromises = comments.map((comment) =>
      User.findByIdAndUpdate(comment.author, {
        $pull: { comments: comment._id },
      })
    );
    await Promise.all(updateUserPromises);

    return res.status(200).json({ message: "Post and related comments deleted by admin" });
  } catch (error: any) {
    return res.status(500).json({ message: "Failed to delete post", error: error.message });
  }
};


exports.getStats = async (req: Request, res: Response) => {
  try {
    const threadsCount = await Post.countDocuments();
    const messagesCount = await Comment.countDocuments();
    const membersCount = await User.countDocuments();

    res.json({
      threads: threadsCount,
      messages: messagesCount,
      members: membersCount,
    });
  } catch (err: any) {
    res.status(500).json({ message: "Failed to fetch stats", error: err.message });
  }
};




exports.getPopularPosts = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10; 
    const page = parseInt(req.query.page as string) || 1;     
    const skip = (page - 1) * limit;

    const total = await Post.countDocuments({});
    const posts = await Post.find({})
      .sort({ likes: -1, createdAt: -1 })  
      .skip(skip)
      .limit(limit)
      .select("_id title content image likes createdAt author")
      .populate("author", "_id username avatarUrl");

    res.json({
      posts,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch popular posts", error: error.message });
  }
};



export const getTopicStats = async (req: Request, res: Response) => {
  try {
    // 1. Đếm threads
    const threadStats = await Post.aggregate([
      { $group: { _id: "$topic", threads: { $sum: 1 } } },
      { $sort: { threads: -1 } },
      { $limit: 12 }
    ]);

    // 2. Đếm messages theo topic
    const messageStats = await Comment.aggregate([
      {
        $lookup: {
          from: "posts",
          localField: "post",
          foreignField: "_id",
          as: "post"
        }
      },
      { $unwind: "$post" },
      { $group: { _id: "$post.topic", messages: { $sum: 1 } } }
    ]);

    // 3. Lấy post mới nhất cho từng topic
    const latestPosts = await Post.aggregate([
      { $sort: { createdAt: -1 } }, // sort trước để đảm bảo $first = mới nhất
      {
        $group: {
          _id: "$topic",
          latestPost: { $first: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "latestPost.author",
          foreignField: "_id",
          as: "author"
        }
      },
      { $unwind: "$author" },
      {
        $project: {
          _id: 1,
          "latestPost._id": 1,
          "latestPost.title": 1,
          "latestPost.createdAt": 1,
          "author.username": 1,
          "author.avatarUrl": 1,
          "author._id": 1
        }
      }
    ]);

    // 4. Merge tất cả
    const merged = threadStats.map(stat => {
      const comments = messageStats.find(c => c._id === stat._id)?.messages || 0;
      const latest = latestPosts.find(lp => lp._id === stat._id);

      return {
        topic: stat._id,
        threads: stat.threads,
        messages: comments,
        latestPost: latest
          ? {
              id: latest.latestPost._id,
              title: latest.latestPost.title,
              createdAt: latest.latestPost.createdAt,
              author: {
                username: latest.author.username,
                avatarUrl: latest.author.avatarUrl,
                id: latest.author._id
              }
            }
          : null
      };
    });

    res.json(merged);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Failed to fetch topic stats", error: err.message });
  }
};



export const getPostsByTopic = async (req: Request, res: Response) => {
  try {
    const { topic } = req.params;
    const posts = await Post.find({ topic })
      .sort({ createdAt: -1 }) 
      .limit(20); 
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Error fetching posts", error: err });
  }
};


const FIXED_TOPICS = ["Announcement", "Discussion", "News", "Knowledge"];

export const getFixedTopicStats = async (req: Request, res: Response) => {
  try {
    
    const threadStats = await Post.aggregate([
      { $match: { topic: { $in: FIXED_TOPICS } } },
      { $group: { _id: "$topic", threads: { $sum: 1 } } }
    ]);

    
    const messageStats = await Comment.aggregate([
      {
        $lookup: {
          from: "posts",
          localField: "post",
          foreignField: "_id",
          as: "post"
        }
      },
      { $unwind: "$post" },
      { $match: { "post.topic": { $in: FIXED_TOPICS } } },
      { $group: { _id: "$post.topic", messages: { $sum: 1 } } }
    ]);

    
    const merged = FIXED_TOPICS.map(topic => {
      const thread = threadStats.find(t => t._id === topic)?.threads || 0;
      const message = messageStats.find(m => m._id === topic)?.messages || 0;
      return { topic, threads: thread, messages: message };
    });

    res.json(merged);
  } catch (err: any) {
    res.status(500).json({ message: "Failed to fetch fixed topic stats", error: err.message });
  }
};