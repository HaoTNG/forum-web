import mongoose, {Schema, model, Types } from 'mongoose';

export interface IMessage extends Document {
    conversationId: Types.ObjectId;
    senderId: Types.ObjectId;
    text: string;
    createdAt: Date;
    readBy: Types.ObjectId;

}

const MessageSchema = new Schema<IMessage>({
    conversationId: {type: mongoose.Schema.ObjectId, ref: "Conversation", required: true},
    senderId: {type: mongoose.Schema.ObjectId, ref: "User", required: true},
    text: {type: String, required: true},
    readBy: [{type: mongoose.Schema.ObjectId, ref: "User"}],
}, {timestamps: true});

export default model<IMessage>('Message', MessageSchema);


