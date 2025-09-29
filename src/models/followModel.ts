import mongoose, { Schema, Document } from "mongoose";



export interface IFollow extends Document {
  follower: mongoose.Types.ObjectId;
  following: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const followSchema = new Schema<IFollow>({
  follower: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  following: {type: Schema.Types.ObjectId, ref: 'User', required: true},
}, {timestamps: true});

export const Follow = mongoose.model<IFollow>("Follow", followSchema);