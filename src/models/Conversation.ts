import {Schema, model, Types} from 'mongoose';

export interface IConversation {
    members: Types.ObjectId[];
    lastMessage: string;
    updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>({
    members: [{type: Schema.Types.ObjectId, ref: "User", required: true}],
    lastMessage: {type: String, default: ""},
}, {timestamps: true});

export default model<IConversation>('Conversation', conversationSchema);
