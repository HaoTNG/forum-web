import type {Server} from "socket.io";
import type { AuthSocket } from "../middlewares/authSocket";
import Message, { IMessage } from "../models/Message";
import Conversation, { IConversation } from "../models/Conversation";


export default function chatHandler(io: Server, socket: AuthSocket) {
    socket.on("sendMessage" , async ({to, text}) =>{
        if(!socket.userId) return;

        let conversation = await Conversation.findOne({
            members: { $all: [socket.userId, to]},
        });

        if(!conversation){
            conversation = await Conversation.create({
                members: [socket.userId, to],
            });
        }

        const message = await Message.create({
            conversationId: conversation._id,
            senderId: socket.userId,
            text,
        });

        conversation.lastMessage = text;
        conversation.updatedAt = new Date();
        await conversation.save();

        io.to(to).emit("receiveMessage", message);
        io.to(socket.userId).emit("receiveMessage", message);
    });
}