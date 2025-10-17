import {Server } from "socket.io";
import { socketAuth, AuthSocket } from "../middlewares/authSocket";

const { chatHandler } = require("./chatHandler");

export function setupSocket(httpServer: any) {
    const io = new Server(httpServer, {cors: {origin: "*"}});

    io.use(socketAuth);

    io.on("connection", (socket: AuthSocket) => {
        console.log(`User connecected: ${socket.userId}`);
        socket.join(socket.userId!);


        chatHandler(io, socket);

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.userId}`);
        });
    });

    return io;
}
