import mongoose, { Schema, Document } from "mongoose";

export interface IGroup extends Document {
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  posts: mongoose.Types.ObjectId[];
  memberCount: number;   // 👈 thêm field này
  avatarUrl: string;
  bannerUrl: string;
  createdAt: Date;
  updatedAt: Date;
  
}

const groupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    memberCount: { type: Number, default: 1 }, // 👈 luôn >= 1
    avatarUrl: { type: String, default: "/default-group-avatar.png" },
    bannerUrl: { type: String, default: "/default-group-banner.png" },
  },
  { timestamps: true }
);

export const Group = mongoose.model<IGroup>("Group", groupSchema);
